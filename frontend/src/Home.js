import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Error loading categories:", err));
  }, []);

  return (
    <div className="home">

      {/* ================= CATEGORIES SECTION ================= */}

      <h1>Insurance Categories</h1>

      <div className="grid">
        {categories.map((cat, index) => (
          <div
            key={index}
            className="card"
            onClick={() => navigate(`/category/${cat.name}`)}
          >
            {cat.icon || "🛡️"}
            <p>{cat.name}</p>
          </div>
        ))}
      </div>

      {/* ================= TRUSTSURE PROMO SECTION ================= */}

      <div className="promo-section">

        <div className="promo-container">

          {/* LEFT TEXT */}
          <div className="promo-left">
            <h2>
              What makes <span>TrustSure</span><br />
              one of India’s favourite places<br />
              to buy insurance?
            </h2>
          </div>

          {/* RIGHT CARDS */}
          <div className="promo-right">

            <div className="promo-card blue">
              <h3>9M+ Customers</h3>
              <p>Millions trust TrustSure for reliable insurance services.</p>
            </div>

            <div className="promo-card cyan">
              <h3>50+ Insurers</h3>
              <p>Partnered with leading insurers for easy comparison.</p>
            </div>

            <div className="promo-card green">
              <h3>Best Prices</h3>
              <p>Affordable premiums across all insurance categories.</p>
            </div>

            <div className="promo-card orange">
              <h3>Fast Claims</h3>
              <p>Quick and smooth claim processing experience.</p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Home;