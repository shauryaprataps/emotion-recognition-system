from fastapi import APIRouter

from app.models.schemas import AuthResponse, LoginRequest

router = APIRouter(tags=["auth"])


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest) -> AuthResponse:
    return AuthResponse(
        authenticated=bool(payload.username and payload.password),
        username=payload.username,
        message="Placeholder authentication accepted for prototype usage.",
    )


@router.post("/logout", response_model=AuthResponse)
def logout() -> AuthResponse:
    return AuthResponse(
        authenticated=False,
        username="guest",
        message="Logged out from prototype session.",
    )
