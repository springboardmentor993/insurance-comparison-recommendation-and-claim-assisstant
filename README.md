.

🛡️ Insurance Management & Claim Portal

A full-featured Insurance Management System built using React.js.
This application allows users to buy insurance policies, file claims, track claim status, and enables admins to review, approve, or reject claims with persistent data storage.

🚀 Project Overview

The Insurance Portal simulates a real-world insurance system with:

User authentication

Policy purchase system

Claim filing wizard

Claim status tracking

Admin approval workflow

Persistent data even after logout

The system uses localStorage to maintain user-specific data across sessions.

✨ Features
👤 User Module

🔐 User Registration & Login

📄 View Available Insurance Policies

🛒 Buy Insurance Policies

📝 File Insurance Claims

📊 Track Claim Status (Pending / Approved / Rejected)

🕒 View Previously Submitted Claims

⭐ Review Purchased Policies

💾 Data persists even after logout

👨‍💼 Admin Module

📂 View All Submitted Claims

✅ Approve Claims

❌ Reject Claims

🔄 Status updates reflected instantly to users

📜 Maintain claim history

🧠 How Data Persistence Works

Logged-in user stored as:

localStorage → currentUser

Claims stored user-wise:

claims_useremail

Policies stored user-wise:

policies_useremail

This ensures:

Each user sees only their own data

Admin can access all claims

Data remains after logout and refresh

🏗️ Tech Stack

⚛️ React.js

🧭 React Router DOM

🎨 Modern CSS (Gradient UI + Card Design)

💾 localStorage (Frontend Data Storage)

📂 Project Structure
src/
│
├── components/
│   └── Navbar.jsx
│
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── FileClaim.jsx
│   ├── ClaimStatus.jsx
│   ├── BuyPolicy.jsx
│   ├── ReviewPolicy.jsx
│   ├── AdminDashboard.jsx
│
└── App.jsx
🔄 Application Workflow

1️⃣ User Registers / Logs In
2️⃣ User Buys Policy
3️⃣ User Files Claim
4️⃣ Claim Saved in localStorage
5️⃣ Admin Reviews Claim
6️⃣ Admin Approves / Rejects
7️⃣ User Sees Updated Status
8️⃣ All Data Persists After Logout

🎨 UI Highlights

Clean Gradient Background Theme

Responsive Layout

Card-Based Design

Color-Coded Claim Status:

🟡 Pending

🟢 Approved

🔴 Rejected

Navigation Bar on Every Page

🛠️ Installation & Setup
1️⃣ Clone Repository
git clone https://github.com/your-username/insurance-project.git
2️⃣ Navigate to Project
cd insurance-project
3️⃣ Install Dependencies
npm install
4️⃣ Run Application
npm start

Application runs at:

http://localhost:3000
📈 Future Enhancements

🔗 Backend Integration (Node.js + Express)

🗄️ Database Integration (MongoDB / MySQL)

🔐 JWT Authentication

📧 Email Notifications

☁️ Cloud File Upload (AWS S3)

📊 Admin Analytics Dashboard

🔎 Claim Search & Filter

🛡️ Role-Based Access Control

👩‍💻 Author

Developed as part of an Insurance Management System project using React.

📜 License

This project is developed for educational and demonstration purposes.
