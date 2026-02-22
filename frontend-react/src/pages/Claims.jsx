import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DOCUMENT_REQUIREMENTS = {
    "health": { name: "Health Claim", icon: "🏥", documents: ["medical_report", "hospital_bills", "discharge_summary"] },
    "accident": { name: "Accident / Auto Claim", icon: "🚗", documents: ["accident_report", "police_fir", "repair_estimate"] },
    "life": { name: "Life Claim", icon: "❤️", documents: ["death_certificate", "nominee_id"] },
    "travel": { name: "Travel Claim", icon: "✈️", documents: ["travel_tickets", "delay_proof"] },
    "home": { name: "Home/Property Claim", icon: "🏠", documents: ["accident_report", "police_report", "photos", "repair_estimate"] }
};

const DOC_TYPE_LABELS = {
    "medical_report": "Medical Report", "hospital_bills": "Hospital Bills",
    "discharge_summary": "Discharge Summary", "accident_report": "Accident Report",
    "police_fir": "Police FIR", "police_report": "Police Report",
    "repair_estimate": "Repair Estimate", "death_certificate": "Death Certificate",
    "nominee_id": "Nominee ID Proof", "travel_tickets": "Travel Tickets",
    "delay_proof": "Delay/Cancellation Proof", "photos": "Photographs", "other": "Other Document"
};

const STATUS_STYLES = {
    draft: { color: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.3)", badge: "📝" },
    submitted: { color: "#38bdf8", bg: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.3)", badge: "📤" },
    approved: { color: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)", badge: "✅" },
    rejected: { color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)", badge: "❌" },
    under_review: { color: "#fb923c", bg: "rgba(251,146,60,0.12)", border: "rgba(251,146,60,0.3)", badge: "🔍" },
    paid: { color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.3)", badge: "💰" },
};

