import json

import structlog
from fastapi import HTTPException, status
from openai import AsyncOpenAI, APIError

from app.core.config import get_settings

logger = structlog.get_logger()


class LLMService:
    def __init__(self):
        self.settings = get_settings()
        self.client = AsyncOpenAI(api_key=self.settings.llm_api_key)
        self.model = self.settings.llm_model

    async def complete(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
    ) -> str:
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=temperature,
                max_tokens=1500,
            )
            return response.choices[0].message.content
        except APIError as exc:
            logger.error("llm_complete_failed", error=str(exc))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AI service temporarily unavailable. Please try again.",
            ) from exc

    async def complete_json(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> dict:
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt + "\n\nRespond ONLY with valid JSON.",
                    },
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.3,
                max_tokens=2000,
                response_format={"type": "json_object"},
            )
            content = response.choices[0].message.content
            return json.loads(content)
        except json.JSONDecodeError as exc:
            logger.error("llm_json_parse_failed", error=str(exc))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AI returned malformed response. Please try again.",
            ) from exc
        except APIError as exc:
            logger.error("llm_complete_json_failed", error=str(exc))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AI service temporarily unavailable. Please try again.",
            ) from exc

    async def complete_with_history(
        self,
        system_prompt: str,
        history: list[dict],
        temperature: float = 0.8,
    ) -> str:
        try:
            messages = [{"role": "system", "content": system_prompt}] + history
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=500,
            )
            return response.choices[0].message.content
        except APIError as exc:
            logger.error("llm_complete_history_failed", error=str(exc))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AI service temporarily unavailable. Please try again.",
            ) from exc
