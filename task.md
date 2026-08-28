You are a Senior Full-Stack AI Engineer, Backend Architect, and AI Agent Engineer.

Build a production-ready application called:

DAILY ENGLISH LAB

The purpose of this application is to help a user improve their English through daily AI-powered speaking, reading, grammar correction, and conversation practice.

This is NOT a simple chatbot.

The system must actively evaluate the user's English, identify recurring mistakes, remember those mistakes, and adapt future practice accordingly.

============================================================
1. NON-NEGOTIABLE TECHNOLOGY STACK
============================================================

Use this architecture:

FRONTEND:
- Next.js
- TypeScript
- React
- Tailwind CSS
- Responsive/mobile-first UI

MAIN BACKEND:
- NestJS
- TypeScript
- REST API
- WebSocket support where useful
- NestJS must be the primary backend/API gateway

AI / PYTHON BACKEND:
- FastAPI
- Python
- FastAPI should handle AI-specific processing and Python-based services

DATABASE:
- PostgreSQL
- Prisma ORM on the NestJS side

CACHE / TEMPORARY STATE:
- Redis

AUTHENTICATION:
- JWT-based authentication
- Access token + refresh token architecture
- Secure HTTP-only cookies where appropriate

AI:
- LLM provider through a server-side abstraction
- Never expose AI API keys to the browser

SPEECH:
- Speech-to-Text service through a provider abstraction
- Text-to-Speech service through a provider abstraction

FILE STORAGE:
- Object storage such as S3-compatible storage
- Do NOT store audio files directly inside PostgreSQL

DEPLOYMENT:
- Next.js → Vercel
- NestJS → cloud server/container
- FastAPI → cloud server/container
- PostgreSQL → managed PostgreSQL
- Redis → managed Redis
- Object storage → S3-compatible storage

The architecture must remain provider-agnostic wherever practical.

============================================================
2. HIGH-LEVEL ARCHITECTURE
============================================================

The architecture must be:

Browser
   ↓
Next.js Frontend
   ↓
NestJS API Gateway
   ↓
 ┌─────────────────────────────┐
 │                             │
 │        NestJS Services      │
 │                             │
 │ Auth                        │
 │ Users                       │
 │ Practice                    │
 │ Sessions                    │
 │ Progress                    │
 │ Mistakes                    │
 │ AI orchestration            │
 │ Speech orchestration        │
 │                             │
 └──────────────┬──────────────┘
                │
       Internal HTTP API
                │
                ▼
        FastAPI AI Service
                │
       ┌────────┼─────────┐
       │        │         │
      LLM      STT       TTS
       │        │         │
       └────────┼─────────┘
                │
                ▼
             NestJS
                │
       ┌────────┼──────────┐
       │        │          │
 PostgreSQL   Redis     Object Storage
```

IMPORTANT:

The frontend must NOT communicate directly with FastAPI.

The frontend must communicate with NestJS.

NestJS is the public API gateway.

NestJS communicates internally with FastAPI.

This architecture must be enforced throughout the application.

============================================================
3. FRONTEND REQUEST FLOW
========================

Every application request should follow:

Next.js
↓
NestJS
↓
Service layer
↓
FastAPI when AI/Python processing is required
↓
NestJS
↓
Next.js
↓
User

Example:

User records speech.

Next.js:
POST /api/practice/speech

NestJS:

* authenticates user
* validates request
* creates processing job
* forwards audio to FastAPI

NestJS → FastAPI:

POST /internal/speech/transcribe

FastAPI:

* processes audio
* runs speech-to-text
* returns transcript + metadata

FastAPI → NestJS

NestJS:

* stores transcript
* sends transcript to English Coach Agent
* stores correction
* returns structured result

NestJS → Next.js

Next.js displays:

Original sentence
Corrected sentence
Explanation
Retry button

============================================================
4. NESTJS MUST BE THE CORE BACKEND
==================================

Create a proper modular NestJS architecture.

Example:

src/

├── app.module.ts
│
├── common/
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   ├── decorators/
│   ├── pipes/
│   └── utils/
│
├── config/
│
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── guards/
│   ├── strategies/
│   └── dto/
│
├── users/
│
├── practice/
│   ├── practice.module.ts
│   ├── practice.controller.ts
│   ├── practice.service.ts
│   ├── dto/
│   └── entities/
│
├── sessions/
│
├── conversations/
│
├── corrections/
│
├── mistakes/
│
├── progress/
│
├── speech/
│
├── ai/
│   ├── ai.module.ts
│   ├── ai.service.ts
│   ├── ai-client.service.ts
│   └── prompts/
│
├── fastapi/
│   ├── fastapi.module.ts
│   └── fastapi.client.ts
│
├── storage/
│
└── health/

```

