import { useState, useEffect } from "react";
import { BASE_URL } from "../api";
import "./MyClaims.css";

function MyClaims({ onBack }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClaims = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/claims/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch claims");
        }

        const data = await res.json();
        setClaims(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Unable to load claims");
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "#6b7280";
      case "submitted":
      case "approved":
      case "paid":
        return "#2563eb";   // blue only
      case "under_review":
        return "#1d4ed8";
      case "rejected":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading claims...</p>;

  if (error)
    return (
      <div className="claims-container">
        <h2>My Claims</h2>
        <p style={{ color: "red" }}>{error}</p>
        <button className="back-btn" onClick={onBack}>
          Back
        </button>
      </div>
    );

  return (
    <div className="claims-container">
      <h2>My Claims</h2>

      <button className="back-btn" onClick={onBack}>
        Back
      </button>

      {claims.length === 0 ? (
        <p style={{ marginTop: "20px" }}>
          No claims found.
        </p>
      ) : (
        <div className="claims-grid">
          {claims.map((claim) => (
            <div key={claim.id} className="claim-card">
              <h4>{claim.claim_number}</h4>
              <p><strong>Amount:</strong> ₹{claim.amount_claimed}</p>
              <p><strong>Date:</strong> {claim.incident_date}</p>

              <span
                className="status-badge"
                style={{ backgroundColor: getStatusColor(claim.status) }}
              >
                {claim.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyClaims;
