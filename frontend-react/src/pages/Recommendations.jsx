import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function normalizeRecommendation(rec, idx) {
    const policy = rec?.policy || rec || {};
    const nestedPolicy = policy?.policy || {};

    const title = policy?.title || policy?.policy?.title || nestedPolicy?.title || "Unknown Policy";
    const desc = policy?.description || policy?.policy?.description || nestedPolicy?.description || title;
    const premium = policy?.premium ?? policy?.policy?.premium ?? nestedPolicy?.premium ?? 0;
    const type = policy?.policy_type || policy?.policy?.policy_type || nestedPolicy?.policy_type || "N/A";
    const providerName = policy?.provider?.name || policy?.policy?.provider?.name || nestedPolicy?.provider?.name || "Unknown Provider";
    const termMonths = policy?.term_months ?? policy?.policy?.term_months ?? nestedPolicy?.term_months ?? "N/A";
    const deductible = policy?.deductible ?? policy?.policy?.deductible ?? nestedPolicy?.deductible ?? 0;

    const recommendationId = rec?.id ?? `${policy?.id ?? nestedPolicy?.id ?? idx}`;
    const score = Number(rec?.score ?? 0);
    const safeScore = Number.isFinite(score) ? Number(score.toFixed(2)) : 0;
    const reason = rec?.reason || "No specific reason available.";
    const policyId = rec?.policy_id || policy?.id || policy?.policy?.id || nestedPolicy?.id || null;

    return { recommendationId, rawRecommendationId: rec?.id, title, desc, premium, type, providerName, termMonths, deductible, safeScore, reason, policyId };
}

function getScoreColor(score) {
    if (score >= 80) return "#34d399";
    if (score >= 60) return "#fbbf24";
    if (score >= 40) return "#fb923c";
    return "#f87171";
}

function getScoreLabel(score) {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Low Match";
}

const policyTypeIcons = { auto: "🚗", health: "🏥", life: "❤️", home: "🏠", travel: "✈️" };

