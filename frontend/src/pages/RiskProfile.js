import { useState } from "react";
import "./Auth.css";
import { BASE_URL } from "../api";

function RiskProfile({ userId, onSubmitSuccess }) {
  const [age, setAge] = useState("");
  const [income, setIncome] = useState("");
  const [dependents, setDependents] = useState("");
  const [health, setHealth] = useState("none");
  const [riskLevel, setRiskLevel] = useState("medium");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!age || !income || !dependents) {
      setError("Please fill all required fields");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token || !userId) {
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
      window.location.reload();
      return;
    }

    const riskData = {
      age: Number(age),
      annual_income: Number(income),
      dependents: Number(dependents),
      health_condition: health,
      risk_level: riskLevel,
    };

    try {
      setLoading(true);

      const response = await fetch(
        `${BASE_URL}/users/${userId}/risk-profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(riskData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }

      onSubmitSuccess("recommendations");

    } catch (err) {
      setError("Unable to save preferences.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Insurance Preferences</h2>

      {error && (
        <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>
      )}

      <input
        type="number"
        placeholder="Age"
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />

      <input
        type="number"
        placeholder="Annual Income"
        value={income}
        onChange={(e) => setIncome(e.target.value)}
      />

      <input
        type="number"
        placeholder="Number of Dependents"
        value={dependents}
        onChange={(e) => setDependents(e.target.value)}
      />

      <select value={health} onChange={(e) => setHealth(e.target.value)}>
        <option value="none">No Health Issues</option>
        <option value="minor">Minor Issues</option>
        <option value="major">Major Issues</option>
      </select>

      <select value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)}>
        <option value="low">Low Risk</option>
        <option value="medium">Medium Risk</option>
        <option value="high">High Risk</option>
      </select>

      <button
        className="primary-btn"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Preferences"}
      </button>

      {/* 🔥 NEW BACK BUTTON */}
      <button
        style={{ marginTop: "10px", background: "#6b7280" }}
        className="primary-btn"
        onClick={() => onSubmitSuccess("policies")}
      >
        Back to Policies
      </button>
    </div>
  );
}

export default RiskProfile;
