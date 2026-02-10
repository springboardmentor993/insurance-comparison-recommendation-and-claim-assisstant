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

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${BASE_URL}/login`, {
        email,
        password,
      });

      const { access_token, user_id } = response.data;

      // ✅ STORE SESSION
      localStorage.setItem("token", access_token);
      localStorage.setItem("user_id", user_id);

      onLoginSuccess(user_id);
    } catch (err) {
      setError("Invalid email or password");
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

      {error && <p style={{ color: "red" }}>{error}</p>}

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
