from celery_app import celery_app
from email_service import (
    send_email,
    create_claim_submitted_email,
    create_claim_status_update_email
)
import logging

logger = logging.getLogger(__name__)


@celery_app.task(name='tasks.send_claim_submitted_notification')
def send_claim_submitted_notification(
    user_email: str,
    user_name: str,
    claim_number: str,
    claim_type: str,
    claim_amount: float
):
    """
    Celery task to send claim submission notification email.
    """
    logger.info(f"Sending claim submitted notification to {user_email}")
    
    subject, html_body = create_claim_submitted_email(
        user_name=user_name,
        claim_number=claim_number,
        claim_type=claim_type,
        claim_amount=claim_amount
    )
    
    result = send_email(
        to_email=user_email,
        subject=subject,
        body_html=html_body
    )
    
    if result:
        logger.info(f"Claim submitted notification sent successfully to {user_email}")
    else:
        logger.error(f"Failed to send claim submitted notification to {user_email}")
    
    return result


@celery_app.task(name='tasks.send_claim_status_update_notification')
def send_claim_status_update_notification(
    user_email: str,
    user_name: str,
    claim_number: str,
    new_status: str,
    status_notes: str = None,
    approved_amount: float = None
):
    """
    Celery task to send claim status update notification email.
    """
    logger.info(f"Sending claim status update notification to {user_email}")
    
    subject, html_body = create_claim_status_update_email(
        user_name=user_name,
        claim_number=claim_number,
        new_status=new_status,
        status_notes=status_notes,
        approved_amount=approved_amount
    )
    
    result = send_email(
        to_email=user_email,
        subject=subject,
        body_html=html_body
    )
    
    if result:
        logger.info(f"Claim status update notification sent successfully to {user_email}")
    else:
        logger.error(f"Failed to send claim status update notification to {user_email}")
    
    return result
