import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../services/api"

export default function Profile() {
    const navigate = useNavigate()
    const token = localStorage.getItem("token")

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!token) {
            navigate("/login")
            return
        }

        async function loadProfile() {
            try {
                const res = await api.get("/user/me", {
                    params: { token },
                    headers: { Authorization: `Bearer ${token}` },
                })
                setUser(res.data)
            } catch (err) {
                console.error("Profile error:", err)
                if (err?.response?.status === 401) {
                    localStorage.removeItem("token")
                    localStorage.removeItem("user_id")
                    localStorage.removeItem("userId")
                    navigate("/login")
                }
            } finally {
                setLoading(false)
            }
        }
        loadProfile()
    }, [navigate, token])

    if (loading) return (
        <div style={styles.loadingScreen}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading profile...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )

    if (!user) return (
        <div style={styles.loadingScreen}>
            <div style={styles.errorIcon}>⚠️</div>
            <p style={styles.loadingText}>Failed to load profile</p>
        </div>
    )

    const rp = user.risk_profile || {}

    const getRiskColor = (level) => {
        if (!level) return "#94a3b8"
        const l = level.toLowerCase()
        if (l === "low") return "#34d399"
        if (l === "medium") return "#fb923c"
        if (l === "high") return "#f87171"
        return "#94a3b8"
    }

    return (
        <div style={styles.page}>
            <style>{globalStyles}</style>
            <div style={styles.blob1} />
            <div style={styles.blob2} />

            <div style={styles.container}>

                {/* Profile Header Card */}
                <div style={styles.profileHeader}>
                    <div style={styles.avatarRing}>
                        <div style={styles.avatar}>👤</div>
                    </div>
                    <div>
                        <div style={styles.profileBadge}>My Profile</div>
                        <h1 style={styles.profileName}>{user.name || "User"}</h1>
                        <p style={styles.profileEmail}>{user.email || ""}</p>
                    </div>
                </div>

                {/* Info Grid */}
                <div style={styles.infoGrid}>

                    {/* Personal Info */}
                    <div style={styles.infoCard}>
                        <div style={styles.infoCardHeader}>
                            <span style={styles.infoCardIcon}>🧍</span>
                            <h3 style={styles.infoCardTitle}>Personal Info</h3>
                        </div>
                        <div style={styles.infoRows}>
                            <InfoRow label="Age" value={rp.age} />
                            <InfoRow label="Income" value={rp.income ? `₹${rp.income}` : "—"} />
                            <InfoRow label="Marital Status" value={rp.marital_status} />
                            <InfoRow label="Has Kids" value={rp.has_kids ? "Yes" : "No"} />
                        </div>
                    </div>

                    {/* Health Info */}
                    <div style={styles.infoCard}>
                        <div style={styles.infoCardHeader}>
                            <span style={styles.infoCardIcon}>❤️</span>
                            <h3 style={styles.infoCardTitle}>Health Info</h3>
                        </div>
                        <div style={styles.infoRows}>
                            <InfoRow label="Height" value={rp.height ? `${rp.height} cm` : "—"} />
                            <InfoRow label="Weight" value={rp.weight ? `${rp.weight} kg` : "—"} />
                            <InfoRow label="BMI" value={rp.bmi} />
                            <InfoRow label="Diseases" value={rp.diseases?.join(", ") || "None"} />
                        </div>
                    </div>

                    {/* Risk & Policy */}
                    <div style={{ ...styles.infoCard, gridColumn: 'span 2' }}>
                        <div style={styles.infoCardHeader}>
                            <span style={styles.infoCardIcon}>🛡️</span>
                            <h3 style={styles.infoCardTitle}>Risk & Policy Preferences</h3>
                        </div>
                        <div style={styles.infoRowsHoriz}>
                            <div style={styles.riskChip}>
                                <span style={styles.riskChipLabel}>Risk Level</span>
                                <span style={{ ...styles.riskChipValue, color: getRiskColor(rp.risk_level), borderColor: getRiskColor(rp.risk_level) + "44", background: getRiskColor(rp.risk_level) + "15" }}>
                                    {rp.risk_level || "—"}
                                </span>
                            </div>
                            <div style={styles.riskChip}>
                                <span style={styles.riskChipLabel}>Max Premium</span>
                                <span style={{ ...styles.riskChipValue, color: "#38bdf8", borderColor: "rgba(56,189,248,0.3)", background: "rgba(56,189,248,0.1)" }}>
                                    {rp.max_premium ? `₹${rp.max_premium}` : "—"}
                                </span>
                            </div>
                            <div style={{ ...styles.riskChip, flex: 2 }}>
                                <span style={styles.riskChipLabel}>Preferred Policy Types</span>
                                <div style={styles.policyTags}>
                                    {rp.preferred_policy_types?.length
                                        ? rp.preferred_policy_types.map((p, i) => (
                                            <span key={i} style={styles.policyTag}>{p}</span>
                                        ))
                                        : <span style={styles.notSet}>Not set</span>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Action Buttons */}
                <div style={styles.actionsGrid}>
                    {[
                        { label: "View Recommendations", icon: "⭐", to: "/recommendations", bg: "linear-gradient(135deg,#1d4ed8,#4f46e5)", shadow: "rgba(79,70,229,0.45)" },
                        { label: "Update Preferences", icon: "✏️", to: "/preferences", bg: "linear-gradient(135deg,#5b21b6,#7c3aed)", shadow: "rgba(124,58,237,0.45)" },
                        { label: "Insurance Claims", icon: "📋", to: "/claims", bg: "linear-gradient(135deg,#6d28d9,#a21caf)", shadow: "rgba(162,28,175,0.40)" },
                    ].map((btn, i) => (
                        <button key={i} style={{ ...styles.actionBtn, background: btn.bg, boxShadow: `0 6px 24px ${btn.shadow}` }}
                            className="action-btn"
                            onClick={() => navigate(btn.to)}>
                            <span style={styles.actionIcon}>{btn.icon}</span>
                            <span style={styles.actionLabel}>{btn.label}</span>
                            <span style={styles.actionArrow}>→</span>
                        </button>
                    ))}
                </div>

            </div>
        </div>
    )
}

