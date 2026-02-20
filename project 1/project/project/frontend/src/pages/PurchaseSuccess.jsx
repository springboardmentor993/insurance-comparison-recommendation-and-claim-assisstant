// // import { useNavigate } from "react-router-dom";
// // import Navbar from "../components/Navbar";

// // const PurchaseSuccess = () => {
// //   const navigate = useNavigate();

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
// //       <Navbar />

// //       <div className="flex justify-center items-center h-[80vh]">
// //         <div className="bg-white p-10 rounded-xl shadow-xl text-center">

// //           <h1 className="text-3xl font-bold text-green-600">
// //             🎉 Policy Purchase Successful
// //           </h1>

// //           <p className="mt-4 text-gray-600">
// //             Your policy has been saved to your account.
// //           </p>

// //           <button
// //             onClick={() => navigate("/my-policies")}
// //             className="mt-6 bg-blue-600 text-white px-6 py-2 rounded"
// //           >
// //             View My Policies
// //           </button>

// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default PurchaseSuccess;
// import { useNavigate } from "react-router-dom";
// import Navbar from "../components/Navbar";

// const PurchaseSuccess = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen bg-green-50">
//       <Navbar />

//       <div className="flex flex-col items-center justify-center h-[80vh]">
//         <h1 className="text-3xl font-bold text-green-700 mb-4">
//           🎉 Policy Purchased Successfully
//         </h1>

//         <button
//           onClick={() => navigate("/my-policies")}
//           className="bg-blue-600 text-white px-6 py-3 rounded-lg"
//         >
//           View My Policies
//         </button>
//       </div>
//     </div>
//   );
// };

// export default PurchaseSuccess;
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const PurchaseSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />

      <div className="flex flex-col items-center justify-center h-[80vh]">
        <h1 className="text-4xl font-bold text-green-700">
          ✅ Policy Purchased Successfully
        </h1>

        <button
          onClick={() => navigate("/my-policies")}
          className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg"
        >
          View My Policy
        </button>
      </div>
    </div>
  );
};

export default PurchaseSuccess;
