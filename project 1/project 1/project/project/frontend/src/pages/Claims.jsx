import { useState } from "react";
import Navbar from "../components/Navbar";

const Claims = () => {
  const [preview, setPreview] = useState(null);

  const [claim, setClaim] = useState({
    policyName: "",
    claimAmount: "",
    incidentDate: "",
    reason: "",
    document: "",
  });

  const handleFile = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setPreview(reader.result);
      setClaim({ ...claim, document: reader.result });
    };

    if (file) reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    const existing =
      JSON.parse(localStorage.getItem("claims")) || [];

    const fraudFlags = [];

    if (claim.claimAmount > 500000)
      fraudFlags.push("High Amount");

    const duplicate = existing.find(
      (c) => c.document === claim.document
    );

    if (duplicate)
      fraudFlags.push("Duplicate Document");

    const newClaim = {
      ...claim,
      id: Date.now(),
      userEmail:
        JSON.parse(localStorage.getItem("user"))?.email,
      status: "Pending",
      fraudFlags,
      submittedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "claims",
      JSON.stringify([...existing, newClaim])
    );

    alert("Claim Submitted Successfully!");
  };

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto mt-10 bg-white p-8 shadow rounded-xl">
        <h2 className="text-2xl font-bold mb-6">
          File a Claim
        </h2>

        <input
          placeholder="Policy Name"
          className="border p-3 w-full mb-3 rounded"
          onChange={(e) =>
            setClaim({ ...claim, policyName: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Claim Amount"
          className="border p-3 w-full mb-3 rounded"
          onChange={(e) =>
            setClaim({ ...claim, claimAmount: e.target.value })
          }
        />

        <input
          type="date"
          className="border p-3 w-full mb-3 rounded"
          onChange={(e) =>
            setClaim({ ...claim, incidentDate: e.target.value })
          }
        />

        <textarea
          placeholder="Reason for Claim"
          className="border p-3 w-full mb-3 rounded"
          onChange={(e) =>
            setClaim({ ...claim, reason: e.target.value })
          }
        />

        <input type="file" onChange={handleFile} />

        {preview && (
          <img
            src={preview}
            alt="preview"
            className="w-40 mt-4 border"
          />
        )}

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 mt-6 rounded"
        >
          Submit Claim
        </button>
      </div>
    </>
  );
};

export default Claims;
