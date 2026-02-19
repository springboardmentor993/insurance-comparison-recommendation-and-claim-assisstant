"""Celery task for uploading claim documents to AWS S3.

This task runs asynchronously so the API can respond immediately
while the file is being uploaded to S3 in the background.
"""
import base64
import logging
from datetime import datetime

from config.celery_app import celery_app
from config.database import SessionLocal
from models.models import ClaimDocument
from services.s3_service import S3Service

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, name="tasks.upload_document_to_s3", max_retries=3)
def upload_document_to_s3(
    self,
    file_bytes_b64: str,
    claim_id: int,
    claim_number: str,
    filename: str,
    doc_type: str,
    content_type: str = "application/octet-stream",
):
    """Upload a claim document to S3 and create a DB record.
    
    Args:
        file_bytes_b64: Base64-encoded file content
        claim_id: ID of the claim this document belongs to
        claim_number: Claim number for S3 key naming
        filename: Original filename
        doc_type: Document type (medical_report, invoice, photo, etc.)
        content_type: MIME type of the file
        
    Returns:
        dict with document_id and s3_url on success
    """
    try:
        # Decode file bytes
        file_bytes = base64.b64decode(file_bytes_b64)
        
        # Build S3 key: claims/{claim_number}/{timestamp}_{filename}
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        s3_key = f"claims/{claim_number}/{timestamp}_{filename}"
        
        # Upload to S3
        s3_service = S3Service()
        s3_url = s3_service.upload_file(file_bytes, s3_key, content_type)
        
        # Create ClaimDocument record in DB
        db = SessionLocal()
        try:
            document = ClaimDocument(
                claim_id=claim_id,
                file_url=s3_url,
                s3_key=s3_key,
                doc_type=doc_type,
            )
            db.add(document)
            db.commit()
            db.refresh(document)
            
            logger.info(
                f"Document uploaded: claim={claim_number}, "
                f"doc_id={document.id}, s3_key={s3_key}"
            )
            
            return {
                "status": "success",
                "document_id": document.id,
                "s3_url": s3_url,
                "s3_key": s3_key,
            }
        finally:
            db.close()
            
    except Exception as exc:
        logger.error(f"Document upload failed: {exc}")
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)
