// // import { useEffect, useState } from "react";
// // import Navbar from "../components/Navbar";
// // import axios from "axios";

// // const MyPolicies = () => {

// //   const [policies, setPolicies] = useState([]);

// //   useEffect(() => {
// //     fetchPolicies();
// //   }, []);

// //   const fetchPolicies = async () => {
// //     try {
// //       const res = await axios.get("/api/user/my-policies");
// //       setPolicies(res.data);
// //     } catch {
// //       console.log("Backend not connected yet");
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
// //       <Navbar />

// //       <div className="max-w-5xl mx-auto p-10">

// //         <h1 className="text-3xl font-bold mb-8">
// //           My Purchased Policies
// //         </h1>

// //         {policies.length === 0 && (
// //           <p>No policies purchased yet</p>
// //         )}

// //         <div className="grid md:grid-cols-2 gap-6">
// //           {policies.map((p) => (
// //             <div key={p.id} className="bg-white p-6 rounded-xl shadow">

// //               <h3 className="font-bold text-lg">
// //                 {p.policyName}
// //               </h3>

// //               <p>Coverage: ₹{p.coverage}</p>
// //               <p>Premium: ₹{p.premium}</p>

// //               <p className="text-green-600 mt-2">
// //                 Active Policy
// //               </p>

// //             </div>
// //           ))}
// //         </div>

// //       </div>
// //     </div>
// //   );
// // };

// // export default MyPolicies;
// import Navbar from "../components/Navbar";

// const MyPolicies = () => {
//   const policy = JSON.parse(localStorage.getItem("purchasedPolicy"));

//   return (
//     <div className="min-h-screen bg-blue-50">
//       <Navbar />

//       <div className="max-w-4xl mx-auto p-10">
//         <h1 className="text-3xl font-bold mb-6">
//           My Purchased Policy
//         </h1>

//         {!policy ? (
//           <p>No policy purchased yet.</p>
//         ) : (
//           <div className="bg-white shadow rounded-xl p-6">
//             <h2 className="text-xl font-bold mb-2">
//               {policy.title || policy.policy_name}
//             </h2>

//             <p>
//               Coverage: ₹
//               {policy.coverage ||
//                 policy.coverage_amount ||
//                 policy.sum_insured ||
//                 0}
//             </p>

//             <p>
//               Premium: ₹
//               {policy.premium ||
//                 policy.premium_amount ||
//                 policy.price ||
//                 0}
//             </p>

//             <p className="mt-2 text-gray-600">
//               {policy.description || "No description available"}
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MyPolicies;
import Navbar from "../components/Navbar";

const MyPolicies = () => {
  const policy = JSON.parse(localStorage.getItem("purchasedPolicy"));

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not available";

    const date = new Date(dateString);

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar />

      <div className="max-w-4xl mx-auto p-10">
        <h1 className="text-3xl font-bold mb-6">
          My Purchased Policy
        </h1>

        {!policy ? (
          <p>No policy purchased yet.</p>
        ) : (
          <div className="bg-white shadow rounded-xl p-6 border border-blue-100">

            <h2 className="text-xl font-bold mb-3">
              {policy.title || policy.policy_name}
            </h2>

            <p className="mb-2">
              <span className="font-semibold">Premium:</span> ₹
              {policy.premium ||
                policy.premium_amount ||
                policy.price ||
                0}
            </p>

            <p className="mb-2">
              <span className="font-semibold">Description:</span>{" "}
              {policy.description || "Provides coverage for various unexpected risks including accidents, damages, and losses. Helps individuals and families stay financially protected during unforeseen situations."}
            </p>

            <p className="text-gray-600 text-sm mt-4">
              Purchased On: {formatDateTime(policy.purchasedAt)}
            </p>

          </div>
        )}
      </div>
    </div>
  );
};

export default MyPolicies;
