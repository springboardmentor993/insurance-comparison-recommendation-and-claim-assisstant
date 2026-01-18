from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from model import Policy
from routers import policies,login
from schemas import SignupRequest

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(policies.router)
app.include_router(login.router)

@app.post("/signup")
def signup(user: SignupRequest):
    print(user)
    return {
        "message": "Signup data received",
        "name": user.name,
        "email": user.email
    }
