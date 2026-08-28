# Daily English Lab

A production-ready, AI-powered English learning platform. Users improve their English through daily speaking, reading, grammar correction, and AI-driven conversation practice. The system evaluates mistakes, remembers them, and adapts every future session accordingly.

---

## Architecture

```
Browser
  └── Next.js (Frontend)
        └── NestJS (API Gateway — the only public backend)
              ├── PostgreSQL + Prisma (persistence)
              ├── Redis (cache, rate limiting, queue)
              └── FastAPI (internal AI engine — never exposed to clients)
                    ├── LLM (grammar correction, conversation)
                    ├── STT (speech-to-text)
                    └── TTS (text-to-speech)
```

**The frontend never communicates with FastAPI directly.** NestJS is the single public API gateway.

---

## Tech Stack

| Layer            | Technology                                          |
|------------------|-----------------------------------------------------|
| Frontend         | Next.js 14, TypeScript, React, Tailwind CSS         |
| Backend          | NestJS, TypeScript, REST + WebSocket                |
| AI Service       | FastAPI, Python 3.11+                               |
| Database         | PostgreSQL 15 + Prisma ORM                          |
| Cache / Queue    | Redis 7 + BullMQ                                    |
| Authentication   | JWT (access + refresh tokens, HTTP-only cookies)    |
| Object Storage   | S3-compatible (MinIO / AWS S3 / Cloudflare R2)      |

---

## Features

- **AI Conversation Practice** — speak with an AI coach that adjusts difficulty in real time
- **Grammar Correction** — every sentence is analyzed, corrected, and explained
- **Speech-to-Text** — record audio; the system transcribes and evaluates pronunciation
- **Mistake Memory** — the system tracks recurring mistakes and targets them in future sessions
- **Personalized Sessions** — future practice is shaped by your actual error history
- **Session Summaries** — see exactly what you practiced and what to work on tomorrow
- **Fix My English** — paste any text; get an improved version with explanations
- **Progress Tracking** — streak, minutes, sessions, improvement trends

---

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker + Docker Compose
- PostgreSQL 15 (or use Docker)
- Redis 7 (or use Docker)

### Local Development (Docker — recommended)

```bash
git clone https://github.com/MaryamMumtaz-piaic/daily-english-lab.git
cd daily-english-lab

# Copy and fill in your environment variables
cp .env.example .env

# Start all services
docker-compose up --build
```

Services will start at:
- Frontend: http://localhost:3000
- NestJS API: http://localhost:3001
- FastAPI (internal): http://localhost:8000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Manual Development

**1. Backend (NestJS)**
```bash
cd apps/backend
npm install
cp .env.example .env   # fill in values
npx prisma migrate dev
npm run start:dev
```

**2. AI Service (FastAPI)**
```bash
cd apps/ai-service
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

**3. Frontend (Next.js)**
```bash
cd apps/frontend
npm install
cp .env.example .env.local
npm run dev
```

---

## Environment Variables

See `.env.example` for all required variables. Never commit real credentials.

```env
DATABASE_URL=postgresql://user:password@localhost:5432/daily_english_lab
REDIS_URL=redis://localhost:6379

JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

FASTAPI_INTERNAL_URL=http://localhost:8000
FASTAPI_INTERNAL_API_KEY=your_internal_api_key_here

LLM_PROVIDER=openai
LLM_API_KEY=sk-...

STT_PROVIDER=openai-whisper
STT_API_KEY=sk-...

TTS_PROVIDER=openai-tts
TTS_API_KEY=sk-...

STORAGE_ENDPOINT=https://s3.amazonaws.com
STORAGE_ACCESS_KEY=...
STORAGE_SECRET_KEY=...
STORAGE_BUCKET=daily-english-lab-audio
```

---

## API Reference

All routes are versioned under `/api/v1/`.

### Authentication
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
```

### Practice Sessions
```
GET    /api/v1/practice/sessions
POST   /api/v1/practice/sessions
GET    /api/v1/practice/sessions/:id
POST   /api/v1/practice/sessions/:id/messages
POST   /api/v1/practice/sessions/:id/end
```

### Speech & Analysis
```
POST   /api/v1/speech/transcribe
POST   /api/v1/practice/analyze         # text analysis
```

### Progress & Mistakes
```
GET    /api/v1/progress
GET    /api/v1/mistakes
```

### Health
```
GET    /health
GET    /health/ready
GET    /health/live
```

---

## Project Structure

```
daily-english-lab/
├── apps/
│   ├── frontend/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   ├── dashboard/
│   │   │   ├── practice/
│   │   │   └── progress/
│   │   └── components/
│   │
│   ├── backend/
│   │   └── src/
│   │       ├── auth/
│   │       ├── users/
│   │       ├── practice/
│   │       ├── sessions/
│   │       ├── corrections/
│   │       ├── mistakes/
│   │       ├── progress/
│   │       ├── speech/
│   │       ├── ai/
│   │       ├── fastapi/
│   │       ├── storage/
│   │       └── health/
│   │
│   └── ai-service/
│       └── app/
│           ├── agents/
│           ├── services/
│           ├── api/
│           ├── schemas/
│           └── prompts/
│
├── packages/
│   └── shared-types/
│
├── docker-compose.yml
├── .env.example
├── CLAUDE.md
├── AGENT.md
└── README.md
```

---

## Testing

```bash
# NestJS unit + integration tests
cd apps/backend && npm run test && npm run test:e2e

# FastAPI tests
cd apps/ai-service && pytest

# Frontend component tests
cd apps/frontend && npm run test
```

---

## Deployment

| Service      | Target                             |
|--------------|------------------------------------|
| Frontend     | Vercel                             |
| NestJS       | Docker container (DigitalOcean, AWS, etc.) |
| FastAPI      | Docker container                   |
| PostgreSQL   | Managed PostgreSQL (Neon, Supabase, RDS) |
| Redis        | Managed Redis (Upstash, ElastiCache) |
| Storage      | AWS S3 or Cloudflare R2            |

---

## Security

- Argon2 password hashing
- JWT access tokens (15 min) + refresh tokens (7 days) with rotation
- HTTP-only cookies for refresh token storage
- Rate limiting on all public endpoints
- Helmet security headers
- CORS restricted to allowed origins
- File upload MIME validation and size limits
- FastAPI only accepts requests with valid internal API key
- No AI API keys in browser code

---

## License

MIT License — see [LICENSE](./LICENSE) for details.

Built by [Maryam Mumtaz](https://maryam-piaic.vercel.app)
