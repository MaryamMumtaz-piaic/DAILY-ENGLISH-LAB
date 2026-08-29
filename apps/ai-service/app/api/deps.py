"""Shared FastAPI dependencies."""
from app.core.security import verify_internal_api_key

__all__ = ["verify_internal_api_key"]
