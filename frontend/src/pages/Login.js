import { useState } from "react";
import axios from "axios";
import "./Auth.css";

function Login({ onLoginSuccess, goToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Email and Password are required");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/login", {
        email,
        password,
      });

      const { access_token, user_id } = response.data;

      // ✅ STORE TOKEN (MOST IMPORTANT)
      localStorage.setItem("token", access_token);
      localStorage.setItem("user_id", user_id);

      onLoginSuccess(user_id); // redirect

    } catch (error) {
      alert("Invalid email or password");
    }
  };

  return (
    <div className="auth-container">
      <h1 className="app-title">CoverMate</h1>
      <p className="app-subtitle">
        Insurance Comparison & Claim Assistant
      </p>

      <h2>Login</h2>

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

      <button className="primary-btn" onClick={handleLogin}>
        Login
      </button>

      <button className="secondary-btn" onClick={goToSignup}>
        Signup
      </button>
    </div>
  );
}

export default Login;
