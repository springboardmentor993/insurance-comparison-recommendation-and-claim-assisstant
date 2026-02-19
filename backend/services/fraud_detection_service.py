"""Automated fraud detection service with rule-based checks.

Implements fraud detection rules according to specification:
- Duplicate document detection
- Amount anomaly detection
- Suspicious timing patterns
- Policy age vs claim timing
- Rapid succession claims
"""
import hashlib
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func

from models.models import Claim, ClaimDocument, UserPolicy, Policy, FraudFlag


class FraudDetectionService:
    """Service for automated fraud detection on insurance claims."""
    
    # Fraud rule codes
    DUPLICATE_DOC = "DUPLICATE_DOC"
    AMOUNT_ANOMALY = "AMOUNT_ANOMALY"
    SUSPICIOUS_TIMING = "SUSPICIOUS_TIMING"
    NEW_POLICY_CLAIM = "NEW_POLICY_CLAIM"
    RAPID_SUCCESSION = "RAPID_SUCCESSION"
    
    # Severity levels
    SEVERITY_LOW = "low"
    SEVERITY_MEDIUM = "medium"
    SEVERITY_HIGH = "high"
    
    def __init__(self, db: Session):
        self.db = db
    
    def check_all_rules(self, claim: Claim) -> List[FraudFlag]:
        """Run all fraud detection rules on a claim.
        
        Returns list of fraud flags if violations detected.
        """
        flags = []
        
        # Run each detection rule
        flags.extend(self._check_amount_anomaly(claim))
        flags.extend(self._check_suspicious_timing(claim))
        flags.extend(self._check_new_policy_claim(claim))
        flags.extend(self._check_rapid_succession(claim))
        
        return flags
    
    def check_document_duplicates(self, claim_id: int, file_content: bytes, filename: str) -> Optional[FraudFlag]:
        """Check if uploaded document is a duplicate from another claim.
        
        Args:
            claim_id: Current claim ID
            file_content: Binary content of uploaded file
            filename: Original filename
            
        Returns:
            FraudFlag if duplicate detected, None otherwise
        """
        # Calculate file hash
        file_hash = hashlib.sha256(file_content).hexdigest()
        
        # Check if this hash exists in other claims
        existing_docs = self.db.query(ClaimDocument).filter(
            ClaimDocument.claim_id != claim_id
        ).all()
        
        for doc in existing_docs:
            # For existing docs, we'd need to read and hash them
            # For now, we'll just check filename similarity as proxy
            if doc.file_url and filename in doc.file_url:
                details = {
                    "file_hash": file_hash,
                    "duplicate_claim_id": doc.claim_id,
                    "duplicate_doc_id": doc.id,
                    "filename": filename,
                    "timestamp": datetime.now().isoformat()
                }
                
                return FraudFlag(
                    claim_id=claim_id,
                    rule_code=self.DUPLICATE_DOC,
                    severity=self.SEVERITY_HIGH,
                    details=json.dumps(details)
                )
        
        return None
    
    def _check_amount_anomaly(self, claim: Claim) -> List[FraudFlag]:
        """Detect claims with unusually high amounts (statistical outliers)."""
        flags = []
        
        # Get user policy and policy type
        user_policy = self.db.query(UserPolicy).filter(
            UserPolicy.id == claim.user_policy_id
        ).first()
        
        if not user_policy:
            return flags
        
        policy = self.db.query(Policy).filter(
            Policy.id == user_policy.policy_id
        ).first()
        
        if not policy:
            return flags
        
        # Get all claims for this policy type
        similar_claims = self.db.query(Claim).join(UserPolicy).join(Policy).filter(
            Policy.policy_type == policy.policy_type,
            Claim.status.in_(['submitted', 'under_review', 'approved'])
        ).all()
        
        if len(similar_claims) < 3:
            # Need sufficient data for statistical analysis
            return flags
        
        # Calculate mean and standard deviation
        amounts = [float(c.amount_claimed) for c in similar_claims]
        mean_amount = sum(amounts) / len(amounts)
        variance = sum((x - mean_amount) ** 2 for x in amounts) / len(amounts)
        std_dev = variance ** 0.5
        
        # Flag if amount is > 2.5 standard deviations above mean
        claim_amount = float(claim.amount_claimed)
        threshold = mean_amount + (2.5 * std_dev)
        
        if claim_amount > threshold:
            severity = self.SEVERITY_HIGH if claim_amount > mean_amount + (3 * std_dev) else self.SEVERITY_MEDIUM
            
            details = {
                "claim_amount": claim_amount,
                "mean_amount": round(mean_amount, 2),
                "std_dev": round(std_dev, 2),
                "threshold": round(threshold, 2),
                "deviation_factor": round((claim_amount - mean_amount) / std_dev, 2),
                "policy_type": policy.policy_type,
                "sample_size": len(similar_claims)
            }
            
            flags.append(FraudFlag(
                claim_id=claim.id,
                rule_code=self.AMOUNT_ANOMALY,
                severity=severity,
                details=json.dumps(details)
            ))
        
        return flags
    
    def _check_suspicious_timing(self, claim: Claim) -> List[FraudFlag]:
        """Detect multiple claims within a short time period."""
        flags = []
        
        # Get user policy
        user_policy = self.db.query(UserPolicy).filter(
            UserPolicy.id == claim.user_policy_id
        ).first()
        
        if not user_policy:
            return flags
        
        # Get all user's policy IDs
        user_policy_ids = [
            up.id for up in self.db.query(UserPolicy).filter(
                UserPolicy.user_id == user_policy.user_id
            ).all()
        ]
        
        # Count claims in last 30 days
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_claims = self.db.query(Claim).filter(
            Claim.user_policy_id.in_(user_policy_ids),
            Claim.created_at >= thirty_days_ago,
            Claim.id != claim.id
        ).all()
        
        # Flag if 3 or more claims in 30 days
        if len(recent_claims) >= 2:  # Current + 2 = 3 total
            details = {
                "recent_claims_count": len(recent_claims) + 1,
                "time_window_days": 30,
                "claim_ids": [c.id for c in recent_claims] + [claim.id],
                "timestamp": datetime.now().isoformat()
            }
            
            flags.append(FraudFlag(
                claim_id=claim.id,
                rule_code=self.SUSPICIOUS_TIMING,
                severity=self.SEVERITY_MEDIUM,
                details=json.dumps(details)
            ))
        
        return flags
    
    def _check_new_policy_claim(self, claim: Claim) -> List[FraudFlag]:
        """Detect claims filed too soon after policy purchase."""
        flags = []
        
        # Get user policy
        user_policy = self.db.query(UserPolicy).filter(
            UserPolicy.id == claim.user_policy_id
        ).first()
        
        if not user_policy or not user_policy.start_date:
            return flags
        
        # Calculate days since policy start
        policy_start = user_policy.start_date
        claim_date = claim.created_at.date() if claim.created_at else datetime.now().date()
        days_since_start = (claim_date - policy_start).days
        
        # Flag if claim within 15 days of policy start
        if days_since_start <= 15:
            details = {
                "policy_start_date": policy_start.isoformat(),
                "claim_date": claim_date.isoformat(),
                "days_since_start": days_since_start,
                "policy_number": user_policy.policy_number
            }
            
            flags.append(FraudFlag(
                claim_id=claim.id,
                rule_code=self.NEW_POLICY_CLAIM,
                severity=self.SEVERITY_LOW,
                details=json.dumps(details)
            ))
        
        return flags
    
    def _check_rapid_succession(self, claim: Claim) -> List[FraudFlag]:
        """Detect claims filed in rapid succession (within 7 days of previous)."""
        flags = []
        
        # Get user policy
        user_policy = self.db.query(UserPolicy).filter(
            UserPolicy.id == claim.user_policy_id
        ).first()
        
        if not user_policy:
            return flags
        
        # Find most recent previous claim
        seven_days_ago = datetime.now() - timedelta(days=7)
        recent_claim = self.db.query(Claim).filter(
            Claim.user_policy_id == claim.user_policy_id,
            Claim.id != claim.id,
            Claim.created_at >= seven_days_ago
        ).order_by(Claim.created_at.desc()).first()
        
        if recent_claim:
            days_between = (claim.created_at - recent_claim.created_at).days
            
            details = {
                "previous_claim_id": recent_claim.id,
                "previous_claim_number": recent_claim.claim_number,
                "days_between_claims": days_between,
                "previous_claim_amount": float(recent_claim.amount_claimed),
                "current_claim_amount": float(claim.amount_claimed)
            }
            
            flags.append(FraudFlag(
                claim_id=claim.id,
                rule_code=self.RAPID_SUCCESSION,
                severity=self.SEVERITY_HIGH,
                details=json.dumps(details)
            ))
        
        return flags
    
    def save_fraud_flags(self, flags: List[FraudFlag]) -> int:
        """Save fraud flags to database.
        
        Returns:
            Number of flags saved
        """
        if not flags:
            return 0
        
        for flag in flags:
            self.db.add(flag)
        
        self.db.commit()
        return len(flags)
    
    def get_claim_fraud_summary(self, claim_id: int) -> Dict:
        """Get fraud detection summary for a claim.
        
        Returns:
            Dictionary with fraud detection results
        """
        flags = self.db.query(FraudFlag).filter(
            FraudFlag.claim_id == claim_id
        ).all()
        
        if not flags:
            return {
                "has_fraud_flags": False,
                "flag_count": 0,
                "highest_severity": None,
                "flags": []
            }
        
        # Determine highest severity
        severities = [f.severity for f in flags if f.severity]
        severity_order = {self.SEVERITY_HIGH: 3, self.SEVERITY_MEDIUM: 2, self.SEVERITY_LOW: 1}
        highest_severity = max(severities, key=lambda s: severity_order.get(s, 0)) if severities else None
        
        return {
            "has_fraud_flags": True,
            "flag_count": len(flags),
            "highest_severity": highest_severity,
            "flags": [
                {
                    "id": f.id,
                    "rule_code": f.rule_code,
                    "severity": f.severity,
                    "details": json.loads(f.details) if f.details else None,
                    "created_at": f.created_at.isoformat() if f.created_at else None
                }
                for f in flags
            ]
        }


def detect_fraud_on_claim(claim_id: int, db: Session) -> Dict:
    """Convenience function to run fraud detection on a claim.
    
    Args:
        claim_id: ID of the claim to check
        db: Database session
        
    Returns:
        Fraud detection summary
    """
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise ValueError(f"Claim {claim_id} not found")
    
    service = FraudDetectionService(db)
    flags = service.check_all_rules(claim)
    service.save_fraud_flags(flags)
    
    return service.get_claim_fraud_summary(claim_id)
