// import { useState, useEffect } from "react";
// import Navbar from "../components/Navbar";
// const ClaimStatus = () => {
//   const [claims, setClaims] = useState([]);
//   const [formOpen, setFormOpen] = useState(false);

//   const [claimData, setClaimData] = useState({
//     policyNumber: "",
//     claimAmount: "",
//     incidentDate: "",
//     description: "",
//   });

//   useEffect(() => {
//     const storedClaims =
//       JSON.parse(localStorage.getItem("claims")) || [];
//     setClaims(storedClaims);
//   }, []);

//   const handleChange = (e) => {
//     setClaimData({ ...claimData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = () => {
//     const existingClaims =
//       JSON.parse(localStorage.getItem("claims")) || [];

//     const newClaim = {
//       id: Date.now(),
//       ...claimData,
//       status: "Pending",
//       submittedAt: new Date().toLocaleString(),
//     };

//     const updatedClaims = [...existingClaims, newClaim];

//     localStorage.setItem("claims", JSON.stringify(updatedClaims));
//     setClaims(updatedClaims);

//     setClaimData({
//       policyNumber: "",
//       claimAmount: "",
//       incidentDate: "",
//       description: "",
//     });

//     setFormOpen(false);
//   };

//   return (
//     <div className="page">
//       <div className="container">
//         <div className="header">
//           <h2>My Claims</h2>
//           <button onClick={() => setFormOpen(!formOpen)}>
//             {formOpen ? "Close" : "File New Claim"}
//           </button>
//         </div>

//         {formOpen && (
//           <div className="form-card">
//             <input
//               type="text"
//               name="policyNumber"
//               placeholder="Policy Number"
//               value={claimData.policyNumber}
//               onChange={handleChange}
//             />

//             <input
//               type="number"
//               name="claimAmount"
//               placeholder="Claim Amount"
//               value={claimData.claimAmount}
//               onChange={handleChange}
//             />

//             <input
//               type="date"
//               name="incidentDate"
//               value={claimData.incidentDate}
//               onChange={handleChange}
//             />

//             <textarea
//               name="description"
//               placeholder="Describe the incident"
//               value={claimData.description}
//               onChange={handleChange}
//             />

//             <button className="submit-btn" onClick={handleSubmit}>
//               Submit Claim
//             </button>
//           </div>
//         )}

//         <div className="claims-grid">
//           {claims.length === 0 ? (
//             <p>No claims submitted yet.</p>
//           ) : (
//             claims.map((claim) => (
//               <div key={claim.id} className="claim-card">
//                 <h3>Policy: {claim.policyNumber}</h3>
//                 <p>Amount: ₹{claim.claimAmount}</p>
//                 <p>Date: {claim.incidentDate}</p>
//                 <p>Description: {claim.description}</p>
//                 <p>Submitted: {claim.submittedAt}</p>

//                 <span className={`status ${claim.status}`}>
//                   {claim.status}
//                 </span>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       <style>{`
//         .page {
//           min-height: 100vh;
//           background: linear-gradient(135deg,#eef2ff,#e0f7fa);
//           padding: 40px;
//         }

//         .container {
//           max-width: 1000px;
//           margin: auto;
//         }

//         .header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 30px;
//         }

//         .header h2 {
//           font-size: 28px;
//           color: #2563eb;
//         }

//         .header button {
//           background: #2563eb;
//           color: white;
//           padding: 10px 20px;
//           border-radius: 8px;
//           border: none;
//           cursor: pointer;
//         }

//         .form-card {
//           background: white;
//           padding: 25px;
//           border-radius: 12px;
//           box-shadow: 0 10px 25px rgba(0,0,0,0.08);
//           margin-bottom: 30px;
//         }

//         .form-card input,
//         .form-card textarea {
//           width: 100%;
//           padding: 10px;
//           margin-bottom: 15px;
//           border-radius: 8px;
//           border: 1px solid #ccc;
//         }

//         .submit-btn {
//           background: #16a34a;
//           color: white;
//           padding: 10px 20px;
//           border-radius: 8px;
//           border: none;
//           cursor: pointer;
//         }

//         .claims-grid {
//           display: grid;
//           gap: 20px;
//         }

//         .claim-card {
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
//       `}</style>
//     </div>
//   );
// };

// export default ClaimStatus;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const FileClaim = () => {
  const navigate = useNavigate();

  const [claimData, setClaimData] = useState({
    policyNumber: "",
    claimAmount: "",
    incidentDate: "",
    description: "",
  });

  const handleChange = (e) => {
    setClaimData({ ...claimData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const existingClaims =
      JSON.parse(localStorage.getItem("claims")) || [];

    const newClaim = {
      id: Date.now(),
      ...claimData,
      status: "Pending",
      submittedAt: new Date().toLocaleString(),
    };

    localStorage.setItem(
      "claims",
      JSON.stringify([...existingClaims, newClaim])
    );

    alert("Claim Submitted Successfully!");
    navigate("/claim-status");
  };

  return (
    <>
      <Navbar />

      <div className="page">
        <div className="card">
          <h2>File Insurance Claim</h2>

          <input type="text" name="policyNumber" placeholder="Policy Number" onChange={handleChange} />
          <input type="number" name="claimAmount" placeholder="Claim Amount" onChange={handleChange} />
          <input type="date" name="incidentDate" onChange={handleChange} />
          <textarea name="description" placeholder="Describe the incident" onChange={handleChange} />

          <button onClick={handleSubmit}>Submit Claim</button>
        </div>
      </div>

      <style>{`
        .page {
          min-height: 100vh;
          background: linear-gradient(135deg,#eef2ff,#e0f7fa);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px;
        }

        .card {
          background: #fff;
          padding: 35px;
          width: 100%;
          max-width: 500px;
          border-radius: 18px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.1);
        }

        h2 {
          text-align: center;
          margin-bottom: 25px;
          color: #1e40af;
        }

        input, textarea {
          width: 100%;
          padding: 12px;
          margin-bottom: 18px;
          border-radius: 10px;
          border: 1px solid #d1d5db;
          font-size: 14px;
        }

        textarea {
          resize: none;
          height: 90px;
        }

        button {
          width: 100%;
          padding: 12px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }

        button:hover {
          background: #1e3a8a;
        }
      `}</style>
    </>
  );
};

export default FileClaim;
