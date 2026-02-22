import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  const categories = [
    "Term Life",
    "Health",
    "Car",
    "Travel",
    "Investment",
    "Family Health",
    "Bike",
    "Home",
  ];

  return (
    <div className="home-container">

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <h1>
            India’s Smartest Way to <span>Buy Insurance</span>
          </h1>
          <p>
            Compare plans. Save money. File claims easily.
            Everything in one powerful dashboard.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={() => navigate("/policies")}
            >
              Explore Policies
            </button>
            <button
              className="secondary-btn"
              onClick={() => navigate("/claims")}
            >
              File Claim
            </button>
          </div>
        </div>

        <div className="hero-right">
          <div className="floating-card card1">50+ Insurers</div>
          <div className="floating-card card2">9M+ Customers</div>
          <div className="floating-card card3">Fast Claims</div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="categories-section">
        <h2>Popular Categories</h2>
        <div className="categories-grid">
          {categories.map((cat, index) => (
            <div
              key={index}
              className="category-card"
              onClick={() => navigate("/policies")}
            >
              <div className="icon">🛡</div>
              <h3>{cat} Insurance</h3>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="why-section">
        <h2>Why Choose TrustSure?</h2>

        <div className="why-grid">
          <div className="why-card">
            <h3>Best Prices</h3>
            <p>Compare premiums instantly across top insurers.</p>
          </div>

          <div className="why-card">
            <h3>Instant Approval</h3>
            <p>Quick policy purchase and digital documentation.</p>
          </div>

          <div className="why-card">
            <h3>Secure Platform</h3>
            <p>Fully encrypted & secure claim management system.</p>
          </div>

          <div className="why-card">
            <h3>24/7 Support</h3>
            <p>Always available to guide you through claims.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Ready to Protect What Matters?</h2>
        <button
          className="cta-btn"
          onClick={() => navigate("/policies")}
        >
          Get Started Now
        </button>
      </section>

    </div>
  );
}

export default Home;
