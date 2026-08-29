from pydantic import BaseModel
from typing import Optional


class MistakeContext(BaseModel):
    category: str
    frequency: int
    severity: str = "medium"


class EnglishAnalysisRequest(BaseModel):
    text: str
    context: Optional[str] = None
    user_level: str = "intermediate"
    known_mistakes: list[MistakeContext] = []
    session_id: str
    user_id: str


class MistakeDetail(BaseModel):
    type: str
    category: str
    original: str
    corrected: str
    explanation: str
    severity: str = "medium"


class EnglishAnalysisResponse(BaseModel):
    original_text: str
    corrected_text: str
    is_correct: bool
    overall_score: int
    mistakes: list[MistakeDetail]
    natural_alternative: Optional[str] = None
    difficulty: str
    should_retry: bool
    encouragement: str


class FixTextRequest(BaseModel):
    text: str
    user_level: str = "intermediate"


class FixTextResponse(BaseModel):
    original_text: str
    corrected_text: str
    changes: list[MistakeDetail]
    natural_alternative: str
    explanation: str
