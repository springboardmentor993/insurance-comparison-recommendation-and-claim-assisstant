import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .register-root * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .register-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0a0a0f;
    font-family: 'DM Sans', sans-serif;
    padding: 20px;
    position: relative;
    overflow: hidden;
  }

  .register-root::before {
    content: '';
    position: fixed;
    top: -40%;
    left: -20%;
    width: 80vw;
    height: 80vw;
    background: radial-gradient(circle, rgba(99,179,237,0.07) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .register-root::after {
    content: '';
    position: fixed;
    bottom: -40%;
    right: -20%;
    width: 70vw;
    height: 70vw;
    background: radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .register-grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    max-width: 900px;
    width: 100%;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05);
    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .register-left {
    background: linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    padding: 52px 40px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }

  .register-left::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }

  .register-left-brand {
    position: relative;
  }

  .register-left-logo {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    color: #fff;
    letter-spacing: -0.5px;
    line-height: 1;
  }

  .register-left-logo span {
    color: #63b3ed;
  }

  .register-left-tagline {
    margin-top: 10px;
    font-size: 12px;
    color: rgba(255,255,255,0.35);
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .register-left-body {
    position: relative;
  }

  .register-left-headline {
    font-family: 'Playfair Display', serif;
    font-size: clamp(28px, 3.5vw, 38px);
    color: #fff;
    line-height: 1.15;
    margin-bottom: 18px;
  }

  .register-left-headline em {
    font-style: italic;
    color: #63b3ed;
  }

  .register-left-desc {
    font-size: 14px;
    color: rgba(255,255,255,0.45);
    line-height: 1.7;
  }

  .register-left-features {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .register-feature {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: rgba(255,255,255,0.55);
  }

  .register-feature-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #63b3ed;
    flex-shrink: 0;
  }

  .register-right {
    background: #111118;
    padding: 48px 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .register-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(22px, 3vw, 28px);
    color: #fff;
    margin-bottom: 6px;
  }

  .register-subtitle {
    font-size: 13px;
    color: rgba(255,255,255,0.35);
    margin-bottom: 32px;
  }

  .register-error {
    background: rgba(245,101,101,0.1);
    border: 1px solid rgba(245,101,101,0.3);
    color: #fc8181;
    font-size: 13px;
    padding: 12px 14px;
    border-radius: 10px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .register-field {
    margin-bottom: 16px;
  }

  .register-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    color: rgba(255,255,255,0.4);
    letter-spacing: 1.2px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .register-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    padding: 12px 14px;
    border-radius: 10px;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }

  .register-input::placeholder { color: rgba(255,255,255,0.2); }

  .register-input:focus {
    border-color: rgba(99,179,237,0.5);
    background: rgba(99,179,237,0.04);
    box-shadow: 0 0 0 3px rgba(99,179,237,0.08);
  }

  .register-input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(0.5);
    cursor: pointer;
  }

  .register-btn {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #3a7bd5, #63b3ed);
    color: white;
    border: none;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.3px;
    margin-top: 8px;
    margin-bottom: 20px;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(58,123,213,0.3);
  }

  .register-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(58,123,213,0.45);
  }

  .register-btn:active {
    transform: translateY(0);
  }

  .register-footer {
    text-align: center;
    font-size: 13px;
    color: rgba(255,255,255,0.3);
  }

  .register-footer a {
    color: #63b3ed;
    text-decoration: none;
    font-weight: 600;
  }

  .register-footer a:hover { text-decoration: underline; }

  @media (max-width: 640px) {
    .register-grid { grid-template-columns: 1fr; }
    .register-left { display: none; }
    .register-right { padding: 36px 28px; }
  }
`;

export default function Register() {
    const [form, setForm] = useState({ name: "", email: "", password: "", dob: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    if (token) {
        return <Navigate to="/" replace />;
    }

    const submit = async () => {
        try {
            setError("");

            if (!form.name || !form.email || !form.password || !form.dob) {
                setError("Please fill in all fields");
                return;
            }

            const res = await fetch("http://localhost:8000/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            const json = await res.json();

            if (json.access_token) {
                localStorage.setItem("token", json.access_token);
                localStorage.setItem("user_id", json.user_id);
                localStorage.setItem("is_admin", json.user?.is_admin ? 'true' : 'false');
                navigate("/");
            } else {
                setError(json.detail || "Registration failed");
            }
        } catch (err) {
            setError("Error registering: " + err.message);
        }
    };

    return (
        <>
            <style>{styles}</style>
            <div className="register-root">
                <div className="register-grid">
                    {/* Left panel */}
                    <div className="register-left">
                        <div className="register-left-brand">
                            <div className="register-left-logo">Insure<span>Compare</span></div>
                            <div className="register-left-tagline">Smart insurance decisions</div>
                        </div>

                        <div className="register-left-body">
                            <h2 className="register-left-headline">
                                Find the <em>perfect</em><br />plan for you
                            </h2>
                            <p className="register-left-desc">
                                Compare hundreds of insurance plans side-by-side and save money on coverage that actually fits your life.
                            </p>
                        </div>

                        <div className="register-left-features">
                            {["Compare plans instantly", "Unbiased recommendations", "Secure & confidential"].map(f => (
                                <div className="register-feature" key={f}>
                                    <div className="register-feature-dot" />
                                    {f}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right panel */}
                    <div className="register-right">
                        <h1 className="register-title">Create account</h1>
                        <p className="register-subtitle">Join thousands of smart insurance shoppers</p>

                        {error && (
                            <div className="register-error">
                                <span>⚠</span> {error}
                            </div>
                        )}

                        <div className="register-field">
                            <label className="register-label">Full Name</label>
                            <input
                                className="register-input"
                                placeholder="John Doe"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                            />
                        </div>

                        <div className="register-field">
                            <label className="register-label">Email</label>
                            <input
                                className="register-input"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                            />
                        </div>

                        <div className="register-field">
                            <label className="register-label">Password</label>
                            <input
                                className="register-input"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                            />
                        </div>

                        <div className="register-field">
                            <label className="register-label">Date of Birth</label>
                            <input
                                className="register-input"
                                type="date"
                                value={form.dob}
                                onChange={e => setForm({ ...form, dob: e.target.value })}
                            />
                        </div>

                        <button className="register-btn" onClick={submit}>
                            Create Account →
                        </button>

                        <p className="register-footer">
                            Already have an account? <a href="/login">Sign in</a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