Do not put business logic inside controllers.

Controllers should be thin.

Use:

Controller
→ Service
→ Repository / Prisma
→ external services

============================================================
5. FASTAPI ARCHITECTURE
============================================================

FastAPI is an internal AI-processing service.

Structure:

fastapi-service/

├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   ├── speech.py
│   │   ├── ai.py
│   │   └── health.py
│   │
│   ├── agents/
│   │   ├── conversation_agent.py
│   │   ├── english_coach_agent.py
│   │   └── progress_agent.py
│   │
│   ├── services/
│   │   ├── llm_service.py
│   │   ├── speech_service.py
│   │   └── pronunciation_service.py
│   │
│   ├── schemas/
│   ├── prompts/
│   ├── core/
│   └── utils/
│
├── tests/
├── requirements.txt
└── Dockerfile

FastAPI should NOT own user authentication.

NestJS owns application authentication.

FastAPI should only accept trusted internal requests.

Protect FastAPI using:

- Internal API key
- Network restrictions where available
- Request validation
- Rate limiting where appropriate

Never expose internal FastAPI endpoints directly to public clients.

============================================================
6. AI AGENT ARCHITECTURE
============================================================

Create three logical agents.

Do not create unnecessary agents.

----------------------------------------
CONVERSATION AGENT
----------------------------------------

Responsibilities:

- Start conversations
- Ask questions
- Maintain context
- Adjust difficulty
- Generate English practice
- Keep the user engaged
- Avoid unnecessary explanations

----------------------------------------
ENGLISH COACH AGENT
----------------------------------------

Responsibilities:

- Grammar analysis
- Sentence correction
- Vocabulary
- Natural phrasing
- Pronunciation analysis
- Identify recurring mistakes
- Decide whether the user needs to retry

----------------------------------------
PROGRESS AGENT
----------------------------------------

Responsibilities:

- Analyze completed sessions
- Identify recurring mistakes
- Compare current performance with historical performance
- Recommend future practice areas

============================================================
7. AI PIPELINE
============================================================

For a spoken response:

User
↓
Microphone
↓
Next.js
↓
NestJS
↓
FastAPI
↓
Speech-to-Text
↓
Transcript
↓
English Coach Agent
↓
Structured correction
↓
NestJS
↓
PostgreSQL
↓
Next.js
↓
User feedback

The AI should return structured JSON internally.

Example:

{
  "originalText": "I go to university yesterday",
  "correctedText": "I went to university yesterday",
  "isCorrect": false,
  "mistakes": [
    {
      "type": "grammar",
      "category": "past_tense",
      "original": "go",
      "corrected": "went",
      "explanation": "Use the past tense because the sentence refers to yesterday."
    }
  ],
  "difficulty": "intermediate",
  "shouldRetry": true,
  "encouragement": "Good attempt. Try the corrected sentence once more."
}

Do not expose raw internal chain-of-thought.

Only return concise user-facing explanations.

============================================================
8. DATABASE ARCHITECTURE
============================================================

Use PostgreSQL + Prisma.

Design proper relational models.

Minimum models:

User

PracticeSession

PracticeMessage

SpeechAttempt

Correction

Mistake

UserMistake

ProgressSnapshot

RefreshToken

Example conceptual relationships:

User
 ├── PracticeSessions
 │     ├── PracticeMessages
 │     ├── SpeechAttempts
 │     └── Corrections
 │
 ├── UserMistakes
 │
 └── ProgressSnapshots

Use UUIDs.

Use timestamps.

Use indexes for:

userId
sessionId
createdAt
mistakeType

Do not store large audio binaries inside PostgreSQL.

============================================================
9. SPEECH STORAGE
============================================================

When the user records audio:

Next.js
↓
NestJS
↓
Object Storage

Store:

- file URL/key
- duration
- mime type
- user ID
- session ID
- timestamp

Then process the audio through FastAPI.

Do not keep unnecessary raw audio forever.

Implement a configurable retention strategy.

============================================================
10. REDIS
============================================================

Use Redis for:

