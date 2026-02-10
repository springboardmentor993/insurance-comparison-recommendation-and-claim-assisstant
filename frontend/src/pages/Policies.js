import { useState, useEffect } from "react";
import "./Policies.css";
import { BASE_URL } from "../api";

function Policies({ onLogout, goToRiskProfile }) {
  const [policies, setPolicies] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      onLogout();
      return;
    }

    const fetchPolicies = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${BASE_URL}/policies`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // 🔐 HANDLE SESSION EXPIRY
        if (response.status === 401) {
          alert("Session expired. Please login again.");
          onLogout();
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch policies");
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setPolicies(data);
        } else if (Array.isArray(data.policies)) {
          setPolicies(data.policies);
        } else {
          setPolicies([]);
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load policies. Please try again.");
        setPolicies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, [onLogout]);

  // 🔍 FILTER POLICIES
  const filteredPolicies =
    selectedCategory === "all"
      ? policies
      : policies.filter(
          (policy) => policy.policy_type === selectedCategory
        );

  // ✅ HANDLE CHECKBOX SELECTION (MAX 3)
  const handleSelectPolicy = (policy) => {
    const alreadySelected = selectedPolicies.find(
      (p) => p.id === policy.id
    );

    if (alreadySelected) {
      setSelectedPolicies(
        selectedPolicies.filter((p) => p.id !== policy.id)
      );
    } else {
      if (selectedPolicies.length === 3) {
        alert("You can compare maximum 3 policies only");
        return;
      }
      setSelectedPolicies([...selectedPolicies, policy]);
    }
  };

  // ⏳ LOADING STATE
  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading policies...</p>;
  }

  // ❌ ERROR STATE
  if (error) {
    return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  }

  return (
    <div className="policies-container">
      {/* HEADER */}
      <div className="policies-header">
        <h2 className="policies-title">Policies List</h2>

        <div>
          <button
            className="preferences-btn"
            onClick={goToRiskProfile}
          >
            Set Preferences
          </button>

          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* CATEGORY BUTTONS */}
      <div className="category-buttons">
        {["all", "health", "travel", "auto", "home", "life"].map(
          (cat) => (
            <button
              key={cat}
              className={
                selectedCategory === cat
                  ? "category-btn active"
                  : "category-btn"
              }
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedPolicies([]);
                setShowCompare(false);
              }}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          )
        )}
      </div>

      {/* COMPARE BUTTON */}
      <button
        className="compare-btn"
        disabled={selectedPolicies.length < 2}
        onClick={() => setShowCompare(true)}
      >
        Compare ({selectedPolicies.length})
      </button>

      {/* POLICY LIST */}
      {!showCompare &&
        filteredPolicies.map((policy) => (
          <div key={policy.id} className="policy-card">
            <label>
              <input
                type="checkbox"
                checked={selectedPolicies.some(
                  (p) => p.id === policy.id
                )}
                onChange={() => handleSelectPolicy(policy)}
              />{" "}
              Compare
            </label>

            <div className="policy-name">{policy.title}</div>
            <div className="policy-premium">
              Premium: ₹{policy.premium}
            </div>
          </div>
        ))}

      {/* COMPARISON TABLE */}
      {showCompare && (
        <div className="comparison-table">
          <h3>Policy Comparison</h3>

          <table>
            <thead>
              <tr>
                <th>Feature</th>
                {selectedPolicies.map((p) => (
                  <th key={p.id}>{p.title}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Policy Type</td>
                {selectedPolicies.map((p) => (
                  <td key={p.id}>{p.policy_type}</td>
                ))}
              </tr>

              <tr>
                <td>Premium</td>
                {selectedPolicies.map((p) => (
                  <td key={p.id}>₹{p.premium}</td>
                ))}
              </tr>

              <tr>
                <td>Term (Months)</td>
                {selectedPolicies.map((p) => (
                  <td key={p.id}>{p.term_months}</td>
                ))}
              </tr>

              <tr>
                <td>Deductible</td>
                {selectedPolicies.map((p) => (
                  <td key={p.id}>₹{p.deductible}</td>
                ))}
              </tr>
            </tbody>
          </table>

          <button
            className="compare-btn"
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
