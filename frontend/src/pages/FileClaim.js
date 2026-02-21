import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function FileClaim() {

  const navigate = useNavigate();
  const location = useLocation();

  const [policies, setPolicies] = useState([]);
  const [form, setForm] = useState({
    policyId: "",
    claimType: "",
    incidentDate: "",
    amount: "",
    description: ""
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("purchasedPolicies")) || [];
    setPolicies(stored);

    if (location.state?.purchaseId) {
      setForm(prev => ({
        ...prev,
        policyId: location.state.purchaseId
      }));
    }
  }, []);

  const handleSubmit = () => {
  if (!form.policyId || !form.claimType || !form.incidentDate || !form.amount) {
    alert("Please fill all required fields");
    return;
  }

  // Save claim details temporarily
  localStorage.setItem("currentClaim", JSON.stringify(form));

  // Navigate to upload page
  navigate("/upload-documents");
};

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(to right, #3a7bd5, #00d2ff)",
      padding: "40px"
    }}>

      <div style={{
        maxWidth: "700px",
        margin: "auto",
        background: "white",
        padding: "30px",
        borderRadius: "10px"
      }}>

        <h2>File Insurance Claim</h2>

        <p>Step 1: Claim Details</p>

        {/* Select Policy */}
        <select
          value={form.policyId}
          onChange={e => setForm({...form, policyId: e.target.value})}
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        >
          <option value="">Select Policy</option>
          {policies.map(p => (
            <option key={p.purchase_id} value={p.purchase_id}>
              {p.title} (Policy No: {p.policy_number})
            </option>
          ))}
        </select>

        {/* Claim Type */}
        <select
          value={form.claimType}
          onChange={e => setForm({...form, claimType: e.target.value})}
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        >
          <option value="">Select Type of incident</option>
          <option value="Accident">Accident</option>
          <option value="Medical">Medical Problem</option>
          <option value="Other">Other</option>
        </select>

        {/* Incident Date */}
        <input
          type="date"
          value={form.incidentDate}
          onChange={e => setForm({...form, incidentDate: e.target.value})}
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        />

        {/* Amount */}
        <input
          type="number"
          placeholder="Amount Claimed"
          value={form.amount}
          onChange={e => setForm({...form, amount: e.target.value})}
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        />

        {/* Description */}
        <textarea
          placeholder="Describe the incident (optional)"
          value={form.description}
          onChange={e => setForm({...form, description: e.target.value})}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "20px",
            height: "100px"
          }}
        />

        <button
          onClick={handleSubmit}
          style={{
            backgroundColor: "#1e3c72",
            color: "white",
            padding: "12px 25px",
            border: "none",
            cursor: "pointer"
          }}
        >
          Continue to Uploads →
        </button>

      </div>

    </div>
  );
}

export default FileClaim;