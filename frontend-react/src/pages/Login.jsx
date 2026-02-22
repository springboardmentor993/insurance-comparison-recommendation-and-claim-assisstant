import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'

export default function Login() {
  const [data, setData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  if (token) {
    return <Navigate to="/" replace />
  }

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()

      if (json.access_token) {
        localStorage.setItem("token", json.access_token)
        localStorage.setItem("user_id", json.user_id)
        localStorage.setItem("user", JSON.stringify(json.user))
        localStorage.setItem("is_admin", json.user?.is_admin ? 'true' : 'false');
        localStorage.setItem("user_role", json.user?.role || 'user');

        if (json.user?.role === 'admin' || json.user?.is_admin) {
          console.log("Admin user detected, redirecting to admin dashboard");
          navigate("/admin/dashboard");
        } else {
          console.log("Regular user, redirecting to home");
          navigate("/home");
        }
      } else {
        setError('Login failed')
      }

    } catch (err) {
      setError('Error logging in')
    }
  }

  return (
    <div style={S.page}>
      <style>{globalStyles}</style>
      <div style={S.texture} />

      {/* Decorative side panel */}
      <div style={S.sidePanel}>
        <div style={S.sidePanelInner}>
          <div style={S.logoMark}>IC</div>
          <h2 style={S.sideTitle}>InsureCompare</h2>
          <p style={S.sideSubtitle}>Smart insurance decisions, simplified.</p>
          <div style={S.sideFeatures}>
            {["Compare top policies", "AI-powered recommendations", "File claims easily"].map((f, i) => (
              <div key={i} style={S.sideFeatureRow}>
                <span style={S.sideFeatureDot} />
                <span style={S.sideFeatureText}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div style={S.formPanel}>
        <div style={S.formCard}>
          <span style={S.eyebrow}>Sign in</span>
          <h1 style={S.h1}>Welcome back</h1>
          <div style={S.accentBar} />
          <p style={S.subtitle}>Enter your credentials to access your account.</p>

          {error && (
            <div style={S.errorBox}>
              ⚠️ {error}
            </div>
          )}

          <div style={S.fieldGroup}>
            <label style={S.label}>Email address</label>
            <input
              placeholder="you@example.com"
              type="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              style={S.input}
              className="form-input"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div style={S.fieldGroup}>
            <label style={S.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              style={S.input}
              className="form-input"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <button
            onClick={handleLogin}
            style={S.submitBtn}
            className="submit-btn"
          >
            Sign In →
          </button>

          <p style={S.footerText}>
            Don't have an account?{' '}
            <a href="/register" style={S.footerLink} className="footer-link">
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

const S = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: '#f5f0e8',
  },
  texture: {
    position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
    backgroundImage: `repeating-linear-gradient(
      45deg, transparent, transparent 50px,
      rgba(232,184,109,0.03) 50px, rgba(232,184,109,0.03) 51px
    )`,
  },

  // Left decorative panel
  sidePanel: {
    display: 'none',
    width: '42%',
    background: '#1a1a2e',
    backgroundImage: `
      radial-gradient(circle at 20% 30%, rgba(232,184,109,0.12) 0%, transparent 50%),
      radial-gradient(circle at 80% 75%, rgba(45,107,228,0.1) 0%, transparent 50%)
    `,
    position: 'relative',
    flexShrink: 0,
  },
  sidePanelInner: {
    padding: '60px 48px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
  },
  logoMark: {
    width: '52px', height: '52px',
    background: '#e8b86d',
    borderRadius: '14px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '20px', fontWeight: '800',
    color: '#1a1a2e',
    fontFamily: "'Playfair Display', Georgia, serif",
    marginBottom: '24px',
    boxShadow: '0 8px 24px rgba(232,184,109,0.35)',
  },
  sideTitle: {
    fontSize: '26px', fontWeight: '700',
    fontFamily: "'Playfair Display', Georgia, serif",
    color: '#f5d9a0', margin: '0 0 10px 0', letterSpacing: '-0.01em',
  },
  sideSubtitle: {
    color: 'rgba(255,255,255,0.45)', fontSize: '14px',
    margin: '0 0 40px 0', lineHeight: 1.6, fontWeight: '400',
  },
  sideFeatures: { display: 'flex', flexDirection: 'column', gap: '14px' },
  sideFeatureRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  sideFeatureDot: {
    width: '7px', height: '7px', borderRadius: '50%',
    background: '#e8b86d', flexShrink: 0,
    boxShadow: '0 0 6px rgba(232,184,109,0.5)',
  },
  sideFeatureText: {
    color: 'rgba(255,255,255,0.65)', fontSize: '14px', fontWeight: '400',
  },

  // Right form panel
  formPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'clamp(24px, 5vw, 60px) clamp(20px, 5vw, 48px)',
    position: 'relative', zIndex: 1,
  },
  formCard: {
    width: '100%',
    maxWidth: '400px',
    animation: 'fadeUp 0.5s ease both',
  },

  eyebrow: {
    display: 'inline-block',
    background: 'rgba(45,122,79,0.1)', border: '1px solid rgba(45,122,79,0.25)',
    color: '#2d7a4f', fontSize: '11px', fontWeight: '600',
    letterSpacing: '0.12em', textTransform: 'uppercase',
    padding: '4px 12px', borderRadius: '30px', marginBottom: '14px',
  },
  h1: {
    fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: '700',
    fontFamily: "'Playfair Display', Georgia, serif",
    color: '#1a1a2e', margin: '0', letterSpacing: '-0.02em', lineHeight: 1.15,
  },
  accentBar: {
    width: '40px', height: '3px', background: '#e8b86d',
    borderRadius: '2px', margin: '14px 0 16px 0',
  },
  subtitle: {
    color: '#6b6560', fontSize: '14px', margin: '0 0 32px 0',
    fontWeight: '400', lineHeight: 1.6,
  },

  errorBox: {
    color: '#b5362a',
    marginBottom: '24px',
    padding: '12px 16px',
    background: '#fdf2f1',
    borderRadius: '10px',
    fontSize: '13.5px',
    border: '1px solid rgba(181,54,42,0.2)',
    fontWeight: '500',
  },

  fieldGroup: { marginBottom: '18px' },
  label: {
    display: 'block', marginBottom: '7px',
    fontWeight: '500', color: '#6b6560',
    fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase',
  },
  input: {
    width: '100%', padding: '11px 15px',
    borderRadius: '10px', border: '1.5px solid #e8e2d6',
    fontSize: '14.5px', boxSizing: 'border-box',
    fontFamily: "'DM Sans', sans-serif",
    color: '#1a1a2e', background: 'white',
    transition: 'all 0.2s ease', outline: 'none',
  },

  submitBtn: {
    width: '100%', padding: '13px',
    background: '#1a1a2e', color: '#f5d9a0',
    border: 'none', borderRadius: '10px',
    fontSize: '15px', fontWeight: '700',
    cursor: 'pointer', transition: 'all 0.25s ease',
    boxShadow: '0 4px 16px rgba(26,26,46,0.22)',
    marginBottom: '20px', marginTop: '8px',
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: '0.02em',
  },

  footerText: {
    textAlign: 'center', fontSize: '13.5px',
    color: '#a09990', margin: 0,
  },
  footerLink: {
    color: '#c8892a', textDecoration: 'none', fontWeight: '700',
  },
}

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Side panel responsive show */
@media (min-width: 720px) {
  [data-side-panel] { display: flex !important; }
}

.form-input:focus {
  border-color: #e8b86d !important;
  box-shadow: 0 0 0 4px rgba(232,184,109,0.12) !important;
}
.form-input:hover:not(:focus) {
  border-color: #cdc5b4 !important;
}
.submit-btn:hover {
  background: #0f0f1e !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(26,26,46,0.3) !important;
}
.submit-btn:active {
  transform: translateY(0) !important;
}
.footer-link:hover {
  text-decoration: underline;
}

/* Show side panel on wider screens */
@media (min-width: 720px) {
  #side-panel { display: flex !important; }
}
`
