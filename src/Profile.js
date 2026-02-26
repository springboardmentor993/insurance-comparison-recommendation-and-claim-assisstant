import { useState } from "react";

function Profile() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    age: "",
    profession: "",
    family: [],
    health: []
  });

  const email = "test@example.com"; // change later to logged-in user

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckbox = (e, field) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({
        ...formData,
        [field]: [...formData[field], value]
      });
    } else {
      setFormData({
        ...formData,
        [field]: formData[field].filter((item) => item !== value)
      });
    }
  };

  const handleSubmit = async () => {
    const payload = {
      name: formData.name,
      dob: null,
      risk_profile: {
        age: formData.age,
        phone: formData.phone,
        profession: formData.profession,
        family_coverage: formData.family,
        health_conditions: formData.health
      }
    };

    await fetch(`http://127.0.0.1:8000/user/${email}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    alert("Profile Saved Successfully!");
  };

  const handleReset = () => {
    setFormData({
      name: "",
      phone: "",
      age: "",
      profession: "",
      family: [],
      health: []
    });
  };

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "auto" }}>
      <h2>Create Your Insurance Profile</h2>

      <input
        type="text"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
      />
      <br /><br />

      <input
        type="text"
        name="phone"
        placeholder="Phone Number"
        value={formData.phone}
        onChange={handleChange}
      />
      <br /><br />

      <input
        type="number"
        name="age"
        placeholder="Age"
        value={formData.age}
        onChange={handleChange}
      />
      <br /><br />

      <h4>Profession</h4>
      {["Student", "Working Professional", "Self Employed", "Business Owner"].map((p) => (
        <label key={p} style={{ marginRight: "10px" }}>
          <input
            type="radio"
            name="profession"
            value={p}
            onChange={handleChange}
          />
          {p}
        </label>
      ))}

      <h4>Family Coverage</h4>
      {["Spouse", "Children", "Parents", "Siblings"].map((f) => (
        <label key={f} style={{ marginRight: "10px" }}>
          <input
            type="checkbox"
            value={f}
            onChange={(e) => handleCheckbox(e, "family")}
          />
          {f}
        </label>
      ))}

      <h4>Health Conditions</h4>
      {["Diabetes", "Heart Issues", "Asthma", "None"].map((h) => (
        <label key={h} style={{ marginRight: "10px" }}>
          <input
            type="checkbox"
            value={h}
            onChange={(e) => handleCheckbox(e, "health")}
          />
          {h}
        </label>
      ))}

      <br /><br />

      <button onClick={handleSubmit} style={{ marginRight: "10px" }}>
        Save Profile
      </button>

      <button onClick={handleReset}>
        Reset Profile
      </button>
    </div>
  );
}

export default Profile;
