<h1 align="center">CoverMate – Insurance Comparison, Recommendation & Claim Assistant</h1>

<p align="center">
  A full-stack internship project demonstrating how insurance policy data
  is stored in a database, processed through backend APIs, and presented
  via a clean and user-friendly frontend interface.
</p>

<hr/>

<h2>🛠 Tech Stack</h2>
<ul>
  <li><strong>Frontend:</strong> React.js, HTML, CSS</li>
  <li><strong>Backend:</strong> FastAPI (Python)</li>
  <li><strong>Database:</strong> PostgreSQL</li>
</ul>

<hr/>

<h2>📁 Project Structure</h2>

<pre>
backend/
 ├── main.py          (FastAPI application)
 ├── model.py         (Users, Providers, Policies models)
 ├── database.py      (Database connection & configuration)

frontend/
 ├── App.js           (Application entry point & state handling)
 ├── LoginSignup.js   (Login & Signup UI – UI testing only)
 ├── Policies.js      (Policies display page)
 ├── Policies.css     (Policies page styling)
 ├── index.css        (Global styles)
</pre>

<hr/>

<h2>🗄 Database Tables</h2>
<ul>
  <li><strong>users</strong> – stores user information</li>
  <li><strong>providers</strong> – stores insurance provider details</li>
  <li>
    <strong>policies</strong> – stores insurance policy data, including:
    <ul>
      <li>Policy type</li>
      <li>Title</li>
      <li>Premium</li>
      <li>Term duration</li>
      <li>Coverage details (JSON)</li>
      <li>Provider reference</li>
    </ul>
  </li>
</ul>

<hr/>

<h2>✅ Features Implemented</h2>
<ul>
  <li>Designed and implemented PostgreSQL database schema</li>
  <li>Inserted sample insurance policy data</li>
  <li>Built FastAPI backend to fetch policy data</li>
  <li>Exposed REST API endpoint (<code>/policies</code>)</li>
  <li>Connected React frontend with backend API</li>
  <li>Displayed insurance policies on frontend UI</li>
  <li>Implemented Login & Signup UI (for testing purposes only)</li>
</ul>

<hr/>

<h2>🔄 Application Workflow</h2>

<p><strong>Database → Backend → Frontend</strong></p>

<ol>
  <li>Insurance policy data is stored in the PostgreSQL database.</li>
  <li>FastAPI backend fetches data using SQLAlchemy.</li>
  <li>Backend exposes data as JSON through REST APIs.</li>
  <li>React frontend consumes the APIs.</li>
  <li>Policy information is displayed to the user.</li>
</ol>

<hr/>

<h2>📅 Progress Log (Infosys Springboard 6.0 Internship)</h2>

<ul>
  <li>
    <strong>15 Jan 2026 – Frontend UI Improvements</strong><br/><br/>
    Improved the frontend UI with a focus on clarity, layout consistency,
    and smooth user flow, without modifying backend logic or authentication.
    <ul>
      <li>Added application title and subtitle for clear identity</li>
      <li>Enhanced Login & Signup UI alignment and styling using CSS</li>
      <li>Improved Policies page layout with card-based UI and hover effects</li>
      <li>Added “Back to Login” navigation using existing React state</li>
      <li>Maintained existing file structure and code organization</li>
    </ul>
    <br/>
    <strong>Outcome:</strong>  
    The UI is now clean, professional, and user-friendly.
    The frontend is ready for JWT authentication and future enhancements.
  </li>
</ul>

<hr/>

<h2>▶️ How to Run</h2>

<h3>Backend</h3>
<pre>
cd backend
uvicorn main:app --reload
</pre>

<h3>Frontend</h3>
<pre>
cd frontend
npm start
</pre>

<p>Open in browser:</p>
<pre>
http://localhost:3000
</pre>

<hr/>

<h2>🧪 Note</h2>
<p>
Login and Signup functionality is implemented only for UI testing.
Authentication and JWT-based security will be added in future stages.
</p>

<hr/>

<h2>📌 Project Status</h2>
<p>
Backend and frontend integration is complete.
Insurance policy data is successfully fetched from the database
and displayed on the frontend with an improved UI.
</p>

<hr/>

<h2>👤 Author</h2>
<p><strong>Sadhu Chandra Sekhar</strong></p>
