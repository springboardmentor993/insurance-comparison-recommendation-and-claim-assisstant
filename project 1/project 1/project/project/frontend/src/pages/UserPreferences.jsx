// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   User,
//   Calendar,
//   HeartPulse,
//   Users,
//   DollarSign,
//   ShieldCheck,
// } from "lucide-react";
// import Navbar from "../components/Navbar";

// const UserPreferences = () => {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     name: "",
//     age: "",
//     maritalStatus: "",
//     kids: "",
//     income: "",
//     health: "",
//     policy: "",
//     maxPremium: "",
//   });

//   const [error, setError] = useState("");

//   /* ---------------- HANDLE CHANGE ---------------- */
//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//     setError("");
//   };

//   /* ---------------- RISK PROFILE LOGIC ---------------- */
//   const calculateRiskProfile = () => {
//     if (form.health === "critical" || Number(form.age) >= 50) {
//       return "High Risk";
//     }
//     if (Number(form.age) >= 35 || Number(form.kids) >= 2) {
//       return "Normal";
//     }
//     return "Safe";
//   };

//   /* ---------------- SUBMIT ---------------- */
//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // ✅ validation
//     for (let key in form) {
//       if (!form[key]) {
//         setError("⚠️ Please fill all fields before continuing");
//         return;
//       }
//     }

//     const riskProfile = calculateRiskProfile();

//     // ✅ preferences object (used everywhere)
//     const preferences = {
//       name: form.name,
//       age: Number(form.age),
//       maritalStatus: form.maritalStatus,
//       kids: Number(form.kids),
//       annual_income: Number(form.income),
//       healthDetails: form.health,
//       policy: form.policy,
//       maxPremium: Number(form.maxPremium),
//     };

//     // ✅ save locally
//     localStorage.setItem("preferences", JSON.stringify(preferences));
//     localStorage.setItem("riskProfile", riskProfile);

//     // 🔥 notify Profile page instantly
//     window.dispatchEvent(new Event("preferencesUpdated"));

//     // ✅ redirect
//     navigate("/recommendations");
//   };

//   return (
//     <>
//       <Navbar />

//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 flex items-center justify-center p-4">
//         <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-blue-100">

//           {/* HEADER */}
//           <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
//             User Preferences
//           </h1>
//           <p className="text-center text-gray-600 mb-6">
//             Help us personalize the best insurance for you
//           </p>

//           {/* ERROR */}
//           {error && (
//             <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4">

//             <Input
//               icon={User}
//               name="name"
//               placeholder="Full Name"
//               value={form.name}
//               onChange={handleChange}
//             />

//             <Input
//               icon={Calendar}
//               name="age"
//               type="number"
//               placeholder="Age"
//               value={form.age}
//               onChange={handleChange}
//             />

//             <select
//               name="maritalStatus"
//               value={form.maritalStatus}
//               onChange={handleChange}
//               className="input"
//             >
//               <option value="">Marital Status</option>
//               <option>Single</option>
//               <option>Married</option>
//             </select>

//             <Input
//               icon={Users}
//               name="kids"
//               type="number"
//               placeholder="Number of Kids"
//               value={form.kids}
//               onChange={handleChange}
//             />

//             <Input
//               icon={DollarSign}
//               name="income"
//               type="number"
//               placeholder="Annual Income (₹)"
//               value={form.income}
//               onChange={handleChange}
//             />

//             <select
//               name="health"
//               value={form.health}
//               onChange={handleChange}
//               className="input"
//             >
//               <option value="">Health Condition</option>
//               <option value="good">Good</option>
//               <option value="moderate">Moderate</option>
//               <option value="critical">Critical</option>
//             </select>

//             <select
//               name="policy"
//               value={form.policy}
//               onChange={handleChange}
//               className="input"
//             >
//               <option value="">Select Policy Type</option>
//               <option value="health">Health Insurance</option>
//               <option value="life">Life Insurance</option>
//               <option value="auto">Auto Insurance</option>
//               <option value="home">Home Insurance</option>
//               <option value="other">Other Insurance</option>
//             </select>
// <Input
//               icon={Calendar}
//               name="termMonths"
//               type="number"
//               placeholder="Enter policy term in months (12 / 24 / 36)"
//               value={form.termMonths}
//               onChange={handleChange}
//             />
//             <Input
//               icon={ShieldCheck}
//               name="maxPremium"
//               type="number"
//               placeholder="Maximum Premium (₹)"
//               value={form.maxPremium}
//               onChange={handleChange}
//             />

