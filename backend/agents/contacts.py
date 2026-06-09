import httpx
from config import settings
import json

HUNTER_BASE = "https://api.hunter.io/v2"

async def find_contacts(company: str, domain: str | None = None, role: str | None = None) -> list:
    api_key = settings.HUNTER_API_KEY
    print(f"[contacts] API key present: {bool(api_key)}, domain: {domain}, company: {company}")

    if not api_key or api_key.strip() == "":
        print("[contacts] No API key — returning mock")
        return _mock_contacts(company)

    if not domain:
        slug = company.lower().replace(" ", "").replace(",", "").replace(".", "")
        domain = f"{slug}.com"

    params = {
        "api_key": api_key.strip(),
        "domain": domain,
        "limit": 10,
        "offset": 0,
    }

    print(f"[contacts] Calling Hunter for domain: {domain}")

    async with httpx.AsyncClient(timeout=15) as http:
        try:
            resp = await http.get(f"{HUNTER_BASE}/domain-search", params=params)
            print(f"[contacts] Hunter status: {resp.status_code}")
            data = resp.json()
        except Exception as e:
            print(f"[contacts] Request failed: {e}")
            return _mock_contacts(company)

    if resp.status_code != 200:
        print(f"[contacts] Bad status: {resp.status_code} — {data}")
        return _mock_contacts(company)

    emails = data.get("data", {}).get("emails", [])
    print(f"[contacts] Found {len(emails)} emails")

    if not emails:
        return [{
            "name": f"No contacts found for {domain}",
            "email": None,
            "title": "Hunter has no data for this domain",
            "linkedin": "",
            "confidence": 0,
            "relevance_score": 0,
        }]

    contacts = []
    for e in emails:
        contacts.append({
            "name": " ".join(filter(None, [e.get("first_name"), e.get("last_name")])) or e.get("value", "").split("@")[0].capitalize() or "Unknown",
            "email": e.get("value"),
            "title": e.get("position", ""),
            "linkedin": e.get("linkedin", ""),
            "confidence": e.get("confidence", 0),
            "relevance_score": _score_contact(e, role),
        })

    contacts.sort(key=lambda x: x["relevance_score"], reverse=True)
    return contacts[:8]


def _score_contact(contact: dict, target_role: str | None) -> int:
    title = (contact.get("position") or "").lower()
    score = contact.get("confidence", 50)

    priority_titles = ["engineering manager", "hiring manager", "recruiter", "talent",
                       "head of engineering", "vp of engineering", "director of engineering",
                       "tech lead", "staff engineer", "senior engineer"]
    for t in priority_titles:
        if t in title:
            score += 30
            break

    if target_role:
        role_lower = target_role.lower()
        if "ml" in role_lower or "machine learning" in role_lower:
            if any(k in title for k in ["ml", "machine learning", "data", "ai"]):
                score += 20
        if "software" in role_lower or "backend" in role_lower:
            if any(k in title for k in ["software", "backend", "engineer"]):
                score += 10

    return score


def _mock_contacts(company: str) -> list:
    return [{
        "name": "Add Hunter.io API key to find real contacts",
        "email": None,
        "title": "Configure HUNTER_API_KEY in .env",
        "linkedin": "",
        "confidence": 0,
        "relevance_score": 0,
    }]
