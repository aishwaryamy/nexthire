from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Job
from agents.pattern_analyzer import analyze_patterns
from agents.job_discovery import fetch_jobs_from_serper, score_jobs, build_search_query
from pydantic import BaseModel
from typing import Optional
import json

router = APIRouter(prefix="/api/discover", tags=["discover"])

class DiscoverRequest(BaseModel):
    resume: Optional[str] = ""
    custom_query: Optional[str] = None

@router.get("/patterns")
async def get_patterns(db: Session = Depends(get_db)):
    """Analyze application patterns from all tracked jobs."""
    jobs = db.query(Job).all()
    jobs_data = []
    for j in jobs:
        jobs_data.append({
            "company": j.company,
            "role": j.role,
            "status": j.status,
            "remote": j.remote,
            "sponsorship": j.sponsorship,
            "location": j.location,
            "salary_range": j.salary_range,
            "parsed_keywords": j.parsed_keywords,
        })
    result = await analyze_patterns(jobs_data)
    return result

@router.post("/jobs")
async def discover_jobs(payload: DiscoverRequest, db: Session = Depends(get_db)):
    """
    Find and score new job listings based on your success pattern.
    If no pattern exists yet, uses general ML/AI role search.
    """
    # Try to get success profile from pattern analysis
    jobs = db.query(Job).all()
    jobs_data = [{"company": j.company, "role": j.role, "status": j.status,
                  "remote": j.remote, "sponsorship": j.sponsorship,
                  "location": j.location, "parsed_keywords": j.parsed_keywords}
                 for j in jobs]

    pattern_result = await analyze_patterns(jobs_data)
    success_profile = pattern_result.get("success_profile", {})

    # Build search query
    if payload.custom_query:
        query = payload.custom_query
    elif success_profile:
        query = await build_search_query(success_profile)
    else:
        query = "machine learning engineer LLM RAG FastAPI 2026 job"

    # Fetch job listings
    raw_jobs = await fetch_jobs_from_serper(query, num=10)

    # Score them against success profile
    scored = await score_jobs(raw_jobs, success_profile, payload.resume or "")

    return {
        "query_used": query,
        "success_profile": success_profile,
        "jobs": scored,
        "total": len(scored)
    }

@router.get("/stats")
async def get_discovery_stats(db: Session = Depends(get_db)):
    """Quick stats for the discover page header."""
    jobs = db.query(Job).all()
    total = len(jobs)
    successes = sum(1 for j in jobs if j.status in ["phone_screen", "interview", "offer"])
    rejections = sum(1 for j in jobs if j.status == "rejected")
    pending = sum(1 for j in jobs if j.status in ["saved", "applied"])
    rate = round(successes / total * 100, 1) if total > 0 else 0
    return {
        "total": total,
        "successes": successes,
        "rejections": rejections,
        "pending": pending,
        "call_rate": rate,
        "has_enough_data": (successes + rejections) >= 3
    }
