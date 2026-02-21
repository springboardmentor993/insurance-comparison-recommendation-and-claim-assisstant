import { useEffect, useState } from "react";
import "./Policies.css";

function stars(n) {
  return "★".repeat(Math.round(n || 0)) + "☆".repeat(5 - Math.round(n || 0));
}

function Policies() {

  const API = "http://127.0.0.1:8000";

  const defaultFilters = {
    type: "",
    premium: "",
    coverage: "",
    term: "",
    claim: ""
  };

  const [types, setTypes] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [policies, setPolicies] = useState([]);
  const [error, setError] = useState("");

  // ✅ NEW STATES FOR COMPARISON
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  // 🔹 Load policy types
 useEffect(() => {
  fetch(`${API}/categories`)
    .then(res => res.json())
    .then(d => {
      if (Array.isArray(d)) {
        setTypes(d.map(c => c.name));
      } else {
        setTypes([]);
      }
    })
    .catch(() => setTypes([]));
}, []);

  // 🔹 Load policies when filters change
  useEffect(() => {
    fetchPolicies();
  }, [filters]);

  const fetchPolicies = async () => {
    try {
      let url = `${API}/policies/?`;

      if (filters.type) url += `policy_type=${filters.type}&`;
      if (filters.premium) url += `premium_max=${filters.premium}&`;
      if (filters.coverage) url += `coverage_min=${filters.coverage}&`;
      if (filters.term) url += `term_max=${filters.term}&`;
      if (filters.claim) url += `claim_min=${filters.claim}&`;

      const res = await fetch(url);
      const data = await res.json();

      setPolicies(Array.isArray(data) ? data : []);
      setError("");

    } catch {
      setError("Failed to fetch policies");
      setPolicies([]);
    }
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  // ✅ HANDLE COMPARE SELECT
  const handleCompare = (policy) => {
    const exists = compareList.find(p => p.id === policy.id);

    if (exists) {
      setCompareList(compareList.filter(p => p.id !== policy.id));
    } else {
      if (compareList.length >= 4) {
        alert("You can compare maximum 4 policies");
        return;
      }
      setCompareList([...compareList, policy]);
    }
  };

  // ✅ GENERATE PROFESSIONAL SUMMARY
  const generateSummary = () => {
    if (compareList.length === 0) return "";

    const bestPremium = [...compareList].sort((a,b)=>a.premium-b.premium)[0];
    const bestCoverage = [...compareList].sort((a,b)=>b.coverage-a.coverage)[0];
    const bestClaim = [...compareList].sort((a,b)=>b.claim-a.claim)[0];

    return `
✔ Best Budget Option: ${bestPremium.title} (Lowest Premium ₹${bestPremium.premium})

✔ Highest Coverage: ${bestCoverage.title} (₹${bestCoverage.coverage})

✔ Best Claim Settlement Ratio: ${bestClaim.title} (${bestClaim.claim}%)

Professional Recommendation:
Choose based on your priority:
- Cost Effective → ${bestPremium.title}
- Maximum Protection → ${bestCoverage.title}
- High Claim Reliability → ${bestClaim.title}
    `;
  };

  return (
    <div className="policies-page">

      {/* LEFT FILTERS */}
      <div className="policies-filters">
        <h2>Filters</h2>

        <label>Policy Type</label>
        <select value={filters.type}
          onChange={e => setFilters({...filters, type: e.target.value})}>
          <option value="">All</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <label>Max Premium</label>
        <select value={filters.premium}
          onChange={e => setFilters({...filters, premium: e.target.value})}>
          <option value="">Any</option>
          <option value="5000">5000</option>
          <option value="10000">10000</option>
          <option value="15000">15000</option>
          
        </select>

        <label>Min Coverage</label>
        <select value={filters.coverage}
          onChange={e => setFilters({...filters, coverage: e.target.value})}>
          <option value="">Any</option>
          <option value="50">50</option>
          <option value="75">75</option>
          <option value="100">100</option>
        </select>

        <label>Max Term (months)</label>
        <select value={filters.term}
          onChange={e => setFilters({...filters, term: e.target.value})}>
          <option value="">Any</option>
          <option value="12">12</option>
          <option value="24">24</option>
        </select>

        <label>Min Claim Ratio</label>
        <select value={filters.claim}
          onChange={e => setFilters({...filters, claim: e.target.value})}>
          <option value="">Any</option>
          <option value="80">80</option>
          <option value="90">90</option>
          <option value="95">95</option>
        </select>

        <button className="reset-btn" onClick={resetFilters}>
          Reset Filters
        </button>
      </div>

      {/* RIGHT RESULTS */}
      <div className="policies-results">

        {error && <p style={{color:"red"}}>{error}</p>}

        {policies.length === 0 && !error && (
          <p>No policies found</p>
        )}

        {policies.map(p => (
          <div key={p.id} className="policy-card">
            <h3>{p.title}</h3>
            <p>Type: {p.type}</p>
            <p>Premium: ₹{p.premium}</p>
            <p>Coverage: ₹{p.coverage}</p>
            <p>Term: {p.term} months</p>
            <p>Claim Ratio: {p.claim}%</p>
            <div className="stars">{stars(p.rating)}</div>

            {/* ✅ COMPARE CHECKBOX */}
            <label style={{ marginTop: "8px", display: "block" }}>
              <input
                type="checkbox"
                checked={compareList.some(cp => cp.id === p.id)}
                onChange={() => handleCompare(p)}
              /> Compare
            </label>

          </div>
        ))}

      </div>

      {/* ✅ COMPARE BUTTON */}
      {compareList.length > 1 && (
        <div style={{ position:"fixed", bottom:"20px", right:"20px" }}>
          <button
            style={{
              background:"#1e3c72",
              color:"white",
              padding:"12px 20px",
              border:"none",
              borderRadius:"8px",
              cursor:"pointer"
            }}
            onClick={()=>setShowCompare(true)}
          >
            Compare ({compareList.length})
          </button>
        </div>
      )}

      {/* ✅ COMPARISON MODAL */}
      {showCompare && (
        <div style={{
          position:"fixed",
          top:0,
          left:0,
          width:"100%",
          height:"100%",
          background:"rgba(0,0,0,0.6)",
          display:"flex",
          justifyContent:"center",
          alignItems:"center"
        }}>
          <div style={{
            background:"white",
            padding:"30px",
            width:"90%",
            maxWidth:"1000px",
            borderRadius:"12px",
            overflowX:"auto"
          }}>

            <h2>Policy Comparison</h2>

            <table style={{width:"100%", borderCollapse:"collapse"}}>
              <thead>
                <tr>
                  <th>Feature</th>
                  {compareList.map(p => (
                    <th key={p.id}>{p.title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Premium</td>
                  {compareList.map(p => <td key={p.id}>₹{p.premium}</td>)}
                </tr>
                <tr>
                  <td>Coverage</td>
                  {compareList.map(p => <td key={p.id}>₹{p.coverage}</td>)}
                </tr>
                <tr>
                  <td>Term</td>
                  {compareList.map(p => <td key={p.id}>{p.term} months</td>)}
                </tr>
                <tr>
                  <td>Claim Ratio</td>
                  {compareList.map(p => <td key={p.id}>{p.claim}%</td>)}
                </tr>
                <tr>
                  <td>Rating</td>
                  {compareList.map(p => <td key={p.id}>{stars(p.rating)}</td>)}
                </tr>
              </tbody>
            </table>

            <div style={{
              marginTop:"20px",
              background:"#f4f6f9",
              padding:"15px",
              borderRadius:"8px"
            }}>
              <h3>Professional Comparison Summary</h3>
              <pre style={{whiteSpace:"pre-wrap"}}>{generateSummary()}</pre>
            </div>

            <button
              style={{
                marginTop:"20px",
                background:"#e74c3c",
                color:"white",
                padding:"10px 20px",
                border:"none",
                borderRadius:"8px",
                cursor:"pointer"
              }}
              onClick={()=>setShowCompare(false)}
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default Policies;