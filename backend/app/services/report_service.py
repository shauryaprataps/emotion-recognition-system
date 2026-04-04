from datetime import datetime


def compute_ratings(final_emotion: str, final_confidence: float, fused_probabilities: dict[str, float]) -> dict[str, float]:
    positive = fused_probabilities.get("happy", 0.0) + fused_probabilities.get("surprise", 0.0) * 0.4
    negative = (
        fused_probabilities.get("angry", 0.0)
        + fused_probabilities.get("fear", 0.0)
        + fused_probabilities.get("sad", 0.0) * 0.8
        + fused_probabilities.get("disgust", 0.0)
    )
    neutral = fused_probabilities.get("neutral", 0.0)

    confidence_level = round(min(100.0, 45 + (final_confidence * 55)), 2)
    stress_handling = round(max(10.0, min(100.0, 75 - negative * 45 + positive * 15)), 2)
    emotional_stability = round(max(10.0, min(100.0, 55 + neutral * 30 + positive * 18 - negative * 32)), 2)
    engagement_level = round(max(10.0, min(100.0, 40 + positive * 45 + (1 - neutral) * 10)), 2)
    communication_tone = round(max(10.0, min(100.0, 45 + positive * 35 + neutral * 20 - negative * 25)), 2)

    return {
        "confidence_level": confidence_level,
        "stress_handling": stress_handling,
        "emotional_stability": emotional_stability,
        "engagement_level": engagement_level,
        "communication_tone": communication_tone,
    }


def build_interpretation(
    final_emotion: str,
    confidence: float,
    face_emotion: str | None,
    voice_emotion: str | None,
    text_emotion: str | None,
) -> str:
    descriptors = {
        "happy": "positive and optimistic",
        "neutral": "balanced and composed",
        "sad": "subdued and reflective",
        "angry": "intense and forceful",
        "fear": "hesitant and uncertain",
        "disgust": "skeptical and resistant",
        "surprise": "alert and highly reactive",
    }
    profile = descriptors.get(final_emotion, "mixed")
    modalities = ", ".join(
        f"{name}: {emotion}"
        for name, emotion in [("face", face_emotion), ("voice", voice_emotion), ("text", text_emotion)]
        if emotion
    )
    confidence_pct = round(confidence * 100, 1)
    return (
        f"The subject demonstrates a {profile} emotional profile with a fused confidence of "
        f"{confidence_pct}%. Observed modality outputs were {modalities or 'limited across modalities'}. "
        f"This report should be interpreted as a decision-support signal rather than a clinical conclusion."
    )


def build_report_text(
    session_id: str,
    timestamp: datetime,
    inputs_used: dict[str, bool],
    face_emotion: str | None,
    voice_emotion: str | None,
    text_emotion: str | None,
    final_emotion: str,
    final_confidence: float,
    ratings: dict[str, float],
) -> str:
    interpretation = build_interpretation(final_emotion, final_confidence, face_emotion, voice_emotion, text_emotion)
    return (
        f"Session ID: {session_id}\n"
        f"Timestamp: {timestamp.isoformat()}\n"
        f"Inputs Used: {inputs_used}\n"
        f"Face Emotion: {face_emotion}\n"
        f"Voice Emotion: {voice_emotion}\n"
        f"Text Emotion: {text_emotion}\n"
        f"Final Fused Emotion: {final_emotion}\n"
        f"Final Confidence: {round(final_confidence * 100, 2)}%\n"
        f"Ratings: {ratings}\n\n"
        f"Interpretation:\n{interpretation}"
    )
