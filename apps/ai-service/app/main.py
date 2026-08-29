import time

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import ai, conversation, health, progress, speech
from app.core.config import get_settings
from app.core.logging import configure_logging

settings = get_settings()
configure_logging(settings.fastapi_env)
logger = structlog.get_logger()

app = FastAPI(
    title="Daily English Lab — AI Service",
    version="1.0.0",
    docs_url="/docs" if settings.fastapi_env != "production" else None,
    redoc_url=None,
)

# Only allow internal network — add localhost for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    try:
        response = await call_next(request)
    except Exception as exc:
        logger.error("unhandled_exception", path=request.url.path, error=str(exc))
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})
    duration = round((time.time() - start) * 1000)
    logger.info(
        "request",
        method=request.method,
        path=request.url.path,
        status=response.status_code,
        ms=duration,
    )
    return response


app.include_router(health.router, prefix="/internal/v1", tags=["health"])
app.include_router(speech.router, prefix="/internal/v1/speech", tags=["speech"])
app.include_router(ai.router, prefix="/internal/v1/english", tags=["english"])
app.include_router(conversation.router, prefix="/internal/v1/conversation", tags=["conversation"])
app.include_router(progress.router, prefix="/internal/v1/progress", tags=["progress"])
