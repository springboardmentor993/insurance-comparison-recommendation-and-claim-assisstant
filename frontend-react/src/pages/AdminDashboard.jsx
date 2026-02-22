import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState({ users: 0, policies: 0, claims: 0, fraud: 0 });
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (user) {
            const userObj = JSON.parse(user);
            setUserData(userObj);
        }

        if (token) {
            fetchAdminStats(token);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchAdminStats = async (token) => {
        try {
            setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingScreen}>
                <div style={styles.loadingSpinner}></div>
                <p style={styles.loadingText}>Loading Admin Panel...</p>
                <style>{spinnerStyle}</style>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <style>{globalStyles}</style>

            {/* Ambient background blobs */}
            <div style={styles.blob1} />
            <div style={styles.blob2} />
            <div style={styles.blob3} />

            <div style={styles.container}>

                {/* Header */}
                <section style={styles.header}>
                    <div style={styles.headerBadge}>⚡ Admin Panel</div>
                    <h1 style={styles.headerTitle}>Control Center</h1>
                    <p style={styles.headerSub}>Monitor system activity, users, and fraud detection in real-time</p>
                </section>

                {/* Stats Cards */}
                <div style={styles.statsGrid}>
                    {[
                        { title: "Total Users", value: stats.users, icon: "👥", accent: "#38bdf8", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.25)" },
                        { title: "Policies", value: stats.policies, icon: "📋", accent: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.25)" },
                        { title: "Claims", value: stats.claims, icon: "📁", accent: "#fb923c", bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.25)" },
                        { title: "Fraud Flags", value: stats.fraud, icon: "🚨", accent: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)" },
                    ].map((card, i) => (
                        <div key={i} style={{ ...styles.statCard, background: card.bg, borderColor: card.border }} className="stat-card">
                            <div style={{ ...styles.statIcon, color: card.accent }}>{card.icon}</div>
                            <p style={styles.statLabel}>{card.title}</p>
                            <h2 style={{ ...styles.statValue, color: card.accent }}>{card.value}</h2>
                            <div style={{ ...styles.statGlow, background: card.accent }} />
                        </div>
                    ))}
                </div>

                {/* Admin Actions */}
                <section style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={styles.cardDot} />
                        <h2 style={styles.cardTitle}>Admin Actions</h2>
                    </div>
                    <div style={styles.actionsGrid}>
                        <Link to="/admin/claims" style={{ ...styles.actionBtn, background: "linear-gradient(135deg, #10b981, #059669)" }} className="action-btn">
                            <span style={styles.actionIcon}>✓📋</span>
                            <span style={styles.actionLabel}>Review Claims</span>
                            <span style={styles.actionArrow}>→</span>
                        </Link>
                        <Link to="/admin/documents" style={{ ...styles.actionBtn, background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }} className="action-btn">
                            <span style={styles.actionIcon}>📂</span>
                            <span style={styles.actionLabel}>Review Documents</span>
                            <span style={styles.actionArrow}>→</span>
                        </Link>
                        <Link to="/admin/users" style={{ ...styles.actionBtn, background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }} className="action-btn">
                            <span style={styles.actionIcon}>👤</span>
                            <span style={styles.actionLabel}>Manage Users</span>
                            <span style={styles.actionArrow}>→</span>
                        </Link>
                        <Link to="/admin/fraud" style={{ ...styles.actionBtn, background: "linear-gradient(135deg, #dc2626, #b91c1c)" }} className="action-btn">
                            <span style={styles.actionIcon}>🚨</span>
                            <span style={styles.actionLabel}>Fraud Monitoring</span>
                            <span style={styles.actionArrow}>→</span>
                        </Link>
                    </div>
                </section>

                {/* Recent Users Table */}
                {recentUsers.length > 0 && (
                    <section style={styles.card}>
                        <div style={styles.cardHeader}>
                            <div style={{ ...styles.cardDot, background: "#34d399" }} />
                            <h2 style={styles.cardTitle}>Recent Users</h2>
                            <span style={styles.liveBadge}>● LIVE</span>
                        </div>

                        <div style={styles.tableWrapper}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.thead}>
                                        <th style={styles.th}>Name</th>
                                        <th style={styles.th}>Email</th>
                                        <th style={styles.th}>Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentUsers.map(user => (
                                        <tr key={user.id} style={styles.tr} className="table-row">
                                            <td style={styles.tdName}>{user.name}</td>
                                            <td style={styles.tdEmail}>{user.email}</td>
                                            <td style={styles.tdDate}>
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {recentUsers.length === 0 && (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>👤</div>
                        <p style={styles.emptyText}>No recent users found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b2e 40%, #0a1628 70%, #06111f 100%)',
        padding: '40px 20px',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        position: 'relative',
        overflow: 'hidden',
    },
    blob1: {
        position: 'fixed', top: '-100px', right: '-100px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
    },
    blob2: {
        position: 'fixed', bottom: '-150px', left: '-100px',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
    },
    blob3: {
        position: 'fixed', top: '40%', left: '50%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0, transform: 'translate(-50%, -50%)',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
    },
    // Header
    header: {
        marginBottom: '48px',
        textAlign: 'left',
    },
    headerBadge: {
        display: 'inline-block',
        background: 'rgba(59,130,246,0.15)',
        border: '1px solid rgba(59,130,246,0.3)',
        color: '#60a5fa',
        fontSize: '13px',
        fontWeight: '600',
        letterSpacing: '0.08em',
        padding: '6px 14px',
        borderRadius: '20px',
        marginBottom: '16px',
    },
    headerTitle: {
        fontSize: '48px',
        fontWeight: '800',
        color: '#f1f5f9',
        margin: '0 0 10px 0',
        letterSpacing: '-1px',
        lineHeight: 1.1,
        background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    headerSub: {
        color: '#64748b',
        fontSize: '16px',
        margin: 0,
        fontWeight: '400',
    },
    // Stats
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '28px',
    },
    statCard: {
        borderRadius: '16px',
        padding: '28px 24px',
        border: '1px solid',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        backdropFilter: 'blur(10px)',
    },
    statGlow: {
        position: 'absolute',
        bottom: '-30px', right: '-30px',
        width: '100px', height: '100px',
        borderRadius: '50%',
        opacity: 0.08,
        filter: 'blur(20px)',
    },
    statIcon: {
        fontSize: '26px',
        marginBottom: '12px',
        display: 'block',
    },
    statLabel: {
        color: '#94a3b8',
        fontSize: '12px',
        fontWeight: '600',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        margin: '0 0 6px 0',
    },
    statValue: {
        fontSize: '42px',
        fontWeight: '800',
        margin: 0,
        letterSpacing: '-1px',
        lineHeight: 1,
    },
    // Card
    card: {
        background: 'rgba(15,23,42,0.7)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '24px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 40px rgba(0,0,0,0.3)',
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '24px',
    },
    cardDot: {
        width: '10px', height: '10px',
        borderRadius: '50%',
        background: '#60a5fa',
        boxShadow: '0 0 8px rgba(96,165,250,0.6)',
    },
    cardTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#f1f5f9',
        margin: 0,
        flex: 1,
    },
    liveBadge: {
        fontSize: '11px',
        fontWeight: '700',
        color: '#34d399',
        letterSpacing: '0.08em',
        animation: 'pulse 2s infinite',
    },
    // Actions
    actionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
    },
    actionBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '18px 20px',
        borderRadius: '12px',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '15px',
        color: '#fff',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    },
    actionIcon: { fontSize: '20px' },
    actionLabel: { flex: 1 },
    actionArrow: { fontSize: '18px', opacity: 0.7 },
    // Table
    tableWrapper: { overflowX: 'auto' },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px',
    },
    thead: {},
    th: {
        padding: '12px 16px',
        textAlign: 'left',
        color: '#475569',
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    tr: {
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        transition: 'background 0.15s',
    },
    tdName: {
        padding: '14px 16px',
        color: '#e2e8f0',
        fontWeight: '600',
    },
    tdEmail: {
        padding: '14px 16px',
        color: '#94a3b8',
    },
    tdDate: {
        padding: '14px 16px',
        color: '#64748b',
        fontSize: '13px',
    },
    // Empty
    emptyState: {
        background: 'rgba(15,23,42,0.7)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '20px',
        padding: '48px 32px',
        textAlign: 'center',
        backdropFilter: 'blur(20px)',
    },
    emptyIcon: { fontSize: '40px', marginBottom: '12px' },
    emptyText: { color: '#475569', fontSize: '15px', margin: 0 },
    // Loading
    loadingScreen: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0f1e, #0d1b2e)',
        gap: '16px',
    },
    loadingSpinner: {
        width: '44px', height: '44px',
        border: '3px solid rgba(96,165,250,0.2)',
        borderTop: '3px solid #60a5fa',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    loadingText: {
        color: '#64748b',
        fontSize: '16px',
        fontWeight: '500',
        margin: 0,
    },
};

const spinnerStyle = `
@keyframes spin { to { transform: rotate(360deg); } }
`;

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

* { box-sizing: border-box; }

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.4) !important;
}

.action-btn:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 10px 30px rgba(0,0,0,0.4) !important;
}

.table-row:hover {
    background: rgba(255,255,255,0.03);
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
`;
