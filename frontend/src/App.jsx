import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Policies from './pages/Policies';
import Recommendations from './pages/Recommendations';
import Claims from './pages/Claims';
import ClaimDetails from './pages/ClaimDetails';
import NewClaim from './pages/NewClaim';
import Admin from './pages/Admin';
import Preferences from './pages/Preferences';
import ComparePolicies from './pages/ComparePolicies';
import PolicyDetails from './pages/PolicyDetails';
import Profile from './pages/Profile';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user?.is_admin ? children : <Navigate to="/dashboard" />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/policies" element={<PrivateRoute><Policies /></PrivateRoute>} />
        <Route path="/policies/:id" element={<PrivateRoute><PolicyDetails /></PrivateRoute>} />
        <Route path="/policies/compare" element={<PrivateRoute><ComparePolicies /></PrivateRoute>} />
        <Route path="/recommendations" element={<PrivateRoute><Recommendations /></PrivateRoute>} />
        <Route path="/claims" element={<PrivateRoute><Claims /></PrivateRoute>} />
        <Route path="/claims/new" element={<PrivateRoute><NewClaim /></PrivateRoute>} />
        <Route path="/claims/:id" element={<PrivateRoute><ClaimDetails /></PrivateRoute>} />
        <Route path="/preferences" element={<PrivateRoute><Preferences /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
