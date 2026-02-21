import { useState, useEffect } from "react";
import "./Profile.css";

function Profile() {

  const emptyForm = {
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    dob: "",
    smoking: "No",
    alcohol: "No",
    family: [],
    budget: 2000,
    coverage: "₹10L",
    medicalCondition: "",
    riskAppetite: "Medium",
    financialGoal: "Protection",
    dependents: "0",
    responsibility: "Self"
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const saved = localStorage.getItem("profile");
    if (saved) setForm(JSON.parse(saved));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (e) => {
    const value = e.target.value;
    const list = form.family;

    if (list.includes(value)) {
      setForm({ ...form, family: list.filter(v => v !== value) });
    } else {
      setForm({ ...form, family: [...list, value] });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem("profile", JSON.stringify(form));
    alert("Profile saved ✅");
  };

  const handleReset = () => {
    localStorage.removeItem("profile");
    setForm(emptyForm);
  };

  return (
    <div className="profile-page">

      <form onSubmit={handleSave} className="profile-layout">

        {/* LEFT — USER DETAILS */}
        <div className="profile-card">
          <h3>User Details</h3>

          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} />

          <label>Email</label>
          <input name="email" value={form.email} onChange={handleChange} />

          <label>Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} />

          <label>Phone Number</label>
          <input name="phone" value={form.phone} onChange={handleChange} />

          <label>City</label>
          <input name="city" value={form.city} onChange={handleChange} />

          <label>Date of Birth</label>
          <input type="date" name="dob" value={form.dob} onChange={handleChange} />
        </div>

        {/* RIGHT — RISK PROFILE */}
        <div className="profile-card">
          <h3>Risk Profile & Insurance Suitability</h3>

          <h4 style={{ marginTop: "15px" }}>Health Risk Indicators</h4>

          <label>Smoking Habit</label>
          <select name="smoking" value={form.smoking} onChange={handleChange}>
            <option>No</option>
            <option>Occasionally</option>
            <option>Yes</option>
          </select>

          <label>Alcohol Consumption</label>
          <select name="alcohol" value={form.alcohol} onChange={handleChange}>
            <option>No</option>
            <option>Occasionally</option>
            <option>Regular</option>
          </select>

          <label>Existing Medical Conditions</label>
          <input
            name="medicalCondition"
            value={form.medicalCondition}
            onChange={handleChange}
            placeholder="e.g. Diabetes, BP, Asthma"
          />

          <h4 style={{ marginTop: "20px" }}>Financial Risk Appetite</h4>

          <label>Risk Appetite</label>
          <select
            name="riskAppetite"
            value={form.riskAppetite}
            onChange={handleChange}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <label>Monthly Insurance Budget: ₹{form.budget}</label>
          <input
            type="range"
            min="3200"
            max="26000"
            step="500"
            name="budget"
            value={form.budget}
            onChange={handleChange}
          />

          <label>Primary Financial Goal</label>
          <select
            name="financialGoal"
            value={form.financialGoal}
            onChange={handleChange}
          >
            <option>Protection</option>
            <option>Wealth Creation</option>
            <option>Retirement Planning</option>
            <option>Child Future Planning</option>
          </select>

          <h4 style={{ marginTop: "20px" }}>Dependents & Responsibility</h4>

          <label>Number of Dependents</label>
          <select
            name="dependents"
            value={form.dependents}
            onChange={handleChange}
          >
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3+</option>
          </select>

          <label>Primary Responsibility</label>
          <select
            name="responsibility"
            value={form.responsibility}
            onChange={handleChange}
          >
            <option>Self</option>
            <option>Family</option>
            <option>Parents</option>
          </select>

          <button className="save-btn">Save Profile</button>
          <button type="button" className="reset-btn" onClick={handleReset}>
            Reset Profile
          </button>
        </div>

      </form>

    </div>
  );
}

export default Profile;