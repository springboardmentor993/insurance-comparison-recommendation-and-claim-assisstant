import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Policies from "./pages/Policies";
import RiskProfile from "./pages/RiskProfile";

function App() {
  const [page, setPage] = useState("login");
  const [userId, setUserId] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // ✅ CHECK STORED SESSION ON APP LOAD
  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    if (storedUserId && token) {
      setUserId(storedUserId);
      setPage("policies");
    } else {
      localStorage.removeItem("user_id");
      localStorage.removeItem("token");
      setPage("login");
    }

    setCheckingSession(false);
  }, []);

  // ⏳ PREVENT BLANK SCREEN WHILE CHECKING SESSION
  if (checkingSession) {
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  }

  // 🔐 HARD PAGE PROTECTION
  const isAuthenticated = !!localStorage.getItem("token");

  if (!isAuthenticated && page !== "login" && page !== "signup") {
    setPage("login");
    return null;
  }

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

  // 🔹 RISK PROFILE PAGE (GUARDED)
  if (page === "risk") {
    if (!userId) {
      setPage("login");
      return null;
    }

    return (
      <RiskProfile
        userId={userId}
        onSubmitSuccess={() => setPage("policies")}
      />
    );
  }

  // 🔹 POLICIES PAGE (DEFAULT)
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
