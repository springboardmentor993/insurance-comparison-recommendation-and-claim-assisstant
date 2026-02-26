import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === "admin@policynest.com") {
      localStorage.setItem("role", "admin");
      navigate("/admin-claims");
    } else {
      alert("Only admin can login here!");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Admin Login</h2>

      <form onSubmit={handleLogin}>
        <label>Admin Email:</label><br />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <br /><br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default AdminLogin;