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
import { BASE_URL } from "./api";

function App() {
  const [page, setPage] = useState("login");
  const [userId, setUserId] = useState(null);
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [comparePolicies, setComparePolicies] = useState([]);
  const [checkingSession, setCheckingSession] = useState(true);

  // ✅ SAFE SESSION RESTORE
  useEffect(() => {
    const checkSession = async () => {
      const storedUserId = localStorage.getItem("user_id");
      const token = localStorage.getItem("token");

      if (!storedUserId || !token) {
        localStorage.clear();
        setPage("login");
        setCheckingSession(false);
        return;
      }

      try {
        // Verify token with backend
        const response = await fetch(`${BASE_URL}/policies`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Invalid session");
        }

        setUserId(storedUserId);
        setPage("policies");

      } catch (error) {
        localStorage.clear();
        setPage("login");
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
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