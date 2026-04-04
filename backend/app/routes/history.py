from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.db_models import AnalysisSession
from app.models.schemas import HistoryDetail, HistoryItem
from app.services.db_service import get_db

router = APIRouter(prefix="/history", tags=["history"])


@router.get("", response_model=list[HistoryItem])
def list_history(db: Session = Depends(get_db)) -> list[HistoryItem]:
    sessions = db.query(AnalysisSession).order_by(AnalysisSession.timestamp.desc()).all()
    return [
        HistoryItem(
            session_id=item.session_id,
            timestamp=item.timestamp,
            face_emotion=item.face_emotion,
            voice_emotion=item.voice_emotion,
            text_emotion=item.text_emotion,
            final_emotion=item.final_emotion,
            final_confidence=item.final_confidence,
        )
        for item in sessions
    ]


@router.get("/{session_id}", response_model=HistoryDetail)
def get_history_detail(session_id: str, db: Session = Depends(get_db)) -> HistoryDetail:
    item = db.query(AnalysisSession).filter(AnalysisSession.session_id == session_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Session not found.")

    return HistoryDetail(
        session_id=item.session_id,
        timestamp=item.timestamp,
        face_emotion=item.face_emotion,
        voice_emotion=item.voice_emotion,
        text_emotion=item.text_emotion,
        final_emotion=item.final_emotion,
        final_confidence=item.final_confidence,
        face_probs=item.face_probs,
        voice_probs=item.voice_probs,
        text_probs=item.text_probs,
        fused_probs=item.fused_probs,
        ratings=item.ratings,
        report_text=item.report_text,
        inputs_used=item.inputs_used,
    )
