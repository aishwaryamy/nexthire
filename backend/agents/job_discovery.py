from openai import AsyncOpenAI
from config import settings
import httpx
import json

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

# ── Job Scraping ──────────────────────────────────────────────────────────────

async def fetch_jobs_from_serper(query: str, num: int = 10) -> list:
    """Search for job listings using Serper.dev web search."""
    if not settings.SERPER_API_KEY:
        return _mock_jobs()

    headers = {
        "X-API-KEY": settings.SERPER_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "q": query,
        "num": num,
        "tbs": "qdr:w"  # last week
    }

    async with httpx.AsyncClient(timeout=10) as http:
        try:
            resp = await http.post("https://google.serper.dev/search",
                                   json=payload, headers=headers)
            data = resp.json()
        except Exception:
            return _mock_jobs()

    results = []
    for item in data.get("organic", []):
        title = item.get("title", "")
        snippet = item.get("snippet", "")
        link = item.get("link", "")

        # Basic company/role extraction from title
        company, role = _parse_title(title)
        results.append({
            "title": title,
            "company": company,
            "role": role,
            "snippet": snippet,
            "url": link,
            "source": "web_search"
        })

    return results


def _parse_title(title: str) -> tuple:
    """Try to extract role and company from a job listing title."""
    separators = [" at ", " @ ", " - ", " | "]
    for sep in separators:
        if sep.lower() in title.lower():
            parts = title.split(sep, 1)
            return parts[1].strip(), parts[0].strip()
    return "Unknown Company", title


def _mock_jobs() -> list:
    """Return sample jobs when no Serper API key is configured."""
    return [
        {
            "title": "Machine Learning Engineer at Cohere",
            "company": "Cohere",
            "role": "Machine Learning Engineer",
            "snippet": "Build and deploy large language models. Python, PyTorch, distributed training, RAG pipelines.",
            "url": "https://cohere.com/careers",
            "source": "mock"
        },
        {
            "title": "AI Engineer at Scale AI",
            "company": "Scale AI",
            "role": "AI Engineer",
            "snippet": "Work on data pipelines and model evaluation. FastAPI, Python, LLMs, evaluation frameworks.",
            "url": "https://scale.com/careers",
            "source": "mock"
        },
        {
            "title": "ML Engineer - LLM Infra at Mistral AI",
            "company": "Mistral AI",
            "role": "ML Engineer - LLM Infra",
            "snippet": "Build infrastructure for training and serving LLMs. PyTorch, CUDA, distributed systems.",
            "url": "https://mistral.ai/careers",
            "source": "mock"
        },
        {
            "title": "Applied ML Engineer at Hugging Face",
            "company": "Hugging Face",
            "role": "Applied ML Engineer",
            "snippet": "Work on transformers, fine-tuning, and deployment. Python, PyTorch, HuggingFace ecosystem.",
            "url": "https://huggingface.co/jobs",
            "source": "mock"
        },
        {
            "title": "Senior ML Engineer at Weights & Biases",
            "company": "Weights & Biases",
            "role": "Senior ML Engineer",
            "snippet": "Build MLOps tooling for experiment tracking. Python, PyTorch, FastAPI, distributed training.",
            "url": "https://wandb.ai/careers",
            "source": "mock"
        },
    ]


# ── Job Scoring ───────────────────────────────────────────────────────────────

async def score_jobs(jobs: list, success_profile: dict, resume: str = "") -> list:
    """
    Score a list of job listings against the user's success profile.
    Returns jobs sorted by match score.
    """
    if not jobs:
        return []

    prompt = f"""
You are a career matching expert. Score each job listing against this person's success profile.

SUCCESS PROFILE (what gets them interviews):
{json.dumps(success_profile, indent=2)}

RESUME SUMMARY:
{resume[:800] if resume else "Not provided"}

JOB LISTINGS TO SCORE:
{json.dumps([{
    "id": i,
    "company": j.get("company"),
    "role": j.get("role"),
    "snippet": j.get("snippet", "")
} for i, j in enumerate(jobs)], indent=2)}

For each job, return a score from 0-100 based on how well it matches the success profile.
Consider: tech stack alignment, role level match, company type, domain relevance.

Return ONLY valid JSON:
{{
  "scores": [
    {{
      "id": 0,
      "score": 85,
      "match_reasons": ["reason1", "reason2"],
      "concerns": ["concern1"],
      "apply_priority": "high/medium/low",
      "why": "One sentence explanation"
    }}
  ]
}}
"""

    resp = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        response_format={"type": "json_object"}
    )

    result = json.loads(resp.choices[0].message.content)
    scores_map = {s["id"]: s for s in result.get("scores", [])}

    # Merge scores back into job listings
    scored = []
    for i, job in enumerate(jobs):
        score_data = scores_map.get(i, {"score": 50, "match_reasons": [], "concerns": [], "apply_priority": "medium", "why": ""})
        scored.append({**job, **score_data})

    # Sort by score descending
    scored.sort(key=lambda x: x.get("score", 0), reverse=True)
    return scored


async def build_search_query(success_profile: dict) -> str:
    """Build a job search query from the success profile."""
    tech = success_profile.get("keywords_that_win", [])[:3]
    domains = success_profile.get("ideal_domains", [])[:2]
    level = success_profile.get("ideal_level", "")
    remote = success_profile.get("remote_preference", False)

    parts = []
    if level and level != "any":
        parts.append(level)
    parts.append("machine learning engineer")
    if tech:
        parts.extend(tech[:2])
    if remote:
        parts.append("remote")
    if domains:
        parts.extend(domains[:1])
    parts.append("job 2026")

    return " ".join(parts)
