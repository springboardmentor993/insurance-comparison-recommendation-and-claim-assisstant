import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  HeartPulse,
  Car,
  Home,
  Briefcase,
} from "lucide-react";
import { authAPI } from "../services/api";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // 🔥 PREVIEW STATE (frontend only)
  const [previewPolicies, setPreviewPolicies] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // 🔥 TOGGLE PREVIEW POLICY
  const togglePreviewPolicy = (type) => {
    let updated;
    if (previewPolicies.includes(type)) {
      updated = previewPolicies.filter((p) => p !== type);
    } else {
      updated = [...previewPolicies, type];
    }

    setPreviewPolicies(updated);

    // ✅ store for UserPreferences page
    localStorage.setItem(
      "previewPolicyTypes",
      JSON.stringify(updated)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ✅ AUTH ONLY
      await authAPI.register(formData);

      navigate("/login", {
        state: {
          message: "Registration successful! Please login to continue.",
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const previewItems = [
    { key: "health", label: "Health", icon: HeartPulse, color: "red" },
    { key: "life", label: "Life", icon: Briefcase, color: "blue" },
    { key: "auto", label: "Auto", icon: Car, color: "green" },
    { key: "home", label: "Home", icon: Home, color: "purple" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-blue-100">

        {/* Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <ShieldCheck size={48} className="text-blue-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-900">
          Insurance Assistant
        </h1>
        <p className="text-center text-gray-600 mt-2 mb-6">
          Create your secure account
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
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

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
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

          {/* 🔥 FUNCTIONAL PREVIEW */}
          {/* <div className="border-t pt-5 mt-6">
            <h3 className="text-sm font-semibold mb-3">
              What are you looking to insure? (Preview)
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {previewItems.map((item) => {
                const Icon = item.icon;
                const active = previewPolicies.includes(item.key);

                return (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => togglePreviewPolicy(item.key)}
                    className={`flex items-center gap-2 border rounded-lg p-3 text-sm transition
                      ${
                        active
                          ? "bg-blue-100 border-blue-400 shadow"
                          : "bg-gray-50 hover:bg-gray-100"
                      }
                    `}
                  >
                    <Icon size={18} className="text-blue-600" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Selected preferences will be used to personalize recommendations
              after login.
            </p>
          </div> */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
