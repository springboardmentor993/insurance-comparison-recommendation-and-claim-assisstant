import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

function normalize(text = "") {
  return text.toLowerCase().replace(/\s+/g, "-");
}

function CategoryPolicies() {
  const { type } = useParams();
  const [policies, setPolicies] = useState([]);

  console.log("URL param type =", type);

  useEffect(() => {
    if (!type) return;

    fetch("http://127.0.0.1:8000/policies")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter(
          (p) => normalize(p.policy_type) === type
        );
        setPolicies(filtered);
      });
  }, [type]);

  if (!type) return <h2 style={{ textAlign: "center" }}>Invalid Category</h2>;

  return (
    <div style={{ padding: "30px" }}>
      <h2>{type.replaceAll("-", " ")} Policies</h2>

      {policies.length === 0 && <p>No policies yet.</p>}

      {policies.map((p) => (
        <div
          key={p.id}
          style={{
            background: "white",
            padding: "15px",
            marginBottom: "10px",
            borderRadius: "10px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          <h4>{p.title}</h4>
          <p>Provider ID: {p.provider_id}</p>
          <p>Premium: ₹{p.premium}</p>

          <Link to={`/policy/${p.id}`}>View Details</Link>
        </div>
      ))}
    </div>
  );
}

export default CategoryPolicies;