- Temporary session state
- Rate limiting
- AI request throttling
- Short-lived conversation context
- Background job state
- Caching where useful

Do not use Redis as the permanent source of truth.

PostgreSQL remains the persistent database.

============================================================
11. API DESIGN
============================================================

Create versioned APIs.

Example:

/api/v1/auth/register
/api/v1/auth/login
/api/v1/auth/refresh
/api/v1/auth/logout

/api/v1/practice/sessions
/api/v1/practice/sessions/:id
/api/v1/practice/sessions/:id/messages

/api/v1/practice/analyze

/api/v1/speech/transcribe

/api/v1/progress
/api/v1/mistakes

Use DTO validation.

Use consistent API response formats.

Example:

{
  "success": true,
  "data": {},
  "error": null,
  "meta": {}
}

For errors:

{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request"
  }
}

============================================================
12. AUTHENTICATION
============================================================

Implement secure authentication.

Requirements:

- Password hashing using Argon2 or bcrypt
- Short-lived access tokens
- Refresh tokens
- HTTP-only secure cookies where appropriate
- Token rotation
- Logout invalidation
- Authorization guards
- User ownership checks

Never trust userId sent from the client.

Always derive the authenticated user from the validated authentication context.

============================================================
13. SECURITY
============================================================

Implement production security.

Include:

- CORS configuration
- Helmet/security headers
- Rate limiting
- Input validation
- DTO validation
- SQL injection protection through Prisma
- Authentication guards
- Authorization checks
- File upload validation
- MIME validation
- File size limits
- API key protection
- Secrets management
- Request logging without sensitive data

NEVER:

- Put LLM API keys in Next.js client code
- Put FastAPI internal keys in the browser
- expose database credentials
- hardcode secrets
- trust client-provided user IDs

============================================================
14. ENVIRONMENT VARIABLES
============================================================

Create:

.env.example

Include placeholders such as:

DATABASE_URL=
REDIS_URL=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

FASTAPI_INTERNAL_URL=
FASTAPI_INTERNAL_API_KEY=

LLM_API_KEY=

STORAGE_ENDPOINT=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_BUCKET=

STT_API_KEY=
TTS_API_KEY=

Never commit real credentials.

============================================================
15. FRONTEND ARCHITECTURE
============================================================

Use Next.js + TypeScript.

Structure:

app/

├── (auth)/
│   ├── login/
│   └── register/
│
├── dashboard/
│
├── practice/
│   ├── page.tsx
│   ├── conversation/
│   ├── read-speak/
│   └── fix-english/
│
├── progress/
│
├── settings/
│
└── layout.tsx

Use reusable components.

components/

├── chat/
├── practice/
├── speech/
├── progress/
├── navigation/
├── feedback/
└── ui/

Use server components where appropriate.

Use client components only when interaction/state requires them.

============================================================
16. MOBILE-FIRST UI
============================================================

Mobile responsiveness is mandatory.

Mobile navigation:

Home
Practice
Progress

The main practice experience should prioritize the microphone.

The UI must work properly at:

320px
375px
390px
430px
768px
1024px
1440px+

No horizontal scrolling.

No overflowing buttons.

No broken microphone UI.

============================================================
17. PRACTICE HOME
============================================================

Keep it minimal.

Example:

Good morning, Muhammad

Ready for today's English practice?

20 min daily goal

[ Start Practice ]

Today's progress:

Grammar 78%
Speaking 74%

Current streak:
7 days

Do not create a complicated analytics dashboard.

============================================================
18. CONVERSATION UI
============================================================

Build a professional chat interface.

Support:

- AI messages
- User messages
- Typing indicator
- Recording state
- Processing state
- Transcription state
- Correction state
- Retry button
- Text fallback

Microphone interaction should be obvious.

============================================================
19. READ & SPEAK UI
============================================================

Show one sentence at a time.

Example:

Read this sentence aloud:

"I have been working on my project since morning."

[ 🎙 Start Speaking ]

After recording:

Processing...

Then:

Your sentence:
"I have working on my project..."

Correction:
"I have been working on my project..."

Explanation:
"You need 'been' after 'have'."

[ Try Again ]

Do not display too much information simultaneously.

============================================================
20. FIX MY ENGLISH
============================================================

Provide:

textarea

placeholder:

"Write something in English..."

[ Improve My English ]

Return:

Original
Improved
Why
Alternative natural version

