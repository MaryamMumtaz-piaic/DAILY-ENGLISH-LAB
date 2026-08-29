from app.schemas.analysis import EnglishAnalysisRequest, FixTextRequest

COACH_SYSTEM_PROMPT = """You are an expert English language coach. Your job is to analyze English text, \
identify grammatical and vocabulary mistakes, and provide clear, encouraging corrections.

You ALWAYS respond with valid JSON only. Never include explanation outside the JSON.

Mistake categories you use:
past_tense, articles, prepositions, subject_verb_agreement, word_order, verb_form, \
pluralization, vocabulary, sentence_structure, tense_consistency, spelling

Severity levels: low, medium, high

Rules:
- Be encouraging and positive in tone.
- Explanations must be ONE sentence, user-facing, and actionable.
- Never expose internal reasoning.
- If the text is correct, still provide warm encouragement."""


def build_analysis_prompt(req: EnglishAnalysisRequest) -> str:
    known = (
        ", ".join([f"{m.category}({m.frequency}x)" for m in req.known_mistakes[:5]])
        or "none"
    )
    return f"""Analyze this English text from a {req.user_level} learner.

Text: "{req.text}"
Context: {req.context or 'general practice'}
User's known weak areas: {known}

Return JSON with this exact structure:
{{
  "correctedText": "corrected version of the text",
  "isCorrect": true,
  "overallScore": 85,
  "mistakes": [
    {{
      "type": "grammar",
      "category": "past_tense",
      "original": "go",
      "corrected": "went",
      "explanation": "Use the past tense 'went' when describing a completed action.",
      "severity": "high"
    }}
  ],
  "naturalAlternative": "a more natural native-speaker phrasing, or null if not needed",
  "difficulty": "beginner",
  "shouldRetry": false,
  "encouragement": "Great effort — you're making real progress!"
}}"""


def build_fix_prompt(req: FixTextRequest) -> str:
    return f"""Fix and improve this English text from a {req.user_level} learner.

Text: "{req.text}"

Return JSON with this exact structure:
{{
  "correctedText": "improved version of the text",
  "changes": [
    {{
      "type": "grammar",
      "category": "subject_verb_agreement",
      "original": "original phrase",
      "corrected": "corrected phrase",
      "explanation": "One-sentence explanation of why this change was made.",
      "severity": "medium"
    }}
  ],
  "naturalAlternative": "the most natural native-speaker version",
  "explanation": "Brief overall summary of the main improvements made."
}}"""
