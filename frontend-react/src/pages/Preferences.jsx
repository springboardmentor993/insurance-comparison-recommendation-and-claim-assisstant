import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../services/api"

export default function Preferences() {
    const navigate = useNavigate()

    const [form, setForm] = useState({
        age: "", marital_status: "", has_kids: "no",
        income: "", height: "", weight: "", diseases: []
    })

    useEffect(() => {
        async function loadExistingPreferences() {
            const token = localStorage.getItem("token")
            if (!token) { navigate("/login"); return }
            try {
                const res = await api.get("/user/me", {
                    params: { token },
                    headers: { Authorization: `Bearer ${token}` },
                })
                const rp = res.data.risk_profile
                if (!rp) return
                setForm({
                    age: rp.age || "", income: rp.income || "",
                    marital_status: rp.marital_status || "",
                    has_kids: rp.has_kids ? "yes" : "no",
                    height: rp.height || "", weight: rp.weight || "",
                    diseases: rp.diseases || []
                })
                setPreferredTypes(rp.preferred_policy_types || [])
                setMaxPremium(rp.max_premium || "")
            } catch (err) {
                console.error("Failed to load preferences", err)
                if (err?.response?.status === 401) {
                    localStorage.removeItem("token")
                    localStorage.removeItem("user_id")
                    localStorage.removeItem("userId")
                    navigate("/login")
                }
            }
        }
        loadExistingPreferences()
    }, [navigate])

    const calculateBMI = () => {
        if (!form.height || !form.weight) return null
        const h = Number(form.height) / 100
        const w = Number(form.weight)
        return (w / (h * h)).toFixed(1)
    }

    const bmi = calculateBMI()

    const calculateRiskLevel = () => {
        let score = 0
        if (form.diseases.length >= 4) score += 3
        else if (form.diseases.length >= 2) score += 2
        else score += 1
        if (bmi >= 30) score += 2
        else if (bmi >= 25) score += 1
        if (score >= 5) return "High"
        if (score >= 3) return "Medium"
        return "Low"
    }

    const [preferredTypes, setPreferredTypes] = useState([])
    const [maxPremium, setMaxPremium] = useState("")

    const handleSave = async () => {
        const token = localStorage.getItem("token")
        if (!token) { navigate("/login"); return }

        const payload = {
            age: Number(form.age), income: Number(form.income),
            marital_status: form.marital_status,
            has_kids: form.has_kids === "yes",
            height: Number(form.height), weight: Number(form.weight),
            bmi: Number(bmi), diseases: form.diseases,
            preferred_policy_types: preferredTypes,
            max_premium: Number(maxPremium),
            risk_level: calculateRiskLevel()
        }

        try {
            const res = await fetch(`http://localhost:8000/user/preferences?token=${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            })
            if (res.status === 401) {
                localStorage.removeItem("token")
                localStorage.removeItem("user_id")
                localStorage.removeItem("userId")
                navigate("/login"); return
            }
            if (!res.ok) { const errText = await res.text(); throw new Error(`HTTP ${res.status}: ${errText}`) }
            localStorage.setItem("hasPreferences", "true")
            alert("Preferences saved successfully ✅")
            setTimeout(() => navigate("/recommendations"), 500)
        } catch (err) {
            console.error("Save preferences failed", err)
            alert("Failed to save preferences ❌")
        }
    }

    const riskLevel = calculateRiskLevel()
    const riskColor = riskLevel === "High" ? "#f87171" : riskLevel === "Medium" ? "#fb923c" : "#34d399"

    const bmiCategory = () => {
        if (!bmi) return null
        if (bmi < 18.5) return { label: "Underweight", color: "#38bdf8" }
        if (bmi < 25) return { label: "Normal", color: "#34d399" }
        if (bmi < 30) return { label: "Overweight", color: "#fb923c" }
        return { label: "Obese", color: "#f87171" }
    }
    const bmiInfo = bmiCategory()

    const policyTypeIcons = { health: "🏥", life: "❤️", auto: "🚗", home: "🏠", travel: "✈️" }
    const diseaseList = ["Diabetes", "BP", "Asthma", "Heart", "Thyroid"]

    return (
        <div style={styles.page}>
            <style>{globalStyles}</style>
            <div style={styles.blob1} /><div style={styles.blob2} />

            <div style={styles.container}>

                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerBadge}>⚙️ Personalization</div>
                    <h1 style={styles.headerTitle}>User Preferences</h1>
                    <p style={styles.headerSub}>Set your profile to get AI-powered insurance recommendations tailored for you</p>
                </div>

                <div style={styles.formWrap}>

                    {/* BASIC DETAILS */}
                    <div style={styles.card}>
                        <div style={styles.sectionHeader}>
                            <span style={styles.sectionIcon}>🧍</span>
                            <h3 style={styles.sectionTitle}>Basic Details</h3>
                        </div>

                        <div style={styles.inputGrid}>
                            <div style={styles.fieldWrap}>
                                <label style={styles.label}>Age</label>
                                <input type="number" placeholder="e.g. 28" value={form.age}
                                    onChange={e => setForm({ ...form, age: e.target.value })}
                                    style={styles.input} className="field-input" />
                            </div>
                            <div style={styles.fieldWrap}>
                                <label style={styles.label}>Annual Income (₹)</label>
                                <input type="number" placeholder="e.g. 600000" value={form.income}
                                    onChange={e => setForm({ ...form, income: e.target.value })}
                                    style={styles.input} className="field-input" />
                            </div>
                            <div style={styles.fieldWrap}>
                                <label style={styles.label}>Marital Status</label>
                                <select value={form.marital_status}
                                    onChange={e => setForm({ ...form, marital_status: e.target.value })}
                                    style={styles.input} className="field-input">
                                    <option value="">Select status</option>
                                    <option value="single">Single</option>
                                    <option value="married">Married</option>
                                </select>
                            </div>
                            <div style={styles.fieldWrap}>
                                <label style={styles.label}>Children</label>
                                <select value={form.has_kids}
                                    onChange={e => setForm({ ...form, has_kids: e.target.value })}
                                    style={styles.input} className="field-input">
                                    <option value="no">No Kids</option>
                                    <option value="yes">Has Kids</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* HEALTH DETAILS */}
                    <div style={styles.card}>
                        <div style={styles.sectionHeader}>
                            <span style={styles.sectionIcon}>❤️</span>
                            <h3 style={styles.sectionTitle}>Health Details</h3>
                        </div>

                        <div style={styles.inputGrid}>
                            <div style={styles.fieldWrap}>
                                <label style={styles.label}>Height (cm)</label>
                                <input type="number" placeholder="e.g. 170" value={form.height}
                                    onChange={e => setForm({ ...form, height: e.target.value })}
                                    style={styles.input} className="field-input" />
                            </div>
                            <div style={styles.fieldWrap}>
                                <label style={styles.label}>Weight (kg)</label>
                                <input type="number" placeholder="e.g. 70" value={form.weight}
                                    onChange={e => setForm({ ...form, weight: e.target.value })}
                                    style={styles.input} className="field-input" />
                            </div>
                        </div>

                        {/* BMI Display */}
                        {bmi && bmiInfo && (
                            <div style={{ ...styles.bmiBox, borderColor: `${bmiInfo.color}40`, background: `${bmiInfo.color}0d` }}>
                                <div style={styles.bmiLeft}>
                                    <span style={styles.bmiLabel}>BMI</span>
                                    <span style={{ ...styles.bmiValue, color: bmiInfo.color }}>{bmi}</span>
                                </div>
                                <div style={styles.bmiRight}>
                                    <span style={{ ...styles.bmiCategory, color: bmiInfo.color, background: `${bmiInfo.color}18`, borderColor: `${bmiInfo.color}40` }}>
                                        {bmiInfo.label}
                                    </span>
                                    <div style={styles.bmiBar}>
                                        <div style={{ ...styles.bmiBarFill, width: `${Math.min(100, (bmi / 40) * 100)}%`, background: bmiInfo.color }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Diseases */}
                        <div style={styles.fieldWrap}>
                            <label style={styles.label}>Pre-existing Conditions</label>
                            <div style={styles.checkGrid}>
                                {diseaseList.map(d => {
                                    const checked = form.diseases.includes(d)
                                    return (
                                        <label key={d} style={{ ...styles.checkPill, borderColor: checked ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.08)', background: checked ? 'rgba(248,113,113,0.12)' : 'rgba(255,255,255,0.03)', color: checked ? '#fca5a5' : '#94a3b8' }} className="check-pill">
                                            <input type="checkbox" checked={checked}
                                                onChange={e => setForm({ ...form, diseases: e.target.checked ? [...form.diseases, d] : form.diseases.filter(x => x !== d) })}
                                                style={{ display: 'none' }} />
                                            <span style={{ fontSize: '14px' }}>{checked ? '✅' : '⬜'}</span>
                                            {d}
                                        </label>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Risk Level */}
                        <div style={{ ...styles.riskBox, borderColor: `${riskColor}40`, background: `${riskColor}0d` }}>
                            <span style={styles.riskLabel}>Calculated Risk Level</span>
                            <span style={{ ...styles.riskBadge, color: riskColor, background: `${riskColor}18`, borderColor: `${riskColor}40` }}>
                                {riskLevel}
                            </span>
                        </div>
                    </div>

                    {/* POLICY PREFERENCES */}
                    <div style={styles.card}>
                        <div style={styles.sectionHeader}>
                            <span style={styles.sectionIcon}>🛡️</span>
                            <h3 style={styles.sectionTitle}>Policy Preferences</h3>
                        </div>

                        <div style={styles.fieldWrap}>
                            <label style={styles.label}>Preferred Policy Types</label>
                            <div style={styles.policyPills}>
                                {["health", "life", "auto", "home", "travel"].map(type => {
                                    const active = preferredTypes.includes(type)
                                    return (
                                        <label key={type} style={{ ...styles.policyPill, borderColor: active ? 'rgba(96,165,250,0.5)' : 'rgba(255,255,255,0.08)', background: active ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.03)', color: active ? '#60a5fa' : '#64748b' }} className="policy-pill">
                                            <input type="checkbox" checked={active}
                                                onChange={e => setPreferredTypes(e.target.checked ? [...preferredTypes, type] : preferredTypes.filter(t => t !== type))}
                                                style={{ display: 'none' }} />
                                            <span>{policyTypeIcons[type]}</span>
                                            <span style={{ fontWeight: '700', fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{type}</span>
                                            {active && <span style={{ fontSize: '10px' }}>✓</span>}
                                        </label>
                                    )
                                })}
                            </div>
                        </div>

                        <div style={styles.fieldWrap}>
                            <label style={styles.label}>Maximum Monthly Premium (₹)</label>
                            <div style={styles.premiumInputWrap}>
                                <span style={styles.premiumPrefix}>₹</span>
                                <input type="number" placeholder="e.g. 15000" value={maxPremium}
                                    onChange={e => setMaxPremium(e.target.value)}
                                    style={{ ...styles.input, paddingLeft: '36px', borderColor: 'rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.06)' }}
                                    className="field-input" />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button onClick={handleSave} style={styles.saveBtn} className="save-btn">
                        💾 Save Preferences & Get Recommendations →
                    </button>

                </div>
            </div>
        </div>
    )
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
    container: { maxWidth: '760px', margin: '0 auto', position: 'relative', zIndex: 1 },
    // Header
    header: { textAlign: 'center', marginBottom: '36px' },
    headerBadge: { display: 'inline-block', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa', fontSize: '13px', fontWeight: '600', letterSpacing: '0.08em', padding: '6px 14px', borderRadius: '20px', marginBottom: '14px' },
    headerTitle: { fontSize: 'clamp(26px,4vw,40px)', fontWeight: '800', background: 'linear-gradient(135deg,#f1f5f9 0%,#94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 10px 0', letterSpacing: '-1px' },
    headerSub: { color: '#64748b', fontSize: '15px', margin: 0 },
    // Form
    formWrap: { display: 'flex', flexDirection: 'column', gap: '20px' },
    card: { background: 'rgba(15,23,42,0.75)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '28px 30px', backdropFilter: 'blur(20px)', boxShadow: '0 4px 36px rgba(0,0,0,0.3)' },
    sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
    sectionIcon: { fontSize: '20px' },
    sectionTitle: { color: '#f1f5f9', fontSize: '17px', fontWeight: '700', margin: 0 },
    inputGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px', marginBottom: '16px' },
    fieldWrap: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '4px' },
    label: { color: '#94a3b8', fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase' },
    input: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', fontWeight: '500', outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans',sans-serif" },
    // BMI
    bmiBox: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', border: '1px solid', borderRadius: '12px', padding: '16px 18px', marginBottom: '18px', flexWrap: 'wrap' },
    bmiLeft: { display: 'flex', flexDirection: 'column', gap: '2px' },
    bmiLabel: { color: '#64748b', fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase' },
    bmiValue: { fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px', lineHeight: 1 },
    bmiRight: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, maxWidth: '200px' },
    bmiCategory: { display: 'inline-block', fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', border: '1px solid', letterSpacing: '0.04em', width: 'fit-content' },
    bmiBar: { height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' },
    bmiBarFill: { height: '100%', borderRadius: '99px', transition: 'width 0.4s ease' },
    // Diseases
    checkGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
    checkPill: { display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 14px', borderRadius: '10px', border: '1px solid', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.15s', userSelect: 'none' },
    // Risk
    riskBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid', borderRadius: '12px', padding: '14px 18px', marginTop: '16px' },
    riskLabel: { color: '#64748b', fontSize: '13px', fontWeight: '600' },
    riskBadge: { fontSize: '13px', fontWeight: '800', padding: '5px 16px', borderRadius: '20px', border: '1px solid', letterSpacing: '0.06em' },
    // Policy pills
    policyPills: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
    policyPill: { display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 16px', borderRadius: '12px', border: '1px solid', cursor: 'pointer', transition: 'all 0.15s', userSelect: 'none' },
    // Max premium
    premiumInputWrap: { position: 'relative' },
    premiumPrefix: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#fbbf24', fontWeight: '700', fontSize: '15px', pointerEvents: 'none', zIndex: 1 },
    // Save button
    saveBtn: { width: '100%', padding: '16px', background: 'linear-gradient(135deg,#1d4ed8,#4f46e5)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", boxShadow: '0 6px 24px rgba(79,70,229,0.45)', transition: 'transform 0.18s,box-shadow 0.18s', letterSpacing: '0.02em' },
}

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; }

.field-input:focus { border-color: rgba(96,165,250,0.45) !important; box-shadow: 0 0 0 3px rgba(96,165,250,0.08); }
.field-input::placeholder { color: #334155; }
select.field-input option { background: #0d1b2e; color: #e2e8f0; }

.check-pill:hover { opacity: 0.85; }
.policy-pill:hover { opacity: 0.85; }

.save-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 32px rgba(79,70,229,0.55) !important; }

@keyframes spin { to { transform: rotate(360deg); } }
`
