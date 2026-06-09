from openai import AsyncOpenAI
from config import settings
import json

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def generate_questions(company: str, role: str,
                              job_description: str, resume: str = "") -> dict:
    """Generate tailored interview questions for a specific role."""
    prompt = f"""
You are an expert technical interviewer. Generate a realistic set of interview questions
for this specific role and company.

Company: {company}
Role: {role}
Job Description: {job_description[:1500] if job_description else "Not provided"}
Candidate Resume Summary: {resume[:800] if resume else "Not provided"}

Generate questions across 4 categories. Return ONLY valid JSON:
{{
  "intro": {{
    "label": "Opening questions",
    "questions": [
      {{"id": "i1", "question": "Tell me about yourself and why you're interested in this role.", "type": "behavioral", "tip": "Keep it under 2 minutes. End with why this company."}}
    ]
  }},
  "behavioral": {{
    "label": "Behavioral questions",
    "questions": [
      {{"id": "b1", "question": "Tell me about a time you...", "type": "behavioral", "tip": "Use STAR format: Situation, Task, Action, Result."}}
    ]
  }},
  "technical": {{
    "label": "Technical questions",
    "questions": [
      {{"id": "t1", "question": "How would you...", "type": "technical", "tip": "Think out loud. Mention trade-offs."}}
    ]
  }},
  "rolespecific": {{
    "label": "Role-specific questions",
    "questions": [
      {{"id": "r1", "question": "Question specific to this exact role...", "type": "technical", "tip": "Relevant tip."}}
    ]
  }}
}}

Rules:
- 2 questions per category (8 total)
- Make technical questions specific to the JD's tech stack
- Make behavioral questions relevant to the role level
- Role-specific questions should be hyper-targeted to this exact job
- Tips should be genuinely useful, not generic
"""
    resp = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        response_format={"type": "json_object"}
    )
    return json.loads(resp.choices[0].message.content)


async def evaluate_answer(question: str, answer: str,
                           role: str, question_type: str) -> dict:
    """Evaluate a candidate's answer and provide detailed feedback."""
    prompt = f"""
You are an experienced interviewer evaluating a candidate's answer.

Role: {role}
Question type: {question_type}
Question: {question}
Candidate's answer: {answer}

Evaluate the answer and return ONLY valid JSON:
{{
  "score": 7,
  "score_label": "Good",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["specific improvement 1", "specific improvement 2"],
  "star_check": {{
    "situation": true,
    "task": true,
    "action": true,
    "result": false,
    "note": "Missing quantified result — add a metric"
  }},
  "example_stronger_answer": "Here is a stronger version of this answer: ...",
  "keywords_used": ["keyword1"],
  "keywords_missing": ["keyword2"],
  "overall_feedback": "One paragraph of honest, constructive feedback"
}}

Scoring guide:
9-10: Exceptional — specific, quantified, compelling
7-8:  Good — clear and relevant, minor gaps
5-6:  Average — lacks specifics or structure
3-4:  Weak — vague or off-topic
1-2:  Poor — missing or irrelevant

For technical questions, skip the STAR check and focus on technical accuracy and depth.
"""
    resp = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        response_format={"type": "json_object"}
    )
    return json.loads(resp.choices[0].message.content)


async def generate_session_summary(evaluations: list, role: str, company: str) -> dict:
    """Generate an overall session summary from all evaluated answers."""
    prompt = f"""
You are a career coach reviewing a mock interview session.

Role: {role} at {company}
Number of questions answered: {len(evaluations)}

Individual scores and feedback:
{json.dumps([{{
    "question": e.get("question"),
    "score": e.get("score"),
    "type": e.get("type"),
    "improvements": e.get("improvements", [])
}} for e in evaluations], indent=2)}

Return ONLY valid JSON:
{{
  "overall_score": 7.2,
  "overall_label": "Good — ready with some prep",
  "ready_to_interview": true,
  "strongest_area": "Technical knowledge",
  "weakest_area": "Quantifying results in behavioral answers",
  "top_3_improvements": [
    "Specific improvement 1",
    "Specific improvement 2",
    "Specific improvement 3"
  ],
  "what_to_practice_next": "One specific thing to practice before the interview",
  "encouragement": "One genuine, specific encouraging sentence"
}}
"""
    resp = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        response_format={"type": "json_object"}
    )
    return json.loads(resp.choices[0].message.content)
