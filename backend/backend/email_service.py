import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging

from config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM, APP_NAME

logger = logging.getLogger(__name__)


def send_email(
    to_email: str,
    subject: str,
    body_html: str,
    body_text: Optional[str] = None
) -> bool:
    """
    Send email using SMTP.
    Returns True if successful, False otherwise.
    """
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{APP_NAME} <{EMAIL_FROM}>"
        msg['To'] = to_email
        
        # Add plain text and HTML parts
        if body_text:
            part1 = MIMEText(body_text, 'plain')
            msg.attach(part1)
        
        part2 = MIMEText(body_html, 'html')
        msg.attach(part2)
        
        # Send email
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            if SMTP_USER and SMTP_PASSWORD:
                server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Error sending email to {to_email}: {e}")
        return False


def create_claim_submitted_email(
    user_name: str,
    claim_number: str,
    claim_type: str,
    claim_amount: float
) -> tuple[str, str]:
    """
    Create email content for claim submission notification.
    Returns (subject, html_body).
    """
    subject = f"Claim Submitted Successfully - {claim_number}"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #4F46E5; color: white; padding: 20px; text-align: center; }}
            .content {{ background-color: #f9f9f9; padding: 20px; }}
            .claim-details {{ background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }}
            .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
            .button {{ background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>{APP_NAME}</h1>
            </div>
            <div class="content">
                <h2>Hello {user_name},</h2>
                <p>Your claim has been submitted successfully and is now under review.</p>
                
                <div class="claim-details">
                    <h3>Claim Details</h3>
                    <p><strong>Claim Number:</strong> {claim_number}</p>
                    <p><strong>Claim Type:</strong> {claim_type}</p>
                    <p><strong>Claim Amount:</strong> ${claim_amount:,.2f}</p>
                    <p><strong>Status:</strong> Pending Review</p>
                </div>
                
                <p>We will review your claim and notify you of any updates. You can track the status of your claim anytime from your dashboard.</p>
                
                <p>If you have any questions, please don't hesitate to contact our support team.</p>
                
                <p>Thank you for choosing {APP_NAME}.</p>
            </div>
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>&copy; 2026 {APP_NAME}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return subject, html_body


def create_claim_status_update_email(
    user_name: str,
    claim_number: str,
    new_status: str,
    status_notes: Optional[str] = None,
    approved_amount: Optional[float] = None
) -> tuple[str, str]:
    """
    Create email content for claim status update notification.
    Returns (subject, html_body).
    """
    subject = f"Claim Status Updated - {claim_number}"
    
    status_message = {
        "under_review": "Your claim is currently under review by our team.",
        "approved": "Great news! Your claim has been approved.",
        "rejected": "We regret to inform you that your claim has been rejected.",
        "completed": "Your claim has been completed and processed."
    }.get(new_status, f"Your claim status has been updated to: {new_status}")
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #4F46E5; color: white; padding: 20px; text-align: center; }}
            .content {{ background-color: #f9f9f9; padding: 20px; }}
            .claim-details {{ background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }}
            .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
            .status-badge {{ padding: 5px 10px; border-radius: 3px; display: inline-block; font-weight: bold; }}
            .status-approved {{ background-color: #10B981; color: white; }}
            .status-rejected {{ background-color: #EF4444; color: white; }}
            .status-under_review {{ background-color: #F59E0B; color: white; }}
            .status-completed {{ background-color: #6366F1; color: white; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>{APP_NAME}</h1>
            </div>
            <div class="content">
                <h2>Hello {user_name},</h2>
                <p>{status_message}</p>
                
                <div class="claim-details">
                    <h3>Claim Details</h3>
                    <p><strong>Claim Number:</strong> {claim_number}</p>
                    <p><strong>Status:</strong> <span class="status-badge status-{new_status}">{new_status.replace('_', ' ').title()}</span></p>
                    {f'<p><strong>Approved Amount:</strong> ${approved_amount:,.2f}</p>' if approved_amount else ''}
                    {f'<p><strong>Notes:</strong> {status_notes}</p>' if status_notes else ''}
                </div>
                
                <p>You can view the complete details of your claim from your dashboard.</p>
                
                <p>Thank you for choosing {APP_NAME}.</p>
            </div>
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>&copy; 2026 {APP_NAME}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return subject, html_body