function InfoRow({ label, value }) {
    return (
        <div style={infoRowStyle}>
            <span style={infoLabelStyle}>{label}</span>
            <span style={infoValueStyle}>{value ?? "—"}</span>
        </div>
    )
}

const infoRowStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
}
const infoLabelStyle = {
    color: '#64748b', fontSize: '13px', fontWeight: '600', letterSpacing: '0.04em',
}
const infoValueStyle = {
    color: '#e2e8f0', fontSize: '14px', fontWeight: '600', textAlign: 'right',
    maxWidth: '60%',
}

const styles = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b2e 40%, #0a1628 70%, #06111f 100%)',
        display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
        padding: '48px 20px',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        position: 'relative', overflow: 'hidden',
    },
    blob1: {
        position: 'fixed', top: '-100px', right: '-80px',
        width: '480px', height: '480px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
    },
    blob2: {
        position: 'fixed', bottom: '-100px', left: '-100px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
    },
    container: {
        width: '100%', maxWidth: '820px',
        position: 'relative', zIndex: 1,
    },
    // Profile header
    profileHeader: {
        display: 'flex', alignItems: 'center', gap: '24px',
        background: 'rgba(15,23,42,0.72)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '20px', padding: '28px 32px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 40px rgba(0,0,0,0.3)',
        marginBottom: '20px',
    },
    avatarRing: {
        width: '72px', height: '72px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, boxShadow: '0 0 24px rgba(124,58,237,0.4)',
    },
    avatar: { fontSize: '34px' },
    profileBadge: {
        display: 'inline-block',
        background: 'rgba(59,130,246,0.15)',
        border: '1px solid rgba(59,130,246,0.3)',
        color: '#60a5fa', fontSize: '12px', fontWeight: '600',
        letterSpacing: '0.08em', padding: '4px 12px',
        borderRadius: '20px', marginBottom: '8px',
    },
    profileName: {
        fontSize: '26px', fontWeight: '800',
        background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        margin: '0 0 4px 0', letterSpacing: '-0.5px',
    },
    profileEmail: { color: '#64748b', fontSize: '14px', margin: 0 },
    // Info grid
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '20px',
    },
    infoCard: {
        background: 'rgba(15,23,42,0.72)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '18px', padding: '24px 26px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 28px rgba(0,0,0,0.25)',
    },
    infoCardHeader: {
        display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px',
        paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.07)',
    },
    infoCardIcon: { fontSize: '20px' },
    infoCardTitle: {
        color: '#f1f5f9', fontSize: '15px', fontWeight: '700', margin: 0,
    },
    infoRows: {},
    infoRowsHoriz: {
        display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start',
    },
    // Risk chips
    riskChip: {
        display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '120px',
    },
    riskChipLabel: {
        color: '#64748b', fontSize: '11px', fontWeight: '700',
        letterSpacing: '0.1em', textTransform: 'uppercase',
    },
    riskChipValue: {
        display: 'inline-block', padding: '6px 14px', borderRadius: '8px',
        border: '1px solid', fontSize: '14px', fontWeight: '700',
        width: 'fit-content', textTransform: 'capitalize',
    },
    policyTags: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    policyTag: {
        background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.28)',
        color: '#a78bfa', fontSize: '12px', fontWeight: '600',
        padding: '4px 12px', borderRadius: '20px',
    },
    notSet: { color: '#475569', fontSize: '13px', fontStyle: 'italic' },
    // Actions
    actionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px',
    },
    actionBtn: {
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '16px 20px', borderRadius: '12px',
        border: 'none', fontWeight: '700', fontSize: '15px', color: '#fff',
        cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
    },
    actionIcon: { fontSize: '18px' },
    actionLabel: { flex: 1, textAlign: 'left' },
    actionArrow: { fontSize: '16px', opacity: 0.7 },
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
    errorIcon: { fontSize: '40px' },
    loadingText: { color: '#64748b', fontSize: '16px', fontWeight: '500', margin: 0 },
}

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; }

.action-btn:hover {
    transform: translateY(-3px) scale(1.02);
    filter: brightness(1.12);
}

@media (max-width: 640px) {
    .info-grid { grid-template-columns: 1fr !important; }
}
`
