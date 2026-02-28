<h1 align="center">🚀 CoverMate</h1>
<h2 align="center">Insurance Comparison, Recommendation & Claim Assistant</h2>

<p align="center">
  Full-Stack Insurance Management System built using FastAPI, PostgreSQL, and React.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql" />
  <img src="https://img.shields.io/badge/Auth-JWT-black?style=for-the-badge&logo=jsonwebtokens" />
  <img src="https://img.shields.io/badge/Storage-Google%20Drive-green?style=for-the-badge&logo=google-drive" />
  <img src="https://img.shields.io/badge/Async-Celery-darkgreen?style=for-the-badge" />
</p>

<hr>

<h2>📌 Project Overview</h2>

<p>
CoverMate is a full-stack insurance management platform that enables users to:
</p>

<ul>
  <li>Compare insurance policies</li>
  <li>Receive personalized recommendations</li>
  <li>Enroll in policies</li>
  <li>File and track insurance claims</li>
  <li>Upload claim documents via Google Drive API</li>
  <li>Detect fraud using rule-based validation</li>
  <li>Monitor activity through an Admin Dashboard</li>
</ul>

<hr>

<h2>🏗 System Architecture</h2>

<pre align="center">
React Frontend
        │
        ▼
FastAPI Backend (REST API)
        │
        ▼
PostgreSQL Database
        │
        ▼
Google Drive API (Cloud Document Storage)
</pre>

<hr>

<h2>🛠 Technology Stack</h2>

<table align="center" cellpadding="10">
  <tr>
    <th align="left">Category</th>
    <th align="left">Technology</th>
  </tr>
  <tr>
    <td><strong>Frontend</strong></td>
    <td>React.js<br>JavaScript (ES6+)<br>CSS</td>
  </tr>
  <tr>
    <td><strong>Backend</strong></td>
    <td>FastAPI<br>Python<br>SQLAlchemy ORM</td>
  </tr>
  <tr>
    <td><strong>Database</strong></td>
    <td>PostgreSQL</td>
  </tr>
  <tr>
    <td><strong>Authentication</strong></td>
    <td>JWT (Access & Refresh Tokens)</td>
  </tr>
  <tr>
    <td><strong>Cloud Storage</strong></td>
    <td>Google Drive API Integration</td>
  </tr>
  <tr>
    <td><strong>Background Processing</strong></td>
    <td>Celery<br>Redis</td>
  </tr>
</table>

<hr>

<h2>📂 Repository Structure</h2>

<pre>
Insurance-Comparison-Claim-Assistant/

├── backend/
│   ├── routers/
│   │   ├── admin.py
│   │   ├── claims.py
│   │   ├── login.py
│   │   ├── policies.py
│   │   ├── recommendations.py
│   │   ├── risk_profile.py
│   │   └── userpolicies.py
│   │
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── hashing.py
│   ├── jwt_token.py
│   ├── oauth2.py
│   ├── security.py
│   ├── drive_service.py
│   ├── celery_worker.py
│   ├── tasks.py
│
├── database/
│   ├── users_schema.sql
│   ├── providers_schema.sql
│   ├── policies_schema.sql
│   ├── userPolicies_schema.sql
│   ├── claims_schema.sql
│   ├── ClaimDocuments_schema.sql
│   ├── Recommendations_schema.sql
│   ├── FraudFlags_schema.sql
│   └── adminlogs_schema.sql
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AdminDashboard.js
│   │   │   ├── ComparePage.js
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── Policies.js
│   │   │   ├── Recommendations.js
│   │   │   ├── RiskProfile.js
│   │   │   ├── MyClaims.js
│   │   │   └── UploadClaim.js
│   │   │
│   │   ├── api.js
│   │   ├── App.js
│   │   └── index.js
│   │
│   ├── package.json
│   └── package-lock.json
│
├── PROGRESS.md
└── README.md
</pre>

<hr>

<h2>🔄 Application Workflow</h2>

<h3>1️⃣ Authentication</h3>
<p>User registers → Password hashed → JWT token generated → Secure API access provided.</p>

<h3>2️⃣ Policy Browsing & Comparison</h3>
<p>Policies retrieved from database → User compares coverage, premium, and deductible.</p>

<h3>3️⃣ Recommendation Engine</h3>
<p>Risk profile stored → Policies scored dynamically → Ranked recommendations returned.</p>

<h3>4️⃣ Policy Enrollment</h3>
<p>Selected policy linked to user → Stored in UserPolicies table.</p>

<h3>5️⃣ Claim Filing</h3>
<p>User submits claim details → Supporting documents uploaded.</p>

<h3>6️⃣ Cloud Storage</h3>
<p>Documents uploaded via Google Drive API → Secure file URL saved in database.</p>

<h3>7️⃣ Fraud Detection</h3>
<ul>
  <li>Duplicate claim validation</li>
  <li>Suspicious timing detection</li>
  <li>High claim amount validation</li>
</ul>

<h3>8️⃣ Admin Monitoring</h3>
<p>Admin reviews claims → Updates status → Logs recorded in AdminLogs.</p>

<hr>

<h2>⚙ Installation & Setup</h2>

<h3>Prerequisites</h3>
<ul>
  <li>Python 3.9+</li>
  <li>Node.js 16+</li>
  <li>PostgreSQL</li>
  <li>Redis</li>
</ul>

<hr>

<h2>🔧 Backend Setup</h2>

<pre>
cd backend

pip install fastapi uvicorn sqlalchemy psycopg2-binary python-jose passlib[bcrypt] python-multipart celery redis google-api-python-client google-auth google-auth-oauthlib

uvicorn main:app --reload
</pre>

<p><strong>Backend:</strong> http://127.0.0.1:8000</p>
<p><strong>API Docs:</strong> http://127.0.0.1:8000/docs</p>

<h3>Run Celery Worker</h3>

<pre>
celery -A celery_worker.celery worker --loglevel=info
</pre>

<hr>

<h2>💻 Frontend Setup</h2>

<pre>
cd frontend
npm install
npm start
</pre>

<p><strong>Frontend:</strong> http://localhost:3000</p>

<hr>

<h2>📅 8-Week Internship Milestones</h2>

<ul>
  <li><strong>Weeks 1–2:</strong> Database schema design and authentication implementation</li>
  <li><strong>Weeks 3–4:</strong> Risk profiling and recommendation engine development</li>
  <li><strong>Weeks 5–6:</strong> Claims workflow and Google Drive integration</li>
  <li><strong>Weeks 7–8:</strong> Fraud detection engine and admin monitoring system</li>
</ul>

<hr>

<h2>✅ Project Status</h2>

<p>
The system supports policy comparison, personalized recommendations,
complete claim lifecycle management, secure cloud document storage,
fraud monitoring, and administrative oversight.
</p>

<p>
This project demonstrates full-stack development, backend architecture design,
secure authentication, relational database modeling, cloud integration,
and structured milestone execution.
</p>
