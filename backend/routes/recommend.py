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

    # 🔥 NEW RISK PARAMETERS
    risk_appetite: str = "",
    smoking: str = "",
    medical: str = "",
    monthly_budget: float = 0,

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

        coverage_score = normalize(p.coverage, max_cov)
        claim_score = normalize(p.claim_ratio, max_claim)
        rating_score = normalize(p.customer_rating, max_rating)
        price_score = 100 - normalize(p.premium, max_price)

        # -------------------------
        # BASE SCORE (unchanged logic)
        # -------------------------

        score = (
            coverage_score * 0.35 +
            claim_score * 0.30 +
            rating_score * 0.20 +
            price_score * 0.15
        )

        # -------------------------
        # 🔥 RISK PROFILE BONUS LOGIC
        # -------------------------

        # High risk appetite → prefer higher coverage
        if risk_appetite.lower() == "high":
            score += coverage_score * 0.10

        # Low risk appetite → prefer cheaper premium
        if risk_appetite.lower() == "low":
            score += price_score * 0.10

        # Smoking → higher coverage preferred
        if smoking.lower() == "yes":
            score += coverage_score * 0.05

        # Medical conditions → strong claim ratio preferred
        if medical and medical.lower() != "none":
            score += claim_score * 0.10

        # Monthly budget preference
        if monthly_budget:
            if p.premium <= monthly_budget:
                score += 5  # small fixed bonus

        reasons = []

        if coverage_score > 70:
            reasons.append("High coverage")

        if claim_score > 80:
            reasons.append("Excellent claim success")

        if rating_score > 80:
            reasons.append("Top customer rating")

        if price_score > 50:
            reasons.append("Affordable premium")

        if risk_appetite:
            reasons.append("Matched your risk profile")

        results.append({
    "id": p.id,
    "title": p.title,
    "company": f"Provider {p.provider_id}",
    "premium": p.premium,
    "coverage": p.coverage,
    "claim": p.claim_ratio,
    "rating": p.customer_rating,
    "score": round(score, 1),

    # 🔥 NEW BREAKDOWN DATA
    "breakdown": {
        "coverage_score": round(coverage_score, 1),
        "claim_score": round(claim_score, 1),
        "rating_score": round(rating_score, 1),
        "price_score": round(price_score, 1),
        "weights": {
            "coverage": 0.35,
            "claim": 0.30,
            "rating": 0.20,
            "price": 0.15
        }
    },

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
