import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Policies from "./pages/Policies";
import RiskProfile from "./pages/RiskProfile";

function App() {
  const [page, setPage] = useState("login");
  const [userId, setUserId] = useState(null);

  // ✅ CHECK STORED SESSION SAFELY
  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    // Restore session ONLY if both exist
    if (storedUserId && token) {
      setUserId(storedUserId);
      setPage("policies");
    } else {
      // Clean broken session
      localStorage.removeItem("user_id");
      localStorage.removeItem("token");
      setPage("login");
    }
  }, []);

  // 🔹 LOGIN PAGE
  if (page === "login") {
    return (
      <Login
        onLoginSuccess={(id) => {
          localStorage.setItem("user_id", id);
          setUserId(id);
          setPage("policies");
        }}
        goToSignup={() => setPage("signup")}
      />
    );
  }

  // 🔹 SIGNUP PAGE
  if (page === "signup") {
    return <Signup goToLogin={() => setPage("login")} />;
  }

  // 🔹 RISK PROFILE PAGE
  if (page === "risk") {
    return (
      <RiskProfile
        userId={userId}
        onSubmitSuccess={() => setPage("policies")}
      />
    );
  }

  // 🔹 POLICIES PAGE
  return (
    <Policies
      goToRiskProfile={() => setPage("risk")}
      onLogout={() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        setUserId(null);
        setPage("login");
      }}
    />
  );
}

export default App;
