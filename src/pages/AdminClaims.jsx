import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const totalClaims = claims.length;
const approvedCount = claims.filter(c => c.status === "Approved").length;
const rejectedCount = claims.filter(c => c.status === "Rejected").length;
const reportedCount = claims.filter(c => c.status === "Reported").length;
const navigate = useNavigate();
  const fetchClaims = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/claims");
      setClaims(response.data);
    } catch (error) {
      console.error("Error fetching claims", error);
    }
  };

  useEffect(() => {
  const role = localStorage.getItem("role");

  if (role !== "admin") {
    navigate("/admin-login");
  } else {
    fetchClaims();
  }
}, [navigate]);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://127.0.0.1:8000/claims/${id}?status=${newStatus}`);
      fetchClaims(); // refresh list
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Admin Claim Review Dashboard</h2>
<div style={{ marginTop: "20px", marginBottom: "20px" }}>
  <h3>Dashboard Analytics</h3>

  <p>Total Claims: {totalClaims}</p>
  <p>Approved: {approvedCount}</p>
  <p>Rejected: {rejectedCount}</p>
  <p>Reported: {reportedCount}</p>
</div>
      <table border="1" cellPadding="10" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>User Email</th>
            <th>Policy ID</th>
            <th>Description</th>
            <th>Status</th>
            <th>Action</th>
            <th>Document</th>
          </tr>
        </thead>
        <tbody>
  {claims.map((claim) => (
    <tr key={claim.id}>
      <td>{claim.id}</td>
      <td>{claim.user_email}</td>
      <td>{claim.policy_id}</td>
      <td>{claim.description}</td>
      <td>{claim.status}</td>

      {/* ✅ NEW DOCUMENT COLUMN */}
      <td>
        {claim.documents ? (
          <a
            href={`http://127.0.0.1:8000/${claim.documents}`}
            target="_blank"
            rel="noreferrer"
          >
            View Document
          </a>
        ) : (
          "No File"
        )}
      </td>

      {/* ACTION COLUMN */}
      <td>
        <button onClick={() => updateStatus(claim.id, "Approved")}>
          Approve
        </button>
        <button
          onClick={() => updateStatus(claim.id, "Rejected")}
          style={{ marginLeft: "10px" }}
        >
          Reject
        </button>
      </td>
    </tr>
  ))}
</tbody>
      </table>
    </div>
  );
}

export default AdminClaims;