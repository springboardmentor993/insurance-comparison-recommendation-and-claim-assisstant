import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, UploadFile, File, HTTPException
from dotenv import load_dotenv
import os
import tempfile
router = APIRouter(prefix="/upload", tags=["Upload"])



load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("API_KEY"),
    api_secret=os.getenv("API_SECRET")
)

ALLOWED_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]


@router.post("/")
async def upload_file(file: UploadFile = File(...)):

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG, PNG, PDF, DOC, DOCX files are allowed"
        )

    with tempfile.NamedTemporaryFile(delete=False) as temp:
        temp.write(await file.read())
        temp_path = temp.name

    # ✅ If image → image
    # ✅ Everything else (pdf, doc, docx) → raw
    if file.content_type.startswith("image/"):
        resource_type = "image"
    else:
        resource_type = "raw"

    result = cloudinary.uploader.upload(
        temp_path,
        resource_type=resource_type
    )

    return {
        "filename": result["public_id"],
        "url": result["secure_url"]
    }