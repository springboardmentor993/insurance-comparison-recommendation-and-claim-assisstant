from celery import Celery
from app.config import settings
from app.database import SessionLocal
from app.models import Claim, FraudFlag, ClaimDocument, FraudSeverity
from sqlalchemy import func
from datetime import datetime, timedelta

celery_app = Celery(
    "insurance_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)


@celery_app.task
def run_fraud_detection(claim_id: int):
    """Run fraud detection rules on a claim"""
    db = SessionLocal()
    try:
        claim = db.query(Claim).filter(Claim.id == claim_id).first()
        if not claim:
            return
        
        # Rule 1: Duplicate documents check (Cross-claim/Cross-user)
        doc_urls = [doc.file_url for doc in claim.documents if doc.file_url]
        for url in doc_urls:
            # Check if this document exists in ANY other claim
            duplicate_doc = db.query(ClaimDocument).filter(
                ClaimDocument.file_url == url,
                ClaimDocument.claim_id != claim_id
            ).first()
            
            if duplicate_doc:
                other_claim = duplicate_doc.claim
                flag = FraudFlag(
                    claim_id=claim_id,
                    rule_code="DUPLICATE_DOCS",
                    severity=FraudSeverity.HIGH,
                    details=f"Document found in another claim ({other_claim.claim_number})"
                )
                db.add(flag)
                break # Avoid redundant flags for the same claim
        
        # Rule 2: Suspicious timing (multiple claims in short period)
        recent_claims = db.query(Claim).filter(
            Claim.user_policy_id == claim.user_policy_id,
            Claim.id != claim_id,
            Claim.created_at >= datetime.now() - timedelta(days=30)
        ).count()
        
        if recent_claims >= 3:
            flag = FraudFlag(
                claim_id=claim_id,
                rule_code="FREQUENT_CLAIMS",
                severity=FraudSeverity.MEDIUM,
                details=f"{recent_claims} claims filed in the last 30 days"
            )
            db.add(flag)
        
        # Rule 3: Suspicious amounts (claim amount exceeds policy premium significantly)
        policy_premium = float(claim.user_policy.premium)
        claimed_amount = float(claim.amount_claimed)
        
        if claimed_amount > policy_premium * 10:
            flag = FraudFlag(
                claim_id=claim_id,
                rule_code="EXCESSIVE_AMOUNT",
                severity=FraudSeverity.HIGH,
                details=f"Claimed amount (${claimed_amount}) is {claimed_amount/policy_premium:.1f}x the premium"
            )
            db.add(flag)
        elif claimed_amount > policy_premium * 5:
            flag = FraudFlag(
                claim_id=claim_id,
                rule_code="HIGH_AMOUNT",
                severity=FraudSeverity.MEDIUM,
                details=f"Claimed amount is significantly higher than premium"
            )
            db.add(flag)
        
        # Rule 4: Incident shortly after policy start
        policy_start = claim.user_policy.start_date
        incident_date = claim.incident_date
        days_diff = (incident_date - policy_start).days
        
        if days_diff < 7:
            flag = FraudFlag(
                claim_id=claim_id,
                rule_code="EARLY_CLAIM",
                severity=FraudSeverity.MEDIUM,
                details=f"Incident occurred only {days_diff} days after policy started"
            )
            db.add(flag)
        
        db.commit()
        
        # Send notification if high severity flags found
        high_severity_flags = db.query(FraudFlag).filter(
            FraudFlag.claim_id == claim_id,
            FraudFlag.severity == FraudSeverity.HIGH
        ).count()
        
        if high_severity_flags > 0:
            send_fraud_alert.delay(claim_id)
        
    finally:
        db.close()


@celery_app.task
def send_fraud_alert(claim_id: int):
    """Send email alert for high-risk fraud detection"""
    db = SessionLocal()
    try:
        claim = db.query(Claim).filter(Claim.id == claim_id).first()
        if not claim:
            return
        
        # In production, send email to admin
        print(f"FRAUD ALERT: Claim {claim.claim_number} flagged for review")
        
        # TODO: Implement email sending using SMTP settings
        # import emails
        # message = emails.html(...)
        # message.send(...)
        
    finally:
        db.close()


@celery_app.task
def send_claim_notification(claim_id: int, status: str):
    """Send email notification about claim status update"""
    db = SessionLocal()
    try:
        claim = db.query(Claim).filter(Claim.id == claim_id).first()
        if not claim:
            return
        
        user = claim.user_policy.user
        from app.utils.email import send_email, get_claim_status_email
        
        subject = f"Update on your Claim #{claim.claim_number}"
        html_content, text_content = get_claim_status_email(
            user_name=user.name,
            claim_number=claim.claim_number,
            status=status
        )
        
        send_email(
            subject=subject,
            to_email=user.email,
            html_content=html_content,
            text_content=text_content
        )
        
        print(f"Notification: Claim {claim.claim_number} status changed to {status}. Email sent to {user.email}")
        
    finally:
        db.close()