============================================================
21. PERSONALIZED LEARNING
============================================================

This is a core feature.

Every meaningful mistake should be classified.

Examples:

past_tense
articles
prepositions
subject_verb_agreement
word_order
verb_form
pluralization
vocabulary
sentence_structure

Track:

frequency
firstSeen
lastSeen
severity
improvement

The system should use these records to generate future exercises.

Example:

If user repeatedly makes past-tense mistakes:

Future AI practice should naturally include:

"What did you do yesterday?"

"What did you work on last weekend?"

"What happened during your last project?"

Do not tell the user they are being tested.

Make it feel natural.

============================================================
22. SESSION SUMMARY
============================================================

At the end of every session:

Show:

Practice duration

Sentences practiced

Major improvements

Common mistakes

One recommendation for tomorrow

Example:

Today's Practice

24 minutes

You practiced:
✓ Past tense
✓ Daily conversation
✓ Sentence formation

Focus area:
Past tense

Tomorrow:
We'll practice past-tense conversations again.

============================================================
23. PROGRESS
============================================================

Keep progress simple.

Show:

Current streak
Practice minutes
Sessions completed
Most common mistakes
Improvement trend

Do not create fake percentages.

Metrics must be based on actual stored data.

============================================================
24. BACKGROUND PROCESSING
============================================================

If speech/AI processing becomes slow:

Use background jobs.

Recommended architecture:

NestJS
↓
BullMQ
↓
Redis
↓
Worker
↓
FastAPI
↓
Result
↓
PostgreSQL

Do not block HTTP requests unnecessarily for long-running operations.

For V1, synchronous processing is acceptable where latency is low.

Design the code so it can be moved to background jobs later.

============================================================
25. OBSERVABILITY
============================================================

Implement:

- Structured logs
- Request IDs
- Error logging
- Health endpoints
- AI latency tracking
- STT latency tracking
- Database health
- Redis health
- FastAPI health

Create:

GET /health

GET /health/ready

GET /health/live

Do not log:

- passwords
- access tokens
- API keys
- private user content unnecessarily

============================================================
26. TESTING
============================================================

NestJS:

- Unit tests
- Service tests
- Controller tests
- Auth tests
- API integration tests

FastAPI:

- Unit tests
- Agent tests
- Schema validation tests
- Speech service tests

Frontend:

- Component tests
- Critical flow tests

End-to-end:

Register
↓
Login
↓
Start session
↓
Send message
↓
Receive AI response
↓
Record speech
↓
Transcribe
↓
Analyze
↓
Receive correction
↓
Retry
↓
Finish session
↓
View progress

============================================================
27. DOCKER
============================================================

Create Dockerfiles for:

NestJS
FastAPI

Use docker-compose for local development.

Example local architecture:

Next.js
NestJS
FastAPI
PostgreSQL
Redis

All services should communicate through Docker networking.

Do not hardcode localhost assumptions into production code.

============================================================
28. DEPLOYMENT
============================================================

Production deployment should support:

Frontend:
Vercel

NestJS:
Docker/container deployment

FastAPI:
Docker/container deployment

Database:
Managed PostgreSQL

Redis:
Managed Redis

Storage:
S3-compatible object storage

Configure:

Development
Staging
Production

Use separate environment variables for each environment.

============================================================
29. CI/CD
============================================================

Create a GitHub Actions pipeline.

On pull request:

- Install dependencies
- Type check
- Lint
- Run tests
- Build

On production deployment:

- Build
- Run tests
- Deploy

Do not deploy if tests fail.

============================================================
30. API CONTRACT BETWEEN NESTJS AND FASTAPI
============================================================

Create a strict internal API contract.

Example:

NestJS → FastAPI:

POST /internal/v1/speech/transcribe

Request:

{
  "audioUrl": "...",
  "language": "en",
  "userId": "...",
  "sessionId": "..."
}

Response:

{
  "success": true,
  "transcript": "...",
  "confidence": 0.94,
  "duration": 8.4
}

Another endpoint:

POST /internal/v1/english/analyze

Request:

{
  "text": "...",
  "context": "...",
  "userLevel": "intermediate",
  "knownMistakes": []
}

Response:

{
  "correctedText": "...",
  "mistakes": [],
  "explanation": "...",
  "shouldRetry": true
}

NestJS owns persistence.

FastAPI performs AI/Python processing.

