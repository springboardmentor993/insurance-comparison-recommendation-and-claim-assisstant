from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from fastapi.responses import StreamingResponse
import csv
import io
from datetime import datetime

import models
from database import get_db
from oauth2 import get_current_user

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

# -------------------------------------------------
# ADMIN ACCESS CHECK
# -------------------------------------------------
def admin_only(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.email != "satyn152@gmail.com":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


# -------------------------------------------------
# GET ALL CLAIMS (WITH DOCUMENTS)
# -------------------------------------------------
@router.get("/claims")
def get_all_claims(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(admin_only)
):

    claims = db.query(models.Claims).all()
    result = []

    for claim in claims:
        documents = db.query(models.ClaimDocuments).filter(
            models.ClaimDocuments.claim_id == claim.id
        ).all()

        doc_list = [
            {
                "id": doc.id,
                "file_url": doc.file_url,
                "doc_type": doc.doc_type
            }
            for doc in documents
        ]

        result.append({
            "id": claim.id,
            "claim_number": claim.claim_number,
            "amount_claimed": float(claim.amount_claimed),
            "status": claim.status,
            "created_at": claim.created_at,
            "documents": doc_list
        })

    return result


# -------------------------------------------------
# DASHBOARD SUMMARY
# -------------------------------------------------
@router.get("/dashboard-summary")
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(admin_only)
):

    total_users = db.query(models.User).count()
    total_claims = db.query(models.Claims).count()
    total_policies = db.query(models.UserPolicies).count()
    total_fraud_flags = db.query(models.FraudFlags).count()

    total_premium = db.query(func.sum(models.UserPolicies.premium)).scalar() or 0
    total_claim_amount = db.query(func.sum(models.Claims.amount_claimed)).scalar() or 0

    return {
        "total_users": total_users,
        "total_claims": total_claims,
        "total_policies_sold": total_policies,
        "total_fraud_flags": total_fraud_flags,
        "total_premium_collected": float(total_premium),
        "total_claims_amount": float(total_claim_amount)
    }


# -------------------------------------------------
# FRAUD SUMMARY
# -------------------------------------------------
@router.get("/fraud-summary")
def fraud_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(admin_only)
):

    fraud_counts = db.query(
        models.FraudFlags.rule_code,
        func.count(models.FraudFlags.id)
    ).group_by(models.FraudFlags.rule_code).all()

    return [
        {"rule_code": rule, "count": count}
        for rule, count in fraud_counts
    ]


# -------------------------------------------------
# MONTHLY CLAIM ANALYTICS
# -------------------------------------------------
@router.get("/monthly-claims")
def monthly_claims(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(admin_only)
):

    monthly = db.query(
        extract('month', models.Claims.created_at).label("month"),
        func.count(models.Claims.id)
    ).group_by("month").all()

    return [
        {"month": int(month), "total_claims": count}
        for month, count in monthly
    ]


# -------------------------------------------------
# EXPORT CLAIMS CSV
# -------------------------------------------------
@router.get("/export-claims")
def export_claims(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(admin_only)
):

    claims = db.query(models.Claims).all()

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Claim Number",
        "Amount",
        "Status",
        "Created At"
    ])

    for claim in claims:
        writer.writerow([
            claim.claim_number,
            float(claim.amount_claimed),
            claim.status,
            claim.created_at
        ])

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=claims_export.csv"
        }
    )