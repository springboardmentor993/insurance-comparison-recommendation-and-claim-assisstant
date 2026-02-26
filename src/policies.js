import React, { useEffect, useState } from "react";
import "./Policies.css";

function Policies() {
  const [policies, setPolicies] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/policies")
      .then((res) => res.json())
      .then((data) => setPolicies(data))
      .catch((err) => console.error(err));
  }, []);

  const handleSelect = (policy) => {
  if (selected.find((p) => p.id === policy.id)) {
    setSelected(selected.filter((p) => p.id !== policy.id));
  } else {
    if (selected.length < 5) {
      setSelected([...selected, policy]);
    } else {
      alert("You can compare maximum 5 policies");
    }
  }
};


  return (
    <div className="policies-container">
      <h2>All Insurance Policies</h2>

      <div className="policy-grid">
        {policies.map((policy) => (
          <div key={policy.id} className="policy-card">
            <h3>{policy.title}</h3>
            <p><strong>Category:</strong> {policy.policy_type}</p>
            <p><strong>Premium:</strong> ₹{policy.premium}</p>
            <p><strong>Term:</strong> {policy.term_months} months</p>

            <button onClick={() => handleSelect(policy)}>
              {selected.find((p) => p.id === policy.id)
                ? "Remove"
                : "Compare"}
            </button>
          </div>
        ))}
      </div>

      {/* Comparison Section */}
      {selected.length > 0 && (
        <div className="comparison-section">
          <h2>Comparison</h2>
          <div className="compare-box">
            {selected.map((p) => (
              <div key={p.id}>
                <h3>{p.title}</h3>
                <p>Category: {p.policy_type}</p>
                <p>Premium: ₹{p.premium}</p>
                <p>Term: {p.term_months} months</p>
                {p.coverage && (
  <div>
    <strong>Coverage:</strong>
    <ul>
      {Object.entries(p.coverage).map(([key, value]) => (
        <li key={key}>
          {key}: {String(value)}
        </li>
      ))}
    </ul>
  </div>
)}


                <p>Deductible: {p.deductible}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Policies;



