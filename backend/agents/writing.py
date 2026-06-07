from openai import AsyncOpenAI
from config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

# ── Cover Letter ──────────────────────────────────────────────────────────────

async def generate_cover_letter(company: str, role: str, job_description: str,
                                 resume: str, applicant_name: str) -> str:
    prompt = f"""
You are an expert career coach helping write compelling cover letters.

Write a professional, personalized cover letter for this application.
- Keep it to 3 concise paragraphs (under 300 words total)
- Opening: specific hook mentioning the company and role, why you're excited
- Middle: 2-3 strongest achievements from resume that directly match JD requirements
- Closing: confident call to action

Tone: professional but warm, confident not arrogant, specific not generic.
Do NOT use clichés like "I am writing to express my interest" or "I would be a great fit".

Applicant: {applicant_name}
Company: {company}
Role: {role}

Resume:
{resume}

Job Description:
{job_description}

Write only the cover letter body (no subject line, no date, no address blocks).
"""
    resp = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    return resp.choices[0].message.content.strip()


# ── Resume Tailor ─────────────────────────────────────────────────────────────

async def tailor_resume(resume: str, job_description: str) -> dict:
    prompt = f"""
You are an expert resume coach. Your job is to tailor a resume to a specific job description.

Analyze the job description for:
1. Key required skills and keywords
2. Preferred qualifications
3. Tone and language used

Then rewrite the EXPERIENCE bullet points to:
- Mirror JD keywords naturally (not keyword stuffing)
- Emphasize the most relevant achievements
- Use strong action verbs matching the JD's language
- Quantify impact wherever possible

Return ONLY valid JSON:
{{
  "analysis": {{
    "matching_skills": ["skill1"],
    "missing_keywords": ["keyword1"],
    "match_score": 85
  }},
  "tailored_bullets": [
    {{
      "original": "original bullet text",
      "tailored": "rewritten bullet text",
      "reason": "why this change improves match"
    }}
  ],
  "skills_to_highlight": ["skill1", "skill2"],
  "summary_suggestion": "optional 2-sentence professional summary tailored to this role"
}}

Resume:
{resume}

Job Description:
{job_description}
"""
    resp = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        response_format={"type": "json_object"}
    )
    import json
    return json.loads(resp.choices[0].message.content)


# ── Email Drafter ─────────────────────────────────────────────────────────────

async def draft_outreach_email(company: str, role: str,
                                contact_name: str | None,
                                contact_title: str | None,
                                resume_summary: str | None,
                                applicant_name: str) -> dict:
    name_part = f"Hi {contact_name.split()[0]}," if contact_name else "Hi there,"
    title_context = f"I saw you're a {contact_title} at {company}." if contact_title else f"I came across your profile at {company}."

    prompt = f"""
Write a short, genuine cold outreach email from a job seeker to someone at a company.

Rules:
- Max 120 words total
- Sound like a real person, not a template
- ONE specific thing about the company that shows genuine research
- ONE strongest relevant achievement (quantified)
- ONE clear ask (15-min call OR referral for the role)
- Subject line that gets opened (not "Job Application")
- Do NOT say "I hope this email finds you well"
- Do NOT attach anything in the email body

Return JSON:
{{
  "subject": "email subject line",
  "body": "full email body"
}}

Applicant: {applicant_name}
Company: {company}
Role applying for: {role}
Contact: {contact_name or "Unknown"} ({contact_title or "Unknown title"})
Applicant background summary: {resume_summary or "ML Engineer with RAG and LLM experience"}
"""
    resp = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        response_format={"type": "json_object"}
    )
    import json
    return json.loads(resp.choices[0].message.content)
