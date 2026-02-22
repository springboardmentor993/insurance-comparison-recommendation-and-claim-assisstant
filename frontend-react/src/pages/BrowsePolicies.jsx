import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function BrowsePolicies() {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filters, setFilters] = useState({ policy_type: "", provider_id: "", min_premium: "", max_premium: "" });
    const [selectedPolicies, setSelectedPolicies] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const policyIcons = {
        auto: "🚗", health: "🏥", life: "❤️", home: "🏠", travel: "✈️"
    };

    const policyAccents = {
        auto: { color: "#38bdf8", bg: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.3)" },
        health: { color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)" },
        life: { color: "#f472b6", bg: "rgba(244,114,182,0.12)", border: "rgba(244,114,182,0.3)" },
        home: { color: "#fb923c", bg: "rgba(251,146,60,0.12)", border: "rgba(251,146,60,0.3)" },
        travel: { color: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)" },
    };

    useEffect(() => {
        fetchPolicies();
    }, [filters]);

    const fetchPolicies = async () => {
        try {
            setLoading(true);
            let url = "http://localhost:8000/policies";
            const params = new URLSearchParams();
            if (filters.policy_type) params.append("policy_type", filters.policy_type);
            if (filters.provider_id) params.append("provider_id", filters.provider_id);
            if (filters.min_premium) params.append("min_premium", filters.min_premium);
            if (filters.max_premium) params.append("max_premium", filters.max_premium);
            url += "?" + params.toString();
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch policies");
            const data = await res.json();
            const policiesList = data.policies || data || [];
            setPolicies(policiesList);
            setError("");
        } catch (err) {
            setError("Error loading policies: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCompare = () => {
        if (selectedPolicies.length < 2) {
            alert("Please select at least 2 policies to compare");
            return;
        }
        navigate(`/compare?ids=${selectedPolicies.join(",")}`);
    };

    const handleSelectPolicy = (id) => {
        setSelectedPolicies(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    return (
        <div style={styles.page}>
            <style>{globalStyles}</style>
            <div style={styles.blob1} /><div style={styles.blob2} /><div style={styles.blob3} />

            <div style={styles.container}>

                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerBadge}>🛡️ Insurance Marketplace</div>
                    <h1 style={styles.headerTitle}>Browse Policies</h1>
                    <p style={styles.headerSub}>Find the perfect coverage for your needs</p>
                </div>

                {/* Filters */}
                <div style={styles.filterCard}>
                    <div style={styles.filterCardHeader}>
                        <div style={styles.cardDot} />
                        <h2 style={styles.filterTitle}>Filter Policies</h2>
                    </div>
                    <div style={styles.filterGrid}>
                        <div style={styles.filterField}>
                            <label style={styles.filterLabel}>📋 Policy Type</label>
                            <select
                                value={filters.policy_type}
                                onChange={e => setFilters({ ...filters, policy_type: e.target.value })}
                                style={styles.select}
                            >
                                <option value="">All Types</option>
                                <option value="auto">🚗 Auto Insurance</option>
                                <option value="health">🏥 Health Insurance</option>
                                <option value="life">❤️ Life Insurance</option>
                                <option value="home">🏠 Home Insurance</option>
                                <option value="travel">✈️ Travel Insurance</option>
                            </select>
                        </div>
                        <div style={styles.filterField}>
                            <label style={styles.filterLabel}>💰 Min Premium</label>
                            <input
                                type="number" placeholder="Min ₹"
                                value={filters.min_premium}
                                onChange={e => setFilters({ ...filters, min_premium: e.target.value })}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.filterField}>
                            <label style={styles.filterLabel}>💰 Max Premium</label>
                            <input
                                type="number" placeholder="Max ₹"
                                value={filters.max_premium}
                                onChange={e => setFilters({ ...filters, max_premium: e.target.value })}
                                style={styles.input}
                            />
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div style={styles.errorBox}>
                        <span>⚠️</span>
                        <p style={{ margin: 0, color: '#fca5a5', fontSize: '14px' }}>{error}</p>
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div style={styles.loadingBox}>
                        <div style={styles.spinner}></div>
                        <p style={{ color: '#64748b', margin: 0, fontSize: '16px', fontWeight: '500' }}>Loading policies...</p>
                    </div>
                ) : (
                    <>
                        {/* Selection Bar */}
                        <div style={styles.selectionBar}>
                            <div style={styles.selectionInfo}>
                                <span style={styles.selectionDot} />
                                <p style={styles.selectionText}>
                                    Selected: <span style={styles.selectionCount}>{selectedPolicies.length}</span> policies
                                </p>
                            </div>
                            <button
                                onClick={handleCompare}
                                disabled={selectedPolicies.length < 2}
                                style={selectedPolicies.length >= 2 ? styles.compareBtn : styles.compareBtnDisabled}
                                className={selectedPolicies.length >= 2 ? "compare-btn" : ""}
                            >
                                📊 Compare Selected ({selectedPolicies.length})
                            </button>
                        </div>

                        {/* Policy Cards Grid */}
                        {policies.length > 0 ? (
                            <div style={styles.policiesGrid}>
                                {policies.map(policy => {
                                    const isSelected = selectedPolicies.includes(policy.id);
                                    const accent = policyAccents[policy.policy_type] || policyAccents.auto;

                                    return (
                                        <div
                                            key={policy.id}
                                            onClick={() => handleSelectPolicy(policy.id)}
                                            style={{
                                                ...styles.policyCard,
                                                borderColor: isSelected ? accent.color : 'rgba(255,255,255,0.07)',
                                                boxShadow: isSelected
                                                    ? `0 0 0 2px ${accent.color}55, 0 16px 48px rgba(0,0,0,0.45)`
                                                    : '0 4px 28px rgba(0,0,0,0.25)',
                                                transform: isSelected ? 'translateY(-6px) scale(1.01)' : 'none',
                                            }}
                                            className="policy-card"
                                        >
                                            {/* Selected badge */}
                                            {isSelected && (
                                                <div style={{ ...styles.selectedBadge, background: accent.color }}>
                                                    ✓ Selected
                                                </div>
                                            )}

                                            {/* Card Header */}
                                            <div style={{ ...styles.policyCardHeader, background: accent.bg, borderColor: accent.border }}>
                                                <span style={styles.policyTypeIcon}>{policyIcons[policy.policy_type] || "📋"}</span>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <h3 style={styles.policyTitle}>{policy.title}</h3>
                                                    <span style={{ ...styles.policyTypeBadge, color: accent.color, background: accent.bg, borderColor: accent.border }}>
                                                        {policy.policy_type}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Card Body */}
                                            <div style={styles.policyCardBody}>
                                                <div style={styles.metaRow}>
                                                    <span style={styles.metaLabel}>Provider</span>
                                                    <span style={styles.metaValue}>{policy.provider?.name || "—"}</span>
                                                </div>
                                                <div style={styles.metaRow}>
                                                    <span style={styles.metaLabel}>Term</span>
                                                    <span style={styles.metaValue}>{policy.term_months} months</span>
                                                </div>
                                                <div style={styles.metaRow}>
                                                    <span style={styles.metaLabel}>Deductible</span>
                                                    <span style={styles.metaValue}>${policy.deductible}</span>
                                                </div>

                                                {/* Premium */}
                                                <div style={{ ...styles.premiumRow, borderColor: 'rgba(255,255,255,0.07)' }}>
                                                    <span style={styles.premiumLabel}>Monthly Premium</span>
                                                    <span style={{ ...styles.premiumValue, color: accent.color }}>${policy.premium}</span>
                                                </div>

                                                {/* Coverage */}
                                                {policy.coverage && (
                                                    <div style={styles.coverageBox}>
                                                        <p style={styles.coverageTitle}>📋 Coverage</p>
                                                        <ul style={styles.coverageList}>
                                                            {Object.entries(policy.coverage).slice(0, 3).map(([key, value]) => (
                                                                <li key={key} style={styles.coverageItem}>
                                                                    <span style={styles.coverageKey}>{key.replace(/_/g, " ")}</span>
                                                                    <span style={styles.coverageVal}>
                                                                        {typeof value === "boolean" ? (value ? "✅" : "❌") : value}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Card Footer */}
                                            <div style={styles.policyCardFooter}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleSelectPolicy(policy.id); }}
                                                    style={isSelected
                                                        ? { ...styles.footerBtn, background: accent.bg, color: accent.color, borderColor: accent.border }
                                                        : { ...styles.footerBtn, background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', color: '#fff', borderColor: 'transparent' }
                                                    }
                                                    className="footer-btn"
                                                >
                                                    {isSelected ? "✅ Selected" : "☑️ Select"}
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/policy/${policy.id}`); }}
                                                    style={{ ...styles.footerBtn, background: 'linear-gradient(135deg,#047857,#059669)', color: '#fff', borderColor: 'transparent' }}
                                                    className="footer-btn"
                                                >
                                                    📄 Details
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={styles.emptyState}>
                                <div style={styles.emptyIcon}>😔</div>
                                <p style={styles.emptyTitle}>No policies found</p>
                                <p style={styles.emptySubText}>Try adjusting your filters to see more policies.</p>
                            </div>
                        )}
                    </>
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
    blob1: {
        position: 'fixed', top: '-110px', right: '-80px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
    },
    blob2: {
        position: 'fixed', bottom: '-120px', left: '-100px',
        width: '560px', height: '560px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
    },
    blob3: {
        position: 'fixed', top: '40%', left: '45%',
        width: '420px', height: '420px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0, transform: 'translate(-50%,-50%)',
    },
    container: {
        maxWidth: '1200px', margin: '0 auto',
        position: 'relative', zIndex: 1,
    },
    // Header
    header: { marginBottom: '40px' },
    headerBadge: {
        display: 'inline-block',
        background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
        color: '#60a5fa', fontSize: '13px', fontWeight: '600',
        letterSpacing: '0.08em', padding: '6px 14px',
        borderRadius: '20px', marginBottom: '14px',
    },
    headerTitle: {
        fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: '800',
        background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        margin: '0 0 10px 0', letterSpacing: '-1px', lineHeight: 1.1,
    },
    headerSub: { color: '#64748b', fontSize: '16px', margin: 0 },
    // Filter card
    filterCard: {
        background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '20px', padding: '28px 32px',
        backdropFilter: 'blur(20px)', boxShadow: '0 4px 40px rgba(0,0,0,0.3)',
        marginBottom: '20px',
    },
    filterCardHeader: {
        display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px',
    },
    cardDot: {
        width: '10px', height: '10px', borderRadius: '50%',
        background: '#60a5fa', boxShadow: '0 0 8px rgba(96,165,250,0.6)',
    },
    filterTitle: { color: '#f1f5f9', fontSize: '18px', fontWeight: '700', margin: 0 },
    filterGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '18px',
    },
    filterField: { display: 'flex', flexDirection: 'column', gap: '8px' },
    filterLabel: {
        color: '#94a3b8', fontSize: '12px', fontWeight: '700',
        letterSpacing: '0.08em', textTransform: 'uppercase',
    },
    select: {
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        color: '#e2e8f0', borderRadius: '10px', padding: '10px 14px',
        fontSize: '14px', fontWeight: '500', cursor: 'pointer',
        outline: 'none', width: '100%', boxSizing: 'border-box',
        fontFamily: "'DM Sans', sans-serif",
    },
    input: {
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        color: '#e2e8f0', borderRadius: '10px', padding: '10px 14px',
        fontSize: '14px', fontWeight: '500', outline: 'none',
        width: '100%', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif",
    },
    // Error
    errorBox: {
        display: 'flex', alignItems: 'center', gap: '12px',
        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: '12px', padding: '16px 20px', marginBottom: '20px',
        fontSize: '22px',
    },
    // Loading
    loadingBox: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '16px', padding: '60px 20px',
        background: 'rgba(15,23,42,0.5)', borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.06)',
    },
    spinner: {
        width: '40px', height: '40px',
        border: '3px solid rgba(96,165,250,0.2)',
        borderTop: '3px solid #60a5fa',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
    },
    // Selection bar
    selectionBar: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '14px',
        background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '14px', padding: '18px 24px',
        backdropFilter: 'blur(20px)', marginBottom: '24px',
    },
    selectionInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
    selectionDot: {
        width: '8px', height: '8px', borderRadius: '50%',
        background: '#34d399', boxShadow: '0 0 8px rgba(52,211,153,0.6)',
    },
    selectionText: {
        color: '#94a3b8', fontSize: '15px', fontWeight: '600', margin: 0,
    },
    selectionCount: {
        color: '#60a5fa', fontSize: '18px', fontWeight: '800',
    },
    compareBtn: {
        background: 'linear-gradient(135deg,#1d4ed8,#4f46e5)',
        color: '#fff', border: 'none', borderRadius: '10px',
        padding: '12px 24px', fontWeight: '700', fontSize: '14px',
        cursor: 'pointer', boxShadow: '0 4px 18px rgba(79,70,229,0.45)',
        fontFamily: "'DM Sans', sans-serif",
        transition: 'transform 0.18s, box-shadow 0.18s',
    },
    compareBtnDisabled: {
        background: 'rgba(255,255,255,0.05)', color: '#475569',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '10px', padding: '12px 24px',
        fontWeight: '700', fontSize: '14px', cursor: 'not-allowed',
        fontFamily: "'DM Sans', sans-serif",
    },
    // Policies grid
    policiesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
        gap: '20px',
    },
    policyCard: {
        background: 'rgba(15,23,42,0.80)',
        border: '1px solid',
        borderRadius: '18px', overflow: 'hidden',
        backdropFilter: 'blur(20px)',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
    },
    selectedBadge: {
        position: 'absolute', top: '14px', right: '14px',
        color: '#fff', fontSize: '11px', fontWeight: '800',
        padding: '4px 10px', borderRadius: '20px',
        letterSpacing: '0.06em',
    },
    policyCardHeader: {
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '20px 20px 16px',
        borderBottom: '1px solid',
    },
    policyTypeIcon: { fontSize: '30px', flexShrink: 0 },
    policyTitle: {
        color: '#f1f5f9', fontSize: '15px', fontWeight: '700',
        margin: '0 0 6px 0', lineHeight: 1.3,
    },
    policyTypeBadge: {
        display: 'inline-block', fontSize: '11px', fontWeight: '700',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        padding: '3px 10px', borderRadius: '20px',
        border: '1px solid',
    },
    policyCardBody: { padding: '18px 20px', flex: 1 },
    metaRow: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
    },
    metaLabel: { color: '#475569', fontSize: '12px', fontWeight: '600' },
    metaValue: { color: '#cbd5e1', fontSize: '13px', fontWeight: '600' },
    premiumRow: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 0 10px', borderTop: '1px solid', marginTop: '8px',
    },
    premiumLabel: { color: '#64748b', fontSize: '12px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase' },
    premiumValue: { fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' },
    coverageBox: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '10px', padding: '12px 14px',
        marginTop: '12px',
    },
    coverageTitle: { color: '#94a3b8', fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px 0' },
    coverageList: { margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' },
    coverageItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    coverageKey: { color: '#64748b', fontSize: '12px', textTransform: 'capitalize' },
    coverageVal: { color: '#cbd5e1', fontSize: '12px', fontWeight: '600' },
    policyCardFooter: {
        display: 'flex', gap: '10px', padding: '14px 20px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(0,0,0,0.15)',
    },
    footerBtn: {
        flex: 1, padding: '10px 8px', borderRadius: '8px',
        border: '1px solid', fontWeight: '700', fontSize: '13px',
        cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
        transition: 'transform 0.15s, filter 0.15s',
    },
    // Empty state
    emptyState: {
        textAlign: 'center', padding: '64px 32px',
        background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '20px', backdropFilter: 'blur(20px)',
    },
    emptyIcon: { fontSize: '48px', marginBottom: '14px' },
    emptyTitle: { color: '#94a3b8', fontSize: '20px', fontWeight: '700', margin: '0 0 8px 0' },
    emptySubText: { color: '#475569', fontSize: '14px', margin: 0 },
};

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; }

.policy-card:hover {
    transform: translateY(-6px) !important;
    box-shadow: 0 20px 56px rgba(0,0,0,0.5) !important;
    border-color: rgba(255,255,255,0.15) !important;
}

.compare-btn:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 8px 28px rgba(79,70,229,0.55) !important;
}

.footer-btn:hover {
    filter: brightness(1.12);
    transform: scale(1.03);
}

select option { background: #0d1b2e; color: #e2e8f0; }

input::placeholder { color: #475569; }
input:focus, select:focus {
    border-color: rgba(96,165,250,0.4) !important;
    box-shadow: 0 0 0 3px rgba(96,165,250,0.1);
}

@keyframes spin { to { transform: rotate(360deg); } }
`;
