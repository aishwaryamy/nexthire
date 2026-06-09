from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Job
from agents.interview_prep import generate_questions, evaluate_answer, generate_session_summary
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/api/interview", tags=["interview"])


class PrepRequest(BaseModel):
    resume: Optional[str] = ""


class EvalRequest(BaseModel):
    question: str
    answer: str
    question_type: str = "behavioral"


class SummaryRequest(BaseModel):
    evaluations: List[dict]


@router.post("/questions/{job_id}")
async def get_questions(job_id: str, payload: PrepRequest,
                        db: Session = Depends(get_db)):
    """Generate interview questions for a specific job."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")

    questions = await generate_questions(
        company=job.company,
        role=job.role,
        job_description=job.job_description or "",
        resume=payload.resume or ""
    )
    return questions


@router.post("/evaluate/{job_id}")
async def eval_answer(job_id: str, payload: EvalRequest,
                      db: Session = Depends(get_db)):
    """Evaluate a single answer."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")

    result = await evaluate_answer(
        question=payload.question,
        answer=payload.answer,
        role=job.role,
        question_type=payload.question_type
    )
    return result


@router.post("/summary/{job_id}")
async def get_summary(job_id: str, payload: SummaryRequest,
                      db: Session = Depends(get_db)):
    """Generate session summary from all evaluated answers."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")

    summary = await generate_session_summary(
        evaluations=payload.evaluations,
        role=job.role,
        company=job.company
    )
    return summary
