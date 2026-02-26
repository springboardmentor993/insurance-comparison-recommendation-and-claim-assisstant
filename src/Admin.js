import { useEffect, useState } from "react";

function Admin() {
  const [providers, setProviders] = useState([]);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    provider_id: "",
    policy_type: "health",
    title: "",
    premium: "",
    term_months: "",
    deductible: "",
    tnc_url: "",
    coverage: ""
  });

  useEffect(() => {
    fetch("http://127.0.0.1:8000/providers")
      .then(res => res.json())
      .then(data => setProviders(data));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 AUTO EXTRACT FROM LINK
  const handleExtract = async () => {
    if (!url) {
      alert("Paste a policy link first");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/extract-policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      const data = await res.json();

      setForm((prev) => ({
        ...prev,
        title: data.title || "",
        premium: data.premium_guess
          ? data.premium_guess.replace(/[^0-9]/g, "")
          : "",
        tnc_url: url
      }));

    } catch (err) {
      alert("Extraction failed");
      console.log(err);
    }

    setLoading(false);
  };

  // ➕ ADD POLICY TO DATABASE
  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        provider_id: Number(form.provider_id),
        premium: Number(form.premium),
        term_months: Number(form.term_months),
        deductible: Number(form.deductible),
        coverage: JSON.parse(form.coverage || "{}")
      };

      await fetch("http://127.0.0.1:8000/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      alert("Policy Added!");

    } catch (err) {
      alert("Invalid data. Check coverage JSON.");
      console.log(err);
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Add New Policy (Admin)</h1>

      <input
        placeholder="Paste policy page link"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: "400px", padding: "8px" }}
      />

      <button
        onClick={handleExtract}
        disabled={loading}
        style={{ marginLeft: "10px" }}
      >
        {loading ? "Extracting..." : "Auto Fill"}
      </button>

      <hr style={{ margin: "30px 0" }} />

      <select name="provider_id" onChange={handleChange}>
        <option value="">Select Provider</option>
        {providers.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select><br /><br />

      <input name="title" placeholder="Policy Title" value={form.title} onChange={handleChange} /><br /><br />

      <select name="policy_type" value={form.policy_type} onChange={handleChange}>
        <option value="health">Health</option>
        <option value="auto">Auto</option>
        <option value="life">Life</option>
      </select><br /><br />

      <input name="premium" placeholder="Premium" value={form.premium} onChange={handleChange} /><br /><br />
      <input name="term_months" placeholder="Term (months)" onChange={handleChange} /><br /><br />
      <input name="deductible" placeholder="Deductible" onChange={handleChange} /><br /><br />
      <input name="tnc_url" placeholder="T&C URL" value={form.tnc_url} onChange={handleChange} /><br /><br />

      <textarea
        name="coverage"
        placeholder='Coverage JSON e.g {"sum_insured":"5L"}'
        onChange={handleChange}
      /><br /><br />

      <button onClick={handleSubmit}>Add Policy</button>
    </div>
  );
}

export default Admin;

