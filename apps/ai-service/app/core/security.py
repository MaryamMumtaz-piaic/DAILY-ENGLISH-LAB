from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader
from app.core.config import get_settings

api_key_header = APIKeyHeader(name="X-Internal-API-Key", auto_error=False)


async def verify_internal_api_key(api_key: str = Security(api_key_header)) -> str:
    settings = get_settings()
    if not api_key or api_key != settings.internal_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing internal API key",
        )
    return api_key
