from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Emotion Recognition System API"
    api_prefix: str = "/api"
    database_url: str = "sqlite:///./database/emotion_system.db"
    allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    default_face_weight: float = 0.30
    default_voice_weight: float = 0.40
    default_text_weight: float = 0.30
    hf_text_model: str = "j-hartmann/emotion-english-distilroberta-base"
    sb_voice_model: str = "speechbrain/emotion-recognition-wav2vec2-IEMOCAP"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    @property
    def cors_origins(self) -> list[str]:
        return [item.strip() for item in self.allowed_origins.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
