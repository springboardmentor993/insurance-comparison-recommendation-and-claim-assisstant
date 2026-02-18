# Quick Start - Claims Workflow

## ✅ What's Been Done

1. ✅ **Dependencies Installed** - boto3, celery, redis, python-multipart
2. ✅ **Database Tables Created** - claims and claim_documents tables with indexes
3. ✅ **Backend Server Running** - FastAPI server on port 8000

## 🚀 Next Steps to Complete Setup

### 1. Set Up Environment Variables

Create a file `backend/backend/.env` with:

```env
# AWS S3 (Required for file uploads)
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=insurenz-claims

# Redis (Required for Celery)
REDIS_URL=redis://localhost:6379/0

# Email (Required for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password-here
EMAIL_FROM=noreply@insurenz.com
```

**For Development/Testing (Optional):**
You can skip S3 and use local file storage, or use LocalStack for local S3 simulation.

### 2. Start Redis Server

Redis is required for Celery task queue:

**On Windows with WSL:**
```bash
wsl -d Ubuntu -e sudo service redis-server start
```

**Or install Redis for Windows:**
Download from: https://github.com/microsoftarchive/redis/releases

**Verify Redis is running:**
```bash
redis-cli ping
# Should return: PONG
```

### 3. Start Celery Worker

Open a **NEW terminal** and run:

```bash
cd backend/backend
celery -A celery_app worker --loglevel=info --pool=solo
```

Leave this terminal running. You should see:
```
[tasks]
  . tasks.send_claim_submitted_notification
  . tasks.send_claim_status_update_notification
```

### 4. Start Frontend

Open another **NEW terminal** and run:

```bash
cd frontend/insurance
npm install
npm run dev
```

Frontend will run on: http://localhost:5173

## 🎯 Testing the Workflow

1. **Login** to your account at http://localhost:5173
2. **Go to Claims** from the navigation menu
3. **Click "File New Claim"**
4. **Complete the 4-step wizard:**
   - Step 1: Select an active policy
   - Step 2: Enter claim details
   - Step 3: Upload documents (PDF, JPG, PNG, DOC)
   - Step 4: Review and submit

5. **Track your claim** in the Claims dashboard

## 📊 Current Architecture

```
┌─────────────────┐
│   Frontend      │
│  (React/Vite)   │
│  Port: 5173     │
└────────┬────────┘
         │
         ↓ HTTP/REST
┌─────────────────┐
│   Backend       │
│   (FastAPI)     │  ←──→ PostgreSQL
│  Port: 8000     │       (Database)
└────────┬────────┘
         │
         ↓ async tasks
┌─────────────────┐
│     Celery      │  ←──→ Redis
│    Workers      │       (Message Broker)
└────────┬────────┘
         │
         ↓ sends emails
┌─────────────────┐
│   SMTP Server   │
│   (Gmail/etc)   │
└─────────────────┘
```

## 🔧 Troubleshooting

### Backend won't start - "Module not found"
```bash
cd backend/backend
pip install -r requirements.txt
```

### Celery won't start - "Redis connection refused"
Start Redis server first (see step 2 above)

### File upload fails - "S3 error"
Check your AWS credentials in `.env` file. For testing, you can temporarily disable S3 by commenting out the upload code or using LocalStack.

### Email not sending
- Verify SMTP credentials in `.env`
- For Gmail: Use an "App Password" (not your regular password)
- Or use a service like MailHog for testing without real emails

## 📝 Features Implemented

✅ Multi-step claim filing wizard  
✅ Document upload with validation (type, size)  
✅ S3 storage integration  
✅ Claim status tracking (5 statuses)  
✅ Email notifications (async via Celery)  
✅ Claims dashboard with filters  
✅ Document download with presigned URLs  
✅ Responsive UI (mobile-friendly)  
✅ Professional email templates  

## 🎉 You're Ready!

Once all services are running:
- Backend: http://localhost:8000
- Frontend: http://localhost:5173
- API Docs: http://localhost:8000/docs

The claims system is fully functional! 🚀

---

**Need more help?** See [CLAIMS_SETUP_GUIDE.md](./CLAIMS_SETUP_GUIDE.md) for detailed configuration and advanced options.
