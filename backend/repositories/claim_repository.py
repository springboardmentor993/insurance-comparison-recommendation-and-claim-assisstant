"""
Claim repository for claim data access.

Single Responsibility: Only handles Claim and related entity data operations.
"""
from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from .base import BaseRepository
from models.models import Claim, ClaimDocument, UserPolicy, FraudFlag, AdminLog


class ClaimRepository(BaseRepository[Claim]):
    """
    Repository for Claim entity operations.
    
    Provides specialized queries for claims, documents, and fraud flags.
    """
    
    def __init__(self, db: Session):
        super().__init__(db, Claim)
    
    def get_by_claim_number(self, claim_number: str) -> Optional[Claim]:
        """
        Get claim by claim number.
        
        Args:
            claim_number: Unique claim number (e.g., CLM-2026-000001)
            
        Returns:
            Claim if found, None otherwise
        """
        return self._db.query(Claim).filter(Claim.claim_number == claim_number).first()
    
    def get_by_user_policy(self, user_policy_id: int) -> List[Claim]:
        """
        Get all claims for a user policy.
        
        Args:
            user_policy_id: ID of the user policy
            
        Returns:
            List of claims for this policy
        """
        return self._db.query(Claim).filter(
            Claim.user_policy_id == user_policy_id
        ).order_by(Claim.created_at.desc()).all()
    
    def get_user_claims(self, user_policy_ids: List[int], status: Optional[str] = None) -> List[Claim]:
        """
        Get all claims for multiple user policies.
        
        Args:
            user_policy_ids: List of user policy IDs
            status: Optional status filter
            
        Returns:
            List of matching claims
        """
        query = self._db.query(Claim).filter(Claim.user_policy_id.in_(user_policy_ids))
        if status:
            query = query.filter(Claim.status == status)
        return query.order_by(Claim.created_at.desc()).all()
    
    def get_by_status(self, status: str, limit: int = 50, offset: int = 0) -> List[Claim]:
        """
        Get claims by status.
        
        Args:
            status: Claim status (submitted, under_review, approved, rejected, paid)
            limit: Maximum number of results
            offset: Number of results to skip
            
        Returns:
            List of claims with the given status
        """
        return self._db.query(Claim).filter(
            Claim.status == status
        ).order_by(Claim.created_at.desc()).limit(limit).offset(offset).all()
    
    def get_flagged_claims(self, limit: int = 50, offset: int = 0) -> List[Claim]:
        """
        Get claims that have been flagged for fraud.
        
        Args:
            limit: Maximum number of results
            offset: Number of results to skip
            
        Returns:
            List of flagged claims
        """
        flagged_ids = [f.claim_id for f in self._db.query(FraudFlag.claim_id).all()]
        return self._db.query(Claim).filter(
            Claim.id.in_(flagged_ids)
        ).order_by(Claim.created_at.desc()).limit(limit).offset(offset).all()
    
    def generate_claim_number(self) -> str:
        """
        Generate unique claim number in format: CLM-YYYY-NNNNNN.
        
        Returns:
            New unique claim number
        """
        year = datetime.now().year
        count = self._db.query(Claim).filter(
            Claim.claim_number.like(f"CLM-{year}-%")
        ).count()
        return f"CLM-{year}-{count + 1:06d}"
    
    def update_status(self, claim_id: int, new_status: str) -> Optional[Claim]:
        """
        Update claim status.
        
        Args:
            claim_id: ID of the claim
            new_status: New status value
            
        Returns:
            Updated claim, or None if not found
        """
        claim = self.get_by_id(claim_id)
        if claim:
            claim.status = new_status
            self._db.commit()
            self._db.refresh(claim)
        return claim
    
    # Document operations
    
    def add_document(self, claim_id: int, file_url: str, doc_type: str) -> ClaimDocument:
        """
        Add a document to a claim.
        
        Args:
            claim_id: ID of the claim
            file_url: Path/URL to the uploaded file
            doc_type: Type of document (medical_report, invoice, etc.)
            
        Returns:
            Created ClaimDocument
        """
        document = ClaimDocument(
            claim_id=claim_id,
            file_url=file_url,
            doc_type=doc_type
        )
        self._db.add(document)
        self._db.commit()
        self._db.refresh(document)
        return document
    
    def get_documents(self, claim_id: int) -> List[ClaimDocument]:
        """
        Get all documents for a claim.
        
        Args:
            claim_id: ID of the claim
            
        Returns:
            List of claim documents
        """
        return self._db.query(ClaimDocument).filter(
            ClaimDocument.claim_id == claim_id
        ).all()
    
    # Fraud flag operations
    
    def add_fraud_flag(self, claim_id: int, reason: str, flagged_by: int) -> FraudFlag:
        """
        Flag a claim as potentially fraudulent.
        
        Args:
            claim_id: ID of the claim
            reason: Reason for flagging
            flagged_by: Admin user ID who flagged
            
        Returns:
            Created FraudFlag
        """
        flag = FraudFlag(
            claim_id=claim_id,
            reason=reason,
            flagged_by=flagged_by
        )
        self._db.add(flag)
        self._db.commit()
        self._db.refresh(flag)
        return flag
    
    def get_fraud_flags(self, claim_id: int) -> List[FraudFlag]:
        """
        Get all fraud flags for a claim.
        
        Args:
            claim_id: ID of the claim
            
        Returns:
            List of fraud flags
        """
        return self._db.query(FraudFlag).filter(
            FraudFlag.claim_id == claim_id
        ).all()
    
    # Statistics
    
    def get_stats(self) -> dict:
        """
        Get claim statistics for admin dashboard.
        
        Returns:
            Dictionary with claim statistics
        """
        total = self._db.query(func.count(Claim.id)).scalar()
        pending = self._db.query(func.count(Claim.id)).filter(
            Claim.status == "submitted"
        ).scalar()
        approved = self._db.query(func.count(Claim.id)).filter(
            Claim.status == "approved"
        ).scalar()
        rejected = self._db.query(func.count(Claim.id)).filter(
            Claim.status == "rejected"
        ).scalar()
        total_amount = self._db.query(func.sum(Claim.amount_claimed)).scalar() or 0
        approved_amount = self._db.query(func.sum(Claim.amount_claimed)).filter(
            Claim.status.in_(["approved", "paid"])
        ).scalar() or 0
        
        return {
            "total_claims": total,
            "pending_claims": pending,
            "approved_claims": approved,
            "rejected_claims": rejected,
            "total_amount_claimed": float(total_amount),
            "total_amount_approved": float(approved_amount)
        }
