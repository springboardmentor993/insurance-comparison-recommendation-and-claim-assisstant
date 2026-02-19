from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.database import engine
from config.settings import settings
from config.celery_app import celery_app  # noqa: F401 — ensures Celery app is initialized
from models.models import Base
from routes.auth import router as auth_router
from routes.policies import router as policies_router
from routes.recommendations import router as recommendations_router
from routes.profile import router as profile_router
from routes.claims import router as claims_router
from routes.admin import router as admin_router
from routes.task_status import router as task_status_router
from scripts.seed import seed_data

Base.metadata.create_all(bind=engine)
# seed_data()  # Commented out - database already seeded


app = FastAPI(
    title="InsureMe API",
    description="Insurance recommendation and claims management API",
    version="1.0.0",
    debug=settings.DEBUG
)

# Use CORS origins from settings (environment-based)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(policies_router, prefix="/policies", tags=["Policies"])
app.include_router(recommendations_router, prefix="/recommendations", tags=["Recommendations"])
app.include_router(profile_router, prefix="/profile", tags=["Profile"])
app.include_router(claims_router, prefix="/claims", tags=["Claims"])
app.include_router(admin_router, prefix="/admin", tags=["Admin"])
app.include_router(task_status_router, prefix="/tasks", tags=["Tasks"])


@app.get("/")
def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "InsureMe API is running"}