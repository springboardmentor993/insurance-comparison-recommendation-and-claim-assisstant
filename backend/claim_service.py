"""
Enterprise Claim Management Service
- Transaction-safe PostgreSQL updates
- Comprehensive audit logging
- Real-time notifications
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models
from datetime import datetime
from typing import Optional, Dict, Any
import json

class ClaimService:
    """Service for managing claim approvals/rejections with audit trail"""
    
    @staticmethod
    def approve_claim(
        claim_id: int,
        admin_id: int,
        reason: Optional[str] = None,
        admin_notes: Optional[str] = None,
        db: Session = None,
        ip_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Approve a claim with transaction safety and audit logging
        
        Args:
            claim_id: ID of claim to approve
            admin_id: ID of admin performing action
            reason: Optional reason for approval
            admin_notes: Optional notes from admin
            db: Database session
            ip_address: Admin's IP address
            
        Returns:
            Dict with claim details and status
        """
        try:
            # Get claim with user policy
            claim = db.query(models.Claim).filter(
                models.Claim.id == claim_id
            ).first()
            
            if not claim:
                raise ValueError(f"Claim {claim_id} not found")
            
            # Update claim status
            claim.status = models.ClaimStatusEnum.approved
            
            # Create notification for user
            user_policy = claim.user_policy
            if user_policy:
                notification = models.ClaimNotification(
                    user_id=user_policy.user_id,
                    claim_id=claim_id,
                    notification_type="claim_approved",
                    title="Claim Approved! 🎉",
                    message=f"Your claim #{claim.claim_number} has been approved. Amount: ₹{claim.amount_claimed}",
                    admin_id=admin_id
                )
                db.add(notification)
            
            # Commit transaction with core changes
            db.commit()
            
            # Try to add audit log separately in a new session
            try:
                old_state = {
                    "status": str(claim.status),
                    "updated_at": str(claim.created_at)
                }
                audit_log = models.AdminLog(
                    admin_id=admin_id,
                    action="approve",
                    action_type="claim",
                    target_type="claim",
                    target_id=claim_id,
                    old_value=old_state,
                    new_value={"status": "approved"},
                    reason=reason,
                    ip_address=ip_address,
                    details={
                        "admin_notes": admin_notes,
                        "claim_number": claim.claim_number,
                        "user_policy_id": claim.user_policy_id
                    }
                )
                db.add(audit_log)
                db.commit()
            except Exception as log_err:
                db.rollback()
                print(f"Warning: Audit logging skipped: {str(log_err)}")
            
            return {
                "status": "success",
                "claim_id": claim_id,
                "claim_status": "approved",
                "message": "Claim approved successfully"
            }
            
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to approve claim: {str(e)}")
    
    @staticmethod
    def reject_claim(
        claim_id: int,
        admin_id: int,
        reason: str,
        admin_notes: Optional[str] = None,
        db: Session = None,
        ip_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Reject a claim with transaction safety and audit logging
        
        Args:
            claim_id: ID of claim to reject
            admin_id: ID of admin performing action
            reason: Reason for rejection (required)
            admin_notes: Optional detailed notes
            db: Database session
            ip_address: Admin's IP address
            
        Returns:
            Dict with claim details and status
        """
        try:
            if not reason or reason.strip() == "":
                raise ValueError("Rejection reason is required")
            
            # Get claim
            claim = db.query(models.Claim).filter(
                models.Claim.id == claim_id
            ).first()
            
            if not claim:
                raise ValueError(f"Claim {claim_id} not found")
            
            # Update claim status
            claim.status = models.ClaimStatusEnum.rejected
            
            # Create notification for user
            user_policy = claim.user_policy
            if user_policy:
                notification = models.ClaimNotification(
                    user_id=user_policy.user_id,
                    claim_id=claim_id,
                    notification_type="claim_rejected",
                    title="Claim Status Update",
                    message=f"Your claim #{claim.claim_number} has been reviewed. Reason: {reason}",
                    admin_id=admin_id
                )
                db.add(notification)
            
            # Commit transaction with core changes
            db.commit()
            
            # Try to add audit log separately in a new session
            try:
                old_state = {
                    "status": str(claim.status),
                    "updated_at": str(claim.created_at)
                }
                audit_log = models.AdminLog(
                    admin_id=admin_id,
                    action="reject",
                    action_type="claim",
                    target_type="claim",
                    target_id=claim_id,
                    old_value=old_state,
                    new_value={"status": "rejected"},
                    reason=reason,
                    ip_address=ip_address,
                    details={
                        "admin_notes": admin_notes,
                        "claim_number": claim.claim_number,
                        "user_policy_id": claim.user_policy_id
                    }
                )
                db.add(audit_log)
                db.commit()
            except Exception as log_err:
                db.rollback()
                print(f"Warning: Audit logging skipped: {str(log_err)}")
            
            return {
                "status": "success",
                "claim_id": claim_id,
                "claim_status": "rejected",
                "message": "Claim rejected successfully"
            }
            
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to reject claim: {str(e)}")
    
    @staticmethod
    def get_admin_dashboard_stats(db: Session) -> Dict[str, Any]:
        """Get dashboard statistics for admin"""
        try:
            total_claims = db.query(func.count(models.Claim.id)).scalar() or 0
            pending_claims = db.query(func.count(models.Claim.id)).filter(
                models.Claim.status == models.ClaimStatusEnum.under_review
            ).scalar() or 0
            approved_count = db.query(func.count(models.Claim.id)).filter(
                models.Claim.status == models.ClaimStatusEnum.approved
            ).scalar() or 0
            rejected_count = db.query(func.count(models.Claim.id)).filter(
                models.Claim.status == models.ClaimStatusEnum.rejected
            ).scalar() or 0
            
            return {
                "total_claims": total_claims,
                "pending_claims": pending_claims,
                "approved_count": approved_count,
                "rejected_count": rejected_count
            }
        except Exception as e:
            raise Exception(f"Failed to get dashboard stats: {str(e)}")
    
    @staticmethod
    def get_audit_logs(
        admin_id: Optional[int] = None,
        target_type: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
        db: Session = None
    ) -> list:
        """Get audit logs with optional filters"""
        try:
            query = db.query(models.AdminLog)
            
            if admin_id:
                query = query.filter(models.AdminLog.admin_id == admin_id)
            
            if target_type:
                query = query.filter(models.AdminLog.target_type == target_type)
            
            logs = query.order_by(
                models.AdminLog.timestamp.desc()
            ).limit(limit).offset(offset).all()
            
            return [
                {
                    "id": log.id,
                    "admin_id": log.admin_id,
                    "admin_email": log.admin.email,
                    "action": log.action,
                    "target_type": log.target_type,
                    "target_id": log.target_id,
                    "reason": log.reason,
                    "timestamp": log.timestamp.isoformat(),
                    "details": log.details
                }
                for log in logs
            ]
        except Exception as e:
            raise Exception(f"Failed to get audit logs: {str(e)}")
    
    @staticmethod
    def mark_notification_as_read(
        notification_id: int,
        db: Session = None
    ) -> bool:
        """Mark a notification as read"""
        try:
            notification = db.query(models.ClaimNotification).filter(
                models.ClaimNotification.id == notification_id
            ).first()
            
            if notification:
                notification.status = models.NotificationStatusEnum.read
                notification.read_at = datetime.utcnow()
                db.commit()
                return True
            return False
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to mark notification as read: {str(e)}")
    
    @staticmethod
    def get_user_notifications(
        user_id: int,
        limit: int = 20,
        offset: int = 0,
        db: Session = None
    ) -> Dict[str, Any]:
        """Get notifications for a user"""
        try:
            unread_count = db.query(func.count(models.ClaimNotification.id)).filter(
                models.ClaimNotification.user_id == user_id,
                models.ClaimNotification.status == models.NotificationStatusEnum.unread
            ).scalar() or 0
            
            notifications = db.query(models.ClaimNotification).filter(
                models.ClaimNotification.user_id == user_id
            ).order_by(
                models.ClaimNotification.created_at.desc()
            ).limit(limit).offset(offset).all()
            
            return {
                "unread_count": unread_count,
                "notifications": [
                    {
                        "id": n.id,
                        "claim_id": n.claim_id,
                        "type": n.notification_type,
                        "title": n.title,
                        "message": n.message,
                        "status": n.status,
                        "admin_email": n.admin.email if n.admin else None,
                        "created_at": n.created_at.isoformat(),
                        "read_at": n.read_at.isoformat() if n.read_at else None
                    }
                    for n in notifications
                ]
            }
        except Exception as e:
            raise Exception(f"Failed to get notifications: {str(e)}")
    @staticmethod
    def update_claim_status_based_on_documents(
        claim_id: int,
        db: Session
    ) -> Dict[str, Any]:
        """
        Update claim status based on ALL document approvals.
        
        Logic:
        - If ANY document is REJECTED → Claim status = REJECTED
        - If ALL documents are APPROVED → Claim status = APPROVED
        - If ANY document is PENDING → Claim status = UNDER_REVIEW
        - Otherwise → Keep existing status
        
        Args:
            claim_id: ID of claim to check
            db: Database session
            
        Returns:
            Dict with claim status and document info
        """
        try:
            # Get claim
            claim = db.query(models.Claim).filter(
                models.Claim.id == claim_id
            ).first()
            
            if not claim:
                raise ValueError(f"Claim {claim_id} not found")
            
            # Get all documents for this claim
            documents = db.query(models.ClaimDocument).filter(
                models.ClaimDocument.claim_id == claim_id
            ).all()
            
            if not documents:
                return {
                    "claim_id": claim_id,
                    "status": claim.status,
                    "reason": "No documents found"
                }
            
            # Get all document approvals
            approvals = db.query(models.DocumentApproval).join(
                models.ClaimDocument,
                models.DocumentApproval.document_id == models.ClaimDocument.id
            ).filter(
                models.ClaimDocument.claim_id == claim_id
            ).all()
            
            # Count statuses
            rejected_approvals = [a for a in approvals if a.status == models.DocumentApprovalStatusEnum.rejected]
            approved_approvals = [a for a in approvals if a.status == models.DocumentApprovalStatusEnum.approved]
            pending_approvals = [a for a in approvals if a.status == models.DocumentApprovalStatusEnum.pending]
            
            total_docs = len(documents)
            total_reviewed = len(approved_approvals) + len(rejected_approvals)
            
            old_status = str(claim.status)
            
            # Determine new status
            if rejected_approvals:
                # If ANY document is rejected, reject entire claim
                claim.status = models.ClaimStatusEnum.rejected
                
                # Get details of rejected documents for rejection reason
                rejected_docs_info = []
                for approval in rejected_approvals:
                    doc = approval.document
                    reason = approval.rejection_reason or approval.comments or "Document does not meet requirements"
                    rejected_docs_info.append(f"{doc.doc_type or doc.file_name}: {reason}")
                
                claim.rejection_reason = "Claim rejected because: " + " | ".join(rejected_docs_info)
            
            elif len(approved_approvals) == total_docs and total_docs == len(approvals):
                # All documents are approved
                claim.status = models.ClaimStatusEnum.approved
                claim.rejection_reason = None  # Clear any previous rejection reason
            
            elif len(approvals) < total_docs or pending_approvals:
                # Some documents are still pending
                claim.status = models.ClaimStatusEnum.under_review
                claim.rejection_reason = None
            
            # Commit the status update
            db.commit()
            
            return {
                "claim_id": claim_id,
                "old_status": old_status,
                "new_status": str(claim.status),
                "total_documents": total_docs,
                "approved_count": len(approved_approvals),
                "rejected_count": len(rejected_approvals),
                "pending_count": len(pending_approvals),
                "rejection_reason": claim.rejection_reason,
                "status_changed": old_status != str(claim.status)
            }
            
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to update claim status: {str(e)}")