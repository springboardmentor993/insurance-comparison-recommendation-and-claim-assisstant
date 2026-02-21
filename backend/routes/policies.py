from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import SessionLocal
import models

router = APIRouter(prefix="/policies", tags=["Policies"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 🔹 MAIN POLICIES LIST + FILTERS (UNCHANGED)
@router.get("/")
def get_policies(
    policy_type: str | None = None,
    premium_max: float | None = None,
    coverage_min: float | None = None,
    term_max: int | None = None,
    claim_min: float | None = None,
    db: Session = Depends(get_db),
):

    q = db.query(models.Policy)

    if policy_type:
        q = q.filter(models.Policy.policy_type == policy_type)

    if premium_max is not None:
        q = q.filter(models.Policy.premium <= premium_max)

    if coverage_min is not None:
        q = q.filter(models.Policy.coverage >= coverage_min)

    if term_max is not None:
        q = q.filter(models.Policy.term_months <= term_max)

    if claim_min is not None:
        q = q.filter(models.Policy.claim_ratio >= claim_min)

    policies = q.all()

    return [
        {
            "id": p.id,
            "title": p.title,
            "type": p.policy_type,
            "premium": p.premium,
            "coverage": p.coverage,
            "term": p.term_months,
            "claim": p.claim_ratio,
            "rating": p.customer_rating,
        }
        for p in policies
    ]


# 🔹 CATEGORY BASED POLICIES (NEW — DOES NOT BREAK ANYTHING)
@router.get("/{category}")
def get_policies_by_category(category: str, db: Session = Depends(get_db)):

    # find category by name (case insensitive)
    category_obj = db.query(models.Category).filter(
        func.lower(models.Category.name) == category.lower()
    ).first()

    if not category_obj:
        return []

    policies = db.query(models.Policy).filter(
        models.Policy.category_id == category_obj.id
    ).all()

    return [
        {
            "id": p.id,
            "title": p.title,
            "type": p.policy_type,
            "premium": p.premium,
            "coverage": p.coverage,
            "term_months": p.term_months,
            "claim_ratio": p.claim_ratio,
            "customer_rating": p.customer_rating,
            "category_id": p.category_id,
        }
        for p in policies
    ]


# 🔹 POLICY TYPES (UNCHANGED)
@router.get("/types")
def get_policy_types(db: Session = Depends(get_db)):
    types = db.query(models.Policy.policy_type).distinct().all()
    return [t[0] for t in types]