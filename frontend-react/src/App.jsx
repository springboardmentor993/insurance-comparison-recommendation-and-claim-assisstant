import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import BrowsePolicies from './pages/BrowsePolicies'
import Home from './pages/Home'
import UserDashboard from './pages/UserDashboard'
import ComparePolicies from './pages/ComparePolicies'
import PolicyDetails from './pages/PolicyDetails'
import ApplyInsurance from './pages/ApplyInsurance'
import ClaimsPage from './pages/Claims'
import FraudMonitoring from './pages/FraudMonitoring'
import Header from './components/Header'
import './App.css'
import Preferences from "./pages/Preferences"
import Recommendations from "./pages/Recommendations"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"
import AdminDashboard from "./pages/AdminDashboard"
import AdminDocumentReview from "./pages/AdminDocumentReview"
import AdminClaimsReview from "./pages/AdminClaimsReview"
import { UserManagement } from './pages/AdminUserManagement'

/**
 * Main App component with React Router configuration
 * 
 * Route Structure:
 * - "/" → Home (public landing page)
 * - "/home" → UserDashboard (authenticated users)
 * - "/dashboard" → UserDashboard (protected - authenticated users only)
 * - "/admin/dashboard" → AdminDashboard (admin-only)
 * - "/admin/users" → UserManagement (admin-only)
 * - "/admin/documents" → DocumentReview (admin-only)
 * - Other routes are protected based on user role
 */
function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Header />
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED USER ROUTES */}
        <Route path="/home" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/browse" element={<BrowsePolicies />} />
        <Route path="/compare" element={<ComparePolicies />} />
        <Route path="/policy/:policyId" element={<PolicyDetails />} />
        <Route path="/apply/:policyId" element={<ProtectedRoute><ApplyInsurance /></ProtectedRoute>} />
        <Route path="/preferences" element={<ProtectedRoute><Preferences /></ProtectedRoute>} />
        <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
        <Route path="/claims" element={<ProtectedRoute><ClaimsPage /></ProtectedRoute>} />
        <Route path="/fraud" element={<ProtectedRoute><FraudMonitoring /></ProtectedRoute>} />

        {/* ADMIN-ONLY ROUTES */}
        <Route path="/admin" element={<AdminRoute token={token}><AdminDashboard token={token} /></AdminRoute>} />
        <Route path="/admin/dashboard" element={<AdminRoute token={token}><AdminDashboard token={token} /></AdminRoute>} />
        <Route path="/admin/claims" element={<AdminRoute token={token}><AdminClaimsReview token={token} /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute token={token}><UserManagement token={token} /></AdminRoute>} />
        <Route path="/admin/documents" element={<AdminRoute token={token}><AdminDocumentReview token={token} /></AdminRoute>} />
        <Route path="/admin/fraud" element={<AdminRoute token={token}><FraudMonitoring /></AdminRoute>} />

        {/* FALLBACK ROUTE */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App

