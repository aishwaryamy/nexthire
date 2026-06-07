from openai import AsyncOpenAI
from config import settings
import json

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

async def parse_jd(job_description: str) -> dict:
    """Extract structured info from a job description."""
    prompt = f"""
You are an expert job description analyzer. Extract structured information from this job description.

Return ONLY valid JSON with these fields:
{{
  "required_skills": ["skill1", "skill2"],
  "nice_to_have": ["skill1"],
  "level": "junior|mid|senior|staff",
  "team": "string or null",
  "key_responsibilities": ["responsibility1"],
  "keywords": ["keyword1", "keyword2"],
  "company_values": ["value1"],
  "sponsorship_mentioned": true|false,
  "sponsorship_text": "exact quote about sponsorship or null",
  "tech_stack": ["tech1", "tech2"],
  "domain": "fintech|healthtech|ai/ml|saas|etc"
}}

Job Description:
{job_description}
"""
    resp = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        response_format={"type": "json_object"}
    )
    return json.loads(resp.choices[0].message.content)
