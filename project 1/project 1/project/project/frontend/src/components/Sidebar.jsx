import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-blue-700 text-white min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-10">Insurance-Assistant</h2>
      <ul className="space-y-4">
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/policies">Policies</Link></li>
        <li><Link to="/recommendations">Recommendations</Link></li>
        <li><Link to="/claims">Claims</Link></li>
      </ul>
    </div>
  );
}
