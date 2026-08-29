from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter()


@router.get("/health")
async def health():
    settings = get_settings()
    return {
        "status": "ok",
        "service": "daily-english-lab-ai",
        "env": settings.fastapi_env,
    }
