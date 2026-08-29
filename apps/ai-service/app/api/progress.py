from fastapi import APIRouter, Depends

from app.agents.progress_agent import ProgressAgent
from app.core.security import verify_internal_api_key
from app.schemas.progress import ProgressAnalysisRequest, ProgressAnalysisResponse

router = APIRouter()


@router.post("/analyze", response_model=ProgressAnalysisResponse)
async def analyze_progress(
    request: ProgressAnalysisRequest,
    _: str = Depends(verify_internal_api_key),
):
    agent = ProgressAgent()
    return await agent.analyze(request)
