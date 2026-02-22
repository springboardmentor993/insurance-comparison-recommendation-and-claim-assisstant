import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function PolicyDetails() {
    const { policyId } = useParams();
    const navigate = useNavigate();
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => { fetchPolicy(); }, [policyId]);

    const fetchPolicy = async () => {
        try {
            setLoading(true);
            const res = await fetch(`http://localhost:8000/policies/${policyId}`);
            if (!res.ok) throw new Error("Failed to load policy");
            const data = await res.json();
            setPolicy(data);
            setError("");
        } catch (err) {
            console.error("Error:", err);
            setError("Error loading policy details: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={styles.centeredScreen}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading policy details...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (error) return (
        <div style={styles.centeredScreen}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={styles.errorCard}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                <h2 style={styles.errorTitle}>Failed to Load Policy</h2>
                <p style={styles.errorMsg}>{error}</p>
                <button onClick={() => navigate("/browse")} style={styles.btnPrimary} className="primary-btn">
                    ← Back to Browse
                </button>
            </div>
        </div>
    );

    if (!policy) return null;

    const getCoverageIcon = (key) => {
        const icons = {
            "Medical": "🏥", "Dental": "🦷", "Vision": "👁️", "Collision": "🚗",
            "Theft": "🔓", "Liability": "⚖️", "Death Benefit": "💰",
            "Hospitalization": "🏥", "Emergency": "🚑", "Accidental": "🆘",
            "Buildings": "🏠", "Contents": "📦", "Flights": "✈️",
            "Luggage": "🧳", "Medical Coverage": "🏥"
        };
        return icons[key] || "✓";
    };

    const getCoverageValue = (value) => {
        if (typeof value === "boolean") return value ? "Covered" : "Not Covered";
        if (typeof value === "number") return `$${value.toLocaleString()}`;
        if (typeof value === "string") return value;
        return "Included";
    };

    const isCovered = (value) => {
        if (typeof value === "boolean") return value;
        return true;
    };

    const policyTypeIcons = { auto: "🚗", health: "🏥", life: "❤️", home: "🏠", travel: "✈️" };
    const policyTypeColors = {
        auto: { color: "#38bdf8", bg: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.3)" },
        health: { color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)" },
        life: { color: "#f472b6", bg: "rgba(244,114,182,0.12)", border: "rgba(244,114,182,0.3)" },
        home: { color: "#fb923c", bg: "rgba(251,146,60,0.12)", border: "rgba(251,146,60,0.3)" },
        travel: { color: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)" },
    };
    const accent = policyTypeColors[policy.policy_type] || policyTypeColors.health;

    return (
        <div style={styles.page}>
            <style>{globalStyles}</style>
            <div style={styles.blob1} /><div style={styles.blob2} />
            <div style={{ ...styles.blob3, background: `radial-gradient(circle,${accent.color}18 0%,transparent 70%)` }} />

            <div style={styles.container}>

                {/* Back button */}
                <button onClick={() => navigate("/browse")} style={styles.btnBack} className="back-btn">
                    ← Back to Browse
                </button>

                {/* Hero Card */}
                <div style={{ ...styles.heroCard, borderColor: accent.border }}>
                    <div style={{ ...styles.heroBg, background: `linear-gradient(135deg, ${accent.color}22 0%, rgba(15,23,42,0) 100%)` }} />
                    <div style={styles.heroContent}>
                        <div style={{ ...styles.heroIconBox, background: accent.bg, borderColor: accent.border }}>
                            <span style={styles.heroIcon}>{policyTypeIcons[policy.policy_type] || "📋"}</span>
                        </div>
                        <div style={styles.heroText}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                <span style={{ ...styles.typeBadge, color: accent.color, background: accent.bg, borderColor: accent.border }}>
                                    {policy.policy_type?.toUpperCase()}
                                </span>
                            </div>
                            <h1 style={styles.heroTitle}>{policy.title}</h1>
                            <p style={styles.heroProvider}>
                                by <span style={{ color: '#e2e8f0', fontWeight: '700' }}>{policy.provider?.name || "Insurance Provider"}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Key Stats */}
                <div style={styles.statsGrid}>
                    {[
                        { label: "Monthly Premium", value: `$${parseFloat(policy.premium).toFixed(2)}`, icon: "💵", accent: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.25)" },
                        { label: "Policy Term", value: `${policy.term_months} mo`, icon: "📅", accent: "#38bdf8", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.25)" },
                        { label: "Deductible", value: `$${parseFloat(policy.deductible).toFixed(2)}`, icon: "💳", accent: "#fb923c", bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.25)" },
                    ].map((s, i) => (
                        <div key={i} style={{ ...styles.statCard, background: s.bg, borderColor: s.border }} className="stat-card">
                            <div style={{ ...styles.statIcon, color: s.accent }}>{s.icon}</div>
                            <p style={styles.statLabel}>{s.label}</p>
                            <h2 style={{ ...styles.statValue, color: s.accent }}>{s.value}</h2>
                            <div style={{ ...styles.statGlow, background: s.accent }} />
                        </div>
                    ))}
                </div>

                {/* Coverage Details */}
                {policy.coverage && Object.keys(policy.coverage).length > 0 && (
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <div style={styles.cardDot} />
                            <h2 style={styles.cardTitle}>Coverage Details</h2>
                            <span style={styles.countBadge}>{Object.keys(policy.coverage).length} items</span>
                        </div>
                        <div style={styles.coverageGrid}>
                            {Object.entries(policy.coverage).map(([key, value]) => {
                                const covered = isCovered(value);
                                return (
                                    <div key={key} style={{ ...styles.coverageItem, borderColor: covered ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)', background: covered ? 'rgba(52,211,153,0.05)' : 'rgba(248,113,113,0.05)' }} className="coverage-item">
                                        <div style={styles.coverageLeft}>
                                            <span style={styles.coverageIcon}>{getCoverageIcon(key)}</span>
                                            <span style={styles.coverageKey}>{key}</span>
                                        </div>
                                        <span style={{ ...styles.coverageVal, color: covered ? '#34d399' : '#f87171' }}>
                                            {covered ? '✅ ' : '❌ '}{getCoverageValue(value)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Policy Information */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={{ ...styles.cardDot, background: accent.color, boxShadow: `0 0 8px ${accent.color}66` }} />
                        <h2 style={styles.cardTitle}>Policy Information</h2>
                    </div>
                    <div style={styles.infoGrid}>
                        <InfoRow label="Policy Type" value={policy.policy_type?.toUpperCase()} />
                        <InfoRow label="Provider" value={policy.provider?.name} />
                        <InfoRow label="Premium" value={`$${parseFloat(policy.premium).toFixed(2)} / month`} accent="#34d399" />
                        <InfoRow label="Deductible" value={`$${parseFloat(policy.deductible).toFixed(2)}`} accent="#fb923c" />
                        <InfoRow label="Term" value={`${policy.term_months} months`} />
                    </div>
                    <div style={styles.descBox}>
                        <p style={styles.descText}>
                            This <strong style={{ color: accent.color }}>{policy.policy_type}</strong> insurance policy
                            provides comprehensive coverage with a monthly premium of{" "}
                            <strong style={{ color: '#34d399' }}>${parseFloat(policy.premium).toFixed(2)}</strong>.
                            The policy carries a deductible of{" "}
                            <strong style={{ color: '#fb923c' }}>${parseFloat(policy.deductible).toFixed(2)}</strong>{" "}
                            and covers a term of <strong style={{ color: '#38bdf8' }}>{policy.term_months} months</strong>.
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={styles.actionBar}>
                    <button onClick={() => navigate("/browse")} style={styles.btnOutline} className="outline-btn">
                        ← Back to Policies
                    </button>
                    <button onClick={() => navigate(`/apply/${policy.id}`)} style={styles.btnApply} className="apply-btn">
                        ✅ Apply Now
                    </button>
                </div>

            </div>
        </div>
    );
}

function InfoRow({ label, value, accent }) {
    return (
        <div style={infoRowStyle}>
            <span style={infoLabelStyle}>{label}</span>
            <span style={{ ...infoValueStyle, color: accent || '#e2e8f0' }}>{value || "—"}</span>
        </div>
    );
}

const infoRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' };
const infoLabelStyle = { color: '#64748b', fontSize: '13px', fontWeight: '600' };
const infoValueStyle = { fontSize: '14px', fontWeight: '700', textAlign: 'right' };

const styles = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b2e 40%, #0a1628 70%, #06111f 100%)',
        padding: '48px 20px',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        position: 'relative', overflow: 'hidden',
    },
    blob1: { position: 'fixed', top: '-110px', right: '-80px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,0.12) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 },
    blob2: { position: 'fixed', bottom: '-120px', left: '-100px', width: '560px', height: '560px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.10) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 },
    blob3: { position: 'fixed', top: '35%', right: '5%', width: '380px', height: '380px', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 },
    container: { maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 },
    // Centered screens
    centeredScreen: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#0a0f1e,#0d1b2e)', gap: '16px', padding: '20px' },
    spinner: { width: '44px', height: '44px', border: '3px solid rgba(96,165,250,0.2)', borderTop: '3px solid #60a5fa', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    loadingText: { color: '#64748b', fontSize: '16px', fontWeight: '500', margin: 0 },
    errorCard: { background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '20px', padding: '44px 40px', maxWidth: '480px', textAlign: 'center', backdropFilter: 'blur(20px)' },
    errorTitle: { color: '#f1f5f9', fontSize: '22px', fontWeight: '800', margin: '0 0 12px 0' },
    errorMsg: { color: '#64748b', fontSize: '15px', margin: '0 0 28px 0', lineHeight: 1.6 },
    // Back btn
    btnBack: { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 20px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", marginBottom: '20px', transition: 'all 0.15s' },
    // Hero
    heroCard: { background: 'rgba(15,23,42,0.80)', border: '1px solid', borderRadius: '20px', overflow: 'hidden', marginBottom: '20px', backdropFilter: 'blur(20px)', boxShadow: '0 4px 40px rgba(0,0,0,0.35)', position: 'relative' },
    heroBg: { position: 'absolute', inset: 0, pointerEvents: 'none' },
    heroContent: { display: 'flex', alignItems: 'center', gap: '20px', padding: '32px', position: 'relative', flexWrap: 'wrap' },
    heroIconBox: { width: '80px', height: '80px', borderRadius: '18px', border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    heroIcon: { fontSize: '40px' },
    heroText: { flex: 1, minWidth: '200px' },
    typeBadge: { fontSize: '11px', fontWeight: '800', letterSpacing: '0.1em', padding: '4px 12px', borderRadius: '20px', border: '1px solid' },
    heroTitle: { fontSize: 'clamp(20px,3vw,30px)', fontWeight: '800', color: '#f1f5f9', margin: '0 0 8px 0', letterSpacing: '-0.5px' },
    heroProvider: { color: '#64748b', fontSize: '15px', margin: 0 },
    // Stats
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px', marginBottom: '20px' },
    statCard: { borderRadius: '16px', padding: '24px 22px', border: '1px solid', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(10px)', transition: 'transform 0.2s ease' },
    statIcon: { fontSize: '24px', marginBottom: '10px', display: 'block' },
    statLabel: { color: '#94a3b8', fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px 0' },
    statValue: { fontSize: '30px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px', lineHeight: 1 },
    statGlow: { position: 'absolute', bottom: '-28px', right: '-28px', width: '80px', height: '80px', borderRadius: '50%', opacity: 0.08, filter: 'blur(16px)' },
    // Card
    card: { background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '28px 30px', marginBottom: '20px', backdropFilter: 'blur(20px)', boxShadow: '0 4px 36px rgba(0,0,0,0.3)' },
    cardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' },
    cardDot: { width: '10px', height: '10px', borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 8px rgba(96,165,250,0.6)', flexShrink: 0 },
    cardTitle: { fontSize: '18px', fontWeight: '700', color: '#f1f5f9', margin: 0, flex: 1 },
    countBadge: { fontSize: '11px', fontWeight: '700', color: '#60a5fa', background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)', padding: '4px 12px', borderRadius: '20px', letterSpacing: '0.04em' },
    // Coverage
    coverageGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '10px' },
    coverageItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '13px 16px', borderRadius: '10px', border: '1px solid', transition: 'opacity 0.15s' },
    coverageLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
    coverageIcon: { fontSize: '18px', flexShrink: 0 },
    coverageKey: { color: '#cbd5e1', fontSize: '13px', fontWeight: '600' },
    coverageVal: { fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' },
    // Info
    infoGrid: { display: 'flex', flexDirection: 'column', marginBottom: '16px' },
    descBox: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px 18px' },
    descText: { color: '#94a3b8', fontSize: '14px', lineHeight: 1.7, margin: 0 },
    // Action bar
    actionBar: { display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', paddingBottom: '20px' },
    btnPrimary: { background: 'linear-gradient(135deg,#1d4ed8,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 28px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", boxShadow: '0 4px 18px rgba(79,70,229,0.4)', transition: 'transform 0.18s' },
    btnOutline: { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '14px 32px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.15s' },
    btnApply: { background: 'linear-gradient(135deg,#047857,#059669)', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px 40px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", boxShadow: '0 6px 24px rgba(5,150,105,0.4)', transition: 'transform 0.18s,box-shadow 0.18s', letterSpacing: '0.02em' },
};

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; }

.stat-card:hover { transform: translateY(-4px); }
.coverage-item:hover { opacity: 0.85; }
.back-btn:hover { background: rgba(255,255,255,0.09) !important; color: #cbd5e1 !important; }
.outline-btn:hover { background: rgba(255,255,255,0.09) !important; color: #e2e8f0 !important; border-color: rgba(255,255,255,0.2) !important; }
.apply-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 32px rgba(5,150,105,0.5) !important; }
.primary-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }

@keyframes spin { to { transform: rotate(360deg); } }
`;
