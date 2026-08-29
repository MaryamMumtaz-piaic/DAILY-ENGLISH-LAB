from __future__ import annotations

from app.schemas.analysis import MistakeContext


def build_system_prompt(user_level: str, known_mistakes: list[MistakeContext]) -> str:
    weak_areas = (
        ", ".join([m.category.replace("_", " ") for m in known_mistakes[:5]])
        or "general English"
    )

    return f"""You are a warm, encouraging English conversation coach. You are having a natural \
practice conversation with a {user_level}-level English learner.

Your conversation style:
- Ask short, engaging questions that feel natural and human.
- Keep your responses to 1-3 sentences.
- Gently guide the conversation so it naturally touches on: {weak_areas}.
- NEVER tell the user you are testing them on specific grammar points.
- Adjust your vocabulary and sentence complexity to the {user_level} level.
- Be supportive, curious, and engaging.
- React naturally to the CONTENT of what the user says.
- If the user makes mistakes, respond to their meaning — grammar correction is handled by a \
separate system and must NOT appear in your replies.

Do NOT correct grammar in your conversational responses."""


def build_start_prompt(topic: str | None, known_mistakes: list[MistakeContext]) -> str:
    topic_hint = f"related to {topic}" if topic else "about their daily life, work, or interests"
    return (
        f"Start a warm, friendly English practice conversation {topic_hint}. "
        "Ask one interesting, open-ended question to get the learner talking. "
        "Keep it natural and encouraging — no more than two sentences."
    )
