import ipaddress
import socket
from io import BytesIO
from urllib.parse import urlparse

import httpx
import structlog
from fastapi import HTTPException, status
from openai import AsyncOpenAI, APIError

from app.core.config import get_settings

logger = structlog.get_logger()


def _validate_audio_url(url: str) -> None:
    """Reject URLs that could cause SSRF attacks.

    Checks:
    - Scheme must be http or https.
    - No userinfo (credentials) in the URL.
    - All resolved IP addresses must be public (not private/loopback/link-local/etc.).
    """
    try:
        parsed = urlparse(url)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid audio URL"
        ) from exc

    # Require http or https
    if parsed.scheme not in ("http", "https"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Audio URL must use http or https",
        )

    # Reject empty hostnames and URLs that embed credentials
    hostname = parsed.hostname
    if not hostname or parsed.username or parsed.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid audio URL hostname",
        )

    # Resolve all DNS records and reject any private/internal address
    try:
        results = socket.getaddrinfo(hostname, None)
    except socket.gaierror as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot resolve audio URL hostname",
        ) from exc

    for result in results:
        addr_str = result[4][0]
        try:
            addr = ipaddress.ip_address(addr_str)
        except ValueError:
            continue
        if (
            addr.is_private
            or addr.is_loopback
            or addr.is_link_local
            or addr.is_unspecified
            or addr.is_multicast
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audio URL resolves to a disallowed internal address",
            )


class SpeechToTextService:
    def __init__(self):
        self.settings = get_settings()
        # Fall back to LLM API key when STT-specific key is not set
        api_key = self.settings.stt_api_key or self.settings.llm_api_key
        self.client = AsyncOpenAI(api_key=api_key)

    async def transcribe(self, audio_url: str, language: str = "en") -> dict:
        # Validate before making any network request (SSRF prevention)
        _validate_audio_url(audio_url)

        # Download the audio file from the given URL
        try:
            async with httpx.AsyncClient(timeout=30, follow_redirects=False) as http:
                audio_response = await http.get(audio_url)
                audio_response.raise_for_status()
                audio_bytes = audio_response.content
        except httpx.HTTPError as exc:
            logger.error("stt_download_failed", url=audio_url, error=str(exc))
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Could not download audio from the provided URL.",
            ) from exc

        # Wrap bytes in a file-like object; Whisper needs a filename for format detection
        audio_file = BytesIO(audio_bytes)
        audio_file.name = "audio.webm"

        try:
            transcript = await self.client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language=language,
                response_format="verbose_json",
            )
        except APIError as exc:
            logger.error("stt_transcription_failed", error=str(exc))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Speech transcription failed. Please try again.",
            ) from exc

        return {
            "transcript": transcript.text,
            # Whisper's verbose_json does not expose per-utterance confidence;
            # use a sensible constant so callers always get a numeric value.
            "confidence": 0.95,
            "duration": getattr(transcript, "duration", None),
        }
