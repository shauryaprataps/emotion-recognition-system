from datetime import datetime

from pydantic import BaseModel, Field

from app.utils.label_mapping import COMMON_EMOTIONS


class ModalityResult(BaseModel):
    emotion: str
    probabilities: dict[str, float]
    confidence: float


class OptionalModalityResult(BaseModel):
    emotion: str | None = None
    probabilities: dict[str, float] | None = None
    confidence: float | None = None


class Ratings(BaseModel):
    confidence_level: float = Field(..., ge=0, le=100)
    stress_handling: float = Field(..., ge=0, le=100)
    emotional_stability: float = Field(..., ge=0, le=100)
    engagement_level: float = Field(..., ge=0, le=100)
    communication_tone: float = Field(..., ge=0, le=100)


class ReportSummary(BaseModel):
    session_id: str
    timestamp: datetime
    inputs_used: dict[str, bool]
    interpretation: str


class PredictResponse(BaseModel):
    session_id: str
    timestamp: datetime
    face: OptionalModalityResult | None = None
    voice: OptionalModalityResult | None = None
    text: OptionalModalityResult | None = None
    final_emotion: str
    final_confidence: float
    fused_probabilities: dict[str, float]
    effective_weights: dict[str, float]
    ratings: Ratings
    report: ReportSummary


class HistoryItem(BaseModel):
    session_id: str
    timestamp: datetime
    face_emotion: str | None = None
    voice_emotion: str | None = None
    text_emotion: str | None = None
    final_emotion: str
    final_confidence: float


class HistoryDetail(HistoryItem):
    face_probs: dict[str, float] | None = None
    voice_probs: dict[str, float] | None = None
    text_probs: dict[str, float] | None = None
    fused_probs: dict[str, float]
    ratings: dict[str, float]
    report_text: str
    inputs_used: dict[str, bool]


class SettingsResponse(BaseModel):
    face_weight: float = Field(..., ge=0, le=1)
    voice_weight: float = Field(..., ge=0, le=1)
    text_weight: float = Field(..., ge=0, le=1)
    theme: str


class UpdateSettingsRequest(BaseModel):
    face_weight: float = Field(..., ge=0, le=1)
    voice_weight: float = Field(..., ge=0, le=1)
    text_weight: float = Field(..., ge=0, le=1)
    theme: str = "dark"


class LoginRequest(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    authenticated: bool
    username: str
    message: str


class CommonEmotionsResponse(BaseModel):
    labels: list[str] = COMMON_EMOTIONS
