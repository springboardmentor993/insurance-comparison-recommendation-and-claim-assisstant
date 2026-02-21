import { useState, useEffect } from "react";
import "./Recommendations.css";

function stars(n) {
  return "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));
}

function Recommendations() {

  const [policyTypes, setPolicyTypes] = useState([]);
  const [filters, setFilters] = useState({
    type: "",
    min: "",
    max: "",
    coverage: ""
  });

  const [data, setData] = useState({ recommended: [], best: null });
  const [error, setError] = useState("");

  // ✅ load policy types from backend
  useEffect(() => {
    fetch("http://127.0.0.1:8000/recommend/policy-types")
      .then(res => res.json())
      .then(d => {
        if (Array.isArray(d)) setPolicyTypes(d);
        else setPolicyTypes([]);
      })
      .catch(() => setPolicyTypes([]));
  }, []);

  const fetchRec = async () => {
    try {
      setError("");

      const url =
        `http://127.0.0.1:8000/recommend/?category=${filters.type}` +
        `&min_budget=${filters.min || 0}` +
        `&max_budget=${filters.max || 999999}` +
        `&min_coverage=${filters.coverage || 0}`;

      const res = await fetch(url);
      const d = await res.json();

      setData({
        recommended: d.recommended || [],
        best: d.best || null
      });

    } catch {
      setError("Failed to fetch recommendations");
    }
  };

  // 🔥 NEW: Buy Policy (Frontend Only)
  const buyPolicy = (policy) => {

    let purchased = JSON.parse(localStorage.getItem("purchasedPolicies")) || [];

    // prevent duplicate purchase
    const already = purchased.find(p => p.id === policy.id);
    if (already) {
      alert("Policy already purchased");
      return;
    }

    const newPurchase = {
      purchase_id: Date.now(),
      id: policy.id,
      title: policy.title,
      premium: policy.premium,
      coverage: policy.coverage,
      status: "active",
      policy_number: "TS" + Math.floor(100000 + Math.random() * 900000)
    };

    purchased.push(newPurchase);

    localStorage.setItem("purchasedPolicies", JSON.stringify(purchased));

    alert("Policy purchased successfully!");
  };

  return (
    <div className="rec-page">

      <h1>AI-Powered Recommendations</h1>

      <div className="rec-box">

        <div className="rec-header">
          Generate Recommendation Area
        </div>

        <div className="rec-form">

          <select
            value={filters.type}
            onChange={e => setFilters({...filters, type: e.target.value})}
          >
            <option value="">Any Policy Type</option>
            {policyTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <input
            placeholder="Budget Min ₹"
            type="number"
            onChange={e => setFilters({...filters, min: e.target.value})}
          />

          <input
            placeholder="Budget Max ₹"
            type="number"
            onChange={e => setFilters({...filters, max: e.target.value})}
          />

          <input
            placeholder="Coverage Min"
            type="number"
            onChange={e => setFilters({...filters, coverage: e.target.value})}
          />

          <button onClick={fetchRec}>
            Generate Recommendations
          </button>

        </div>

      </div>

      {error && <p style={{color:"red"}}>{error}</p>}

      {data.best && (
        <div className="best-box">
          ⭐ Best Policy: {data.best.title} ({data.best.score}/100)
        </div>
      )}

      <div className="policy-grid">
        {data.recommended.map(p => (
          <div key={p.id} className="policy-card">

            <h3>{p.company}</h3>
            <span className="score">{p.score}/100</span>

            <p>{p.title}</p>

            <div className="price">₹{p.premium}/month</div>

            <p>Coverage: ₹{p.coverage}</p>
            <p>Claim: {p.claim}%</p>

            <p className="stars">{stars(p.rating)}</p>

            {p.reasons.map((r,i) => (
              <div key={i}>✅ {r}</div>
            ))}

            {/* 🔥 ONLY ADDITION */}
            <button
              style={{
                marginTop: "10px",
                padding: "8px",
                backgroundColor: "#1e88e5",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
              onClick={() => buyPolicy(p)}
            >
              Buy Recommended Policy
            </button>

          </div>
        ))}
      </div>

    </div>
  );
}

export default Recommendations;