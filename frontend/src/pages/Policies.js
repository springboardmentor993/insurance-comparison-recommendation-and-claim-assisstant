import { useState, useEffect } from "react";
import "./Policies.css";
import { BASE_URL } from "../api";

function Policies({
  onLogout,
  goToRiskProfile,
  goToRecommendations,
  goToUpload,
  goToClaims
}) {
  const [policies, setPolicies] = useState([]);
  const [userPolicies, setUserPolicies] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [loading, setLoading] = useState(true);

  const [coverage, setCoverage] = useState(100000);
  const [riskLevel, setRiskLevel] = useState("medium");

  const token = localStorage.getItem("token");

  // ================================
  // FETCH POLICIES + USERPOLICIES
  // ================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const policiesRes = await fetch(`${BASE_URL}/policies`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userPoliciesRes = await fetch(`${BASE_URL}/userpolicies/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const policiesData = await policiesRes.json();
        const userPoliciesData = await userPoliciesRes.json();

        setPolicies(Array.isArray(policiesData) ? policiesData : []);
        setUserPolicies(Array.isArray(userPoliciesData) ? userPoliciesData : []);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // ================================
  // PREMIUM CALCULATOR
  // ================================
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

  // ================================
  // FILTER
  // ================================
  const filteredPolicies =
    selectedCategory === "all"
      ? policies
      : policies.filter((p) => p.policy_type === selectedCategory);

  // ================================
  // SELECT FOR COMPARE
  // ================================
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

  // ================================
  // CREATE CLAIM (FIXED DYNAMIC)
  // ================================
  const handleCreateClaim = async (policyId) => {
    try {
      // 🔥 Find purchased policy
      const userPolicy = userPolicies.find(
        (up) => up.policy_id === policyId
      );

      if (!userPolicy) {
        alert("You have not purchased this policy.");
        return;
      }

      const response = await fetch(`${BASE_URL}/claims/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_policy_id: userPolicy.id,
          claim_type: "general",
          incident_date: new Date().toISOString().split("T")[0],
          amount_claimed: 1000,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Claim creation failed");
        return;
      }

      goToUpload(data.id);

    } catch (error) {
      console.error(error);
      alert("Error creating claim");
    }
  };

  if (loading) return <p className="loading-text">Loading policies...</p>;

  return (
    <div className="policies-container">

      <div className="policies-header">
        <h2>Insurance Policies</h2>
        <div>
          <button onClick={goToRiskProfile}>Preferences</button>
          <button onClick={goToRecommendations}>Recommendations</button>
          <button onClick={goToClaims}>My Claims</button>
          <button onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="policy-grid">
        {filteredPolicies.map((policy) => {
          const isSelected = selectedPolicies.some(
            (p) => p.id === policy.id
          );

          return (
            <div
              key={policy.id}
              className={`policy-card ${isSelected ? "selected" : ""}`}
              onClick={() => togglePolicy(policy)}
            >
              <h4>{policy.title}</h4>
              <p>Type: {policy.policy_type}</p>
              <p>Base ₹{policy.premium}</p>
              <p>Estimated ₹{calculatePremium(policy.premium)}</p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateClaim(policy.id);
                }}
              >
                Upload Claim
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default Policies;
