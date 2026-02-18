from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.policies import router as policies_router
from routes.recommendations import router as recommendations_router

app = FastAPI(title="Insurenz Backend")

# ✅ CORS (must be BEFORE include_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Routers
app.include_router(policies_router)
app.include_router(recommendations_router)

@app.get("/")
def root():
    return {"status": "ok", "message": "Backend running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("run:app", host="0.0.0.0", port=8000, reload=True)
