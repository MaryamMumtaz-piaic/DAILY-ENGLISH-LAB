import base64

import structlog
from fastapi import HTTPException, status
from openai import AsyncOpenAI, APIError

from app.core.config import get_settings

logger = structlog.get_logger()


class TextToSpeechService:
    def __init__(self):
        self.settings = get_settings()
        api_key = self.settings.tts_api_key or self.settings.llm_api_key
        self.client = AsyncOpenAI(api_key=api_key)
        self.default_voice = self.settings.tts_voice

    async def synthesize(self, text: str, voice: str | None = None) -> dict:
        """Synthesize speech and return a data-URI audio URL plus optional duration."""
        selected_voice = voice or self.default_voice

        try:
            response = await self.client.audio.speech.create(
                model="tts-1",
                voice=selected_voice,
                input=text,
                response_format="mp3",
            )
            # Read all audio bytes
            audio_bytes = response.read()
        except APIError as exc:
            logger.error("tts_synthesis_failed", error=str(exc))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Text-to-speech synthesis failed. Please try again.",
            ) from exc

        # Encode as a data URI so callers can play it directly without an extra download step
        b64 = base64.b64encode(audio_bytes).decode("utf-8")
        audio_url = f"data:audio/mpeg;base64,{b64}"

        return {"audio_url": audio_url, "duration": None}
