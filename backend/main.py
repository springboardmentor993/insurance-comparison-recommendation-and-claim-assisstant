

from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File, Header
from fastapi.responses import StreamingResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from .database import engine
from . import models, schemas
from .auth import hash_password, verify_password, create_access_token, SECRET_KEY, ALGORITHM, ADMIN_EMAIL, ADMIN_CREDENTIALS
from .deps import get_db, get_current_user
from .claim_service import ClaimService
from .admin_middleware import get_admin_user
from .scoring_refactored import rank_policies
from .fraud_rules import check_claim_for_fraud, get_claim_fraud_risk_level
from .email_service import EmailService
from jose import jwt
from jose.exceptions import ExpiredSignatureError, JWTError
import uuid
import json
from typing import Any

from datetime import datetime
from decimal import Decimal

# ============ ADMIN: USERS & FRAUD SUMMARY ============
def admin_list_users(db: Session = Depends(get_db), token: str = Query(...)):
    user = get_current_user(token, db)
    if not getattr(user, "is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")
    users = db.query(models.User).order_by(models.User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "dob": str(u.dob) if u.dob else None,
            "is_admin": u.is_admin,
            "created_at": str(u.created_at)
        } for u in users
    ]

def admin_recent_users(db: Session = Depends(get_db), token: str = Query(...)):
    user = get_current_user(token, db)
    if not getattr(user, "is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")
    users = db.query(models.User).order_by(models.User.created_at.desc()).limit(10).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "dob": str(u.dob) if u.dob else None,
            "is_admin": u.is_admin,
            "created_at": str(u.created_at)
        } for u in users
    ]

def fraud_summary(db: Session = Depends(get_db), token: str = Query(...)):
    user = get_current_user(token, db)
    if not getattr(user, "is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")
    # Example: count total fraud flags
    total_flags = db.query(models.FraudFlag).count() if hasattr(models, 'FraudFlag') else 0
    return {"total_flags": total_flags}


def admin_list_claims(db: Session = Depends(get_db), token: str = Query(...)):
    user = get_current_user(token, db)
    if not getattr(user, "is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")
    claims = db.query(models.Claim).all()
    result = []
    for claim in claims:
        claim_docs = [
            {
                "id": doc.id,
                "file_name": doc.file_name,
                "file_type": doc.file_type,
                "doc_type": doc.doc_type,
                "uploaded_at": str(doc.uploaded_at)
            }
            for doc in claim.documents
        ]
        result.append({
            "id": claim.id,
            "user_id": claim.user_policy.user_id if claim.user_policy else None,
            "claim_type": claim.claim_type,
            "amount_claimed": float(claim.amount_claimed),
            "status": claim.status,
            "risk_level": None,  # TODO: Add risk level logic
            "documents": claim_docs
        })
    return result

