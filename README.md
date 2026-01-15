# Insurance Comparison, Recommendation & Claim Assistant (CoverMate)

This is a full-stack project that demonstrates fetching insurance policy data from a PostgreSQL database through a FastAPI backend and displaying it on a React frontend.

---

## Tech Stack

Frontend:
- React.js
- HTML, CSS

Backend:
- FastAPI (Python)

Database:
- PostgreSQL

---

## Project Structure

backend/
- main.py
- model.py
- database.py

frontend/
- App.js
- LoginSignup.js
- Policies.js
- Policies.css
- index.css

---

## Database Tables

- users  
- providers  
- policies  

The policies table stores insurance policy details such as policy type, title, premium, term, coverage (JSON), and provider reference.

---

## Features Implemented

- Database schema creation (users, providers, policies)
- Insertion of policy data into database
- FastAPI backend API to fetch policies
- React frontend to consume backend API
- Display policies on frontend UI
- Login and Signup UI (UI-only, for testing)

---

## Application Workflow

Database → Backend (FastAPI) → Frontend (React)

1. Policy data is stored in PostgreSQL.
2. Backend fetches data using SQLAlchemy.
3. Backend exposes data via `/policies` API.
4. Frontend calls the API.
5. Policies are displayed on the UI.

---

## How to Run

Backend:
