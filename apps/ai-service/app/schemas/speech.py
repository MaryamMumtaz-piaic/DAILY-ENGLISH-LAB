from pydantic import BaseModel
from typing import Optional


class TranscribeRequest(BaseModel):
    audio_url: str
    language: str = "en"
    user_id: str
    session_id: str


class TranscribeResponse(BaseModel):
    success: bool
    transcript: str
    confidence: float
    duration: Optional[float] = None


class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = None


class TTSResponse(BaseModel):
    audio_url: str
    duration: Optional[float] = None
