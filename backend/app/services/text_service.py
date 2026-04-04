from dataclasses import dataclass
from pathlib import Path

from transformers import pipeline

from app.utils.config import get_settings
from app.utils.label_mapping import to_probability_vector


@dataclass
class TextServiceResult:
    emotion: str
    probabilities: dict[str, float]
    confidence: float


class TextEmotionService:
    def __init__(self) -> None:
        settings = get_settings()
        model_source = self._resolve_local_model(settings.hf_text_model)
        self.classifier = pipeline(
            task="text-classification",
            model=model_source,
            top_k=None,
        )

    def analyze(self, text: str) -> TextServiceResult:
        predictions = self.classifier(text, truncation=True)[0]
        probabilities = to_probability_vector({item["label"]: item["score"] for item in predictions})
        emotion = max(probabilities, key=probabilities.get)
        return TextServiceResult(
            emotion=emotion,
            probabilities=probabilities,
            confidence=probabilities[emotion],
        )

    @staticmethod
    def _resolve_local_model(model_id: str) -> str:
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
