from pydantic import BaseModel
from typing import Optional

from app.schemas.analysis import MistakeContext


class ConversationTurn(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ConversationStartRequest(BaseModel):
    session_id: str
    user_id: str
    user_level: str = "intermediate"
    known_mistakes: list[MistakeContext] = []
    topic: Optional[str] = None


class ConversationStartResponse(BaseModel):
    ai_message: str
    session_context: dict = {}


class ConversationRespondRequest(BaseModel):
    session_id: str
    user_id: str
    user_message: str
    conversation_history: list[ConversationTurn] = []
    user_level: str = "intermediate"
    known_mistakes: list[MistakeContext] = []


class ConversationRespondResponse(BaseModel):
    ai_message: str
    should_encourage: bool = False
    suggested_retry: bool = False