export default function Recommendations() {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [regenerating, setRegenerating] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryToken = searchParams.get("token");
    const storedToken = localStorage.getItem("token");
    const token = storedToken || queryToken || "";

    useEffect(() => {
        if (!storedToken && queryToken) localStorage.setItem("token", queryToken);
    }, [storedToken, queryToken]);

    useEffect(() => {
        if (token) {
            fetchRecommendations();
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user_id");
            localStorage.removeItem("userId");
            setError("Session expired. Please sign in again.");
            setLoading(false);
            navigate("/login");
        }
    }, [token, navigate]);

    useEffect(() => { console.log("recommendations", recommendations); }, [recommendations]);

    const fetchRecommendations = async ({ showLoading = true, forceRefresh = false } = {}) => {
        try {
            if (showLoading) setLoading(true);
            const params = new URLSearchParams();
            if (forceRefresh) params.append("_", Date.now().toString());
            const url = `http://localhost:8000/recommendations${params.toString() ? `?${params.toString()}` : ""}`;
            const res = await fetch(url, { cache: "no-store", headers: token ? { Authorization: `Bearer ${token}` } : {} });

            if (res.status === 401) {
                localStorage.removeItem("token"); localStorage.removeItem("user_id"); localStorage.removeItem("userId");
                navigate("/login"); return;
            }
            if (!res.ok) { const errText = await res.text(); throw new Error(`HTTP ${res.status}: ${errText}`); }

            const data = await res.json();
            const parsedRecs = Array.isArray(data) ? data : Array.isArray(data?.recommendations) ? data.recommendations : [];
            console.log("Recommendations data:", data);
            console.log("Recommendations list:", parsedRecs);
            setRecommendations(parsedRecs);
            if (parsedRecs.length === 0) setError("No recommendations yet. Click 'Regenerate' to generate personalized recommendations.");
            else setError("");
        } catch (err) {
            console.error("Error:", err);
            setError("Error loading recommendations: " + err.message);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const regenerateRecommendations = async () => {
        try {
            setRegenerating(true);
            await fetchRecommendations({ showLoading: false, forceRefresh: true });
        } catch (err) {
            console.error("Error:", err);
            setError("Error regenerating recommendations: " + err.message);
        } finally {
            setRegenerating(false);
        }
    };

    const deleteRecommendation = async (recId) => {
        if (!recId) return;
        try {
            const url = `http://localhost:8000/recommendations/${recId}`;
            const res = await fetch(url, { method: "DELETE", headers: token ? { Authorization: `Bearer ${token}` } : {} });
            if (res.status === 401) {
                localStorage.removeItem("token"); localStorage.removeItem("user_id"); localStorage.removeItem("userId");
                navigate("/login"); return;
            }
            if (!res.ok) throw new Error("Failed to delete");
            setRecommendations(prev => Array.isArray(prev) ? prev.filter(r => r?.id !== recId) : prev);
        } catch (err) {
            console.error("Error:", err);
            setError("Error deleting recommendation");
        }
    };

    if (loading) return (
        <div style={styles.centeredScreen}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading recommendations...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (error) return (
        <div style={styles.centeredScreen}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={styles.errorCard}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
                <h2 style={styles.errorTitle}>No Recommendations Yet</h2>
                <p style={styles.errorMsg}>{error}</p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button onClick={regenerateRecommendations} disabled={regenerating}
                        style={regenerating ? styles.btnDisabled : styles.btnGreen} className="primary-btn">
                        {regenerating ? "Generating..." : "✨ Generate"}
                    </button>
                    <button onClick={() => navigate("/browse")} style={styles.btnSecondary} className="secondary-btn">
                        Browse Policies
                    </button>
                </div>
            </div>
        </div>
    );

    if (!Array.isArray(recommendations)) return <p>No data</p>;

    const normalizedRecommendations = recommendations.map((rec, idx) => normalizeRecommendation(rec, idx)).filter(Boolean);

    return (
        <div style={styles.page}>
            <style>{globalStyles}</style>
            <div style={styles.blob1} /><div style={styles.blob2} /><div style={styles.blob3} />

            <div style={styles.container}>

                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerBadge}>✨ AI-Powered</div>
                    <h1 style={styles.headerTitle}>Your Personalized Recommendations</h1>
                    <p style={styles.headerSub}>
                        {normalizedRecommendations.length > 0
                            ? `${normalizedRecommendations.length} recommended policies matched to your profile`
                            : "No recommendations yet — set your preferences to get started!"}
                    </p>
                </div>

                {/* Action buttons */}
                <div style={styles.actionBar}>
                    <button onClick={() => navigate("/profile")} style={styles.btnOutline} className="outline-btn">
                        ✏️ Update Preferences
                    </button>
                    <button onClick={regenerateRecommendations} disabled={regenerating}
                        style={regenerating ? styles.btnDisabled : styles.btnGreen} className="primary-btn">
                        {regenerating ? "⏳ Regenerating..." : "🔄 Regenerate"}
                    </button>
                </div>

                {/* Recommendation Cards */}
                {normalizedRecommendations.length > 0 ? (
                    <div style={styles.recList}>
                        {normalizedRecommendations.map((rec, idx) => {
                            const scoreColor = getScoreColor(rec.safeScore);
                            const scoreLabel = getScoreLabel(rec.safeScore);
                            const typeIcon = policyTypeIcons[rec.type] || "📋";

                            return (
                                <div key={rec.recommendationId} style={styles.recCard} className="rec-card">

                                    {/* Rank badge */}
                                    <div style={{ ...styles.rankBadge, background: scoreColor, boxShadow: `0 0 16px ${scoreColor}55` }}>
                                        #{idx + 1}
                                    </div>

                                    {/* Card Header */}
                                    <div style={{ ...styles.recCardHeader, borderColor: `${scoreColor}30`, background: `${scoreColor}0a` }}>
                                        <div style={styles.recCardHeaderLeft}>
                                            <span style={styles.recTypeIcon}>{typeIcon}</span>
                                            <div>
                                                <h3 style={styles.recTitle}>{rec.title}</h3>
                                                <span style={{ ...styles.recTypeBadge, color: scoreColor, background: `${scoreColor}18`, borderColor: `${scoreColor}40` }}>
                                                    {rec.type}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Score */}
                                        <div style={styles.scoreBox}>
                                            <div style={{ ...styles.scoreValue, color: scoreColor }}>{rec.safeScore.toFixed(1)}%</div>
                                            <div style={styles.scoreLabel}>{scoreLabel}</div>
                                            {/* Score arc bar */}
                                            <div style={styles.scoreBar}>
                                                <div style={{ ...styles.scoreBarFill, width: `${Math.min(100, rec.safeScore)}%`, background: scoreColor }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div style={styles.recCardBody}>
                                        {/* Meta grid */}
                                        <div style={styles.metaGrid}>
                                            {[
                                                { label: "Provider", value: rec.providerName },
                                                { label: "Premium", value: `$${rec.premium}/mo`, accent: "#34d399" },
                                                { label: "Term", value: rec.termMonths !== "N/A" ? `${rec.termMonths} months` : "N/A" },
                                                { label: "Deductible", value: `$${rec.deductible}` },
                                            ].map((m, i) => (
                                                <div key={i} style={styles.metaItem}>
                                                    <span style={styles.metaLabel}>{m.label}</span>
                                                    <span style={{ ...styles.metaValue, color: m.accent || '#e2e8f0' }}>{m.value}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Description */}
                                        {rec.desc && rec.desc !== rec.title && (
                                            <div style={styles.descBox}>
                                                <p style={styles.descText}>{rec.desc}</p>
                                            </div>
                                        )}

                                        {/* Why recommended */}
                                        <div style={{ ...styles.reasonBox, borderLeftColor: scoreColor }}>
                                            <p style={styles.reasonLabel}>💡 Why recommended</p>
                                            <p style={styles.reasonText}>{rec.reason}</p>
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div style={styles.recCardFooter}>
                                        <button
                                            onClick={() => { if (!rec.policyId) return; navigate(`/policy/${rec.policyId}`); }}
                                            disabled={!rec.policyId}
                                            style={rec.policyId ? { ...styles.btnPrimary, flex: 1 } : { ...styles.btnDisabled, flex: 1 }}
                                            className={rec.policyId ? "primary-btn" : ""}
                                        >
                                            📄 View Details
                                        </button>
                                        <button
                                            onClick={() => deleteRecommendation(rec.rawRecommendationId)}
                                            disabled={!rec.rawRecommendationId}
                                            style={rec.rawRecommendationId ? styles.btnDelete : { ...styles.btnDisabled, padding: '12px 18px' }}
                                            className={rec.rawRecommendationId ? "delete-btn" : ""}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>🤖</div>
                        <h2 style={styles.emptyTitle}>No Recommendations Yet</h2>
                        <p style={styles.emptySubText}>Complete your profile preferences to get AI-powered policy recommendations tailored just for you.</p>
                        <button onClick={() => navigate("/profile")} style={styles.btnGreen} className="primary-btn">
                            ✏️ Set Preferences
                        </button>
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
    blob1: { position: 'fixed', top: '-110px', right: '-80px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,0.12) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 },
    blob2: { position: 'fixed', bottom: '-120px', left: '-100px', width: '560px', height: '560px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.10) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 },
    blob3: { position: 'fixed', top: '42%', left: '48%', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(52,211,153,0.05) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0, transform: 'translate(-50%,-50%)' },
    container: { maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 },
    // Centered screens
    centeredScreen: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#0a0f1e,#0d1b2e)', gap: '16px', padding: '20px' },
    spinner: { width: '44px', height: '44px', border: '3px solid rgba(96,165,250,0.2)', borderTop: '3px solid #60a5fa', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    loadingText: { color: '#64748b', fontSize: '16px', fontWeight: '500', margin: 0 },
    errorCard: { background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '20px', padding: '44px 40px', maxWidth: '480px', textAlign: 'center', backdropFilter: 'blur(20px)' },
    errorTitle: { color: '#f1f5f9', fontSize: '22px', fontWeight: '800', margin: '0 0 12px 0' },
    errorMsg: { color: '#64748b', fontSize: '15px', margin: '0 0 28px 0', lineHeight: 1.6 },
    // Header
    header: { textAlign: 'center', marginBottom: '32px' },
    headerBadge: { display: 'inline-block', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa', fontSize: '13px', fontWeight: '600', letterSpacing: '0.08em', padding: '6px 14px', borderRadius: '20px', marginBottom: '14px' },
    headerTitle: { fontSize: 'clamp(26px,4vw,42px)', fontWeight: '800', background: 'linear-gradient(135deg,#f1f5f9 0%,#94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 10px 0', letterSpacing: '-1px' },
    headerSub: { color: '#64748b', fontSize: '16px', margin: 0 },
    // Action bar
    actionBar: { display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '32px', flexWrap: 'wrap' },
    // Rec list
    recList: { display: 'flex', flexDirection: 'column', gap: '20px' },
    // Rec card
    recCard: {
        background: 'rgba(15,23,42,0.80)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '20px', overflow: 'hidden', position: 'relative',
        backdropFilter: 'blur(20px)', boxShadow: '0 4px 36px rgba(0,0,0,0.35)',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease',
    },
    rankBadge: {
        position: 'absolute', top: '-10px', left: '24px',
        width: '44px', height: '44px', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: '800', fontSize: '16px', color: '#fff',
        zIndex: 2,
    },
    recCardHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '28px 24px 20px', borderBottom: '1px solid',
        flexWrap: 'wrap', gap: '16px',
    },
    recCardHeaderLeft: { display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 },
    recTypeIcon: { fontSize: '30px', flexShrink: 0 },
    recTitle: { color: '#f1f5f9', fontSize: '18px', fontWeight: '800', margin: '0 0 6px 0' },
    recTypeBadge: { display: 'inline-block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '20px', border: '1px solid' },
    // Score
    scoreBox: { textAlign: 'right', flexShrink: 0, minWidth: '100px' },
    scoreValue: { fontSize: '30px', fontWeight: '800', lineHeight: 1, letterSpacing: '-0.5px' },
    scoreLabel: { color: '#475569', fontSize: '11px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '4px 0 6px 0' },
    scoreBar: { height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden', width: '100px', marginLeft: 'auto' },
    scoreBarFill: { height: '100%', borderRadius: '99px', transition: 'width 0.5s ease' },
    // Card body
    recCardBody: { padding: '20px 24px' },
    metaGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: '14px', marginBottom: '18px' },
    metaItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
    metaLabel: { color: '#475569', fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase' },
    metaValue: { fontSize: '15px', fontWeight: '700' },
    descBox: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px 14px', marginBottom: '14px' },
    descText: { color: '#94a3b8', fontSize: '13px', lineHeight: 1.65, margin: 0 },
    reasonBox: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderLeft: '3px solid', borderRadius: '10px', padding: '14px 16px' },
    reasonLabel: { color: '#94a3b8', fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px 0' },
    reasonText: { color: '#cbd5e1', fontSize: '14px', lineHeight: 1.65, margin: 0 },
    // Card footer
    recCardFooter: { display: 'flex', gap: '10px', padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.15)' },
    // Buttons
    btnPrimary: { background: 'linear-gradient(135deg,#1d4ed8,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 20px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", boxShadow: '0 4px 16px rgba(79,70,229,0.4)', transition: 'transform 0.18s,box-shadow 0.18s' },
    btnGreen: { background: 'linear-gradient(135deg,#047857,#059669)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", boxShadow: '0 4px 16px rgba(5,150,105,0.4)', transition: 'transform 0.18s' },
    btnOutline: { background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 24px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.15s' },
    btnSecondary: { background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 24px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.15s' },
    btnDelete: { background: 'rgba(248,113,113,0.10)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '10px', padding: '12px 18px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.15s', flexShrink: 0 },
    btnDisabled: { background: 'rgba(255,255,255,0.04)', color: '#334155', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px 20px', fontWeight: '700', fontSize: '14px', cursor: 'not-allowed', fontFamily: "'DM Sans',sans-serif" },
    // Empty
    emptyState: { textAlign: 'center', padding: '64px 32px', background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' },
    emptyIcon: { fontSize: '56px' },
    emptyTitle: { color: '#f1f5f9', fontSize: '22px', fontWeight: '800', margin: 0 },
    emptySubText: { color: '#475569', fontSize: '15px', maxWidth: '420px', lineHeight: 1.6, margin: 0 },
};

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; }

.rec-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 56px rgba(0,0,0,0.5) !important;
    border-color: rgba(255,255,255,0.12) !important;
}

.primary-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
.outline-btn:hover { background: rgba(255,255,255,0.10) !important; color: #e2e8f0 !important; }
.secondary-btn:hover { background: rgba(255,255,255,0.10) !important; color: #e2e8f0 !important; }
.delete-btn:hover { background: rgba(248,113,113,0.2) !important; border-color: rgba(248,113,113,0.4) !important; }

@keyframes spin { to { transform: rotate(360deg); } }
`;
