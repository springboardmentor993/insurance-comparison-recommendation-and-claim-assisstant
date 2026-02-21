import { useState } from "react";
import { useNavigate } from "react-router-dom";

function UploadDocuments() {

  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/upload/", {
        method: "POST",
        body: formData
      });

     const data = await res.json();
console.log("Uploaded file response:", data);

setUploadedFiles(prev => [
  ...prev,
  {
    url: data.url || data.secure_url,
    filename: data.filename || data.original_filename || "Document"
  }
]);

      alert("File uploaded successfully!");
    } catch (error) {
      alert("Upload failed");
    }
  };

  const handleFinalSubmit = () => {

    const claimDetails = JSON.parse(localStorage.getItem("currentClaim"));
    const purchasedPolicies = JSON.parse(localStorage.getItem("purchasedPolicies")) || [];

    if (!claimDetails) {
      alert("Claim details missing!");
      return;
    }

    // 🔥 Get full policy details
    const selectedPolicy = purchasedPolicies.find(
      p => p.purchase_id == claimDetails.policyId
    );

    const fullClaim = {
      id: Date.now(),
      policyDetails: selectedPolicy,
      claimDetails: claimDetails,
      documents: uploadedFiles,
      status: "Submitted",
      rejectionReason: ""
    };

    let claims = JSON.parse(localStorage.getItem("submittedClaims")) || [];
    claims.push(fullClaim);

    localStorage.setItem("submittedClaims", JSON.stringify(claims));

    localStorage.removeItem("currentClaim");

    alert("Claim submitted successfully!");

    navigate("/claim-status");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(to right, #3a7bd5, #00d2ff)",
      padding: "40px"
    }}>

      <div style={{
        maxWidth: "700px",
        margin: "auto",
        background: "white",
        padding: "30px",
        borderRadius: "10px"
      }}>

        <h2>Step 2: Upload Required Documents</h2>

        <input
          type="file"
          onChange={handleFileUpload}
          style={{ marginBottom: "20px" }}
        />

        <div>
          {uploadedFiles.map((file, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <a href={file.url} target="_blank" rel="noreferrer">
                {file.filename}
              </a>
            </div>
          ))}
        </div>

        <button
          onClick={handleFinalSubmit}
          style={{
            marginTop: "20px",
            backgroundColor: "#1e3c72",
            color: "white",
            padding: "12px 25px",
            border: "none",
            cursor: "pointer"
          }}
        >
          Submit Claim
        </button>

      </div>

    </div>
  );
}

export default UploadDocuments;