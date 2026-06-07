from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Job
from schemas import JobCreate, JobUpdate, JobOut, StatusUpdate

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

@router.get("/stats/summary")
def get_stats(db: Session = Depends(get_db)):
    jobs = db.query(Job).all()
    total = len(jobs)
    by_status = {}
    for j in jobs:
        by_status[j.status] = by_status.get(j.status, 0) + 1
    call_rate = 0
    if total > 0:
        interviews = by_status.get("interview", 0) + by_status.get("phone_screen", 0) + by_status.get("offer", 0)
        call_rate = round(interviews / total * 100, 1)
    return {"total": total, "by_status": by_status, "call_rate": call_rate}

@router.get("", response_model=List[JobOut])
def get_jobs(db: Session = Depends(get_db)):
    return db.query(Job).order_by(Job.created_at.desc()).all()

@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("", response_model=JobOut)
def create_job(payload: JobCreate, db: Session = Depends(get_db)):
    job = Job(**payload.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.patch("/{job_id}", response_model=JobOut)
def update_job(job_id: str, payload: JobUpdate, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(job, k, v)
    db.commit()
    db.refresh(job)
    return job

@router.patch("/{job_id}/status", response_model=JobOut)
def update_status(job_id: str, payload: StatusUpdate, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.status = payload.status
    db.commit()
    db.refresh(job)
    return job

@router.delete("/{job_id}")
def delete_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"ok": True}
