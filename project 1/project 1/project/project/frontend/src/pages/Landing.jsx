import { Link } from "react-router-dom";
import { ShieldCheck, Star, TrendingUp } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50">

      {/* HERO */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <ShieldCheck size={48} className="text-blue-600" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
          Insurance Assistant
        </h1>

        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
          Smart, personalized insurance recommendations tailored to your needs.
        </p>

        <div className="flex justify-center gap-4 mt-8">
          <Link
            to="/login"
            className="bg-gradient-to-r from-blue-600 to-teal-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90"
          >
            Get Started
          </Link>

          <Link
            to="/register"
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50"
          >
            Create Account
          </Link>
        </div>
      </div>

      {/* FEATURES */}
      <div className="max-w-7xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: Star,
            title: "Best Policy Match",
            desc: "Compare policies and identify the best value instantly.",
          },
          {
            icon: TrendingUp,
            title: "Smart Recommendations",
            desc: "Personalized suggestions using your risk profile.",
          },
          {
            icon: ShieldCheck,
            title: "Secure & Trusted",
            desc: "Your data is protected with enterprise-grade security.",
          },
        ].map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100 text-center"
            >
              <Icon className="mx-auto text-blue-600 mb-4" size={32} />
              <h3 className="font-bold text-lg">{f.title}</h3>
              <p className="text-gray-600 text-sm mt-2">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Landing;
