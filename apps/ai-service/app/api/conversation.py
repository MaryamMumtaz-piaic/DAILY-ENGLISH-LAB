from fastapi import APIRouter, Depends

from app.agents.conversation_agent import ConversationAgent
from app.core.security import verify_internal_api_key
from app.schemas.conversation import (
    ConversationRespondRequest,
    ConversationRespondResponse,
    ConversationStartRequest,
    ConversationStartResponse,
)

router = APIRouter()


@router.post("/start", response_model=ConversationStartResponse)
async def start_conversation(
    request: ConversationStartRequest,
    _: str = Depends(verify_internal_api_key),
):
    agent = ConversationAgent()
    return await agent.start_conversation(request)


@router.post("/respond", response_model=ConversationRespondResponse)
async def respond_to_conversation(
    request: ConversationRespondRequest,
    _: str = Depends(verify_internal_api_key),
):
    agent = ConversationAgent()
    return await agent.respond(request)
