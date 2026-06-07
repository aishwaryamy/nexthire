from sqlalchemy import Column, String, Text, DateTime, Boolean, Integer, Float, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from database import Base
import uuid
import enum

class JobStatus(str, enum.Enum):
    SAVED      = "saved"
    APPLIED    = "applied"
    PHONE      = "phone_screen"
    INTERVIEW  = "interview"
    OFFER      = "offer"
    REJECTED   = "rejected"

class Job(Base):
    __tablename__ = "jobs"

    id              = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    company         = Column(String(255), nullable=False)
    role            = Column(String(255), nullable=False)
    status          = Column(String(50), default=JobStatus.SAVED)
    job_url         = Column(Text)
    job_description = Column(Text)
    location        = Column(String(255))
    remote          = Column(Boolean, default=False)
    salary_range    = Column(String(100))
    sponsorship     = Column(Boolean, default=False)
    notes           = Column(Text)

    # AI-generated content
    parsed_keywords      = Column(Text)   # JSON string
    cover_letter         = Column(Text)
    tailored_resume      = Column(Text)
    outreach_email_draft = Column(Text)

    # Contacts
    contact_name    = Column(String(255))
    contact_email   = Column(String(255))
    contact_title   = Column(String(255))
    contact_linkedin= Column(String(500))
    contacts_json   = Column(Text)   # JSON list of found contacts

    # Tracking
    priority        = Column(Integer, default=2)   # 1=high 2=medium 3=low
    match_score     = Column(Float)                # ML match score
    applied_at      = Column(DateTime)
    interview_at    = Column(DateTime)
    created_at      = Column(DateTime, server_default=func.now())
    updated_at      = Column(DateTime, server_default=func.now(), onupdate=func.now())
