from dataclasses import dataclass

from app.utils.label_mapping import COMMON_EMOTIONS


@dataclass
class FusionResult:
    final_emotion: str
    final_confidence: float
    fused_probabilities: dict[str, float]
    effective_weights: dict[str, float]


def fuse_modalities(
    face_probs: dict[str, float] | None,
    voice_probs: dict[str, float] | None,
    text_probs: dict[str, float] | None,
    weights: dict[str, float],
) -> FusionResult:
    available = {
        "face": face_probs,
        "voice": voice_probs,
        "text": text_probs,
    }

    active_weights = {
        modality: weights[modality]
        for modality, probs in available.items()
        if probs is not None
    }

    total_weight = sum(active_weights.values())
    if total_weight <= 0:
        active_weights = {key: 1 / len(active_weights) for key in active_weights} if active_weights else {}
    else:
        active_weights = {key: value / total_weight for key, value in active_weights.items()}

    fused = {emotion: 0.0 for emotion in COMMON_EMOTIONS}
    for modality, probs in available.items():
        if probs is None:
            continue
        for emotion in COMMON_EMOTIONS:
            fused[emotion] += active_weights[modality] * probs.get(emotion, 0.0)

    final_emotion = max(fused, key=fused.get)
    return FusionResult(
        final_emotion=final_emotion,
        final_confidence=fused[final_emotion],
        fused_probabilities=fused,
        effective_weights=active_weights,
    )
