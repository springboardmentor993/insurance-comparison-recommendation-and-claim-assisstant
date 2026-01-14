<h1 align="center">Insurance Comparison, Recommendation & Claim Assistant (CoverMate)</h1>

<p align="center">
  A full-stack project demonstrating how insurance policy data stored in a database
  is fetched through a backend API and displayed on a frontend application.
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
 ├── model.py         (Users, Providers, Policies tables)
 ├── database.py      (Database connection)

frontend/
 ├── App.js           (App entry point)
 ├── LoginSignup.js   (Login & Signup UI – test mode)
 ├── Policies.js      (Policies display page)
 ├── Policies.css     (Policies page styling)
 ├── index.css        (Global styles)
</pre>

<hr/>

<h2>🗄 Database Tables</h2>
<ul>
  <li><strong>users</strong> – stores user information</li>
  <li><strong>providers</strong> – stores insurance provider details</li>
  <li><strong>policies</strong> – stores insurance policy data:
    <ul>
      <li>policy type</li>
      <li>title</li>
      <li>premium</li>
      <li>term duration</li>
      <li>coverage (JSON)</li>
      <li>provider reference</li>
    </ul>
  </li>
</ul>

<hr/>

<h2>✅ Features Implemented</h2>
<ul>
  <li>Created PostgreSQL database schema (users, providers, policies)</li>
  <li>Inserted insurance policy data into database</li>
  <li>Built FastAPI backend to fetch policy data</li>
  <li>Exposed backend API (<code>/policies</code>)</li>
  <li>Connected React frontend to backend API</li>
  <li>Displayed policy data on frontend UI</li>
  <li>Login & Signup UI (testing purpose only)</li>
</ul>

<hr/>

<h2>🔄 Application Workflow</h2>

<p><strong>Database → Backend → Frontend</strong></p>

<ol>
  <li>Policy data is stored in PostgreSQL database.</li>
  <li>FastAPI backend fetches data using SQLAlchemy.</li>
  <li>Backend sends data as JSON via API.</li>
  <li>React frontend calls the backend API.</li>
  <li>Policies are displayed on the UI.</li>
</ol>

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
Login and Signup are implemented only for UI testing.
Authentication and JWT will be added in future.
</p>

<hr/>

<h2>📌 Project Status</h2>
<p>
Backend and frontend integration is completed.
Policy data is successfully fetched from database and displayed on frontend.
</p>

<hr/>

<h2>👤 Author</h2>
<p><strong>Sadhu Chandra Sekhar</strong></p>
