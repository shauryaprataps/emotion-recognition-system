from dataclasses import dataclass
from pathlib import Path

from speechbrain.inference.interfaces import foreign_class

from app.utils.config import get_settings
from app.utils.label_mapping import to_probability_vector
from app.utils.preprocess_audio import cleanup_temp_file, ensure_mono_16k, write_temp_audio


@dataclass
class VoiceServiceResult:
    emotion: str
    probabilities: dict[str, float]
    confidence: float


class VoiceEmotionService:
    def __init__(self) -> None:
        settings = get_settings()
        source = self._resolve_local_source(settings.sb_voice_model)
        self.classifier = foreign_class(
            source=source,
            pymodule_file="custom_interface.py",
            classname="CustomEncoderWav2vec2Classifier",
        )

    def analyze(self, file_bytes: bytes, filename: str = "audio.wav") -> VoiceServiceResult:
        original_path = write_temp_audio(file_bytes, suffix=self._suffix_from_name(filename))
        processed_path = None

        try:
            processed_path = ensure_mono_16k(original_path)
            out_prob, _, _, _ = self.classifier.classify_file(processed_path)
            label_map = getattr(self.classifier.hparams.label_encoder, "ind2lab", {})
            raw_probabilities = {
                str(label_map.get(index, index)): float(score)
                for index, score in enumerate(out_prob.squeeze().tolist())
            }

            probabilities = to_probability_vector(raw_probabilities)
            emotion = max(probabilities, key=probabilities.get)
            return VoiceServiceResult(
                emotion=emotion,
                probabilities=probabilities,
                confidence=probabilities[emotion],
            )
        finally:
            cleanup_temp_file(original_path)
            cleanup_temp_file(processed_path)

    @staticmethod
    def _suffix_from_name(filename: str) -> str:
        if "." in filename:
            return "." + filename.rsplit(".", 1)[-1]
        return ".wav"

    @staticmethod
    def _resolve_local_source(model_id: str) -> str:
        if Path(model_id).exists():
            return model_id

        cache_root = Path.home() / ".cache" / "huggingface" / "hub"
        cache_dir = cache_root / f"models--{model_id.replace('/', '--')}"
        refs_main = cache_dir / "refs" / "main"

        if refs_main.exists():
            snapshot_name = refs_main.read_text(encoding="utf-8").strip()
            snapshot_path = cache_dir / "snapshots" / snapshot_name
            if snapshot_path.exists():
                return str(snapshot_path)

        return model_id
