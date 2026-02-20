import emails
from app.config import settings
import logging

logger = logging.getLogger(__name__)

def send_email(subject: str, to_email: str, html_content: str, text_content: str = ""):
    """
    Send an email using SMTP settings.
    """
    if not all([settings.SMTP_HOST, settings.SMTP_USER, settings.SMTP_PASSWORD, settings.FROM_EMAIL]):
        logger.warning(f"Email settings not configured. Printing to console: {subject} to {to_email}")
        print(f"--- EMAIL NOT SENT (NOT CONFIGURED) ---")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        print(f"Body: {text_content or 'HTML Content'}")
        print("---------------------------------------")
        return False

    try:
        message = emails.html(
            html=html_content,
            subject=subject,
            mail_from=(settings.PROJECT_NAME, settings.FROM_EMAIL)
        )
        
        if text_content:
            message.set_mail_handler("text", text_content)

        r = message.send(
            to=to_email,
            smtp={
                "host": settings.SMTP_HOST,
                "port": settings.SMTP_PORT,
                "user": settings.SMTP_USER,
                "password": settings.SMTP_PASSWORD,
                "tls": settings.SMTP_PORT == 587,
            }
        )
        
        if r.status_code == 250:
            logger.info(f"Email sent successfully to {to_email}")
            return True
        else:
            logger.error(f"Failed to send email to {to_email}. Status code: {r.status_code}")
            return False
            
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        # In development, don't crash if email fails
        if settings.DEBUG:
            print(f"DEBUG Email Error: {str(e)}")
        return False

def get_claim_status_email(user_name: str, claim_number: str, status: str):
    """
    Generate email content for claim status updates.
    """
    status_display = status.replace("_", " ").title()
    
    # Elegant HTML Template
    html = f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #1a202c;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 30px; text-align: center;">
            <div style="margin-bottom: 10px;">
                <!-- You can add a logo img here if hosted -->
                <span style="background-color: rgba(255,255,255,0.2); padding: 8px 12px; border-radius: 8px; color: white; font-weight: bold; font-size: 20px;">🛡️ InsureHub</span>
            </div>
            <h1 style="color: white; margin: 10px 0 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">Claim Update</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin-top: 5px; font-size: 14px;">Your Insurance Partner</p>
        </div>
        
        <div style="padding: 40px 30px; background-color: #ffffff;">
            <p style="font-size: 16px; margin-top: 0; color: #4a5568;">Hello <strong>{user_name}</strong>,</p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">We have an update regarding your insurance claim <strong>#{claim_number}</strong>.</p>
            
            <div style="background-color: #f0f9ff; border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0; border: 1px solid #bae6fd;">
                <span style="display: block; font-size: 12px; color: #0284c7; text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em; margin-bottom: 8px;">Current Status</span>
                <span style="font-size: 24px; font-weight: 800; color: #0369a1; text-transform: capitalize;">{status_display}</span>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">You can log in to your dashboard to view the full details, download documents, and track further progress.</p>
            
            <div style="text-align: center; margin-top: 40px;">
                <a href="http://localhost:5173/dashboard" style="background-color: #2563eb; color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); transition: background-color 0.2s;">View Dashboard</a>
            </div>
        </div>
        
        <div style="background-color: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 13px; color: #718096; font-weight: 500;">&copy; 2026 InsureHub. All rights reserved.</p>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #a0aec0;">This is an automated notification. Please do not reply directly to this email.</p>
        </div>
    </div>
    """
    
    text = f"Hello {user_name},\n\nYour insurance claim #{claim_number} has been updated to: {status_display}.\n\nPlease log in to your dashboard to view details: http://localhost:5173/dashboard\n\nBest regards,\nThe InsureHub Team"
    
    return html, text
