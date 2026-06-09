# NextHire — AI Job Search Copilot

> Job searching is one of the most important things you'll do in your career — and it deserves better tooling. I built NextHire to give every job seeker a personal AI copilot: one place to track your applications, generate tailored cover letters, find the right people to reach out to, understand what's actually working in your search, and walk into every interview prepared. NextHire is my attempt to fix all of that in one place.

Live demo: https://nexthire-46nl.onrender.com

---

## What it does

**Job board** — A Kanban-style tracker that moves your applications through Saved → Applied → Phone Screen → Interview → Offer → Rejected. Drag and drop cards between columns, filter by priority, remote, or visa sponsorship, and never lose track of where you stand.

**AI cover letter generator** — Paste a job description and your resume, and get a personalized cover letter in seconds. Not a generic template — it pulls specific details from the JD and matches your experience to what the company is actually asking for.

**Resume tailor** — Reads the JD, finds the keywords your resume is missing, and rewrites your experience bullets to mirror the language the company uses. You get a before/after view of every changed bullet and a match score so you know how well your resume fits before you apply.

**Cold email drafter** — Generates a short, genuine outreach email to someone at the company. Subject line included. Under 120 words. Doesn't sound like a template.

**Contact finder** — Searches Hunter.io for people at the company, ranks them by relevance (hiring managers and engineering leads first), and shows their email and LinkedIn.

**JD parser** — Automatically extracts required skills, tech stack, sponsorship info, and keywords from any job description.

**Pattern analyzer** — After you've logged enough applications, analyzes your outcomes to find what's getting you interviews vs rejections. Builds a success profile from your data.

**Job discovery** — Uses your success profile to search for and score new job listings, so the roles most likely to get you calls bubble to the top.

**Interview prep agent** — Triggered when a job moves to Interview status. Generates 8 role-specific questions (behavioral + technical), evaluates your answers with STAR format checking and a score out of 10, and produces a full session summary at the end.

---

## Screenshots

### Job Board
![Kanban Board](screenshots/board.png)

### Job Detail + AI Tools
![Job Detail](screenshots/job-detail.png)

### Cover Letter Generator
![Cover Letter](screenshots/cover-letter.png)

### Resume Tailor — Before/After
![Tailored Resume](screenshots/tailor.png)

### Outreach — Contact Finder + Email Draft
![Outreach](screenshots/outreach.png)

---

## Running it locally

```bash
# Backend
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env       # add your API keys
uvicorn main:app --reload --port 8000
```

```bash
# Frontend
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

Health check: `http://localhost:8000/api/health`

---

## Environment variables

| Variable | Required | What it's for |
|---|---|---|
| `OPENAI_API_KEY` | ✅ Yes | Powers all AI features |
| `HUNTER_API_KEY` | No | Contact finder — 25 free searches/month at hunter.io |
| `ANTHROPIC_API_KEY` | No | Alternative LLM (Claude) |
| `DATABASE_URL` | No | Defaults to SQLite — use PostgreSQL URL for production |
| `SMTP_EMAIL` | No | Gmail address for job alert emails |
| `SMTP_PASSWORD` | No | Gmail App Password |
| `ALERT_EMAIL` | No | Email to send job alerts to |
| `APP_URL` | No | Your deployed URL |

---

## How it's put together

**Backend** — FastAPI proxies all AI calls so your API key never reaches the browser. SQLAlchemy with SQLite locally and Postgres in production — same code, one env var.

**Frontend** — React 18 + Vite. Calls `/api/...` which Vite proxies in dev and FastAPI serves in production.

**AI** — OpenAI GPT-4o for all generation and analysis tasks.

**Infrastructure** — Docker Compose for local dev, deployed on Render.

---

## Roadmap

- [x] Kanban job tracker with drag and drop
- [x] AI cover letter generator
- [x] Resume tailor with match scoring and bullet rewrites
- [x] Cold email drafter
- [x] Contact finder via Hunter.io
- [x] JD parser — skills, tech stack, sponsorship detection
- [x] Pattern analyzer — learns from calls vs rejections
- [x] Job discovery — scores new roles against your success profile
- [x] Interview prep agent — STAR scoring and session summary
- [x] Analytics dashboard — funnel charts and response rate trends
- [x] Email job alerts — notifies when high-scoring roles are found
- [x] Live deployment on Render
