# 🛡️ TrustSure – Insurance Comparison, Recommendation & Claim Assistant

TrustSure is a full-stack Insurance Management System built using **FastAPI, PostgreSQL, and React.js**.

It simulates a real-world digital insurance workflow including:

- Policy comparison
- Personalized recommendations
- Claims lifecycle management
- Fraud detection engine
- Admin monitoring dashboard
- Email notification system

This project represents a production-style insurance platform architecture.

---

## 🚀 Tech Stack

### 🔹 Backend
- FastAPI
- SQLAlchemy ORM
- PostgreSQL
- Pydantic
- JWT Authentication (User & Admin)
- Fraud Rules Engine

### 🔹 Frontend
- React.js
- CSS3 (Custom UI)
- Responsive Layout
- Dynamic filtering & comparison
- Admin Analytics Dashboard
- EmailJS Integration (Email Notifications)

### 🔹 Database
- PostgreSQL
- Normalized relational schema
- Foreign key constraints
- JSON-based risk profile storage
- Fraud flag tracking

---

# 🧠 System Workflow

---

## 1️⃣ User Authentication

Users can:

- Register
- Login (JWT-based)
- Maintain profile & preferences
- Store risk profile

Admin authentication is handled separately with role-based JWT.

---

## 2️⃣ Policy Catalog & Advanced Filtering

Users can:

- Browse available policies
- Filter policies using:
  - Policy Type
  - Maximum Premium
  - Minimum Coverage
  - Maximum Term
  - Minimum Claim Ratio

Filtering is dynamically handled through backend APIs.

---

## 3️⃣ Multi-Policy Comparison

Users can:

- Select up to 4 policies
- Compare side-by-side
- View professional comparison summary:
  - Best Budget Option
  - Highest Coverage
  - Best Claim Ratio
  - Strategic Recommendation

---

## 4️⃣ Personalized Recommendation Engine

The recommendation engine:

- Reads user risk profile
- Scores policies using weighted scoring logic
- Ranks policies
- Returns best match
- Stores recommendations in database

Scoring Factors:
- Coverage Weight
- Claim Ratio Weight
- Customer Rating
- Premium Optimization
- Risk Profile Weight Adjustment

---

## 5️⃣ Claims Management System

Users can:

- File new claims
- Upload documents
- Track claim status

Claim lifecycle states:

- Draft
- Submitted
- Under Review
- Approved
- Rejected
- Paid

---

## 6️⃣ Fraud Detection Engine

The system automatically detects:

- Duplicate documents
- Suspicious claim amounts
- Abnormal timing patterns

If detected:

- A FraudFlag is created
- Severity assigned:
  - Low
  - Medium
  - High

Admins can monitor all flagged claims.

---

## 7️⃣ Admin Dashboard

Admin capabilities include:

- View total policies purchased
- View approved / rejected claims
- Monitor fraud cases
- Review flagged claims
- View analytics summary
- Send real-time email notifications to users

Admin authentication is completely separate from user authentication.

---

## 8️⃣ Email Notification System

Admin can:

- Send custom email notifications
- Notify users regarding claims
- Send policy updates

Email integration handled via EmailJS service.

---

# 🏗️ Architecture Overview

```

React Frontend
↓
FastAPI REST APIs
↓
PostgreSQL Database

```

Frontend communicates with backend via REST APIs.  
Backend handles business logic, validation, fraud rules, and database operations.

---

# 📂 Updated Project Structure

```

insurance-comparison-recommendation-and-claim-assistant/

├── backend/
│   ├── main.py
│   ├── auth.py
│   ├── admin_auth.py
│   ├── policies.py
│   ├── claims.py
│   ├── recommend.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── seed_policies.py
│
├── frontend/
│   ├── public/
│   │   └── login.html
│   │
│   ├── src/
│       ├── pages/
│       │   ├── UserSignup.js
│       │   ├── AdminSignup.js
│       │   ├── AdminLogin.js
│       │   ├── AdminDashboard.js
│       │   ├── Recommendations.js
│       │   ├── Claims.js
│       │   ├── Policies.js
│       │   └── Profile.js
│       ├── App.js
│       └── package.json
│
└── README.md

````

---

# ⚙️ Backend Setup

## Step 1: Clone Repository

```bash
git clone <repo-url>
cd insurance-comparison-recommendation-and-claim-assistant
````

---

## Step 2: Create Virtual Environment

Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

Mac/Linux:

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Step 4: Setup PostgreSQL

Create database:

```sql
CREATE DATABASE trustsure;
```

Import schema:

```bash
psql -U postgres -d trustsure -f database/schema.sql
```

Seed policies:

```bash
python backend/seed_policies.py
```

---

## Step 5: Run Backend

```bash
uvicorn backend.main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

Swagger Docs:

```
http://127.0.0.1:8000/docs
```

---

# 💻 Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at:

```
http://localhost:3000
```

---

# 📊 Database Design

Tables include:

* Users
* Providers
* Policies
* UserPolicies
* Claims
* ClaimDocuments
* Recommendations
* FraudFlags
* AdminLogs

Ensures:

* Referential integrity
* Foreign key enforcement
* Status-based workflow tracking
* Risk profile storage
* Fraud monitoring logs

---

# 🎯 Key Highlights

✔ Full-stack production-style architecture
✔ JWT authentication (User & Admin)
✔ Advanced filtering engine
✔ Multi-policy comparison
✔ Weighted recommendation logic
✔ Claims lifecycle workflow
✔ Fraud detection engine
✔ Admin analytics dashboard
✔ Real-time email notification system

---

# 📌 Future Enhancements

* Machine learning fraud detection
* AI-based premium prediction
* Payment gateway integration
* Docker deployment
* Cloud hosting (AWS)
* Real-time notifications via WebSockets

---

# 📜 License

MIT License

---

# 👩‍💻 Developed By

**Pusuluri Lakshmi Pujakshya**
Python Technology Stack Intern
Infosys Springboard 6.0

```

```
