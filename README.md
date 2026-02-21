 🛡️ TrustSure – Insurance Comparison, Recommendation & Claim Assistant

TrustSure is a full-stack Insurance Management System built using **FastAPI, PostgreSQL, and React.js**.

It allows users to:
- Compare multiple insurance policies
- Filter policies using advanced criteria
- Get personalized policy recommendations
- File and track insurance claims
- Detect suspicious claims using fraud rules
- Admin monitor platform activity

This project simulates a real-world digital insurance workflow including policy selection, underwriting logic, claims lifecycle, and fraud monitoring.

---

🚀 Tech Stack

 🔹 Backend
- FastAPI
- SQLAlchemy ORM
- PostgreSQL
- Pydantic
- JWT Authentication

 🔹 Frontend
- React.js
- CSS3
- Responsive UI
- Dynamic filtering & comparison

🔹 Database
- PostgreSQL
- Normalized relational schema
- JSONB risk profile storage
- Fraud flag tracking



🧠 How the System Works

 1️⃣ User Authentication
Users register and login using JWT authentication.
Each user has:
- Profile details
- Risk profile
- Preferences



 2️⃣ Policy Catalog & Filtering

Users can:
- Browse all policies
- Filter by:
  - Policy Type
  - Maximum Premium
  - Minimum Coverage
  - Maximum Term
  - Minimum Claim Ratio

Policies are dynamically fetched from backend APIs.


 3️⃣ Policy Comparison

Users can:
- Select up to 4 policies
- Compare features side-by-side
- View professional comparison summary including:
  - Best Budget Option
  - Highest Coverage
  - Best Claim Ratio
  - Strategic Recommendation



 4️⃣ Recommendation Engine

The system:
- Reads user risk profile
- Scores policies
- Generates personalized shortlist
- Stores results in Recommendations table

 5️⃣ Claims Management

Users can:
- File a new claim
- Upload documents
- Track claim status

Claim lifecycle states:
- Draft
- Submitted
- Under Review
- Approved
- Rejected
- Paid

 6️⃣ Fraud Detection

The system checks:
- Duplicate documents
- Suspicious claim amounts
- Unusual timing patterns

If detected, a FraudFlag is created with severity:
- Low
- Medium
- High

Admins can monitor flagged claims.

 
🏗️ Architecture Overview

User (React Frontend)
↓
FastAPI Backend (REST APIs)
↓
PostgreSQL Database

Frontend communicates with backend APIs.
Backend handles business logic and database operations.

# 📂 Project Structure

insurance-comparison-recommendation-and-claim-assistant/

├── backend/
│   ├── main.py
│   ├── auth.py
│   ├── policies.py
│   ├── claims.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── recommend.py
│   └── seed_policies.py
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── database/
│   ├── schema.sql
│   └── trustsure.sql
│
└── README.md


 ⚙️ Prerequisites

Make sure you have installed:

- Python 3.9+
- Node.js (v16 or above)
- PostgreSQL
- Git



 🛠️ Backend Setup (Local Machine)

 Step 1: Clone the Repository


git clone <your-repo-link>
cd insurance-comparison-recommendation-and-claim-assistant


 Step 2: Create Virtual Environment

python -m venv venv
venv\Scripts\activate   (Windows)
source venv/bin/activate   (Mac/Linux)

 Step 3: Install Dependencies


pip install -r requirements.txt

 Step 4: Setup PostgreSQL Database

Open PostgreSQL and run:

CREATE DATABASE trustsure;


Import schema:


psql -U postgres -d trustsure -f database/schema.sql

Seed policies:

python backend/seed_policies.py

 Step 5: Run Backend Server

uvicorn backend.main:app --reload

Backend runs at:


[http://127.0.0.1:8000](http://127.0.0.1:8000)

Swagger API docs available at:

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)


💻 Frontend Setup

 Step 1: Navigate to Frontend

cd frontend

Step 2: Install Dependencies

npm install

Step 3: Start Frontend

npm start

Frontend runs at:

[http://localhost:3000](http://localhost:3000)

 📊 Database Design

Tables include:

- Users
- Providers
- Policies
- UserPolicies
- Claims
- ClaimDocuments
- Recommendations
- FraudFlags
- AdminLogs

The schema ensures:
- Referential integrity
- Proper foreign keys
- Status-based workflows
- Risk profile storage

# 🎯 Key Highlights

✔ Full-stack architecture  
✔ REST API design  
✔ Advanced filtering system  
✔ Multi-policy comparison  
✔ Personalized recommendation logic  
✔ Claims lifecycle workflow  
✔ Fraud detection engine  
✔ Admin monitoring system  


# 📌 Future Enhancements

- Machine learning fraud detection
- AI-based premium prediction
- Payment gateway integration
- Cloud deployment (AWS / Docker)
- Real-time notification system

# 📜 License

MIT License

# 👩‍💻 Developed By

Pusuluri Lakshmi Pujakshya  
insurance-comparison-recommendation-and-claim-assisstant project
Python Technology Stack 
Intern@Infosys Springboard 6.0



