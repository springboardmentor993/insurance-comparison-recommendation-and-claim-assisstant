import { useEffect, useState } from "react";

function Recommendations() {
  const [policies, setPolicies] = useState([]);
  const [selected, setSelected] = useState([]);
  const [user, setUser] = useState(null);

  const email = "admin@policynest.com"; // change later

  useEffect(() => {
    fetch("http://127.0.0.1:8000/policies")
      .then(res => res.json())
      .then(data => setPolicies(data));

    fetch(`http://127.0.0.1:8000/user/${email}`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  const handleSelect = (policy) => {
    if (selected.find(p => p.id === policy.id)) {
      setSelected(selected.filter(p => p.id !== policy.id));
    } else {
      if (selected.length < 5) {
        setSelected([...selected, policy]);
      } else {
        alert("Maximum 5 policies allowed");
      }
    }
  };

  // ✅ AUTO RECOMMENDATION LOGIC
  const getRecommendedPolicy = () => {
    if (!user || !user.risk_profile || selected.length === 0) return null;

    const age = parseInt(user.risk_profile.age);
    const healthConditions = user.risk_profile.health_conditions || [];

    let recommended = null;

    // Rule 1: Health condition → lowest deductible
    if (healthConditions.length > 0 && !healthConditions.includes("None")) {
      recommended = selected.reduce((prev, curr) =>
        Number(curr.deductible) < Number(prev.deductible) ? curr : prev
      );
    }

    // Rule 2: Age < 30 → lowest premium
    else if (age < 30) {
      recommended = selected.reduce((prev, curr) =>
        Number(curr.premium) < Number(prev.premium) ? curr : prev
      );
    }

    // Rule 3: Age >= 30 → highest term
    else {
      recommended = selected.reduce((prev, curr) =>
        Number(curr.term_months) > Number(prev.term_months) ? curr : prev
      );
    }

    return recommended;
  };

  const recommendedPolicy = getRecommendedPolicy();
console.log("USER:", user);
console.log("SELECTED:", selected);
console.log("RECOMMENDED:", recommendedPolicy);
  return (
    <div style={{ padding: "40px" }}>
      <h1>🤖 Smart Recommendations</h1>

      {user?.risk_profile ? (
        <p>Profile Loaded ✔</p>
      ) : (
        <p style={{ color: "red" }}>
          Please complete your profile first.
        </p>
      )}

      <h2>Select Policies to Compare</h2>

      {policies.map(policy => (
        <div
          key={policy.id}
          style={{
            background: "#fff",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "8px"
          }}
        >
          <h4>{policy.title}</h4>
          <p>Type: {policy.policy_type}</p>
          <p>Premium: ₹{policy.premium}</p>

          <button onClick={() => handleSelect(policy)}>
            {selected.find(p => p.id === policy.id)
              ? "Remove"
              : "Compare"}
          </button>
        </div>
      ))}

      {selected.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <h2>📊 Policy Comparison</h2>

          <table
            border="1"
            cellPadding="10"
            style={{ width: "100%", textAlign: "center" }}
          >
            <thead>
              <tr>
                <th>Feature</th>
                {selected.map(policy => {
                  const isRecommended =
                    recommendedPolicy &&
                    recommendedPolicy.id === policy.id;

                  return (
                    <th
                      key={policy.id}
                      style={{
                        backgroundColor: isRecommended
                          ? "#d4edda"
                          : "white"
                      }}
                    >
                      {policy.title}
                      {isRecommended && (
                        <div
                          style={{
                            color: "green",
                            fontSize: "14px",
                            marginTop: "5px"
                          }}
                        >
                          ⭐ Recommended Policy
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              <tr>
                <td><b>Type</b></td>
                {selected.map(policy => {
                  const isRecommended =
                    recommendedPolicy &&
                    recommendedPolicy.id === policy.id;

                  return (
                    <td
                      key={policy.id}
                      style={{
                        backgroundColor: isRecommended
                          ? "#d4edda"
                          : "white"
                      }}
                    >
                      {policy.policy_type}
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td><b>Premium</b></td>
                {selected.map(policy => {
                  const isRecommended =
                    recommendedPolicy &&
                    recommendedPolicy.id === policy.id;

                  return (
                    <td
                      key={policy.id}
                      style={{
                        backgroundColor: isRecommended
                          ? "#d4edda"
                          : "white"
                      }}
                    >
                      ₹{policy.premium}
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td><b>Term (Months)</b></td>
                {selected.map(policy => {
                  const isRecommended =
                    recommendedPolicy &&
                    recommendedPolicy.id === policy.id;

                  return (
                    <td
                      key={policy.id}
                      style={{
                        backgroundColor: isRecommended
                          ? "#d4edda"
                          : "white"
                      }}
                    >
                      {policy.term_months}
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td><b>Deductible</b></td>
                {selected.map(policy => {
                  const isRecommended =
                    recommendedPolicy &&
                    recommendedPolicy.id === policy.id;

                  return (
                    <td
                      key={policy.id}
                      style={{
                        backgroundColor: isRecommended
                          ? "#d4edda"
                          : "white"
                      }}
                    >
                      {policy.deductible}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Recommendations;