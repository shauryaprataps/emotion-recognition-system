from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models.schemas import SettingsResponse, UpdateSettingsRequest
from app.services.db_service import get_db, get_or_create_settings

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db)) -> SettingsResponse:
    row = get_or_create_settings(db)
    return SettingsResponse(
        face_weight=row.face_weight,
        voice_weight=row.voice_weight,
        text_weight=row.text_weight,
        theme=row.theme,
    )


@router.post("", response_model=SettingsResponse)
def update_settings(payload: UpdateSettingsRequest, db: Session = Depends(get_db)) -> SettingsResponse:
    row = get_or_create_settings(db)
    total = payload.face_weight + payload.voice_weight + payload.text_weight
    if total > 0:
        row.face_weight = payload.face_weight / total
        row.voice_weight = payload.voice_weight / total
        row.text_weight = payload.text_weight / total
    row.theme = payload.theme
    db.commit()
    db.refresh(row)

    return SettingsResponse(
        face_weight=row.face_weight,
        voice_weight=row.voice_weight,
        text_weight=row.text_weight,
        theme=row.theme,
    )
