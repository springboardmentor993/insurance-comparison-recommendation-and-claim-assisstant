import { useState } from "react";
import "./Auth.css";

function Signup({ goToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async () => {
    // 1️⃣ Basic validation
    if (!name || !email || !dob || !password) {
      alert("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // 2️⃣ Data to send
    const signupData = {
      name: name.trim(),
      email: email.trim(),
      dob,
      password
    };

    try {
      // 3️⃣ API call to FastAPI
      const response = await fetch("http://127.0.0.1:8000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(signupData)
      });

      const data = await response.json();

      if (!response.ok) {
        alert("Signup failed");
        return;
      }

      // 4️⃣ Success
      alert("Signup successful");
      console.log(data);
      goToLogin();

    } catch (error) {
      console.error("Signup error:", error);
      alert("Server error");
    }
  };

  return (
    <div className="auth-container">
      <h1 className="app-title">CoverMate</h1>
      <p className="app-subtitle">
        Insurance Comparison & Claim Assistant
      </p>

      <h2>Signup</h2>

      <input
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button className="primary-btn" onClick={handleSignup}>
        Signup
      </button>

      <button className="secondary-btn" onClick={goToLogin}>
        Back to Login
      </button>
    </div>
  );
}

export default Signup;
