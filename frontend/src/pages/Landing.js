import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(to bottom right, #eef2ff, #dbeafe)",
      textAlign: "center",
      paddingTop: "120px"
    }}>

      <div style={{ fontSize: "60px" }}>🛡️</div>

      <h1 style={{
        fontSize: "48px",
        marginBottom: "10px",
        color: "#1e3c72"
      }}>
        Insurance Assistant
      </h1>

      <p style={{
        fontSize: "18px",
        color: "#555",
        marginBottom: "30px"
      }}>
        Smart, personalized insurance recommendations tailored to your needs.
      </p>

      <button
        onClick={() => navigate("/login")}
        style={{
          padding: "14px 30px",
          fontSize: "16px",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          background: "linear-gradient(135deg, #2563eb, #10b981)",
          color: "white",
          marginRight: "15px"
        }}
      >
        Get Started
      </button>

      <button
        style={{
          padding: "14px 30px",
          fontSize: "16px",
          borderRadius: "10px",
          border: "1px solid #2563eb",
          background: "white",
          cursor: "pointer"
        }}
      >
        Create Account
      </button>

    </div>
  );
}

export default Landing;