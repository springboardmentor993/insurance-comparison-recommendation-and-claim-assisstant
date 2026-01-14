import { useState } from "react";
import LoginSignup from "./LoginSignup";
import Policies from "./Policies";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (isLoggedIn) {
    return <Policies />;
  }

  return <LoginSignup onLoginSuccess={() => setIsLoggedIn(true)} />;
}

export default App;
