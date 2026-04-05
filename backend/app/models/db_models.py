from datetime import datetime
from pathlib import Path

from sqlalchemy import JSON, DateTime, Float, Integer, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

from app.utils.config import get_settings


class Base(DeclarativeBase):
    pass


class AnalysisSession(Base):
    __tablename__ = "analysis_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    face_emotion: Mapped[str | None] = mapped_column(String(32), nullable=True)
    voice_emotion: Mapped[str | None] = mapped_column(String(32), nullable=True)
    text_emotion: Mapped[str | None] = mapped_column(String(32), nullable=True)
    final_emotion: Mapped[str] = mapped_column(String(32))
    final_confidence: Mapped[float] = mapped_column(Float)
    face_probs: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    voice_probs: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    text_probs: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    fused_probs: Mapped[dict] = mapped_column(JSON)
    ratings: Mapped[dict] = mapped_column(JSON)
    report_text: Mapped[str] = mapped_column(Text)
    inputs_used: Mapped[dict] = mapped_column(JSON)


class AppSettings(Base):
    __tablename__ = "app_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    face_weight: Mapped[float] = mapped_column(Float, default=0.30)
    voice_weight: Mapped[float] = mapped_column(Float, default=0.40)
    text_weight: Mapped[float] = mapped_column(Float, default=0.30)
    theme: Mapped[str] = mapped_column(String(16), default="dark")


settings = get_settings()
if settings.database_url.startswith("sqlite:///"):
    sqlite_path = settings.database_url.removeprefix("sqlite:///")
    db_file = Path(sqlite_path)
    if not db_file.is_absolute():
        db_file = (Path.cwd() / db_file).resolve()
    db_file.parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
