# 📋 Quick Reference - Claims Workflow

## 🚀 Quick Start (3 Steps)

### 1. Setup
```powershell
cd backend\backend
.\setup_claims.ps1
```

### 2. Edit .env
Update these required fields in `.env`:
```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_password
```

### 3. Start
```powershell
.\start_claims_services.ps1
```

## 🔌 API Endpoints

### File a Claim
```bash
POST /claims
Headers: Authorization: Bearer {token}
Form Data:
  - user_policy_id: int
  - claim_type: string
  - incident_date: date
  - description: string
  - claim_amount: float
  - files: file[] (multiple files)
```

### Get All Claims
```bash
GET /claims
Headers: Authorization: Bearer {token}
```

### Get Claim Details
```bash
GET /claims/{claim_id}
Headers: Authorization: Bearer {token}
```

### Update Status
```bash
PATCH /claims/{claim_id}/status
Headers: Authorization: Bearer {token}
Body: {
  "status": "approved",
  "status_notes": "Approved",
  "approved_amount": 5000
}
```

### Refresh Document URL
```bash
GET /claims/{claim_id}/documents/{document_id}/refresh-url
Headers: Authorization: Bearer {token}
```

## 📁 File Upload Rules

| Rule | Value |
|------|-------|
| Max Size | 10 MB |
| Allowed Types | pdf, jpg, jpeg, png, doc, docx |
| Min Files | 1 |
| Max Files | No limit |

## 📊 Claim Status Flow

```
pending → under_review → approved/rejected → completed
```

Valid statuses:
- `pending` - Initial state
- `under_review` - Being reviewed
- `approved` - Approved for payment
- `rejected` - Rejected
- `completed` - Payment processed

## 🔧 Services

| Service | Port | Start Command |
|---------|------|---------------|
| FastAPI | 8000 | `uvicorn main:app --reload` |
| Redis | 6379 | `redis-server` |
| Celery | - | `celery -A celery_app worker --loglevel=info --pool=solo` |

## 📧 Email Triggers

| Event | Email Type | Trigger |
|-------|------------|---------|
| Claim filed | Submission confirmation | Automatic on POST /claims |
| Status changed | Status update | Automatic on PATCH status |

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Celery not running | `celery -A celery_app worker --loglevel=info --pool=solo` |
| Redis not running | `redis-server` |
| Email not sent | Check SMTP credentials in .env |
| S3 upload fails | Check AWS credentials in .env |
| File too large | Max 10MB, reduce file size |
| Invalid file type | Only pdf, jpg, jpeg, png, doc, docx allowed |

## 🔑 Environment Variables

### Required
```env
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
S3_BUCKET_NAME=insurenz-claims
SMTP_USER=
SMTP_PASSWORD=
```

### Optional
```env
REDIS_URL=redis://localhost:6379/0
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_FROM=noreply@insurenz.com
JWT_SECRET_KEY=your-secret-key
```

## 📝 Test User Setup

```bash
# Register
POST /auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test123!",
  "dob": "1990-01-15"
}

# Login
POST /auth/login
{
  "email": "test@example.com",
  "password": "Test123!"
}

# Save token from response
```

## 🎯 Quick Test

```bash
# 1. Login and get token
TOKEN=$(curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}' \
  | jq -r '.access_token')

# 2. File a claim
curl -X POST "http://localhost:8000/claims" \
  -H "Authorization: Bearer $TOKEN" \
  -F "user_policy_id=1" \
  -F "claim_type=medical" \
  -F "incident_date=2026-02-05" \
  -F "description=Test claim" \
  -F "claim_amount=5000" \
  -F "files=@test.pdf"

# 3. Get claims
curl -X GET "http://localhost:8000/claims" \
  -H "Authorization: Bearer $TOKEN"
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| CLAIMS_WORKFLOW_SETUP.md | Complete setup guide |
| TESTING_GUIDE.md | Testing instructions |
| MILESTONE3_COMPLETE_SUMMARY.md | Feature summary |
| QUICK_REFERENCE.md | This document |

## 🔗 Useful Links

- API Docs: http://localhost:8000/docs
- Redis CLI: `redis-cli`
- Check Redis: `redis-cli ping`
- Check Celery: Check terminal window

## 💾 Database

```powershell
# Create tables
python create_claims_tables_sqlite.py

# Location
backend\backend\insurenz.db
```

## 📊 Monitoring

```powershell
# Check Celery tasks
redis-cli
> KEYS celery-task-meta-*

# Check FastAPI logs
# See terminal window

# Check Celery logs
# See Celery terminal window
```

## ⚡ Common Commands

```powershell
# Install dependencies
pip install -r requirements.txt

# Create DB tables
python create_claims_tables_sqlite.py

# Start Redis
redis-server

# Start Celery
celery -A celery_app worker --loglevel=info --pool=solo

# Start FastAPI
python -m uvicorn main:app --reload

# Test Redis
redis-cli ping

# Check Python version
python --version
```

## 🎓 Tips

1. **Gmail SMTP**: Use app-specific password
2. **Windows**: Use `--pool=solo` for Celery
3. **URLs**: Presigned URLs expire in 7 days
4. **Files**: Keep under 10MB
5. **Testing**: Use Postman or curl

## 📱 Support

1. Read CLAIMS_WORKFLOW_SETUP.md
2. Check logs (Celery, FastAPI)
3. Verify .env configuration
4. Check service status (Redis, Celery)

---

**Quick Access:** Keep this document bookmarked for fast reference!
