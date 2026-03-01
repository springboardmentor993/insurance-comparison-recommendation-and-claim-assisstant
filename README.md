# 🛡️ PolicyNest – Insurance Management & Claim Review System

Full-Stack Insurance Platform built using **React + FastAPI + SQLite + Cloudinary**

---

## 📌 Project Overview

**PolicyNest** is a full-stack insurance management system that allows users to:

- Browse insurance policies  
- View policy details  
- Submit insurance claims  
- Upload supporting documents (Cloudinary integration)  
- Track claim status  
- Receive email notifications on claim updates  

### 🔐 Admin Capabilities

- Secure admin login  
- View all submitted claims  
- Review uploaded documents  
- Approve / Reject claims  
- Monitor fraud risk indicators  
- View dashboard analytics  

---

## 🏗️ System Architecture
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

---

## 🛠 Technology Stack

| Category        | Technology                          |
|----------------|--------------------------------------|
| Frontend       | React.js, React Router, Axios       |
| Backend        | FastAPI, Python                     |
| Database       | SQLite                              |
| ORM            | SQLAlchemy                          |
| Cloud Storage  | Cloudinary API                      |
| Email Service  | SMTP (email_utils.py)               |
| Authentication | Role-based (User/Admin)             |

---

## 📂 Project Structure
LOGIN-APP/

LOGIN-APP/
│
├── backend/
│ ├── main.py
│ ├── models.py
│ ├── database.py
│ ├── email_utils.py
│ ├── requirements.txt
│
├── public/
│
├── src/
│ ├── pages/
│ │ ├── AdminClaims.jsx
│ │ ├── AdminLogin.jsx
│ │ └── ClaimSubmission.jsx
│ │
│ ├── App.js
│ ├── Admin.js
│ ├── Login.js
│ ├── Dashboard.js
│ ├── Policies.js
│ ├── PolicyDetails.js
│ ├── CategoryPolicies.js
│ ├── Recommendations.js
│ ├── Profile.js
│ └── index.js
│
├── package.json
└── README.md                                                                                                                                                      
---

## 🔄 Application Workflow

### 1️⃣ User Authentication
User logs in → Role stored in localStorage → Access granted based on role.

### 2️⃣ Policy Browsing
Policies fetched from backend → Displayed by category → Detailed view available.

### 3️⃣ Claim Submission
User submits:
- Policy ID  
- Claim description  
- Supporting document  

Document is uploaded to **Cloudinary** and the secure URL is stored in the database.

### 4️⃣ Fraud Risk Indicator
Basic rule-based evaluation assigns:
- High Risk  
- Medium Risk  
- Low Risk  

Displayed in Admin Dashboard with color indicators.

### 5️⃣ Admin Claim Review
Admin can:
- View all claims  
- Open uploaded documents  
- Approve / Reject claims  
- Monitor claim statistics  

### 6️⃣ Email Notification System
When claim status is updated:
- Automated email is sent to the user  
- Notification includes updated status  
- Triggered via `email_utils.py`  

---

## 📊 Admin Dashboard Analytics

- Total Claims  
- Approved Claims  
- Rejected Claims  
- Reported Claims  
- Fraud Risk Status  

---

## ⚙️ Installation & Setup

### 🔧 Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload                                                                                                                                           Backend URL:

http://127.0.0.1:8000

API Docs:

http://127.0.0.1:8000/docs                                                                                                                                          💻 Frontend Setup
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
