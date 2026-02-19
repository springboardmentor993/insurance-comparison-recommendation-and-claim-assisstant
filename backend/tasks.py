import smtplib
from email.message import EmailMessage
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from celery_worker import celery_app

# 🔐 Your Gmail details
EMAIL_ADDRESS = "satyn152@gmail.com"
EMAIL_PASSWORD = "tpkmiwyqjnjzvbqs"   # remove spaces


@celery_app.task
def send_claim_status_email(claim_id, status):

    db: Session = SessionLocal()

    try:
        # Get claim
        claim = db.query(models.Claims).filter(models.Claims.id == claim_id).first()

        if not claim:
            return "Claim not found"

        # Get user policy
        user_policy = db.query(models.UserPolicies).filter(
            models.UserPolicies.id == claim.user_policy_id
        ).first()

        if not user_policy:
            return "User policy not found"

        # Get user
        user = db.query(models.User).filter(
            models.User.id == user_policy.user_id
        ).first()

        if not user:
            return "User not found"

        recipient_email = user.email

        # Create email
        msg = EmailMessage()
        msg["Subject"] = f"Claim Status Updated - {status}"
        msg["From"] = EMAIL_ADDRESS
        msg["To"] = recipient_email

        msg.set_content(f"""
Hello {user.name},

Your claim (ID: {claim_id}) status has been updated.

New Status: {status}

Thank you,
Insurance Support Team
""")

        # Send email using Gmail SMTP
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            smtp.send_message(msg)

        return f"Email sent to {recipient_email}"

    except Exception as e:
        return str(e)

    finally:
        db.close()
