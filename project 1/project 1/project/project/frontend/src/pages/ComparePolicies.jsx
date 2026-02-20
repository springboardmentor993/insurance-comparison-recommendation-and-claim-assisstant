
// import { useLocation, useNavigate } from "react-router-dom";
// import Navbar from "../components/Navbar";

// const ComparePolicies = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const policies = location.state?.policies || [];

//   // ✅ SAFE GETTERS
//   const getCoverage = (p) =>
//     p.coverage ||
//     p.coverage_amount ||
//     p.sum_insured ||
//     p.insured_amount ||
//     0;

//   const getPremium = (p) =>
//     p.premium ||
//     p.premium_amount ||
//     p.price ||
//     1;

//   // ✅ BEST POLICY
//   const getBestPolicy = () => {
//     if (!policies.length) return null;

//     return policies.reduce((best, current) => {
//       const bestScore = getCoverage(best) / getPremium(best);
//       const currentScore = getCoverage(current) / getPremium(current);
//       return currentScore > bestScore ? current : best;
//     });
//   };

//   const bestPolicy = getBestPolicy();

//   // ✅ BUY POLICY (Frontend Only)
//   const handleBuyPolicy = (policy) => {
//     localStorage.setItem("purchasedPolicy", JSON.stringify(policy));
//     navigate("/purchase-success");
//   };

//   if (!policies.length) {
//     return (
//       <div>
//         <Navbar />
//         <div className="p-10">
//           <h2>No policies selected</h2>
//           <button
//             onClick={() => navigate("/policies")}
//             className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
//       <Navbar />

//       <div className="max-w-6xl mx-auto p-10">

//         <h1 className="text-3xl font-bold mb-8">
//           Policy Comparison
//         </h1>

//         {/* ⭐ Recommended Policy */}
//         {bestPolicy && (
//           <div className="bg-green-50 border border-green-200 p-6 rounded-xl mb-8">
//             <h2 className="text-xl font-bold text-green-700">
//               ⭐ Recommended Policy
//             </h2>

//             <p className="mt-2 font-semibold">
//               {bestPolicy.title || bestPolicy.policy_name}
//             </p>

//             {/* <p>Coverage: ₹{getCoverage(bestPolicy)}</p> */}
//             <p>Premium: ₹{getPremium(bestPolicy)}</p>

//             <p className="mt-3 text-green-800">
//               Best value based on coverage vs premium ratio.
//             </p>

//             <button
//               onClick={() => handleBuyPolicy(bestPolicy)}
//               className="mt-4 bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
//             >
//               Buy Recommended Policy
//             </button>
//           </div>
//         )}

//         {/* ⭐ Table */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <table className="w-full border">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="p-3 text-left">Policy</th>
//                 {/* <th className="p-3 text-center">Coverage</th> */}
//                 <th className="p-3 text-center">Premium</th>
//                 <th className="p-3 text-center">Action</th>
//               </tr>
//             </thead>

//             <tbody>
//               {policies.map((p) => {
//                 const premium = getPremium(p);
//                 // const coverage = getCoverage(p);

//                 return (
//                   <tr
//                     key={p.id}
//                     className={
//                       bestPolicy?.id === p.id
//                         ? "bg-green-50 font-semibold"
//                         : ""
//                     }
//                   >
//                     <td className="p-3">
//                       {p.title || p.policy_name || "Policy"}
//                     </td>

//                     {/* <td className="p-3 text-center">
//                       ₹{coverage}
//                     </td> */}

//                     <td className="p-3 text-center">
//                       ₹{premium}
//                     </td>

//                     <td className="p-3 text-center">
//                       <button
//                         onClick={() => handleBuyPolicy(p)}
//                         className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//                       >
//                         Buy Policy
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>

//           </table>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default ComparePolicies;
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const ComparePolicies = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const policies = location.state?.policies || [];

  /* ---------------- SAFE GETTERS ---------------- */
  const getCoverage = (p) =>
    p.coverage ||
    p.coverage_amount ||
    p.sum_insured ||
    p.insured_amount ||
    0;

  const getPremium = (p) =>
    p.premium ||
    p.premium_amount ||
    p.price ||
    1;

  /* ---------------- BEST POLICY LOGIC ---------------- */
  const getBestPolicy = () => {
    if (!policies.length) return null;

    return policies.reduce((best, current) => {
      const bestScore = getCoverage(best) / getPremium(best);
      const currentScore = getCoverage(current) / getPremium(current);
      return currentScore > bestScore ? current : best;
    });
  };

  const bestPolicy = getBestPolicy();

  /* ---------------- BUY POLICY ---------------- */
  const handleBuyPolicy = (policy) => {
    const purchaseData = {
      ...policy,
      purchasedAt: new Date().toISOString(),
    };

    localStorage.setItem("purchasedPolicy", JSON.stringify(purchaseData));

    navigate("/purchase-success");
  };

  if (!policies.length) {
    return (
      <div>
        <Navbar />
        <div className="p-10">
          <h2>No policies selected</h2>
          <button
            onClick={() => navigate("/policies")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <Navbar />

      <div className="max-w-6xl mx-auto p-10">
        <h1 className="text-3xl font-bold mb-8">
          Policy Comparison
        </h1>

        {/* ⭐ RECOMMENDED POLICY */}
        {bestPolicy && (
          <div className="bg-green-50 border border-green-200 p-6 rounded-xl mb-8">
            <h2 className="text-xl font-bold text-green-700">
              ⭐ Recommended Policy
            </h2>

            <p className="mt-2 font-semibold">
              {bestPolicy.title || bestPolicy.policy_name}
            </p>

            {/* <p>Coverage: ₹{getCoverage(bestPolicy)}</p> */}
            <p>Premium: ₹{getPremium(bestPolicy)}</p>

            <button
              onClick={() => handleBuyPolicy(bestPolicy)}
              className="mt-4 bg-green-600 text-white px-5 py-2 rounded"
            >
              Buy Recommended Policy
            </button>
          </div>
        )}

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow p-6">
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Policy</th>
                {/* <th className="p-3 text-center">Coverage</th> */}
                <th className="p-3 text-center">Premium</th>
                {/* <th className="p-3 text-center">Action</th> */}
              </tr>
            </thead>

            <tbody>
              {policies.map((p) => {
                const premium = getPremium(p);
                const coverage = getCoverage(p);

                return (
                  <tr
                    key={p.id}
                    className={
                      bestPolicy?.id === p.id
                        ? "bg-green-50 font-semibold"
                        : ""
                    }
                  >
                    <td className="p-3">
                      {p.title || p.policy_name || "Policy"}
                    </td>

                    {/* <td className="p-3 text-center">
                      ₹{coverage}
                    </td> */}

                    <td className="p-3 text-center">
                      ₹{premium}
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleBuyPolicy(p)}
                        className="bg-blue-600 text-white px-4 py-1 rounded"
                      >
                        Buy
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComparePolicies;
