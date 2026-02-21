import { useState } from "react";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      if (!email.trim() || !password.trim()) {
        alert("Please enter email and password");
        return;
      }

      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim()
        })
      });

      const data = await res.json();
      console.log("Server response:", data);

      if (!res.ok) {
        alert(data.detail || "Login failed ❌");
        return;
      }

      localStorage.setItem("token", data.access_token);

      alert("Login successful ✅");

      window.location.href = "/";

    } catch (err) {
      alert("Backend server not running ❌");
      console.error(err);
    }
  };

  return (
    <div style={{
      margin: 0,
      fontFamily: "Arial, sans-serif",
      background: "linear-gradient(135deg, #1e3c72, #ff6ec7)",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>

      <div style={{
        background: "white",
        padding: "40px",
        borderRadius: "12px",
        width: "320px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        textAlign: "center"
      }}>

        <div style={{
          fontSize: "22px",
          fontWeight: "bold",
          color: "#ff6ec7",
          marginBottom: "5px"
        }}>
          TrustSure
        </div>

        <div style={{
          fontSize: "12px",
          color: "#555",
          marginBottom: "20px"
        }}>
          Smart Insurance Platform
        </div>

        <h2 style={{
          color: "#1e3c72",
          marginBottom: "20px"
        }}>
          Login
        </h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            margin: "10px 0",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "14px"
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            margin: "10px 0",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "14px"
          }}
        />

        <button
          onClick={login}
          style={{
            width: "100%",
            padding: "12px",
            background: "linear-gradient(90deg, #1e3c72, #ff6ec7)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
            marginTop: "10px"
          }}
        >
          Login
        </button>

      </div>

    </div>
  );
}

export default Login;
