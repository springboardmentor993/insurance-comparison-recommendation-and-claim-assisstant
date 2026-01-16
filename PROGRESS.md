# 📅 Daily Progress Log
## CoverMate – Insurance Comparison, Recommendation & Claim Assistant

This file tracks day-to-day development progress for the
Infosys Springboard 6.0 Internship.
It is maintained for mentor review and personal tracking.

---

## 01 Jan 2026
### Database Schema Creation
- Designed and created core PostgreSQL database tables:
  - users
  - providers
  - policies
- Defined appropriate columns, data types, and relationships
- Structured the schema to support multiple insurance policy types
- Verified table creation and basic data integrity

**Outcome:**  
The foundational database schema was completed, forming the base
for backend and frontend integration.

---

## 03 Jan 2026
### Login & Signup UI Creation
- Designed and implemented Login and Signup pages using React
- Created clean and simple form layouts for user input
- Connected UI components to React state (UI-level only)
- No authentication or backend validation added at this stage
- Pages were created for UI flow and future JWT integration

**Outcome:**  
Login and Signup UI pages were successfully created and are ready
for backend authentication logic in later phases.

---

## 15 Jan 2026
### Frontend UI Improvements
- Added clear application identity with title and subtitle
  (CoverMate – Insurance Comparison & Claim Assistant)
- Improved Login & Signup UI alignment, spacing, and styling using CSS
- Centered login card with proper padding and shadow
- Enhanced Policies page UI with card-based layout and hover effects
- Improved typography and spacing for a clean, professional look
- Added “Back to Login” navigation using existing React state (`isLoggedIn`)
- Maintained existing project structure without introducing new folders

**Outcome:**  
The frontend UI became clean, professional, and user-friendly, and the
basic UI flow (Login → Policies → Back to Login) was completed.

---

## 16 Jan 2026
### Policy Data Flow & Category-Based Filtering
- Inserted realistic insurance policy data into the PostgreSQL `policies` table
- Used proper `policy_type` values: health, travel, life, auto, and home
- Verified complete end-to-end data flow:
  PostgreSQL → FastAPI Backend → React Frontend
- Ensured all inserted policies are correctly displayed on the UI
- Added category filter buttons:
  All, Health, Travel, Auto, Home, Life
- Implemented frontend-only category-based filtering logic
- Added active category highlighting for better user clarity
- Completed navigation flow:
  Login → View Policies → Filter by Category → Back to Login

**Outcome:**  
Policies are now dynamically organized and displayed based on
user-selected categories, fulfilling the mentor’s requirement.
