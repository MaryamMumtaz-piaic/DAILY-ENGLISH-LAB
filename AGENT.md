# Daily English Lab — AI Agent Architecture

> Three specialized agents. Clear boundaries. No overlap.

---

## Overview

All agents are implemented in the FastAPI AI service (`apps/ai-service/app/agents/`). NestJS invokes them via internal HTTP. Agents never own persistence — they receive data, process it, and return structured JSON. NestJS stores the result.

```
NestJS (orchestrator)
  └── FastAPI (agent host)
        ├── ConversationAgent
        ├── EnglishCoachAgent
        └── ProgressAgent
```

---

## Agent 1: Conversation Agent

**File:** `apps/ai-service/app/agents/conversation_agent.py`

### Purpose

Drives the live practice conversation. Makes practice feel like a natural English conversation with an intelligent coach — not a grammar quiz or a test.

### Responsibilities

- Start and manage practice conversation sessions
- Generate contextually relevant questions and prompts
- Maintain short-term conversation context (via Redis, keyed by session ID)
- Dynamically adjust difficulty based on user level and recent correction history
- Naturally embed practice for the user's known weak areas into conversation
- Keep the user engaged — avoid robotic or formulaic responses

### Adaptive Practice Behavior

The agent receives the user's `known_mistakes` list. It uses this to subtly guide the conversation toward weak areas without announcing it.

**Example:**
```
UserMistake: past_tense (frequency: 8, severity: high)

Agent generates:
  "What did you do last weekend?"
  "Can you tell me about what happened yesterday?"
  "Describe what you worked on in your last project."
```

The user is never told: "Now we are practicing past tense." The correction happens naturally.

### Input Schema

```python
class ConversationRequest(BaseModel):
    session_id: str
    user_id: str
    user_message: str
    conversation_history: list[ConversationTurn]
    user_level: Literal["beginner", "intermediate", "advanced"]
    known_mistakes: list[MistakeContext]
    session_topic: str | None = None
```

### Output Schema

```python
class ConversationResponse(BaseModel):
    ai_message: str
    should_encourage: bool
    suggested_topic_shift: bool
    difficulty_assessment: Literal["too_easy", "appropriate", "too_hard"]
```

### Internal Endpoint

```
POST /internal/v1/conversation/respond
POST /internal/v1/conversation/start
```

---

## Agent 2: English Coach Agent

**File:** `apps/ai-service/app/agents/english_coach_agent.py`

### Purpose

The core correction and analysis engine. Every user utterance passes through this agent before being stored or returned to the user.

### Responsibilities

- Grammar analysis and correction
- Vocabulary improvement and natural phrasing
- Pronunciation analysis (when phoneme data is available from STT)
- Mistake identification, classification, and severity scoring
- Deciding whether the user should retry the sentence
- Generating concise, encouraging, user-facing explanations

### Mistake Classification

| Category                | Example Error                            |
|-------------------------|------------------------------------------|
| `past_tense`            | "I go there yesterday"                   |
| `articles`              | "I have dog at home"                     |
| `prepositions`          | "I am waiting since morning"             |
| `subject_verb_agreement`| "She go to school every day"             |
| `word_order`            | "I yesterday went to market"             |
| `verb_form`             | "I have went there"                      |
| `pluralization`         | "I have two childs"                      |
| `vocabulary`            | Incorrect word choice or false friends   |
| `sentence_structure`    | Fragmented or run-on sentences           |
| `tense_consistency`     | Mixing past and present in one sentence  |

### Output Schema (Structured JSON — stored in `Correction` table)

```json
{
  "originalText": "I go to university yesterday",
  "correctedText": "I went to university yesterday",
  "isCorrect": false,
  "overallScore": 72,
  "mistakes": [
    {
      "type": "grammar",
      "category": "past_tense",
      "original": "go",
      "corrected": "went",
      "explanation": "Use past tense because the sentence refers to yesterday.",
      "severity": "high"
    }
  ],
  "naturalAlternative": "Yesterday I went to university.",
  "difficulty": "intermediate",
  "shouldRetry": true,
  "encouragement": "Good attempt! You have the right idea. Try the corrected sentence once more."
}
```

### Rules

- Never expose internal LLM chain-of-thought in output
- Explanations must be one sentence, user-facing, and actionable
- `shouldRetry: true` when the sentence has high-severity mistakes worth drilling
- `encouragement` is never harsh, never skipped
- The agent does not decide what to store — NestJS handles persistence

### Input Schema

```python
class EnglishAnalysisRequest(BaseModel):
    text: str
    context: str | None = None         # surrounding conversation context
    user_level: str
    known_mistakes: list[MistakeContext]
    session_id: str
    user_id: str
```

### Internal Endpoint

