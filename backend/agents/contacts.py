import httpx
from config import settings
import json

HUNTER_BASE = "https://api.hunter.io/v2"

async def find_contacts(company: str, domain: str | None = None, role: str | None = None) -> list:
    """
    Find contacts at a company using Hunter.io.
    Returns ranked list of contacts best suited for cold outreach.
    """
    if not settings.HUNTER_API_KEY:
        return _mock_contacts(company)

    params = {
        "api_key": settings.HUNTER_API_KEY,
        "limit": 10,
        "offset": 0,
        "type": "professional",
    }

    if domain:
        params["domain"] = domain
    else:
        # Derive domain from company name heuristic
        slug = company.lower().replace(" ", "").replace(",", "").replace(".", "")
        params["domain"] = f"{slug}.com"

    async with httpx.AsyncClient(timeout=10) as http:
        try:
            resp = await http.get(f"{HUNTER_BASE}/domain-search", params=params)
            data = resp.json()
        except Exception as e:
            return _mock_contacts(company)

    if resp.status_code != 200 or "data" not in data:
        return _mock_contacts(company)

    emails = data["data"].get("emails", [])
    contacts = []

    for e in emails:
        contacts.append({
            "name": f"{e.get('first_name','')} {e.get('last_name','')}".strip(),
            "email": e.get("value"),
            "title": e.get("position", ""),
            "linkedin": e.get("linkedin", ""),
            "confidence": e.get("confidence", 0),
            "relevance_score": _score_contact(e, role),
        })

    # Sort by relevance
    contacts.sort(key=lambda x: x["relevance_score"], reverse=True)
    return contacts[:8]


def _score_contact(contact: dict, target_role: str | None) -> int:
    """Score a contact by how relevant they are to reach out to."""
    title = (contact.get("position") or "").lower()
    score = contact.get("confidence", 50)

    # Hiring managers and engineering leads are top priority
    priority_titles = ["engineering manager", "hiring manager", "recruiter", "talent",
                       "head of engineering", "vp of engineering", "director of engineering",
                       "tech lead", "staff engineer", "senior engineer"]
    for t in priority_titles:
        if t in title:
            score += 30
            break

    # If we know the target role, match seniority
    if target_role:
        role_lower = target_role.lower()
        if "ml" in role_lower or "machine learning" in role_lower:
            if "ml" in title or "machine learning" in title or "data" in title or "ai" in title:
                score += 20
        if "software" in role_lower or "backend" in role_lower:
            if "software" in title or "backend" in title or "engineer" in title:
                score += 10

    return score


def _mock_contacts(company: str) -> list:
    """Return placeholder when no API key is configured."""
    return [
        {
            "name": "Add Hunter.io API key to find real contacts",
            "email": None,
            "title": "Configure HUNTER_API_KEY in .env",
            "linkedin": "",
            "confidence": 0,
            "relevance_score": 0,
        }
    ]
