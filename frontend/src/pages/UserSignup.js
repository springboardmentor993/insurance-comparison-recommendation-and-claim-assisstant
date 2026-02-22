import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserAuth.css";

function UserSignup() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const register = async () => {

    try {
      const res = await fetch("http://127.0.0.1:8000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registration successful! Please login.");
        navigate("/login");
      } else {
        alert(data.detail || "Signup failed");
      }

    } catch {
      alert("Server error");
    }
  };

  return (
    <div className="auth-container">

      <div className="auth-card">

        <h1 className="brand-title">TrustSure</h1>
        <p className="subtitle">Create your account</p>

        <input
          type="email"
          placeholder="Enter Email"
          value={form.email}
          onChange={e => setForm({...form, email: e.target.value})}
        />

        <input
          type="password"
          placeholder="Create Password"
          value={form.password}
          onChange={e => setForm({...form, password: e.target.value})}
        />

        <button onClick={register}>
          Register
        </button>

        <p className="switch-link">
          Already have an account?
          <span onClick={() => navigate("/login")}>
            Login
          </span>
        </p>

      </div>

    </div>
  );
}

export default UserSignup;