import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, name })
    })
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          localStorage.setItem("email", email);
          navigate("/dashboard");
        } else {
          alert("Login failed");
        }
      })
      .catch(() => alert("Server error"));
  };

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h2>Login to PolicyNest</h2>

      <input
        type="text"
        placeholder="Enter Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: "10px", margin: "10px" }}
      />
      <br />

      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: "10px", margin: "10px" }}
      />
      <br />

      <button onClick={handleLogin} style={{ padding: "10px 20px" }}>
        Login
      </button>
    </div>
  );
}

export default Login;