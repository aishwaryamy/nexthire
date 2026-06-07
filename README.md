# JobHunt AI — Your AI Job Search Copilot

A full-stack AI-powered job hunt platform built with FastAPI + React + LangGraph.

## Features

- **Kanban board** — drag-and-drop job tracker (Saved → Applied → Interview → Offer)
- **AI cover letter generator** — personalized per company + role
- **Resume tailor** — rewrites your bullets to match JD keywords with before/after view
- **Cold email drafter** — subject line + body tuned for response rates
- **Contact finder** — finds and ranks who to reach out to via Hunter.io
- **JD parser** — extracts skills, tech stack, sponsorship info automatically

## Quick start (local, no Docker)

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env    # add your OPENAI_API_KEY
uvicorn main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev                # http://localhost:5173
```

## Quick start (Docker)

```bash
cp .env.example .env       # add your OPENAI_API_KEY
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | ✅ Yes | Powers all AI features |
| `ANTHROPIC_API_KEY` | No | Alternative LLM |
| `HUNTER_API_KEY` | No | Contact finder (25 free/month) |
| `DATABASE_URL` | No | Defaults to SQLite |

## Stack

**Backend** — FastAPI · SQLAlchemy · PostgreSQL/SQLite · OpenAI API · LangGraph  
**Frontend** — React 18 · Vite · React Router  
**Infrastructure** — Docker Compose · Redis

## Coming next (Phase 2+)

- [ ] Pattern analyzer — learns from your calls vs rejections
- [ ] Job discovery — scrapes and scores new roles against your success pattern
- [ ] Interview prep agent — triggered when status moves to Interview
