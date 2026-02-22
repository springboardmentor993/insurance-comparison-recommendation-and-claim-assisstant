"""
Week 7: Fraud Rules Engine
Detects fraudulent claims based on multiple rules and severity levels
"""

from datetime import datetime, timedelta
from decimal import Decimal
from typing import List, Dict, Tuple
from sqlalchemy.orm import Session
from . import models

class FraudRule:
    """Base class for all fraud detection rules"""
    code: str
    name: str
    severity: str
    
    def check(self, db: Session, claim: models.Claim) -> Tuple[bool, str]:
        """
        Returns (is_fraud, details)
        """
        raise NotImplementedError


class DuplicateDocumentRule(FraudRule):
    """
    Rule 1: Detect duplicate/similar documents in claim
    Multiple claims with identical documents within short period
    """
    code = "DUPLICATE_DOCS"
    name = "Duplicate Documents Detected"
    severity = "medium"
    
    def check(self, db: Session, claim: models.Claim) -> Tuple[bool, str]:
        """Check if claim has duplicate documents as other recent claims"""
        try:
            # Get file URLs from current claim
            current_docs = {doc.file_url for doc in claim.documents}
            
            if not current_docs:
                return False, ""
            
            # Check last 30 days for same docs
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            recent_claims = db.query(models.Claim).filter(
                models.Claim.id != claim.id,
                models.Claim.created_at >= thirty_days_ago,
                models.Claim.user_policy.user_id == claim.user_policy.user_id
            ).all()
            
            for other_claim in recent_claims:
                other_docs = {doc.file_url for doc in other_claim.documents}
                # Check for overlap
                overlap = current_docs & other_docs
                if overlap:
                    return True, f"Found {len(overlap)} duplicate document(s) in claim #{other_claim.claim_number}"
            
            return False, ""
        except Exception as e:
            return False, f"Error checking duplicates: {str(e)}"


class SuspiciousTimingRule(FraudRule):
    """
    Rule 2: Suspicious claim timing
    Claim filed too soon after policy purchase or just before expiry
    """
    code = "SUSPICIOUS_TIMING"
    name = "Suspicious Claim Timing"
    severity = "high"
    
    def check(self, db: Session, claim: models.Claim) -> Tuple[bool, str]:
        """Check if claim timing is suspicious relative to policy"""
        try:
            user_policy = claim.user_policy
            
            # Rule 2a: Claim within 7 days of policy start
            days_from_start = (claim.incident_date - user_policy.start_date).days
            if days_from_start <= 7 and days_from_start >= 0:
                return True, f"Claim filed only {days_from_start} days after policy purchase"
            
            # Rule 2b: Claim within 7 days of policy expiry
            days_to_expiry = (user_policy.end_date - claim.incident_date).days
            if 0 <= days_to_expiry <= 7:
                return True, f"Claim filed {days_to_expiry} days before policy expiry"
            
            return False, ""
        except Exception as e:
            return False, f"Error checking timing: {str(e)}"


class ExcessiveAmountRule(FraudRule):
    """
    Rule 3: Claim amount exceeds coverage or is unusually high
    """
    code = "EXCESSIVE_AMOUNT"
    name = "Claim Amount Exceeds Coverage"
    severity = "high"
    
    def check(self, db: Session, claim: models.Claim) -> Tuple[bool, str]:
        """Check if claim amount is excessive"""
        try:
            policy = claim.user_policy.policy
            claim_amount = Decimal(str(claim.amount_claimed))
            deductible = Decimal(str(policy.deductible))
            premium = Decimal(str(policy.premium))
            
            # Rule 3a: Claim exceeds deductible by 10x
            if deductible > 0 and claim_amount > deductible * 10:
                return True, f"Claim amount (${claim_amount}) is {claim_amount/deductible:.1f}x the deductible"
            
            # Rule 3b: Claim exceeds annual premium by 50x
            annual_premium = premium * 12
            if claim_amount > annual_premium * 50:
                return True, f"Claim amount (${claim_amount}) exceeds 50x annual premium"
            
            return False, ""
        except Exception as e:
            return False, f"Error checking amount: {str(e)}"


class MultipleClaimsRule(FraudRule):
    """
    Rule 4: Multiple claims in short timeframe
    More than 3 claims in 30 days for same user
    """
    code = "MULTIPLE_CLAIMS"
    name = "Multiple Claims in Short Period"
    severity = "medium"
    
    def check(self, db: Session, claim: models.Claim) -> Tuple[bool, str]:
        """Check if user has filed multiple claims recently"""
        try:
            user = claim.user_policy.user
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            
            # Count claims in last 30 days
            claim_count = db.query(models.Claim).join(
                models.UserPolicy
            ).filter(
                models.UserPolicy.user_id == user.id,
                models.Claim.created_at >= thirty_days_ago
            ).count()
            
            if claim_count > 3:
                return True, f"User has filed {claim_count} claims in the last 30 days"
            
            return False, ""
        except Exception as e:
            return False, f"Error checking multiple claims: {str(e)}"


