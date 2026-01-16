import { useState, useEffect } from "react";
import "./Policies.css";

function Policies({ onLogout }) {
  const [policies, setPolicies] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/policies")
      .then((response) => response.json())
      .then((data) => {
        setPolicies(data);
      });
  }, []);

  // FILTER LOGIC
  const filteredPolicies =
    selectedCategory === "all"
      ? policies
      : policies.filter(
          (policy) => policy.policy_type === selectedCategory
        );

  return (
    <div className="policies-container">
      {/* HEADER */}
      <div className="policies-header">
        <h2 className="policies-title">Policies List</h2>
        <button className="logout-btn" onClick={onLogout}>
          Back to Login
        </button>
      </div>

      {/* CATEGORY BUTTONS */}
      <div className="category-buttons">
  <button
    className={selectedCategory === "all" ? "category-btn active" : "category-btn"}
    onClick={() => setSelectedCategory("all")}
  >
    All
  </button>

  <button
    className={selectedCategory === "health" ? "category-btn active" : "category-btn"}
    onClick={() => setSelectedCategory("health")}
  >
    Health
  </button>

  <button
    className={selectedCategory === "travel" ? "category-btn active" : "category-btn"}
    onClick={() => setSelectedCategory("travel")}
  >
    Travel
  </button>

  <button
    className={selectedCategory === "auto" ? "category-btn active" : "category-btn"}
    onClick={() => setSelectedCategory("auto")}
  >
    Auto
  </button>

  <button
    className={selectedCategory === "home" ? "category-btn active" : "category-btn"}
    onClick={() => setSelectedCategory("home")}
  >
    Home
  </button>

  <button
    className={selectedCategory === "life" ? "category-btn active" : "category-btn"}
    onClick={() => setSelectedCategory("life")}
  >
    Life
  </button>
</div>


      {/* POLICIES LIST */}
      {filteredPolicies.map((policy) => (
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
