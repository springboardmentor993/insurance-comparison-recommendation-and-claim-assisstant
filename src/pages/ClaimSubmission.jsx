import React, { useState } from "react";
import axios from "axios";

function ClaimSubmission() {
  const [policyId, setPolicyId] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
const [selectedFile, setSelectedFile] = useState(null);
  const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();

  formData.append("user_email", userEmail);
  formData.append("policy_id", policyId);
  formData.append("description", description);

  if (selectedFile) {
    formData.append("file", selectedFile);
  }

  try {
    await axios.post(
      "http://127.0.0.1:8000/claims",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setMessage("Claim submitted successfully!");
  } catch (error) {
    console.error(error);
  }
};

  return (
    <div style={{ padding: "30px" }}>
      <h2>Submit a Claim</h2>

      <form onSubmit={handleSubmit}>

  {/* USER EMAIL */}
  <div>
    <label>User Email:</label><br />
    <input
      type="email"
      value={userEmail}
      onChange={(e) => setUserEmail(e.target.value)}
      required
    />
  </div>

  {/* POLICY ID */}
  <div style={{ marginTop: "15px" }}>
    <label>Policy ID:</label><br />
    <input
      type="number"
      value={policyId}
      onChange={(e) => setPolicyId(e.target.value)}
      required
    />
  </div>

  {/* DESCRIPTION */}
  <div style={{ marginTop: "15px" }}>
    <label>Description:</label><br />
    <textarea
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      required
    />
  </div>

  {/* FILE UPLOAD */}
  <div style={{ marginTop: "15px" }}>
    <label>Upload Document:</label><br />
    <input
      type="file"
      onChange={(e) => setSelectedFile(e.target.files[0])}
    />
  </div>

  <button style={{ marginTop: "15px" }} type="submit">
    Submit Claim
  </button>

</form>

      {message && <p style={{ marginTop: "20px" }}>{message}</p>}
    </div>
  );
}

export default ClaimSubmission;