import React from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

const categories = [
  { name: "Health Insurance", emoji: "❤️" },
  { name: "Family Insurance", emoji: "👨‍👩‍👧" },
  { name: "Car Insurance", emoji: "🚗" },
  { name: "Bike Insurance", emoji: "🏍️" },
  { name: "Travel Insurance", emoji: "✈️" },
  { name: "Home Insurance", emoji: "🏠" },
  { name: "Child Plans", emoji: "👶" },
  { name: "Retirement Plans", emoji: "👴" },
  { name: "Women Insurance", emoji: "👩" },
  { name: "Employee Health", emoji: "🏢" },
  { name: "Senior Citizen Plans", emoji: "🧓" },
  { name: "Critical Illness", emoji: "🩺" },
  { name: "Term Life", emoji: "🛡️" },
  { name: "Investment Plans", emoji: "💰" },
  { name: "Corporate Insurance", emoji: "🏬" },
  { name: "Personal Accident", emoji: "🚑" },
  { name: "Pet Insurance", emoji: "🐶" },
  { name: "Education Plans", emoji: "🎓" },
  { name: "Micro Insurance", emoji: "🪙" },
  { name: "Crop Insurance", emoji: "🌾" }
];
function normalize(text = "") {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

function Dashboard() {
  return (
    <div className="dashboard">
      <h2>Select a Category</h2>

      <div className="category-grid">
  {categories.map((cat) => (
  <Link
    key={cat.name}
    to={`/category/${normalize(cat.name)}`}
    style={{ textDecoration: "none", color: "inherit" }}
  >
    <div className="card">
      <h3>{cat.emoji} {cat.name}</h3>
    </div>
  </Link>
))}

      </div>
    </div>
  );
}

export default Dashboard;




