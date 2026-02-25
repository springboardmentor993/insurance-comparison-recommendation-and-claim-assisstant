from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routes import auth, policies, recommendations, claims, admin

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Insurance Comparison, Recommendation & Claim Assistant API"
)


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(policies.router, prefix=settings.API_V1_PREFIX)
app.include_router(recommendations.router, prefix=settings.API_V1_PREFIX)
app.include_router(claims.router, prefix=settings.API_V1_PREFIX)
app.include_router(admin.router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Insurance Platform API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.get("/s3-health")
def s3_health_check():
    """Check AWS S3 connectivity"""
    import boto3
    from botocore.exceptions import ClientError, NoCredentialsError
    try:
        s3 = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
        )
        response = s3.list_objects_v2(Bucket=settings.S3_BUCKET_NAME, MaxKeys=1)
        return {
            "status": "connected ✅",
            "bucket": settings.S3_BUCKET_NAME,
            "region": settings.AWS_REGION,
            "objects_in_bucket": response.get("KeyCount", 0),
        }
    except NoCredentialsError:
        return {"status": "error ❌", "detail": "AWS credentials not found"}
    except ClientError as e:
        return {"status": "error ❌", "detail": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
