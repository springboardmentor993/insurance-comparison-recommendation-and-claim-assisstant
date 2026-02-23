# Insurance Policy Recommendation & Claims Management Platform

**Status**: ✅ Complete | Production-Ready  
**Version**: 1.0  
**Last Updated**: February 2026

A comprehensive full-stack insurance platform with intelligent policy recommendations, fraud detection, and end-to-end claims management. Designed for academic and commercial deployment.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Key Features](#key-features)
4. [Technology Stack](#technology-stack)
5. [Installation & Setup](#installation--setup)
6. [Database Schema](#database-schema)
7. [API Documentation](#api-documentation)
8. [Workflow Guide](#workflow-guide)
9. [Recommendation Engine](#recommendation-engine)
10. [Fraud Detection System](#fraud-detection-system)
11. [API Examples](#api-examples)
12. [Project Structure](#project-structure)

---

## Project Overview

This platform provides a complete solution for insurance policy management:

- **Intelligent Recommendations**: Two-stage filtering (strict policy-type first, then soft scoring)
- **Policy Comparison**: Browse 50+ realistic policies from 30 real insurance companies
- **Claims Management**: End-to-end workflow from claim creation to payout
- **Fraud Detection**: 8 built-in fraud detection rules with risk scoring (0-100)
- **User Authentication**: Secure JWT-based authentication with 30-day expiry
- **Email Notifications**: Automated emails for claims and policy updates
- **Responsive UI**: Mobile-friendly React frontend with clear user workflows

**Target Users**:
- Insurance consumers seeking policy recommendations
- Insurance companies managing policies and claims
- Academic institutions studying insurance platforms

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Auth     │ │ Browse   │ │ Policy   │ │ Claims & Fraud   │ │
│  │ Pages    │ │ Policies │ │ Details  │ │ Detection        │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                          ↕↕ (REST API)
┌──────────────────────────────────────────────────────────────┐
│               BACKEND (FastAPI + SQLAlchemy)                  │
│  ┌────────────────────┐  ┌──────────────────┐ ┌────────────┐ │
│  │ Authentication     │  │ Recommendation   │ │ Claims     │ │
│  │ & Authorization    │  │ Engine (2-Stage) │ │ Management │ │
│  └────────────────────┘  └──────────────────┘ └────────────┘ │
│  ┌────────────────────┐  ┌──────────────────┐ ┌────────────┐ │
│  │ Fraud Detection    │  │ Email Service    │ │ Admin APIs │ │
│  │ (8 Rules)          │  │ (Notifications)  │ │            │ │
│  └────────────────────┘  └──────────────────┘ └────────────┘ │
└──────────────────────────────────────────────────────────────┘
                      ↕↕ (SQLAlchemy ORM)
┌──────────────────────────────────────────────────────────────┐
│               DATABASE (SQLite/PostgreSQL)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Users    │ │ Policies │ │ Claims   │ │ Fraud Detection  │ │
│  │ & Auth   │ │ & Quotes │ │ & Docs   │ │ Scores & Rules   │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## Key Features

### 1. **Authentication & User Management**
- User registration with email and password
- Secure JWT-based authentication (30-day expiry)
- User profile management with health and demographic data
- Risk profile assessment (conservative/moderate/aggressive)
- Password hashing with bcrypt

### 2. **Policy Browsing & Comparison**
- **50+ Realistic Policies** from 30 insurance companies:
  - Life: LIC, HDFC Life, ICICI Prudential, Tata AIG, Bajaj Allianz, MetLife
  - Health: Star Health, Aditya Birla, Apollo Munich, ICICI Lombard, Bajaj Allianz
  - Auto: HDFC Ergo, ICICI Lombard, Bajaj, Tata AIG, Royal Sundaram, Oriental, New India
  - Home: HDFC Ergo, ICICI Lombard, Bajaj, Tata AIG, Royal Sundaram, Kotak, Cholamandalam
  - Travel: Cholamandalam, ICICI Lombard, Bajaj, HDFC Ergo, AIG, AXA
- Advanced filtering: price range, provider, coverage
- Full-text search in policy titles and descriptions
- Pagination support (up to 100 policies per request)
- Policy comparison view

### 3. **Intelligent Recommendation Engine**

**Two-Stage Process**:

**Stage 1 (STRICT)**: Filter policies by user-selected policy type
- If user selects ["health", "life"]: Only show health and life policies
- Hard constraint: No other policy types shown
- Eliminates 60-80% of policies immediately

**Stage 2 (SOFT)**: Score remaining policies using 5 weighted factors
- Not a removal stage - all policies shown, just ranked
- Scores range from 0-100
- Uses composite scoring instead of hard removal

**Scoring Factors**:
1. **Coverage Matching** (35%): Does policy cover user's needs?
2. **Premium Affordability** (25%): Within user's budget?
3. **Health & Risk Alignment** (25%): Suits user's health profile?
4. **Policy Type Fit** (10%): How suitable for user's situation?
5. **Provider Rating** (5%): Provider reputation

**Returns**: Top 5-10 recommendations with human-readable explanations

### 4. **Claims Management Workflow**
- **Step 1**: Create claim with policy selection and incident details
- **Step 2**: Upload required documents (auto-validated by claim type)
- **Step 3**: Submit claim for review
- **Tracking**: View claim status and history
- **Document Types**: 13 different claim document types
- **Status Tracking**: Draft → Submitted → Under Review → Approved/Rejected → Paid

### 5. **Fraud Detection System**
- **8 Built-in Rules**:
  1. Duplicate claims within 30 days
  2. Multiple claims from same user in 24 hours
  3. Claim amount exceeds policy coverage
  4. Suspicious timing (claim within 7 days of purchase)
  5. Document quality issues (missing or suspicious)
  6. Unusual claim patterns (high-value anomalies)
  7. Policy status validation
  8. User verification checks
- **Risk Scoring**: 0-100 scale with detailed reasoning
- **Auto-flagged Claims**: High-risk claims flagged for manual review

### 6. **Email Notifications**
- Claim submission confirmation
- Claim status updates
- Approval/rejection notifications
- Policy purchase confirmations

### 7. **Admin Features**
- Manage policies and providers
- View system statistics
- Monitor fraud detection alerts
- Track claims by status

---

## Technology Stack

### Frontend
- **React 18** with Hooks for state management
- **Vite 7.3** for fast development and builds
- **React Router** for navigation
- **CSS3** for responsive design
- **Local Storage** for session management

### Backend
- **FastAPI** (Python web framework)
- **SQLAlchemy 2.0** (ORM)
- **Pydantic** (data validation)
- **JWT** (JWT-based authentication)
- **Python-multipart** (file upload handling)
- **SQLite** (development) / **PostgreSQL** (production)

### Database
- **13 normalized tables**
- **SQLAlchemy** ORM with type hints
- Ready for PostgreSQL migration

---

## Installation & Setup

### Prerequisites
- Python 3.10+ with pip and venv
- Node.js 16+ with npm
- Git

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install python-multipart for file uploads
pip install python-multipart

# Seed database with 50+ policies
python seed_policies.py

# Run backend server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at:
- Application: `http://localhost:8000`
- Swagger API Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend-react

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at: `http://localhost:5173` (or `http://localhost:5174` if 5173 is in use)

---

## Database Schema

### Core Tables

**Users**
- id, email, password_hash, name, date_of_birth
- risk_profile (JSON: age, income, bmi, diseases, preferences)
- created_at, updated_at

**Policies**
- id, title, policy_type, provider_id, premium, coverage_amount
- term_months, coverage (JSON), description, created_at

**Providers**
- id, name, policy_type, country

**UserPolicies** (Purchased Policies)
- id, user_id, policy_id, policy_number, status, purchase_date
- maturity_date, premium_paid, coverage_amount

**Claims**
- id, user_policy_id, claim_type, incident_date, amount_claimed
- description, status, claim_number, created_at, submitted_at

**ClaimDocuments**
- id, claim_id, file_url, doc_type, uploaded_at

**Recommendations**
- id, user_id, policy_id, score, reason, created_at

**FraudDetection**
- id, claim_id, rule_triggered, risk_score, reasoning, created_at

**Notifications**
- id, user_id, type, title, message, read, created_at

---

## Workflow Guide

### User Workflow

```
1. AUTHENTICATION
   ├─ Register with email & password
   ├─ Login to get JWT token
   └─ Set risk profile (age, health, preferences)

2. BROWSE POLICIES
   ├─ View 50+ available policies
   ├─ Filter by type, price, provider
   ├─ Search by title or description
   └─ Compare multiple policies

3. GET RECOMMENDATIONS
   ├─ Select preferred policy types (STRICT FILTER)
   ├─ Set budget (max premium)
   ├─ System generates 5-10 recommendations
   └─ View reasoning behind each recommendation

4. PURCHASE POLICY
   ├─ Create purchase application
   ├─ Review policy terms
   ├─ Confirm purchase
   └─ Receive confirmation email

5. SUBMIT CLAIM
   ├─ Initiate claim for purchased policy
   ├─ Enter incident details
   ├─ Upload required documents
   ├─ System checks for fraud (8 rules)
   ├─ Submit for review
   └─ Track claim status

6. RECEIVE PAYOUT
   ├─ Claim undergoes manual review
   ├─ Claim approved or rejected
   ├─ Receive notification
   └─ (If approved) Payout processed
```

---

## Recommendation Engine

### Core Algorithm

The recommendation engine implements a **two-stage process**:

#### Stage 1: Strict Policy-Type Filtering
```python
# HARD CONSTRAINT: Filter by user-selected policy type
User selects: ["health", "life"]
Result: Only health and life policies shown
Elimination: ~60-80% of policies removed
```

#### Stage 2: Soft Constraint Scoring
```python
# Remaining policies scored on 5 factors (no removal)
Coverage Matching: 0-35 points (35% weight)
Premium Affordability: 0-25 points (25% weight)
Health & Risk Alignment: 0-25 points (25% weight)
Policy Type Fit: 0-10 points (10% weight)
Provider Rating: 0-5 points (5% weight)
─────────────────────────
Total Score: 0-100 points

Return: Top 5-10 recommendations (not removed, just ranked)
```

### Example Calculation

**User Profile**:
- Age: 40, Income: ₹60,000/month (₹7.2M/year)
- Diseases: Diabetes, Hypertension
- Budget: ₹8,000/month
- Preferences: ["health", "life"]
- Risk: Moderate

**Policy**: HealthPlus (Health, ₹3,500/month, ₹500k coverage)

**Scoring Breakdown**:
```
Coverage Match (35 pts):
  Type match: Health in ["health","life"] → 1.0
  Coverage detail: 0.95 (health policy with diabetes coverage)
  Combined: (1.0 × 0.30) + (0.95 × 0.70) = 0.965
  Points: 0.965 × 35 = 33.78/35 ⭐

Premium Affordability (25 pts):
  Premium: ₹3,500 ≤ ₹8,000 (within budget)
  Ratio: 3,500 / 8,000 = 0.4375
  Score: 0.60 + ((1 - 0.4375) × 0.40) = 0.825
  Points: 0.825 × 25 = 20.63/25 ✓

Health & Risk Alignment (25 pts):
  Base (Health policy): 0.90
  BMI > 25: +0.05 (overweight)
  Diseases (2): +0.06 (0.03 × 2)
  Total: 0.90 + 0.05 + 0.06 = 1.01 (capped at 1.0)
  Risk adjustment (Moderate): × 1.00 (no change)
  Points: 1.00 × 25 = 25.00/25 ✓

Policy Type Fit (10 pts):
  Health in preferred → 1.0
  Points: 1.0 × 10 = 10.00/10 ✓

Provider Rating (5 pts):
  Default: 0.85 (placeholder)
  Points: 0.85 × 5 = 4.25/5 ✓

TOTAL SCORE: 33.78 + 20.63 + 25.00 + 10.00 + 4.25 = 93.66/100
```

**Result**: ⭐⭐⭐⭐⭐ (Excellent Match)  
**Reason**: "Matches your preferred policy type • Within your budget (₹3,500) • Ideal for managing your health conditions"

---

## Fraud Detection System

### 8 Rules

| Rule | Trigger | Risk |
|------|---------|------|
| Duplicate Claims | Same policy, similar amount, <30 days | HIGH |
| Rapid Claims | >3 claims in 24 hours | HIGH |
| Exceeds Coverage | Claim > policy coverage | CRITICAL |
| Suspicious Timing | Claim within 7 days of purchase | HIGH |
| Missing Docs | Required documents not uploaded | MEDIUM |
| Anomalous Amount | Claim >200% of typical | MEDIUM |
| Invalid Status | Claim on inactive policy | CRITICAL |
| Unverified User | New user, high-value claim | MEDIUM |

### Risk Categories

- **0-30**: Low risk (auto-approved)
- **31-70**: Medium risk (manual review)
- **71-100**: High risk (investigation required)

---

## API Documentation

### Authentication

```
POST   /auth/register              Register new user
POST   /auth/login                 Login user
GET    /auth/profile               Get user profile
PUT    /auth/profile               Update profile
POST   /auth/preferences           Set preferences
GET    /auth/preferences           Get preferences
```

### Policies

```
GET    /policies                   List policies (paginated, searchable)
GET    /policies/{id}              Get policy details
GET    /policies/compare           Compare policies
```

### Recommendations

```
POST   /recommendations/generate   Generate 5-10 recommendations
GET    /recommendations            Get saved recommendations
```

### Claims

```
POST   /claims                     Create claim
GET    /claims                     List user's claims
GET    /claims/{id}                Get claim details
POST   /claims/{id}/documents      Upload document
DELETE /claims/{id}/documents/{id} Delete document
POST   /claims/{id}/submit         Submit for review
```

### Purchases

```
POST   /user-policies              Purchase policy
GET    /user-policies              List purchased policies
GET    /user-policies/{id}         Get policy details
```

---

## API Examples

### 1. Register & Set Preferences

```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secure123",
    "dob": "1990-05-15"
  }'

# Set Preferences
curl -X POST http://localhost:8000/auth/preferences?token=YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "preferred_policy_types": ["health", "life"],
    "max_premium": 8000,
    "risk_profile": "moderate",
    "age": 40,
    "income": 720000,
    "diseases": ["diabetes"]
  }'
```

### 2. Get Recommendations

```bash
curl -X POST http://localhost:8000/recommendations/generate?token=YOUR_TOKEN
```

### 3. Browse Policies

```bash
# By type
curl -X GET "http://localhost:8000/policies?policy_type=health&limit=20"

# Search
curl -X GET "http://localhost:8000/policies?search=HDFC&limit=20"

# With filters
curl -X GET "http://localhost:8000/policies?min_premium=1000&max_premium=5000&limit=20"
```

### 4. Submit Claim

```bash
curl -X POST http://localhost:8000/claims?token=YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "user_policy_id": 1,
    "claim_type": "health",
    "incident_date": "2024-01-15",
    "amount_claimed": 50000,
    "description": "Hospital treatment"
  }'
```

---

## Project Structure

```
newproject/
├── backend/
│   ├── main.py                    # FastAPI app
│   ├── models.py                  # Database models
│   ├── schemas.py                 # API schemas
│   ├── auth.py                    # Authentication
│   ├── scoring_refactored.py      # Recommendation engine (2-stage)
│   ├── fraud_rules.py             # Fraud detection (8 rules)
│   ├── email_service.py           # Email notifications
│   ├── database.py                # Database config
│   ├── deps.py                    # Dependency injection
│   ├── policies_seed_data.json    # 50+ policies
│   ├── seed_policies.py           # Database seeding
│   ├── requirements.txt           # Python deps
│   └── __init__.py
│
├── frontend-react/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Policies.jsx
│   │   │   ├── Recommendations.jsx
│   │   │   ├── Claims.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── components/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── README.md                       # This file
├── RECOMMENDATION_ALGORITHM_REPORT.md  # Technical details
└── .gitignore
```

---

## Key Achievements

✅ **Complete Insurance Platform**: End-to-end workflow  
✅ **Intelligent 2-Stage Recommendations**: Strict filtering + soft scoring  
✅ **50+ Realistic Policies**: From 30 real insurance companies  
✅ **Fraud Detection**: 8 rules with risk scoring  
✅ **Scalable Architecture**: Policies load from JSON/database  
✅ **Pagination & Search**: Browse up to 100 policies per request  
✅ **Professional Documentation**: Academic submission ready  
✅ **Production-Ready**: Docker support, error handling, logging  
✅ **Responsive UI**: Mobile-friendly React frontend  
✅ **Email Notifications**: Automated alerts for claims  

---

## Running the System

### Start Backend

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m uvicorn main:app --reload --port 8000
```

### Start Frontend

```bash
cd frontend-react
npm run dev
```

### Seed Database (First Time)

```bash
cd backend
python seed_policies.py
```

### Access Application

- Frontend: http://localhost:5173
- API Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## Documentation

- **Technical Details**: See [RECOMMENDATION_ALGORITHM_REPORT.md](RECOMMENDATION_ALGORITHM_REPORT.md)
- **Database Schema**: In `backend/models.py`
- **API Endpoints**: See `http://localhost:8000/docs` when running

---

My demo video of the project link:- https://drive.google.com/file/d/1Iy4Gw0aXhN36wDpyeBFAZfhnE6OfPbUV/view?usp=sharing

**Version**: 1.0 | **Status**: ✅ Production Ready | **Last Updated**: February 2026
