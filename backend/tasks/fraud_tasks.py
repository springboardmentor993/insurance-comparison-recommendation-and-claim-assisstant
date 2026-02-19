"""Celery task for asynchronous fraud detection on claims.

Moves the fraud detection logic out of the request cycle so the API
can respond immediately after claim creation.
"""
import logging

from config.celery_app import celery_app
from config.database import SessionLocal
from models.models import Claim
from services.fraud_detection_service import FraudDetectionService

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, name="tasks.run_fraud_detection", max_retries=2)
def run_fraud_detection(self, claim_id: int):
    """Run all fraud detection rules on a claim asynchronously.
    
    Args:
        claim_id: ID of the claim to analyze
        
    Returns:
        dict with fraud detection summary
    """
    db = SessionLocal()
    try:
        claim = db.query(Claim).filter(Claim.id == claim_id).first()
        
        if not claim:
            logger.error(f"Claim {claim_id} not found for fraud detection")
            return {"status": "error", "message": f"Claim {claim_id} not found"}
        
        # Run fraud detection
        fraud_service = FraudDetectionService(db)
        flags = fraud_service.check_all_rules(claim)
        saved_count = fraud_service.save_fraud_flags(flags)
        
        summary = fraud_service.get_claim_fraud_summary(claim_id)
        
        logger.info(
            f"Fraud detection complete for claim {claim_id}: "
            f"{saved_count} flags found"
        )
        
        return {
            "status": "success",
            "claim_id": claim_id,
            "flags_found": saved_count,
            "summary": summary,
        }
        
    except Exception as exc:
        logger.error(f"Fraud detection failed for claim {claim_id}: {exc}")
        raise self.retry(exc=exc, countdown=5)
    finally:
        db.close()
