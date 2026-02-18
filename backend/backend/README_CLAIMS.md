# 🏥 Insurenz Claims Management System

> Complete end-to-end claims workflow with document uploads (S3), status tracking, and email notifications (Celery)

## 🎯 What's Included

This implementation provides a production-ready claims management system with:

- **📤 Multi-Document Upload**: File claims with multiple supporting documents
- **☁️ Cloud Storage**: Secure document storage using AWS S3
- **📊 Status Tracking**: Real-time claim status monitoring
- **📧 Email Notifications**: Automated email alerts via Celery task queue
- **🔒 Security**: JWT authentication, file validation, and access control
- **📱 RESTful API**: Clean, well-documented API endpoints

## ✨ Features

### Week 5: Claim Filing Wizard with S3 Uploads

- ✅ Multi-file upload support (PDF, JPG, PNG, DOC, DOCX)
- ✅ File size validation (max 10MB)
- ✅ File type validation with whitelist
- ✅ AWS S3 integration for document storage
- ✅ Presigned URL generation for secure access
- ✅ Automatic claim number generation
- ✅ Policy validation (active policies only)

### Week 6: Claim Status Tracking & Notifications

- ✅ Five-state status workflow (pending → under_review → approved/rejected → completed)
- ✅ Real-time status updates
- ✅ Admin notes and approved amount tracking
- ✅ Email notifications on claim submission
- ✅ Email notifications on status changes
- ✅ Document URL refresh for expired links

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Redis server
- AWS account with S3 access
- SMTP email account (Gmail, etc.)

### Installation

```powershell
# Navigate to backend directory
# Navigate to backend directory (if not already there)
cd backend\backend

# Run setup script
.\setup_claims.ps1
```

This will:
1. ✅ Create .env file from template
2. ✅ Install Python dependencies
3. ✅ Create database tables
4. ✅ Verify Redis connection

### Configuration

Edit `.env` file and add your credentials:

```env
# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=insurenz-claims

# Email
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### Start Services

```powershell
# Start all services (Redis, Celery, FastAPI)
.\start_claims_services.ps1
```

Or start manually:

```powershell
# Terminal 1: Redis
redis-server

# Terminal 2: Celery Worker
celery -A celery_app worker --loglevel=info --pool=solo

# Terminal 3: FastAPI Server
python -m uvicorn main:app --reload
```

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [CLAIMS_WORKFLOW_SETUP.md](CLAIMS_WORKFLOW_SETUP.md) | 📚 Complete setup guide with troubleshooting |
| [TESTING_GUIDE.md](TESTING_GUIDE.md) | 🧪 Comprehensive testing scenarios and examples |
| [MILESTONE3_COMPLETE_SUMMARY.md](MILESTONE3_COMPLETE_SUMMARY.md) | 📊 Feature summary and implementation details |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | ⚡ Quick reference for common tasks |

## 🔌 API Endpoints

### File a Claim
```http
POST /claims
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data

Form Data:
- user_policy_id: 1
- claim_type: "medical"
- incident_date: "2026-02-05"
- description: "Emergency treatment"
- claim_amount: 5000
- files: [file1.pdf, file2.jpg]
```

### Get User Claims
```http
GET /claims
Authorization: Bearer {jwt_token}
```

### Get Claim Details
```http
GET /claims/{claim_id}
Authorization: Bearer {jwt_token}
```

### Update Claim Status
```http
PATCH /claims/{claim_id}/status
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "status": "approved",
  "status_notes": "Claim approved after review",
  "approved_amount": 4500.00
}
```

### Refresh Document URL
```http
GET /claims/{claim_id}/documents/{document_id}/refresh-url
Authorization: Bearer {jwt_token}
```

## 🧪 Testing

### Quick Test

```bash
# 1. Register user
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123!","dob":"1990-01-15"}'

# 2. Login
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# 3. File a claim
curl -X POST "http://localhost:8000/claims" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "user_policy_id=1" \
  -F "claim_type=medical" \
  -F "incident_date=2026-02-05" \
  -F "description=Emergency treatment" \
  -F "claim_amount=5000" \
  -F "files=@test.pdf"
