import { useState } from "react";
import "./ComparePage.css";

function ComparePage({ policies, onBack }) {
  const [coverage, setCoverage] = useState(100000);
  const [risk, setRisk] = useState("medium");

  const riskMultiplier = {
    low: 1.05,
    medium: 1.1,
    high: 1.2,
  };

  const calculatePremium = (base) => {
    return (
      base *
      riskMultiplier[risk] *
      (coverage / 100000)
    ).toFixed(2);
  };

  return (
    <div className="compare-container">

      <div className="compare-top">
        <h2>Compare Policies</h2>
        <button className="back-btn" onClick={onBack}>Back</button>
      </div>

      {/* Premium Calculator */}
      <div className="calculator-box">
        <div className="calculator-field">
          <label>Coverage Amount</label>
          <input
            type="number"
            value={coverage}
            onChange={(e) => setCoverage(e.target.value)}
          />
        </div>

        <div className="calculator-field">
          <label>Risk Level</label>
          <select
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
          >
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>
      </div>

      {/* Side-by-side cards */}
      <div className="compare-grid">
        {policies.map((policy) => (
          <div key={policy.id} className="compare-card">

            <div className="compare-card-header">
              <h3>{policy.title}</h3>
              <span className="policy-type">
                {policy.policy_type}
              </span>
            </div>

            <div className="price-section">
              <div className="base-price">
                Base: ₹{policy.premium}
              </div>
              <div className="estimated-price">
                Estimated: ₹{calculatePremium(policy.premium)}
              </div>
            </div>

            <div className="features-section">
              <p>✔ Premium adjusted based on risk</p>
              <p>✔ Coverage: ₹{coverage}</p>
              <p>✔ Risk: {risk}</p>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

export default ComparePage;