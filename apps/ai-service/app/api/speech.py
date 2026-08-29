from fastapi import APIRouter, Depends

from app.core.security import verify_internal_api_key
from app.schemas.speech import (
    TranscribeRequest,
    TranscribeResponse,
    TTSRequest,
    TTSResponse,
)
from app.services.stt_service import SpeechToTextService
from app.services.tts_service import TextToSpeechService

router = APIRouter()


@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_speech(
    request: TranscribeRequest,
    _: str = Depends(verify_internal_api_key),
):
    stt = SpeechToTextService()
    result = await stt.transcribe(request.audio_url, request.language)
    return TranscribeResponse(
        success=True,
        transcript=result["transcript"],
        confidence=result["confidence"],
        duration=result.get("duration"),
    )


@router.post("/tts", response_model=TTSResponse)
async def text_to_speech(
    request: TTSRequest,
    _: str = Depends(verify_internal_api_key),
):
    tts = TextToSpeechService()
    result = await tts.synthesize(request.text, request.voice)
    return TTSResponse(
        audio_url=result["audio_url"],
        duration=result.get("duration"),
    )
