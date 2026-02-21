import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Claims() {

  const [policies, setPolicies] = useState([]);
  const navigate = useNavigate();

  // ✅ Load purchased policies from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("purchasedPolicies")) || [];
    setPolicies(stored);
  }, []);

  // ✅ Open claim form page
  const openClaimForm = (purchaseId = null) => {
    navigate("/file-claim", { state: { purchaseId } });
  };

  return (
    <div style={{ padding: "40px" }}>

      {/* 🔥 HEADER WITH TWO BUTTONS */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h2>My Purchased Policies</h2>

        <div style={{ display: "flex", gap: "15px" }}>

          {/* File New Claim Button */}
          <button
            style={{
              backgroundColor: "black",
              color: "white",
              padding: "15px 30px",
              fontSize: "18px",
              fontWeight: "bold",
              border: "2px solid black",
              cursor: "pointer"
            }}
            onClick={() => openClaimForm()}
          >
            File New Claim
          </button>

          {/* NEW Claim Status Tracking Button */}
          <button
            style={{
              backgroundColor: "white",
              color: "black",
              padding: "15px 30px",
              fontSize: "18px",
              fontWeight: "bold",
              border: "2px solid black",
              cursor: "pointer"
            }}
            onClick={() => navigate("/claim-status")}
          >
            Claim Status Tracking
          </button>

        </div>
      </div>

      {policies.length === 0 && (
        <p style={{ marginTop: "20px" }}>
          No purchased policies found
        </p>
      )}

      {policies.map(p => (
        <div key={p.purchase_id} style={{
          border: "1px solid #ccc",
          padding: "20px",
          marginTop: "20px",
          borderRadius: "10px"
        }}>

          <h4>Policy Number: {p.policy_number}</h4>
          <p>Policy: {p.title}</p>
          <p>Premium: ₹{p.premium}</p>
          <p>Coverage: ₹{p.coverage}</p>
          <p>Status: {p.status}</p>

          {p.status === "active" && (
            <button
              style={{
                marginTop: "10px",
                padding: "8px 15px",
                backgroundColor: "black",
                color: "white",
                border: "none",
                cursor: "pointer"
              }}
              onClick={() => openClaimForm(p.purchase_id)}
            >
              File Claim
            </button>
          )}

        </div>
      ))}

    </div>
  );
}

export default Claims;