```

For comprehensive testing scenarios, see [TESTING_GUIDE.md](TESTING_GUIDE.md).

## 🏗️ Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────┐      ┌──────────┐
│  FastAPI    │◄─────┤   JWT    │
│  Server     │      │  Auth    │
└──────┬──────┘      └──────────┘
       │
       ├──────────┐
       ▼          ▼
┌──────────┐  ┌──────────┐
│ SQLite   │  │   S3     │
│    DB    │  │ Storage  │
└──────────┘  └──────────┘
       │
       ▼
┌──────────┐      ┌──────────┐
│  Celery  │◄─────┤  Redis   │
│  Worker  │      │  Broker  │
└────┬─────┘      └──────────┘
     │
     ▼
┌──────────┐
│  SMTP    │
│  Email   │
└──────────┘
```

## 📊 Database Schema

### claims
- id (PK)
- user_id (FK → users)
- user_policy_id (FK → user_policies)
- claim_number (unique)
- claim_type
- incident_date
- description
- claim_amount
- status (enum)
- status_notes
- approved_amount
- created_at
- updated_at

### claim_documents
- id (PK)
- claim_id (FK → claims)
- file_name
- file_type
- file_size
- s3_key
- s3_url
- uploaded_at

## 🔒 Security

- ✅ JWT authentication on all endpoints
- ✅ User authorization (access own claims only)
- ✅ File type validation
- ✅ File size limits
- ✅ S3 presigned URLs with expiration
- ✅ SQL injection prevention (SQLAlchemy ORM)
- ✅ Input validation (Pydantic schemas)

## 📧 Email Notifications

### Claim Submission
Automatically sent when a claim is filed:
- Claim number
- Claim type
- Claim amount
- Current status

### Status Update
Sent when claim status changes:
- New status
- Status notes
- Approved amount (if applicable)
- Color-coded status badges

## 🛠️ Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Celery tasks not processing | Check Redis is running: `redis-cli ping` |
| S3 upload fails | Verify AWS credentials in .env |
| Email not sending | Check SMTP credentials, use app password for Gmail |
| File upload rejected | Check file size (<10MB) and type (pdf, jpg, png, doc, docx) |

For detailed troubleshooting, see [CLAIMS_WORKFLOW_SETUP.md](CLAIMS_WORKFLOW_SETUP.md#troubleshooting).

## 🐛 Bug Fixes

### Fixed in This Release

1. **policies.py Import Errors**
   - ✅ Fixed: `from database import get_db` → `from deps import get_db`
   - ✅ Fixed: `get_current_active_user` → `get_current_user`
   - ✅ Added: `get_current_active_user` alias for backward compatibility

2. **Configuration Issues**
   - ✅ Added: Environment variable loading (python-dotenv)
   - ✅ Added: JWT configuration from environment
   - ✅ Added: .env.example template

3. **Dependencies**
   - ✅ Updated: python-jose for JWT handling
   - ✅ Added: boto3 for S3
   - ✅ Added: celery[redis] for task queue
   - ✅ Added: python-multipart for file uploads

## 📈 Performance

- **File Upload**: Supports files up to 10MB
- **Concurrent Claims**: Handles multiple simultaneous claim submissions
- **Email Delivery**: Asynchronous processing via Celery (non-blocking)
- **Document Access**: Presigned URLs valid for 7 days

## 🎯 Success Criteria

Your system is working correctly when:

- ✅ Claims can be filed with document uploads
- ✅ Documents are uploaded to S3
- ✅ Email notifications are sent
- ✅ Claim status can be tracked and updated
- ✅ Document URLs can be refreshed

## 📝 Next Steps

### Frontend Integration
1. Create claim filing wizard UI
2. Implement file upload component with drag-drop
3. Build claim status dashboard
4. Add document preview/download

### Advanced Features
1. Admin dashboard for claim review
2. Claim analytics and reporting
3. SMS notifications
4. Document OCR for auto-fill
5. Fraud detection

## 🤝 Support

For help and support:

1. 📖 Read the documentation ([CLAIMS_WORKFLOW_SETUP.md](CLAIMS_WORKFLOW_SETUP.md))
2. 🧪 Check the testing guide ([TESTING_GUIDE.md](TESTING_GUIDE.md))
3. 🔍 Review error logs (Celery, FastAPI terminals)
4. ⚙️ Verify .env configuration

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Celery Documentation](https://docs.celeryproject.org/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [Redis Documentation](https://redis.io/documentation)

## 🎉 Milestone 3 Status

**✅ COMPLETE**

All requirements for Milestone 3 (Weeks 5-6) have been successfully implemented:

- ✅ Week 5: Claim filing wizard with uploads (S3)
- ✅ Week 6: Claim status tracking; notifications (Celery emails)
- ✅ Expected Output: End-to-end claims workflow with document storage

## 📜 License

© 2026 Insurenz. All rights reserved.

---

**Need help?** Start with [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for common tasks!
