import { useState, useEffect } from "react";
import "./Policies.css";

function Policies({ onLogout }) {
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/policies")
      .then((response) => response.json())
      .then((data) => {
        setPolicies(data);
      });
  }, []);

  return (
    <div className="policies-container">
      <div className="policies-header">
        <h2 className="policies-title">Policies List</h2>

        <button className="logout-btn" onClick={onLogout}>
          Back to Login
        </button>
      </div>

      {policies.map((policy) => (
        <div key={policy.id} className="policy-card">
          <div className="policy-name">{policy.title}</div>
          <div className="policy-premium">
            Premium: ₹{policy.premium}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Policies;
