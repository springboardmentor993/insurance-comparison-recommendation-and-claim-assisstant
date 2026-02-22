import React, { useState, useEffect } from "react";
import "./UserPreferences.css";

function UserPreferences() {

  const [isSaved, setIsSaved] = useState(false);

  const [preferences, setPreferences] = useState({
    smoking: "",
    alcohol: "",
    medicalConditions: "",
    riskAppetite: "",
    monthlyBudget: "",
    financialGoal: "",
    dependents: "",
    responsibility: ""
  });

  /* Load saved data */
  useEffect(() => {
    const saved = localStorage.getItem("trustsure_preferences");
    if (saved) {
      setPreferences(JSON.parse(saved));
      setIsSaved(true);
    }
  }, []);

  const handleChange = (e) => {
    setPreferences({
      ...preferences,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    localStorage.setItem("trustsure_preferences", JSON.stringify(preferences));
    setIsSaved(true);
  };

  const handleReset = () => {
    localStorage.removeItem("trustsure_preferences");
    setPreferences({
      smoking: "",
      alcohol: "",
      medicalConditions: "",
      riskAppetite: "",
      monthlyBudget: "",
      financialGoal: "",
      dependents: "",
      responsibility: ""
    });
    setIsSaved(false);
  };

  return (
    <div className="preferences-page">

      {!isSaved ? (
        <div className="preferences-form-card">

          <h2>Insurance Risk Profile</h2>

          <label>Smoking Habit</label>
          <select name="smoking" value={preferences.smoking} onChange={handleChange}>
            <option value="">Select</option>
            <option>Yes</option>
            <option>No</option>
          </select>

          <label>Alcohol Consumption</label>
          <select name="alcohol" value={preferences.alcohol} onChange={handleChange}>
            <option value="">Select</option>
            <option>Yes</option>
            <option>No</option>
          </select>

          <label>Existing Medical Conditions</label>
          <input
            type="text"
            name="medicalConditions"
            value={preferences.medicalConditions}
            onChange={handleChange}
          />

          <label>Risk Appetite</label>
          <select name="riskAppetite" value={preferences.riskAppetite} onChange={handleChange}>
            <option value="">Select</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <label>Monthly Insurance Budget (₹)</label>
          <input
            type="number"
            name="monthlyBudget"
            value={preferences.monthlyBudget}
            onChange={handleChange}
          />

          <label>Primary Financial Goal</label>
          <select name="financialGoal" value={preferences.financialGoal} onChange={handleChange}>
            <option value="">Select</option>
            <option>Protection</option>
            <option>Wealth Creation</option>
            <option>Retirement Planning</option>
          </select>

          <label>Number of Dependents</label>
          <input
            type="number"
            name="dependents"
            value={preferences.dependents}
            onChange={handleChange}
          />

          <label>Primary Responsibility</label>
          <select name="responsibility" value={preferences.responsibility} onChange={handleChange}>
            <option value="">Select</option>
            <option>Self</option>
            <option>Family</option>
            <option>Business</option>
          </select>

          <button className="save-btn" onClick={handleSave}>
            Save Preferences
          </button>

        </div>
      ) : (
        <div className="preferences-summary-card">

          <div className="icon">📊</div>
          <h2>Your Risk Profile</h2>

          <div className="summary-grid">
            <div><strong>Smoking:</strong> {preferences.smoking}</div>
            <div><strong>Alcohol:</strong> {preferences.alcohol}</div>
            <div><strong>Medical Conditions:</strong> {preferences.medicalConditions}</div>
            <div><strong>Risk Appetite:</strong> {preferences.riskAppetite}</div>
            <div><strong>Monthly Budget:</strong> ₹{preferences.monthlyBudget}</div>
            <div><strong>Financial Goal:</strong> {preferences.financialGoal}</div>
            <div><strong>Dependents:</strong> {preferences.dependents}</div>
            <div><strong>Responsibility:</strong> {preferences.responsibility}</div>
          </div>

          <button className="reset-btn" onClick={handleReset}>
            Reset Preferences
          </button>

        </div>
      )}

    </div>
  );
}

export default UserPreferences;