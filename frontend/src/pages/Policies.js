import { useState, useEffect } from "react";
import "./Policies.css";
import { BASE_URL } from "../api";

function Policies({ onLogout, goToRiskProfile }) {
  const [policies, setPolicies] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [loading, setLoading] = useState(true);

  const [coverage, setCoverage] = useState(100000);
  const [riskLevel, setRiskLevel] = useState("medium");

  const [currentPage, setCurrentPage] = useState(1);
  const policiesPerPage = 6;

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      onLogout();
      return;
    }

    const fetchPolicies = async () => {
      const response = await fetch(`${BASE_URL}/policies`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      setPolicies(Array.isArray(data) ? data : []);
      setLoading(false);
    };

    fetchPolicies();
  }, [onLogout]);

  const getRiskMultiplier = () => {
    if (riskLevel === "low") return 1.05;
    if (riskLevel === "medium") return 1.1;
    if (riskLevel === "high") return 1.2;
    return 1;
  };

  const calculatePremium = (basePremium) => {
    return (
      Number(basePremium) *
      getRiskMultiplier() *
      (coverage / 100000)
    ).toFixed(2);
  };

  const filteredPolicies =
    selectedCategory === "all"
      ? policies
      : policies.filter((p) => p.policy_type === selectedCategory);

  const indexOfLast = currentPage * policiesPerPage;
  const indexOfFirst = indexOfLast - policiesPerPage;
  const currentPolicies = filteredPolicies.slice(
    indexOfFirst,
    indexOfLast
  );
  const totalPages = Math.ceil(filteredPolicies.length / policiesPerPage);

  const togglePolicy = (policy) => {
    const exists = selectedPolicies.find((p) => p.id === policy.id);

    if (exists) {
      setSelectedPolicies(
        selectedPolicies.filter((p) => p.id !== policy.id)
      );
    } else {
      if (selectedPolicies.length === 3) {
        alert("Maximum 3 policies allowed");
        return;
      }
      setSelectedPolicies([...selectedPolicies, policy]);
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <div className="policies-container">

      <div className="policies-header">
        <h2>Insurance Policies</h2>
        <div>
          <button className="preferences-btn" onClick={goToRiskProfile}>
            Preferences
          </button>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {!showCompare && (
        <>
          <div className="calculator-box">
            <h3>Premium Calculator</h3>
            <div className="calculator-row">
              <div>
                <label>Coverage</label>
                <input
                  type="number"
                  value={coverage}
                  onChange={(e) => setCoverage(Number(e.target.value))}
                />
              </div>
              <div>
                <label>Risk</label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          <div className="category-buttons">
            {["all", "health", "travel", "auto", "home", "life"].map(
              (cat) => (
                <button
                  key={cat}
                  className={selectedCategory === cat ? "active" : ""}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentPage(1);
                  }}
                >
                  {cat}
                </button>
              )
            )}
          </div>

          <button
            className="compare-btn"
            disabled={selectedPolicies.length < 2}
            onClick={() => setShowCompare(true)}
          >
            Compare ({selectedPolicies.length})
          </button>

          <div className="policy-grid">
            {currentPolicies.map((policy) => {
              const isSelected = selectedPolicies.some(
                (p) => p.id === policy.id
              );

              return (
                <div
                  key={policy.id}
                  className={`policy-card ${isSelected ? "selected" : ""}`}
                  onClick={() => togglePolicy(policy)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    className="checkbox-top"
                  />

                  <h4>{policy.title}</h4>

                  <p className="base">
                    ₹{policy.premium}
                  </p>

                  <p className="estimated">
                    Estimated ₹{calculatePremium(policy.premium)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>

            <span>
              Page {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}

      {showCompare && (
  <div className="comparison-wrapper">
    <h2 className="comparison-title">Policy Comparison</h2>

    <div className="comparison-grid">
      {selectedPolicies.map((policy) => (
        <div key={policy.id} className="comparison-card">
          <h3>{policy.title}</h3>

          <div className="compare-row">
            <span>Base Premium</span>
            <strong>₹{policy.premium}</strong>
          </div>

          <div className="compare-row">
            <span>Estimated Premium</span>
            <strong className="highlight">
              ₹{calculatePremium(policy.premium)}
            </strong>
          </div>

          <div className="compare-row">
            <span>Deductible</span>
            <strong>₹{policy.deductible}</strong>
          </div>
        </div>
      ))}
    </div>

    <button
      className="back-btn"
      onClick={() => setShowCompare(false)}
    >
      Back to Policies
    </button>
  </div>
)}

    </div>
  );
}

export default Policies;
