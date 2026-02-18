# Claims Workflow Setup Guide

This guide will help you set up the complete claims workflow with document uploads (S3), status tracking, and email notifications (Celery).

## 🎯 Milestone 3: Claims Management System

### Features Implemented

1. **Week 5: Claim Filing Wizard with S3 Uploads**
   - Multi-document upload support (PDF, JPG, PNG, DOC, DOCX)
   - File validation (type and size checks)
   - AWS S3 integration for secure document storage
   - Presigned URL generation for secure document access

2. **Week 6: Claim Status Tracking & Notifications**
   - Real-time claim status tracking
   - Email notifications via Celery tasks
   - Claim submission confirmation emails
   - Claim status update notifications

## 📋 Prerequisites

Before setting up the claims workflow, ensure you have:

1. **Python 3.8+** installed
2. **Redis** server running (for Celery)
3. **AWS Account** with S3 access (for document storage)
4. **Email Account** with SMTP access (for notifications)

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```powershell
cd backend\backend
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```powershell
   copy .env.example .env
   ```

2. Edit `.env` and fill in the following values:

   **AWS S3 Configuration:**
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
   - `AWS_REGION`: AWS region (e.g., us-east-1)
   - `S3_BUCKET_NAME`: S3 bucket name for claim documents

   **Redis Configuration:**
   - `REDIS_URL`: Redis connection URL (default: redis://localhost:6379/0)

   **Email Configuration:**
   - `SMTP_HOST`: SMTP server host (e.g., smtp.gmail.com)
   - `SMTP_PORT`: SMTP port (usually 587 for TLS)
   - `SMTP_USER`: Your email address
   - `SMTP_PASSWORD`: Your email password or app-specific password
   - `EMAIL_FROM`: Sender email address

### Step 3: Create S3 Bucket

1. Log in to AWS Console
2. Navigate to S3
3. Create a new bucket (e.g., `insurenz-claims`)
4. Configure bucket permissions:
   - Keep the bucket private
   - Enable versioning (optional)
   - Add CORS configuration if needed for browser uploads

### Step 4: Setup Redis

**Windows:**
```powershell
# Install via Chocolatey
choco install redis-64

# Or download from: https://github.com/microsoftarchive/redis/releases
# Start Redis server
redis-server
```

**Linux/Mac:**
```bash
# Install Redis
sudo apt-get install redis-server  # Ubuntu/Debian
brew install redis                 # macOS

# Start Redis
redis-server
```

### Step 5: Create Database Tables

Run the table creation script:

```powershell
python create_claims_tables_sqlite.py
```

This will create the following tables:
- `claims`: Stores claim information
- `claim_documents`: Stores document metadata and S3 references

### Step 6: Start Celery Worker

Open a new terminal and start the Celery worker:

```powershell
cd backend\backend
celery -A celery_app worker --loglevel=info --pool=solo
```

> **Note for Windows:** Use `--pool=solo` flag as eventlet/gevent may have issues on Windows.

### Step 7: Start FastAPI Server

```powershell
cd backend\backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 🧪 Testing the Workflow

### 1. File a Claim

**Endpoint:** `POST /claims`

```bash
curl -X POST "http://localhost:8000/claims" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "user_policy_id=1" \
  -F "claim_type=medical" \
  -F "incident_date=2026-02-01" \
  -F "description=Medical expense for treatment" \
  -F "claim_amount=5000" \
  -F "files=@document1.pdf" \
  -F "files=@document2.jpg"
```

**Expected Response:**
```json
{
  "id": 1,
  "claim_number": "CLM-20260210-ABC123",
  "user_policy_id": 1,
  "claim_type": "medical",
  "incident_date": "2026-02-01",
  "description": "Medical expense for treatment",
  "claim_amount": 5000.0,
  "status": "pending",
  "created_at": "2026-02-10T10:30:00Z",
  "documents": [
    {
      "id": 1,
      "file_name": "document1.pdf",
      "file_type": "pdf",
      "file_size": 102400,
      "s3_url": "https://...",
      "uploaded_at": "2026-02-10T10:30:00Z"
    }
  ]
}
```

### 2. Get User Claims