//             <button
//               type="submit"
//               className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white py-3 rounded-lg font-semibold hover:opacity-90"
//             >
//               Continue to Recommendations
//             </button>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// };

// /* ---------------- INPUT COMPONENT ---------------- */
// const Input = ({ icon: Icon, ...props }) => (
//   <div className="relative">
//     <Icon className="absolute left-3 top-3 text-gray-400" size={18} />
//     <input
//       {...props}
//       className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
//     />
//   </div>
// );

// export default UserPreferences;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Calendar,
  Users,
  DollarSign,
  ShieldCheck,
} from "lucide-react";
import Navbar from "../components/Navbar";

const UserPreferences = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    age: "",
    maritalStatus: "",
    kids: "",
    income: "",
    health: "",
    policy: "",
    maxPremium: "",
    termMonths: "",
    coverAmount: "",
  });

  const [error, setError] = useState("");

  /* ---------------- HANDLE CHANGE ---------------- */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  /* ---------------- RISK PROFILE LOGIC ---------------- */
  const calculateRiskProfile = () => {
    if (form.health === "critical" || Number(form.age) >= 50) {
      return "High Risk";
    }
    if (Number(form.age) >= 35 || Number(form.kids) >= 2) {
      return "Normal";
    }
    return "Safe";
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = (e) => {
    e.preventDefault();

    for (let key in form) {
      if (!form[key]) {
        setError("⚠️ Please fill all fields before continuing");
        return;
      }
    }

    const riskProfile = calculateRiskProfile();

    const preferences = {
      name: form.name,
      age: Number(form.age),
      maritalStatus: form.maritalStatus,
      kids: Number(form.kids),

      // Profile fields
      annual_income: Number(form.income),
      healthDetails: form.health,
      policy: form.policy,

      // ⭐ IMPORTANT FOR PROFILE PAGE
      budget: Number(form.maxPremium),
      cover_amount: Number(form.coverAmount),
      term_months: Number(form.termMonths),
    };

    localStorage.setItem("preferences", JSON.stringify(preferences));
    localStorage.setItem("riskProfile", riskProfile);

    window.dispatchEvent(new Event("preferencesUpdated"));

    navigate("/recommendations");
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-blue-100">

          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            User Preferences
          </h1>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <Input icon={User} name="name" placeholder="Full Name"
              value={form.name} onChange={handleChange} />

            <Input icon={Calendar} name="age" type="number"
              placeholder="Age"
              value={form.age} onChange={handleChange} />

            <select name="maritalStatus" value={form.maritalStatus}
              onChange={handleChange} className="input">
              <option value="">Marital Status</option>
              <option>Single</option>
              <option>Married</option>
            </select>

            <Input icon={Users} name="kids" type="number"
              placeholder="Number of Kids"
              value={form.kids} onChange={handleChange} />

            <Input icon={DollarSign} name="income" type="number"
              placeholder="Annual Income (₹)"
              value={form.income} onChange={handleChange} />

            <select name="health" value={form.health}
              onChange={handleChange} className="input">
              <option value="">Health Condition</option>
              <option value="good">Good</option>
              <option value="moderate">Moderate</option>
              <option value="critical">Critical</option>
            </select>

            <select name="policy" value={form.policy}
              onChange={handleChange} className="input">
              <option value="">Select Policy Type</option>
              <option value="health">Health Insurance</option>
              <option value="life">Life Insurance</option>
              <option value="auto">Auto Insurance</option>
              <option value="home">Home Insurance</option>
              <option value="other">Other Insurance</option>
            </select>

            <Input icon={ShieldCheck} name="coverAmount" type="number"
              placeholder="Preferred Cover Amount (₹)"
              value={form.coverAmount} onChange={handleChange} />

            <Input icon={Calendar} name="termMonths" type="number"
              placeholder="Policy Term Months (12 / 24 / 36)"
              value={form.termMonths} onChange={handleChange} />

            <Input icon={ShieldCheck} name="maxPremium" type="number"
              placeholder="Maximum Premium Budget (₹)"
              value={form.maxPremium} onChange={handleChange} />

            <button type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white py-3 rounded-lg font-semibold">
              Continue to Recommendations
            </button>

          </form>
        </div>
      </div>
    </>
  );
};

const Input = ({ icon: Icon, ...props }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-3 text-gray-400" size={18} />
    <input {...props}
      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
  </div>
);

export default UserPreferences;