============================================================
31. IMPORTANT RESPONSIBILITY BOUNDARY
============================================================

NestJS owns:

- Authentication
- Users
- Authorization
- Sessions
- Database
- API gateway
- Business logic
- Persistence
- File upload orchestration
- AI orchestration
- FastAPI communication

FastAPI owns:

- AI processing
- Speech processing
- Python-specific AI utilities
- Agent execution
- NLP processing
- Pronunciation processing

Next.js owns:

- UI
- Client interactions
- Audio recording
- Rendering
- UX state

PostgreSQL owns:

- Permanent application data

Redis owns:

- Temporary state
- Queue
- Cache
- Rate limiting

Object storage owns:

- Audio/files

============================================================
32. DEVELOPMENT RULE
============================================================

Before writing code:

1. Inspect the repository.
2. Detect existing project structure.
3. Detect package manager.
4. Detect existing dependencies.
5. Detect existing environment setup.
6. Detect existing database configuration.
7. Detect whether Next.js/NestJS/FastAPI already exist.
8. Reuse existing infrastructure where appropriate.
9. Do not overwrite existing working code unnecessarily.

Then create an implementation plan.

After the plan, implement the project.

============================================================
33. CODE QUALITY
============================================================

Write production-quality TypeScript and Python.

Requirements:

- Strong typing
- DTO validation
- Clear interfaces
- Dependency injection
- Separation of concerns
- Reusable services
- No giant files
- No duplicated business logic
- No magic values
- No hardcoded secrets
- Proper error handling
- Proper logging

Do not create unnecessary abstractions.

Keep the architecture understandable.

============================================================
34. FINAL PRODUCT EXPERIENCE
============================================================

The final experience should feel like:

A personal AI English coach.

Not:

- A generic chatbot
- A complicated LMS
- A social network
- An analytics-heavy dashboard

The primary loop must be extremely fast:

START
↓
AI speaks/asks
↓
User speaks
↓
Transcript
↓
AI correction
↓
User repeats
↓
AI responds
↓
Conversation continues
↓
Mistake remembered
↓
Future practice adapts

============================================================
35. FINAL ACCEPTANCE CRITERIA
============================================================

The project is considered complete only when:

✓ Next.js frontend works
✓ NestJS is the public backend
✓ FastAPI is an internal AI service
✓ Frontend never directly calls FastAPI
✓ PostgreSQL works
✓ Prisma works
✓ Redis works
✓ Authentication works
✓ Conversation works
✓ Speech-to-text works
✓ Grammar analysis works
✓ Sentence correction works
✓ Retry workflow works
✓ Mistake memory works
✓ Progress works
✓ Mobile UI works
✓ Desktop UI works
✓ API validation works
✓ Error handling works
✓ Rate limiting exists
✓ Secrets are protected
✓ Docker works locally
✓ Health checks work
✓ Tests pass
✓ Production build succeeds

Do not stop after creating UI mockups.

Implement the actual end-to-end functionality.

If an external API key or service credential is required, create the correct environment variable and integration interface, but NEVER invent credentials.

If credentials are missing, keep the integration provider-agnostic and clearly document where the credential must be added.

The result must be a real working application, not a prototype made only of static screens.
```

### Recommended final architecture

```text
                         ┌──────────────────┐
                         │      User        │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │     Next.js      │
                         │   Web + Mobile   │
                         └────────┬─────────┘
                                  │
                         REST / WebSocket
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │         NestJS           │
                    │      API Gateway         │
                    │                          │
                    │ Auth | Practice | Users  │
                    │ AI   | Speech   | Stats  │
                    └───────┬──────────┬───────┘
                            │          │
                    Internal API       │
                            │          │
                            ▼          ▼
                    ┌────────────┐  ┌──────────┐
                    │  FastAPI   │  │  Redis   │
                    │ AI Engine  │  │ Cache/Q  │
                    └─────┬──────┘  └──────────┘
                          │
             ┌────────────┼─────────────┐
             ▼            ▼             ▼
            LLM          STT            TTS
             │            │             │
             └────────────┼─────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │  NestJS     │
                    │ Persistence │
                    └──────┬──────┘
                           │
                 ┌─────────┴─────────┐
                 ▼                   ▼
          ┌─────────────┐     ┌──────────────┐
          │ PostgreSQL  │     │ Object Store │
          │ + Prisma    │     │ Audio Files  │
          └─────────────┘     └──────────────┘
```

