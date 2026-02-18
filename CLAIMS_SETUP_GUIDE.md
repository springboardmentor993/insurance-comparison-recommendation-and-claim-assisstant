# Claims Workflow Setup Guide

This guide will help you set up the complete end-to-end claims workflow with document storage (S3), status tracking, and email notifications (Celery).

## 🎯 Overview

The claims system includes:
- ✅ Multi-step claim filing wizard with file uploads
- ✅ S3 document storage with presigned URLs
- ✅ Claim status tracking (pending → under review → approved/rejected → completed)
- ✅ Async email notifications using Celery
- ✅ Comprehensive claim management dashboard

## 📋 Prerequisites

Before starting, ensure you have:
- Python 3.10+ installed
- Node.js 18+ and npm installed
- PostgreSQL database running
- Redis server (for Celery)
- AWS account with S3 bucket (or LocalStack for development)
- SMTP email server credentials (Gmail, SendGrid, etc.)

## 🚀 Backend Setup

### 1. Install Python Dependencies

```bash
cd backend/backend
pip install -r requirements.txt
```

The following packages will be installed:
- `boto3` - AWS S3 client
- `celery[redis]` - Async task queue
- `redis` - Redis client
- `python-multipart` - File upload support

### 2. Set Up Environment Variables

Create a `.env` file in `backend/backend/`:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost/insurance

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=insurenz-claims

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@insurenz.com

# Application
APP_NAME=Insurenz
```

**Note for Gmail Users:**
- Use an "App Password" instead of your regular password
- Enable 2-Factor Authentication in your Google account
- Generate App Password: Google Account → Security → 2-Step Verification → App passwords

### 3. Create Database Tables

Run the migration script to create claims tables:

```bash
cd backend/backend
python create_claims_tables.py
```

This will create:
- `claims` table
- `claim_documents` table
- `claim_status_enum` type

### 4. Configure S3 Bucket

#### Option A: Using AWS S3

1. Create an S3 bucket in AWS Console
2. Set bucket name in `.env` file
3. Create IAM user with S3 permissions
4. Generate access keys and add to `.env`

Required IAM permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::insurenz-claims/*"
    }
  ]
}
```

#### Option B: Using LocalStack (Development)

For local development without AWS:

```bash
# Install LocalStack
pip install localstack

# Start LocalStack
localstack start

# Create bucket
aws --endpoint-url=http://localhost:4566 s3 mb s3://insurenz-claims

# Update .env
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
S3_BUCKET_NAME=insurenz-claims
```

### 5. Start Redis Server

```bash
# On Windows (if using WSL)
wsl -d Ubuntu -e sudo service redis-server start

# On Linux/Mac
redis-server

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

### 6. Start Celery Worker

Open a new terminal and start the Celery worker:

```bash
cd backend/backend
celery -A celery_app worker --loglevel=info --pool=solo
```

**On Windows**, use `--pool=solo` option:
```bash
celery -A celery_app worker --loglevel=info --pool=solo
```

### 7. Start FastAPI Backend

In another terminal:

```bash
cd backend/backend
python run.py
# or
uvicorn main:app --reload --port 8000
```

Backend should now be running at `http://localhost:8000`

## 🎨 Frontend Setup

### 1. Install Dependencies

```bash
cd frontend/insurance
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Frontend should now be running at `http://localhost:5173`

## 📊 Database Schema

### Claims Table
```sql
CREATE TABLE claims (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    user_policy_id INTEGER REFERENCES user_policies(id),
    claim_number VARCHAR UNIQUE,
    claim_type VARCHAR,
    incident_date DATE,
    description VARCHAR,
    claim_amount NUMERIC,
    status claim_status_enum DEFAULT 'pending',
    status_notes VARCHAR,
    approved_amount NUMERIC,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

### Claim Documents Table
```sql
CREATE TABLE claim_documents (
    id SERIAL PRIMARY KEY,
    claim_id INTEGER REFERENCES claims(id),
    file_name VARCHAR,
    file_type VARCHAR,
    file_size INTEGER,
    s3_key VARCHAR,
    s3_url VARCHAR,
    uploaded_at TIMESTAMP DEFAULT NOW()
);
```

## 🔄 API Endpoints

### Claims Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/claims` | File a new claim with documents |
| GET | `/claims` | Get all user claims |
| GET | `/claims/{id}` | Get specific claim details |
| PATCH | `/claims/{id}/status` | Update claim status |
| GET | `/claims/{claim_id}/documents/{doc_id}/refresh-url` | Refresh document URL |

