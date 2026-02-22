import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Home component - Public landing page
 * Shows when user is NOT authenticated
 * Authenticated users should go to /dashboard
 */
export default function Home() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ policies: 0 });

    // Redirect authenticated users to dashboard - but validate token first
    useEffect(() => {
        const validateAndRedirect = async () => {
            try {
                const token = localStorage.getItem('token');
                const user = JSON.parse(localStorage.getItem('user') || '{}');

                if (!token || !user?.id) {
                    // No valid auth data, stay on home page
                    console.log('[Home] No valid token/user, showing home page');
                    return;
                }

                // Validate token with backend
                const response = await fetch('http://localhost:8000/user/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    console.log('[Home] Token valid, redirecting to dashboard');
                    navigate('/dashboard', { replace: true });
                } else {
                    // Token invalid, clear localStorage and show home page
                    console.log('[Home] Token invalid, clearing localStorage and showing home page');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            } catch (error) {
                console.error('[Home] Error validating token:', error);
                // On error, assume unauthenticated and show home page
            }
        };

        validateAndRedirect();
    }, [navigate]);

    useEffect(() => {
        const fetchPublicStats = async () => {
            try {
                const response = await fetch('http://localhost:8000/policies');
                const policies = await response.json();
                setStats({ policies: policies.total || 0 });
            } catch (error) {
                console.error('Error fetching public stats:', error);
                setStats({ policies: 0 });
            }
        };

        fetchPublicStats();
    }, []);

    return (
        <div style={styles.page}>
            <style>{globalStyles}</style>

            {/* Ambient blobs */}
            <div style={styles.blob1} />
            <div style={styles.blob2} />
            <div style={styles.blob3} />
            <div style={styles.blob4} />

            <div style={styles.container}>

                {/* Hero Section */}
                <section style={styles.hero}>
                    <div style={styles.heroBadge}>🛡️ Trusted Insurance Platform</div>
                    <h1 style={styles.heroTitle}>
                        Compare Insurance.<br />
                        File Claims.<br />
                        <span style={styles.heroTitleAccent}>Get AI Recommendations.</span>
                    </h1>
                    <p style={styles.heroSub}>
                        Manage your insurance policies with confidence. Smart fraud detection keeps you safe.
                    </p>
                    <div style={styles.heroBtns}>
                        <button
                            type="button"
                            onClick={(e) => {
                                console.log('[Home] Button clicked: Get Started');
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('[Home] Current location:', window.location.pathname);
                                console.log('[Home] Navigating to: /register');
                                try {
                                    navigate('/register', { replace: false });
                                    console.log('[Home] Navigate called successfully');
                                } catch (err) {
                                    console.error('[Home] Navigation error:', err);
                                }
                            }}
                            style={styles.btnPrimary}
                            className="btn-primary"
                        >
                            Get Started →
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                console.log('[Home] Button clicked: Sign In');
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('[Home] Current location:', window.location.pathname);
                                console.log('[Home] Navigating to: /login');
                                try {
                                    navigate('/login', { replace: false });
                                    console.log('[Home] Navigate called successfully');
                                } catch (err) {
                                    console.error('[Home] Navigation error:', err);
                                }
                            }}
                            style={styles.btnSecondary}
                            className="btn-secondary"
                        >
                            Sign In
                        </button>
                    </div>
                </section>

                {/* Stats Section */}
                <div style={styles.statsGrid}>
                    {[
                        { value: `${stats.policies}+`, label: "Insurance Policies", icon: "📋", accent: "#38bdf8", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.25)" },
                        { value: "10K+", label: "Happy Customers", icon: "😊", accent: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.25)" },
                        { value: "$50M", label: "Claims Processed", icon: "💰", accent: "#fb923c", bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.25)" },
                        { value: "99%", label: "Fraud Detection Rate", icon: "🔒", accent: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)" },
                    ].map((card, i) => (
                        <div key={i} style={{ ...styles.statCard, background: card.bg, borderColor: card.border }} className="stat-card">
                            <div style={{ ...styles.statIcon, color: card.accent }}>{card.icon}</div>
                            <p style={{ ...styles.statValue, color: card.accent }}>{card.value}</p>
                            <p style={styles.statLabel}>{card.label}</p>
                            <div style={{ ...styles.statGlow, background: card.accent }} />
                        </div>
                    ))}
                </div>

                {/* Features Section */}
                <section style={styles.featuresSection}>
                    <div style={styles.sectionHeader}>
                        <div style={styles.sectionBadge}>✨ Features</div>
                        <h2 style={styles.sectionTitle}>Why Choose Us?</h2>
                        <p style={styles.sectionSub}>Everything you need to manage your insurance, all in one place.</p>
                    </div>

                    <div style={styles.featuresGrid}>
                        {[
                            {
                                icon: "🤖", title: "AI Policy Recommendation",
                                desc: "Get personalized insurance policy suggestions based on your profile and risk assessment.",
                                accent: "#38bdf8", border: "rgba(56,189,248,0.2)",
                            },
                            {
                                icon: "📁", title: "Easy Claim Management",
                                desc: "Upload documents and track your claims in real-time with status updates and notifications.",
                                accent: "#34d399", border: "rgba(52,211,153,0.2)",
                            },
                            {
                                icon: "🚨", title: "Smart Fraud Detection",
                                desc: "Advanced fraud detection algorithms protect you and your claims from fraudulent activities.",
                                accent: "#fb923c", border: "rgba(251,146,60,0.2)",
                            },
                            {
                                icon: "🔐", title: "Secure & Reliable",
                                desc: "Your data is protected with industry-standard security and encryption protocols.",
                                accent: "#a78bfa", border: "rgba(167,139,250,0.2)",
                            },
                        ].map((f, i) => (
                            <div key={i} style={{ ...styles.featureCard, borderColor: f.border }} className="feature-card">
                                <div style={{ ...styles.featureIconBox, background: `${f.accent}18`, color: f.accent }}>
                                    {f.icon}
                                </div>
                                <div>
                                    <h3 style={{ ...styles.featureTitle, color: f.accent }}>{f.title}</h3>
                                    <p style={styles.featureDesc}>{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Call to Action */}
                <section style={styles.ctaSection}>
                    <div style={styles.ctaGlow} />
                    <div style={styles.ctaInner}>
                        <div style={styles.ctaBadge}>🚀 Get Started Today</div>
                        <h2 style={styles.ctaTitle}>Ready to Get Started?</h2>
                        <p style={styles.ctaSub}>
                            Join thousands of customers managing their insurance with confidence and peace of mind.
                        </p>
                        <button
                            type="button"
                            onClick={(e) => {
                                console.log('[Home] Button clicked: Create Account Now');
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('[Home] Current location:', window.location.pathname);
                                console.log('[Home] Navigating to: /register');
                                try {
                                    navigate('/register', { replace: false });
                                    console.log('[Home] Navigate called successfully');
                                } catch (err) {
                                    console.error('[Home] Navigation error:', err);
                                }
                            }}
                            style={styles.ctaBtn}
                            className="cta-btn"
                        >
                            Create Account Now →
                        </button>
                    </div>
                </section>

            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b2e 40%, #0a1628 70%, #06111f 100%)',
        padding: '48px 20px',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        position: 'relative',
        overflow: 'hidden',
    },
    blob1: {
        position: 'fixed', top: '-120px', right: '-80px',
        width: '520px', height: '520px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.13) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
    },
    blob2: {
        position: 'fixed', bottom: '-100px', left: '-120px',
        width: '560px', height: '560px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
    },
    blob3: {
        position: 'fixed', top: '30%', left: '20%',
        width: '380px', height: '380px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
    },
    blob4: {
        position: 'fixed', bottom: '20%', right: '10%',
        width: '340px', height: '340px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(251,146,60,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
    },
    container: {
        maxWidth: '1100px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
    },
    // Hero
    hero: {
        textAlign: 'center',
        padding: '60px 20px 72px',
    },
    heroBadge: {
        display: 'inline-block',
        background: 'rgba(59,130,246,0.15)',
        border: '1px solid rgba(59,130,246,0.3)',
        color: '#60a5fa',
        fontSize: '13px', fontWeight: '600',
        letterSpacing: '0.08em',
        padding: '6px 16px', borderRadius: '20px',
        marginBottom: '24px',
    },
    heroTitle: {
        fontSize: 'clamp(32px, 5vw, 56px)',
        fontWeight: '800',
        color: '#f1f5f9',
        lineHeight: 1.15,
        letterSpacing: '-1.5px',
        margin: '0 0 20px 0',
    },
    heroTitleAccent: {
        background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    heroSub: {
        color: '#64748b',
        fontSize: '18px',
        maxWidth: '560px',
        margin: '0 auto 36px',
        lineHeight: 1.6,
    },
    heroBtns: {
        display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap',
    },
    btnPrimary: {
        background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
        color: '#fff', textDecoration: 'none',
        padding: '14px 32px', borderRadius: '12px',
        fontWeight: '700', fontSize: '15px',
        boxShadow: '0 6px 24px rgba(79,70,229,0.45)',
        transition: 'transform 0.18s, box-shadow 0.18s',
        display: 'inline-block',
        border: 'none',
        cursor: 'pointer',
    },
    btnSecondary: {
        background: 'rgba(255,255,255,0.06)',
        color: '#cbd5e1', textDecoration: 'none',
        padding: '14px 32px', borderRadius: '12px',
        fontWeight: '600', fontSize: '15px',
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'background 0.18s, color 0.18s',
        display: 'inline-block',
        cursor: 'pointer',
    },
    // Stats
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '18px',
        marginBottom: '72px',
    },
    statCard: {
        borderRadius: '18px', padding: '28px 22px', textAlign: 'center',
        border: '1px solid', position: 'relative', overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        transition: 'transform 0.2s ease',
    },
    statIcon: { fontSize: '28px', marginBottom: '10px', display: 'block' },
    statValue: { fontSize: '36px', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '-1px' },
    statLabel: { color: '#64748b', fontSize: '13px', fontWeight: '600', margin: 0, letterSpacing: '0.02em' },
    statGlow: {
        position: 'absolute', bottom: '-30px', right: '-30px',
        width: '90px', height: '90px', borderRadius: '50%',
        opacity: 0.08, filter: 'blur(18px)',
    },
    // Features
    featuresSection: { marginBottom: '72px' },
    sectionHeader: { textAlign: 'center', marginBottom: '44px' },
    sectionBadge: {
        display: 'inline-block',
        background: 'rgba(167,139,250,0.12)',
        border: '1px solid rgba(167,139,250,0.28)',
        color: '#a78bfa', fontSize: '13px', fontWeight: '600',
        letterSpacing: '0.08em', padding: '6px 14px',
        borderRadius: '20px', marginBottom: '14px',
    },
    sectionTitle: {
        fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: '800',
        background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        margin: '0 0 10px 0', letterSpacing: '-0.5px',
    },
    sectionSub: { color: '#475569', fontSize: '15px', margin: 0 },
    featuresGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
    },
    featureCard: {
        background: 'rgba(15,23,42,0.72)',
        border: '1px solid',
        borderRadius: '18px',
        padding: '28px 26px',
        display: 'flex', alignItems: 'flex-start', gap: '18px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 28px rgba(0,0,0,0.25)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    featureIconBox: {
        fontSize: '26px',
        width: '52px', height: '52px',
        borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    featureTitle: {
        fontSize: '16px', fontWeight: '700',
        margin: '0 0 8px 0',
    },
    featureDesc: {
        color: '#64748b', fontSize: '14px',
        lineHeight: 1.65, margin: 0,
    },
    // CTA
    ctaSection: {
        borderRadius: '24px',
        padding: '60px 40px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(37,99,235,0.20) 0%, rgba(79,70,229,0.25) 50%, rgba(109,40,217,0.20) 100%)',
        border: '1px solid rgba(99,102,241,0.3)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 48px rgba(79,70,229,0.2)',
    },
    ctaGlow: {
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '400px', height: '200px',
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.25) 0%, transparent 70%)',
        pointerEvents: 'none',
    },
    ctaInner: { position: 'relative', zIndex: 1 },
    ctaBadge: {
        display: 'inline-block',
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.18)',
        color: '#c7d2fe', fontSize: '13px', fontWeight: '600',
        letterSpacing: '0.08em', padding: '6px 14px',
        borderRadius: '20px', marginBottom: '18px',
    },
    ctaTitle: {
        fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: '800',
        color: '#f1f5f9', margin: '0 0 14px 0', letterSpacing: '-0.5px',
    },
    ctaSub: {
        color: '#94a3b8', fontSize: '16px',
        maxWidth: '480px', margin: '0 auto 32px', lineHeight: 1.6,
    },
    ctaBtn: {
        display: 'inline-block', textDecoration: 'none',
        background: '#fff', color: '#4338ca',
        padding: '14px 34px', borderRadius: '12px',
        fontWeight: '800', fontSize: '15px',
        boxShadow: '0 6px 24px rgba(0,0,0,0.3)',
        transition: 'transform 0.18s, box-shadow 0.18s',
        letterSpacing: '0.02em',
        border: 'none',
        cursor: 'pointer',
    },
    // Loading
    loadingScreen: {
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0f1e, #0d1b2e)', gap: '16px',
    },
    spinner: {
        width: '44px', height: '44px',
        border: '3px solid rgba(96,165,250,0.2)',
        borderTop: '3px solid #60a5fa',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
    },
    loadingText: { color: '#64748b', fontSize: '16px', fontWeight: '500', margin: 0 },
};

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; }

.stat-card:hover { transform: translateY(-5px); }

.feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 48px rgba(0,0,0,0.45) !important;
}

.btn-primary:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 10px 32px rgba(79,70,229,0.55) !important;
}

.btn-secondary:hover {
    background: rgba(255,255,255,0.11) !important;
    color: #f1f5f9 !important;
}

.cta-btn:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 10px 32px rgba(0,0,0,0.4) !important;
}

@keyframes spin { to { transform: rotate(360deg); } }
`;
