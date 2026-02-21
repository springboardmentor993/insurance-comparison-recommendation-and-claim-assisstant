import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./CategoryPolicies.css";

function CategoryPolicies() {

  const { category } = useParams();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchPolicies = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/policies/${decodeURIComponent(category)}`
        );

        const data = await res.json();

        console.log("Fetched policies:", data);

        // ✅ SAFE ARRAY HANDLING (Fix for map error)
        if (Array.isArray(data)) {
          setPolicies(data);
        } else if (data && Array.isArray(data.policies)) {
          setPolicies(data.policies);
        } else {
          setPolicies([]);
        }

        setLoading(false);

      } catch (err) {
        console.error("Error fetching policies:", err);
        setPolicies([]);
        setLoading(false);
      }
    };

    fetchPolicies();

  }, [category]);

  return (
    <div className="policy-page">

      <h1 style={{ textAlign: "center", fontSize: "34px", marginBottom: "30px" }}>
        {decodeURIComponent(category)}
      </h1>

      {loading && <p style={{ textAlign: "center" }}>Loading policies...</p>}

      {!loading && policies.length === 0 && (
        <p style={{ textAlign: "center" }}>
          No policies found in this category
        </p>
      )}

      <div className="policy-list">

        {policies.map((p) => (

          <div key={p.id} className="policy-card">

            <div className="policy-header">
              <div>
                <h2>{p.provider || p.company}</h2>
                <h3>{p.title || p.name || p.policy_name}</h3>
              </div>

              <div className="price-box">
                ₹{p.premium}/month
              </div>
            </div>

            <div className="policy-info">
              Coverage: ₹{p.coverage} Lac
            </div>

            <div className="policy-info">
              Term: {p.term_months} months
            </div>

            <div className="policy-info">
              Deductible: ₹{p.deductible}
            </div>

            <button className="view-btn">
              View Policy
            </button>

          </div>

        ))}

      </div>

    </div>
  );
}

export default CategoryPolicies;