from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import SessionLocal
import models

router = APIRouter(prefix="/recommend", tags=["Recommend"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def normalize(v, m):
    return (v / m) * 100 if m else 0


# ✅ MAIN RECOMMENDATION API
@router.get("/")
def recommend(
    category: str = Query(None),
    min_budget: float = 0,
    max_budget: float = 999999,
    min_coverage: float = 0,
    db: Session = Depends(get_db),
):

    query = db.query(models.Policy)

    # filter by policy type
    if category:
        query = query.filter(models.Policy.policy_type == category)

    query = query.filter(models.Policy.premium >= min_budget)
    query = query.filter(models.Policy.premium <= max_budget)
    query = query.filter(models.Policy.coverage >= min_coverage)

    policies = query.all()

    if not policies:
        return {"recommended": [], "best": None}

    max_cov = max(p.coverage for p in policies)
    max_claim = max(p.claim_ratio for p in policies)
    max_rating = max(p.customer_rating for p in policies)
    max_price = max(p.premium for p in policies)

    results = []

    for p in policies:

        score = (
            normalize(p.coverage, max_cov) * 0.35 +
            normalize(p.claim_ratio, max_claim) * 0.30 +
            normalize(p.customer_rating, max_rating) * 0.20 +
            (100 - normalize(p.premium, max_price)) * 0.15
        )

        reasons = []

        if p.coverage > max_cov * 0.7:
            reasons.append("High coverage")

        if p.claim_ratio > 95:
            reasons.append("Excellent claim success")

        if p.customer_rating >= 4:
            reasons.append("Top customer rating")

        if p.premium < max_price * 0.6:
            reasons.append("Affordable premium")

        results.append({
            "id": p.id,
            "title": p.title,
            "company": f"Provider {p.provider_id}",
            "premium": p.premium,
            "coverage": p.coverage,
            "claim": p.claim_ratio,
            "rating": p.customer_rating,
            "score": round(score, 1),
            "reasons": reasons
        })

    results.sort(key=lambda x: x["score"], reverse=True)

    return {
        "recommended": results,
        "best": results[0]
    }


@router.get("/policy-types")
def get_policy_types(db: Session = Depends(get_db)):
    rows = db.query(models.Policy.policy_type).distinct().all()
    return [r[0] for r in rows]
