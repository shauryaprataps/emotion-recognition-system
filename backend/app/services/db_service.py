from collections.abc import Generator

from sqlalchemy.orm import Session

from app.models.db_models import AppSettings, AnalysisSession, SessionLocal
from app.utils.config import get_settings


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_or_create_settings(db: Session) -> AppSettings:
    settings_row = db.query(AppSettings).filter(AppSettings.id == 1).first()
    if settings_row:
        return settings_row

    app_config = get_settings()
    settings_row = AppSettings(
        id=1,
        face_weight=app_config.default_face_weight,
        voice_weight=app_config.default_voice_weight,
        text_weight=app_config.default_text_weight,
        theme="dark",
    )
    db.add(settings_row)
    db.commit()
    db.refresh(settings_row)
    return settings_row


def create_session(db: Session, payload: dict) -> AnalysisSession:
    session = AnalysisSession(**payload)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session
