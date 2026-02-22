import React, { useState, useEffect } from "react";
import "./Profile.css";

function Profile() {

  const [isSaved, setIsSaved] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    age: "",
    occupation: "",
    city: "",
    income: "",
  });

  /* Load saved profile on page load */
  useEffect(() => {
    const savedProfile = localStorage.getItem("trustsure_profile");

    if (savedProfile) {
      setFormData(JSON.parse(savedProfile));
      setIsSaved(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    localStorage.setItem("trustsure_profile", JSON.stringify(formData));
    setIsSaved(true);
  };

  const handleReset = () => {
    localStorage.removeItem("trustsure_profile");

    setFormData({
      name: "",
      dob: "",
      age: "",
      occupation: "",
      city: "",
      income: "",
    });

    setIsSaved(false);
  };

  return (
    <div className="profile-page">

      {!isSaved ? (
        <div className="profile-form-card">
          <h2>User Details</h2>

          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />

          <label>Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
          />

          <label>Age</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
          />

          <label>Occupation</label>
          <input
            type="text"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
          />

          <label>City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />

          <label>Annual Income (₹)</label>
          <input
            type="number"
            name="income"
            value={formData.income}
            onChange={handleChange}
          />

          <button className="save-btn" onClick={handleSave}>
            Save Profile
          </button>
        </div>
      ) : (
        <div className="profile-summary-card">
          <div className="user-icon">👤</div>

          <h2>{formData.name}</h2>

          <div className="summary-grid">
            <div><strong>DOB:</strong> {formData.dob}</div>
            <div><strong>Age:</strong> {formData.age}</div>
            <div><strong>Occupation:</strong> {formData.occupation}</div>
            <div><strong>City:</strong> {formData.city}</div>
            <div><strong>Annual Income:</strong> ₹{formData.income}</div>
          </div>

          <button className="reset-btn" onClick={handleReset}>
            Reset Profile
          </button>
        </div>
      )}

    </div>
  );
}

export default Profile;
