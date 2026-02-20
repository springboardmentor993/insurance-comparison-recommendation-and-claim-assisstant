import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

const ClaimStatus = () => {
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    const storedClaims =
      JSON.parse(localStorage.getItem("claims")) || [];
    setClaims(storedClaims);
  }, []);

  return (
    <>
      <Navbar />

      <div className="page">
        <div className="container">
          <h2>My Claims</h2>

          {claims.length === 0 ? (
            <p className="empty">No claims submitted yet.</p>
          ) : (
            <div className="grid">
              {claims.map((claim) => (
                <div key={claim.id} className="claim-card">
                  <h3>Policy #{claim.policyNumber}</h3>
                  <p><strong>Amount:</strong> ₹{claim.claimAmount}</p>
                  <p><strong>Date:</strong> {claim.incidentDate}</p>
                  <p><strong>Description:</strong> {claim.description}</p>

                  <span className={`status ${claim.status}`}>
                    {claim.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .page {
          min-height: 100vh;
          background: linear-gradient(135deg,#eef2ff,#e0f7fa);
          padding: 40px;
        }

        .container {
          max-width: 1100px;
          margin: auto;
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

        .empty {
          text-align: center;
          color: gray;
        }
      `}</style>
    </>
  );
};

export default ClaimStatus;
