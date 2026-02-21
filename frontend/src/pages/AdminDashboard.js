import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import { BASE_URL } from "../api";

const AdminDashboard = ({ onBack }) => {
  const [claims, setClaims] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [sortBy, setSortBy] = useState("date");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadClaims();
    // eslint-disable-next-line
  }, []);

  const loadClaims = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/admin/claims`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setClaims(Array.isArray(res.data) ? res.data : []);
    } catch {
      alert("Failed to load claims");
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${BASE_URL}/claims/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      loadClaims();
    } catch {
      alert("Failed to update status");
    }
  };

  // ✅ FINAL FIXED EXPORT FUNCTION
  const exportCSV = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/admin/export-claims`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "claims_export.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch {
      alert("Failed to export CSV");
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
          <select onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
          </select>

          <button onClick={exportCSV}>
            Export CSV
          </button>

          <button onClick={onBack}>
            Back
          </button>
        </div>
      </div>

      <div className="claims-grid">
        {sortedClaims.map((claim) => (
          <div key={claim.id} className="claim-card">

            <div className="claim-top">
              <div>
                <h3>{claim.claim_number}</h3>
                <p>₹ {claim.amount_claimed}</p>
                <span className={`status ${claim.status}`}>
                  {claim.status.replace("_", " ")}
                </span>
              </div>

              <div className="decision-buttons">
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
                  Review
                </button>
              </div>
            </div>

            <div className="view-docs">
              <button
                onClick={() =>
                  setExpanded(expanded === claim.id ? null : claim.id)
                }
              >
                {expanded === claim.id
                  ? "Hide Documents"
                  : "View Documents"}
              </button>
            </div>

            {expanded === claim.id && (
              <div className="documents-wrapper">
                {claim.documents.length === 0 ? (
                  <p>No documents uploaded</p>
                ) : (
                  <div className="doc-grid">
                    {claim.documents.map((doc) => (
                      <div key={doc.id} className="doc-card">
                        {doc.file_url.match(/\.(jpg|jpeg|png)$/i) ? (
                          <img src={doc.file_url} alt="doc" />
                        ) : (
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open File
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  );
};

export default AdminDashboard;