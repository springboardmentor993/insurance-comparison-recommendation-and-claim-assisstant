import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function PolicyDetails() {
  const { id } = useParams();
  const [policy, setPolicy] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/policies`)
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((p) => p.id === parseInt(id));
        setPolicy(found);
      });
  }, [id]);

  if (!policy) return <h2 style={{ textAlign: "center" }}>Loading...</h2>;

  return (
    <div style={{ padding: "40px", background: "#f4f7fb", minHeight: "100vh" }}>
      <h1>{policy.title}</h1>

      <p><b>Type:</b> {policy.policy_type}</p>
      <p><b>Premium:</b> ₹{policy.premium}</p>
      <p><b>Term:</b> {policy.term_months} months</p>

      <h3>Coverage</h3>
      {Object.entries(policy.coverage || {}).map(([k, v]) => (
        <p key={k}>{k}: {v}</p>
      ))}

      <br />
      <a href={policy.tnc_url} target="_blank" rel="noreferrer">
        Terms & Conditions
      </a>

      <br /><br />
      <button
        onClick={() => window.history.back()}
        style={{
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          background: "#4f46e5",
          color: "white",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>
    </div>
  );
}

export default PolicyDetails;

