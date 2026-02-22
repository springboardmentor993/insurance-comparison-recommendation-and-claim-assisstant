from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import SessionLocal, engine, Base
import models, schemas, auth
app = FastAPI()
# Routes
from routes import policies
from routes import recommend   # ← IMPORTANT
from routes import claims
from routes import upload
from routes import admin_auth
app.include_router(upload.router)
app.include_router(admin_auth.router)
# Create tables
Base.metadata.create_all(bind=engine)



# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- ROUTES ----------------
app.include_router(policies.router)
app.include_router(recommend.router)  # ← IMPORTANT
app.include_router(claims.router)
# ---------------- DB SESSION ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------- AUTH ----------------

@app.post("/signup")
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    hashed_password = auth.hash_password(user.password)

    db_user = models.User(
        email=user.email,
        password=hashed_password
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return {"message": "User created"}

@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if not db_user or not auth.verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = auth.create_access_token({"sub": user.email})

    return {
        "access_token": token,
        "token_type": "bearer"
    }

# ---------------- CATEGORIES ----------------

@app.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()
