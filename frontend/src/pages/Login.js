import { useState } from "react";
import axios from "axios";
import "./Auth.css";
import { BASE_URL } from "../api";

function Login({ onLoginSuccess, goToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${BASE_URL}/login`, {
        email: email.trim(),
        password: password.trim(),
      });

      const { access_token, user_id, email: userEmail, is_admin } = response.data;

      // Clear old session
      localStorage.clear();

      // Save session
      localStorage.setItem("token", access_token);
      localStorage.setItem("user_id", user_id);
      localStorage.setItem("email", userEmail);
      localStorage.setItem("is_admin", is_admin);  // ✅ ROLE STORED

      onLoginSuccess(user_id);

    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("Invalid email or password");
      } else {
        setError("Server error. Please try again.");
      }
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

      <h2>Login</h2>

      {error && <p className="error-text">{error}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="primary-btn"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <button
        className="secondary-btn"
        onClick={goToSignup}
        disabled={loading}
      >
        Signup
      </button>
    </div>
  );
}

export default Login;