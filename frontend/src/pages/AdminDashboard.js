import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import { BASE_URL } from "../api";

const AdminDashboard = ({ onBack }) => {
  const [claims, setClaims] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [sortBy, setSortBy] = useState("date");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const loadClaims = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/claims`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClaims(res.data || []);
    } catch {
      alert("Failed to load claims");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${BASE_URL}/claims/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadClaims();
      setExpanded(null);
    } catch {
      alert("Failed to update status");
    }
  };

  const exportCSV = async () => {
    try {
      const response = await fetch(`${BASE_URL}/admin/export-claims`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error();

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "claims_export.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Export failed");
    }
  };

  const sortedClaims = [...claims].sort((a, b) => {
    if (sortBy === "amount") return b.amount_claimed - a.amount_claimed;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  if (loading) return <div className="admin-container">Loading...</div>;

  return (
    <div className="admin-container">

      <div className="admin-header">
        <h2>Insurance Claim Review Panel</h2>

        <div className="header-actions">
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
          </select>

          <button className="export-btn" onClick={exportCSV}>
            Export CSV
          </button>

          <button className="back-btn" onClick={onBack}>
            Back
          </button>
        </div>
      </div>

      <div className="claims-grid">
        {sortedClaims.map((claim) => (
          <div key={claim.id} className="claim-card">

            <div className="claim-summary">
              <div>
                <h3>{claim.claim_number}</h3>
                <p className="amount">₹ {claim.amount_claimed}</p>

                <span className={`status status-${claim.status}`}>
                  {claim.status.replace("_", " ")}
                </span>
              </div>

              <div className="card-buttons">
                <button
                  className="review-btn"
                  onClick={() =>
                    setExpanded(expanded === claim.id ? null : claim.id)
                  }
                >
                  {expanded === claim.id ? "Hide Review" : "Check & Review"}
                </button>

                {claim.documents && claim.documents.length > 0 && (
                  <button
                    className="doc-btn"
                    onClick={() =>
                      window.open(claim.documents[0].file_url, "_blank")
                    }
                  >
                    View Document
                  </button>
                )}
              </div>
            </div>

            {expanded === claim.id && (
              <div className="expand-section">

                {claim.fraud_flags?.length > 0 ? (
                  <div className="fraud-box fraud-danger">
                    <h4>🚨 Fraud Detected</h4>
                    <ul>
                      {claim.fraud_flags.map((flag, index) => (
                        <li key={index}>
                          <strong>{flag.rule_code}</strong> - {flag.details}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="fraud-box fraud-safe">
                    <h4>✅ No Fraud Detected</h4>
                  </div>
                )}

                <div className="decision-section">
                  <button
                    className="approve"
                    onClick={() => updateStatus(claim.id, "approved")}
                  >
                    Approve
                  </button>

                  <button
                    className="reject"
                    onClick={() => updateStatus(claim.id, "rejected")}
                  >
                    Reject
                  </button>

                  <button
                    className="review"
                    onClick={() => updateStatus(claim.id, "under_review")}
                  >
                    Mark Under Review
                  </button>
                </div>

              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;