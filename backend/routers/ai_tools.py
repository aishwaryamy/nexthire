from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Job
from schemas import (CoverLetterRequest, ResumeTailorRequest,
                     EmailDraftRequest, ContactSearchRequest, AIRequest)
from agents.jd_parser import parse_jd
from agents.writing import generate_cover_letter, tailor_resume, draft_outreach_email
from agents.contacts import find_contacts
from urllib.parse import urlparse
import json

router = APIRouter(prefix="/api/ai", tags=["ai"])

def extract_domain(job_url: str | None, company: str) -> str | None:
    """Extract domain from job URL, or derive from company name."""
    if job_url:
        try:
            parsed = urlparse(job_url)
            hostname = parsed.hostname or ""
            # Remove www. prefix
            domain = hostname.replace("www.", "")
            # Filter out job board domains
            job_boards = ["linkedin.com", "indeed.com", "glassdoor.com",
                          "greenhouse.io", "lever.co", "workday.com",
                          "myworkdayjobs.com", "jobs.com", "ziprecruiter.com",
                          "wellfound.com", "angel.co"]
            if domain and not any(jb in domain for jb in job_boards):
                return domain
        except:
            pass
    return None  # Fall back to company name guessing in contacts.py

@router.post("/parse-jd/{job_id}")
async def parse_job_description(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")
    if not job.job_description:
        raise HTTPException(400, "No job description saved for this job")

    result = await parse_jd(job.job_description)
    job.parsed_keywords = json.dumps(result)
    job.sponsorship = result.get("sponsorship_mentioned", False)
    db.commit()
    return result

@router.post("/cover-letter")
async def create_cover_letter(payload: CoverLetterRequest, db: Session = Depends(get_db)):
    letter = await generate_cover_letter(
        company=payload.company,
        role=payload.role,
        job_description=payload.job_description,
        resume=payload.resume,
        applicant_name=payload.applicant_name
    )
    return {"cover_letter": letter}

@router.post("/cover-letter/{job_id}")
async def create_cover_letter_for_job(job_id: str, payload: AIRequest,
                                       db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")
    if not job.job_description:
        raise HTTPException(400, "No job description saved")
    if not payload.resume:
        raise HTTPException(400, "Resume text required")

    letter = await generate_cover_letter(
        company=job.company,
        role=job.role,
        job_description=job.job_description,
        resume=payload.resume,
        applicant_name="Aishwarya Mandya Yogananda"
    )
    job.cover_letter = letter
    db.commit()
    return {"cover_letter": letter}

@router.post("/tailor-resume/{job_id}")
async def tailor_resume_for_job(job_id: str, payload: AIRequest,
                                 db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")
    if not job.job_description:
        raise HTTPException(400, "No job description saved")
    if not payload.resume:
        raise HTTPException(400, "Resume text required")

    result = await tailor_resume(resume=payload.resume,
                                  job_description=job.job_description)
    job.tailored_resume = json.dumps(result)
    db.commit()
    return result

@router.post("/draft-email/{job_id}")
async def draft_email_for_job(job_id: str, payload: AIRequest,
                               db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")

    result = await draft_outreach_email(
        company=job.company,
        role=job.role,
        contact_name=job.contact_name,
        contact_title=job.contact_title,
        resume_summary=payload.resume[:500] if payload.resume else None,
        applicant_name="Aishwarya Mandya Yogananda"
    )
    combined = f"Subject: {result['subject']}\n\n{result['body']}"
    job.outreach_email_draft = combined
    db.commit()
    return result

@router.post("/find-contacts/{job_id}")
async def find_contacts_for_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")

    # Try to extract domain from job URL first
    domain = extract_domain(job.job_url, job.company)

    contacts = await find_contacts(company=job.company, domain=domain, role=job.role)
    job.contacts_json = json.dumps(contacts)

    # Auto-set top contact
    if contacts and contacts[0].get("email"):
        top = contacts[0]
        job.contact_name  = top.get("name")
        job.contact_email = top.get("email")
        job.contact_title = top.get("title")

    db.commit()
    return {"contacts": contacts, "domain_used": domain or f"{job.company.lower().replace(' ','')}.com"}
