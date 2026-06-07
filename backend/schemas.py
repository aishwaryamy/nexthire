from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime

class JobCreate(BaseModel):
    company: str
    role: str
    job_url: Optional[str] = None
    job_description: Optional[str] = None
    location: Optional[str] = None
    remote: bool = False
    salary_range: Optional[str] = None
    sponsorship: bool = False
    notes: Optional[str] = None
    priority: int = 2

class JobUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    job_url: Optional[str] = None
    job_description: Optional[str] = None
    location: Optional[str] = None
    remote: Optional[bool] = None
    salary_range: Optional[str] = None
    sponsorship: Optional[bool] = None
    notes: Optional[str] = None
    priority: Optional[int] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_title: Optional[str] = None
    contact_linkedin: Optional[str] = None
    applied_at: Optional[datetime] = None
    interview_at: Optional[datetime] = None
    cover_letter: Optional[str] = None
    tailored_resume: Optional[str] = None
    outreach_email_draft: Optional[str] = None

class JobOut(BaseModel):
    id: str
    company: str
    role: str
    status: str
    job_url: Optional[str]
    job_description: Optional[str]
    location: Optional[str]
    remote: bool
    salary_range: Optional[str]
    sponsorship: bool
    notes: Optional[str]
    parsed_keywords: Optional[str]
    cover_letter: Optional[str]
    tailored_resume: Optional[str]
    outreach_email_draft: Optional[str]
    contact_name: Optional[str]
    contact_email: Optional[str]
    contact_title: Optional[str]
    contact_linkedin: Optional[str]
    contacts_json: Optional[str]
    priority: int
    match_score: Optional[float]
    applied_at: Optional[datetime]
    interview_at: Optional[datetime]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class AIRequest(BaseModel):
    job_id: str
    resume: Optional[str] = None   # raw resume text

class CoverLetterRequest(BaseModel):
    job_description: str
    company: str
    role: str
    resume: str
    applicant_name: str = "Aishwarya Mandya Yogananda"

class ResumeTailorRequest(BaseModel):
    job_description: str
    resume: str

class EmailDraftRequest(BaseModel):
    company: str
    role: str
    contact_name: Optional[str] = None
    contact_title: Optional[str] = None
    resume_summary: Optional[str] = None
    applicant_name: str = "Aishwarya Mandya Yogananda"

class ContactSearchRequest(BaseModel):
    company: str
    domain: Optional[str] = None
    role: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str
