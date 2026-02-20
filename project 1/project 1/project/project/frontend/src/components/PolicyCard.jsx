import {
  ShieldCheck,
  IndianRupee,
  Building2,
  CheckCircle,
} from "lucide-react";

const PolicyCard = ({ policy, onCompare, onView }) => {

  const getProviderName = () => {
    if (!policy.provider) return "Trusted Provider";
    if (typeof policy.provider === "object") return policy.provider.name;
    return policy.provider;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition">

      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">
            {policy.name || policy.policy_name || "Policy"}
          </h3>

          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
            <Building2 size={14} />
            {getProviderName()}
          </p>
        </div>

        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
          <ShieldCheck size={14} />
          Active
        </span>
      </div>

      {/* PREMIUM */}
      <div className="flex items-center gap-2 mb-4">
        <IndianRupee size={18} className="text-blue-600" />
        <span className="text-2xl font-bold">
          {policy.premium
            ? Number(policy.premium).toLocaleString()
            : "N/A"}
        </span>
        <span className="text-sm text-gray-500">/ year</span>
      </div>

      {/* FEATURES */}
      <ul className="text-sm text-gray-600 space-y-2 mb-6">
        <li className="flex gap-2">
          <CheckCircle size={14} className="text-green-500" />
          Cashless claims available
        </li>
        <li className="flex gap-2">
          <CheckCircle size={14} className="text-green-500" />
          Trusted partner
        </li>
        <li className="flex gap-2">
          <CheckCircle size={14} className="text-green-500" />
          24×7 support
        </li>
      </ul>

      {/* BUTTONS */}
      <div className="flex gap-3">

        <button
          onClick={() => onView(policy)}
          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold"
        >
          View Details
        </button>

        <button
          onClick={() => onCompare(policy)}
          className="flex-1 bg-gradient-to-r from-blue-600 to-teal-500 text-white py-2 rounded-lg font-semibold"
        >
          Compare
        </button>

      </div>

    </div>
  );
};

export default PolicyCard;
