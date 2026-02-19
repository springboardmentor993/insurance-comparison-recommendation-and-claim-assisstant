import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/routes/ProtectedRoute';
import { Layout } from './components/layout/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Main Pages
import Home from './pages/Home';
import Profile from './pages/profile/Profile';

// Policy Pages
import Policies from './pages/policies/Policies';

// Recommendations Pages
import Recommendations from './pages/recommendations/Recommendations';

// Claims Pages
import Claims from './pages/claims/Claims';
import FileClaim from './pages/claims/FileClaim';
import ClaimDetails from './pages/claims/ClaimDetails';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ClaimReview from './pages/admin/ClaimReview';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Home />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/policies"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Policies />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/recommendations"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Recommendations />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/claims"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Claims />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/claims/file"
              element={
                <ProtectedRoute>
                  <Layout>
                    <FileClaim />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/claims/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ClaimDetails />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </AdminRoute>
              }
            />

            <Route
              path="/admin/claims/:id"
              element={
                <AdminRoute>
                  <Layout>
                    <ClaimReview />
                  </Layout>
                </AdminRoute>
              }
            />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            toastClassName="glass"
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
