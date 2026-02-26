import "./App.css";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Login from "./Login";
import React from "react";
import AdminLogin from "./pages/AdminLogin";
import Policies from "./policies";
import Profile from "./Profile";
import CategoryPolicies from "./CategoryPolicies";
import PolicyDetails from "./PolicyDetails";
import Recommendations from "./Recommendations";
import ClaimSubmission from "./pages/ClaimSubmission";
import AdminClaims from "./pages/AdminClaims";
function AppContent() {
  const location = useLocation();
  return (
    <>
      {/* Hide navbar on Login page */}
      {location.pathname !== "/" && (
        <div className="navbar">
          <div className="logo">PolicyNest</div>

          <div className="nav-links">
            <Link to="/policies">Policies</Link>
            <Link to="/claims">Claims</Link>
            <Link to="/recommendations">Recommendations</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/">Logout</Link>
            <Link to="/admin-login">Admin Claims</Link>
          </div>
        </div>
      )}

      {/* ROUTES */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/category/:type" element={<CategoryPolicies />} />
        <Route path="/policy/:id" element={<PolicyDetails />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/claims" element={<ClaimSubmission />} />
  <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-claims" element={<AdminClaims />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;








