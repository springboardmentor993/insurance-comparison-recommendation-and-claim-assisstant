import { useEffect, useState } from "react";

function AdminClaims() {

  const [claims, setClaims] = useState([]);

  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("submittedClaims")) || [];
    setClaims(stored);
  }, []);

  const updateStatus = (id, newStatus) => {
    const updatedClaims = claims.map(claim => {
      if (claim.id === id) {
        return {
          ...claim,
          status: newStatus,
          rejectionReason: newStatus === "Rejected" ? claim.rejectionReason : ""
        };
      }
      return claim;
    });

    setClaims(updatedClaims);
    localStorage.setItem("submittedClaims", JSON.stringify(updatedClaims));
  };

  const updateRejectionReason = (id, reason) => {
    const updatedClaims = claims.map(claim => {
      if (claim.id === id) {
        return {
          ...claim,
          rejectionReason: reason
        };
      }
      return claim;
    });

    setClaims(updatedClaims);
    localStorage.setItem("submittedClaims", JSON.stringify(updatedClaims));
  };

  return (
    <div style={{ padding: "40px", backgroundColor: "#f4f6f9", minHeight: "100vh" }}>

      <h2 style={{ marginBottom: "30px" }}>
        Admin Claim Management
      </h2>

      {claims.length === 0 && <p>No claims submitted yet.</p>}

      {claims.map((claim) => (
        <div
          key={claim.id}
          style={{
            backgroundColor: "white",
            padding: "20px",
            marginBottom: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
          }}
        >

          <p><strong>Policy:</strong> {claim.policyDetails?.title}</p>
          <p><strong>Claim Type:</strong> {claim.claimDetails?.claimType}</p>
          <p><strong>Amount:</strong> ₹{claim.claimDetails?.amount}</p>

          <div style={{ marginTop: "10px" }}>
            <label><strong>Status:</strong></label>
            <select
              value={claim.status}
              onChange={(e) => updateStatus(claim.id, e.target.value)}
              style={{ marginLeft: "10px", padding: "5px" }}
            >
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {claim.status === "Rejected" && (
            <div style={{ marginTop: "10px" }}>
              <label><strong>Rejection Reason:</strong></label>
              <textarea
                value={claim.rejectionReason}
                onChange={(e) =>
                  updateRejectionReason(claim.id, e.target.value)
                }
                style={{
                  width: "100%",
                  marginTop: "5px",
                  padding: "8px"
                }}
              />
            </div>
          )}

        </div>
      ))}

    </div>
  );
}

export default AdminClaims;
