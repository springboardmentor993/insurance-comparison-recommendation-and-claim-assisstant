import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Policies from "./pages/Policies";
import RiskProfile from "./pages/RiskProfile";
import Recommendations from "./pages/Recommendations";
import UploadClaim from "./pages/UploadClaim";
import MyClaims from "./pages/MyClaims";
import AdminDashboard from "./pages/AdminDashboard";
import ComparePage from "./pages/ComparePage";

function App() {
  const [page, setPage] = useState("login");
  const [userId, setUserId] = useState(null);
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [comparePolicies, setComparePolicies] = useState([]);
  const [checkingSession, setCheckingSession] = useState(true);

  // Restore session on refresh
  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    if (storedUserId && token) {
      setUserId(storedUserId);
      setPage("policies");
    } else {
      localStorage.clear();
      setPage("login");
    }

    setCheckingSession(false);
  }, []);

  if (checkingSession) {
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  }

  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  // Protect routes
  if (!isAuthenticated && page !== "login" && page !== "signup") {
    return (
      <Login
        onLoginSuccess={(id) => {
          setUserId(id);
          setPage("policies");
        }}
        goToSignup={() => setPage("signup")}
      />
    );
  }

  switch (page) {

    case "login":
      return (
        <Login
          onLoginSuccess={(id) => {
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

    case "admin":
      return (
        <AdminDashboard
          onBack={() => setPage("policies")}
        />
      );

    case "compare":
      return (
        <ComparePage
          policies={comparePolicies}
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
          goToAdmin={() => setPage("admin")}
          goToComparePage={(policies) => {
            setComparePolicies(policies);
            setPage("compare");
          }}
          onLogout={() => {
            localStorage.clear();
            setUserId(null);
            setPage("login");
          }}
        />
      );
  }
}

export default App;