**Endpoint:** `GET /claims`

```bash
curl -X GET "http://localhost:8000/claims" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Get Claim Details

**Endpoint:** `GET /claims/{claim_id}`

```bash
curl -X GET "http://localhost:8000/claims/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Update Claim Status

**Endpoint:** `PATCH /claims/{claim_id}/status`

```bash
curl -X PATCH "http://localhost:8000/claims/1/status" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "status_notes": "Claim approved after review",
    "approved_amount": 4500.0
  }'
```

### 5. Refresh Document URL

**Endpoint:** `GET /claims/{claim_id}/documents/{document_id}/refresh-url`

```bash
curl -X GET "http://localhost:8000/claims/1/documents/1/refresh-url" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 Database Schema

### claims Table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| user_id | INTEGER | Foreign key to users |
| user_policy_id | INTEGER | Foreign key to user_policies |
| claim_number | STRING | Unique claim identifier |
| claim_type | STRING | Type of claim (e.g., medical, accident) |
| incident_date | DATE | Date of incident |
| description | STRING | Claim description |
| claim_amount | NUMERIC | Claimed amount |
| status | ENUM | Claim status (pending, under_review, approved, rejected, completed) |
| status_notes | STRING | Admin notes on status |
| approved_amount | NUMERIC | Approved claim amount |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

### claim_documents Table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| claim_id | INTEGER | Foreign key to claims |
| file_name | STRING | Original file name |
| file_type | STRING | File extension |
| file_size | INTEGER | File size in bytes |
| s3_key | STRING | S3 object key |
| s3_url | STRING | Presigned URL for access |
| uploaded_at | DATETIME | Upload timestamp |

## 📧 Email Notifications

### Claim Submission Email

Sent automatically when a claim is filed:
- Subject: "Claim Submitted Successfully - {claim_number}"
- Contains: Claim details, claim number, amount, status
- Styled HTML email with branding

### Claim Status Update Email

Sent when claim status changes:
- Subject: "Claim Status Updated - {claim_number}"
- Contains: New status, status notes, approved amount (if applicable)
- Color-coded status badges

## 🔧 Troubleshooting

### Issue: Celery worker not processing tasks

**Solution:**
1. Check if Redis is running: `redis-cli ping` (should return PONG)
2. Check Celery logs for errors
3. Restart Celery worker

### Issue: File upload fails

**Solution:**
1. Verify AWS credentials in `.env`
2. Check S3 bucket permissions
3. Verify file size is under 10MB
4. Check file type is allowed (pdf, jpg, jpeg, png, doc, docx)

### Issue: Email not sending

**Solution:**
1. Verify SMTP credentials in `.env`
2. For Gmail, use app-specific password
3. Check Celery worker logs for email errors
4. Verify SMTP port (587 for TLS, 465 for SSL)

### Issue: Presigned URL expired

**Solution:**
1. Use the refresh URL endpoint to generate new presigned URL
2. URLs are valid for 7 days by default
3. Consider implementing automatic refresh on frontend

## 🎉 Success Criteria

Your claims workflow is working correctly if:

1. ✅ You can file a claim with multiple document uploads
2. ✅ Documents are uploaded to S3 successfully
3. ✅ Claim submission email is sent to user
4. ✅ You can retrieve claim details with document URLs
5. ✅ You can update claim status
6. ✅ Status update email is sent on status change
7. ✅ Document URLs can be refreshed when expired

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Celery Documentation](https://docs.celeryproject.org/)
- [Boto3 (AWS SDK) Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)
- [Redis Documentation](https://redis.io/documentation)

## 🔐 Security Best Practices

1. **Never commit `.env` file** to version control
2. Use **presigned URLs** for temporary S3 access
3. Implement **rate limiting** on file upload endpoints
4. Validate **file types and sizes** before upload
5. Use **HTTPS** in production
6. Implement **user authentication** on all endpoints
7. Sanitize **user inputs** to prevent SQL injection

## 📝 Next Steps

1. Implement frontend claim filing wizard
2. Add claim document preview/download
3. Implement admin dashboard for claim review
4. Add claim analytics and reporting
5. Implement claim approval workflow
6. Add SMS notifications alongside email
