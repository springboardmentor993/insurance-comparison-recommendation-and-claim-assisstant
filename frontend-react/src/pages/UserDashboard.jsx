import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NotificationsPanel from '../components/NotificationsPanel';

export default function UserDashboard() {
    const [userData, setUserData] = useState(null);
    const [userStats, setUserStats] = useState({ myPolicies: 0, activeClaims: 0 });
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (user) {
            setUserData(JSON.parse(user));
        }

        if (token) {
            fetchUserStats(token);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserStats = async (token) => {
        try {
            setLoading(true);
            const policiesRes = await fetch(
                `http://localhost:8000/user-policies?token=${token}`
            );
            const policiesData = policiesRes.ok ? await policiesRes.json() : [];

            const claimsRes = await fetch(
                `http://localhost:8000/claims?token=${token}`
            );
            const claimsResponse = claimsRes.ok ? await claimsRes.json() : { claims: [] };
            const claimsData = claimsResponse.claims || [];

            const activeClaims = claimsData.filter ?
                claimsData.filter(c => c.status !== 'approved' && c.status !== 'rejected').length : 0;

            setUserStats({
                myPolicies: Array.isArray(policiesData) ? policiesData.length : 0,
                activeClaims: activeClaims,
            });
        } catch (error) {
            console.error('Error fetching user stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={S.loadingPage}>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <div style={S.loadingCard}>
                    <div style={S.spinner} />
                    <p style={S.loadingText}>Loading your dashboard…</p>
                </div>
            </div>
        );
    }

    return (
        <div style={S.page}>
            <style>{globalStyles}</style>
            <div style={S.texture} />

            <div style={S.container}>
                {/* Header */}
                <section style={S.header}>
                    <div style={S.headerTop}>
                        <div>
                            <span style={S.eyebrow}>👋 Welcome back</span>
                            <h1 style={S.h1}>
                                Hello, <span style={S.nameAccent}>{userData?.name || 'User'}</span>
                            </h1>
                            <div style={S.accentBar} />
                            <p style={S.headerSub}>Manage your policies, claims, and get smart recommendations.</p>
                        </div>
                        <div style={S.headerNotifications}>
                            {token && <NotificationsPanel token={token} />}
                        </div>
                    </div>
                </section>

                {/* Stats Cards */}
                <div style={S.statsGrid}>
                    {[
                        {
                            label: "My Policies",
                            value: userStats.myPolicies,
                            icon: "📋",
                            linkTo: "/browse",
                            linkText: "Browse Policies",
                            accentColor: "#2d6be4",
                            tagBg: "rgba(45,107,228,0.07)",
                            tagBorder: "rgba(45,107,228,0.2)",
                        },
                        {
                            label: "Active Claims",
                            value: userStats.activeClaims,
                            icon: "📁",
                            linkTo: "/claims",
                            linkText: "View Claims",
                            accentColor: "#c8892a",
                            tagBg: "rgba(200,137,42,0.07)",
                            tagBorder: "rgba(200,137,42,0.2)",
                        },
                        {
                            label: "Recommendations",
                            value: "AI Ready",
                            icon: "✨",
                            linkTo: "/recommendations",
                            linkText: "Get Recommendations",
                            accentColor: "#2d7a4f",
                            tagBg: "rgba(45,122,79,0.07)",
                            tagBorder: "rgba(45,122,79,0.2)",
                        },
                    ].map((card, i) => (
                        <div
                            key={i}
                            style={{ ...S.statCard, background: card.tagBg, borderColor: card.tagBorder }}
                            className="stat-card"
                        >
                            <div style={{ ...S.statIconBox, color: card.accentColor }}>{card.icon}</div>
                            <p style={S.statLabel}>{card.label}</p>
                            <div style={{ ...S.statValue, color: card.accentColor }}>{card.value}</div>
                            <div style={{ ...S.statDivider, background: card.tagBorder }} />
                            <Link to={card.linkTo} style={{ ...S.statLink, color: card.accentColor }} className="stat-link">
                                {card.linkText} →
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <section style={S.section}>
                    <div style={S.sectionHeader}>
                        <span style={S.sectionDot} />
                        <h2 style={S.sectionTitle}>Quick Actions</h2>
                    </div>
                    <div style={S.actionsGrid}>
                        {[
                            { to: "/browse", label: "Browse Policies", icon: "📋", desc: "Explore available plans" },
                            { to: "/claims", label: "File a Claim", icon: "📝", desc: "Submit a new claim" },
                            { to: "/compare", label: "Compare Policies", icon: "🔄", desc: "Side-by-side view" },
                            { to: "/recommendations", label: "AI Recommendations", icon: "✨", desc: "Personalised for you" },
                        ].map((btn, i) => (
                            <Link key={i} to={btn.to} style={S.actionBtn} className="action-btn">
                                <span style={S.actionIcon}>{btn.icon}</span>
                                <div style={S.actionTextWrap}>
                                    <span style={S.actionLabel}>{btn.label}</span>
                                    <span style={S.actionDesc}>{btn.desc}</span>
                                </div>
                                <span style={S.actionArrow}>→</span>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

const S = {
    page: {
        minHeight: '100vh',
        background: '#f5f0e8',
        backgroundImage: `
            radial-gradient(circle at 8% 12%, rgba(232,184,109,0.14) 0%, transparent 38%),
            radial-gradient(circle at 92% 78%, rgba(26,26,46,0.07) 0%, transparent 38%)
        `,
        padding: '52px clamp(14px, 4vw, 48px) 90px',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        position: 'relative',
    },
    texture: {
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `repeating-linear-gradient(
            45deg, transparent, transparent 50px,
            rgba(232,184,109,0.025) 50px, rgba(232,184,109,0.025) 51px
        )`,
    },
    container: { maxWidth: '1080px', margin: '0 auto', position: 'relative', zIndex: 1 },

    // Header
    header: { marginBottom: '48px', animation: 'fadeUp 0.5s ease both' },
    headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' },
    headerNotifications: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
    eyebrow: {
        display: 'inline-block',
        background: 'rgba(45,122,79,0.1)', border: '1px solid rgba(45,122,79,0.25)',
        color: '#2d7a4f', fontSize: '12px', fontWeight: '600',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        padding: '5px 14px', borderRadius: '30px', marginBottom: '14px',
    },
    h1: {
        fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: '700',
        fontFamily: "'Playfair Display', Georgia, serif",
        color: '#1a1a2e', margin: '0', letterSpacing: '-0.02em', lineHeight: 1.15,
    },
    nameAccent: { color: '#c8892a' },
    accentBar: {
        width: '44px', height: '3px', background: '#e8b86d',
        borderRadius: '2px', margin: '14px 0 16px 0',
    },
    headerSub: { color: '#6b6560', fontSize: '15px', margin: 0, fontWeight: '400', lineHeight: 1.6 },

    // Stats
    statsGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '20px', marginBottom: '28px',
    },
    statCard: {
        background: 'white', borderRadius: '16px', padding: '28px 26px',
        border: '1.5px solid', boxShadow: '0 2px 12px rgba(26,26,46,0.06)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    statIconBox: { fontSize: '26px', marginBottom: '14px', display: 'block' },
    statLabel: {
        color: '#a09990', fontSize: '11px', fontWeight: '600',
        letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 8px 0',
    },
    statValue: {
        fontSize: '38px', fontWeight: '800', margin: '0 0 16px 0',
        letterSpacing: '-1px', lineHeight: 1,
        fontFamily: "'Playfair Display', Georgia, serif",
    },
    statDivider: { height: '1px', marginBottom: '14px', opacity: 0.4, borderRadius: '1px' },
    statLink: {
        fontSize: '13px', fontWeight: '600', textDecoration: 'none',
        letterSpacing: '0.02em', display: 'inline-block',
        transition: 'opacity 0.15s',
    },

    // Section
    section: {
        background: 'white', border: '1px solid #ede8df',
        borderRadius: '20px', padding: '32px 36px',
        marginBottom: '24px',
        boxShadow: '0 4px 24px rgba(26,26,46,0.06)',
    },
    sectionHeader: {
        display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px',
    },
    sectionDot: {
        width: '9px', height: '9px', borderRadius: '50%',
        background: '#e8b86d', boxShadow: '0 0 6px rgba(232,184,109,0.6)',
        flexShrink: 0,
    },
    sectionTitle: {
        fontSize: '18px', fontWeight: '700', color: '#1a1a2e',
        margin: 0, fontFamily: "'Playfair Display', Georgia, serif",
    },

    // Actions
    actionsGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '14px',
    },
    actionBtn: {
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '18px 20px', borderRadius: '12px',
        textDecoration: 'none', color: '#1a1a2e',
        background: '#faf9f7', border: '1.5px solid #ede8df',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 8px rgba(26,26,46,0.04)',
    },
    actionIcon: { fontSize: '22px', flexShrink: 0 },
    actionTextWrap: { display: 'flex', flexDirection: 'column', flex: 1, gap: '2px' },
    actionLabel: { fontSize: '14px', fontWeight: '700', color: '#1a1a2e', lineHeight: 1.2 },
    actionDesc: { fontSize: '12px', color: '#a09990', fontWeight: '400' },
    actionArrow: { fontSize: '16px', color: '#c8892a', opacity: 0.7, flexShrink: 0 },

    // Loading
    loadingPage: {
        minHeight: '100vh',
        background: '#f5f0e8',
        backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(232,184,109,0.12) 0%, transparent 40%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif",
    },
    loadingCard: {
        background: 'white', borderRadius: '20px',
        padding: '48px 56px', textAlign: 'center',
        boxShadow: '0 16px 48px rgba(26,26,46,0.1)',
        border: '1px solid #ede8df',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
    },
    spinner: {
        width: '40px', height: '40px',
        border: '3px solid #f2efe8',
        borderTop: '3px solid #e8b86d',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
    },
    loadingText: { color: '#a09990', fontSize: '14px', fontWeight: '500', margin: 0 },
};

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; }

@keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
}
@keyframes spin { to { transform: rotate(360deg); } }

.stat-card:hover {
    transform: translateY(-5px) !important;
    box-shadow: 0 16px 40px rgba(26,26,46,0.12) !important;
}
.stat-link:hover { opacity: 0.65; }

.action-btn:hover {
    background: #fdf8ef !important;
    border-color: #e8b86d !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(26,26,46,0.1) !important;
}
`;
