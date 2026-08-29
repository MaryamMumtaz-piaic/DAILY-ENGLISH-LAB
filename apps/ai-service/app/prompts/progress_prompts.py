from collections import Counter

from app.schemas.progress import ProgressAnalysisRequest

PROGRESS_SYSTEM_PROMPT = """You are an English learning progress analyzer. \
Analyze session data and return structured JSON insights. \
Be encouraging, specific, and actionable. Respond ONLY with valid JSON."""


def build_progress_prompt(req: ProgressAnalysisRequest) -> str:
    errors = [c for c in req.session_corrections if not c.is_correct]
    categories = [cat for c in errors for cat in c.categories]
    cat_counts = Counter(categories)
    top_mistakes = [f"{cat}({count})" for cat, count in cat_counts.most_common(5)]

    historical = (
        ", ".join([f"{k}:{v}" for k, v in req.historical_mistake_counts.items()])
        or "none"
    )

    return f"""Analyze this English practice session and return a JSON progress report.

Session stats:
- Duration: {req.session_duration_seconds // 60} minutes
- Sentences practiced: {len(req.session_corrections)}
- Sessions completed overall: {req.sessions_completed}
- Mistakes in this session: {', '.join(top_mistakes) or 'none'}
- Historical mistake counts: {historical}

Return JSON with this exact structure:
{{
  "recurringMistakes": ["past_tense", "articles"],
  "improvementSignals": ["Fewer preposition errors compared to previous sessions"],
  "recommendedFocus": "Spend tomorrow's session on past tense in storytelling contexts.",
  "sessionSummary": {{
    "areasPracticed": ["past_tense", "conversation", "vocabulary"]
  }}
}}"""
