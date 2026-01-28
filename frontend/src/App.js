import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Policies from "./pages/Policies";
import RiskProfile from "./pages/RiskProfile";

function App() {
  const [page, setPage] = useState("login");
  const [userId, setUserId] = useState(null);

  // ✅ RESTORE LOGIN ON REFRESH / NEW TAB
  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    if (storedUserId && token) {
      setUserId(storedUserId);
      setPage("risk"); // or "policies"
    }
  }, []);

  // 1️⃣ Login page
  if (page === "login") {
    return (
      <Login
        onLoginSuccess={(id) => {
          setUserId(id);
          setPage("risk");
        }}
        goToSignup={() => setPage("signup")}
      />
    );
  }

  // 2️⃣ Signup page
  if (page === "signup") {
    return <Signup goToLogin={() => setPage("login")} />;
  }

  // 3️⃣ Risk Profile page
  if (page === "risk") {
    return (
      <RiskProfile
        userId={userId}
        onSubmitSuccess={() => setPage("policies")}
      />
    );
  }

  // 4️⃣ Policies page
  return (
    <Policies
      onLogout={() => {
        localStorage.clear(); // ✅ LOGOUT CLEANUP
        setUserId(null);
        setPage("login");
      }}
    />
  );
}

export default App;
