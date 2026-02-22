import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FraudMonitoring() {
    const navigate = useNavigate();
    const [summary, setSummary] = useState({
        total_flags: 0,
        claims_flagged: 0,
        severity_distribution: { high: 0, medium: 0, low: 0 },
        top_fraud_rules: []
    });
    const [highRiskClaims, setHighRiskClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) { navigate("/login"); return; }

        const user = localStorage.getItem('user');
        let isAdmin = false;
        try {
            if (user) { const userData = JSON.parse(user); isAdmin = userData.is_admin === true; }
        } catch (e) { isAdmin = localStorage.getItem('is_admin') === 'true'; }

        if (!isAdmin) {
            setError("You don't have permission to access fraud monitoring. Admin access required.");
            setLoading(false);
            return;
        }

        fetchFraudData();
    }, [token, navigate]);

    const fetchFraudData = async () => {
        try {
            setLoading(true);
            const summaryRes = await fetch(`http://localhost:8000/fraud/summary?token=${token}`);
            if (!summaryRes.ok) throw new Error("Failed to fetch fraud summary");
            const summaryData = await summaryRes.json();

            setSummary({
                total_flags: summaryData?.total_flags ?? 0,
                claims_flagged: summaryData?.claims_flagged ?? 0,
                severity_distribution: {
                    high: summaryData?.severity_distribution?.high ?? 0,
                    medium: summaryData?.severity_distribution?.medium ?? 0,
                    low: summaryData?.severity_distribution?.low ?? 0
                },
                top_fraud_rules: summaryData?.top_fraud_rules ?? []
            });

            const claimsRes = await fetch(`http://localhost:8000/fraud/high-risk-claims?token=${token}`);
            if (!claimsRes.ok) throw new Error("Failed to fetch high-risk claims");
            const claimsData = await claimsRes.json();
            setHighRiskClaims(Array.isArray(claimsData) ? claimsData : []);
            console.log('Fraud data loaded successfully:', { summaryData, claimsData });
            setError("");
        } catch (err) {
            console.error("Fraud monitoring error:", err);
            setError("Error loading fraud data: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const getRiskStyle = (level) => {
        const l = (level || 'LOW').toUpperCase();
        if (l === 'CRITICAL') return { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' };
        if (l === 'HIGH') return { color: '#fb923c', bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.3)' };
        return { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)' };
    };

    if (loading) return (
        <div style={styles.centeredScreen}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading fraud data...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (error) return (
        <div style={styles.centeredScreen}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={styles.errorCard}>
                <div style={styles.errorIconBox}>⚠️</div>
                <h2 style={styles.errorTitle}>Access Denied</h2>
                <p style={styles.errorMsg}>{error}</p>
                <button onClick={() => navigate("/claims")} style={styles.btnPrimary} className="primary-btn">
                    ← Go Back
                </button>
            </div>
        </div>
    );

    return (
        <div style={styles.page}>
            <style>{globalStyles}</style>
            <div style={styles.blob1} /><div style={styles.blob2} /><div style={styles.blob3} />

            <div style={styles.container}>

                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerLeft}>
                        <div style={styles.headerBadge}>🛡️ Admin Analytics</div>
                        <h1 style={styles.headerTitle}>Fraud Monitoring</h1>
                        <p style={styles.headerSub}>Real-time fraud detection rules and high-risk claim analysis</p>
                    </div>
                    <button onClick={() => navigate("/claims")} style={styles.btnBack} className="back-btn">
                        ← Back
                    </button>
                </div>

                {/* Stats Cards */}
                <div style={styles.statsGrid}>
                    {[
                        { label: "Total Fraud Flags", value: summary.total_flags, icon: "🚩", accent: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)" },
                        { label: "High Severity", value: summary.severity_distribution.high, icon: "🔴", accent: "#fb923c", bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.25)" },
                        { label: "Medium Severity", value: summary.severity_distribution.medium, icon: "🟡", accent: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.25)" },
                        { label: "Claims Flagged", value: summary.claims_flagged, icon: "📋", accent: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.25)" },
                    ].map((card, i) => (
                        <div key={i} style={{ ...styles.statCard, background: card.bg, borderColor: card.border }} className="stat-card">
                            <div style={{ ...styles.statIcon, color: card.accent }}>{card.icon}</div>
                            <p style={styles.statLabel}>{card.label}</p>
                            <h2 style={{ ...styles.statValue, color: card.accent }}>{card.value}</h2>
                            <div style={{ ...styles.statGlow, background: card.accent }} />
                        </div>
                    ))}
                </div>

                {/* Top Fraud Rules */}
                {summary?.top_fraud_rules?.length > 0 && (
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <div style={styles.cardDot} />
                            <h2 style={styles.cardTitle}>Top Fraud Rules Triggered</h2>
                            <span style={styles.countBadge}>{summary.top_fraud_rules.length} rules</span>
                        </div>
                        <div style={styles.rulesGrid}>
                            {summary.top_fraud_rules.map((rule, idx) => (
                                <div key={idx} style={styles.ruleCard} className="rule-card">
                                    <div style={styles.ruleRank}>#{idx + 1}</div>
                                    <div style={styles.ruleBody}>
                                        <p style={styles.ruleName}>{rule.rule}</p>
                                        <div style={styles.ruleBar}>
                                            <div style={{
                                                ...styles.ruleBarFill,
                                                width: `${Math.min(100, (rule.count / (summary.top_fraud_rules[0]?.count || 1)) * 100)}%`
                                            }} />
                                        </div>
                                    </div>
                                    <div style={styles.ruleCount}>
                                        <span style={styles.ruleCountNum}>{rule.count}</span>
                                        <span style={styles.ruleCountLabel}>triggers</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* High-Risk Claims Table */}
                {highRiskClaims.length > 0 ? (
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <div style={{ ...styles.cardDot, background: '#f87171', boxShadow: '0 0 8px rgba(248,113,113,0.6)' }} />
                            <h2 style={styles.cardTitle}>High-Risk Claims Requiring Review</h2>
                            <span style={{ ...styles.countBadge, color: '#f87171', background: 'rgba(248,113,113,0.12)', borderColor: 'rgba(248,113,113,0.3)' }}>
                                {highRiskClaims.length} claims
                            </span>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        {["Claim #", "User", "Type", "Amount", "Risk Level", "High Flags", "Status"].map((h, i) => (
                                            <th key={i} style={{ ...styles.th, textAlign: i >= 3 ? 'center' : 'left' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {highRiskClaims.map(claim => {
                                        const risk = getRiskStyle(claim?.risk_level);
                                        return (
                                            <tr key={claim?.id} style={styles.tr} className="table-row">
                                                <td style={{ ...styles.td, color: '#60a5fa', fontWeight: '700' }}>
                                                    {claim?.claim_number || 'N/A'}
                                                </td>
                                                <td style={{ ...styles.td, color: '#e2e8f0', fontWeight: '600' }}>
                                                    {claim?.user_name || 'Unknown'}
                                                </td>
                                                <td style={{ ...styles.td, color: '#94a3b8', textTransform: 'capitalize' }}>
                                                    {claim?.claim_type || 'Unknown'}
                                                </td>
                                                <td style={{ ...styles.td, color: '#f87171', fontWeight: '700', textAlign: 'center' }}>
                                                    ${(claim?.amount_claimed || 0).toFixed(2)}
                                                </td>
                                                <td style={{ ...styles.td, textAlign: 'center' }}>
                                                    <span style={{ color: risk.color, background: risk.bg, border: `1px solid ${risk.border}`, fontSize: '11px', fontWeight: '800', padding: '4px 12px', borderRadius: '20px', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                                                        {claim?.risk_level || 'LOW'}
                                                    </span>
                                                </td>
                                                <td style={{ ...styles.td, textAlign: 'center', color: '#f87171', fontWeight: '800', fontSize: '16px' }}>
                                                    {claim?.high_severity_flags ?? 0}
                                                </td>
                                                <td style={{ ...styles.td, textAlign: 'center' }}>
                                                    <span style={{ color: '#fb923c', background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.25)', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                        {claim?.status || 'Unknown'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>✅</div>
                        <p style={styles.emptyTitle}>No High-Risk Claims</p>
                        <p style={styles.emptySubText}>All claims are within acceptable risk parameters.</p>
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
        padding: '48px 20px',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        position: 'relative', overflow: 'hidden',
    },
    blob1: { position: 'fixed', top: '-110px', right: '-80px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(248,113,113,0.10) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 },
    blob2: { position: 'fixed', bottom: '-120px', left: '-100px', width: '560px', height: '560px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.09) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 },
    blob3: { position: 'fixed', top: '42%', left: '48%', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(251,146,60,0.05) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0, transform: 'translate(-50%,-50%)' },
    container: { maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 },
    // Centered screens
    centeredScreen: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#0a0f1e,#0d1b2e)', gap: '16px', padding: '20px' },
    spinner: { width: '44px', height: '44px', border: '3px solid rgba(96,165,250,0.2)', borderTop: '3px solid #60a5fa', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    loadingText: { color: '#64748b', fontSize: '16px', fontWeight: '500', margin: 0 },
    errorCard: { background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '20px', padding: '44px 40px', maxWidth: '480px', textAlign: 'center', backdropFilter: 'blur(20px)' },
    errorIconBox: { fontSize: '48px', marginBottom: '16px' },
    errorTitle: { color: '#f87171', fontSize: '22px', fontWeight: '800', margin: '0 0 12px 0' },
    errorMsg: { color: '#64748b', fontSize: '15px', margin: '0 0 28px 0', lineHeight: 1.6 },
    // Header
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' },
    headerLeft: {},
    headerBadge: { display: 'inline-block', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', color: '#fca5a5', fontSize: '13px', fontWeight: '600', letterSpacing: '0.08em', padding: '6px 14px', borderRadius: '20px', marginBottom: '14px' },
    headerTitle: { fontSize: 'clamp(28px,4vw,44px)', fontWeight: '800', background: 'linear-gradient(135deg,#f1f5f9 0%,#94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 10px 0', letterSpacing: '-1px' },
    headerSub: { color: '#64748b', fontSize: '15px', margin: 0 },
    // Stats
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '18px', marginBottom: '24px' },
    statCard: { borderRadius: '18px', padding: '26px 22px', border: '1px solid', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(10px)', transition: 'transform 0.2s ease' },
    statIcon: { fontSize: '26px', marginBottom: '10px', display: 'block' },
    statLabel: { color: '#94a3b8', fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px 0' },
    statValue: { fontSize: '40px', fontWeight: '800', margin: 0, letterSpacing: '-1px', lineHeight: 1 },
    statGlow: { position: 'absolute', bottom: '-30px', right: '-30px', width: '90px', height: '90px', borderRadius: '50%', opacity: 0.08, filter: 'blur(20px)', pointerEvents: 'none' },
    // Card
    card: { background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '32px', marginBottom: '20px', backdropFilter: 'blur(20px)', boxShadow: '0 4px 40px rgba(0,0,0,0.3)' },
    cardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' },
    cardDot: { width: '10px', height: '10px', borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 8px rgba(96,165,250,0.6)', flexShrink: 0 },
    cardTitle: { fontSize: '18px', fontWeight: '700', color: '#f1f5f9', margin: 0, flex: 1 },
    countBadge: { fontSize: '11px', fontWeight: '700', color: '#60a5fa', background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)', padding: '4px 12px', borderRadius: '20px', letterSpacing: '0.04em' },
    // Rules
    rulesGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
    ruleCard: { display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px 18px', transition: 'background 0.15s' },
    ruleRank: { color: '#475569', fontSize: '13px', fontWeight: '800', width: '28px', textAlign: 'center', flexShrink: 0 },
    ruleBody: { flex: 1, minWidth: 0 },
    ruleName: { color: '#cbd5e1', fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0', wordBreak: 'break-word' },
    ruleBar: { height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' },
    ruleBarFill: { height: '100%', background: 'linear-gradient(90deg,#2563eb,#7c3aed)', borderRadius: '99px', transition: 'width 0.5s ease' },
    ruleCount: { display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 },
    ruleCountNum: { color: '#a78bfa', fontSize: '22px', fontWeight: '800', lineHeight: 1 },
    ruleCountLabel: { color: '#475569', fontSize: '11px', fontWeight: '600', letterSpacing: '0.06em' },
    // Table
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    th: { padding: '12px 16px', color: '#475569', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.06)' },
    tr: { borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' },
    td: { padding: '14px 16px', color: '#94a3b8', fontSize: '13px' },
    // Buttons
    btnPrimary: { background: 'linear-gradient(135deg,#1d4ed8,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", boxShadow: '0 4px 18px rgba(79,70,229,0.4)', transition: 'transform 0.18s' },
    btnBack: { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 22px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", flexShrink: 0, alignSelf: 'flex-start', transition: 'all 0.15s' },
    // Empty
    emptyState: { textAlign: 'center', padding: '64px 32px', background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', backdropFilter: 'blur(20px)' },
    emptyIcon: { fontSize: '52px', marginBottom: '14px' },
    emptyTitle: { color: '#34d399', fontSize: '20px', fontWeight: '700', margin: '0 0 8px 0' },
    emptySubText: { color: '#475569', fontSize: '14px', margin: 0 },
};

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; }

.stat-card:hover { transform: translateY(-4px); }
.rule-card:hover { background: rgba(255,255,255,0.05) !important; }
.table-row:hover { background: rgba(255,255,255,0.03); }
.primary-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(79,70,229,0.5) !important; }
.back-btn:hover { background: rgba(255,255,255,0.09) !important; color: #cbd5e1 !important; }

@keyframes spin { to { transform: rotate(360deg); } }
`;
