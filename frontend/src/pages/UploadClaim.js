import { useState } from "react";
import { BASE_URL } from "../api";
import "./UploadClaim.css";

function UploadClaim({ claimId, onBack }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpload = async () => {
    setError("");
    setMessage("");

    if (!file) {
      setError("Please select a file");
      return;
    }

    if (!claimId) {
      setError("Invalid claim ID");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Unauthorized. Please login again.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const response = await fetch(
        `${BASE_URL}/claims/${Number(claimId)}/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // ✅ Proper error handling
        if (Array.isArray(data.detail)) {
          setError(data.detail[0].msg);
        } else {
          setError(data.detail || "Upload failed");
        }
        return;
      }

      // ✅ Success
      setMessage("File uploaded successfully!");
      setFile(null);

    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Upload Claim Document</h2>

      {error && (
        <p style={{ color: "red", marginBottom: "10px" }}>
          {error}
        </p>
      )}

      {message && (
        <p style={{ color: "green", marginBottom: "10px" }}>
          {message}
        </p>
      )}

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button
        className="primary-btn"
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      <button
        className="primary-btn"
        style={{ marginTop: "10px", background: "#6b7280" }}
        onClick={onBack}
      >
        Back
      </button>
    </div>
  );
}

export default UploadClaim;
