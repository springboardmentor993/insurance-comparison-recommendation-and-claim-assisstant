from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.policies import router as policies_router
from routes.auth import router as auth_router
from routes.profile import router as profile_router
from routes.recommendations import router as recommendations_router
from routes.claims import router as claims_router
from routes.admin import router as admin_router
from database import engine, Base
from models import * # Ensure models are loaded for create_all to work

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# ✅ CORS must be added right after app creation
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ include routers
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(policies_router, prefix="", tags=["policies"])
app.include_router(profile_router, prefix="/profile", tags=["profile"])
app.include_router(recommendations_router, prefix="", tags=["recommendations"])
app.include_router(claims_router, prefix="", tags=["claims"])
app.include_router(admin_router, prefix="/admin", tags=["admin"])

from fastapi.staticfiles import StaticFiles
import os

# Create uploads directory if not exists
os.makedirs("uploads", exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="uploads"), name="static")

@app.get("/")
def root():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
