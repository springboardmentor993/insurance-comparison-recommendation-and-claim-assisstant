import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { User, Mail, ShieldCheck } from "lucide-react";

const Profile = () => {

  const loadProfile = () => {
    const prefs = JSON.parse(localStorage.getItem("preferences")) || {};

    return {
      name: localStorage.getItem("userName") || "lahari",
      email: localStorage.getItem("userEmail") || "test@example.com",

      income: prefs.annual_income || "Not provided",
      health: prefs.healthDetails || "Not provided",
      policy: prefs.policy || "Not selected",

      budget: prefs.budget || "Not provided",
      cover: prefs.cover_amount || "Not provided",
      term: prefs.term_months || "Not provided",

      risk: localStorage.getItem("riskProfile") || "Not calculated",
    };
  };

  const [profile, setProfile] = useState(loadProfile());

  useEffect(() => {
    const updateProfile = () => setProfile(loadProfile());
    window.addEventListener("preferencesUpdated", updateProfile);
    return () => window.removeEventListener("preferencesUpdated", updateProfile);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <Navbar />

      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">

          <div className="flex items-center gap-4 mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <User className="text-blue-600" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <p className="text-gray-600">User Profile</p>
            </div>
          </div>

          <div className="space-y-4 text-gray-700">

            <div className="flex items-center gap-3">
              <Mail className="text-gray-500" />
              <span>{profile.email}</span>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck className="text-blue-600" />
              <span>Annual Income: ₹{profile.income}</span>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck className="text-green-600" />
              <span>Health Details: {profile.health}</span>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck className="text-purple-600" />
              <span>Selected Policy: {profile.policy}</span>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck className="text-orange-600" />
              <span>Budget (Max Premium): ₹{profile.budget}</span>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck className="text-teal-600" />
              <span>Preferred Cover Amount: ₹{profile.cover}</span>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck className="text-indigo-600" />
              <span>Policy Term: {profile.term} months</span>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck className={
                profile.risk === "High Risk"
                  ? "text-red-600"
                  : profile.risk === "Normal"
                  ? "text-yellow-600"
                  : "text-green-600"
              } />
              <span>Risk Profile: {profile.risk}</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