function ClaimsPage() {
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("list");
    const [userPolicies, setUserPolicies] = useState([]);
    const [claimsList, setClaimsList] = useState([]);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [formData, setFormData] = useState({ userPolicyId: "", claimType: "", incidentDate: "", amountClaimed: "", description: "" });
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [currentClaimId, setCurrentClaimId] = useState(null);
    const [wizardStep, setWizardStep] = useState(1);

    useEffect(() => {
        if (!token) { navigate("/login"); return; }
        fetchUserPolicies();
        if (activeTab === "list") fetchClaims();
    }, [activeTab, token, navigate]);

    const fetchUserPolicies = async () => {
        try {
            const response = await fetch(`http://localhost:8000/user-policies?token=${token}`);
            if (!response.ok) throw new Error("Failed to fetch policies");
            const data = await response.json();
            setUserPolicies(data);
        } catch (err) { setError("Failed to load your policies"); }
    };

    const fetchClaims = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/claims?token=${token}`);
            if (!response.ok) throw new Error("Failed to fetch claims");
            const data = await response.json();
            setClaimsList(data.claims || []);
        } catch (err) { setError("Failed to load claims"); }
        finally { setLoading(false); }
    };

    const fetchClaimDetail = async (claimId) => {
        try {
            setLoadingDetail(true);
            const response = await fetch(`http://localhost:8000/claims/${claimId}?token=${token}`);
            if (!response.ok) throw new Error("Failed to fetch claim details");
            const data = await response.json();
            setSelectedClaim(data);
        } catch (err) { setError("Failed to load claim details"); }
        finally { setLoadingDetail(false); }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === "amountClaimed" ? (value ? parseFloat(value) : "") : value }));
        setError("");
    };

    const handleFileInputChange = (e, docType) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const validTypes = ["application/pdf", "image/jpeg", "image/png"];
        if (!validTypes.includes(file.type)) { setError("Only PDF, JPG, and PNG files are allowed"); return; }
        if (file.size > 5 * 1024 * 1024) { setError("File size must be less than 5MB"); return; }
        setUploadedFiles(prev => [...prev.filter(f => f.docType !== docType), { docType, fileName: file.name, file }]);
        setError("");
    };

    const handleRemoveFile = (docType) => setUploadedFiles(prev => prev.filter(f => f.docType !== docType));

    const isStep1Valid = () => formData.userPolicyId && formData.claimType && formData.incidentDate && formData.amountClaimed;
    const isStep2Valid = () => {
        const requiredDocs = DOCUMENT_REQUIREMENTS[formData.claimType]?.documents || [];
        const uploadedDocTypes = new Set(uploadedFiles.map(f => f.docType));
        return requiredDocs.length > 0 && uploadedFiles.length >= requiredDocs.length && requiredDocs.every(doc => uploadedDocTypes.has(doc));
    };

    const handleCreateClaim = async (e) => {
        e.preventDefault();
        setError("");
        if (!isStep1Valid()) { setError("Please fill in all required fields"); return; }
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/claims?token=${token}`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_policy_id: parseInt(formData.userPolicyId), claim_type: formData.claimType, incident_date: formData.incidentDate, amount_claimed: parseFloat(formData.amountClaimed), description: formData.description || null })
            });
            if (!response.ok) { const data = await response.json(); setError(data.detail || "Failed to create claim"); return; }
            const data = await response.json();
            setCurrentClaimId(data.id);
            setSuccess(`Claim created: ${data.claim_number}`);
            setWizardStep(2);
        } catch (err) { setError("Error creating claim: " + err.message); }
        finally { setLoading(false); }
    };

    const handleUploadDocuments = async () => {
        if (uploadedFiles.length === 0) { setError("Please upload at least one document"); return; }
        setLoading(true);
        try {
            for (const fileData of uploadedFiles) {
                const formDataObj = new FormData();
                formDataObj.append("file", fileData.file);
                formDataObj.append("doc_type", fileData.docType);
                const response = await fetch(`http://localhost:8000/claims/${currentClaimId}/documents?token=${token}&doc_type=${fileData.docType}`, { method: "POST", body: formDataObj });
                if (!response.ok) { const errorData = await response.json().catch(() => ({})); setError(errorData.detail || `Failed to upload ${fileData.fileName}`); return; }
            }
            setSuccess("✅ Documents uploaded successfully! Proceeding to review...");
            setTimeout(() => setWizardStep(3), 1000);
        } catch (err) { setError("Error uploading documents: " + err.message); }
        finally { setLoading(false); }
    };

    const handleSubmitClaim = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/claims/${currentClaimId}/submit?token=${token}`, { method: "POST" });
            if (!response.ok) { const data = await response.json(); setError(data.detail || "Failed to submit claim"); return; }
            setSuccess("✅ Claim submitted successfully! You can track status in My Claims.");
            setTimeout(() => { resetWizard(); setActiveTab("list"); fetchClaims(); }, 2500);
        } catch (err) { setError("Error submitting claim: " + err.message); }
        finally { setLoading(false); }
    };

    const resetWizard = () => {
        setCurrentClaimId(null); setWizardStep(1);
        setFormData({ userPolicyId: "", claimType: "", incidentDate: "", amountClaimed: "", description: "" });
        setUploadedFiles([]); setError(""); setSuccess("");
    };

    const handleSubmitDraftClaim = async (claimId) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/claims/${claimId}/submit?token=${token}`, { method: "POST" });
            if (!response.ok) { const data = await response.json(); setError(data.detail || "Failed to submit claim"); return; }
            setSuccess("✅ Claim submitted successfully!");
            await fetchClaimDetail(claimId);
        } catch (err) { setError("Error submitting claim: " + err.message); }
        finally { setLoading(false); }
    };

    const selectedPolicyData = userPolicies.find(p => p.id === parseInt(formData.userPolicyId));
    const claimTypeInfo = DOCUMENT_REQUIREMENTS[formData.claimType];
    const requiredDocs = claimTypeInfo?.documents || [];

    const getStatusStyle = (status) => STATUS_STYLES[status] || STATUS_STYLES.draft;

    if (!token) return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0a0f1e,#0d1b2e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#64748b", fontSize: "18px" }}>⏳ Redirecting to login...</p>
        </div>
    );

    return (
        <div style={styles.page}>
            <style>{globalStyles}</style>
            <div style={styles.blob1} /><div style={styles.blob2} /><div style={styles.blob3} />

            <div style={styles.container}>

                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerBadge}>📋 Claims Center</div>
                    <h1 style={styles.headerTitle}>Insurance Claims</h1>
                    <p style={styles.headerSub}>File new claims and track existing ones in real-time</p>
                </div>

                {/* Tabs */}
                <div style={styles.tabBar}>
                    <button
                        onClick={() => { setActiveTab("file"); setSelectedClaim(null); }}
                        style={activeTab === "file" ? styles.tabActive : styles.tabIdle}
                        className="tab-btn"
                    >
                        📝 File Claim
                    </button>
                    <button
                        onClick={() => { setActiveTab("list"); setSelectedClaim(null); }}
                        style={activeTab === "list" ? styles.tabActive : styles.tabIdle}
                        className="tab-btn"
                    >
                        📊 My Claims
                    </button>
                </div>

                {/* Alerts */}
                {error && (
                    <div style={styles.alertError}>
                        <span>⚠️ {error}</span>
                        <button onClick={() => setError("")} style={styles.alertClose}>✕</button>
                    </div>
                )}
                {success && (
                    <div style={styles.alertSuccess}>
                        <span>{success}</span>
                        <button onClick={() => setSuccess("")} style={styles.alertClose}>✕</button>
                    </div>
                )}

                {/* ── FILE CLAIM TAB ── */}
                {activeTab === "file" && (
                    <>
                        {/* Wizard Steps Indicator */}
                        <div style={styles.wizardBar}>
                            {[
                                { n: 1, label: "Claim Details" },
                                { n: 2, label: "Upload Docs" },
                                { n: 3, label: "Review & Submit" },
                            ].map((step, i) => {
                                const active = wizardStep === step.n;
                                const done = wizardStep > step.n;
                                return (
                                    <div key={step.n} style={styles.wizardStepWrap}>
                                        {i > 0 && <div style={{ ...styles.wizardLine, background: done ? '#34d399' : 'rgba(255,255,255,0.08)' }} />}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                ...styles.wizardCircle,
                                                background: done ? '#34d399' : active ? 'linear-gradient(135deg,#2563eb,#4f46e5)' : 'rgba(255,255,255,0.06)',
                                                color: (done || active) ? '#fff' : '#475569',
                                                boxShadow: active ? '0 0 16px rgba(79,70,229,0.5)' : 'none',
                                            }}>
                                                {done ? '✓' : step.n}
                                            </div>
                                            <span style={{ color: active ? '#f1f5f9' : done ? '#34d399' : '#475569', fontSize: '13px', fontWeight: '600' }}>
                                                {step.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Step 1 */}
                        {currentClaimId === null && (
                            <div style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <div style={styles.cardDot} />
                                    <h2 style={styles.cardTitle}>Step 1: Policy & Claim Details</h2>
                                </div>
                                <form onSubmit={handleCreateClaim}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Select Policy *</label>
                                        {userPolicies.length === 0 ? (
                                            <div style={styles.alertInfo}>
                                                You don't have any active policies.{" "}
                                                <button type="button" onClick={() => navigate("/browse")} style={styles.linkBtn}>Browse policies →</button>
                                            </div>
                                        ) : (
                                            <>
                                                <select name="userPolicyId" value={formData.userPolicyId} onChange={handleFormChange} disabled={loading} style={styles.select}>
                                                    <option value="">-- Select a policy --</option>
                                                    {userPolicies.map(p => <option key={p.id} value={p.id}>{p.policy.title} (#{p.policy_number})</option>)}
                                                </select>
                                                {selectedPolicyData && (
                                                    <div style={styles.policyInfoRow}>
                                                        <span style={styles.policyInfoChip}>#{selectedPolicyData.policy_number}</span>
                                                        <span style={styles.policyInfoChip}>{selectedPolicyData.policy.policy_type}</span>
                                                        <span style={{ ...styles.policyInfoChip, color: '#34d399', borderColor: 'rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.08)' }}>{selectedPolicyData.status}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Claim Type *</label>
                                        <select name="claimType" value={formData.claimType} onChange={handleFormChange} disabled={loading} style={styles.select}>
                                            <option value="">-- Select claim type --</option>
                                            {Object.entries(DOCUMENT_REQUIREMENTS).map(([key, val]) => (
                                                <option key={key} value={key}>{val.icon} {val.name}</option>
                                            ))}
                                        </select>
                                        {claimTypeInfo && (
                                            <p style={styles.hint}>Required: {requiredDocs.map(d => DOC_TYPE_LABELS[d]).join(", ")}</p>
                                        )}
                                    </div>

                                    <div style={styles.formRow}>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Incident Date *</label>
                                            <input type="date" name="incidentDate" value={formData.incidentDate} onChange={handleFormChange} disabled={loading} max={new Date().toISOString().split('T')[0]} style={styles.input} />
                                        </div>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Amount Claimed (₹) *</label>
                                            <input type="number" name="amountClaimed" value={formData.amountClaimed} onChange={handleFormChange} disabled={loading} min="0" step="1000" placeholder="0" style={styles.input} />
                                        </div>
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Description (Optional)</label>
                                        <textarea name="description" value={formData.description} onChange={handleFormChange} disabled={loading} placeholder="Describe the incident in detail..." rows="3" style={{ ...styles.input, resize: 'vertical', lineHeight: 1.6 }} />
                                    </div>

                                    <button type="submit" disabled={loading || !isStep1Valid() || userPolicies.length === 0} style={isStep1Valid() && userPolicies.length > 0 ? styles.btnPrimary : styles.btnDisabled} className="primary-btn">
                                        {loading ? "Creating..." : "Continue to Documents →"}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Step 2 */}
                        {wizardStep === 2 && currentClaimId !== null && (
                            <div style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <div style={{ ...styles.cardDot, background: '#fb923c', boxShadow: '0 0 8px rgba(251,146,60,0.6)' }} />
                                    <h2 style={styles.cardTitle}>Step 2: Upload Required Documents</h2>
                                </div>
                                <div style={styles.claimTypeBanner}>
                                    <span style={styles.claimTypeBannerIcon}>{claimTypeInfo?.icon}</span>
                                    <div>
                                        <p style={styles.claimTypeBannerTitle}>{claimTypeInfo?.name}</p>
                                        <p style={styles.claimTypeBannerSub}>Upload all required documents (PDF, JPG, PNG — max 5MB each)</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                                    {requiredDocs.map(docType => {
                                        const uploaded = uploadedFiles.find(f => f.docType === docType);
                                        return (
                                            <div key={docType} style={{ ...styles.docRow, borderColor: uploaded ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.07)' }}>
                                                <div style={styles.docRowHeader}>
                                                    <span style={{ fontSize: '18px' }}>{uploaded ? '✅' : '⬜'}</span>
                                                    <div>
                                                        <p style={styles.docRowLabel}>{DOC_TYPE_LABELS[docType]}</p>
                                                        <p style={styles.docRowType}>{docType}</p>
                                                    </div>
                                                </div>
                                                {uploaded ? (
                                                    <div style={styles.docUploaded}>
                                                        <span style={styles.docUploadedName}>📎 {uploaded.fileName}</span>
                                                        <button onClick={() => handleRemoveFile(docType)} style={styles.btnRemove}>✕ Remove</button>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <input id={`file-${docType}`} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileInputChange(e, docType)} disabled={loading} style={{ display: 'none' }} />
                                                        <label htmlFor={`file-${docType}`} style={styles.fileLabel} className="file-label">
                                                            ⬆️ Click to upload
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div style={styles.uploadProgress}>
                                    <div style={styles.uploadProgressBar}>
                                        <div style={{ ...styles.uploadProgressFill, width: `${(uploadedFiles.length / requiredDocs.length) * 100}%` }} />
                                    </div>
                                    <span style={styles.uploadProgressText}>{uploadedFiles.length} / {requiredDocs.length} documents</span>
                                </div>

                                <div style={styles.formActions}>
                                    <button type="button" onClick={() => { if (window.confirm("Going back will lose unsaved documents. Continue?")) resetWizard(); }} disabled={loading} style={styles.btnSecondary} className="secondary-btn">
                                        ← Cancel
                                    </button>
                                    <button type="button" onClick={handleUploadDocuments} disabled={loading || !isStep2Valid()} style={isStep2Valid() ? { ...styles.btnPrimary, flex: 1 } : { ...styles.btnDisabled, flex: 1 }} className="primary-btn">
                                        {loading ? "Uploading..." : "Continue to Review →"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3 */}
                        {wizardStep === 3 && (
                            <div style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <div style={{ ...styles.cardDot, background: '#34d399', boxShadow: '0 0 8px rgba(52,211,153,0.6)' }} />
                                    <h2 style={styles.cardTitle}>Step 3: Review & Submit</h2>
                                </div>

                                <div style={styles.reviewGrid}>
                                    <div style={styles.reviewBox}>
                                        <h3 style={styles.reviewBoxTitle}>📋 Claim Summary</h3>
                                        {selectedPolicyData && (
                                            <>
                                                <ReviewRow label="Policy" value={selectedPolicyData.policy.title} />
                                                <ReviewRow label="Policy #" value={selectedPolicyData.policy_number} />
                                                <ReviewRow label="Type" value={selectedPolicyData.policy.policy_type} />
                                            </>
                                        )}
                                        <ReviewRow label="Claim Type" value={`${claimTypeInfo?.icon} ${claimTypeInfo?.name}`} />
                                        <ReviewRow label="Incident Date" value={formData.incidentDate} />
                                        <ReviewRow label="Amount" value={`₹${parseFloat(formData.amountClaimed).toLocaleString()}`} accent="#f87171" />
                                    </div>
                                    <div style={styles.reviewBox}>
                                        <h3 style={styles.reviewBoxTitle}>📎 Documents ({uploadedFiles.length})</h3>
                                        {uploadedFiles.map((file, idx) => (
                                            <ReviewRow key={idx} label={DOC_TYPE_LABELS[file.docType]} value={file.fileName} />
                                        ))}
                                    </div>
                                </div>

                                <div style={styles.alertInfo}>
                                    ℹ️ After submission, our team will review your claim within 5–7 business days. We'll notify you via email.
                                </div>

                                <div style={styles.formActions}>
                                    <button type="button" onClick={() => setWizardStep(2)} disabled={loading} style={styles.btnSecondary} className="secondary-btn">
                                        ← Back
                                    </button>
                                    <button type="button" onClick={handleSubmitClaim} disabled={loading} style={{ ...styles.btnPrimary, flex: 1 }} className="primary-btn">
                                        {loading ? "Submitting..." : "🚀 Submit Claim"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ── MY CLAIMS TAB ── */}
                {activeTab === "list" && !selectedClaim && (
                    loading ? (
                        <div style={styles.loadingBox}>
                            <div style={styles.spinner}></div>
                            <p style={{ color: '#64748b', margin: 0, fontWeight: '500' }}>Loading claims...</p>
                        </div>
                    ) : claimsList.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}>📭</div>
                            <p style={styles.emptyTitle}>No claims filed yet</p>
                            <p style={styles.emptySubText}>When you file a claim, it will appear here.</p>
                            <button onClick={() => setActiveTab("file")} style={styles.btnPrimary} className="primary-btn">
                                File Your First Claim →
                            </button>
                        </div>
                    ) : (
                        <div style={styles.claimsGrid}>
                            {claimsList.map(claim => {
                                const st = getStatusStyle(claim.status);
                                const claimIcon = DOCUMENT_REQUIREMENTS[claim.claim_type]?.icon || "📋";
                                return (
                                    <div key={claim.id} style={styles.claimCard} className="claim-card">
                                        {/* Status color bar */}
                                        <div style={{ ...styles.statusBar, background: st.color }} />

                                        <div style={styles.claimCardHeader}>
                                            <div style={styles.claimCardHeaderLeft}>
                                                <span style={{ fontSize: '24px' }}>{claimIcon}</span>
                                                <div>
                                                    <p style={styles.claimNumber}>{claim.claim_number}</p>
                                                    <p style={styles.claimType}>{claim.claim_type.toUpperCase()}</p>
                                                </div>
                                            </div>
                                            <span style={{ ...styles.statusBadge, color: st.color, background: st.bg, borderColor: st.border }}>
                                                {st.badge} {claim.status.replace(/_/g, " ").toUpperCase()}
                                            </span>
                                        </div>

                                        <div style={styles.claimCardBody}>
                                            <ClaimMeta label="Amount" value={`₹${claim.amount_claimed.toLocaleString()}`} />
                                            <ClaimMeta label="Policy" value={claim.policy?.title || "N/A"} />
                                            <ClaimMeta label="Documents" value={`${claim.documents_count || 0} file(s)`} />
                                            <ClaimMeta label="Filed" value={new Date(claim.created_at).toLocaleDateString()} />
                                        </div>

                                        <div style={styles.claimCardFooter}>
                                            <button onClick={() => fetchClaimDetail(claim.id)} style={styles.btnViewDetail} className="view-detail-btn">
                                                View Details →
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}

                {/* ── CLAIM DETAIL ── */}
                {selectedClaim && (
                    loadingDetail ? (
                        <div style={styles.loadingBox}>
                            <div style={styles.spinner}></div>
                            <p style={{ color: '#64748b', margin: 0 }}>Loading claim details...</p>
                        </div>
                    ) : (
                        <div>
                            <button onClick={() => { setSelectedClaim(null); fetchClaims(); }} style={styles.btnBack} className="back-btn">
                                ← Back to Claims
                            </button>

                            <div style={styles.card}>
                                {/* Detail header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px', paddingBottom: '22px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                                    <div>
                                        <h2 style={{ ...styles.cardTitle, fontSize: '22px', marginBottom: '4px' }}>{selectedClaim.claim_number}</h2>
                                        <p style={{ color: '#64748b', margin: 0, fontSize: '13px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                            {DOCUMENT_REQUIREMENTS[selectedClaim.claim_type]?.icon} {selectedClaim.claim_type}
                                        </p>
                                    </div>
                                    <span style={{ ...styles.statusBadge, ...(() => { const s = getStatusStyle(selectedClaim.status); return { color: s.color, background: s.bg, borderColor: s.border }; })(), fontSize: '13px', padding: '8px 18px' }}>
                                        {selectedClaim.status.replace(/_/g, " ").toUpperCase()}
                                    </span>
                                </div>

                                <div style={styles.reviewGrid}>
                                    <div style={styles.reviewBox}>
                                        <h3 style={styles.reviewBoxTitle}>📋 Claim Information</h3>
                                        <ReviewRow label="Claim #" value={selectedClaim.claim_number} />
                                        <ReviewRow label="Amount" value={`₹${selectedClaim.amount_claimed.toLocaleString()}`} accent="#f87171" />
                                        <ReviewRow label="Incident Date" value={selectedClaim.incident_date} />
                                        <ReviewRow label="Filed" value={new Date(selectedClaim.created_at).toLocaleDateString()} />
                                    </div>
                                    <div style={styles.reviewBox}>
                                        <h3 style={styles.reviewBoxTitle}>🏢 Policy Information</h3>
                                        <ReviewRow label="Policy" value={selectedClaim.policy?.title || "N/A"} />
                                        <ReviewRow label="Policy #" value={selectedClaim.policy?.policy_number || "N/A"} />
                                        <ReviewRow label="Provider" value={selectedClaim.policy?.provider || "N/A"} />
                                        <ReviewRow label="Premium" value={selectedClaim.policy?.premium ? `₹${selectedClaim.policy.premium.toLocaleString()}` : "N/A"} />
                                    </div>
                                </div>

                                {/* Documents */}
                                <div style={{ ...styles.reviewBox, marginTop: '16px' }}>
                                    <h3 style={styles.reviewBoxTitle}>📎 Supporting Documents ({selectedClaim.documents?.length || 0})</h3>
                                    {selectedClaim.documents?.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {selectedClaim.documents.map(doc => (
                                                <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', gap: '12px' }}>
                                                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>📎 {doc.doc_type}</span>
                                                    <span style={{ color: '#64748b', fontSize: '12px', wordBreak: 'break-all' }}>{doc.file_url}</span>
                                                    <span style={{ color: '#475569', fontSize: '12px', flexShrink: 0 }}>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p style={{ color: '#475569', margin: 0, fontSize: '14px' }}>No documents uploaded</p>}
                                </div>

                                {/* Status messages */}
                                {selectedClaim.status === "draft" && (
                                    <div style={{ marginTop: '20px' }}>
                                        {selectedClaim.documents_count === 0 && <div style={{ ...styles.alertWarning, marginBottom: '12px' }}>⚠️ Upload at least one document before submitting</div>}
                                        <button onClick={() => handleSubmitDraftClaim(selectedClaim.id)} disabled={loading || selectedClaim.documents_count === 0} style={selectedClaim.documents_count > 0 ? { ...styles.btnPrimary, width: '100%' } : { ...styles.btnDisabled, width: '100%' }} className="primary-btn">
                                            {loading ? "Submitting..." : "Submit Claim for Review"}
                                        </button>
                                    </div>
                                )}
                                {selectedClaim.status === "submitted" && <div style={{ ...styles.alertInfo, marginTop: '20px' }}>ℹ️ Your claim is under review. We'll notify you of any updates.</div>}
                                {selectedClaim.status === "approved" && <div style={{ ...styles.alertSuccess, marginTop: '20px' }}>✅ Your claim has been approved! Payment will be processed within 7–10 business days.</div>}
                                {selectedClaim.status === "rejected" && <div style={{ ...styles.alertError, marginTop: '20px' }}>❌ Your claim has been rejected. Please contact support for more details.</div>}
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

function ReviewRow({ label, value, accent }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', flexShrink: 0 }}>{label}</span>
            <span style={{ color: accent || '#e2e8f0', fontSize: '13px', fontWeight: '600', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
        </div>
    );
}

function ClaimMeta({ label, value }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ color: '#475569', fontSize: '12px', fontWeight: '600' }}>{label}</span>
            <span style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600' }}>{value}</span>
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
    container: { maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 },
    // Header
    header: { marginBottom: '36px' },
    headerBadge: { display: 'inline-block', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', fontSize: '13px', fontWeight: '600', letterSpacing: '0.08em', padding: '6px 14px', borderRadius: '20px', marginBottom: '14px' },
    headerTitle: { fontSize: 'clamp(28px,4vw,44px)', fontWeight: '800', background: 'linear-gradient(135deg,#f1f5f9 0%,#94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 10px 0', letterSpacing: '-1px' },
    headerSub: { color: '#64748b', fontSize: '16px', margin: 0 },
    // Tabs
    tabBar: { display: 'flex', gap: '10px', marginBottom: '24px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '6px', backdropFilter: 'blur(20px)', width: 'fit-content' },
    tabActive: { background: 'linear-gradient(135deg,#1d4ed8,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 24px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", boxShadow: '0 4px 14px rgba(79,70,229,0.45)' },
    tabIdle: { background: 'transparent', color: '#64748b', border: 'none', borderRadius: '10px', padding: '10px 24px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif', transition: 'color 0.15s'" },
    // Alerts
    alertError: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '14px 18px', marginBottom: '16px', color: '#fca5a5', fontSize: '14px' },
    alertSuccess: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: '12px', padding: '14px 18px', marginBottom: '16px', color: '#6ee7b7', fontSize: '14px' },
    alertWarning: { display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)', borderRadius: '12px', padding: '14px 18px', color: '#fdba74', fontSize: '14px' },
    alertInfo: { display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: '12px', padding: '14px 18px', color: '#7dd3fc', fontSize: '14px', marginBottom: '16px' },
    alertClose: { background: 'none', border: 'none', color: 'inherit', fontSize: '16px', cursor: 'pointer', opacity: 0.7, flexShrink: 0, marginLeft: '12px' },
    // Wizard bar
    wizardBar: { display: 'flex', alignItems: 'center', gap: '0', background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '18px 24px', marginBottom: '20px', backdropFilter: 'blur(20px)', flexWrap: 'wrap', rowGap: '12px' },
    wizardStepWrap: { display: 'flex', alignItems: 'center', flex: 1, minWidth: '120px' },
    wizardLine: { height: '2px', flex: 1, margin: '0 12px' },
    wizardCircle: { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', flexShrink: 0 },
    // Card
    card: { background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '32px', marginBottom: '20px', backdropFilter: 'blur(20px)', boxShadow: '0 4px 40px rgba(0,0,0,0.3)' },
    cardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' },
    cardDot: { width: '10px', height: '10px', borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 8px rgba(96,165,250,0.6)', flexShrink: 0 },
    cardTitle: { fontSize: '20px', fontWeight: '700', color: '#f1f5f9', margin: 0 },
    // Form
    formGroup: { marginBottom: '20px' },
    formRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px', marginBottom: '20px' },
    label: { display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' },
    select: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans',sans-serif" },
    input: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', fontWeight: '500', outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans',sans-serif" },
    hint: { color: '#64748b', fontSize: '12px', margin: '8px 0 0 0', fontStyle: 'italic' },
    policyInfoRow: { display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' },
    policyInfoChip: { color: '#60a5fa', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px' },
    linkBtn: { background: 'none', border: 'none', color: '#60a5fa', fontWeight: '700', cursor: 'pointer', fontSize: '14px', padding: 0, fontFamily: "'DM Sans',sans-serif" },
    // Claim type banner
    claimTypeBanner: { display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px 18px', marginBottom: '24px' },
    claimTypeBannerIcon: { fontSize: '28px', flexShrink: 0 },
    claimTypeBannerTitle: { color: '#f1f5f9', fontWeight: '700', fontSize: '15px', margin: '0 0 4px 0' },
    claimTypeBannerSub: { color: '#64748b', fontSize: '13px', margin: 0 },
    // Doc rows
    docRow: { background: 'rgba(255,255,255,0.03)', border: '1px solid', borderRadius: '12px', padding: '16px 18px' },
    docRowHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
    docRowLabel: { color: '#e2e8f0', fontWeight: '700', fontSize: '14px', margin: '0 0 2px 0' },
    docRowType: { color: '#475569', fontSize: '11px', margin: 0, letterSpacing: '0.06em' },
    docUploaded: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '8px', padding: '10px 14px' },
    docUploadedName: { color: '#6ee7b7', fontSize: '13px', fontWeight: '600' },
    btnRemove: { background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', color: '#fca5a5', fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" },
    fileLabel: { display: 'inline-block', background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.15)', color: '#94a3b8', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s' },
    // Upload progress
    uploadProgress: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' },
    uploadProgressBar: { flex: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' },
    uploadProgressFill: { height: '100%', background: 'linear-gradient(90deg,#2563eb,#34d399)', borderRadius: '99px', transition: 'width 0.4s ease' },
    uploadProgressText: { color: '#64748b', fontSize: '13px', fontWeight: '600', flexShrink: 0 },
    // Review
    reviewGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '16px', marginBottom: '20px' },
    reviewBox: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px 22px' },
    reviewBoxTitle: { color: '#94a3b8', fontSize: '12px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 14px 0' },
    // Form actions
    formActions: { display: 'flex', gap: '12px', marginTop: '24px' },
    // Buttons
    btnPrimary: { background: 'linear-gradient(135deg,#1d4ed8,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', padding: '13px 24px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", boxShadow: '0 4px 18px rgba(79,70,229,0.4)', transition: 'transform 0.18s,box-shadow 0.18s' },
    btnSecondary: { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '13px 24px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" },
    btnDisabled: { background: 'rgba(255,255,255,0.05)', color: '#475569', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '13px 24px', fontWeight: '700', fontSize: '15px', cursor: 'not-allowed', fontFamily: "'DM Sans',sans-serif" },
    btnBack: { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 20px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", marginBottom: '16px' },
    btnViewDetail: { width: '100%', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.15s' },
    // Claims grid
    statusBar: { height: '4px', opacity: 0.8 },
    claimsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '18px' },
    claimCard: { background: 'rgba(15,23,42,0.75)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', overflow: 'hidden', backdropFilter: 'blur(20px)', boxShadow: '0 4px 28px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s,box-shadow 0.2s' },
    claimCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' },
    claimCardHeaderLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
    claimNumber: { color: '#f1f5f9', fontWeight: '700', fontSize: '15px', margin: '0 0 3px 0' },
    claimType: { color: '#64748b', fontSize: '11px', margin: 0, fontWeight: '700', letterSpacing: '0.08em' },
    statusBadge: { fontSize: '11px', fontWeight: '800', padding: '6px 14px', borderRadius: '20px', border: '1px solid', letterSpacing: '0.06em', flexShrink: 0 },
    claimCardBody: { padding: '16px 20px', flex: 1 },
    claimCardFooter: { padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.15)' },
    // Loading / empty
    loadingBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '60px 20px', background: 'rgba(15,23,42,0.5)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' },
    spinner: { width: '40px', height: '40px', border: '3px solid rgba(96,165,250,0.2)', borderTop: '3px solid #60a5fa', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    emptyState: { textAlign: 'center', padding: '64px 32px', background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
    emptyIcon: { fontSize: '52px' },
    emptyTitle: { color: '#94a3b8', fontSize: '20px', fontWeight: '700', margin: 0 },
    emptySubText: { color: '#475569', fontSize: '14px', margin: 0 },
};

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; }

.primary-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(79,70,229,0.5) !important; }
.secondary-btn:hover { background: rgba(255,255,255,0.09) !important; color: #cbd5e1 !important; }
.back-btn:hover { background: rgba(255,255,255,0.09) !important; color: #cbd5e1 !important; }
.tab-btn:hover { color: #e2e8f0 !important; }
.claim-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.45) !important; }
.view-detail-btn:hover { background: rgba(255,255,255,0.09) !important; color: #e2e8f0 !important; border-color: rgba(255,255,255,0.15) !important; }
.file-label:hover { background: rgba(255,255,255,0.09) !important; border-color: rgba(96,165,250,0.4) !important; color: #e2e8f0 !important; }

select option { background: #0d1b2e; color: #e2e8f0; }
input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
input::placeholder { color: #475569; }
input:focus, select:focus, textarea:focus { border-color: rgba(96,165,250,0.4) !important; outline: none; box-shadow: 0 0 0 3px rgba(96,165,250,0.08); }

@keyframes spin { to { transform: rotate(360deg); } }
`;

export default ClaimsPage;