```
POST /internal/v1/english/analyze
POST /internal/v1/english/fix-text      # for "Fix My English" feature (no spoken audio)
```

---

## Agent 3: Progress Agent

**File:** `apps/ai-service/app/agents/progress_agent.py`

### Purpose

Analyzes completed sessions, detects patterns in the user's mistake history, compares current performance to historical baselines, and generates a human-readable session summary plus tomorrow's recommendation.

### Responsibilities

- Analyze a completed session's corrections and mistakes
- Detect recurring mistake patterns across sessions (not just this session)
- Identify areas where the user has measurably improved
- Generate the session summary shown after a practice session ends
- Recommend the focus area for tomorrow's practice
- Produce data to store in the `ProgressSnapshot` table

### Invocation

This agent is called by NestJS **once per session**, when the user ends a session. It is not invoked mid-session.

### Input Schema

```python
class ProgressAnalysisRequest(BaseModel):
    user_id: str
    session_id: str
    session_corrections: list[CorrectionSummary]
    historical_mistake_counts: dict[str, int]  # category → frequency
    session_duration_seconds: int
    sessions_completed: int
```

### Output Schema

```python
class ProgressAnalysisResponse(BaseModel):
    session_summary: SessionSummary
    recurring_mistakes: list[str]        # top mistake categories this session
    improvement_signals: list[str]       # categories that improved vs. history
    recommended_focus: str               # tomorrow's practice suggestion
    snapshot_data: ProgressSnapshotData  # stored in DB by NestJS
```

### Session Summary Structure (shown to user)

```json
{
  "duration_minutes": 24,
  "sentences_practiced": 18,
  "areas_practiced": ["past_tense", "daily_conversation", "sentence_formation"],
  "major_improvements": ["articles"],
  "focus_area": "past_tense",
  "tomorrow_recommendation": "We'll continue practicing past-tense conversations."
}
```

### Internal Endpoint

```
POST /internal/v1/progress/analyze
```

---

## Full Pipeline: Speech Practice Flow

```
1. User records audio
   └── Next.js → POST /api/v1/speech/transcribe (NestJS)

2. NestJS: authenticate user, validate request, upload audio to object storage

3. NestJS → FastAPI: POST /internal/v1/speech/transcribe
   FastAPI (STT service) → returns { transcript, confidence, duration }

4. NestJS → FastAPI: POST /internal/v1/english/analyze
   EnglishCoachAgent → returns { correction JSON }

5. NestJS: store SpeechAttempt, Correction, update UserMistake records

6. NestJS → FastAPI: POST /internal/v1/conversation/respond
   ConversationAgent → returns { ai_message }

7. NestJS → Next.js: full structured response

8. User sees: original text, corrected text, explanation, [Try Again] button
```

---

## Service Abstractions (Provider-Agnostic)

Agents call services, not providers directly. Swap the provider in `.env` without changing agent code.

```python
# apps/ai-service/app/services/llm_service.py
class LLMService:
    provider: str  # "openai" | "anthropic" | "groq"
    async def complete(self, prompt: str, **kwargs) -> str: ...
    async def complete_structured(self, prompt: str, schema: type[T]) -> T: ...

# apps/ai-service/app/services/speech_service.py
class SpeechToTextService:
    provider: str  # "openai-whisper" | "deepgram" | "google"
    async def transcribe(self, audio_url: str, language: str = "en") -> TranscriptResult: ...

class TextToSpeechService:
    provider: str  # "openai-tts" | "elevenlabs" | "google"
    async def synthesize(self, text: str, voice: str) -> bytes: ...
```

---

## Internal API Contract Summary

All endpoints require header: `X-Internal-API-Key: <FASTAPI_INTERNAL_API_KEY>`

| Method | Endpoint                               | Agent / Service       |
|--------|----------------------------------------|-----------------------|
| POST   | `/internal/v1/speech/transcribe`       | SpeechToTextService   |
| POST   | `/internal/v1/speech/tts`             | TextToSpeechService   |
| POST   | `/internal/v1/english/analyze`         | EnglishCoachAgent     |
| POST   | `/internal/v1/english/fix-text`        | EnglishCoachAgent     |
| POST   | `/internal/v1/conversation/start`      | ConversationAgent     |
| POST   | `/internal/v1/conversation/respond`    | ConversationAgent     |
| POST   | `/internal/v1/progress/analyze`        | ProgressAgent         |
| GET    | `/internal/v1/health`                  | Health check          |

---

## What Agents Must NOT Do

- Perform database queries (NestJS owns persistence)
- Handle authentication (NestJS owns auth)
- Accept requests without a valid internal API key
- Return raw LLM output or chain-of-thought text
- Make assumptions about which provider is configured

---

*Maintained by Maryam Mumtaz — Daily English Lab*
