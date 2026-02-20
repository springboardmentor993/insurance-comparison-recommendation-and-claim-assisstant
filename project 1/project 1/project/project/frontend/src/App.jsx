// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";
// import ProtectedRoute from "./components/ProtectedRoute";

// // ===== PUBLIC PAGES =====
// import Landing from "./pages/Landing";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import ForgotPassword from "./pages/ForgotPassword";
// import PolicyType from "./pages/PolicyType";
// // ===== PROTECTED PAGES =====
// import Dashboard from "./pages/Dashboard";
// import Home from "./pages/Home";
// import Policies from "./pages/Policies";
// import Recommendations from "./pages/Recommendations";
// import Profile from "./pages/Profile";
// import UserPreferences from "./pages/UserPreferences";
// import PolicyDetails from "./pages/PolicyDetails";
// import Compare from "./pages/Compare";
// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Routes>

//           {/* ================= PUBLIC ROUTES ================= */}
//           <Route path="/" element={<Landing />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/forgot-password" element={<ForgotPassword />} />
//           <Route path="/compare" element={<Compare />} />
//           <Route path="/policy" element={<PolicyType />} />
//           {/* ================= PROTECTED ROUTES ================= */}
//           <Route
//             path="/home"
//             element={
//               <ProtectedRoute>
//                 <Home />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute>
//                 <Dashboard />
//               </ProtectedRoute>
//             }
//           />

//           {/* ✅ USER PREFERENCES (FIXED PATH) */}
//           <Route
//             path="/preferences"
//             element={
//               <ProtectedRoute>
//                 <UserPreferences />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/policies"
//             element={
//               <ProtectedRoute>
//                 <Policies />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/policies/:id"
//             element={
//               <ProtectedRoute>
//                 <PolicyDetails />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/recommendations"
//             element={
//               <ProtectedRoute>
//                 <Recommendations />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/profile"
//             element={
//               <ProtectedRoute>
//                 <Profile />
//               </ProtectedRoute>
//             }
//           />

//           {/* ================= FALLBACK ================= */}
//           <Route path="*" element={<Navigate to="/" replace />} />

//         </Routes>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// ===== PUBLIC =====
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// ===== USER FLOW =====
import PolicyType from "./pages/PolicyType";
import UserPreferences from "./pages/UserPreferences";
import Recommendations from "./pages/Recommendations";
import ComparePolicies from "./pages/ComparePolicies";

import PolicyDetails from "./pages/PolicyDetails";
import PurchaseSuccess from "./pages/PurchaseSuccess";
import MyPolicies from "./pages/MyPolicies";
// ===== DASHBOARD =====
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Policies from "./pages/Policies";
import Profile from "./pages/Profile";
import PurchasedPolicies from "./pages/PurchasedPolicies";
import Claims from "./pages/Claims";
import AdminDashboard from "./pages/AdminDashboard";
import ClaimStatus from "./pages/ClaimStatus";
import FileClaim from "./pages/FileClaim";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* ================= PUBLIC ================= */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/purchase-success" element={<PurchaseSuccess />} />
        <Route path="/my-policies" element={<MyPolicies />} />
          {/* ================= PROTECTED FLOW ================= */}

          {/* Step 1 */}
          {/* <Route
            path="/policy-type"
            element={
              <ProtectedRoute>
                <PolicyType />
              </ProtectedRoute>
            }
          /> */}
          <Route
  path="/purchased"
  element={
    <ProtectedRoute>
      <PurchasedPolicies />
    </ProtectedRoute>
  }
/>
<Route path="/claims" element={<Claims />} />
<Route path="/admin-dashboard" element={<AdminDashboard />} />
<Route path="/claim-status" element={<ClaimStatus />} />
<Route path="/file-claim" element={<FileClaim />} />

          {/* Step 2 */}
          <Route
            path="/preferences"
            element={
              <ProtectedRoute>
                <UserPreferences />
              </ProtectedRoute>
            }
          />

          {/* Step 3 */}
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <Recommendations />
              </ProtectedRoute>
            }
          />

          {/* Step 4 */}
         <Route path="/compare-policies" element={<ComparePolicies />} />



          {/* Step 5 */}
          <Route
            path="/policies/:id"
            element={
              <ProtectedRoute>
                <PolicyDetails />
              </ProtectedRoute>
            }
          />

          {/* ================= DASHBOARD ================= */}

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/policies"
            element={
              <ProtectedRoute>
                <Policies />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
<Route path="/policy-details/:id" element={<PolicyDetails />} />
          {/* Purchased policies */}
          <Route
            path="/my-policies"
            element={
              <ProtectedRoute>
                <PurchasedPolicies />
              </ProtectedRoute>
            }
          />

          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
