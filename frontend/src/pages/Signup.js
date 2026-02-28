import { useState } from "react";
import "./Auth.css";
import { BASE_URL } from "../api";

function Signup({ goToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");

    if (!name || !email || !dob || !password) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const signupData = {
      name: name.trim(),
      email: email.trim(),
      dob,
      password,
    };

    try {
      setLoading(true);

      const response = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });

      if (!response.ok) {
        throw new Error("Signup failed");
      }

      goToLogin();
    } catch (err) {
      setError("Unable to signup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="app-title">CoverMate</h1>
      <p className="app-subtitle">
        Insurance Comparison & Claim Assistant
      </p>

      <h2>Signup</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

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

      <button
        className="primary-btn"
        onClick={handleSignup}
        disabled={loading}
      >
        {loading ? "Signing up..." : "Signup"}
      </button>

      <button
        className="secondary-btn"
        onClick={goToLogin}
        disabled={loading}
      >
        Back to Login
      </button>
    </div>
  );
}

export default Signup;
