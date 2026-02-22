import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function HomePage() {
    const [userData, setUserData] = useState(null);
    const [userStats, setUserStats] = useState({ myPolicies: 0, activeClaims: 0, recommendations: 0 });
    const [isAdmin, setIsAdmin] = useState(false);
    const [stats, setStats] = useState({ users: 0, policies: 0, claims: 0, fraud: 0 });
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('user_id');
        const user = localStorage.getItem('user');

        if (!token || !userId) {
            navigate('/');
            return;
        }

        if (user) {
            const userData = JSON.parse(user);
            setUserData(userData);
            setIsAdmin(userData.is_admin || false);
        }
        fetchUserStats(token, userId);
    }, [navigate]);

    const fetchUserStats = async (token, userId) => {
        try {
            setLoading(true);
            const policiesRes = await fetch(`http://localhost:8000/user-policies?token=${token}`);
            const policiesData = policiesRes.ok ? await policiesRes.json() : [];

            const claimsRes = await fetch(`http://localhost:8000/claims?token=${token}`);
            const claimsResponse = claimsRes.ok ? await claimsRes.json() : { claims: [] };
            const claimsData = claimsResponse.claims || [];

            const activeClaims = claimsData.filter ?
                claimsData.filter(c => c.status !== 'approved' && c.status !== 'rejected').length : 0;

            setUserStats({
                myPolicies: Array.isArray(policiesData) ? policiesData.length : 0,
                activeClaims: activeClaims,
                recommendations: 0
            });

            if (userData?.is_admin) {
                await fetchAdminStats(token);
            }
        } catch (error) {
            console.error('Error fetching user stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAdminStats = async (token) => {
        try {
            const requests = [
                fetch('http://localhost:8000/admin/users?token=' + token),
                fetch('http://localhost:8000/policies'),
                fetch('http://localhost:8000/admin/claims?token=' + token),
                fetch('http://localhost:8000/fraud/summary?token=' + token),
                fetch('http://localhost:8000/admin/users/recent?token=' + token),
            ];

            const responses = await Promise.all(requests);

            if (responses.length === 5) {
                const users = await responses[0].json();
                const policies = await responses[1].json();
                const claims = await responses[2].json();
                const fraud = await responses[3].json();
                const recent = await responses[4].json();

                setStats({
                    users: users.length || 0,
                    policies: policies.total || 0,
                    claims: claims.length || 0,
                    fraud: fraud.count || 0
                });
                setRecentUsers(recent || []);
            }
        } catch (error) {
            console.error('Error fetching admin stats:', error);
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

    // ─── USER DASHBOARD ───────────────────────────────────────────────────────
    if (!isAdmin) {
        return (
            <div style={S.page}>
                <style>{globalStyles}</style>
                <div style={S.texture} />

                <div style={S.container}>
                    {/* Header */}
                    <section style={S.header}>
                        <span style={S.eyebrow}>👋 Welcome back</span>
                        <h1 style={S.h1}>
                            Hello, <span style={S.nameAccent}>{userData?.name || 'User'}</span>
                        </h1>
                        <div style={S.accentBar} />
                        <p style={S.headerSub}>Manage your policies, claims, and get smart AI recommendations.</p>
                    </section>

                    {/* User Stats Cards */}
                    <div style={S.statsGrid3}>
                        {[
                            {
                                label: "My Policies", value: userStats.myPolicies,
                                icon: "📋",
                                linkTo: "/browse", linkText: "Browse Policies",
                                accentColor: "#2d6be4",
                                tagBg: "rgba(45,107,228,0.08)", tagBorder: "rgba(45,107,228,0.2)",
                            },
                            {
                                label: "Active Claims", value: userStats.activeClaims,
                                icon: "📁",
                                linkTo: "/claims", linkText: "View Claims",
                                accentColor: "#c8892a",
                                tagBg: "rgba(200,137,42,0.08)", tagBorder: "rgba(200,137,42,0.2)",
                            },
                            {
                                label: "Recommendations", value: "AI Ready",
                                icon: "✨",
                                linkTo: "/recommendations", linkText: "Get Recommendations",
                                accentColor: "#2d7a4f",
                                tagBg: "rgba(45,122,79,0.08)", tagBorder: "rgba(45,122,79,0.2)",
                            },
                        ].map((card, i) => (
                            <div key={i} style={{ ...S.statCard, background: card.tagBg, borderColor: card.tagBorder }} className="stat-card">
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
                                { to: "/recommendations", label: "AI Recommendations", icon: "✨", desc: "Personalized for you" },
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

    // ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────
    return (
        <div style={S.page}>
            <style>{globalStyles}</style>
            <div style={S.texture} />

            <div style={S.container}>
                {/* Header */}
                <section style={S.header}>
                    <span style={{ ...S.eyebrow, ...S.adminEyebrow }}>⚡ Admin View</span>
                    <h1 style={S.h1}>Admin Dashboard</h1>
                    <div style={S.accentBar} />
                    <p style={S.headerSub}>System overview, admin controls, and real-time monitoring</p>
                </section>

                {/* Admin Stats */}
                <div style={S.statsGrid4}>
                    {[
                        { label: "Total Users", value: stats.users, icon: "👥", accentColor: "#2d6be4", tagBg: "rgba(45,107,228,0.07)", tagBorder: "rgba(45,107,228,0.18)" },
                        { label: "Policies", value: stats.policies, icon: "📋", accentColor: "#2d7a4f", tagBg: "rgba(45,122,79,0.07)", tagBorder: "rgba(45,122,79,0.18)" },
                        { label: "Claims", value: stats.claims, icon: "📁", accentColor: "#c8892a", tagBg: "rgba(200,137,42,0.07)", tagBorder: "rgba(200,137,42,0.18)" },
                        { label: "Fraud Flags", value: stats.fraud, icon: "🚨", accentColor: "#b5362a", tagBg: "rgba(181,54,42,0.07)", tagBorder: "rgba(181,54,42,0.18)" },
                    ].map((card, i) => (
                        <div key={i} style={{ ...S.statCard, background: card.tagBg, borderColor: card.tagBorder }} className="stat-card">
                            <div style={{ ...S.statIconBox, color: card.accentColor }}>{card.icon}</div>
                            <p style={S.statLabel}>{card.label}</p>
                            <div style={{ ...S.statValue, color: card.accentColor }}>{card.value}</div>
                        </div>
                    ))}
                </div>

                {/* Admin Actions */}
                <section style={S.section}>
                    <div style={S.sectionHeader}>
                        <span style={S.sectionDot} />
                        <h2 style={S.sectionTitle}>Admin Actions</h2>
                    </div>
                    <div style={S.actionsGrid}>
                        {[
                            { to: "/admin/dashboard", label: "Dashboard", icon: "📊", desc: "Overview & analytics" },
                            { to: "/admin/documents", label: "Documents", icon: "📄", desc: "Manage files" },
                            { to: "/admin/fraud", label: "Fraud Monitoring", icon: "🛡️", desc: "Review flagged activity" },
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

                {/* Recent Users Table */}
                {recentUsers && recentUsers.length > 0 && (
                    <section style={S.section}>
                        <div style={S.sectionHeader}>
                            <span style={{ ...S.sectionDot, background: "#2d7a4f", boxShadow: "0 0 6px rgba(45,122,79,0.5)" }} />
                            <h2 style={S.sectionTitle}>Recent Users</h2>
                            <span style={S.liveBadge}>● LIVE</span>
                        </div>
                        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #ede8df' }}>
                            <table style={S.table}>
                                <thead>
                                    <tr style={{ background: '#faf9f7' }}>
                                        <th style={S.th}>Name</th>
                                        <th style={S.th}>Email</th>
                                        <th style={S.th}>Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentUsers.map((user) => (
                                        <tr key={user.id} style={S.tr} className="table-row">
                                            <td style={S.tdName}>{user.name}</td>
                                            <td style={S.tdEmail}>{user.email}</td>
                                            <td style={S.tdDate}>{new Date(user.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
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
            radial-gradient(circle at 92% 78%, rgba(26,26,46,0.07) 0%, transparent 38%),
            radial-gradient(circle at 55% 48%, rgba(45,107,228,0.04) 0%, transparent 30%)
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
    container: { maxWidth: '1160px', margin: '0 auto', position: 'relative', zIndex: 1 },

    // Header
    header: { marginBottom: '48px', animation: 'fadeUp 0.5s ease both' },
    eyebrow: {
        display: 'inline-block',
        background: 'rgba(45,122,79,0.1)', border: '1px solid rgba(45,122,79,0.25)',
        color: '#2d7a4f', fontSize: '12px', fontWeight: '600',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        padding: '5px 14px', borderRadius: '30px', marginBottom: '14px',
    },
    adminEyebrow: {
        background: 'rgba(45,107,228,0.1)', border: '1px solid rgba(45,107,228,0.25)',
        color: '#2d6be4',
    },
    h1: {
        fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '700',
        fontFamily: "'Playfair Display', Georgia, serif",
        color: '#1a1a2e', margin: '0 0 0 0', letterSpacing: '-0.02em', lineHeight: 1.15,
    },
    nameAccent: { color: '#c8892a' },
    accentBar: {
        width: '44px', height: '3px', background: '#e8b86d',
        borderRadius: '2px', margin: '14px 0 16px 0',
    },
    headerSub: { color: '#6b6560', fontSize: '15px', margin: 0, fontWeight: '400', lineHeight: 1.6 },

    // Stat cards
    statsGrid3: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '20px', marginBottom: '28px',
    },
    statsGrid4: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px', marginBottom: '28px',
    },
    statCard: {
        background: 'white', borderRadius: '16px', padding: '28px 26px',
        border: '1.5px solid', boxShadow: '0 2px 12px rgba(26,26,46,0.06)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default', position: 'relative', overflow: 'hidden',
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

    // Section / card
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
        margin: 0, flex: 1, fontFamily: "'Playfair Display', Georgia, serif",
    },
    liveBadge: {
        fontSize: '11px', fontWeight: '700', color: '#2d7a4f',
        letterSpacing: '0.1em', animation: 'pulse 2s infinite',
    },

    // Actions
    actionsGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
    actionArrow: { fontSize: '16px', color: '#c8892a', opacity: 0.8, flexShrink: 0 },

    // Table
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    th: {
        padding: '13px 18px', textAlign: 'left',
        color: '#a09990', fontSize: '11px', fontWeight: '700',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        borderBottom: '1px solid #ede8df',
    },
    tr: { borderBottom: '1px solid #f5f2ec', transition: 'background 0.15s' },
    tdName: { padding: '14px 18px', color: '#1a1a2e', fontWeight: '600' },
    tdEmail: { padding: '14px 18px', color: '#6b6560' },
    tdDate: { padding: '14px 18px', color: '#a09990', fontSize: '13px' },

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
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

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
.action-btn:hover span:last-child { opacity: 1 !important; }

.table-row:hover { background: #faf9f7 !important; }
`;
