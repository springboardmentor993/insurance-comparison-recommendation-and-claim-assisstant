🛡️ PolicyNest – Insurance Management & Claim Review System

Full-Stack Insurance Platform built using React + FastAPI + SQLite + Cloudinary

📌 Project Overview

PolicyNest is a full-stack insurance management system that allows users to:

Browse insurance policies

View policy details

Submit insurance claims

Upload supporting documents (Cloudinary integration)

Track claim status

Receive email notifications on claim updates

Admins can:

Securely log in

View all submitted claims

Review uploaded documents

Approve / Reject claims

Monitor fraud risk indicators

View dashboard analytics

🏗️ System Architecture
React (src folder)
        │
        ▼
FastAPI Backend (main.py)
        │
        ▼
SQLite Database
        │
        ▼
Cloudinary (Document Storage)
        │
        ▼
Email Notification System (SMTP)
🛠 Technology Stack
Category	Technology
Frontend	React.js, React Router, Axios
Backend	FastAPI, Python
Database	SQLite
ORM	SQLAlchemy
Cloud Storage	Cloudinary API
Email Service	SMTP (email_utils.py)
Authentication	Role-based (User/Admin)
📂 Project Structure
LOGIN-APP/

├── backend/
│   ├── __pycache__/
│   ├── uploads/
│   ├── venv/
│   ├── .env
│   ├── database.py
│   ├── email_utils.py
│   ├── main.py
│   ├── models.py
│   ├── requirements.txt
│
├── node_modules/
├── public/
├── src/
│   ├── pages/
│   │   ├── AdminClaims.jsx
│   │   ├── AdminLogin.jsx
│   │   └── ClaimSubmission.jsx
│   │
│   ├── Admin.js
│   ├── App.js
│   ├── CategoryPolicies.js
│   ├── Claims.js
│   ├── Dashboard.js
│   ├── Login.js
│   ├── policies.js
│   ├── PolicyDetails.js
│   ├── Profile.js
│   ├── Recommendations.js
│   └── index.js
│
├── package.json
├── package-lock.json
└── README.md
🔄 Application Workflow
1️⃣ User Authentication

User logs in → Role stored in localStorage → Access granted based on role.

2️⃣ Policy Browsing

Policies are fetched from backend → Displayed by category → User can view detailed information.

3️⃣ Claim Submission

User submits:

Policy ID

Claim description

Supporting document

Document is uploaded to Cloudinary → Secure URL saved in database.

4️⃣ Fraud Risk Indicator

Basic rule-based evaluation assigns fraud risk levels:

High Risk

Medium Risk

Low Risk

Displayed in Admin Dashboard with color indicators.

5️⃣ Admin Claim Review

Admin can:

View all claims

Open uploaded documents

Approve / Reject claims

Monitor claim statistics

View fraud risk levels

6️⃣ Email Notification System

When claim status is updated:

User receives automated email

Notification includes updated status

Triggered via email_utils.py

📊 Admin Dashboard Analytics

Total Claims

Approved Claims

Rejected Claims

Reported Claims

Fraud Risk Status

⚙️ Installation & Setup
🔧 Backend Setup
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

Backend URL:

http://127.0.0.1:8000

API Docs:

http://127.0.0.1:8000/docs
💻 Frontend Setup
npm install
npm start

Frontend runs at:

http://localhost:3000
🔐 Security Features

Role-based Admin Protection

Secure Cloud Document Storage

Backend Status Validation

Email-based Claim Update Notifications

🚀 Current Project Status

✅ Policy Browsing
✅ Claim Submission
✅ Cloudinary File Upload
✅ Admin Dashboard
✅ Fraud Risk Indicator
✅ Email Notification System                                                                                                                                     
👩‍💻 Author

Hema Naga Amulya
Infosys Springboard Intern 6.0
