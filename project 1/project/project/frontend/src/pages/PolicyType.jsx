import { useNavigate } from "react-router-dom";

export default function PolicyType() {
  const nav = useNavigate();

  const selectPolicy = (type) => {
    localStorage.setItem("policy", type);
    nav("/preferences");
  };

  return (
    <div className="container">
      <h2>Select Policy Type</h2>

      <div className="grid">

        <button onClick={() => selectPolicy("health")}>Health Insurance</button>
        <button onClick={() => selectPolicy("life")}>Life Insurance</button>
        <button onClick={() => selectPolicy("auto")}>Auto Insurance</button>
        <button onClick={() => selectPolicy("home")}>Home Insurance</button>
        <button onClick={() => selectPolicy("other")}>Other Insurance</button>

      </div>

      {/* CSS INSIDE SAME FILE */}
      <style>{`
        .container {
          text-align: center;
          margin-top: 80px;
        }

        h2 {
          font-size: 28px;
          margin-bottom: 40px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          max-width: 600px;
          margin: auto;
        }

        button {
          padding: 18px;
          background: linear-gradient(135deg,#2563eb,#0ea5e9);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }

        button:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0,0,0,.2);
        }
      `}</style>
    </div>
  );
}
