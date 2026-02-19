import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Policies from "./pages/Policies";
import RiskProfile from "./pages/RiskProfile";
import Recommendations from "./pages/Recommendations";
import UploadClaim from "./pages/UploadClaim";
import MyClaims from "./pages/MyClaims";

function App() {
  const [page, setPage] = useState("login");
  const [userId, setUserId] = useState(null);
  const [selectedClaimId, setSelectedClaimId] = useState(null);
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

  // 🔒 Global protection
  if (!isAuthenticated && page !== "login" && page !== "signup") {
    setPage("login");
    return null;
  }

  // ==========================
  // PAGE ROUTING
  // ==========================

  switch (page) {
    case "login":
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

    case "signup":
      return <Signup goToLogin={() => setPage("login")} />;

    case "risk":
      return (
        <RiskProfile
          userId={userId}
          onSubmitSuccess={(nextPage) => setPage(nextPage)}
        />
      );

    case "recommendations":
      return (
        <Recommendations
          userId={userId}
          onBack={() => setPage("policies")}
        />
      );

    case "claims":
      return (
        <MyClaims
          onBack={() => setPage("policies")}
        />
      );

    case "upload":
      return (
        <UploadClaim
          claimId={selectedClaimId}
          onBack={() => setPage("policies")}
        />
      );

    default:
      return (
        <Policies
          goToRiskProfile={() => setPage("risk")}
          goToRecommendations={() => setPage("recommendations")}
          goToUpload={(claimId) => {
            setSelectedClaimId(claimId);
            setPage("upload");
          }}
          goToClaims={() => setPage("claims")}
          onLogout={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user_id");
            setUserId(null);
            setPage("login");
          }}
        />
      );
  }
}

export default App;
