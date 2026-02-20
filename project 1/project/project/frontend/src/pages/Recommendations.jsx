import { useState } from "react";
import Navbar from "../components/Navbar";
import { TrendingUp, AlertTriangle, X } from "lucide-react";

/* ================= POLICY DATA ================= */

const POLICIES = [
  /* ================= HEALTH POLICIES ================= */
  {
    id: 1,
    type: "health",
    name: "HDFC Health Suraksha Plus",
    provider: "HDFC Ergo",
    premium: 12000,
    coverageValue: 10,
    coverage: "₹10 Lakhs",
    term: "1 Year",
    benefits: "Cashless hospitals, No-claim bonus",
  },
  {
    id: 2,
    type: "health",
    name: "Star Comprehensive Health",
    provider: "Star Health",
    premium: 15000,
    coverageValue: 15,
    coverage: "₹15 Lakhs",
    term: "1 Year",
    benefits: "Maternity cover, OPD expenses",
  },
  {
    id: 3,
    type: "health",
    name: "ICICI Lombard Complete Health",
    provider: "ICICI Lombard",
    premium: 18000,
    coverageValue: 20,
    coverage: "₹20 Lakhs",
    term: "1 Year",
    benefits: "Wellness rewards, annual health checkups",
  },
  {
    id: 4,
    type: "health",
    name: "Care Supreme Health Plan",
    provider: "Care Health",
    premium: 20000,
    coverageValue: 25,
    coverage: "₹25 Lakhs",
    term: "1 Year",
    benefits: "Unlimited recharge, global coverage",
  },
  {
    id: 5,
    type: "health",
    name: "Max Bupa Health Companion",
    provider: "Niva Bupa",
    premium: 14000,
    coverageValue: 12,
    coverage: "₹12 Lakhs",
    term: "1 Year",
    benefits: "Daycare procedures, family floater",
  },

  /* ================= LIFE POLICIES ================= */
  {
    id: 6,
    type: "life",
    name: "LIC Jeevan Anand",
    provider: "LIC India",
    premium: 18000,
    coverageValue: 20,
    coverage: "₹50 Lakhs",
    term: "25 Years",
    benefits: "Lifetime risk cover, maturity benefit",
  },
  {
    id: 7,
    type: "life",
    name: "HDFC Click 2 Protect",
    provider: "HDFC Life",
    premium: 15000,
    coverageValue: 25,
    coverage: "₹1 Crore",
    term: "30 Years",
    benefits: "Pure term plan, critical illness rider",
  },
  {
    id: 8,
    type: "life",
    name: "ICICI iProtect Smart",
    provider: "ICICI Prudential",
    premium: 17000,
    coverageValue: 30,
    coverage: "₹1.2 Crore",
    term: "30 Years",
    benefits: "Accidental death benefit",
  },
  {
    id: 9,
    type: "life",
    name: "Max Life Smart Secure Plus",
    provider: "Max Life",
    premium: 16000,
    coverageValue: 28,
    coverage: "₹1 Crore",
    term: "35 Years",
    benefits: "Terminal illness cover",
  },

  /* ================= AUTO POLICIES ================= */
  {
    id: 10,
    type: "auto",
    name: "Bajaj Allianz Motor Secure",
    provider: "Bajaj Allianz",
    premium: 8000,
    coverageValue: 15,
    coverage: "Own Damage + Third Party",
    term: "1 Year",
    benefits: "Zero depreciation, roadside assistance",
  },
  {
    id: 11,
    type: "auto",
    name: "ICICI Lombard Motor Shield",
    provider: "ICICI Lombard",
    premium: 9000,
    coverageValue: 18,
    coverage: "Comprehensive",
    term: "1 Year",
    benefits: "Engine protect, cashless garages",
  },
  {
    id: 12,
    type: "auto",
    name: "HDFC ERGO Car Insurance",
    provider: "HDFC Ergo",
    premium: 7500,
    coverageValue: 14,
    coverage: "Comprehensive",
    term: "1 Year",
    benefits: "Unlimited claims, towing assistance",
  },
  {
    id: 13,
    type: "auto",
    name: "Tata AIG Auto Secure",
    provider: "Tata AIG",
    premium: 8500,
    coverageValue: 16,
    coverage: "Comprehensive",
    term: "1 Year",
    benefits: "Consumables cover, key replacement",
  },

  /* ================= HOME POLICIES ================= */
  {
    id: 14,
    type: "home",
    name: "HDFC ERGO Home Secure",
    provider: "HDFC Ergo",
    premium: 6000,
    coverageValue: 20,
    coverage: "₹50 Lakhs",
    term: "1 Year",
    benefits: "Fire, burglary, natural disasters",
  },
  {
    id: 15,
    type: "home",
    name: "ICICI Lombard Home Shield",
    provider: "ICICI Lombard",
    premium: 7500,
    coverageValue: 25,
    coverage: "₹75 Lakhs",
    term: "1 Year",
    benefits: "Structure + contents cover",
  },
  {
    id: 16,
    type: "home",
    name: "Bajaj Allianz Home Guard",
    provider: "Bajaj Allianz",
    premium: 8000,
    coverageValue: 30,
    coverage: "₹1 Crore",
    term: "1 Year",
    benefits: "Earthquake, flood protection",
  },

  /* ================= OTHER POLICIES ================= */
  {
    id: 17,
    type: "other",
    name: "Tata AIG Travel Guard",
    provider: "Tata AIG",
    premium: 5000,
    coverageValue: 10,
    coverage: "₹25 Lakhs",
    term: "Trip Duration",
    benefits: "Medical emergencies, baggage loss",
  },
  {
    id: 18,
    type: "other",
    name: "ICICI Lombard Student Travel",
    provider: "ICICI Lombard",
    premium: 6500,
    coverageValue: 15,
    coverage: "₹40 Lakhs",
    term: "1 Year",
    benefits: "Overseas education coverage",
  },
  {
    id: 19,
    type: "other",
    name: "HDFC Cyber Protect",
    provider: "HDFC Ergo",
    premium: 3000,
    coverageValue: 8,
    coverage: "₹10 Lakhs",
    term: "1 Year",
    benefits: "Online fraud, identity theft",
  },
];

