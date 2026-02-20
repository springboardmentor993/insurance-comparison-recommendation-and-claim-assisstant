import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-10 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">
          Welcome to your Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            Total Policies
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            Active Claims
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            Fraud Alerts
          </div>
        </div>
      </div>
    </div>
  );
}
