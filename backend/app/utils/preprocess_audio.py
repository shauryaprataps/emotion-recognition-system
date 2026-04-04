from pathlib import Path
import tempfile

import librosa
import numpy as np
import soundfile as sf
import torchaudio


def write_temp_audio(file_bytes: bytes, suffix: str = ".wav") -> str:
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
        tmp_file.write(file_bytes)
        return str(Path(tmp_file.name).resolve().as_posix())


def ensure_mono_16k(audio_path: str) -> str:
    waveform = None

    try:
        waveform_tensor, sample_rate = torchaudio.load(audio_path)
        if waveform_tensor.ndim == 2 and waveform_tensor.size(0) > 1:
            waveform_tensor = waveform_tensor.mean(dim=0, keepdim=True)
        if sample_rate != 16000:
            waveform_tensor = torchaudio.functional.resample(waveform_tensor, sample_rate, 16000)
        waveform = waveform_tensor.squeeze(0).detach().cpu().numpy().astype(np.float32)
    except Exception:
        waveform, _ = librosa.load(audio_path, sr=16000, mono=True)
        waveform = waveform.astype(np.float32)

    if waveform is None or waveform.size == 0:
        raise ValueError("Audio preprocessing failed for the provided file.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
        sf.write(tmp_file.name, waveform, 16000)
        return str(Path(tmp_file.name).resolve().as_posix())


def cleanup_temp_file(path: str | None) -> None:
    if path and Path(path).exists():
        Path(path).unlink(missing_ok=True)
