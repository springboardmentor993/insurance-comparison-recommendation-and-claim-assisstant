import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminAuth.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const login = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Login failed");
        return;
      }

      // ✅ SAVE ADMIN TOKEN
      localStorage.setItem("adminToken", data.access_token);

      alert("Login successful!");

      // ✅ REDIRECT TO DASHBOARD
      navigate("/admin-dashboard");

    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <div className="auth-container">
      <h2>Admin Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button onClick={login}>Login</button>
    </div>
  );
}

export default AdminLogin;