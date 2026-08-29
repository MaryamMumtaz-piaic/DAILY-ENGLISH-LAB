import structlog
from fastapi import HTTPException, status

from app.prompts.conversation_prompts import build_start_prompt, build_system_prompt
from app.schemas.conversation import (
    ConversationRespondRequest,
    ConversationRespondResponse,
    ConversationStartRequest,
    ConversationStartResponse,
)
from app.services.llm_service import LLMService

logger = structlog.get_logger()


class ConversationAgent:
    def __init__(self):
        self.llm = LLMService()

    async def start_conversation(
        self, request: ConversationStartRequest
    ) -> ConversationStartResponse:
        system = build_system_prompt(request.user_level, request.known_mistakes)
        user_prompt = build_start_prompt(request.topic, request.known_mistakes)

        try:
            message = await self.llm.complete(system, user_prompt, temperature=0.85)
        except HTTPException:
            raise
        except Exception as exc:
            logger.error("conversation_start_error", error=str(exc))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not start conversation. Please try again.",
            ) from exc

        return ConversationStartResponse(
            ai_message=message.strip(),
            session_context={"topic": request.topic, "level": request.user_level},
        )

    async def respond(
        self, request: ConversationRespondRequest
    ) -> ConversationRespondResponse:
        system = build_system_prompt(request.user_level, request.known_mistakes)

        # Trim to the last 10 turns to keep context window manageable
        history = [
            {"role": turn.role, "content": turn.content}
            for turn in request.conversation_history[-10:]
        ]
        history.append({"role": "user", "content": request.user_message})

        try:
            message = await self.llm.complete_with_history(
                system, history, temperature=0.85
            )
        except HTTPException:
            raise
        except Exception as exc:
            logger.error("conversation_respond_error", error=str(exc))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not generate a response. Please try again.",
            ) from exc

        # Light milestone encouragement every 5 turns
        total_turns = len(request.conversation_history)
        should_encourage = total_turns > 0 and total_turns % 5 == 0

        return ConversationRespondResponse(
            ai_message=message.strip(),
            should_encourage=should_encourage,
            suggested_retry=False,
        )
