// // import { useEffect, useState } from "react";
// // import Navbar from "../components/Navbar";
// // import { useNavigate } from "react-router-dom";

// // const AdminDashboard = () => {
// //   const navigate = useNavigate();
// //   const [claims, setClaims] = useState([]);

// //   useEffect(() => {
// //     const role = localStorage.getItem("role");
// //     if (role !== "admin") {
// //       navigate("/");
// //     }

// //     const storedClaims =
// //       JSON.parse(localStorage.getItem("claims")) || [];
// //     setClaims(storedClaims);
// //   }, [navigate]);

// //   const updateStatus = (id, status) => {
// //     const updatedClaims = claims.map((claim) =>
// //       claim.id === id ? { ...claim, status } : claim
// //     );

// //     setClaims(updatedClaims);
// //     localStorage.setItem("claims", JSON.stringify(updatedClaims));
// //   };

// //   return (
// //     <>
// //       <Navbar />

// //       <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-8">
// //         <h1 className="text-3xl font-bold text-purple-700 mb-8">
// //           Admin Dashboard
// //         </h1>

// //         {claims.length === 0 ? (
// //           <div className="bg-white p-8 rounded-xl shadow text-center">
// //             No claims submitted yet.
// //           </div>
// //         ) : (
// //           claims.map((claim) => (
// //             <div
// //               key={claim.id}
// //               className="bg-white p-6 rounded-xl shadow mb-6"
// //             >
// //               <p><strong>User:</strong> {claim.userEmail}</p>
// //               <p><strong>Policy:</strong> {claim.policyName}</p>
// //               <p><strong>Amount:</strong> ₹{claim.claimAmount}</p>
// //               <p><strong>Status:</strong> {claim.status}</p>

// //               <div className="flex gap-4 mt-4">
// //                 <button
// //                   onClick={() => updateStatus(claim.id, "Approved")}
// //                   className="bg-green-600 text-white px-4 py-2 rounded-lg"
// //                 >
// //                   Approve
// //                 </button>

// //                 <button
// //                   onClick={() => updateStatus(claim.id, "Rejected")}
// //                   className="bg-red-600 text-white px-4 py-2 rounded-lg"
// //                 >
// //                   Reject
// //                 </button>
// //               </div>
// //             </div>
// //           ))
// //         )}
// //       </div>
// //     </>
// //   );
// // };

// // export default AdminDashboard;
// import { useEffect, useState } from "react";
// import Navbar from "../components/Navbar";
// const AdminDashboard = () => {
//   const [claims, setClaims] = useState([]);

//   useEffect(() => {
//     const storedClaims =
//       JSON.parse(localStorage.getItem("claims")) || [];
//     setClaims(storedClaims);
//   }, []);

//   const updateStatus = (id, status) => {
//     const updatedClaims = claims.map((claim) =>
//       claim.id === id ? { ...claim, status } : claim
//     );

//     setClaims(updatedClaims);
//     localStorage.setItem("claims", JSON.stringify(updatedClaims));
//   };

//   return (
//     <div className="admin-page">
//       <div className="admin-container">
//         <h2>Admin Claim Management</h2>

//         <div className="admin-grid">
//           {claims.length === 0 ? (
//             <p>No claims submitted.</p>
//           ) : (
//             claims.map((claim) => (
//               <div key={claim.id} className="admin-card">
//                 <h3>{claim.policyNumber}</h3>
//                 <p>₹{claim.claimAmount}</p>
//                 <p>{claim.incidentDate}</p>
//                 <p>{claim.description}</p>
//                 <p>Submitted: {claim.submittedAt}</p>

//                 <span className={`status ${claim.status}`}>
//                   {claim.status}
//                 </span>

//                 {claim.status === "Pending" && (
//                   <div className="btn-group">
//                     <button
//                       className="approve"
//                       onClick={() => updateStatus(claim.id, "Approved")}
//                     >
//                       Approve
//                     </button>
//                     <button
//                       className="reject"
//                       onClick={() => updateStatus(claim.id, "Rejected")}
//                     >
//                       Reject
//                     </button>
//                   </div>
//                 )}
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       <style>{`
//         .admin-page {
//           min-height: 100vh;
//           background: #f3f4f6;
//           padding: 40px;
//         }

//         .admin-container {
//           max-width: 1100px;
//           margin: auto;
//         }

//         .admin-container h2 {
//           font-size: 28px;
//           margin-bottom: 30px;
//           color: #7c3aed;
//         }

//         .admin-grid {
//           display: grid;
//           gap: 20px;
//         }

//         .admin-card {
//           background: white;
//           padding: 20px;
//           border-radius: 12px;
//           box-shadow: 0 5px 15px rgba(0,0,0,0.08);
//           position: relative;
//         }

//         .status {
//           position: absolute;
//           top: 20px;
//           right: 20px;
//           padding: 5px 12px;
//           border-radius: 20px;
//           color: white;
//         }

//         .Pending { background: orange; }
//         .Approved { background: green; }
//         .Rejected { background: red; }

//         .btn-group {
//           margin-top: 15px;
//           display: flex;
//           gap: 10px;
//         }

//         .approve {
//           background: green;
//           color: white;
//           padding: 8px 15px;
//           border-radius: 8px;
//           border: none;
//           cursor: pointer;
//         }

//         .reject {
//           background: red;
//           color: white;
//           padding: 8px 15px;
//           border-radius: 8px;
//           border: none;
//           cursor: pointer;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default AdminDashboard;
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

const AdminDashboard = () => {
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    const storedClaims =
      JSON.parse(localStorage.getItem("claims")) || [];
    setClaims(storedClaims);
  }, []);

  const updateStatus = (id, newStatus) => {
    const updatedClaims = claims.map((claim) =>
      claim.id === id ? { ...claim, status: newStatus } : claim
    );

    setClaims(updatedClaims);
    localStorage.setItem("claims", JSON.stringify(updatedClaims));
  };

  return (
    <>
      <Navbar />

      <div className="page">
        <h2>Admin Dashboard</h2>

        <div className="grid">
          {claims.map((claim) => (
            <div key={claim.id} className="claim-card">
              <h3>Policy #{claim.policyNumber}</h3>
              <p><strong>Amount:</strong> ₹{claim.claimAmount}</p>
              <p><strong>Date:</strong> {claim.incidentDate}</p>
              <p><strong>Description:</strong> {claim.description}</p>

              <div className="actions">
                <button className="approve"
                  onClick={() => updateStatus(claim.id, "Approved")}>
                  Approve
                </button>

                <button className="reject"
                  onClick={() => updateStatus(claim.id, "Rejected")}>
                  Reject
                </button>
              </div>

              <span className={`status ${claim.status}`}>
                {claim.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .page {
          min-height: 100vh;
          background: linear-gradient(135deg,#eef2ff,#e0f7fa);
          padding: 40px;
        }

        h2 {
          text-align: center;
          margin-bottom: 30px;
          color: #1e40af;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit,minmax(300px,1fr));
          gap: 25px;
        }

        .claim-card {
          background: white;
          padding: 20px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          position: relative;
        }

        .actions {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
        }

        .approve {
          background: #16a34a;
          color: white;
          padding: 8px 15px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        .reject {
          background: #dc2626;
          color: white;
          padding: 8px 15px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        .status {
          position: absolute;
          top: 15px;
          right: 15px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          color: white;
        }

        .Pending { background: orange; }
        .Approved { background: #16a34a; }
        .Rejected { background: #dc2626; }
      `}</style>
    </>
  );
};

export default AdminDashboard;
