import React, { useEffect, useState } from "react";

function ClaimStatus() {

  const [claims, setClaims] = useState([]);

  useEffect(() => {
    const storedClaims =
      JSON.parse(localStorage.getItem("submittedClaims")) || [];
    setClaims(storedClaims);
  }, []);

  const getStatusColor = (status) => {
    if (status === "Approved") return "#28a745";
    if (status === "Rejected") return "#dc3545";
    if (status === "Under Review") return "#007bff";
    return "#f39c12";
  };

  return (
    <div style={{ padding: "40px", backgroundColor: "#f4f6f9", minHeight: "100vh" }}>

      <h2 style={{ marginBottom: "30px" }}>
        Claim Status Tracking
      </h2>

      {claims.length === 0 && (
        <p>No submitted claims found.</p>
      )}

      {claims.map((claim) => (
        <div
          key={claim.id}
          style={{
            backgroundColor: "white",
            padding: "25px",
            borderRadius: "10px",
            marginBottom: "25px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
          }}
        >

          {/* POLICY DETAILS */}
          <h3 style={{ marginBottom: "15px", color: "#333" }}>
            Policy Details
          </h3>

          <div style={{ marginBottom: "15px" }}>
            <p><strong>Policy Number:</strong> {claim.policyDetails?.policy_number}</p>
            <p><strong>Policy Name:</strong> {claim.policyDetails?.title}</p>
            <p><strong>Premium:</strong> ₹{claim.policyDetails?.premium}</p>
            <p><strong>Coverage:</strong> ₹{claim.policyDetails?.coverage}</p>
          </div>

          <hr />

          {/* CLAIM DETAILS */}
          <h3 style={{ margin: "15px 0", color: "#333" }}>
            Claim Details
          </h3>

          <div style={{ marginBottom: "15px" }}>
            <p><strong>Claim Type:</strong> {claim.claimDetails?.claimType}</p>
            <p><strong>Incident Date:</strong> {claim.claimDetails?.incidentDate}</p>
            <p><strong>Amount Claimed:</strong> ₹{claim.claimDetails?.amount}</p>
            <p><strong>Description:</strong> {claim.claimDetails?.description || "N/A"}</p>
          </div>

          <hr />

          {/* DOCUMENTS */}
          <h3 style={{ margin: "15px 0", color: "#333" }}>
            Uploaded Documents
          </h3>

          {claim.documents && claim.documents.length > 0 ? (
            claim.documents.map((doc, index) => (
              <div key={index} style={{ marginBottom: "8px" }}>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#007bff" }}
                >
                  {doc.filename}
                </a>
              </div>
            ))
          ) : (
            <p>No documents uploaded.</p>
          )}

          <hr />

          {/* STATUS */}
          <h3 style={{ margin: "15px 0", color: "#333" }}>
            Claim Status
          </h3>

          <span
            style={{
              padding: "8px 20px",
              borderRadius: "25px",
              backgroundColor: getStatusColor(claim.status),
              color: "white",
              fontWeight: "bold",
              fontSize: "14px"
            }}
          >
            {claim.status}
          </span>

          {claim.status === "Rejected" && claim.rejectionReason && (
            <div
              style={{
                marginTop: "15px",
                padding: "10px",
                backgroundColor: "#ffe6e6",
                borderRadius: "5px"
              }}
            >
              <strong>Reason for Rejection:</strong>
              <p>{claim.rejectionReason}</p>
            </div>
          )}

        </div>
      ))}

    </div>
  );
}

export default ClaimStatus;