import { useState } from "react";
import "./Auth.css";

function RiskProfile({ userId, onSubmitSuccess }) {
  const [age, setAge] = useState("");
  const [income, setIncome] = useState("");
  const [dependents, setDependents] = useState("");
  const [health, setHealth] = useState("none");
  const [riskLevel, setRiskLevel] = useState("medium");

  const handleSubmit = async () => {
    if (!age || !income || !dependents) {
      alert("Please fill all required fields");
      return;
    }

    const riskData = {
      age: Number(age),
      annual_income: Number(income),
      dependents: Number(dependents),
      health_condition: health,
      risk_level: riskLevel
    };

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/users/${userId}/risk-profile`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(riskData)
        }
      );

      if (!response.ok) {
        alert("Failed to save risk profile");
        return;
      }

      alert("Risk profile saved successfully");
      onSubmitSuccess();

    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  return (
    <div className="auth-container">
      <h2>User Risk Profile</h2>

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

      <button className="primary-btn" onClick={handleSubmit}>
        Save Risk Profile
      </button>
    </div>
  );
}

export default RiskProfile;