import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const styles = {
    page: {
        minHeight: "100vh",
        background: "#f5f0e8",
        backgroundImage: `
            radial-gradient(circle at 10% 15%, rgba(232, 184, 109, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 90% 80%, rgba(26, 26, 46, 0.07) 0%, transparent 40%)
        `,
        padding: "48px clamp(14px, 3vw, 40px) 80px",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    },
    inner: {
        maxWidth: "1400px",
        margin: "0 auto",
    },
    headerWrap: {
        marginBottom: "36px",
        paddingTop: "10px",
    },
    eyebrow: {
        fontSize: "12px",
        fontWeight: "600",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#a09990",
        marginBottom: "10px",
        display: "block",
    },
    h1: {
        fontSize: "clamp(26px, 5vw, 40px)",
        fontFamily: "'Playfair Display', Georgia, serif",
        fontWeight: "700",
        color: "#1a1a2e",
        margin: "0 0 6px 0",
        letterSpacing: "-0.02em",
        lineHeight: 1.15,
    },
    accentBar: {
        width: "40px",
        height: "3px",
        background: "#e8b86d",
        borderRadius: "2px",
        margin: "12px 0 20px 0",
    },
    subtitle: {
        fontSize: "15px",
        color: "#6b6560",
        margin: "0 0 24px 0",
        fontWeight: "400",
    },
    policyPillsRow: {
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        alignItems: "center",
    },
    policyPill: {
        background: "white",
        border: "1.5px solid #e8e2d6",
        padding: "8px 18px",
        borderRadius: "40px",
        fontWeight: "600",
        fontSize: "13.5px",
        color: "#1a1a2e",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        boxShadow: "0 2px 8px rgba(26,26,46,0.06)",
    },
    pillIndex: {
        width: "22px",
        height: "22px",
        background: "#1a1a2e",
        color: "#e8b86d",
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        fontWeight: "700",
        flexShrink: 0,
    },
    backBtn: {
        background: "white",
        color: "#6b6560",
        border: "1.5px solid #e8e2d6",
        padding: "9px 20px",
        borderRadius: "40px",
        cursor: "pointer",
        fontWeight: "500",
        fontSize: "13px",
        fontFamily: "'DM Sans', sans-serif",
        marginBottom: "28px",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        transition: "all 0.2s ease",
        boxShadow: "0 2px 8px rgba(26,26,46,0.06)",
    },
    tableWrap: {
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(26,26,46,0.12)",
        border: "1px solid #e8e2d6",
        overflow: "auto",
        marginBottom: "24px",
    },
    table: {
        borderCollapse: "collapse",
        width: "100%",
        tableLayout: "auto",
    },
    theadTh0: {
        padding: "22px 24px",
        textAlign: "left",
        fontWeight: "700",
        minWidth: "190px",
        fontSize: "12px",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "#a09990",
        background: "#faf9f7",
        borderBottom: "2px solid #e8e2d6",
        borderRight: "2px solid #e8e2d6",
        fontFamily: "'DM Sans', sans-serif",
    },
    theadThPolicy: {
        padding: "22px 24px",
        textAlign: "center",
        minWidth: "210px",
        background: "#1a1a2e",
        borderBottom: "2px solid #1a1a2e",
        borderRight: "1px solid rgba(255,255,255,0.1)",
    },
    policyThTitle: {
        display: "block",
        marginBottom: "4px",
        fontSize: "15px",
        color: "#f5d9a0",
        fontWeight: "700",
        fontFamily: "'Playfair Display', Georgia, serif",
        letterSpacing: "0.01em",
    },
    policyThProvider: {
        color: "rgba(255,255,255,0.55)",
        fontSize: "12px",
        fontWeight: "400",
        letterSpacing: "0.03em",
    },
    featureCell: {
        padding: "18px 24px",
        fontWeight: "600",
        color: "#1a1a2e",
        fontSize: "13.5px",
        borderRight: "2px solid #f2efe8",
        background: "#faf9f7",
        letterSpacing: "0.01em",
    },
    valueCell: (alt) => ({
        padding: "18px 24px",
        textAlign: "center",
        borderRight: "1px solid #f2efe8",
        fontSize: "14px",
        color: "#1a1a2e",
        background: alt ? "#fdfcfa" : "white",
        transition: "background 0.15s",
    }),
    premiumFeatureCell: {
        padding: "18px 24px",
        fontWeight: "700",
        color: "#1a1a2e",
        fontSize: "13.5px",
        borderRight: "2px solid #f2efe8",
        background: "#fdf8ef",
        letterSpacing: "0.01em",
    },
    premiumValueCell: {
        padding: "18px 24px",
        textAlign: "center",
        borderRight: "1px solid #f2efe8",
        background: "#fdf8ef",
        fontWeight: "800",
        fontSize: "22px",
        color: "#c8892a",
        fontFamily: "'Playfair Display', Georgia, serif",
    },
    actionCard: {
        background: "white",
        padding: "36px",
        borderRadius: "20px",
        boxShadow: "0 8px 32px rgba(26,26,46,0.08)",
        border: "1px solid #e8e2d6",
        textAlign: "center",
    },
    actionH3: {
        color: "#1a1a2e",
        marginTop: 0,
        fontSize: "20px",
        fontFamily: "'Playfair Display', Georgia, serif",
        fontWeight: "600",
        marginBottom: "8px",
    },
    actionSubtitle: {
        color: "#6b6560",
        marginBottom: "24px",
        fontSize: "14px",
    },
    actionBtnsRow: {
        display: "flex",
        gap: "14px",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    actionBtn: {
        padding: "13px 28px",
        background: "#1a1a2e",
        color: "#f5d9a0",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "14px",
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: "0.01em",
        transition: "all 0.25s ease",
        boxShadow: "0 4px 14px rgba(26,26,46,0.2)",
    },

    // Loading / Error / Empty states
    statePage: {
        minHeight: "100vh",
        background: "#f5f0e8",
        backgroundImage: "radial-gradient(circle at 15% 20%, rgba(232, 184, 109, 0.12) 0%, transparent 40%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "'DM Sans', sans-serif",
    },
    stateCard: {
        backgroundColor: "white",
        padding: "44px 40px",
        borderRadius: "20px",
        maxWidth: "480px",
        width: "100%",
        textAlign: "center",
        boxShadow: "0 20px 60px rgba(26,26,46,0.12)",
        border: "1px solid #e8e2d6",
    },
    stateIconRing: {
        width: "64px",
        height: "64px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "28px",
        margin: "0 auto 20px",
    },
    stateH2: {
        fontFamily: "'Playfair Display', Georgia, serif",
        margin: "0 0 10px 0",
        fontSize: "22px",
        fontWeight: "600",
    },
    stateP: {
        color: "#6b6560",
        marginBottom: "28px",
        fontSize: "14px",
        lineHeight: 1.6,
    },
    stateBtn: {
        padding: "12px 26px",
        background: "#1a1a2e",
        color: "#f5d9a0",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "14px",
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: "0.01em",
        transition: "all 0.2s ease",
        boxShadow: "0 4px 14px rgba(26,26,46,0.18)",
    },
};

export default function ComparePolicies() {
    const [searchParams] = useSearchParams();
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const ids = searchParams.get("ids");
        if (ids) {
            fetchPolicies(ids);
        }
    }, [searchParams]);

    const fetchPolicies = async (ids) => {
        try {
            setLoading(true);
            const url = `http://localhost:8000/policies/compare?policy_ids=${ids}`;
            console.log("Fetching from:", url);
            const res = await fetch(url);
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`HTTP ${res.status}: ${errText}`);
            }
            const data = await res.json();
            console.log("Policies loaded:", data);
            setPolicies(data);
            setError("");
        } catch (err) {
            console.error("Error:", err);
            setError("Error loading policies: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={styles.statePage}>
            <div style={styles.stateCard}>
                <div style={{ ...styles.stateIconRing, background: "#f2efe8", fontSize: "32px" }}>⏳</div>
                <h2 style={{ ...styles.stateH2, color: "#1a1a2e" }}>Loading Policies</h2>
                <p style={styles.stateP}>Fetching your selected policies for comparison…</p>
            </div>
        </div>
    );

    if (error) return (
        <div style={styles.statePage}>
            <div style={styles.stateCard}>
                <div style={{ ...styles.stateIconRing, background: "#fdf2f1" }}>⚠️</div>
                <h2 style={{ ...styles.stateH2, color: "#b5362a" }}>Something went wrong</h2>
                <p style={styles.stateP}>{error}</p>
                <button onClick={() => navigate("/browse")} style={styles.stateBtn}>← Back to Browse</button>
            </div>
        </div>
    );

    if (policies.length === 0) return (
        <div style={styles.statePage}>
            <div style={styles.stateCard}>
                <div style={{ ...styles.stateIconRing, background: "#fdf8ef", fontSize: "32px" }}>📊</div>
                <h2 style={{ ...styles.stateH2, color: "#1a1a2e" }}>No Policies Selected</h2>
                <p style={styles.stateP}>Please select at least two policies from the browse page to compare.</p>
                <button onClick={() => navigate("/browse")} style={styles.stateBtn}>← Back to Browse</button>
            </div>
        </div>
    );

    // Get all unique coverage fields
    const allCoverageKeys = new Set();
    policies.forEach(p => {
        if (p.coverage) {
            Object.keys(p.coverage).forEach(key => allCoverageKeys.add(key));
        }
    });

    return (
        <div style={styles.page}>
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

            <div style={styles.inner}>
                {/* Header */}
                <div style={styles.headerWrap}>
                    <span style={styles.eyebrow}>Policy Comparison</span>
                    <h1 style={styles.h1}>Compare Policies</h1>
                    <div style={styles.accentBar} />
                    <p style={styles.subtitle}>Side-by-side comparison of {policies.length} selected policies</p>
                    <div style={styles.policyPillsRow}>
                        {policies.map((policy, idx) => (
                            <span key={policy.id} style={styles.policyPill}>
                                <span style={styles.pillIndex}>{idx + 1}</span>
                                {policy.title}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Back Button */}
                <button
                    onClick={() => navigate("/browse")}
                    style={styles.backBtn}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#e8b86d"; e.currentTarget.style.color = "#1a1a2e"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e2d6"; e.currentTarget.style.color = "#6b6560"; }}
                >
                    ← Back to Browse
                </button>

                {/* Comparison Table */}
                <div style={styles.tableWrap}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.theadTh0}>Feature</th>
                                {policies.map(policy => (
                                    <th key={policy.id} style={styles.theadThPolicy}>
                                        <strong style={styles.policyThTitle}>{policy.title}</strong>
                                        <small style={styles.policyThProvider}>{policy.provider.name}</small>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Premium Row */}
                            <tr style={{ borderBottom: "2px solid #f2efe8" }}>
                                <td style={styles.premiumFeatureCell}>💰 Monthly Premium</td>
                                {policies.map(policy => (
                                    <td key={policy.id} style={styles.premiumValueCell}>
                                        ${policy.premium}
                                    </td>
                                ))}
                            </tr>

                            {/* Term Row */}
                            <tr style={{ borderBottom: "1px solid #f2efe8" }}>
                                <td style={styles.featureCell}>📅 Term Length</td>
                                {policies.map(policy => (
                                    <td key={policy.id} style={styles.valueCell(false)}>
                                        {policy.term_months} months
                                    </td>
                                ))}
                            </tr>

                            {/* Deductible Row */}
                            <tr style={{ borderBottom: "1px solid #f2efe8" }}>
                                <td style={styles.featureCell}>💳 Deductible</td>
                                {policies.map(policy => (
                                    <td key={policy.id} style={styles.valueCell(true)}>
                                        ${policy.deductible}
                                    </td>
                                ))}
                            </tr>

                            {/* Coverage Details */}
                            {Array.from(allCoverageKeys).map((key, idx) => (
                                <tr key={key} style={{ borderBottom: "1px solid #f2efe8" }}>
                                    <td style={styles.featureCell}>
                                        📋 {key.replace(/_/g, " ")}
                                    </td>
                                    {policies.map(policy => (
                                        <td key={policy.id} style={styles.valueCell(idx % 2 === 0)}>
                                            {policy.coverage && policy.coverage[key] !== undefined ? (
                                                <>
                                                    {typeof policy.coverage[key] === "boolean" ? (
                                                        <span style={{
                                                            fontSize: "18px",
                                                            fontWeight: "bold"
                                                        }}>
                                                            {policy.coverage[key] ? "✅" : "❌"}
                                                        </span>
                                                    ) : (
                                                        <span style={{
                                                            fontWeight: "600",
                                                            color: "#c8892a",
                                                            fontSize: "14px"
                                                        }}>
                                                            {policy.coverage[key]}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span style={{ color: "#ccc", fontSize: "18px" }}>—</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Action Section */}
                <div style={styles.actionCard}>
                    <h3 style={styles.actionH3}>🎯 Ready to Choose?</h3>
                    <p style={styles.actionSubtitle}>
                        Select a policy below to purchase or get more details.
                    </p>
                    <div style={styles.actionBtnsRow}>
                        {policies.map(policy => (
                            <button
                                key={policy.id}
                                onClick={() => navigate(`/policy/${policy.id}`)}
                                style={styles.actionBtn}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,26,46,0.28)";
                                    e.currentTarget.style.background = "#0f0f1e";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 4px 14px rgba(26,26,46,0.2)";
                                    e.currentTarget.style.background = "#1a1a2e";
                                }}
                            >
                                💼 View Details — {policy.title}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
