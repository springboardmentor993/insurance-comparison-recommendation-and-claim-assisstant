import { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import "./AdminAuth.css";

function AdminDashboard() {

  const [stats, setStats] = useState({
    totalPolicies: 0,
    approvedClaims: 0,
    rejectedClaims: 0,
    fraudCases: []
  });

  const [emailData, setEmailData] = useState({
    to_email: "",
    subject: "",
    message: ""
  });

  // =============================
  // LOAD DUMMY ANALYTICS
  // =============================
  useEffect(() => {

    // purchased policies (from your recommendation buy)
    const purchased = JSON.parse(localStorage.getItem("purchasedPolicies")) || [];

    // dummy claims
    const claims = [
      { id: 1, amount: 200000, timeGap: 1, duplicateDocs: false },
      { id: 2, amount: 900000, timeGap: 0, duplicateDocs: true },
      { id: 3, amount: 150000, timeGap: 10, duplicateDocs: false }
    ];

    // Fraud Rules Engine (Dummy Logic)
    const fraudDetected = claims.filter(c =>
      c.amount > 800000 || c.timeGap < 1 || c.duplicateDocs === true
    );

    setStats({
      totalPolicies: purchased.length,
      approvedClaims: claims.length - fraudDetected.length,
      rejectedClaims: fraudDetected.length,
      fraudCases: fraudDetected
    });

  }, []);

  // =============================
  // EMAIL FUNCTION (REAL)
  // =============================
  const sendEmail = () => {

    emailjs.send(
      "service_pg4g3wb",
      "template_u73blko",
      {
        to_email: emailData.to_email,
        subject: emailData.subject,
        message: emailData.message
      },
      "1WgVM858zXX6yZR-u"
    )
    .then(() => {
      alert("Email Sent Successfully!");
    })
    .catch(() => {
      alert("Failed to send email.");
    });
  };

  return (
    <div className="admin-container">

      <h1>Admin Dashboard</h1>

      {/* ================= STATS CARDS ================= */}
      <div className="admin-stats">

        <div className="stat-card">
          <h3>Total Policies Purchased</h3>
          <p>{stats.totalPolicies}</p>
        </div>

        <div className="stat-card">
          <h3>Approved Claims</h3>
          <p>{stats.approvedClaims}</p>
        </div>

        <div className="stat-card">
          <h3>Rejected / Fraud Claims</h3>
          <p>{stats.rejectedClaims}</p>
        </div>

      </div>

      {/* ================= FRAUD ENGINE ================= */}
      <div className="fraud-section">
        <h2>Fraud Detection Engine</h2>

        {stats.fraudCases.length === 0 ? (
          <p>No fraud detected ✅</p>
        ) : (
          stats.fraudCases.map(f => (
            <div key={f.id} className="fraud-box">
              ⚠ Claim ID {f.id} flagged
              <br />
              Amount: ₹{f.amount}
              <br />
              Duplicate Docs: {f.duplicateDocs ? "Yes" : "No"}
            </div>
          ))
        )}
      </div>

      {/* ================= EMAIL SECTION ================= */}
      <div className="email-section">

        <h2>Send Email Notification</h2>

        <input
          placeholder="Recipient Email"
          value={emailData.to_email}
          onChange={e => setEmailData({...emailData, to_email: e.target.value})}
        />

        <input
          placeholder="Subject"
          value={emailData.subject}
          onChange={e => setEmailData({...emailData, subject: e.target.value})}
        />

        <textarea
          placeholder="Message"
          value={emailData.message}
          onChange={e => setEmailData({...emailData, message: e.target.value})}
        />

        <button onClick={sendEmail}>
          Send Email
        </button>

      </div>

    </div>
  );
}

export default AdminDashboard;