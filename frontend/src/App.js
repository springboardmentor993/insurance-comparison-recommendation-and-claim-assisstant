import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";

import Home from "./Home";
import Policies from "./pages/Policies";
import Claims from "./pages/Claims";
import Profile from "./pages/Profile";
import CategoryPolicies from "./pages/CategoryPolicies";
import Recommendations from "./pages/Recommendations";
import FileClaim from "./pages/FileClaim";
import UploadDocuments from "./pages/UploadDocuments";
import ClaimStatus from "./pages/ClaimStatus";
import AdminClaims from "./pages/AdminClaims";

import "./App.css";

function App() {

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.replace("/login.html");
    } else {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.replace("/login.html");
  };

  if (loading) return null;

  return (
    <Router>

      <div className="navbar">

        <div className="logo">TrustSure</div>

        <div className="nav-links">
          <Link to="/" className="nav-btn">Home</Link>
          <Link to="/policies" className="nav-btn">Policies</Link>
          <Link to="/claims" className="nav-btn">Claims</Link>
          <Link to="/profile" className="nav-btn">Profile</Link>
          <Link to="/recommendations" className="nav-btn">Recommendations</Link>
          <Link to="/admin-claims">Admin</Link>
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>

      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/claims" element={<Claims />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/category/:category" element={<CategoryPolicies />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/file-claim/:id" element={<FileClaim />} />
        <Route path="/file-claim" element={<FileClaim />} />
        <Route path="/upload-documents" element={<UploadDocuments />} />
        <Route path="/claim-status" element={<ClaimStatus />} />
        <Route path="/admin-claims" element={<AdminClaims />} />
      </Routes>

    </Router>
  );
}

export default App;
