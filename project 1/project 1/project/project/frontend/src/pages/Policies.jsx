
// import { useState, useEffect } from "react";
// import { Filter } from "lucide-react";
// import Navbar from "../components/Navbar";
// import { policiesAPI } from "../services/api";
// import PolicyCard from "../components/PolicyCard";
// import { useNavigate } from "react-router-dom";

// const Policies = () => {
//   const navigate = useNavigate();

//   const [policies, setPolicies] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [filters, setFilters] = useState({
//     policy_type: "",
//     min_premium: "",
//     max_premium: "",
//   });

//   const [selected, setSelected] = useState([]);

//   const userPreferredType = localStorage.getItem("preferred_policy_type");

//   useEffect(() => {
//     fetchPolicies();
//   }, []);

//   const fetchPolicies = async (filterParams = {}) => {
//     setLoading(true);
//     setError("");

//     try {
//       const params = {};
//       if (filterParams.policy_type)
//         params.policy_type = filterParams.policy_type;
//       if (filterParams.min_premium)
//         params.min_premium = Number(filterParams.min_premium);
//       if (filterParams.max_premium)
//         params.max_premium = Number(filterParams.max_premium);

//       const response = await policiesAPI.getPolicies(params);
//       let data = response.data || [];

//       if (userPreferredType) {
//         data = data.filter(
//           (p) =>
//             p.policy_type &&
//             p.policy_type.toLowerCase() ===
//               userPreferredType.toLowerCase()
//         );
//       }

//       setPolicies(data);
//     } catch {
//       setError("Failed to fetch policies.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleSelect = (policy) => {
//     const exists = selected.find((p) => p.id === policy.id);

//     if (exists) {
//       setSelected(selected.filter((p) => p.id !== policy.id));
//     } else {
//       if (selected.length >= 3) {
//         alert("You can compare only up to 3 policies.");
//         return;
//       }
//       setSelected([...selected, policy]);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50">
//       <Navbar />

//       <div className="max-w-7xl mx-auto px-4 py-10">
//         {/* HEADER */}
//         <div className="mb-8">
//           <h1 className="text-4xl font-bold">🛡️ Insurance Policies</h1>
//           <p className="text-gray-600">Browse and select policies</p>
//         </div>

//         {/* FILTERS */}
//         <div className="bg-white rounded-2xl shadow-xl p-6 mb-10">
//           <div className="flex items-center gap-2 mb-6">
//             <Filter className="text-blue-600" />
//             <h2 className="text-lg font-semibold">Filter Policies</h2>
//           </div>

//           <div className="grid md:grid-cols-4 gap-4">
//             <select
//               value={filters.policy_type}
//               onChange={(e) =>
//                 setFilters({ ...filters, policy_type: e.target.value })
//               }
//               className="border rounded-lg px-4 py-2"
//             >
//               <option value="">All Types</option>
//               <option value="health">Health</option>
//               <option value="life">Life</option>
//               <option value="auto">Auto</option>
//               <option value="home">Home</option>
//             </select>

//             <input
//               type="number"
//               placeholder="Min Premium"
//               value={filters.min_premium}
//               onChange={(e) =>
//                 setFilters({ ...filters, min_premium: e.target.value })
//               }
//               className="border rounded-lg px-4 py-2"
//             />

//             <input
//               type="number"
//               placeholder="Max Premium"
//               value={filters.max_premium}
//               onChange={(e) =>
//                 setFilters({ ...filters, max_premium: e.target.value })
//               }
//               className="border rounded-lg px-4 py-2"
//             />

//             <button
//               onClick={() => fetchPolicies(filters)}
//               className="bg-blue-600 text-white rounded-lg"
//             >
//               Apply
//             </button>
//           </div>
//         </div>

