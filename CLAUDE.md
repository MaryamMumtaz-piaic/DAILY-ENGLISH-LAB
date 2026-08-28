# Daily English Lab — CLAUDE.md

> Instructions for AI assistants working in this codebase. Read this file before writing any code.

---

## Project Overview

**Daily English Lab** is a production-ready, AI-powered English learning platform. It helps users improve English through daily speaking, reading, grammar correction, and AI conversation practice. The system actively evaluates mistakes, remembers them, and adapts future practice accordingly.

This is NOT a chatbot. It is a full AI coaching system.

---

## Monorepo Structure

```
daily-english-lab/
├── apps/
│   ├── frontend/          # Next.js 14+ — TypeScript, Tailwind CSS
│   ├── backend/           # NestJS — REST + WebSocket API gateway
│   └── ai-service/        # FastAPI — internal AI/Python engine
├── packages/
│   └── shared-types/      # Shared TypeScript interfaces
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── .github/
│   └── workflows/
├── CLAUDE.md
├── AGENT.md
└── README.md
```

---

## Technology Stack

| Layer            | Technology                                        |
|------------------|---------------------------------------------------|
| Frontend         | Next.js 14+, TypeScript, React, Tailwind CSS      |
| Main Backend     | NestJS, TypeScript, REST + WebSocket              |
| AI Backend       | FastAPI, Python 3.11+                             |
| Database         | PostgreSQL 15+ with Prisma ORM                    |
| Cache / Queue    | Redis 7+                                          |
| Authentication   | JWT (access + refresh tokens, HTTP-only cookies)  |
| Object Storage   | S3-compatible (MinIO locally, S3/R2 in production)|
| Background Jobs  | BullMQ (backed by Redis)                          |

---

## Architecture Laws — Never Violate

1. **Frontend → NestJS only.** Next.js must never call FastAPI directly, ever.
2. **NestJS is the sole public API gateway.** Every browser request goes through NestJS.
3. **FastAPI is internal-only.** Protected by `X-Internal-API-Key`. Not exposed to clients.
4. **Never expose AI API keys to the browser.** All LLM calls are server-side: NestJS → FastAPI → LLM.
5. **Never trust client-provided userId.** Always derive the authenticated user from the validated JWT in guards.
6. **Audio files go to object storage.** Never store audio blobs in PostgreSQL.
7. **PostgreSQL is the source of truth.** Redis is ephemeral. Design accordingly.

---

## Development Commands

### Frontend
```bash
cd apps/frontend
npm install
npm run dev          # http://localhost:3000
npm run build
npm run type-check
npm run lint
```

### Backend (NestJS)
```bash
cd apps/backend
npm install
npm run start:dev    # http://localhost:3001
npm run test
npm run test:e2e
npx prisma migrate dev
npx prisma studio
```

### AI Service (FastAPI)
```bash
cd apps/ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
pytest
```

### Full Stack (Docker Compose)
```bash
docker-compose up --build          # start all services
docker-compose down -v             # stop and remove volumes
```

---

## Environment Variables

Copy `.env.example` to `.env` in each app directory. **Never commit real credentials.**

See `.env.example` in the root for all required variables. Key secrets:
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`
- `DATABASE_URL`
- `REDIS_URL`
- `FASTAPI_INTERNAL_URL` + `FASTAPI_INTERNAL_API_KEY`
- `LLM_API_KEY`
- `STT_API_KEY` / `TTS_API_KEY`
- `STORAGE_*` variables

---

## NestJS Code Rules

**Controllers must be thin.** No business logic inside controllers.

```
Controller → Service → Repository (Prisma) → External services
```

- Use `@UseGuards(JwtAuthGuard)` on all protected routes
- Use `@GetUser()` decorator to extract authenticated user — never read `req.body.userId`
- All DTOs use `class-validator` decorators
- All services use constructor-based dependency injection
- Use `ConfigService` — never `process.env` directly in service code
- Use `@nestjs/throttler` for rate limiting
- Use structured logging via NestJS Logger, never `console.log`

**API Response Format (always):**
```typescript
// Success
{ success: true, data: T, error: null, meta?: Record<string, unknown> }

// Error
{ success: false, data: null, error: { code: string, message: string } }
```

**Route versioning:** All routes use `/api/v1/` prefix.

---

## FastAPI Code Rules

- All endpoints prefixed with `/internal/v1/`
- Every request validated with Pydantic schemas
- Internal API key checked via middleware on every request
- Agents live in `app/agents/` — one file per agent
- Services (LLM, STT, TTS) live in `app/services/` — injected into agents
- Never perform database operations in FastAPI — NestJS owns persistence
- Use `structlog` or Python `logging` with structured output
- Return concise, user-facing explanations — never raw LLM chain-of-thought

---

## Database Schema Summary

All models use UUID primary keys and `createdAt` / `updatedAt` timestamps.

| Model             | Purpose                                      |
|-------------------|----------------------------------------------|
| `User`            | Authenticated users                          |
| `RefreshToken`    | Stored refresh tokens for rotation           |
| `PracticeSession` | A single practice session                    |
| `PracticeMessage` | Messages within a session (AI + user turns)  |
| `SpeechAttempt`   | Recorded speech attempts with storage URL    |
| `Correction`      | AI correction for a speech/text attempt      |
| `Mistake`         | Master mistake type catalog                  |
| `UserMistake`     | User's history for a specific mistake type   |
| `ProgressSnapshot`| Session-end progress summary                 |

Indexes on: `userId`, `sessionId`, `createdAt`, `mistakeType`.

---

## AI Agent Summary

See `AGENT.md` for full agent architecture details.

| Agent                  | Responsibility                                              |
|------------------------|-------------------------------------------------------------|
| `ConversationAgent`    | Drives practice conversations, adapts difficulty             |
| `EnglishCoachAgent`    | Grammar analysis, correction, mistake classification         |
| `ProgressAgent`        | Session analysis, trend detection, recommendations           |

---

## Security Checklist

Before any PR merges, verify:

- [ ] CORS configured to allowed origins only (not `*` in production)
- [ ] Helmet security headers enabled on NestJS
- [ ] Rate limiting applied on all public endpoints
- [ ] File uploads: MIME type validation + file size limits enforced
- [ ] No sensitive data in logs (passwords, tokens, API keys)
- [ ] FastAPI rejects any request without a valid `X-Internal-API-Key`
- [ ] Access tokens expire in 15 minutes; refresh tokens expire in 7 days with rotation
- [ ] `userId` in any request body is ignored — only JWT-derived user is trusted

---

## Do Not

- Do not put any logic in controllers beyond input validation and calling a service
- Do not write `any` in TypeScript unless absolutely unavoidable
- Do not call FastAPI from the frontend
- Do not store audio files in PostgreSQL
- Do not hardcode secrets or connection strings
- Do not log raw audio transcripts, passwords, or tokens
- Do not create a new abstraction unless three or more concrete cases require it
- Do not use `console.log` — use the NestJS Logger or Python logging

---

*Maintained by Maryam Mumtaz — Daily English Lab*
