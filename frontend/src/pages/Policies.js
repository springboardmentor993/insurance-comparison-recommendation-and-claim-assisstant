import { useState, useEffect } from "react";
import "./Policies.css";
import { BASE_URL } from "../api";

function Policies({
  onLogout,
  goToRiskProfile,
  goToRecommendations,
  goToUpload,
  goToClaims,
  goToAdmin,
  goToComparePage
}) {
  const [policies, setPolicies] = useState([]);
  const [userPolicies, setUserPolicies] = useState([]);
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("is_admin") === "true";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const policiesRes = await fetch(`${BASE_URL}/policies`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userPoliciesRes = await fetch(`${BASE_URL}/userpolicies/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPolicies(await policiesRes.json());
        setUserPolicies(await userPoliciesRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const isOwned = (policyId) =>
    userPolicies.some(up => Number(up.policy_id) === Number(policyId));

  const toggleSelect = (policy) => {
    const exists = selectedPolicies.find(p => p.id === policy.id);

    if (exists) {
      setSelectedPolicies(selectedPolicies.filter(p => p.id !== policy.id));
    } else {
      if (selectedPolicies.length >= 3)
        return alert("Maximum 3 policies allowed");
      setSelectedPolicies([...selectedPolicies, policy]);
    }
  };

  const buyPolicy = async (policyId) => {
    const response = await fetch(`${BASE_URL}/userpolicies/${policyId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    if (!response.ok) return alert(data.detail);

    alert("Policy Purchased Successfully");
    window.location.reload();
  };

  const createClaim = async (policyId) => {
    const owned = userPolicies.find(
      up => Number(up.policy_id) === Number(policyId)
    );

    if (!owned) return alert("Purchase policy first.");

    const response = await fetch(`${BASE_URL}/claims/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_policy_id: owned.id,
        claim_type: "general",
        incident_date: new Date().toISOString().split("T")[0],
        amount_claimed: 1000,
      }),
    });

    const data = await response.json();
    if (!response.ok) return alert(data.detail);

    goToUpload(data.id);
  };

  const filteredPolicies =
    activeFilter === "all"
      ? policies
      : policies.filter(p => p.policy_type === activeFilter);

  if (loading) return <p className="loading">Loading policies...</p>;

  return (
    <div className="policies-container">

      <div className="top-bar">
        <h2>Insurance Policies</h2>
        <div className="nav-buttons">
          <button onClick={goToRiskProfile}>Preferences</button>
          <button onClick={goToRecommendations}>Recommendations</button>
          <button onClick={goToClaims}>My Claims</button>
          {isAdmin && <button onClick={goToAdmin}>Admin</button>}
          <button onClick={onLogout}>Logout</button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="filter-tabs">
        {["all", "health", "life", "travel", "auto", "home"].map(type => (
          <button
            key={type}
            className={activeFilter === type ? "active-tab" : ""}
            onClick={() => setActiveFilter(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {selectedPolicies.length >= 2 && (
        <div className="compare-banner">
          <button
            onClick={() => goToComparePage(selectedPolicies)}
            className="compare-button"
          >
            Compare {selectedPolicies.length} Policies
          </button>
        </div>
      )}

      <div className="policy-grid">
        {filteredPolicies.map(policy => {
          const selected = selectedPolicies.some(p => p.id === policy.id);

          return (
            <div
              key={policy.id}
              className={`policy-card ${selected ? "selected-card" : ""}`}
              onClick={() => toggleSelect(policy)}
            >
              <div className="card-header">
                <h4>{policy.title}</h4>
                <span className="policy-type">{policy.policy_type}</span>
              </div>

              <div className="price">₹{policy.premium}</div>

              <div
                className="card-actions"
                onClick={(e) => e.stopPropagation()}
              >
                {!isOwned(policy.id) ? (
                  <button
                    className="buy-btn"
                    onClick={() => buyPolicy(policy.id)}
                  >
                    Buy Policy
                  </button>
                ) : (
                  <button className="owned-btn">Purchased</button>
                )}

                <button
                  className="claim-btn"
                  onClick={() => createClaim(policy.id)}
                >
                  Upload Claim
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Policies;