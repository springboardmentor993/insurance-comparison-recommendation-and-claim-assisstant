from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
from models import Base
from routes.auth import router as auth_router
from routes.policies import router as policies_router
from routes.recommendations import router as recommendations_router
from routes.profile import router as profile_router
from seed import seed_data

Base.metadata.create_all(bind=engine)
seed_data()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(policies_router, prefix="/policies", tags=["Policies"])
app.include_router(recommendations_router, prefix="/recommendations", tags=["Recommendations"])
app.include_router(profile_router, prefix="/profile", tags=["Profile"])