/* ================= MAIN COMPONENT ================= */

const Recommendations = () => {
  const prefs = JSON.parse(localStorage.getItem("preferences"));
  const riskProfile = localStorage.getItem("riskProfile");

  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const filteredPolicies = POLICIES.filter(
    (p) => p.type === prefs.policy
  );

  /* 🔥 REALISTIC SCORE ENGINE */
  const scoredPolicies = filteredPolicies.map((p) => {
    let score = 0;
    let reason = "";

    /* BASE SCORE */
    score += 30;

    /* BUDGET LOGIC */
    if (p.premium <= prefs.maxPremium) {
      score += 25;
      reason += "Fits within your budget. ";
    } else {
      score -= 15;
      reason += "Premium is higher than your budget. ";
    }

    /* COVERAGE vs RISK */
    if (riskProfile === "High Risk") {
      if (p.coverageValue >= 20) {
        score += 30;
        reason += "High coverage suits your high-risk profile. ";
      } else {
        score -= 10;
        reason += "Coverage may be insufficient for high-risk profile. ";
      }
    }

    if (riskProfile === "Normal") {
      if (p.coverageValue >= 15) {
        score += 25;
        reason += "Balanced coverage for normal risk profile. ";
      } else {
        score -= 5;
        reason += "Coverage slightly low for your profile. ";
      }
    }

    if (riskProfile === "Safe") {
      if (p.coverageValue >= 10) {
        score += 20;
        reason += "Adequate coverage for safe profile. ";
      }
    }

    /* SCORE CLAMP */
    score = Math.max(40, Math.min(score, 95));

    return { ...p, score, reason };
  });

  scoredPolicies.sort((a, b) => b.score - a.score);
  const bestPolicy = scoredPolicies[0];

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-teal-100 p-6">
        <div className="max-w-5xl mx-auto">

          {/* HEADER */}
          <h1 className="text-3xl font-bold text-center mb-4">
            Recommended Insurance Policies
          </h1>

          {/* RISK PROFILE */}
          <div className="flex justify-center mb-6">
            <span
              className={`px-5 py-2 rounded-full font-semibold ${
                riskProfile === "High Risk"
                  ? "bg-red-100 text-red-700"
                  : riskProfile === "Normal"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              Risk Profile: {riskProfile}
            </span>
          </div>

          {/* POLICIES */}
          {scoredPolicies.map((p) => (
            <div
              key={p.id}
              className={`bg-white rounded-2xl shadow-md p-6 mb-6 border ${
                p.id === bestPolicy.id
                  ? "border-green-400"
                  : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{p.name}</h2>
                  <p className="text-gray-600 text-sm">{p.provider}</p>
                </div>

                <div className="text-right">
                  {p.id === bestPolicy.id && (
                    <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full">
                      Best Match
                    </span>
                  )}
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {/* {p.score}% */}
                  </p>
                </div>
              </div>

              {/* PROGRESS BAR */}
              {/* <div className="mt-3 bg-gray-200 h-2 rounded">
                <div
                  className={`h-2 rounded ${
                    p.score >= 80
                      ? "bg-green-500"
                      : p.score >= 65
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${p.score}%` }}
                />
              </div> */}

              {/* WHY TEXT */}
              <div className="mt-4 flex gap-3 bg-blue-50 p-4 rounded-lg">
                <TrendingUp className="text-blue-600 mt-1" />
                <p className="text-sm text-gray-700">{p.reason}</p>
              </div>

              <button
                onClick={() => setSelectedPolicy(p)}
                className="mt-4 text-blue-600 font-semibold hover:underline"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedPolicy && (
        <PolicyModal
          policy={selectedPolicy}
          bestPolicy={bestPolicy}
          onClose={() => setSelectedPolicy(null)}
        />
      )}
    </>
  );
};

export default Recommendations;

/* ================= MODAL ================= */

const PolicyModal = ({ policy, bestPolicy, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 w-full max-w-lg relative">

      <button onClick={onClose} className="absolute top-3 right-3 text-gray-500">
        <X />
      </button>

      <h2 className="text-2xl font-bold mb-1">{policy.name}</h2>
      <p className="text-gray-600 mb-4">{policy.provider}</p>

      <ul className="space-y-2 text-sm">
        <li><b>Coverage:</b> {policy.coverage}</li>
        <li><b>Policy Term:</b> {policy.term}</li>
        <li><b>Premium:</b> ₹{policy.premium}</li>
        <li><b>Benefits:</b> {policy.benefits}</li>
      </ul>

      {policy.id !== bestPolicy.id && (
        <div className="mt-4 bg-yellow-50 p-3 rounded text-sm flex gap-2">
          <AlertTriangle className="text-yellow-600" />
          <p>
            This policy is less suitable compared to{" "}
            <b>{bestPolicy.name}</b> due to lower coverage or budget mismatch.
          </p>
        </div>
      )}
    </div>
  </div>
);
