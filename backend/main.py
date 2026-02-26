# ===============================
# 1️⃣ IMPORTS
# ===============================
from fastapi import FastAPI, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
import requests
from bs4 import BeautifulSoup
from database import engine, SessionLocal
from models import User, Provider, Policy, Claim
from fastapi import UploadFile, File
import os
from fastapi.staticfiles import StaticFiles
# ===============================
# 2️⃣ PYDANTIC MODELS
# ===============================
class ProfileUpdate(BaseModel):
    name: str
    dob: date | None = None
    risk_profile: dict
class ProviderCreate(BaseModel):
    name: str
    country: str | None = None
class ClaimCreate(BaseModel):
    user_email: str
    policy_id: int
    description: str
    documents: str | None = None
# ===============================
# 3️⃣ FASTAPI APP
# ===============================
app = FastAPI()
UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
# ===============================
# 4️⃣ MIDDLEWARE
# ===============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ===============================
# 5️⃣ DATABASE DEPENDENCY
# ===============================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# ===============================
# 6️⃣ CREATE TABLES
# ===============================
User.metadata.create_all(bind=engine)
Provider.metadata.create_all(bind=engine)
Policy.metadata.create_all(bind=engine)
Claim.metadata.create_all(bind=engine)
# ===============================
# 7️⃣ ROUTES
# ===============================
@app.get("/")
def root():
    return {"message": "PolicyNest Backend is running"}
# -------------------------------
# LOGIN
# -------------------------------
@app.post("/login")
def login(user: dict):
    db = SessionLocal()
    email = user.get("email")

    db_user = db.query(User).filter(User.email == email).first()
    db.close()

    if db_user:
        # simple admin check
        if email == "admin@policynest.com":
            return {
                "message": "Login successful",
                "role": "admin"
            }
        else:
            return {
                "message": "Login successful",
                "role": "user"
            }

    return {"message": "User not found"}
# -------------------------------
# GET ALL POLICIES
# -------------------------------
@app.get("/policies")
def get_policies(db: Session = Depends(get_db)):
    return db.query(Policy).all()
# -------------------------------
# ADD POLICY
# -------------------------------
@app.post("/policies")
def add_policy(policy: dict, db: Session = Depends(get_db)):
    new_policy = Policy(
        provider_id=policy["provider_id"],
        policy_type=policy["policy_type"],
        title=policy["title"],
        coverage=policy.get("coverage"),
        premium=policy["premium"],
        term_months=policy.get("term_months"),
        deductible=policy.get("deductible"),
        tnc_url=policy.get("tnc_url")
    )

    db.add(new_policy)
    db.commit()
    db.refresh(new_policy)

    return {"message": "Policy added successfully"}
# -------------------------------
# GET PROVIDERS
# -------------------------------
@app.get("/providers")
def get_providers(db: Session = Depends(get_db)):
    return db.query(Provider).all()
# -------------------------------
# ADD PROVIDER
# -------------------------------
@app.post("/providers")
def add_provider(provider: ProviderCreate, db: Session = Depends(get_db)):
    new_provider = Provider(
        name=provider.name,
        country=provider.country
    )
    db.add(new_provider)
    db.commit()
    db.refresh(new_provider)
    return new_provider
# -------------------------------
# CREATE CLAIM
# -------------------------------
from fastapi import Form
@app.post("/claims")
def create_claim(
    user_email: str = Form(...),
    policy_id: int = Form(...),
    description: str = Form(...),
    file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    file_path = None

    if file:
        file_location = os.path.join(UPLOAD_FOLDER, file.filename)

        with open(file_location, "wb") as f:
            f.write(file.file.read())

        file_path = file_location

    new_claim = Claim(
        user_email=user_email,
        policy_id=policy_id,
        description=description,
        documents=file_path,
        status="Reported"
    )

    db.add(new_claim)
    db.commit()
    db.refresh(new_claim)

    return {
        "message": "Claim submitted successfully",
        "claim_id": new_claim.id
    }
# -------------------------------
# GET ALL CLAIMS (Admin)
# -------------------------------
@app.get("/claims")
def get_all_claims(db: Session = Depends(get_db)):
    return db.query(Claim).all()
# -------------------------------
# UPDATE CLAIM STATUS (Admin)
# -------------------------------
@app.put("/claims/{claim_id}")
def update_claim_status(claim_id: int, status: str, db: Session = Depends(get_db)):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()

    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    claim.status = status
    db.commit()
    db.refresh(claim)

    return {"message": f"Claim {status} successfully"}
# -------------------------------
# UPDATE USER PROFILE
# -------------------------------
@app.put("/user/{email}")
def update_profile(email: str, profile: ProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return {"error": "User not found"}

    user.name = profile.name
    user.dob = profile.dob
    user.risk_profile = profile.risk_profile

    db.commit()
    db.refresh(user)

    return {"message": "Profile updated successfully"}
# -------------------------------
# GET USER
# -------------------------------
@app.get("/user/{email}")
def get_user(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return {"error": "User not found"}

    return {
        "name": user.name,
        "dob": user.dob,
        "risk_profile": user.risk_profile
    }
# -------------------------------
# EXTRACT POLICY FROM URL
# -------------------------------
@app.post("/extract-policy")
def extract_policy(data: dict = Body(...)):
    url = data.get("url")

    if not url:
        return {"error": "URL is required"}

    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")

        title = soup.title.string if soup.title else "Unknown Policy"
        text = " ".join(soup.stripped_strings)

        premium = None
        if "₹" in text:
            premium = text[text.find("₹"): text.find("₹") + 10]

        return {
            "title": title,
            "raw_text_preview": text[:300],
            "premium_guess": premium
        }

    except Exception as e:
        return {"error": str(e)}
# -------------------------------
# TEST USER INFO
# -------------------------------
@app.get("/me")
def get_me():
    return {
        "name": "Hema",
        "risk_profile": {
            "age": 22,
            "income": "Medium",
            "dependents": "No",
            "preference": "health"
        }
    }
