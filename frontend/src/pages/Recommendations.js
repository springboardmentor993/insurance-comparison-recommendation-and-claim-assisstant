import { useEffect, useState } from "react";
import { BASE_URL } from "../api";
import "./Recommendations.css";

function Recommendations({ userId, onBack }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !userId) {
      window.location.reload();
      return;
    }

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${BASE_URL}/users/${userId}/recommendations`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user_id");
          window.location.reload();
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch recommendations");
        }

        const data = await response.json();
        setRecommendations(data.top_recommendations || []);
      } catch (err) {
        setError("Unable to load recommendations");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId]);

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading recommendations...</p>;
  }

  if (error) {
    return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  }

  return (
    <div className="recommendations-container">
      <div className="recommendations-header">
        <h2 className="recommendations-title">
          Top Recommended Policies
        </h2>
        <button className="back-btn" onClick={onBack}>
          Back
        </button>
      </div>

      {recommendations.map((policy) => (
        <div key={policy.id} className="recommendation-card">
          <div className="policy-name">{policy.title}</div>

          <div className="policy-details">
            Type: {policy.policy_type}
          </div>

          <div className="policy-details">
            Premium: ₹{policy.premium}
          </div>

          <div className="policy-details">
            Deductible: ₹{policy.deductible}
          </div>

          <div className="score-badge">
            Score: {policy.score} / 100
          </div>

          <div className="reason-text">
            {policy.reason}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Recommendations;
