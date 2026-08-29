from pydantic import BaseModel
from typing import Optional


class CorrectionSummary(BaseModel):
    is_correct: bool
    categories: list[str]
    severity: str = "medium"


class ProgressAnalysisRequest(BaseModel):
    user_id: str
    session_id: str
    session_corrections: list[CorrectionSummary]
    historical_mistake_counts: dict[str, int] = {}
    session_duration_seconds: int
    sessions_completed: int = 1


class SessionSummaryData(BaseModel):
    duration_minutes: int
    sentences_practiced: int
    areas_practiced: list[str]
    major_improvements: list[str]
    focus_area: Optional[str] = None
    tomorrow_recommendation: str


class ProgressAnalysisResponse(BaseModel):
    session_summary: SessionSummaryData
    recurring_mistakes: list[str]
    improvement_signals: list[str]
    recommended_focus: str
