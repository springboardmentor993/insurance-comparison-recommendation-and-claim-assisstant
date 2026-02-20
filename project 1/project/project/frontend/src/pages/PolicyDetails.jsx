import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const PolicyDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const policy = location.state?.policy;

  if (!policy) {
    return (
      <div>
        <Navbar />
        <div className="p-10">
          <h2>Policy not found</h2>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />

      <div className="max-w-4xl mx-auto p-10">

        <h1 className="text-3xl font-bold mb-6">
          {policy.title || policy.policy_name}
        </h1>

        <div className="bg-white shadow rounded-xl p-6 space-y-4">

          <p><strong>Policy Type:</strong> {policy.policy_type}</p>

          <p><strong>Coverage:</strong> ₹
            {policy.coverage ||
              policy.coverage_amount ||
              policy.sum_insured}
          </p>

          <p><strong>Premium:</strong> ₹
            {policy.premium ||
              policy.premium_amount ||
              policy.price}
          </p>

          <p><strong>Description:</strong> {policy.description}</p>

          <p><strong>Provider:</strong> {policy.provider}</p>

          <p><strong>Tenure:</strong> {policy.tenure} Years</p>

        </div>

        <button
          onClick={() => navigate("/policies")}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded"
        >
          Back to Policies
        </button>

      </div>
    </div>
  );
};

export default PolicyDetails;
