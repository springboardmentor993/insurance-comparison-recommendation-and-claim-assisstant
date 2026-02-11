import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Policies from "./pages/Policies";
import RiskProfile from "./pages/RiskProfile";
import Recommendations from "./pages/Recommendations";

function App() {
  const [page, setPage] = useState("login");
  const [userId, setUserId] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // 🔐 Restore session on load
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

  // ⏳ Prevent render while checking session
  if (checkingSession) {
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  }

  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  // 🔒 Hard protection without state update during render
  if (!isAuthenticated && page !== "login" && page !== "signup") {
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

  // 🔹 LOGIN
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

  // 🔹 SIGNUP
  if (page === "signup") {
    return <Signup goToLogin={() => setPage("login")} />;
  }

  // 🔹 RISK PROFILE
  if (page === "risk") {
    if (!userId) {
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

    return (
      <RiskProfile
        userId={userId}
        onSubmitSuccess={(nextPage) => setPage(nextPage)}
      />
    );
  }

  // 🔹 RECOMMENDATIONS
  if (page === "recommendations") {
    return (
      <Recommendations
        userId={userId}
        onBack={() => setPage("policies")}
      />
    );
  }

  // 🔹 DEFAULT → POLICIES
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
