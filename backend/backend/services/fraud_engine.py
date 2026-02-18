from sqlalchemy.orm import Session
from models import Claim, UserPolicy, ClaimDocument, FraudFlag
from datetime import datetime, timedelta

class FraudEngine:
    @staticmethod
    def evaluate(claim: Claim, db: Session):
        """
        Evaluate a claim for potential fraud risks and persist flags if found.
        Use this method after claim creation.
        """
        FraudEngine.check_duplicate_documents(claim, db)
        FraudEngine.check_suspicious_timing(claim, db)
        FraudEngine.check_high_amount(claim, db)
        
        # Commit any flags added during checks
        db.commit()

    @staticmethod
    def check_duplicate_documents(claim: Claim, db: Session):
        """
        Flag if any document in the claim matches existing documents (by name & size).
        """
        if not claim.documents:
            return

        for doc in claim.documents:
            # Find any other document with same size and name, excluding this claim's docs
            duplicates = db.query(ClaimDocument).filter(
                ClaimDocument.file_size == doc.file_size,
                ClaimDocument.file_name == doc.file_name,
                ClaimDocument.claim_id != claim.id
            ).all()
            
            if duplicates:
                flag = FraudFlag(
                    claim_id=claim.id,
                    flag_reason="Duplicate Document",
                    flag_details=f"Document '{doc.file_name}' ({doc.file_size} bytes) matches {len(duplicates)} previous document(s)."
                )
                db.add(flag)

    @staticmethod
    def check_suspicious_timing(claim: Claim, db: Session):
        """
        Flag if claim incident date is too close to policy start date (within 5 days).
        """
        policy = claim.user_policy
        if not policy:
            return
            
        # Ensure dates are compatible for comparison
        # incident_date and start_date are likely datetime.date objects
        days_diff = (claim.incident_date - policy.start_date).days
        
        # Flag if claim is within 5 days of policy start
        if 0 <= days_diff <= 5:
             flag = FraudFlag(
                claim_id=claim.id,
                flag_reason="Suspicious Timing",
                flag_details=f"Claim incident occurred just {days_diff} days after policy start date (Early Claims Warning)."
            )
             db.add(flag)

    @staticmethod
    def check_high_amount(claim: Claim, db: Session):
        """
        Flag if claim amount exceeds $10,000.
        """
        THRESHOLD = 10000
        if claim.claim_amount > THRESHOLD:
            flag = FraudFlag(
                claim_id=claim.id,
                flag_reason="High Amount",
                flag_details=f"Claim amount ${float(claim.claim_amount):,.2f} exceeds threshold of ${THRESHOLD:,.2f}."
            )
            db.add(flag)
