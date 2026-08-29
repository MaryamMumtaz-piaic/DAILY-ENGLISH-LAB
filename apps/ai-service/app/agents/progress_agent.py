import structlog
from fastapi import HTTPException, status

from app.prompts.progress_prompts import PROGRESS_SYSTEM_PROMPT, build_progress_prompt
from app.schemas.progress import (
    ProgressAnalysisRequest,
    ProgressAnalysisResponse,
    SessionSummaryData,
)
from app.services.llm_service import LLMService

logger = structlog.get_logger()


class ProgressAgent:
    def __init__(self):
        self.llm = LLMService()

    async def analyze(
        self, request: ProgressAnalysisRequest
    ) -> ProgressAnalysisResponse:
        user_prompt = build_progress_prompt(request)

        try:
            result = await self.llm.complete_json(PROGRESS_SYSTEM_PROMPT, user_prompt)
        except HTTPException:
            raise
        except Exception as exc:
            logger.error("progress_analyze_error", error=str(exc))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Progress analysis failed. Please try again.",
            ) from exc

        summary_data = result.get("sessionSummary", {})
        recurring = result.get("recurringMistakes", [])
        improvements = result.get("improvementSignals", [])
        recommended = result.get("recommendedFocus", "Keep practicing — consistency is key!")

        summary = SessionSummaryData(
            duration_minutes=request.session_duration_seconds // 60,
            sentences_practiced=len(request.session_corrections),
            areas_practiced=summary_data.get("areasPracticed", []),
            major_improvements=improvements,
            focus_area=recurring[0] if recurring else None,
            tomorrow_recommendation=recommended,
        )

        return ProgressAnalysisResponse(
            session_summary=summary,
            recurring_mistakes=recurring,
            improvement_signals=improvements,
            recommended_focus=recommended,
        )