class MissingDocumentsRule(FraudRule):
    """
    Rule 5: Claim submitted with missing or insufficient documents
    """
    code = "MISSING_DOCUMENTS"
    name = "Missing Required Documents"
    severity = "low"
    
    def check(self, db: Session, claim: models.Claim) -> Tuple[bool, str]:
        """Check if claim has required documents"""
        try:
            doc_types = {doc.doc_type for doc in claim.documents}
            
            # Required documents vary by claim type
            required_docs = {
                "auto": {"Police Report", "Photos"},
                "health": {"Medical Report", "Prescription"},
                "home": {"Police Report", "Photos", "Estimate"},
                "life": {"Death Certificate", "Medical Report"},
                "travel": {"Incident Report", "Medical Report"}
            }
            
            policy_type = claim.user_policy.policy.policy_type
            required = required_docs.get(policy_type, set())
            missing = required - doc_types
            
            if missing:
                return True, f"Missing documents: {', '.join(missing)}"
            
            return False, ""
        except Exception as e:
            return False, f"Error checking documents: {str(e)}"


class HighValueClaimRule(FraudRule):
    """
    Rule 6: High-value claims requiring additional review
    Claims exceeding 80% of annual premium
    """
    code = "HIGH_VALUE_CLAIM"
    name = "High-Value Claim Flag"
    severity = "medium"
    
    def check(self, db: Session, claim: models.Claim) -> Tuple[bool, str]:
        """Flag high-value claims for review"""
        try:
            policy = claim.user_policy.policy
            claim_amount = Decimal(str(claim.amount_claimed))
            premium = Decimal(str(policy.premium))
            
            annual_premium = premium * 12
            threshold = annual_premium * Decimal("0.8")
            
            if claim_amount > threshold:
                percentage = (claim_amount / annual_premium * 100)
                return True, f"Claim is {percentage:.0f}% of annual premium and requires review"
            
            return False, ""
        except Exception as e:
            return False, f"Error checking value: {str(e)}"


class PreviousFraudHistoryRule(FraudRule):
    """
    Rule 7: User has previous fraud flags
    """
    code = "FRAUD_HISTORY"
    name = "Previous Fraud Activity"
    severity = "high"
    
    def check(self, db: Session, claim: models.Claim) -> Tuple[bool, str]:
        """Check if user has previous fraud flags"""
        try:
            user = claim.user_policy.user
            
            # Check for previous high/medium severity flags
            previous_flags = db.query(models.FraudFlag).join(
                models.Claim
            ).join(
                models.UserPolicy
            ).filter(
                models.UserPolicy.user_id == user.id,
                models.Claim.id != claim.id,
                models.FraudFlag.severity.in_(["high", "medium"])
            ).count()
            
            if previous_flags > 0:
                return True, f"User has {previous_flags} previous fraud flag(s)"
            
            return False, ""
        except Exception as e:
            return False, f"Error checking history: {str(e)}"


class UnrealisticIncidentDateRule(FraudRule):
    """
    Rule 8: Incident date is in the future or very old
    """
    code = "UNREALISTIC_DATE"
    name = "Unrealistic Incident Date"
    severity = "high"
    
    def check(self, db: Session, claim: models.Claim) -> Tuple[bool, str]:
        """Check if incident date is realistic"""
        try:
            incident_date = claim.incident_date
            today = datetime.utcnow().date()
            
            # Rule 8a: Incident date is in the future
            if incident_date > today:
                return True, "Incident date is in the future"
            
            # Rule 8b: Incident date is before policy start
            if incident_date < claim.user_policy.start_date:
                return True, "Incident date is before policy start date"
            
            # Rule 8c: Incident date is more than 2 years old
            two_years_ago = today.replace(year=today.year - 2)
            if incident_date < two_years_ago:
                return True, "Claim is for incident more than 2 years old"
            
            return False, ""
        except Exception as e:
            return False, f"Error checking date: {str(e)}"


# All fraud rules
ALL_FRAUD_RULES = [
    DuplicateDocumentRule(),
    SuspiciousTimingRule(),
    ExcessiveAmountRule(),
    MultipleClaimsRule(),
    MissingDocumentsRule(),
    HighValueClaimRule(),
    PreviousFraudHistoryRule(),
    UnrealisticIncidentDateRule(),
]


def check_claim_for_fraud(db: Session, claim: models.Claim) -> List[models.FraudFlag]:
    """
    Run all fraud detection rules on a claim and create FraudFlag records
    
    Returns: List of FraudFlag objects created
    """
    fraud_flags = []
    
    for rule in ALL_FRAUD_RULES:
        try:
            is_fraud, details = rule.check(db, claim)
            
            if is_fraud:
                # Map rule severity to enum
                severity_map = {
                    "low": models.FraudSeverityEnum.low,
                    "medium": models.FraudSeverityEnum.medium,
                    "high": models.FraudSeverityEnum.high
                }
                
                flag = models.FraudFlag(
                    claim_id=claim.id,
                    rule_code=rule.code,
                    severity=severity_map[rule.severity],
                    details=details,
                    created_at=datetime.utcnow()
                )
                db.add(flag)
                fraud_flags.append(flag)
        except Exception as e:
            print(f"Error running rule {rule.code}: {str(e)}")
    
    db.commit()
    return fraud_flags


def get_claim_fraud_risk_level(fraud_flags: List[models.FraudFlag]) -> str:
    """
    Determine overall fraud risk level based on flags
    """
    if not fraud_flags:
        return "LOW"
    
    has_high = any(f.severity == models.FraudSeverityEnum.high for f in fraud_flags)
    high_count = sum(1 for f in fraud_flags if f.severity == models.FraudSeverityEnum.high)
    medium_count = sum(1 for f in fraud_flags if f.severity == models.FraudSeverityEnum.medium)
    
    if has_high and high_count >= 2:
        return "CRITICAL"
    elif has_high:
        return "HIGH"
    elif medium_count >= 2:
        return "MEDIUM"
    else:
        return "LOW"
