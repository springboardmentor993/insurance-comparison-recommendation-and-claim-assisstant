from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from pydantic import BaseModel
import smtplib
from email.message import EmailMessage

router = APIRouter(prefix="/admin", tags=["Admin Auth"])

SECRET_KEY = "SUPERSECRETKEY"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ================= DB =================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ================= SCHEMAS =================
class AdminLoginSchema(BaseModel):
    email: str
    password: str


class AdminSignupSchema(BaseModel):
    email: str
    password: str


class EmailSchema(BaseModel):
    to_email: str
    subject: str
    message: str


# ================= UTILS =================
def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)


def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=5)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ================= ADMIN SIGNUP =================
@router.post("/signup")
def admin_signup(data: AdminSignupSchema, db: Session = Depends(get_db)):

    existing = db.query(models.User).filter(models.User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Admin already exists")

    new_admin = models.User(
        email=data.email,
        password=hash_password(data.password),
        role="admin"
    )

    db.add(new_admin)
    db.commit()

    return {"message": "Admin registered successfully"}


# ================= ADMIN LOGIN =================
@router.post("/login")
def admin_login(data: AdminLoginSchema, db: Session = Depends(get_db)):

    admin = db.query(models.User).filter(
        models.User.email == data.email,
        models.User.role == "admin"
    ).first()

    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")

    if not verify_password(data.password, admin.password):
        raise HTTPException(status_code=401, detail="Invalid password")

    token = create_token({
        "sub": admin.email,
        "role": "admin"
    })

    return {"access_token": token}


# ================= ADMIN ANALYTICS =================
@router.get("/analytics")
def admin_analytics(db: Session = Depends(get_db)):

    total_policies = db.query(models.Policy).count()
    total_claims = db.query(models.Claim).count()
    approved_claims = db.query(models.Claim).filter(models.Claim.status == "approved").count()

    # Dummy fraud logic
    fraud_claims = db.query(models.Claim).filter(models.Claim.amount > 500000).all()

    fraud_list = [
        {
            "claim_id": c.id,
            "reason": "High claim amount detected"
        }
        for c in fraud_claims
    ]

    return {
        "total_policies": total_policies,
        "total_claims": total_claims,
        "approved_claims": approved_claims,
        "fraud_detected": len(fraud_list),
        "fraud_details": fraud_list
    }


# ================= REAL EMAIL NOTIFICATION =================
@router.post("/send-email")
def send_email(data: EmailSchema):

    EMAIL_ADDRESS = "yourgmail@gmail.com"
    EMAIL_PASSWORD = "your_app_password"

    msg = EmailMessage()
    msg["Subject"] = data.subject
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = data.to_email
    msg.set_content(data.message)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            smtp.send_message(msg)

        return {"message": "Email sent successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))