import structlog
from fastapi import HTTPException, status

from app.prompts.coach_prompts import (
    COACH_SYSTEM_PROMPT,
    build_analysis_prompt,
    build_fix_prompt,
)
from app.schemas.analysis import (
    EnglishAnalysisRequest,
    EnglishAnalysisResponse,
    FixTextRequest,
    FixTextResponse,
    MistakeDetail,
)
from app.services.llm_service import LLMService

logger = structlog.get_logger()


class EnglishCoachAgent:
    def __init__(self):
        self.llm = LLMService()

    async def analyze(self, request: EnglishAnalysisRequest) -> EnglishAnalysisResponse:
        user_prompt = build_analysis_prompt(request)

        try:
            result = await self.llm.complete_json(COACH_SYSTEM_PROMPT, user_prompt)
        except HTTPException:
            raise
        except Exception as exc:
            logger.error("english_coach_analyze_error", error=str(exc))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="English analysis failed. Please try again.",
            ) from exc

        mistakes = [MistakeDetail(**m) for m in result.get("mistakes", [])]

        return EnglishAnalysisResponse(
            original_text=request.text,
            corrected_text=result.get("correctedText", request.text),
            is_correct=result.get("isCorrect", True),
            overall_score=result.get("overallScore", 100),
            mistakes=mistakes,
            natural_alternative=result.get("naturalAlternative"),
            difficulty=result.get("difficulty", request.user_level),
            should_retry=result.get("shouldRetry", False),
            encouragement=result.get("encouragement", "Good job! Keep practicing!"),
        )

    async def fix_text(self, request: FixTextRequest) -> FixTextResponse:
        user_prompt = build_fix_prompt(request)

        try:
            result = await self.llm.complete_json(COACH_SYSTEM_PROMPT, user_prompt)
        except HTTPException:
            raise
        except Exception as exc:
            logger.error("english_coach_fix_error", error=str(exc))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Text fix failed. Please try again.",
            ) from exc

        changes = [MistakeDetail(**m) for m in result.get("changes", [])]

        return FixTextResponse(
            original_text=request.text,
            corrected_text=result.get("correctedText", request.text),
            changes=changes,
            natural_alternative=result.get("naturalAlternative", ""),
            explanation=result.get("explanation", ""),
        )
