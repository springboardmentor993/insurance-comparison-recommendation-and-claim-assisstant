// import { useState } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { ShieldCheck, Mail, Lock, User } from "lucide-react";
// import { authAPI } from "../services/api";
// import { useAuth } from "../context/AuthContext";

// const Login = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { login } = useAuth();

//   const [role, setRole] = useState("user"); // user | admin

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });

//   const [adminData, setAdminData] = useState({
//     username: "",
//     password: "",
//   });

//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);

//   const successMessage = location.state?.message;

//   // ================= USER INPUT =================
//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     setError("");
//   };

//   // ================= ADMIN INPUT =================
//   const handleAdminChange = (e) => {
//     setAdminData({ ...adminData, [e.target.name]: e.target.value });
//     setError("");
//   };

//   // ================= SUBMIT =================
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       // ===== ADMIN LOGIN (Frontend Only) =====
//       if (role === "admin") {
//         if (
//           adminData.username === "admin" &&
//           adminData.password === "admin123"
//         ) {
//           localStorage.setItem("adminLoggedIn", "true");
//           localStorage.setItem("role", "admin");
//           navigate("/admin-dashboard");
//         } else {
//           setError("Invalid admin credentials");
//         }
//       }

//       // ===== USER LOGIN (Backend Auth - Unchanged) =====
//       else {
//         const response = await authAPI.login(formData);

//         login(response.data.access_token);

//         localStorage.setItem("role", "user");

//         if (rememberMe) {
//           localStorage.setItem("rememberMe", "true");
//         } else {
//           localStorage.removeItem("rememberMe");
//         }

//         navigate("/preferences");
//       }
//     } catch (err) {
//       setError(
//         err.response?.data?.detail ||
//           "Login failed. Please check your credentials."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-blue-100">

//         {/* Logo */}
//         <div className="flex items-center justify-center mb-6">
//           <div className="bg-blue-100 p-4 rounded-full">
//             <ShieldCheck size={48} className="text-blue-600" />
//           </div>
//         </div>

//         {/* Title */}
//         <h1 className="text-3xl font-bold text-center text-gray-900">
//           Insurance Assistant
//         </h1>
//         <p className="text-center text-gray-600 mt-2 mb-6">
//           Secure access to your dashboard
//         </p>

//         {/* ROLE TOGGLE */}
//         <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
//           <button
//             type="button"
//             onClick={() => setRole("user")}
//             className={`flex-1 py-2 rounded-lg font-semibold transition ${
//               role === "user"
//                 ? "bg-blue-600 text-white"
//                 : "text-gray-600"
//             }`}
//           >
//             User Login
//           </button>

//           <button
//             type="button"
//             onClick={() => setRole("admin")}
//             className={`flex-1 py-2 rounded-lg font-semibold transition ${
//               role === "admin"
//                 ? "bg-purple-600 text-white"
//                 : "text-gray-600"
//             }`}
//           >
//             Admin Login
//           </button>
//         </div>

//         {successMessage && (
//           <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
//             {successMessage}
//           </div>
//         )}

//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-5">

//           {/* ================= USER FORM ================= */}
//           {role === "user" && (
//             <>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <Mail size={20} className="text-gray-400 absolute left-3 top-3" />
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     required
//                     className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <Lock size={20} className="text-gray-400 absolute left-3 top-3" />
//                   <input
//                     type="password"
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     required
//                     className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               </div>

//               <div className="flex items-center text-sm">
//                 <label className="flex items-center gap-2 text-gray-600">
//                   <input
//                     type="checkbox"
//                     checked={rememberMe}
//                     onChange={() => setRememberMe(!rememberMe)}
//                     className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                   />
//                   Remember me
//                 </label>
//               </div>
//             </>
//           )}

