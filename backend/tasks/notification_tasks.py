"""Celery task for sending notifications.

Stub implementation — logs notifications for now.
Can be extended to send emails (via SES, SendGrid, etc.) or push notifications.
"""
import logging

from config.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="tasks.send_claim_notification")
def send_claim_notification(
    user_email: str,
    claim_number: str,
    status: str,
    message: str = "",
):
    """Send a notification about claim status change.
    
    Args:
        user_email: Recipient email address
        claim_number: Claim reference number
        status: New claim status
        message: Optional additional message
        
    Returns:
        dict confirming notification was processed
    """
    # TODO: Integrate with email service (SES, SendGrid, SMTP)
    logger.info(
        f"NOTIFICATION: email={user_email}, "
        f"claim={claim_number}, status={status}, "
        f"message={message}"
    )
    
    return {
        "status": "sent",
        "recipient": user_email,
        "claim_number": claim_number,
        "claim_status": status,
    }
