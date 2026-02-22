import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminAuth.css";

function AdminSignup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const register = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/admin/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Signup failed");
        return;
      }

      alert("Admin registered successfully!");

      // ✅ REDIRECT TO LOGIN
      navigate("/admin-login");

    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <div className="auth-container">
      <h2>Admin Signup</h2>

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

      <button onClick={register}>Register Admin</button>
    </div>
  );
}

export default AdminSignup;