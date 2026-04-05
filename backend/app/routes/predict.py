from functools import lru_cache
from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.models.schemas import OptionalModalityResult, PredictResponse, Ratings, ReportSummary
from app.services.db_service import create_session, get_db, get_or_create_settings
from app.services.fusion_service import fuse_modalities
from app.services.report_service import build_interpretation, build_report_text, compute_ratings

router = APIRouter(prefix="/predict", tags=["predict"])


@lru_cache
def get_face_service():
    from app.services.face_service import FaceEmotionService

    return FaceEmotionService()


@lru_cache
def get_voice_service():
    from app.services.voice_service import VoiceEmotionService

    return VoiceEmotionService()


@lru_cache
def get_text_service():
    from app.services.text_service import TextEmotionService

    return TextEmotionService()


@router.post("", response_model=PredictResponse)
async def predict_emotion(
    face: UploadFile | None = File(default=None),
    audio: UploadFile | None = File(default=None),
    text: str | None = Form(default=None),
    save_session: bool = Form(default=True),
    db: Session = Depends(get_db),
) -> PredictResponse:
    if not face and not audio and not text:
        raise HTTPException(status_code=400, detail="Provide at least one modality: face, audio, or text.")

    settings_row = get_or_create_settings(db)

    face_result = None
    if face:
        face_bytes = await face.read()
        try:
            face_result = get_face_service().analyze(face_bytes)
        except Exception as exc:
            message = str(exc).lower()
            if "no face" in message or "emotion signal" in message:
                raise HTTPException(
                    status_code=422,
                    detail="No clear face detected in the current frame. Please face the camera and try again.",
                ) from exc
            raise HTTPException(
                status_code=503,
                detail=(
                    "Face model inference is unavailable. Make sure the pretrained face model finished "
                    "downloading and the image contains a detectable face."
                ),
            ) from exc

    voice_result = None
    if audio:
        audio_bytes = await audio.read()
        try:
            voice_result = get_voice_service().analyze(audio_bytes, filename=audio.filename or "audio.wav")
        except Exception as exc:
            raise HTTPException(
                status_code=503,
                detail=(
                    "Voice model inference is unavailable. Check that the SpeechBrain model can download once, "
                    "and use a supported speech audio file."
                ),
            ) from exc

    text_result = None
    if text and text.strip():
        try:
            text_result = get_text_service().analyze(text.strip())
        except Exception as exc:
            raise HTTPException(
                status_code=503,
                detail=(
                    "Text model is unavailable locally. Connect to the internet once so the Hugging Face "
                    "emotion model can download, then retry."
                ),
            ) from exc

    weights = {
        "face": settings_row.face_weight,
        "voice": settings_row.voice_weight,
        "text": settings_row.text_weight,
    }

    fusion = fuse_modalities(
        face_result.probabilities if face_result else None,
        voice_result.probabilities if voice_result else None,
        text_result.probabilities if text_result else None,
        weights,
    )

    ratings_dict = compute_ratings(fusion.final_emotion, fusion.final_confidence, fusion.fused_probabilities)
    session_id = uuid4().hex[:12]
    timestamp = datetime.utcnow()
    inputs_used = {
        "face": face_result is not None,
        "voice": voice_result is not None,
        "text": text_result is not None,
    }
    interpretation = build_interpretation(
        fusion.final_emotion,
        fusion.final_confidence,
        face_result.emotion if face_result else None,
        voice_result.emotion if voice_result else None,
        text_result.emotion if text_result else None,
    )
    report_text = build_report_text(
        session_id=session_id,
        timestamp=timestamp,
        inputs_used=inputs_used,
        face_emotion=face_result.emotion if face_result else None,
        voice_emotion=voice_result.emotion if voice_result else None,
        text_emotion=text_result.emotion if text_result else None,
        final_emotion=fusion.final_emotion,
        final_confidence=fusion.final_confidence,
        ratings=ratings_dict,
    )

    if save_session:
        create_session(
            db,
            {
                "session_id": session_id,
                "timestamp": timestamp,
                "face_emotion": face_result.emotion if face_result else None,
                "voice_emotion": voice_result.emotion if voice_result else None,
                "text_emotion": text_result.emotion if text_result else None,
                "final_emotion": fusion.final_emotion,
                "final_confidence": fusion.final_confidence,
                "face_probs": face_result.probabilities if face_result else None,
                "voice_probs": voice_result.probabilities if voice_result else None,
                "text_probs": text_result.probabilities if text_result else None,
                "fused_probs": fusion.fused_probabilities,
                "ratings": ratings_dict,
                "report_text": report_text,
                "inputs_used": inputs_used,
            },
        )

    return PredictResponse(
        session_id=session_id,
        timestamp=timestamp,
        face=OptionalModalityResult(
            emotion=face_result.emotion,
            probabilities=face_result.probabilities,
            confidence=face_result.confidence,
        )
        if face_result
        else None,
        voice=OptionalModalityResult(
            emotion=voice_result.emotion,
            probabilities=voice_result.probabilities,
            confidence=voice_result.confidence,
        )
        if voice_result
        else None,
        text=OptionalModalityResult(
            emotion=text_result.emotion,
            probabilities=text_result.probabilities,
            confidence=text_result.confidence,
        )
        if text_result
        else None,
        final_emotion=fusion.final_emotion,
        final_confidence=fusion.final_confidence,
        fused_probabilities=fusion.fused_probabilities,
        effective_weights=fusion.effective_weights,
        ratings=Ratings(**ratings_dict),
        report=ReportSummary(
            session_id=session_id,
            timestamp=timestamp,
            inputs_used=inputs_used,
            interpretation=interpretation,
        ),
    )
