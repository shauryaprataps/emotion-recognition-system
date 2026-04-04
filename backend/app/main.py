from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models.db_models import init_db
from app.routes import auth, history, predict, settings
from app.utils.config import get_settings


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app_settings = get_settings()
app = FastAPI(title=app_settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=app_settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=app_settings.api_prefix)
app.include_router(history.router, prefix=app_settings.api_prefix)
app.include_router(predict.router, prefix=app_settings.api_prefix)
app.include_router(settings.router, prefix=app_settings.api_prefix)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Emotion Recognition System API is running."}
