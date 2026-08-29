from fastapi import APIRouter, Depends

from app.agents.english_coach_agent import EnglishCoachAgent
from app.core.security import verify_internal_api_key
from app.schemas.analysis import (
    EnglishAnalysisRequest,
    EnglishAnalysisResponse,
    FixTextRequest,
    FixTextResponse,
)

router = APIRouter()


@router.post("/analyze", response_model=EnglishAnalysisResponse)
async def analyze_english(
    request: EnglishAnalysisRequest,
    _: str = Depends(verify_internal_api_key),
):
    agent = EnglishCoachAgent()
    return await agent.analyze(request)


@router.post("/fix-text", response_model=FixTextResponse)
async def fix_text(
    request: FixTextRequest,
    _: str = Depends(verify_internal_api_key),
):
    agent = EnglishCoachAgent()
    return await agent.fix_text(request)
