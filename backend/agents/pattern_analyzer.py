from openai import AsyncOpenAI
from config import settings
import json

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

async def analyze_patterns(jobs: list) -> dict:
    """
    Analyze application outcomes to find what's working and what isn't.
    Returns a success profile and insights.
    """
    if not jobs:
        return {"error": "No jobs to analyze yet. Add more applications first."}

    # Separate into outcomes
    successes = [j for j in jobs if j.get("status") in ["phone_screen", "interview", "offer"]]
    rejections = [j for j in jobs if j.get("status") == "rejected"]
    pending    = [j for j in jobs if j.get("status") in ["saved", "applied"]]

    if len(successes) + len(rejections) < 3:
        return {
            "error": "Not enough outcome data yet.",
            "message": "You need at least 3 applications with outcomes (rejections or interview calls) before the pattern analyzer can find meaningful patterns. Keep logging your applications!",
            "total": len(jobs),
            "successes": len(successes),
            "rejections": len(rejections),
            "pending": len(pending)
        }

    def summarize_job(j):
        keywords = {}
        if j.get("parsed_keywords"):
            try:
                keywords = json.loads(j["parsed_keywords"])
            except:
                pass
        return {
            "company": j.get("company"),
            "role": j.get("role"),
            "status": j.get("status"),
            "remote": j.get("remote"),
            "sponsorship": j.get("sponsorship"),
            "location": j.get("location"),
            "salary_range": j.get("salary_range"),
            "required_skills": keywords.get("required_skills", []),
            "tech_stack": keywords.get("tech_stack", []),
            "level": keywords.get("level"),
            "domain": keywords.get("domain"),
        }

    success_summaries   = [summarize_job(j) for j in successes]
    rejection_summaries = [summarize_job(j) for j in rejections]

    prompt = f"""
You are a career data analyst. Analyze this person's job application outcomes and identify patterns.

APPLICATIONS THAT GOT RESPONSES (phone screen / interview / offer):
{json.dumps(success_summaries, indent=2)}

APPLICATIONS THAT WERE REJECTED OR GHOSTED:
{json.dumps(rejection_summaries, indent=2)}

Analyze the patterns and return ONLY valid JSON with this structure:
{{
  "summary": "2-3 sentence plain-English summary of what's working and what isn't",
  "success_rate": {{"total": 0, "successes": 0, "rejections": 0, "rate_percent": 0}},
  "winning_patterns": [
    {{"pattern": "what's working", "evidence": "specific examples", "confidence": "high/medium/low"}}
  ],
  "losing_patterns": [
    {{"pattern": "what's not working", "evidence": "specific examples", "confidence": "high/medium/low"}}
  ],
  "success_profile": {{
    "ideal_company_size": "startup/mid-size/enterprise/any",
    "ideal_domains": ["domain1", "domain2"],
    "ideal_tech_stack": ["tech1", "tech2"],
    "ideal_level": "junior/mid/senior",
    "remote_preference": true,
    "sponsorship_matters": true,
    "keywords_that_win": ["keyword1", "keyword2"]
  }},
  "top_recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ]
}}
"""

    resp = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        response_format={"type": "json_object"}
    )

    result = json.loads(resp.choices[0].message.content)
    result["raw_counts"] = {
        "total": len(jobs),
        "successes": len(successes),
        "rejections": len(rejections),
        "pending": len(pending)
    }
    return result
