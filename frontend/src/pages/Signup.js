import { useState } from "react";
import "./Auth.css";

function Signup({ goToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = () => {
    if (!name || !email || !dob || !password) {
      alert("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const signupData = {
      name: name.trim(),
      email: email.trim(),
      dob,
      password
    };

    console.log(signupData);
    alert("Signup data valid and ready for database");
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
