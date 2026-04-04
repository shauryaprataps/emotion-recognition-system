COMMON_EMOTIONS = [
    "angry",
    "disgust",
    "fear",
    "happy",
    "sad",
    "surprise",
    "neutral",
]


LABEL_MAPPING = {
    "angry": "angry",
    "anger": "angry",
    "disgust": "disgust",
    "fear": "fear",
    "fearful": "fear",
    "happy": "happy",
    "happiness": "happy",
    "joy": "happy",
    "sad": "sad",
    "sadness": "sad",
    "surprise": "surprise",
    "surprised": "surprise",
    "neutral": "neutral",
    "calm": "neutral",
    "other": "neutral",
}


def normalize_label(label: str) -> str:
    return LABEL_MAPPING.get(label.lower().strip(), "neutral")


def to_probability_vector(scores: dict[str, float]) -> dict[str, float]:
    normalized = {emotion: 0.0 for emotion in COMMON_EMOTIONS}

    for raw_label, raw_score in scores.items():
        mapped_label = normalize_label(raw_label)
        normalized[mapped_label] += float(raw_score)

    total = sum(normalized.values())
    if total <= 0:
        fallback = 1.0 / len(COMMON_EMOTIONS)
        return {emotion: fallback for emotion in COMMON_EMOTIONS}

    return {emotion: value / total for emotion, value in normalized.items()}