def get_pending_documents_for_approval(
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Get all pending documents for admin review.
    Only accessible by admin users.
    """
    user = get_current_user(token, db)
    if not getattr(user, "is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get all documents WITHOUT any approval (pending review)
    # Use a subquery to find documents that don't have an approval record
    from sqlalchemy import and_, not_, exists
    subquery = db.query(models.DocumentApproval.id).filter(
        models.DocumentApproval.document_id == models.ClaimDocument.id
    ).exists()
    pending_docs = db.query(models.ClaimDocument).filter(~subquery).all()
    
    result = []
    for doc in pending_docs:
        claim = doc.claim
        user_policy = claim.user_policy
        policy = user_policy.policy
        claim_user = user_policy.user
        
        # Get fraud flags for this claim
        fraud_flags = db.query(models.FraudFlag).filter(
            models.FraudFlag.claim_id == claim.id
        ).all()
        
        result.append({
            "document": {
                "id": doc.id,
                "file_name": doc.file_name,
                "file_type": doc.file_type,
                "doc_type": doc.doc_type,
                "uploaded_at": str(doc.uploaded_at)
            },
            "claim": {
                "id": claim.id,
                "claim_number": claim.claim_number,
                "claim_type": claim.claim_type,
                "amount_claimed": str(claim.amount_claimed),
                "status": claim.status,
                "incident_date": str(claim.incident_date)
            },
            "user": {
                "id": claim_user.id,
                "name": claim_user.name,
                "email": claim_user.email
            },
            "policy": {
                "title": policy.title,
                "provider": policy.provider.name if policy.provider else "Unknown",
                "policy_type": policy.policy_type
            },
            "fraud_flags": [
                {
                    "id": flag.id,
                    "code": flag.rule_code,
                    "severity": flag.severity,
                    "details": flag.details
                }
                for flag in fraud_flags
            ]
        })
    
    return {
        "total": len(result),
        "documents": result
    }

def admin_get_document(doc_id: int, db: Session = Depends(get_db), token: str = Query(...)):
    """
    Retrieve a specific document by ID.
    Admin only endpoint.
    Returns file data as StreamingResponse.
    """
    user = get_current_user(token, db)
    if not getattr(user, "is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    doc = db.query(models.ClaimDocument).filter(models.ClaimDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not doc.file_data:
        raise HTTPException(status_code=404, detail="Document has no file data")
    
    # Return file as streaming response with proper headers
    from io import BytesIO
    return StreamingResponse(
        iter([doc.file_data]),
        media_type=doc.file_type,
        headers={
            "Content-Disposition": f"attachment; filename={doc.file_name}"
        }
    )

def admin_approve_claim(claim_id: int, db: Session = Depends(get_db), token: str = Query(...)):
    user = get_current_user(token, db)
    if not getattr(user, "is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    claim.status = "approved"
    db.commit()
    return {"id": claim.id, "status": claim.status, "message": "Claim approved"}

def admin_reject_claim(claim_id: int, db: Session = Depends(get_db), token: str = Query(...)):
    user = get_current_user(token, db)
    if not getattr(user, "is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    claim.status = "rejected"
    db.commit()
    return {"id": claim.id, "status": claim.status, "message": "Claim rejected"}


ADMIN_ROUTES = [
    ("/admin/claims", admin_list_claims, ["GET"]),
    ("/admin/documents/pending", get_pending_documents_for_approval, ["GET"]),
    ("/admin/documents/{doc_id}", admin_get_document, ["GET"]),
    ("/admin/approve/{claim_id}", admin_approve_claim, ["POST"]),
    ("/admin/reject/{claim_id}", admin_reject_claim, ["POST"]),
]

models.Base.metadata.create_all(bind=engine)

# Create app
app = FastAPI(title="Insurance Comparison & Claims Assistant")

# CORS Configuration - MUST be BEFORE routes!
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register admin routes after app is defined
for path, view, methods in ADMIN_ROUTES:
    app.add_api_route(path, view, methods=methods)

# Register new admin endpoints after app is defined
app.add_api_route("/admin/users", admin_list_users, methods=["GET"])
app.add_api_route("/admin/users/recent", admin_recent_users, methods=["GET"])
app.add_api_route("/fraud/summary", fraud_summary, methods=["GET"])

# Mount static files for uploads
import os
uploads_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(uploads_dir, exist_ok=True)
if os.path.exists(uploads_dir):
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# ==================== ENTERPRISE CLAIM APPROVAL ENDPOINTS ====================

@app.post("/api/admin/claims/{claim_id}/approve")
def enterprise_approve_claim(
    claim_id: int,
    reason: str = Query(default=None),
    admin_notes: str = Query(default=None),
    token: str = Query(...),
    db: Session = Depends(get_db),
    request=None
):
    """
    Enterprise-grade claim approval with audit logging
    - Admin-only access
    - Transaction-safe updates
    - Automatic audit log creation
    - Real-time notifications
    """
    try:
        # Check admin authorization
        user = get_current_user(token, db)
        if not (getattr(user, "is_admin", False) or (hasattr(user, "role") and user.role == models.UserRoleEnum.admin)):
            raise HTTPException(status_code=403, detail="Admin access required. User must have admin role.")
        admin = user
        
        # Get client IP
        ip_address = None
        if request:
            ip_address = request.client.host if request.client else None
        
        # Approve claim using service with transaction support
        result = ClaimService.approve_claim(
            claim_id=claim_id,
            admin_id=admin.id,
            reason=reason or "",
            admin_notes=admin_notes or "",
            db=db,
            ip_address=ip_address
        )
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Approval failed: {str(e)}")

@app.post("/api/admin/claims/{claim_id}/reject")
def enterprise_reject_claim(
    claim_id: int,
    reason: str = Query(...),
    admin_notes: str = Query(default=None),
    token: str = Query(...),
    db: Session = Depends(get_db),
    request=None
):
    """
    Enterprise-grade claim rejection with detailed reasoning
    - Admin-only access
    - Required rejection reason
    - Transaction-safe updates
    - Automatic notifications
    """
    try:
        # Check admin authorization
        user = get_current_user(token, db)
        if not (getattr(user, "is_admin", False) or (hasattr(user, "role") and user.role == models.UserRoleEnum.admin)):
            raise HTTPException(status_code=403, detail="Admin access required. User must have admin role.")
        admin = user
        
        if not reason or reason.strip() == "":
            raise HTTPException(status_code=400, detail="Rejection reason is required")
        
        # Get client IP
        ip_address = None
        if request:
            ip_address = request.client.host if request.client else None
        
        # Reject claim using service
        result = ClaimService.reject_claim(
            claim_id=claim_id,
            admin_id=admin.id,
            reason=reason,
            admin_notes=admin_notes or "",
            db=db,
            ip_address=ip_address
        )
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rejection failed: {str(e)}")

@app.get("/api/admin/dashboard/stats")
def get_admin_dashboard_stats(
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """Get real-time dashboard statistics for admin"""
    try:
        user = get_current_user(token, db)
        if not (getattr(user, "is_admin", False) or (hasattr(user, "role") and user.role == models.UserRoleEnum.admin)):
            raise HTTPException(status_code=403, detail="Admin access required. User must have admin role.")
        admin = user
        stats = ClaimService.get_admin_dashboard_stats(db)
        return {
            "status": "success",
            "admin_id": admin.id,
            "admin_email": admin.email,
            "stats": stats
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/audit-logs")
def get_audit_logs(
    admin_id: int = Query(default=None),
    target_type: str = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """Get audit logs for compliance and tracking"""
    try:
        user = get_current_user(token, db)
        if not (getattr(user, "is_admin", False) or (hasattr(user, "role") and user.role == models.UserRoleEnum.admin)):
            raise HTTPException(status_code=403, detail="Admin access required. User must have admin role.")
        admin = user
        logs = ClaimService.get_audit_logs(
            admin_id=admin_id,
            target_type=target_type,
            limit=limit,
            offset=offset,
            db=db
        )
        return {
            "status": "success",
            "count": len(logs),
            "logs": logs
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/claims-list")
def get_admin_claims_list(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=15, ge=1, le=100),
    status: str = Query(default=None),
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """Get list of claims for admin review with pagination and filtering"""
    try:
        # Get current user and verify admin access
        user = get_current_user(token, db)
        if not (getattr(user, "is_admin", False) or (hasattr(user, "role") and user.role == models.UserRoleEnum.admin)):
            raise HTTPException(status_code=403, detail="Admin access required. User must have admin role.")
        
        # Build query
        query = db.query(models.Claim).join(models.UserPolicy)
        
        # Filter by status if provided
        if status and status != 'all':
            query = query.filter(models.Claim.status == status)
        
        # Get total count
        total_count = query.count()
        
        # Get paginated results
        claims = query.order_by(
            models.Claim.created_at.desc()
        ).offset(skip).limit(limit).all()
        
        # Format claims for response
        claims_data = []
        for claim in claims:
            user_policy = claim.user_policy
            claims_data.append({
                "id": claim.id,
                "claim_number": claim.claim_number,
                "claim_type": claim.claim_type,
                "status": claim.status,
                "amount_claimed": str(claim.amount_claimed),
                "incident_date": claim.incident_date.isoformat() if claim.incident_date else None,
                "description": claim.description,
                "created_at": claim.created_at.isoformat(),
                "documents_count": len(claim.documents) if claim.documents else 0,
                "user_id": user_policy.user_id if user_policy else None,
            })
        
        return {
            "status": "success",
            "data": {
                "claims": claims_data,
                "total_count": total_count,
                "skip": skip,
                "limit": limit
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== NOTIFICATION ENDPOINTS ====================

@app.get("/api/user/notifications")
def get_user_notifications(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """Get notifications for current user"""
    try:
        user = get_current_user(token, db)  # Use get_current_user for all authenticated users
        result = ClaimService.get_user_notifications(
            user_id=user.id,
            limit=limit,
            offset=offset,
            db=db
        )
        return {
            "status": "success",
            "user_id": user.id,
            **result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """Mark a notification as read"""
    try:
        user = get_current_user(token, db)  # Use get_current_user for all authenticated users
        success = ClaimService.mark_notification_as_read(
            notification_id=notification_id,
            db=db
        )
        
        if success:
            return {
                "status": "success",
                "message": "Notification marked as read"
            }
        else:
            raise HTTPException(status_code=404, detail="Notification not found")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ HEALTH CHECK ============

@app.get("/health")
def health(db: Session = Depends(get_db)):
    """Health check endpoint with database connection info"""
    try:
        # Test database connection
        db.execute(text("SELECT 1"))
        db_status = "connected"
        db_url_masked = "postgresql://postgres:***@localhost:5432/insurance_db"
    except Exception as e:
        db_status = f"error: {str(e)}"
        db_url_masked = "ERROR"
    
    return {
        "status": "ok",
        "database": db_status,
        "database_url": db_url_masked
    }


# ============ DEBUG ENDPOINTS ============

@app.get("/debug/database-info")
def debug_database_info(db: Session = Depends(get_db)):
    """Check database connection and table schema"""
    try:
        # Check database info
        result = db.execute(text("SELECT version()")).scalar()
        postgres_version = result
        
        # Check if claim_documents table exists
        table_check = db.execute(text("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_name = 'claim_documents'
            )
        """)).scalar()
        
        # Get column information
        columns_info = db.execute(text("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'claim_documents'
            ORDER BY ordinal_position
        """)).fetchall()
        
        return {
            "postgres_version": postgres_version,
            "claim_documents_table_exists": table_check,
            "columns": [
                {"name": col[0], "type": col[1], "nullable": col[2]} 
                for col in columns_info
            ]
        }
    except Exception as e:
        return {
            "error": f"Database check failed: {str(e)}",
            "details": str(e)
        }


@app.get("/debug/documents")
def debug_get_documents(db: Session = Depends(get_db)):
    """
    Debug endpoint: List all uploaded documents with metadata.
    Shows what's actually stored in the database.
    """
    try:
        # Query all documents with file sizes
        docs = db.execute("""
            SELECT 
                id,
                claim_id,
                file_name,
                file_type,
                doc_type,
                OCTET_LENGTH(file_data) as file_size_bytes,
                uploaded_at
            FROM claim_documents
            ORDER BY uploaded_at DESC
        """).fetchall()
        
        print(f"\n[DEBUG] Found {len(docs)} documents in database")
        
        documents = []
        for doc in docs:
            doc_dict = {
                "id": doc[0],
                "claim_id": doc[1],
                "file_name": doc[2],
                "file_type": doc[3],
                "doc_type": doc[4],
                "file_size_bytes": doc[5],
                "uploaded_at": str(doc[6]),
                "has_data": "YES" if doc[5] and doc[5] > 0 else "NO (EMPTY!)"
            }
            documents.append(doc_dict)
            print(f"  Doc ID={doc[0]}: {doc[2]} ({doc[5]} bytes)")
        
        return {
            "total_documents": len(documents),
            "documents": documents
        }
    except Exception as e:
        print(f"[DEBUG] Error fetching documents: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "error": f"Failed to fetch documents: {str(e)}",
            "details": str(e)
        }


@app.get("/debug/document/{doc_id}")
def debug_get_document_details(doc_id: int, db: Session = Depends(get_db)):
    """
    Debug endpoint: Get detailed info about a specific document.
    """
    try:
        doc = db.query(models.ClaimDocument).filter(
            models.ClaimDocument.id == doc_id
        ).first()
        
        if not doc:
            return {"error": f"Document {doc_id} not found"}
        
        file_size = len(doc.file_data) if doc.file_data else 0
        
        print(f"\n[DEBUG] Document {doc_id}:")
        print(f"  File name: {doc.file_name}")
        print(f"  File type: {doc.file_type}")
        print(f"  File size: {file_size} bytes")
        print(f"  Claim ID: {doc.claim_id}")
        print(f"  Uploaded: {doc.uploaded_at}")
        print(f"  Data status: {'OK' if file_size > 0 else 'EMPTY!'}")
        
        # Get first 100 bytes as hex for verification
        first_100_bytes = None
        if doc.file_data and len(doc.file_data) > 0:
            first_100_bytes = doc.file_data[:100].hex()
        
        return {
            "id": doc.id,
            "claim_id": doc.claim_id,
            "file_name": doc.file_name,
            "file_type": doc.file_type,
            "doc_type": doc.doc_type,
            "file_size_bytes": file_size,
            "uploaded_at": str(doc.uploaded_at),
            "has_data": "YES" if file_size > 0 else "NO (EMPTY!)",
            "first_100_bytes_hex": first_100_bytes,
            "note": "If first_100_bytes_hex is None/empty, the file_data column is NULL or empty"
        }
    except Exception as e:
        print(f"[DEBUG] Error fetching document {doc_id}: {str(e)}")
        return {
            "error": f"Failed to fetch document: {str(e)}",
            "details": str(e)
        }


@app.post("/debug/verify-database")
def debug_verify_database(db: Session = Depends(get_db)):
    """
    Debug endpoint: Run complete database verification.
    Tests connection, schema, and performs a test insert.
    """
    results = {
        "connection": "FAIL",
        "table_exists": False,
        "schema_correct": False,
        "test_insert": "SKIPPED",
        "issues": []
    }
    
    try:
        # 1. Test connection
        db.execute(text("SELECT 1"))
        results["connection"] = "OK"
        print("[DEBUG] ✓ Database connection successful")
        
        # 2. Check table exists
        table_exists = db.execute(text("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_name = 'claim_documents'
            )
        """)).scalar()
        
        results["table_exists"] = table_exists
        if table_exists:
            print("[DEBUG] ✓ claim_documents table exists")
        else:
            print("[DEBUG] ✗ claim_documents table NOT FOUND")
            results["issues"].append("claim_documents table does not exist")
            return results
        
        # 3. Check schema
        columns = db.execute(text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'claim_documents'
        """)).fetchall()
        
        column_names = [col[0] for col in columns]
        required_columns = {'id', 'claim_id', 'file_data', 'file_name', 'file_type', 'doc_type', 'uploaded_at'}
        actual_columns = set(column_names)
        
        if required_columns.issubset(actual_columns):
            results["schema_correct"] = True
            print("[DEBUG] ✓ All required columns present")
        else:
            missing = required_columns - actual_columns
            results["issues"].append(f"Missing columns: {missing}")
            print(f"[DEBUG] ✗ Missing columns: {missing}")
        
        # 4. Count documents
        count = db.query(models.ClaimDocument).count()
        results["document_count"] = count
        print(f"[DEBUG] Total documents in database: {count}")
        
        results["status"] = "READY" if results["schema_correct"] else "SCHEMA_ERROR"
        
    except Exception as e:
        results["error"] = str(e)
        results["issues"].append(f"Exception: {str(e)}")
        print(f"[DEBUG] ✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    
    return results

# ============ MODULE A: AUTH & PROFILE ============

@app.post("/auth/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        # Validate required fields
        if not user.name or not user.email or not user.password or not user.dob:
            raise HTTPException(status_code=400, detail="All fields are required")
        
        # Check if email already exists
        existing_user = db.query(models.User).filter(models.User.email == user.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already exists")

        # Create new user
        new_user = models.User(
            name=user.name,
            email=user.email,
            password=hash_password(user.password),
            dob=user.dob
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Generate token
        token = create_access_token({"user_id": new_user.id})
        return {"access_token": token, "user_id": new_user.id, "user": schemas.UserOut.from_orm(new_user)}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/auth/login")
def login(data: schemas.UserLogin, db: Session = Depends(get_db)):
    try:
        # Check if this is the ONLY allowed admin email with correct password
        is_admin_credential = data.email == ADMIN_EMAIL and data.email in ADMIN_CREDENTIALS and ADMIN_CREDENTIALS[data.email] == data.password
        
        # Try to find user by email
        user = db.query(models.User).filter(models.User.email == data.email).first()
        
        # If user found, verify password
        if user:
            if not verify_password(data.password, user.password):
                raise HTTPException(status_code=401, detail="Invalid email or password")
        else:
            # If user not found but credentials match admin credentials, this is an error
            # User must exist in database
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Update user's role and is_admin status
        # ONLY the admin email (elchuritejaharshini@gmail.com) gets admin access - STRICT ENFORCEMENT
        if is_admin_credential and data.email == ADMIN_EMAIL:
            user.role = models.UserRoleEnum.admin
            user.is_admin = True
        else:
            # ALL other users are regular users - no admin access for anyone else
            user.role = models.UserRoleEnum.user
            user.is_admin = False
        
        db.commit()
        db.refresh(user)

        token = create_access_token({"user_id": user.id})
        return {"access_token": token, "user_id": user.id, "user": schemas.UserOut.from_orm(user)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user/me", response_model=schemas.UserOut)
def get_profile(
    token: str | None = Query(None),
    authorization: str | None = Header(None),
    db: Session = Depends(get_db)
):
    """Get current user profile"""
    raw_token = _extract_recommendation_token(token, authorization)
    user = get_current_user(raw_token, db)
    return schemas.UserOut.from_orm(user)

@app.put("/user/profile", response_model=schemas.UserOut)
def update_profile(
    data: schemas.UserUpdate,
    token: str | None = Query(None),
    authorization: str | None = Header(None),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    raw_token = _extract_recommendation_token(token, authorization)
    user = get_current_user(raw_token, db)
    
    if data.name:
        user.name = data.name
    if data.risk_profile:
        user.risk_profile = data.risk_profile
    
    db.commit()
    db.refresh(user)
    return schemas.UserOut.from_orm(user)

# ============ MODULE B: POLICY CATALOG ============

@app.get("/providers", response_model=list[schemas.ProviderOut])
def list_providers(db: Session = Depends(get_db)):
    """List all insurance providers"""
    providers = db.query(models.Provider).all()
    return [schemas.ProviderOut.from_orm(p) for p in providers]

@app.post("/providers", response_model=schemas.ProviderOut)
def create_provider(data: schemas.ProviderCreate, db: Session = Depends(get_db)):
    """Create new provider (admin only)"""
    provider = models.Provider(name=data.name, country=data.country)
    db.add(provider)
    db.commit()
    db.refresh(provider)
    return schemas.ProviderOut.from_orm(provider)

@app.get("/policies")
def list_policies(
    policy_type: str = Query(None, description="Filter by policy type (health, life, auto, home, travel)"),
    provider_id: int = Query(None, description="Filter by provider ID"),
    search: str = Query(None, description="Search in policy title and description"),
    min_premium: Decimal = Query(None, description="Minimum premium"),
    max_premium: Decimal = Query(None, description="Maximum premium"),
    skip: int = Query(0, ge=0, description="Number of policies to skip"),
    limit: int = Query(100, ge=1, le=100, description="Number of policies to return (max 100)"),
    db: Session = Depends(get_db)
):
    """
    List all available policies with pagination and filtering.
    
    Features:
    - Filter by policy type, provider, premium range
    - Search by title and description
    - Pagination support (skip/limit)
    - Returns up to 100 policies per request
    
    Example:
    GET /policies?policy_type=health&limit=20&skip=0
    GET /policies?search=HDFC&policy_type=life&max_premium=5000
    """
    query = db.query(models.Policy)
    
    # Apply filters
    if policy_type:
        query = query.filter(models.Policy.policy_type == policy_type)
    
    if provider_id:
        query = query.filter(models.Policy.provider_id == provider_id)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (models.Policy.title.ilike(search_pattern)) |
            (models.Policy.description.ilike(search_pattern))
        )
    
    if min_premium is not None:
        query = query.filter(models.Policy.premium >= min_premium)
    
    if max_premium is not None:
        query = query.filter(models.Policy.premium <= max_premium)
    
    # Get total count for pagination
    total_count = query.count()
    
    # Apply pagination
    policies = query.order_by(models.Policy.title).offset(skip).limit(limit).all()
    
    # Format response with pagination metadata
    formatted_policies = []
    for p in policies:
        try:
            policy_data = {
                "id": p.id,
                "provider_id": p.provider_id,
                "policy_type": p.policy_type.value if hasattr(p.policy_type, 'value') else str(p.policy_type),
                "title": p.title,
                "coverage": p.coverage,
                "premium": float(p.premium) if p.premium else 0,
                "term_months": p.term_months,
                "deductible": float(p.deductible) if p.deductible else 0,
                "tnc_url": p.tnc_url,
                "created_at": p.created_at,
                "provider": {
                    "id": p.provider.id,
                    "name": p.provider.name,
                    "country": p.provider.country,
                    "created_at": p.provider.created_at
                } if p.provider else None
            }
            formatted_policies.append(policy_data)
        except Exception as e:
            print(f"Error serializing policy {p.id}: {e}")
            continue
    
    return {
        "total": total_count,
        "skip": skip,
        "limit": limit,
        "count": len(formatted_policies),
        "policies": formatted_policies
    }

@app.get("/policies/compare")
def compare_policies(
    policy_ids: str = Query(...),
    db: Session = Depends(get_db)
):
    """Compare multiple policies"""
    try:
        ids = [int(id) for id in policy_ids.split(",")]
        policies = db.query(models.Policy).filter(models.Policy.id.in_(ids)).all()
        
        if not policies:
            raise HTTPException(status_code=404, detail="No policies found")
        
        result = []
        for p in policies:
            policy_dict = schemas.PolicyOut.from_orm(p).dict()
            policy_dict["provider"] = schemas.ProviderOut.from_orm(p.provider).dict()
            result.append(policy_dict)
        
        return result
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid policy IDs format")

@app.get("/policies/{policy_id}", response_model=schemas.PolicyWithProvider)
def get_policy(policy_id: int, db: Session = Depends(get_db)):
    """Get policy details"""
    policy = db.query(models.Policy).filter(models.Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return schemas.PolicyWithProvider(
        **schemas.PolicyOut.from_orm(policy).dict(),
        provider=schemas.ProviderOut.from_orm(policy.provider)
    )

@app.post("/policies", response_model=schemas.PolicyOut)
def create_policy(data: schemas.PolicyCreate, db: Session = Depends(get_db)):
    """Create new policy (admin only)"""
    # Verify provider exists
    provider = db.query(models.Provider).filter(models.Provider.id == data.provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    policy = models.Policy(
        provider_id=data.provider_id,
        policy_type=data.policy_type,
        title=data.title,
        coverage=data.coverage,
        premium=data.premium,
        term_months=data.term_months,
        deductible=data.deductible,
        tnc_url=data.tnc_url
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return schemas.PolicyOut.from_orm(policy)

# ============ USER POLICIES (Purchased Policies) ============

@app.post("/user-policies", response_model=schemas.UserPolicyOut)
def purchase_policy(
    data: schemas.UserPolicyCreate,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """Purchase/assign a policy to user"""
    user = get_current_user(token, db)
    
    # Verify policy exists
    policy = db.query(models.Policy).filter(models.Policy.id == data.policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    # Generate unique policy number
    policy_number = f"POL-{user.id}-{uuid.uuid4().hex[:8].upper()}"
    
    user_policy = models.UserPolicy(
        user_id=user.id,
        policy_id=data.policy_id,
        policy_number=policy_number,
        start_date=data.start_date,
        end_date=data.end_date,
        premium=data.premium,
        auto_renew=data.auto_renew
    )
    db.add(user_policy)
    db.commit()
    db.refresh(user_policy)
    return schemas.UserPolicyOut.from_orm(user_policy)

@app.get("/user-policies", response_model=list[schemas.UserPolicyWithPolicy])
def get_user_policies(
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """Get all policies owned by user"""
    user = get_current_user(token, db)
    user_policies = db.query(models.UserPolicy).filter(models.UserPolicy.user_id == user.id).all()
    
    return [schemas.UserPolicyWithPolicy(
        **schemas.UserPolicyOut.from_orm(up).dict(),
        policy=schemas.PolicyWithProvider(
            **schemas.PolicyOut.from_orm(up.policy).dict(),
            provider=schemas.ProviderOut.from_orm(up.policy.provider)
        )
    ) for up in user_policies]

@app.get("/user-policies/{user_policy_id}", response_model=schemas.UserPolicyWithPolicy)
def get_user_policy(
    user_policy_id: int,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """Get specific user policy"""
    user = get_current_user(token, db)
    user_policy = db.query(models.UserPolicy).filter(
        models.UserPolicy.id == user_policy_id,
        models.UserPolicy.user_id == user.id
    ).first()
    
    if not user_policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    return schemas.UserPolicyWithPolicy(
        **schemas.UserPolicyOut.from_orm(user_policy).dict(),
        policy=schemas.PolicyWithProvider(
            **schemas.PolicyOut.from_orm(user_policy.policy).dict(),
            provider=schemas.ProviderOut.from_orm(user_policy.policy.provider)
        )
    )

@app.post("/user/preferences")
def save_preferences(
    data: dict,
    token: str | None = Query(None),
    authorization: str | None = Header(None),
    db: Session = Depends(get_db)
):
    """Save user preferences and auto-generate recommendations"""
    try:
        raw_token = _extract_recommendation_token(token, authorization)
        user = get_current_user(raw_token, db)

        diseases = data.get("diseases", [])
        bmi = float(data.get("bmi") or 0)
        age = int(data.get("age") or 0)
        income = int(data.get("income") or 0)

        # RISK LOGIC (simplified: low/medium/high)
        if len(diseases) >= 4 or bmi >= 30:
            risk = "high"
        elif len(diseases) >= 2 or bmi >= 25:
            risk = "medium"
        else:
            risk = "low"

        user.risk_profile = {
            **data,
            "bmi": bmi,
            "risk_level": risk,
            "risk_profile": risk  # Both names for compatibility
        }

        db.commit()

        # 🎯 AUTO-GENERATE RECOMMENDATIONS with full user data
        try:
            risk_profile = risk  # Use calculated risk_profile
            # Get preferences from the stored risk_profile dict
            preferred_types = user.risk_profile.get('preferred_policy_types', [])
            max_premium = user.risk_profile.get('max_premium')
            
            print(f"\n[DEBUG] Preferences received:")
            print(f"  - preferred_policy_types from data: {data.get('preferred_policy_types', [])}")
            print(f"  - preferred_policy_types from risk_profile: {preferred_types}")
            print(f"  - max_premium: {max_premium}")
            
            preferences = {
                'preferred_policy_types': preferred_types,
                'max_premium': max_premium
            }
            
            # Build full user data for comprehensive scoring
            user_full_data = {
                'age': age,
                'income': income,
                'bmi': bmi,
                'diseases': diseases,
                'has_kids': data.get('has_kids', False),
                'marital_status': data.get('marital_status', ''),
                'height': float(data.get('height') or 0),
                'weight': float(data.get('weight') or 0)
            }
            
            # Get all available policies
            all_policies = db.query(models.Policy).all()
            
            if all_policies:
                # Convert policies to dict for scoring
                policies_dict = []
                for p in all_policies:
                    policies_dict.append({
                        'id': p.id,
                        'title': p.title,
                        'premium': float(p.premium),
                        'coverage_amount': getattr(p, 'coverage_amount', None),
                        'coverage': p.coverage or {},
                        'policy_type': p.policy_type,
                        'provider_id': p.provider_id,
                        'provider_rating': getattr(p.provider, 'rating', 4.0) if p.provider else 4.0
                    })
                
                # Score and rank policies with full user data
                ranked = rank_policies(policies_dict, preferences, risk_profile, user_full_data)
                
                # Clear existing recommendations
                db.query(models.Recommendation).filter(models.Recommendation.user_id == user.id).delete()
                
                # Save new recommendations
                for policy_dict, score, reason in ranked:
                    rec = models.Recommendation(
                        user_id=user.id,
                        policy_id=policy_dict['id'],
                        score=score,
                        reason=reason
                    )
                    db.add(rec)
                
                db.commit()
        except Exception as e:
            print(f"Recommendation generation failed: {e}")
            import traceback
            traceback.print_exc()
            db.rollback()
            # Don't fail preferences save if recommendations fail

        return {"message": "Preferences saved", "recommendations_generated": True}
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))






# ============ MODULE D: RECOMMENDATIONS (Week 4) ============

def _extract_recommendation_token(token: str | None, authorization: str | None) -> str:
    if authorization:
        auth_value = authorization.strip()
        if auth_value.lower().startswith("bearer "):
            bearer_token = auth_value.split(" ", 1)[1].strip()
            if bearer_token:
                return bearer_token
        elif auth_value:
            return auth_value

    if token:
        return token

    raise HTTPException(status_code=401, detail="Missing authentication token")


def _get_recommendation_user(db: Session, token: str | None, authorization: str | None) -> models.User:
    raw_token = _extract_recommendation_token(token, authorization)
    try:
        payload = jwt.decode(raw_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except HTTPException:
        raise
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user


def _build_recommendation_inputs(user: models.User):
    profile = user.risk_profile or {}
    if isinstance(profile, str):
        try:
            profile = json.loads(profile)
        except Exception:
            profile = {}
    if not isinstance(profile, dict):
        profile = {}

    profile_preferences = profile.get('preferences', {})
    if not isinstance(profile_preferences, dict):
        profile_preferences = {}

    preferred_types = profile_preferences.get(
        'preferred_policy_types',
        profile.get('preferred_policy_types', getattr(user, 'preferred_policy_types', []))
    )
    if isinstance(preferred_types, str):
        preferred_types = [preferred_types]
    if preferred_types is None:
        preferred_types = []
    preferred_types = [str(policy_type).strip().lower() for policy_type in preferred_types if str(policy_type).strip()]

    max_premium = profile_preferences.get('max_premium', profile.get('max_premium', getattr(user, 'max_premium', None)))
    user_budget = profile_preferences.get('user_budget', max_premium)

    risk_profile = profile.get('risk_profile') or profile.get('risk_level') or 'moderate'
    preferences = {
        'preferred_policy_types': preferred_types,
        'max_premium': max_premium,
        'user_budget': user_budget
    }

    user_full_data = {
        'demographics': {
            'age': profile.get('age'),
            'income': profile.get('income'),
            'bmi': profile.get('bmi'),
            'diseases': profile.get('diseases', []),
            'has_kids': profile.get('has_kids'),
            'marital_status': profile.get('marital_status'),
            'height': profile.get('height'),
            'weight': profile.get('weight')
        },
        'health': {
            'age': profile.get('age'),
            'bmi': profile.get('bmi'),
            'diseases': profile.get('diseases', [])
        },
        'preferences': preferences
    }

    return risk_profile, preferences, user_full_data


def _normalize_policy_type_for_response(policy_type: Any) -> str:
    if hasattr(policy_type, "value"):
        return str(policy_type.value).strip().lower()
    return str(policy_type).strip().lower()


def _recompute_recommendations(user: models.User, db: Session):
    risk_profile, preferences, user_full_data = _build_recommendation_inputs(user)

    def _safe_float(value, default=0.0):
        try:
            if value is None:
                return default
            return float(value)
        except Exception:
            return default

    all_policies = db.query(models.Policy).all()
    if not all_policies:
        return []

    policy_by_id = {p.id: p for p in all_policies}
    policies_dict = []
    for p in all_policies:
        description_value = getattr(p, 'description', None) or p.title
        policies_dict.append({
            'id': p.id,
            'title': p.title,
            'description': description_value,
            'premium': _safe_float(p.premium, 0.0),
            'coverage_amount': getattr(p, 'coverage_amount', None),
            'coverage': p.coverage or {},
            'policy_type': _normalize_policy_type_for_response(p.policy_type),
            'provider_id': p.provider_id,
            'provider_rating': _safe_float(getattr(p.provider, 'rating', 4.0), 4.0) if p.provider else 4.0,
        })

    ranked = rank_policies(
        policies_dict,
        preferences,
        risk_profile,
        user_full_data
    )

    result = []
    for policy_dict, score, reason in ranked:
        policy = policy_by_id.get(policy_dict['id'])
        if not policy:
            continue

        description_value = getattr(policy, 'description', None) or policy.title

        result.append({
            'id': policy.id,
            'policy_id': policy.id,
            'score': float(score),
            'reason': reason,
            'policy': {
                'id': policy.id,
                'title': policy.title,
                'description': description_value,
                'premium': _safe_float(policy.premium, 0.0),
                'policy_type': _normalize_policy_type_for_response(policy.policy_type),
            }
        })

    return result


@app.post("/recommendations/generate")
def generate_recommendations(
    token: str | None = Query(None),
    authorization: str | None = Header(None),
    db: Session = Depends(get_db)
):
    """Always recompute recommendations and return the full score-sorted list."""
    user = _get_recommendation_user(db, token, authorization)
    try:
        return _recompute_recommendations(user, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation generation failed: {str(e)}")


@app.get("/recommendations")
def get_recommendations(
    token: str | None = Query(None),
    authorization: str | None = Header(None),
    db: Session = Depends(get_db)
):
    """Always recompute recommendations and return the full score-sorted list."""
    user = _get_recommendation_user(db, token, authorization)
    try:
        return _recompute_recommendations(user, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation fetch failed: {str(e)}")

@app.delete("/recommendations/{recommendation_id}")
def delete_recommendation(
    recommendation_id: int,
    token: str | None = Query(None),
    authorization: str | None = Header(None),
    db: Session = Depends(get_db)
):
    """Delete a specific recommendation"""
    user = _get_recommendation_user(db, token, authorization)
    
    rec = db.query(models.Recommendation).filter(
        models.Recommendation.id == recommendation_id,
        models.Recommendation.user_id == user.id
    ).first()
    
    if not rec:
        # Recommendations are recomputed dynamically; treat missing rows as already removed.
        return {"message": "Recommendation removed"}
    
    db.delete(rec)
    db.commit()
    
    return {"message": "Recommendation deleted"}

# ============ MODULE E: CLAIMS (Week 5-6) ============

@app.post("/claims")
def create_claim(
    claim_data: schemas.ClaimCreate,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Create a new insurance claim in draft status.
    User can upload documents and submit later.
    
    Request body:
    {
        "user_policy_id": 1,
        "claim_type": "death|illness|accident|theft",
        "incident_date": "2026-01-15",
        "amount_claimed": 500000,
        "documents": [optional - loaded separately]
    }
    """
    try:
        user = get_current_user(token, db)
        
        # Verify user owns the policy
        user_policy = db.query(models.UserPolicy).filter(
            models.UserPolicy.id == claim_data.user_policy_id,
            models.UserPolicy.user_id == user.id
        ).first()
        
        if not user_policy:
            raise HTTPException(status_code=404, detail="Policy not found")
        
        # Generate unique claim number
        claim_number = f"CLM-{uuid.uuid4().hex[:8].upper()}"
        
        claim = models.Claim(
            user_policy_id=claim_data.user_policy_id,
            claim_number=claim_number,
            claim_type=claim_data.claim_type,
            incident_date=claim_data.incident_date,
            amount_claimed=claim_data.amount_claimed,
            status=models.ClaimStatusEnum.draft,
            description=None
        )
        
        db.add(claim)
        db.commit()
        db.refresh(claim)
        
        return {
            "id": claim.id,
            "claim_number": claim.claim_number,
            "status": "draft",
            "created_at": str(claim.created_at),
            "message": "Claim created. Upload documents and submit when ready."
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/claims")
def get_user_claims(
    token: str = Query(...),
    status: str = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get all claims for the logged-in user.
    Optional status filter: draft|submitted|under_review|approved|rejected|paid
    """
    try:
        user = get_current_user(token, db)
        
        query = db.query(models.Claim).join(
            models.UserPolicy,
            models.Claim.user_policy_id == models.UserPolicy.id
        ).filter(models.UserPolicy.user_id == user.id)
        
        if status:
            query = query.filter(models.Claim.status == status)
        
        claims = query.order_by(models.Claim.created_at.desc()).all()
        
        result = []
        for claim in claims:
            user_policy = claim.user_policy
            policy = user_policy.policy
            provider = policy.provider
            
            result.append({
                "id": claim.id,
                "claim_number": claim.claim_number,
                "claim_type": claim.claim_type,
                "amount_claimed": float(claim.amount_claimed),
                "status": claim.status,
                "rejection_reason": getattr(claim, 'rejection_reason', None),  # Handle missing field gracefully
                "incident_date": str(claim.incident_date),
                "created_at": str(claim.created_at),
                "policy": {
                    "id": policy.id,
                    "title": policy.title,
                    "premium": float(policy.premium),
                    "provider_name": provider.name
                },
                "documents_count": len(claim.documents)
            })
        
        return {
            "count": len(result),
            "claims": result
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/claims/{claim_id}")
def get_claim_detail(
    claim_id: int,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Get detailed claim information including all documents and timeline.
    """
    try:
        user = get_current_user(token, db)
        
        from sqlalchemy.orm import joinedload
        
        claim = db.query(models.Claim).options(
            joinedload(models.Claim.user_policy).joinedload(models.UserPolicy.policy).joinedload(models.Policy.provider),
            joinedload(models.Claim.documents)
        ).join(
            models.UserPolicy,
            models.Claim.user_policy_id == models.UserPolicy.id
        ).filter(
            models.Claim.id == claim_id,
            models.UserPolicy.user_id == user.id
        ).first()
        
        if not claim:
            raise HTTPException(status_code=404, detail="Claim not found")
        
        user_policy = claim.user_policy
        policy = user_policy.policy
        provider = policy.provider
        
        return {
            "id": claim.id,
            "claim_number": claim.claim_number,
            "claim_type": claim.claim_type,
            "amount_claimed": float(claim.amount_claimed),
            "status": claim.status,
            "rejection_reason": getattr(claim, 'rejection_reason', None),  # Handle missing field gracefully
            "incident_date": str(claim.incident_date),
            "description": claim.description,
            "created_at": str(claim.created_at),
            "policy": {
                "id": policy.id,
                "title": policy.title,
                "premium": float(policy.premium),
                "policy_type": policy.policy_type,
                "policy_number": user_policy.policy_number,
                "provider": provider.name
            },
            "documents": [
                {
                    "id": doc.id,
                    "doc_type": doc.doc_type,
                    "file_name": doc.file_name,
                    "file_type": doc.file_type,
                    "uploaded_at": str(doc.uploaded_at)
                }
                for doc in claim.documents
            ],
            "documents_count": len(claim.documents)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/claims/{claim_id}/documents")
def upload_claim_document(
    claim_id: int,
    file: UploadFile = File(...),
    token: str = Query(...),
    doc_type: str = Query("other"),
    db: Session = Depends(get_db)
):
    """
    Upload a document to a claim. Stores binary file data directly in PostgreSQL.
    - Validates file type (PDF, JPG, PNG only)
    - Validates file size (max 10MB)
    - Stores file content as BYTEA in database
    - Returns document ID and metadata
    """
    import logging
    logger = logging.getLogger("upload_document")
    
    try:
        print(f"\n{'='*70}")
        print(f"[UPLOAD_DOCUMENT] Starting upload for claim_id={claim_id}")
        print(f"  File name: {file.filename}")
        print(f"  Content type: {file.content_type}")
        print(f"  Doc type: {doc_type}")
        print(f"  Token: {token[:30]}..." if token else "None")
        
        # Authenticate user
        user = get_current_user(token, db)
        print(f"  User authenticated: {user.name} (ID={user.id})")
        
        # Verify claim belongs to user
        claim = db.query(models.Claim).join(
            models.UserPolicy,
            models.Claim.user_policy_id == models.UserPolicy.id
        ).filter(
            models.Claim.id == claim_id,
            models.UserPolicy.user_id == user.id
        ).first()
        
        if not claim:
            print(f"  ERROR: Claim {claim_id} not found or doesn't belong to user {user.id}")
            raise HTTPException(status_code=404, detail=f"Claim {claim_id} not found")
        
        print(f"  Claim verified: {claim.claim_number}")
        
        # Validate file type (allowed MIME types)
        allowed_types = ["application/pdf", "image/jpeg", "image/png"]
        if file.content_type not in allowed_types:
            error_msg = f"Invalid file type: {file.content_type}. Only PDF, JPG, PNG allowed."
            print(f"  ERROR: {error_msg}")
            raise HTTPException(status_code=400, detail=error_msg)
        
        # Read file contents into memory (using synchronous file.file method)
        print(f"  Reading file contents...")
        file.file.seek(0)  # Reset to beginning
        contents = file.file.read()
        file_size = len(contents)
        print(f"  File size: {file_size} bytes ({file_size / 1024:.2f} KB)")
        
        # Validate file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if file_size > max_size:
            error_msg = f"File too large. Max {max_size // 1024 // 1024}MB allowed."
            print(f"  ERROR: {error_msg}")
            raise HTTPException(status_code=400, detail=error_msg)
        
        # Verify file content is not empty
        if file_size == 0:
            error_msg = "File is empty"
            print(f"  ERROR: {error_msg}")
            raise HTTPException(status_code=400, detail=error_msg)
        
        # Create document record
        print(f"  Creating ClaimDocument instance...")
        doc = models.ClaimDocument(
            claim_id=claim_id,
            file_data=contents,  # Binary file content
            file_name=file.filename,  # Original filename
            file_type=file.content_type,  # MIME type
            doc_type=doc_type  # Document classification
        )
        
        # Add to session
        print(f"  Adding document to database session...")
        db.add(doc)
        
        # Commit transaction
        print(f"  Committing transaction...")
        db.commit()
        print(f"  Transaction committed successfully")
        
        # Refresh to get generated ID
        db.refresh(doc)
        print(f"  Document ID generated: {doc.id}")
        print(f"  Upload status: SUCCESSFUL")
        print(f"{'='*70}\n")
        
        return {
            "id": doc.id,
            "claim_id": doc.claim_id,
            "file_name": doc.file_name,
            "file_type": doc.file_type,
            "doc_type": doc.doc_type,
            "file_size_bytes": file_size,
            "uploaded_at": str(doc.uploaded_at),
            "message": "Document uploaded and saved to database successfully"
        }
        
    except HTTPException as e:
        print(f"  HTTP Exception: {e.status_code} - {e.detail}")
        print(f"{'='*70}\n")
        raise
    except Exception as e:
        print(f"  EXCEPTION: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        print(f"{'='*70}\n")
        try:
            db.rollback()
            print(f"  Database rolled back")
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/claims/{claim_id}/submit")
def submit_claim(
    claim_id: int,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Submit a claim for review.
    Changes status from draft to submitted.
    Runs fraud detection rules automatically.
    """
    try:
        user = get_current_user(token, db)
        
        claim = db.query(models.Claim).join(
            models.UserPolicy,
            models.Claim.user_policy_id == models.UserPolicy.id
        ).filter(
            models.Claim.id == claim_id,
            models.UserPolicy.user_id == user.id
        ).first()
        
        if not claim:
            raise HTTPException(status_code=404, detail="Claim not found")
        
        if claim.status != models.ClaimStatusEnum.draft:
            raise HTTPException(
                status_code=400, 
                detail=f"Only draft claims can be submitted. Current status: {claim.status}"
            )
        
        if len(claim.documents) == 0:
            raise HTTPException(
                status_code=400, 
                detail="At least one document is required before submitting"
            )
        
        # ===== WEEK 7: RUN FRAUD DETECTION =====
        fraud_flags = check_claim_for_fraud(db, claim)
        fraud_risk = get_claim_fraud_risk_level(fraud_flags)
        
        # Set initial status based on fraud risk
        if fraud_risk == "CRITICAL":
            claim.status = models.ClaimStatusEnum.under_review
        else:
            claim.status = models.ClaimStatusEnum.submitted
        
        db.commit()
        
        response = {
            "message": "Claim submitted successfully",
            "claim_number": claim.claim_number,
            "status": claim.status,
            "submitted_at": str(datetime.utcnow()),
            "next_steps": "Our team will review your claim within 5-7 business days",
            "fraud_check": {
                "risk_level": fraud_risk,
                "flags_count": len(fraud_flags),
                "flags": [
                    {
                        "code": f.rule_code,
                        "severity": f.severity,
                        "details": f.details
                    }
                    for f in fraud_flags
                ]
            }
        }
        
        # Send confirmation email to user
        policy = claim.user_policy.policy
        EmailService.send_claim_submitted_notification(
            user_email=user.email,
            user_name=user.name,
            claim_number=claim.claim_number,
            policy_name=policy.title
        )
        
        # If critical risk, send fraud alert email
        if fraud_risk == "CRITICAL":
            response["warning"] = "Your claim has been flagged for detailed review due to potential fraud indicators."
            EmailService.send_fraud_alert_notification(
                user_email=user.email,
                user_name=user.name,
                claim_number=claim.claim_number,
                risk_level=fraud_risk
            )
        
        # Create notification for all admins about new claim submission
        try:
            admin_users = db.query(models.User).filter(
                (models.User.role == 'admin') | (models.User.is_admin == True)
            ).all()
            
            for admin_user in admin_users:
                notification = models.ClaimNotification(
                    user_id=admin_user.id,
                    claim_id=claim.id,
                    notification_type="new_claim_submitted",
                    title=f"New Claim Submitted - {claim.claim_number}",
                    message=f"New claim {claim.claim_number} submitted by {user.name} for review. Documents uploaded: {len(claim.documents)}",
                    admin_id=user.id  # Store who submitted the claim
                )
                db.add(notification)
            
            db.commit()
            print(f"Created notifications for {len(admin_users)} admin users")
        except Exception as notif_err:
            db.rollback()
            print(f"Warning: Failed to create admin notifications: {notif_err}")
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ============ WEEK 7: FRAUD DETECTION & RULES ============

@app.get("/claims/{claim_id}/fraud-flags")
def get_claim_fraud_flags(
    claim_id: int,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Get fraud flags for a specific claim.
    User can only view their own claims' fraud flags.
    """
    try:
        user = get_current_user(token, db)
        
        claim = db.query(models.Claim).join(
            models.UserPolicy,
            models.Claim.user_policy_id == models.UserPolicy.id
        ).filter(
            models.Claim.id == claim_id,
            models.UserPolicy.user_id == user.id
        ).first()
        
        if not claim:
            raise HTTPException(status_code=404, detail="Claim not found")
        
        fraud_flags = db.query(models.FraudFlag).filter(
            models.FraudFlag.claim_id == claim_id
        ).all()
        
        return {
            "claim_number": claim.claim_number,
            "flags_count": len(fraud_flags),
            "risk_level": get_claim_fraud_risk_level(fraud_flags),
            "flags": [
                {
                    "id": f.id,
                    "code": f.rule_code,
                    "name": f.rule_code.replace("_", " ").title(),
                    "severity": f.severity,
                    "details": f.details,
                    "created_at": str(f.created_at)
                }
                for f in fraud_flags
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/claims/{claim_id}/recheck-fraud")
def recheck_claim_fraud(
    claim_id: int,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Recheck a claim for fraud patterns.
    Creates new fraud flags and removes old ones.
    Admin endpoint (currently open for testing).
    """
    try:
        user = get_current_user(token, db)
        
        claim = db.query(models.Claim).filter(
            models.Claim.id == claim_id
        ).first()
        
        if not claim:
            raise HTTPException(status_code=404, detail="Claim not found")
        
        # Delete old fraud flags
        db.query(models.FraudFlag).filter(
            models.FraudFlag.claim_id == claim_id
        ).delete()
        
        # Run new fraud check
        fraud_flags = check_claim_for_fraud(db, claim)
        fraud_risk = get_claim_fraud_risk_level(fraud_flags)
        
        return {
            "claim_number": claim.claim_number,
            "risk_level": fraud_risk,
            "flags_count": len(fraud_flags),
            "flags": [
                {
                    "code": f.rule_code,
                    "severity": f.severity,
                    "details": f.details
                }
                for f in fraud_flags
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/fraud/summary")
def get_fraud_summary(
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Get fraud summary statistics (Admin endpoint).
    Shows overall fraud flags and risk distribution.
    """
    try:
        user = get_current_user(token, db)
        # In production, check if user is admin
        
        total_flags = db.query(models.FraudFlag).count()
        
        high_severity = db.query(models.FraudFlag).filter(
            models.FraudFlag.severity == models.FraudSeverityEnum.high
        ).count()
        
        medium_severity = db.query(models.FraudFlag).filter(
            models.FraudFlag.severity == models.FraudSeverityEnum.medium
        ).count()
        
        low_severity = db.query(models.FraudFlag).filter(
            models.FraudFlag.severity == models.FraudSeverityEnum.low
        ).count()
        
        # Count by rule
        rule_counts = db.query(
            models.FraudFlag.rule_code,
            func.count(models.FraudFlag.id).label("count")
        ).group_by(models.FraudFlag.rule_code).all()
        
        claims_with_flags = db.query(models.Claim).join(
            models.FraudFlag
        ).distinct().count()
        
        return {
            "total_flags": total_flags,
            "severity_distribution": {
                "high": high_severity,
                "medium": medium_severity,
                "low": low_severity
            },
            "claims_flagged": claims_with_flags,
            "top_fraud_rules": [
                {"rule": code, "count": count}
                for code, count in sorted(rule_counts, key=lambda x: x[1], reverse=True)[:5]
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/fraud/high-risk-claims")
def get_high_risk_claims(
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Get list of high-risk claims requiring review (Admin endpoint).
    """
    try:
        user = get_current_user(token, db)
        # In production, check if user is admin
        
        # Get claims with high severity fraud flags
        high_risk_claims = db.query(models.Claim).join(
            models.FraudFlag
        ).filter(
            models.FraudFlag.severity == models.FraudSeverityEnum.high
        ).distinct().all()
        
        claims_data = []
        for claim in high_risk_claims:
            flags = db.query(models.FraudFlag).filter(
                models.FraudFlag.claim_id == claim.id
            ).all()
            
            claims_data.append({
                "id": claim.id,
                "claim_number": claim.claim_number,
                "claim_type": claim.claim_type,
                "amount_claimed": float(claim.amount_claimed),
                "status": claim.status,
                "created_at": str(claim.created_at),
                "user_name": claim.user_policy.user.name,
                "policy_type": claim.user_policy.policy.policy_type,
                "risk_level": get_claim_fraud_risk_level(flags),
                "flags_count": len(flags),
                "high_severity_flags": sum(1 for f in flags if f.severity == models.FraudSeverityEnum.high)
            })
        
        return sorted(claims_data, key=lambda x: x["high_severity_flags"], reverse=True)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/claims/{claim_id}")
def delete_claim(
    claim_id: int,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Delete a claim. Only draft claims can be deleted.
    """
    try:
        user = get_current_user(token, db)
        
        claim = db.query(models.Claim).join(
            models.UserPolicy,
            models.Claim.user_policy_id == models.UserPolicy.id
        ).filter(
            models.Claim.id == claim_id,
            models.UserPolicy.user_id == user.id
        ).first()
        
        if not claim:
            raise HTTPException(status_code=404, detail="Claim not found")
        
        if claim.status != models.ClaimStatusEnum.draft:
            raise HTTPException(
                status_code=400, 
                detail="Only draft claims can be deleted"
            )
        
        # Delete associated documents first
        db.query(models.ClaimDocument).filter(
            models.ClaimDocument.claim_id == claim_id
        ).delete()
        
        # Delete the claim
        db.delete(claim)
        db.commit()
        
        return {
            "message": "Claim deleted successfully",
            "claim_number": claim.claim_number
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/claims/{claim_id}/documents/{doc_id}")
def delete_document(
    claim_id: int,
    doc_id: int,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Delete a document from a claim. Only possible if claim is in draft status.
    """
    try:
        user = get_current_user(token, db)
        
        claim = db.query(models.Claim).join(
            models.UserPolicy,
            models.Claim.user_policy_id == models.UserPolicy.id
        ).filter(
            models.Claim.id == claim_id,
            models.UserPolicy.user_id == user.id
        ).first()
        
        if not claim:
            raise HTTPException(status_code=404, detail="Claim not found")
        
        if claim.status != models.ClaimStatusEnum.draft:
            raise HTTPException(
                status_code=400, 
                detail="Can only delete documents from draft claims"
            )
        
        doc = db.query(models.ClaimDocument).filter(
            models.ClaimDocument.id == doc_id,
            models.ClaimDocument.claim_id == claim_id
        ).first()
        
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        
        db.delete(doc)
        db.commit()
        
        return {
            "message": "Document deleted successfully",
            "doc_id": doc_id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ============ USER APPLICATIONS (NEW POLICY PURCHASES) ============

@app.post("/user-applications")
def apply_for_insurance(
    policy_id: int = Query(...),
    full_name: str = Query(...),
    email: str = Query(...),
    phone_number: str = Query(...),
    date_of_birth: str = Query(...),
    gender: str = Query(...),
    address: str = Query(...),
    nominee_name: str = Query(...),
    nominee_relation: str = Query(...),
    nominee_phone: str = Query(...),
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Submit an application to purchase a new insurance policy
    """
    try:
        # Verify user is authenticated
        user = get_current_user(token, db)
        
        # Verify policy exists
        policy = db.query(models.Policy).filter(models.Policy.id == policy_id).first()
        if not policy:
            raise HTTPException(status_code=404, detail="Policy not found")
        
        # Check if user already has this policy
        existing = db.query(models.UserPolicy).filter(
            models.UserPolicy.user_id == user.id,
            models.UserPolicy.policy_id == policy_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="You already have this policy")
        
        # Generate unique policy number
        policy_number = f"POL-{uuid.uuid4().hex[:8].upper()}"
        
        # Create new user policy (application approved automatically for demo)
        from datetime import timedelta
        start_date = datetime.now().date()
        end_date = start_date + timedelta(days=365 * (policy.term_months // 12))
        
        new_user_policy = models.UserPolicy(
            user_id=user.id,
            policy_id=policy_id,
            policy_number=policy_number,
            start_date=start_date,
            end_date=end_date,
            premium=policy.premium,
            status=models.UserPolicyStatusEnum.active,
            auto_renew=False
        )
        
        db.add(new_user_policy)
        db.commit()
        db.refresh(new_user_policy)
        
        # Send confirmation email to user
        EmailService.send_application_confirmation(
            user_email=user.email,
            user_name=user.name,
            policy_name=policy.title,
            policy_number=policy_number,
            premium=str(policy.premium)
        )
        
        return {
            "message": "Application submitted successfully!",
            "policy_number": policy_number,
            "start_date": str(start_date),
            "end_date": str(end_date),
            "status": "active",
            "premium": str(policy.premium),
            "email_sent": True
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error processing application: {str(e)}")


# ============ DOCUMENT APPROVAL ENDPOINTS ============

@app.post("/admin/documents/{doc_id}/approve")
def approve_document(
    doc_id: int,
    token: str = Query(...),
    comments: str = Query("", description="Optional comments"),
    db: Session = Depends(get_db)
):
    """
    Approve a document for a claim.
    Admin only endpoint.
    
    This endpoint only approves the individual document.
    The claim status is updated based on ALL documents:
    - If all documents are approved → claim is approved
    - If any document is rejected → claim is rejected
    - If any document is pending → claim stays under review
    """
    try:
        user = get_current_user(token, db)
        if not getattr(user, "is_admin", False):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        doc = db.query(models.ClaimDocument).filter(
            models.ClaimDocument.id == doc_id
        ).first()
        
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Check if already has an approval record
        existing_approval = db.query(models.DocumentApproval).filter(
            models.DocumentApproval.document_id == doc_id
        ).first()
        
        if existing_approval:
            # If already approved, return success (idempotent)
            if existing_approval.status == models.DocumentApprovalStatusEnum.approved:
                print(f"Document {doc_id} already approved, returning success (idempotent)")
                return {
                    "message": "Document already approved",
                    "document_id": doc_id,
                    "status": "approved",
                    "reviewed_at": str(existing_approval.reviewed_at)
                }
            # If rejected, update to approved (allow re-approval)
            elif existing_approval.status == models.DocumentApprovalStatusEnum.rejected:
                existing_approval.status = models.DocumentApprovalStatusEnum.approved
                existing_approval.admin_id = user.id
                existing_approval.comments = comments if comments else None
                existing_approval.reviewed_at = datetime.utcnow()
                db.commit()
                approval = existing_approval
            else:
                # If pending, update to approved
                existing_approval.status = models.DocumentApprovalStatusEnum.approved
                existing_approval.admin_id = user.id
                existing_approval.comments = comments if comments else None
                existing_approval.reviewed_at = datetime.utcnow()
                db.commit()
                approval = existing_approval
        else:
            # Create new approval record - mark document as approved
            approval = models.DocumentApproval(
                document_id=doc_id,
                admin_id=user.id,
                status=models.DocumentApprovalStatusEnum.approved,
                comments=comments if comments else None,
                reviewed_at=datetime.utcnow()
            )
            db.add(approval)
            db.commit()
        
        # NOW: Update claim status based on ALL documents, not just this one
        try:
            if doc.claim_id:
                claim_update_result = ClaimService.update_claim_status_based_on_documents(
                    doc.claim_id, db
                )
                print(f"Claim {doc.claim_id} status updated: {claim_update_result}")
                
                # If claim status changed, create appropriate notification
                if claim_update_result["status_changed"]:
                    claim = db.query(models.Claim).filter(
                        models.Claim.id == doc.claim_id
                    ).first()
                    
                    if claim and claim.user_policy_id:
                        user_policy = db.query(models.UserPolicy).filter(
                            models.UserPolicy.id == claim.user_policy_id
                        ).first()
                        
                        if user_policy and user_policy.user_id:
                            if claim.status == models.ClaimStatusEnum.approved:
                                notification = models.ClaimNotification(
                                    user_id=user_policy.user_id,
                                    claim_id=claim.id,
                                    notification_type="claim_approved",
                                    title="✅ Claim Approved!",
                                    message=f"All documents have been approved. Your claim {claim.claim_number} is now approved.",
                                    admin_id=user.id
                                )
                                db.add(notification)
                                db.commit()
                            elif claim.status == models.ClaimStatusEnum.rejected:
                                notification = models.ClaimNotification(
                                    user_id=user_policy.user_id,
                                    claim_id=claim.id,
                                    notification_type="claim_rejected",
                                    title="❌ Claim Rejected",
                                    message=claim.rejection_reason or "Your claim has been rejected.",
                                    admin_id=user.id
                                )
                                db.add(notification)
                                db.commit()
        except Exception as status_err:
            db.rollback()
            print(f"Warning: Failed to update claim status: {status_err}")
        
        # Log admin action (in separate transaction)
        try:
            admin_log = models.AdminLog(
                admin_id=user.id,
                action="DOCUMENT_APPROVED",
                target_type="document",
                target_id=doc_id
            )
            db.add(admin_log)
            db.commit()
        except Exception as log_err:
            db.rollback()
            print(f"Warning: Failed to log action: {log_err}")
        
        # Create notification for this document approval (unless claim was already fully approved)
        try:
            if doc.claim_id:
                claim = db.query(models.Claim).filter(
                    models.Claim.id == doc.claim_id
                ).first()
                
                if claim and claim.user_policy_id and claim.status != models.ClaimStatusEnum.approved:
                    user_policy = db.query(models.UserPolicy).filter(
                        models.UserPolicy.id == claim.user_policy_id
                    ).first()
                    if user_policy and user_policy.user_id:
                        notification = models.ClaimNotification(
                            user_id=user_policy.user_id,
                            claim_id=claim.id,
                            notification_type="document_approved",
                            title=f"Document Approved - {doc.doc_type or doc.file_name}",
                            message=f"Your {doc.doc_type or 'document'} has been reviewed and approved by admin.{' Comments: ' + comments if comments else ''}",
                            admin_id=user.id
                        )
                        db.add(notification)
                        db.commit()
        except Exception as notif_err:
            db.rollback()
            print(f"Warning: Failed to create notification: {notif_err}")
        
        return {
            "message": "Document approved successfully",
            "document_id": doc_id,
            "status": "approved",
            "reviewed_at": str(approval.reviewed_at)
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error in approve_document: {e}")
        raise HTTPException(status_code=500, detail=f"Error approving document: {str(e)}")

@app.post("/admin/documents/{doc_id}/reject")
def reject_document(
    doc_id: int,
    token: str = Query(...),
    reason: str = Query("", description="Reason for rejection"),
    db: Session = Depends(get_db)
):
    """
    Reject a document for a claim.
    Admin only endpoint.
    
    This endpoint only rejects the individual document.
    The claim status is updated based on ALL documents:
    - If any document is rejected → claim is rejected immediately
    - If all documents are approved → claim is approved
    - If any document is pending → claim stays under review
    """
    try:
        user = get_current_user(token, db)
        if not getattr(user, "is_admin", False):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        doc = db.query(models.ClaimDocument).filter(
            models.ClaimDocument.id == doc_id
        ).first()
        
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Check if already has an approval record
        existing_approval = db.query(models.DocumentApproval).filter(
            models.DocumentApproval.document_id == doc_id
        ).first()
        
        if existing_approval:
            # If already rejected with the same reason, return success (idempotent)
            if existing_approval.status == models.DocumentApprovalStatusEnum.rejected:
                print(f"Document {doc_id} already rejected, returning success (idempotent)")
                return {
                    "message": "Document already rejected",
                    "document_id": doc_id,
                    "status": "rejected",
                    "reviewed_at": str(existing_approval.reviewed_at)
                }
            # If approved, update to rejected (allow rejection after approval)
            elif existing_approval.status == models.DocumentApprovalStatusEnum.approved:
                existing_approval.status = models.DocumentApprovalStatusEnum.rejected
                existing_approval.admin_id = user.id
                existing_approval.comments = reason if reason else None
                existing_approval.rejection_reason = reason if reason else None
                existing_approval.reviewed_at = datetime.utcnow()
                db.commit()
                approval = existing_approval
            else:
                # If pending, update to rejected
                existing_approval.status = models.DocumentApprovalStatusEnum.rejected
                existing_approval.admin_id = user.id
                existing_approval.comments = reason if reason else None
                existing_approval.rejection_reason = reason if reason else None
                existing_approval.reviewed_at = datetime.utcnow()
                db.commit()
                approval = existing_approval
        else:
            # Create new rejection record
            approval = models.DocumentApproval(
                document_id=doc_id,
                admin_id=user.id,
                status=models.DocumentApprovalStatusEnum.rejected,
                comments=reason if reason else None,
                rejection_reason=reason if reason else None,
                reviewed_at=datetime.utcnow()
            )
            db.add(approval)
            db.commit()
        
        # NOW: Update claim status based on ALL documents
        # If ANY document is rejected, the entire claim is rejected
        try:
            if doc.claim_id:
                claim_update_result = ClaimService.update_claim_status_based_on_documents(
                    doc.claim_id, db
                )
                print(f"Claim {doc.claim_id} status updated: {claim_update_result}")
                
                # Create notification about claim rejection
                claim = db.query(models.Claim).filter(
                    models.Claim.id == doc.claim_id
                ).first()
                
                if claim and claim.user_policy_id:
                    user_policy = db.query(models.UserPolicy).filter(
                        models.UserPolicy.id == claim.user_policy_id
                    ).first()
                    
                    if user_policy and user_policy.user_id:
                        notification = models.ClaimNotification(
                            user_id=user_policy.user_id,
                            claim_id=claim.id,
                            notification_type="claim_rejected",
                            title="❌ Claim Rejected",
                            message=claim.rejection_reason or f"Your claim has been rejected due to document issues.",
                            admin_id=user.id
                        )
                        db.add(notification)
                        db.commit()
        except Exception as status_err:
            db.rollback()
            print(f"Warning: Failed to update claim status: {status_err}")
        
        # Log admin action (in separate transaction)
        try:
            admin_log = models.AdminLog(
                admin_id=user.id,
                action="DOCUMENT_REJECTED",
                target_type="document",
                target_id=doc_id
            )
            db.add(admin_log)
            db.commit()
        except Exception as log_err:
            db.rollback()
            print(f"Warning: Failed to log action: {log_err}")
        
        # Create notification about document rejection
        try:
            if doc.claim_id:
                claim = db.query(models.Claim).filter(models.Claim.id == doc.claim_id).first()
                if claim and claim.user_policy_id:
                    user_policy = db.query(models.UserPolicy).filter(models.UserPolicy.id == claim.user_policy_id).first()
                    if user_policy and user_policy.user_id:
                        notification = models.ClaimNotification(
                            user_id=user_policy.user_id,
                            claim_id=claim.id,
                            notification_type="document_rejected",
                            title=f"Document Rejected - {doc.doc_type or doc.file_name}",
                            message=f"Your {doc.doc_type or 'document'} has been reviewed and rejected. Reason: {reason if reason else 'Does not meet requirements'} Please upload the correct document.",
                            admin_id=user.id
                        )
                        db.add(notification)
                        db.commit()
        except Exception as notif_err:
            db.rollback()
            print(f"Warning: Failed to create notification: {notif_err}")
        
        return {
            "message": "Document rejected successfully",
            "document_id": doc_id,
            "status": "rejected",
            "reviewed_at": str(approval.reviewed_at)
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error in reject_document: {e}")
        raise HTTPException(status_code=500, detail=f"Error rejecting document: {str(e)}")


# ============ ADMIN: CLAIM DOCUMENTS API ============

@app.get("/admin/claim-documents")
def list_claim_documents(
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    List all claim documents stored in database.
    Admin only endpoint.
    Returns: list of documents with claim_id, file_name, file_type, uploaded_at
    """
    try:
        # Authenticate user
        user = get_current_user(token, db)
        
        # Check admin authorization
        if not getattr(user, "is_admin", False):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Retrieve all documents with claim information
        documents = db.query(models.ClaimDocument).all()
        
        result = []
        for doc in documents:
            result.append({
                "id": doc.id,
                "claim_id": doc.claim_id,
                "file_name": doc.file_name,
                "file_type": doc.file_type,
                "doc_type": doc.doc_type,
                "file_size_bytes": len(doc.file_data) if doc.file_data else 0,
                "uploaded_at": str(doc.uploaded_at),
                "claim_owner": doc.claim.user_policy.user.name if doc.claim and doc.claim.user_policy else None
            })
        
        return {"total": len(result), "documents": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/admin/claim-documents/{doc_id}")
def download_claim_document(
    doc_id: int,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Download/retrieve a specific claim document.
    Admin only endpoint.
    Returns file as StreamingResponse with appropriate MIME type.
    """
    try:
        # Authenticate user
        user = get_current_user(token, db)
        
        # Check admin authorization
        if not getattr(user, "is_admin", False):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Retrieve document from database
        doc = db.query(models.ClaimDocument).filter(
            models.ClaimDocument.id == doc_id
        ).first()
        
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        
        if not doc.file_data:
            raise HTTPException(status_code=404, detail="Document has no file data")
        
        # Return file as streaming response with proper headers
        return StreamingResponse(
            iter([doc.file_data]),  # Stream the binary data
            media_type=doc.file_type,  # Use stored MIME type
            headers={
                "Content-Disposition": f"attachment; filename={doc.file_name}"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/admin/documents/{doc_id}/view")
def view_claim_document(
    doc_id: int,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    View/display a specific claim document in browser.
    Admin only endpoint.
    Returns file as StreamingResponse with inline display (not attachment).
    Supports: PDF, images, text files.
    """
    try:
        # Authenticate user
        user = get_current_user(token, db)
        
        # Check admin authorization
        if not getattr(user, "is_admin", False):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Retrieve document from database
        doc = db.query(models.ClaimDocument).filter(
            models.ClaimDocument.id == doc_id
        ).first()
        
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        
        if not doc.file_data:
            raise HTTPException(status_code=404, detail="Document file data is missing or corrupted")
        
        # Map file extensions to viewable MIME types
        file_type = doc.file_type or 'application/octet-stream'
        
        # Determine if file is viewable in browser
        viewable_types = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'text/plain',
            'text/html'
        ]
        
        # If MIME type not explicitly viewable, try to infer from filename
        is_viewable = False
        if file_type in viewable_types:
            is_viewable = True
        elif doc.file_name:
            file_name_lower = doc.file_name.lower()
            if any(file_name_lower.endswith(ext) for ext in ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.txt', '.html']):
                is_viewable = True
        
        # Return file as response with inline display
        from fastapi.responses import Response
        return Response(
            content=doc.file_data,  # Binary data from BYTEA column
            media_type=file_type,  # Use stored MIME type
            headers={
                "Content-Disposition": f"inline; filename={doc.file_name}",  # Display inline instead of download
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "X-Content-Type-Options": "nosniff"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error retrieving document: {str(e)}")


# ============ ADMIN PORTAL ENDPOINTS ============

@app.get("/admin/dashboard-stats")
def get_admin_stats_endpoint(
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Get admin dashboard statistics.
    Requires admin role.
    
    Returns:
        - total_users: Total registered users
        - total_admins: Number of admin users
        - total_policies: Total policies available
        - total_claims: Total claims submitted
        - total_documents: Total documents uploaded
        - active_claims: Claims currently in progress
    """
    user = get_current_user(token, db)
    
    # Check admin role
    if user.role != 'admin' and not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        from backend.admin_auth import get_admin_stats
        stats = get_admin_stats(db)
        return {
            "status": "success",
            "data": stats
        }
    except Exception as e:
        print(f"Error getting admin stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/users")
def get_all_users(
    token: str = Query(...),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """
    List all registered users.
    Requires admin role.
    
    Query Parameters:
        - skip: Offset for pagination (default 0)
        - limit: Maximum records to return (default 100, max 1000)
    
    Returns:
        - total_count: Total users in system
        - users: Array of user objects with name, email, role, etc.
    """
    user = get_current_user(token, db)
    
    # Check admin role
    if user.role != 'admin' and not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        from backend.admin_auth import get_user_list
        result = get_user_list(db, skip=skip, limit=limit)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        print(f"Error getting users: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/claim-documents-list")
def get_all_documents(
    token: str = Query(...),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    claim_number: str = Query(None, description="Optional claim number to filter by"),
    db: Session = Depends(get_db)
):
    """
    List all uploaded documents.
    Requires admin role.
    
    Query Parameters:
        - skip: Offset for pagination
        - limit: Maximum records to return
        - claim_number: Optional claim number to filter results
    
    Returns:
        - total_count: Total documents in system
        - documents: Array of document objects with metadata
    """
    user = get_current_user(token, db)
    
    # Check admin role
    if user.role != 'admin' and not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        from backend.admin_auth import get_documents_list
        result = get_documents_list(db, skip=skip, limit=limit, claim_number=claim_number)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        print(f"Error getting documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/verify-role")
def verify_admin_role(
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Verify if the current user has admin role.
    Used by frontend to check access rights.
    
    Returns:
        - is_admin: Boolean indicating admin status
        - role: User's role (user or admin)
        - user_id: User ID
    """
    try:
        user = get_current_user(token, db)
        if not user:
            return {"is_admin": False, "role": None}
        
        is_admin_user = user.role == 'admin' or user.is_admin
        return {
            "is_admin": is_admin_user,
            "role": user.role,
            "user_id": user.id,
            "email": user.email
        }
    except Exception as e:
        print(f"Error verifying role: {e}")
        return {"is_admin": False, "role": None, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)






