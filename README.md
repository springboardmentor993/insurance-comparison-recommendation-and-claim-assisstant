<h1 align="center">🚀 CoverMate</h1>
<h3 align="center">Insurance Comparison, Recommendation & Claim Assistant</h3>

<p align="center">
  A full-stack <strong>Infosys Springboard 6.0 internship project</strong> that demonstrates
  how insurance policy data is stored in a database, processed through backend APIs,
  and presented via a clean, user-friendly frontend interface.
</p>

<p align="center">
  <em>Database → Backend → Frontend</em>
</p>

<hr/>

<h2>🛠 Tech Stack</h2>

<table>
  <tr>
    <td><strong>Frontend</strong></td>
    <td>React.js, HTML, CSS</td>
  </tr>
  <tr>
    <td><strong>Backend</strong></td>
    <td>FastAPI (Python)</td>
  </tr>
  <tr>
    <td><strong>Database</strong></td>
    <td>PostgreSQL</td>
  </tr>
</table>

<hr/>

<h2>📁 Project Structure</h2>

<pre>
backend/
 ├── main.py          # FastAPI application
 ├── model.py         # Users, Providers, Policies models
 ├── database.py      # Database connection & configuration

frontend/
 ├── App.js           # Application entry point & state handling
 ├── LoginSignup.js   # Login & Signup UI (UI testing only)
 ├── Policies.js      # Policies display & filtering page
 ├── Policies.css     # Policies page styling
 ├── index.css        # Global styles
</pre>

<hr/>

<h2>🗄 Database Tables</h2>

<ul>
  <li><strong>users</strong> – stores user information</li>
  <li><strong>providers</strong> – stores insurance provider details</li>
  <li>
    <strong>policies</strong> – stores insurance policy data:
    <ul>
      <li>Policy type (health, travel, life, auto, home)</li>
      <li>Title</li>
      <li>Premium</li>
      <li>Term duration</li>
      <li>Coverage details (JSON)</li>
      <li>Provider reference</li>
    </ul>
  </li>
</ul>

<hr/>

<h2>✨ Features Implemented</h2>

<ul>
  <li>Designed and implemented PostgreSQL database schema</li>
  <li>Inserted realistic insurance policy data with category support</li>
  <li>Built FastAPI backend to fetch policy data</li>
  <li>Exposed REST API endpoint (<code>/policies</code>)</li>
  <li>Integrated React frontend with backend APIs</li>
  <li>Displayed policies with category-based filtering on UI</li>
  <li>Implemented Login & Signup UI (for testing purposes only)</li>
</ul>

<hr/>

<h2>🔄 Application Workflow</h2>

<ol>
  <li>Insurance policy data is stored in the PostgreSQL database.</li>
  <li>FastAPI backend retrieves data using SQLAlchemy.</li>
  <li>Backend exposes data as JSON via REST APIs.</li>
  <li>React frontend consumes APIs using Fetch.</li>
  <li>Policies are displayed and filtered by category on the UI.</li>
</ol>

<hr/>

<h2>▶️ How to Run the Project</h2>

<h3>🔹 Backend</h3>

<pre>
cd backend
uvicorn main:app --reload
</pre>

<h3>🔹 Frontend</h3>

<pre>
cd frontend
npm start
</pre>

<p>
Open in browser:
</p>

<pre>
http://localhost:3000
</pre>

<hr/>

<h2>🧪 Notes</h2>

<ul>
  <li>Login and Signup functionality is implemented only for UI testing.</li>
  <li>JWT-based authentication will be added in future phases.</li>
</ul>

<hr/>

<h2>📌 Project Status</h2>

<ul>
  <li>Backend and frontend integration completed</li>
  <li>Policy data successfully fetched from database</li>
  <li>Category-based policy filtering implemented</li>
  <li>UI is clean, responsive, and demo-ready</li>
</ul>

<hr/>

<h2>👤 Author</h2>

<p>
  <strong>Sadhu Chandra Sekhar</strong><br/>
  Infosys Springboard 6.0 Intern
</p>
