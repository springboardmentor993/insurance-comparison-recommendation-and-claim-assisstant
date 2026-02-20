// import { Link, useLocation, useNavigate } from "react-router-dom";
// import {
//   ShieldCheck,
//   FileText,
//   Star,
//   User,
//   LogOut,
//   SlidersHorizontal,
//   ClipboardList,
//   LayoutDashboard,
// } from "lucide-react";
// import { useAuth } from "../context/AuthContext";

// const Navbar = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { logout } = useAuth();

//   // ✅ Get role from localStorage
//   const role = localStorage.getItem("role");

//   const hasPreferences = localStorage.getItem("selectedPolicy");

//   const handleLogout = () => {
//     logout();
//     localStorage.clear();
//     navigate("/login");
//   };

//   /* ---------------- NAV ITEMS ---------------- */

//   const navItems = [
//     { path: "/home", label: "Home", icon: ShieldCheck },

//     role === "user" && {
//       path: "/preferences",
//       label: "User Preferences",
//       icon: SlidersHorizontal,
//     },

//     role === "user" && {
//       path: "/policies",
//       label: "Policies",
//       icon: FileText,
//     },

//     role === "user" &&
//       hasPreferences && {
//         path: "/recommendations",
//         label: "Recommendations",
//         icon: Star,
//       },

//     /* ✅ CLAIMS SECTION (USER ONLY) */
//     role === "user" && {
//       path: "/file-claim",
//       label: "File Claim",
//       icon: ClipboardList,
//     },

//     role === "user" && {
//       path: "/claim-status",
//       label: "Claim Status",
//       icon: ClipboardList,
//     },

//     /* ✅ ADMIN DASHBOARD */
//     role === "admin" && {
//       path: "/admin-dashboard",
//       label: "Admin Dashboard",
//       icon: LayoutDashboard,
//     },

//     { path: "/profile", label: "Profile", icon: User },
//   ].filter(Boolean);

//   return (
//     <nav className="bg-white shadow-sm border-b border-gray-200">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">

//           {/* LOGO */}
//           <div className="flex items-center space-x-8">
//             <Link
//               to="/home"
//               className="flex items-center space-x-2 text-blue-600 font-bold text-xl"
//             >
//               <ShieldCheck className="w-7 h-7" />
//               <span>Insurance Assistant</span>
//             </Link>

//             {/* NAV LINKS */}
//             <div className="hidden md:flex space-x-1">
//               {navItems.map(({ path, label, icon: Icon }) => {
//                 const isActive = location.pathname === path;

//                 return (
//                   <Link
//                     key={path}
//                     to={path}
//                     className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
//                       isActive
//                         ? role === "admin"
//                           ? "bg-purple-100 text-purple-700"
//                           : "bg-blue-50 text-blue-600"
//                         : "text-gray-700 hover:bg-gray-100"
//                     }`}
//                   >
//                     <Icon className="w-4 h-4" />
//                     <span className="font-medium">{label}</span>
//                   </Link>
//                 );
//               })}
//             </div>
//           </div>

//           {/* LOGOUT */}
//           <button
//             onClick={handleLogout}
//             className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
//           >
//             <LogOut className="w-4 h-4" />
//             <span className="font-medium">Logout</span>
//           </button>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  FileText,
  Star,
  User,
  LogOut,
  SlidersHorizontal,
  ClipboardList,
  LayoutDashboard,
  Home,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const role = localStorage.getItem("role");
  const hasPreferences = localStorage.getItem("selectedPolicy");

  const handleLogout = () => {
    logout();
    localStorage.clear();
    navigate("/login");
  };

  /* ---------------- NAV ITEMS ---------------- */

  const navItems = [
    { path: "/home", label: "Home", icon: Home },

    /* USER SECTION */
    role === "user" && {
      path: "/preferences",
      label: "User Preferences",
      icon: SlidersHorizontal,
    },

    role === "user" && {
      path: "/policies",
      label: "Policies",
      icon: FileText,
    },

    role === "user" &&
      hasPreferences && {
        path: "/recommendations",
        label: "Recommendations",
        icon: Star,
      },

    /* CLAIMS */
    role === "user" && {
      path: "/file-claim",
      label: "File Claim",
      icon: ClipboardList,
    },

    role === "user" && {
      path: "/claim-status",
      label: "Claim Status",
      icon: ClipboardList,
    },

    /* ADMIN SECTION */
    role === "admin" && {
      path: "/admin-dashboard",
      label: "Admin Dashboard",
      icon: LayoutDashboard,
    },

    /* PROFILE ONLY FOR USER */
    role === "user" && {
      path: "/profile",
      label: "Profile",
      icon: User,
    },
  ].filter(Boolean);

  return (
    <nav className="navbar-container">
      <div className="navbar-inner">

        {/* LOGO */}
        <Link to="/home" className="logo">
          <ShieldCheck size={26} />
          <span>Insurance Assistant</span>
        </Link>

        {/* NAV LINKS */}
        <div className="nav-links">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;

            return (
              <Link
                key={path}
                to={path}
                className={`nav-item ${
                  isActive
                    ? role === "admin"
                      ? "admin-active"
                      : "user-active"
                    : ""
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>

        {/* LOGOUT */}
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      {/* CSS */}
      <style>{`
        .navbar-container {
          background: linear-gradient(90deg, #1e3a8a, #2563eb);
          padding: 0 30px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }

        .navbar-inner {
          max-width: 1300px;
          margin: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 65px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          color: white;
          font-weight: 700;
          font-size: 20px;
          text-decoration: none;
        }

        .nav-links {
          display: flex;
          gap: 10px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          text-decoration: none;
          color: white;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .nav-item:hover {
          background: rgba(255,255,255,0.15);
        }

        .user-active {
          background: white;
          color: #2563eb;
          font-weight: 600;
        }

        .admin-active {
          background: #ede9fe;
          color: #7c3aed;
          font-weight: 600;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: 0.3s;
          font-weight: 500;
        }

        .logout-btn:hover {
          background: #dc2626;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .nav-links {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
