import { useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Policies from "./pages/Policies";

function App() {
  const [page, setPage] = useState("login");

  if (page === "login") {
    return (
      <Login
        onLoginSuccess={() => setPage("policies")}
        goToSignup={() => setPage("signup")}
      />
    );
  }

  if (page === "signup") {
    return <Signup goToLogin={() => setPage("login")} />;
  }

  return <Policies onLogout={() => setPage("login")} />;
}

export default App;
