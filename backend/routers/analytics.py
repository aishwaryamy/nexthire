from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Job
from datetime import datetime, timedelta
from collections import defaultdict
import json

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

STATUSES = ["saved", "applied", "phone_screen", "interview", "offer", "rejected"]
STATUS_LABELS = {
    "saved": "Saved", "applied": "Applied", "phone_screen": "Phone Screen",
    "interview": "Interview", "offer": "Offer", "rejected": "Rejected"
}

@router.get("/funnel")
def get_funnel(db: Session = Depends(get_db)):
    jobs = db.query(Job).all()
    counts = defaultdict(int)
    for j in jobs:
        counts[j.status] += 1

    funnel = []
    active_statuses = ["saved","applied","phone_screen","interview","offer"]
    for s in active_statuses:
        funnel.append({"status": s, "label": STATUS_LABELS[s], "count": counts[s]})

    total_applied = sum(counts[s] for s in ["applied","phone_screen","interview","offer","rejected"])
    total_responses = sum(counts[s] for s in ["phone_screen","interview","offer"])
    response_rate = round(total_responses / total_applied * 100, 1) if total_applied > 0 else 0

    return {
        "funnel": funnel,
        "rejected": counts["rejected"],
        "total": len(jobs),
        "total_applied": total_applied,
        "total_responses": total_responses,
        "response_rate": response_rate,
    }

@router.get("/timeline")
def get_timeline(db: Session = Depends(get_db)):
    jobs = db.query(Job).filter(Job.created_at != None).all()

    # Group by week
    weekly = defaultdict(lambda: {"applied": 0, "responses": 0})
    for j in jobs:
        if not j.created_at:
            continue
        # Get Monday of the week
        week_start = j.created_at - timedelta(days=j.created_at.weekday())
        week_key = week_start.strftime("%b %d")
        weekly[week_key]["applied"] += 1
        if j.status in ["phone_screen", "interview", "offer"]:
            weekly[week_key]["responses"] += 1

    # Sort by date and return last 8 weeks
    sorted_weeks = sorted(weekly.items())[-8:]
    return [{"week": k, "applied": v["applied"], "responses": v["responses"]}
            for k, v in sorted_weeks]

@router.get("/by-domain")
def get_by_domain(db: Session = Depends(get_db)):
    jobs = db.query(Job).all()
    domain_stats = defaultdict(lambda: {"total": 0, "responses": 0})

    for j in jobs:
        domain = "Unknown"
        if j.parsed_keywords:
            try:
                kw = json.loads(j.parsed_keywords)
                domain = kw.get("domain", "Unknown") or "Unknown"
            except:
                pass
        domain = domain.replace("/", " / ").title()
        domain_stats[domain]["total"] += 1
        if j.status in ["phone_screen", "interview", "offer"]:
            domain_stats[domain]["responses"] += 1

    result = []
    for domain, stats in domain_stats.items():
        if stats["total"] >= 1:
            rate = round(stats["responses"] / stats["total"] * 100, 0)
            result.append({
                "domain": domain,
                "total": stats["total"],
                "responses": stats["responses"],
                "rate": rate
            })

    return sorted(result, key=lambda x: x["responses"], reverse=True)[:8]

@router.get("/by-status-detail")
def get_status_detail(db: Session = Depends(get_db)):
    jobs = db.query(Job).all()
    by_status = defaultdict(list)
    for j in jobs:
        by_status[j.status].append({
            "company": j.company,
            "role": j.role,
            "remote": j.remote,
            "sponsorship": j.sponsorship,
        })
    return by_status

@router.get("/top-metrics")
def get_top_metrics(db: Session = Depends(get_db)):
    jobs = db.query(Job).all()
    total = len(jobs)
    applied = sum(1 for j in jobs if j.status in ["applied","phone_screen","interview","offer","rejected"])
    responses = sum(1 for j in jobs if j.status in ["phone_screen","interview","offer"])
    offers = sum(1 for j in jobs if j.status == "offer")
    rejected = sum(1 for j in jobs if j.status == "rejected")
    remote = sum(1 for j in jobs if j.remote)
    sponsorship = sum(1 for j in jobs if j.sponsorship)

    response_rate = round(responses / applied * 100, 1) if applied > 0 else 0
    offer_rate = round(offers / applied * 100, 1) if applied > 0 else 0

    return {
        "total": total,
        "applied": applied,
        "responses": responses,
        "offers": offers,
        "rejected": rejected,
        "remote_count": remote,
        "sponsorship_count": sponsorship,
        "response_rate": response_rate,
        "offer_rate": offer_rate,
    }