//         {/* POLICIES */}
//         {loading ? (
//           <p className="text-center">Loading...</p>
//         ) : (
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {policies.map((policy) => (
//               <div key={policy.id} className="relative">
//                 <label className="absolute top-3 right-3 bg-white px-2 py-1 rounded shadow text-sm">
//                   <input
//                     type="checkbox"
//                     checked={selected.some((p) => p.id === policy.id)}
//                     onChange={() => toggleSelect(policy)}
//                   />{" "}
//                   Compare
//                 </label>

//                 <PolicyCard policy={policy} />
//               </div>
//             ))}
//           </div>
//         )}

//         {/* COMPARE BUTTON */}
//         {selected.length >= 2 && (
//           <div className="fixed bottom-8 right-8">
//             <button
//               onClick={() =>
//                 navigate("/compare-policies", {
//                   state: { policies: selected },
//                 })
//               }
//               className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg font-semibold"
//             >
//               Compare Selected ({selected.length})
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Policies;
// import { useState, useEffect } from "react";
// import Navbar from "../components/Navbar";
// import { policiesAPI } from "../services/api";
// import PolicyCard from "../components/PolicyCard";
// import { useNavigate } from "react-router-dom";

// const Policies = () => {
//   const navigate = useNavigate();

//   const [policies, setPolicies] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selected, setSelected] = useState([]);
//   const [selectedPolicy, setSelectedPolicy] = useState(null);

//   useEffect(() => {
//     fetchPolicies();
//   }, []);

//   const fetchPolicies = async () => {
//     try {
//       const res = await policiesAPI.getPolicies();
//       setPolicies(res.data || []);
//     } catch (err) {
//       console.log(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* SAFE NUMBER */
//   const extractNumber = (value) => {
//     if (!value) return null;
//     if (typeof value === "number") return value;
//     if (typeof value === "string") return Number(value);

//     if (typeof value === "object") {
//       return value.amount || value.value || null;
//     }
//     return null;
//   };

//   const getCoverage = (p) =>
//     extractNumber(p.coverage) ||
//     extractNumber(p.coverage_amount) ||
//     extractNumber(p.sum_insured) ||
//     100000;

//   const getPremium = (p) =>
//     extractNumber(p.premium) ||
//     extractNumber(p.premium_amount) ||
//     extractNumber(p.price) ||
//     5000;

//   const getProviderName = (provider) => {
//     if (!provider) return "Not Available";
//     if (typeof provider === "object") return provider.name;
//     return provider;
//   };

//   const toggleSelect = (policy) => {
//     const exists = selected.find((p) => p.id === policy.id);

//     if (exists) {
//       setSelected(selected.filter((p) => p.id !== policy.id));
//     } else {
//       if (selected.length >= 3) return;
//       setSelected([...selected, policy]);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       <Navbar />

//       <div className="max-w-7xl mx-auto p-10">

//         <h1 className="text-4xl font-bold mb-8">
//           Insurance Policies
//         </h1>

//         {loading ? (
//           <p>Loading...</p>
//         ) : (
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {policies.map((policy) => (
//               <div key={policy.id} className="relative">

//                 <label className="absolute top-3 right-3 bg-white px-2 py-1 rounded shadow text-sm">
//                   <input
//                     type="checkbox"
//                     checked={selected.some((p) => p.id === policy.id)}
//                     onChange={() => toggleSelect(policy)}
//                   /> Compare
//                 </label>

//                 <PolicyCard
//                   policy={policy}
//                   onView={setSelectedPolicy}
//                   onCompare={toggleSelect}
//                 />

//               </div>
//             ))}
//           </div>
//         )}

//         {/* Compare Button */}
//         {selected.length >= 2 && (
//           <div className="mt-10 text-center">
//             <button
//               onClick={() =>
//                 navigate("/compare-policies", {
//                   state: { policies: selected },
//                 })
//               }
//               className="bg-green-600 text-white px-8 py-3 rounded-xl shadow font-semibold"
//             >
//               Compare Selected Policies
//             </button>
//           </div>
//         )}

//         {/* VIEW DETAILS MODAL */}
//         {selectedPolicy && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

//             <div className="bg-gradient-to-br from-white to-blue-50 w-[520px] rounded-2xl shadow-2xl p-7 relative">

//               <button
//                 onClick={() => setSelectedPolicy(null)}
//                 className="absolute top-3 right-3 text-xl"
//               >
//                 ✖
//               </button>

//               <h2 className="text-2xl font-bold mb-4 text-indigo-700">
//                 {selectedPolicy.name || "Policy Details"}
//               </h2>

//               <div className="space-y-2 text-gray-700">

//                 <p><strong>Coverage:</strong> ₹{getCoverage(selectedPolicy)}</p>
//                 <p><strong>Premium:</strong> ₹{getPremium(selectedPolicy)}</p>
//                 <p>
//                   <strong>Value Score:</strong>{" "}
//                   {(getCoverage(selectedPolicy) /
//                     getPremium(selectedPolicy)).toFixed(2)}
//                 </p>

//                 <p>
//                   <strong>Description:</strong>{" "}
//                   {selectedPolicy.description || "Not Available"}
//                 </p>

//                 <p>
//                   <strong>Provider:</strong>{" "}
//                   {getProviderName(selectedPolicy.provider)}
//                 </p>

//               </div>

//             </div>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// };

// export default Policies;
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { policiesAPI } from "../services/api";
import PolicyCard from "../components/PolicyCard";
import { useNavigate } from "react-router-dom";

const Policies = () => {

  const navigate = useNavigate();

  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const res = await policiesAPI.getPolicies();
      setPolicies(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  /* SAFE NUMBER EXTRACT */
  const extractNumber = (value) => {
    if (!value) return null;
    if (typeof value === "number") return value;
    if (typeof value === "string") return Number(value);

    if (typeof value === "object") {
      return value.amount || value.value || null;
    }
    return null;
  };

  const getCoverage = (p) =>
    extractNumber(p.coverage) ||
    extractNumber(p.coverage_amount) ||
    extractNumber(p.sum_insured) ||
    100000;

  const getPremium = (p) =>
    extractNumber(p.premium) ||
    extractNumber(p.premium_amount) ||
    extractNumber(p.price) ||
    5000;

  const getValueScore = (p) =>
    (getCoverage(p) / getPremium(p)).toFixed(2);

  const getProviderName = (provider) => {
    if (!provider) return "Not Available";
    if (typeof provider === "object") return provider.name;
    return provider;
  };

  const toggleSelect = (policy) => {
    const exists = selected.find((p) => p.id === policy.id);

    if (exists) {
      setSelected(selected.filter((p) => p.id !== policy.id));
    } else {
      if (selected.length >= 3) return;
      setSelected([...selected, policy]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      <Navbar />

      <div className="max-w-7xl mx-auto p-10">

        <h1 className="text-4xl font-bold mb-8">
          Insurance Policies
        </h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {policies.map((policy) => (
              <div key={policy.id} className="relative">

                <label className="absolute top-3 right-3 bg-white px-2 py-1 rounded shadow text-sm">
                  <input
                    type="checkbox"
                    checked={selected.some((p) => p.id === policy.id)}
                    onChange={() => toggleSelect(policy)}
                  /> Compare
                </label>

                <PolicyCard
                  policy={policy}
                  onView={setSelectedPolicy}
                  onCompare={toggleSelect}
                />

              </div>
            ))}

          </div>
        )}

        {/* ⭐ Compare Section */}
        {selected.length >= 2 && (
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-6">

            <h2 className="text-2xl font-bold mb-6 text-indigo-700">
              Compare Selected Policies
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

              {selected.map((p) => (
                <div
                  key={p.id}
                  className="border rounded-xl p-4 bg-gradient-to-br from-blue-50 to-indigo-50"
                >
                  <h3 className="font-bold text-lg mb-2">
                    {p.name || "Policy:"+p.id}
                  </h3>

                  <p>Coverage: ₹{getCoverage(p)}</p>
                  <p>Premium: ₹{getPremium(p)}</p>
                  <p>Value Score: {getValueScore(p)}</p>

                </div>
              ))}

            </div>

            <div className="text-center mt-6">
              <button
                onClick={() =>
                  navigate("/compare-policies", {
                    state: { policies: selected },
                  })
                }
                className="bg-green-600 text-white px-8 py-3 rounded-xl shadow font-semibold"
              >
                Open Full Compare Page
              </button>
            </div>

          </div>
        )}

        {/* ⭐ SMALL VIEW DETAILS WINDOW */}
        {selectedPolicy && (
          <div className="fixed bottom-10 right-10 z-50">

            <div className="w-[420px] bg-gradient-to-br from-white to-indigo-50 border border-indigo-200 rounded-2xl shadow-2xl p-6 relative">

              <button
                onClick={() => setSelectedPolicy(null)}
                className="absolute top-2 right-3 text-lg font-bold text-gray-500 hover:text-red-500"
              >
                ✖
              </button>

              <h2 className="text-xl font-bold text-indigo-700 mb-4">
                {selectedPolicy.name || "Policy Details"}
              </h2>

              <div className="space-y-2 text-gray-700 text-sm">

                <p>Coverage: ₹{getCoverage(selectedPolicy)}</p>
                <p>Premium: ₹{getPremium(selectedPolicy)}</p>
                <p>Value Score: {getValueScore(selectedPolicy)}</p>

                <p>
                  Description:{" "}
                  {selectedPolicy.description ||
                    "This policy provides financial protection and benefits."}
                </p>

                <p>
                  Provider:{" "}
                  {getProviderName(selectedPolicy.provider)}
                </p>

              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default Policies;