### Example: Filing a Claim

```bash
curl -X POST "http://localhost:8000/claims" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "user_policy_id=1" \
  -F "claim_type=Medical Expense" \
  -F "incident_date=2026-02-01" \
  -F "description=Emergency hospital visit" \
  -F "claim_amount=5000.00" \
  -F "files=@document1.pdf" \
  -F "files=@document2.jpg"
```

## 📧 Email Notifications

The system sends automatic emails for:

1. **Claim Submitted**: When user files a new claim
2. **Status Updated**: When claim status changes

Email templates are defined in `email_service.py` and sent asynchronously via Celery.

### Testing Email Notifications

To test without real email server:

1. Use MailHog (local SMTP server):
```bash
# Install MailHog
go install github.com/mailhog/MailHog@latest

# Run MailHog
MailHog

# Update .env
SMTP_HOST=localhost
SMTP_PORT=1025
```

2. Access MailHog UI: `http://localhost:8025`

## 🧪 Testing the Workflow

### 1. Register/Login
- Navigate to `http://localhost:5173`
- Register a new account or login

### 2. File a Claim
1. Click "Claims" in navigation
2. Click "File New Claim"
3. Follow the 4-step wizard:
   - Select an active policy
   - Enter claim details
   - Upload documents (PDF, JPG, PNG, DOC)
   - Review and submit

### 3. Track Claim Status
- View all claims in the Claims dashboard
- Filter by status (pending, under review, approved, etc.)
- Download uploaded documents
- View status notes and approved amounts

### 4. Update Claim Status (Admin)
```bash
curl -X PATCH "http://localhost:8000/claims/1/status" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "approved_amount": 4500.00,
    "status_notes": "Claim approved after review"
  }'
```

## 📁 File Upload Specifications

- **Allowed formats**: PDF, JPG, JPEG, PNG, DOC, DOCX
- **Max file size**: 10 MB per file
- **Storage**: AWS S3 with presigned URLs (7-day expiration)
- **Required**: At least 1 document per claim

## 🔐 Security Features

- ✅ JWT authentication required for all claim endpoints
- ✅ Users can only access their own claims
- ✅ File type and size validation
- ✅ Presigned URLs with expiration (not permanent public URLs)
- ✅ S3 keys include claim number for organization

## 🐛 Troubleshooting

### Celery Worker Not Starting
```bash
# Check Redis connection
redis-cli ping

# Check Celery configuration
celery -A celery_app inspect ping
```

### Email Not Sending
- Verify SMTP credentials in `.env`
- Check Celery worker logs for errors
- Test SMTP connection:
```python
import smtplib
server = smtplib.SMTP('smtp.gmail.com', 587)
server.starttls()
server.login('your-email@gmail.com', 'your-app-password')
```

### S3 Upload Failing
- Verify AWS credentials
- Check bucket name and region
- Ensure IAM permissions are correct
- For LocalStack: Verify it's running on port 4566

### Database Migration Errors
```bash
# Check if tables already exist
psql -U postgres -d insurance -c "\dt claims"

# Drop and recreate if needed
python create_claims_tables.py
```

## 📝 Next Steps

### Recommended Enhancements

1. **Admin Dashboard**: Create admin interface for managing all claims
2. **File Preview**: Add in-browser document preview
3. **Notifications**: Add in-app notifications (WebSocket/SSE)
4. **Analytics**: Add claims analytics and reporting
5. **PDF Generation**: Auto-generate claim receipts
6. **Search**: Add claim search functionality
7. **Comments**: Allow communication between user and admin

### Production Checklist

- [ ] Use environment-specific S3 buckets
- [ ] Set up proper IAM roles (not access keys)
- [ ] Configure Redis persistence
- [ ] Set up Celery monitoring (Flower)
- [ ] Implement rate limiting on file uploads
- [ ] Add virus scanning for uploaded files
- [ ] Set up CloudFront for S3 distribution
- [ ] Configure email delivery monitoring
- [ ] Add logging and error tracking (Sentry)
- [ ] Set up automated backups for claims data

## 🎉 Success!

If everything is set up correctly:
- Backend running on port 8000
- Frontend running on port 5173
- Redis running on port 6379
- Celery worker processing tasks
- Email notifications being sent
- Claims being stored in PostgreSQL
- Documents being uploaded to S3

You now have a complete end-to-end claims workflow! 🚀
