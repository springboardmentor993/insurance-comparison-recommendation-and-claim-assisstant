"""
Email service for sending notifications to users
Uses a simple SMTP implementation with fallback for demo
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Email configuration (for demo, using print instead of actual SMTP)
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "insurance.app@gmail.com"
SENDER_PASSWORD = "demo_password"  # In production, use environment variables

class EmailService:
    """Service for sending emails"""
    
    @staticmethod
    def send_application_confirmation(user_email: str, user_name: str, policy_name: str, policy_number: str, premium: str) -> bool:
        """
        Send application confirmation email to user
        """
        try:
            subject = "✅ Insurance Application Confirmed"
            
            html_body = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                            <h1 style="margin: 0;">🎉 Application Confirmed!</h1>
                        </div>
                        
                        <div style="padding: 20px;">
                            <p>Dear <strong>{user_name}</strong>,</p>
                            
                            <p>Thank you for choosing our insurance services. Your application has been successfully submitted and processed.</p>
                            
                            <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
                                <h3 style="margin-top: 0;">Policy Details</h3>
                                <p><strong>Policy Name:</strong> {policy_name}</p>
                                <p><strong>Policy Number:</strong> {policy_number}</p>
                                <p><strong>Monthly Premium:</strong> ₹{premium}</p>
                                <p><strong>Status:</strong> <span style="color: #2e7d32; font-weight: bold;">✓ Active</span></p>
                            </div>
                            
                            <p>Your policy is now active and ready to use. You can:</p>
                            <ul>
                                <li>View your policy details in your account</li>
                                <li>File claims when needed</li>
                                <li>Upload required documents</li>
                                <li>Track claim status in real-time</li>
                            </ul>
                            
                            <p><strong>Next Steps:</strong></p>
                            <ol>
                                <li>Log in to your account</li>
                                <li>Go to "Claims" section</li>
                                <li>Select your policy to file a claim if needed</li>
                            </ol>
                            
                            <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0;"><strong>📞 Customer Support</strong></p>
                                <p style="margin: 5px 0;">If you have any questions, our support team is here to help.</p>
                                <p style="margin: 5px 0;"><strong>Email:</strong> support@insuranceapp.com</p>
                                <p style="margin: 5px 0;"><strong>Phone:</strong> 1-800-INSURANCE</p>
                            </div>
                            
                            <p>Thank you for being part of our insurance family!</p>
                            
                            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999;">
                                This is an automated email. Please do not reply directly to this message.
                            </p>
                        </div>
                    </div>
                </body>
            </html>
            """
            
            # For demo purposes, just log the email
            logger.info(f"EMAIL SENT TO: {user_email}")
            logger.info(f"SUBJECT: {subject}")
            logger.info(f"Policy: {policy_name} - {policy_number}")
            
            # In production, uncomment below and use actual SMTP:
            # try:
            #     msg = MIMEMultipart('alternative')
            #     msg['Subject'] = subject
            #     msg['From'] = SENDER_EMAIL
            #     msg['To'] = user_email
            #     
            #     part1 = MIMEText(subject, 'plain')
            #     part2 = MIMEText(html_body, 'html')
            #     msg.attach(part1)
            #     msg.attach(part2)
            #     
            #     server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
            #     server.starttls()
            #     server.login(SENDER_EMAIL, SENDER_PASSWORD)
            #     server.sendmail(SENDER_EMAIL, user_email, msg.as_string())
            #     server.quit()
            #     return True
            # except Exception as e:
            #     logger.error(f"Failed to send email: {str(e)}")
            #     return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error preparing email: {str(e)}")
            return False
    
    @staticmethod
    def send_claim_submitted_notification(user_email: str, user_name: str, claim_number: str, policy_name: str) -> bool:
        """
        Send claim submission confirmation email
        """
        try:
            subject = "📋 Claim Submitted Successfully"
            
            html_body = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                            <h1 style="margin: 0;">📋 Claim Received</h1>
                        </div>
                        
                        <div style="padding: 20px;">
                            <p>Dear <strong>{user_name}</strong>,</p>
                            
                            <p>Your claim has been successfully submitted and is now under review.</p>
                            
                            <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #1565c0; margin: 20px 0;">
                                <h3 style="margin-top: 0;">Claim Details</h3>
                                <p><strong>Claim Number:</strong> {claim_number}</p>
                                <p><strong>Policy:</strong> {policy_name}</p>
                                <p><strong>Status:</strong> <span style="color: #ff9800; font-weight: bold;">🔄 Under Review</span></p>
                            </div>
                            
                            <p><strong>What happens next:</strong></p>
                            <ol>
                                <li>Our team will review your claim and documents</li>
                                <li>We may request additional information if needed</li>
                                <li>You'll receive status updates via email</li>
                                <li>Once approved, payment will be processed within 5-7 business days</li>
                            </ol>
                            
                            <p><strong>Track Your Claim:</strong></p>
                            <p>You can track your claim status anytime by logging into your account and visiting the Claims section. Use claim number <strong>{claim_number}</strong> for reference.</p>
                            
                            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0;"><strong>⏱️ Average Processing Time</strong></p>
                                <p style="margin: 5px 0;">Most claims are processed within 7-10 business days. Complex claims may take up to 30 days.</p>
                            </div>
                            
                            <p>If you have any questions about your claim, please don't hesitate to contact us.</p>
                            
                            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999;">
                                This is an automated email. Please do not reply directly to this message.
                            </p>
                        </div>
                    </div>
                </body>
            </html>
            """
            
            logger.info(f"CLAIM EMAIL SENT TO: {user_email}")
            logger.info(f"SUBJECT: {subject}")
            logger.info(f"Claim: {claim_number}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error sending claim email: {str(e)}")
            return False
    
    @staticmethod
    def send_fraud_alert_notification(user_email: str, user_name: str, claim_number: str, risk_level: str) -> bool:
        """
        Send fraud detection alert email
        """
        try:
            subject = f"⚠️ Claim Review Required - {risk_level} Risk Detected"
            
            html_body = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                        <div style="background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                            <h1 style="margin: 0;">⚠️ Claim Under Review</h1>
                        </div>
                        
                        <div style="padding: 20px;">
                            <p>Dear <strong>{user_name}</strong>,</p>
                            
                            <p>Your claim (Claim #<strong>{claim_number}</strong>) requires additional verification before approval.</p>
                            
                            <div style="background: #ffebee; padding: 15px; border-left: 4px solid #d32f2f; margin: 20px 0;">
                                <h3 style="margin-top: 0;">Risk Level: {risk_level.upper()}</h3>
                                <p>Our fraud detection system has flagged this claim for additional review. This is a standard security measure to protect our policyholders.</p>
                            </div>
                            
                            <p><strong>What You Need To Do:</strong></p>
                            <ol>
                                <li>Review the documents you submitted</li>
                                <li>Ensure all documents are clear and complete</li>
                                <li>Provide any additional supporting documents if requested</li>
                                <li>Our team will contact you within 24-48 hours</li>
                            </ol>
                            
                            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0;"><strong>ℹ️ This is routine</strong></p>
                                <p style="margin: 5px 0;">Claims require verification to maintain insurance integrity. Your cooperation will help us process your claim faster.</p>
                            </div>
                            
                            <p><strong>Questions?</strong></p>
                            <p>Contact our claims team: support@insuranceapp.com or call 1-800-INSURANCE</p>
                            
                            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999;">
                                This is an automated email. Please do not reply directly to this message.
                            </p>
                        </div>
                    </div>
                </body>
            </html>
            """
            
            logger.info(f"FRAUD ALERT EMAIL SENT TO: {user_email}")
            logger.info(f"SUBJECT: {subject}")
            logger.info(f"Claim: {claim_number} - Risk: {risk_level}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error sending fraud alert: {str(e)}")
            return False