//           {/* ================= ADMIN FORM ================= */}
//           {role === "admin" && (
//             <>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Admin Username
//                 </label>
//                 <div className="relative">
//                   <User size={20} className="text-gray-400 absolute left-3 top-3" />
//                   <input
//                     type="text"
//                     name="username"
//                     value={adminData.username}
//                     onChange={handleAdminChange}
//                     required
//                     className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Admin Password
//                 </label>
//                 <div className="relative">
//                   <Lock size={20} className="text-gray-400 absolute left-3 top-3" />
//                   <input
//                     type="password"
//                     name="password"
//                     value={adminData.password}
//                     onChange={handleAdminChange}
//                     required
//                     className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
//                   />
//                 </div>
//               </div>
//             </>
//           )}

//           {/* SUBMIT BUTTON */}
//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full py-3 rounded-lg font-semibold text-white transition ${
//               role === "admin"
//                 ? "bg-purple-600 hover:bg-purple-700"
//                 : "bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600"
//             }`}
//           >
//             {loading ? "Logging in..." : "Login Securely"}
//           </button>
//         </form>

//         {/* Footer */}
//         {role === "user" && (
//           <p className="mt-6 text-center text-gray-600">
//             Don’t have an account?{" "}
//             <Link
//               to="/register"
//               className="text-blue-600 hover:text-blue-700 font-semibold"
//             >
//               Register here
//             </Link>
//           </p>
//         )}

//         <p className="mt-4 text-xs text-center text-gray-500">
//           🔒 Your data is encrypted and securely protected.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, Mail, Lock, User } from "lucide-react";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [role, setRole] = useState("user");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [adminData, setAdminData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const successMessage = location.state?.message;

  // USER INPUT
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // ADMIN INPUT
  const handleAdminChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
    setError("");
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ================= ADMIN LOGIN =================
      if (role === "admin") {
        if (
          adminData.username === "admin" &&
          adminData.password === "admin123"
        ) {
          localStorage.setItem("adminLoggedIn", "true");
          localStorage.setItem("role", "admin");

          navigate("/admin-dashboard");
        } else {
          setError("Invalid admin credentials");
        }
      }

      // ================= USER LOGIN =================
      else {
        const response = await authAPI.login(formData);

        // 🔥 IMPORTANT FIX
        const token =
          response.data.access_token ||
          response.data.token ||
          response.data.accessToken;

        if (!token) {
          throw new Error("Token not received from server");
        }

        // Save token everywhere needed
        login(token); // context
        localStorage.setItem("token", token); // backup
        localStorage.setItem("role", "user");

        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }

        navigate("/preferences");
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-blue-100">

        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <ShieldCheck size={48} className="text-blue-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-900">
          Insurance Assistant
        </h1>
        <p className="text-center text-gray-600 mt-2 mb-6">
          Secure access to your dashboard
        </p>

        {/* ROLE SWITCH */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setRole("user")}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              role === "user"
                ? "bg-blue-600 text-white"
                : "text-gray-600"
            }`}
          >
            User Login
          </button>

          <button
            type="button"
            onClick={() => setRole("admin")}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              role === "admin"
                ? "bg-purple-600 text-white"
                : "text-gray-600"
            }`}
          >
            Admin Login
          </button>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* USER FORM */}
          {role === "user" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={20} className="text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={20} className="text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center text-sm">
                <label className="flex items-center gap-2 text-gray-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  Remember me
                </label>
              </div>
            </>
          )}

          {/* ADMIN FORM */}
          {role === "admin" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Username
                </label>
                <div className="relative">
                  <User size={20} className="text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="username"
                    value={adminData.username}
                    onChange={handleAdminChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock size={20} className="text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    name="password"
                    value={adminData.password}
                    onChange={handleAdminChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition ${
              role === "admin"
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600"
            }`}
          >
            {loading ? "Logging in..." : "Login Securely"}
          </button>
        </form>

        {role === "user" && (
          <p className="mt-6 text-center text-gray-600">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Register here
            </Link>
          </p>
        )}

        <p className="mt-4 text-xs text-center text-gray-500">
          🔒 Your data is encrypted and securely protected.
        </p>
      </div>
    </div>
  );
};

export default Login;
