import React, { useEffect, useState } from "react";

function Policies() {
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/policies")
      .then((res) => res.json())
      .then((data) => setPolicies(data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div>
      <h2>All Policies</h2>
      {policies.map((policy) => (
        <div key={policy.id} style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
          <h3>{policy.title}</h3>
          <p>Type: {policy.policy_type}</p>
          <p>Premium: {policy.premium}</p>
          <p>Term: {policy.term_months} months</p>
          <p>Coverage: {JSON.stringify(policy.coverage)}</p>
          <a href={policy.tnc_url} target="_blank" rel="noreferrer">Terms & Conditions</a>
        </div>
      ))}
    </div>
  );
}

export default Policies;
