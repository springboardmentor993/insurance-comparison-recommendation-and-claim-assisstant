from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import random
import string
import os

import models
import schemas
from database import get_db
from drive_service import upload_file_to_drive

router = APIRouter(
    prefix="/claims",
    tags=["Claims"]
)


def generate_claim_number():
    return "CLM-" + ''.join(random.choices(string.digits, k=6))


@router.post("/", response_model=schemas.ClaimResponse)
def create_claim(request: schemas.ClaimCreate, db: Session = Depends(get_db)):

    claim_number = generate_claim_number()

    new_claim = models.Claims(
        user_policy_id=request.user_policy_id,
        claim_number=claim_number,
        claim_type=request.claim_type,
        incident_date=request.incident_date,
        amount_claimed=request.amount_claimed,
        status="draft"
    )

    db.add(new_claim)
    db.commit()
    db.refresh(new_claim)

    return new_claim

@router.post("/{claim_id}/upload")
def upload_claim_document(
    claim_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    # Save file temporarily
    file_location = f"temp_{file.filename}"

    with open(file_location, "wb") as buffer:
        buffer.write(file.file.read())

    # Upload to Google Drive
    file_url = upload_file_to_drive(file_location, file.filename)

    # Save in database
    new_doc = models.ClaimDocuments(
        claim_id=claim_id,
        file_url=file_url,
        doc_type="general"
    )

    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    # Remove temp file
    os.remove(file_location)

    return {
        "message": "File uploaded successfully",
        "file_url": file_url
    }
