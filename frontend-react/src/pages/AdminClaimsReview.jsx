import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const STATUS_STYLES = {
    draft: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.3)', badge: '📝' },
    submitted: { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.3)', badge: '📤' },
    under_review: { color: '#fb923c', bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.3)', badge: '🔍' },
    approved: { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)', badge: '✅' },
    rejected: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', badge: '❌' },
    paid: { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)', badge: '💰' },
};

const CLAIM_TYPES = {
    health: '🏥 Health Claim',
    accident: '🚗 Accident / Auto Claim',
    life: '❤️ Life Claim',
    travel: '✈️ Travel Claim',
    home: '🏠 Home/Property Claim',
};

export default function AdminClaimsReview({ token: propToken }) {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [approvalState, setApprovalState] = useState({}); // Track button states
    const navigate = useNavigate();

    const token = propToken || localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const itemsPerPage = 15;

    // Check admin access
    useEffect(() => {
        if (!user.is_admin && user.role !== 'admin') {
            navigate('/home');
        }
    }, [navigate, user]);

    // Fetch claims for admin review
    const fetchClaims = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            // Verify token exists
            if (!token) {
                setError('Authentication token missing. Please log in again.');
                setLoading(false);
                navigate('/login');
                return;
            }

            const skip = (currentPage - 1) * itemsPerPage;

            // Build status filter
            let statusFilter = '';
            if (selectedFilter !== 'all') {
                statusFilter = `&status=${selectedFilter}`;
            }

            const res = await fetch(
                `http://localhost:8000/admin/claims-list?token=${token}&skip=${skip}&limit=${itemsPerPage}${statusFilter}`
            );

            if (!res.ok) {
                let errorMsg = `Failed to fetch claims: ${res.status} ${res.statusText}`;
                try {
                    const errorData = await res.json();
                    if (errorData.detail) {
                        errorMsg = `Error ${res.status}: ${errorData.detail}`;
                    }
                } catch (e) {
                    // If response isn't JSON, use the status text
                }
                throw new Error(errorMsg);
            }

            const data = await res.json();
            if (data.status === 'success') {
                setClaims(data.data.claims || []);
                setTotalCount(data.data.total_count || 0);
            } else {
                throw new Error(data.message || 'Failed to fetch claims');
            }
        } catch (err) {
            setError(err.message);
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [token, currentPage, selectedFilter, itemsPerPage]);

    useEffect(() => {
        fetchClaims();
    }, [fetchClaims]);

    const handleApproveClaim = async (claimId) => {
        if (window.confirm('Are you sure you want to approve this claim?')) {
            try {
                setApprovalState(prev => ({ ...prev, [claimId]: 'loading' }));

                const res = await fetch(
                    `http://localhost:8000/api/admin/claims/${claimId}/approve?token=${token}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    }
                );

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Failed to approve claim: ${res.status} - ${errorText}`);
                }

                const result = await res.json();

                // Update local state to show approved status
                setClaims(prevClaims =>
                    prevClaims.map(claim =>
                        claim.id === claimId
                            ? { ...claim, status: 'approved' }
                            : claim
                    )
                );

                setApprovalState(prev => ({ ...prev, [claimId]: 'approved' }));

                // Refresh data after short delay
                setTimeout(() => {
                    fetchClaims();
                }, 1000);

                alert('✅ Claim approved successfully!');
            } catch (err) {
                console.error('Approve error:', err);
                setApprovalState(prev => ({ ...prev, [claimId]: 'error' }));
                alert('❌ Error approving claim: ' + err.message);
            }
        }
    };

    const handleRejectClaim = async (claimId) => {
        const reason = prompt('Enter rejection reason (required):');
        if (reason === null) return; // User cancelled

        if (!reason.trim()) {
            alert('⚠️ Rejection reason is required');
            return;
        }

        try {
            setApprovalState(prev => ({ ...prev, [claimId]: 'loading' }));

            const res = await fetch(
                `http://localhost:8000/api/admin/claims/${claimId}/reject?token=${token}&reason=${encodeURIComponent(reason)}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Failed to reject claim: ${res.status} - ${errorText}`);
            }

            const result = await res.json();

            // Update local state to show rejected status
            setClaims(prevClaims =>
                prevClaims.map(claim =>
                    claim.id === claimId
                        ? { ...claim, status: 'rejected' }
                        : claim
                )
            );

            setApprovalState(prev => ({ ...prev, [claimId]: 'rejected' }));

            // Refresh data after short delay
            setTimeout(() => {
                fetchClaims();
            }, 1000);

            alert('✅ Claim rejected successfully!');
        } catch (err) {
            console.error('Reject error:', err);
            setApprovalState(prev => ({ ...prev, [claimId]: 'error' }));
            alert('❌ Error rejecting claim: ' + err.message);
        }
    };

    const handleViewClaimDetails = (claim) => {
        setSelectedClaim(claim);
    };

    const handleCloseDetails = () => {
        setSelectedClaim(null);
    };

    const filteredClaims = claims.filter(claim => {
        if (selectedFilter === 'all') return true;
        return claim.status === selectedFilter;
    });

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const renderApprovalButton = (claim) => {
        const state = approvalState[claim.id];
        const isProcessing = claim.status === 'approved' || claim.status === 'rejected';

        if (isProcessing) {
            const statusStyle = claim.status === 'approved'
                ? styles.btnApprovedDisabled
                : styles.btnRejectedDisabled;
            const text = claim.status === 'approved' ? '✅ Approved' : '❌ Rejected';
            return (
                <button style={statusStyle} disabled title="This claim has been processed">
                    {text}
                </button>
            );
        }

        if (state === 'loading') {
            return (
                <button style={styles.btnLoading} disabled>
                    ⏳ Processing...
                </button>
            );
        }

        return (
            <>
                <button
                    onClick={() => handleApproveClaim(claim.id)}
                    style={styles.btnApprove}
                    className="card-btn"
                    title="Approve this claim"
                >
                    ✓ Approve
                </button>
                <button
                    onClick={() => handleRejectClaim(claim.id)}
                    style={styles.btnReject}
                    className="card-btn"
                    title="Reject this claim"
                >
                    ✕ Reject
                </button>
            </>
        );
    };

    if (loading && claims.length === 0) {
        return (
            <div style={styles.loadingScreen}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Loading claims for review...</p>
                <style>{keyframes}</style>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <style>{globalStyles}</style>

            {/* Ambient blobs */}
            <div style={styles.blob1} />
            <div style={styles.blob2} />
            <div style={styles.blob3} />

            <div style={styles.container}>

                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerBadge}>📋 Claim Management</div>
                    <h1 style={styles.headerTitle}>Claims Review Center</h1>
                    <p style={styles.headerSub}>Review, approve, or reject insurance claims</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={styles.errorBox}>
                        <span style={styles.errorIcon}>⚠️</span>
                        <div>
                            <p style={styles.errorText}><strong>Error:</strong> {error}</p>
                            <button onClick={fetchClaims} style={styles.retryBtn}>Try Again →</button>
                        </div>
                    </div>
                )}

                {/* Stats Bar */}
                <div style={styles.statsGrid}>
                    {[
                        { label: "Total Claims", value: totalCount, icon: "📁", accent: "#38bdf8", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.25)" },
                        { label: "Current Page", value: currentPage, icon: "📖", accent: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.25)" },
                        { label: "Per Page", value: itemsPerPage, icon: "📋", accent: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.25)" },
                        { label: "Total Pages", value: totalPages, icon: "📑", accent: "#fb923c", bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.25)" },
                    ].map((card, i) => (
                        <div key={i} style={{ ...styles.statCard, background: card.bg, borderColor: card.border }} className="stat-card">
                            <div style={{ ...styles.statIcon, color: card.accent }}>{card.icon}</div>
                            <p style={styles.statLabel}>{card.label}</p>
                            <h2 style={{ ...styles.statValue, color: card.accent }}>{card.value}</h2>
                            <div style={{ ...styles.statGlow, background: card.accent }} />
                        </div>
                    ))}
                </div>

                {/* Filter Bar */}
                <div style={styles.filterCard}>
                    <span style={styles.filterLabel}>Filter by status:</span>
                    <div style={styles.filterBtns}>
                        {['all', 'submitted', 'under_review', 'approved', 'rejected'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => { setSelectedFilter(filter); setCurrentPage(1); }}
                                style={selectedFilter === filter ? styles.filterBtnActive : styles.filterBtnIdle}
                                className="filter-btn"
                            >
                                {filter === 'all' && '🗂️ All'}
                                {filter === 'submitted' && '📤 Submitted'}
                                {filter === 'under_review' && '🔍 Under Review'}
                                {filter === 'approved' && '✅ Approved'}
                                {filter === 'rejected' && '❌ Rejected'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Claims Grid */}
                {filteredClaims.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>📭</div>
                        <p style={styles.emptyText}>No claims found</p>
                        <p style={styles.emptySubText}>Try changing your filter or check back later</p>
                    </div>
                ) : (
                    <div style={styles.claimsGrid}>
                        {filteredClaims.map(claim => {
                            const statusStyle = STATUS_STYLES[claim.status] || STATUS_STYLES.draft;
                            return (
                                <div key={claim.id} style={styles.claimCard} className="claim-card">
                                    {/* Card Header */}
                                    <div style={styles.claimCardHeader}>
                                        <div style={styles.claimCardHeaderLeft}>
                                            <span style={styles.claimTypeIcon}>{CLAIM_TYPES[claim.claim_type]?.split(' ')[0] || '📋'}</span>
                                            <div>
                                                <p style={styles.claimNumber}>{claim.claim_number}</p>
                                                <p style={styles.claimType}>{claim.claim_type?.toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <span style={{ ...styles.statusBadge, color: statusStyle.color, background: statusStyle.bg, borderColor: statusStyle.border }}>
                                            {statusStyle.badge} {claim.status.replace(/_/g, ' ').toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Card Body */}
                                    <div style={styles.claimCardBody}>
                                        <div style={styles.claimMeta}>
                                            <div style={styles.metaRow}>
                                                <span style={styles.metaLabel}>Amount</span>
                                                <span style={styles.metaValue}>₹{parseFloat(claim.amount_claimed).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <div style={styles.metaRow}>
                                                <span style={styles.metaLabel}>Incident Date</span>
                                                <span style={styles.metaValue}>{claim.incident_date}</span>
                                            </div>
                                            <div style={styles.metaRow}>
                                                <span style={styles.metaLabel}>Filed</span>
                                                <span style={styles.metaValue}>{new Date(claim.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div style={styles.metaRow}>
                                                <span style={styles.metaLabel}>Documents</span>
                                                <span style={styles.metaValue}>{claim.documents_count || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div style={styles.claimCardFooter}>
                                        <button
                                            onClick={() => {
                                                if ((claim.documents_count || 0) === 0) {
                                                    alert(`📭 No Documents\n\nClaim #${claim.claim_number} has no documents yet.`);
                                                } else {
                                                    navigate('/admin/documents', {
                                                        state: {
                                                            claimId: claim.id,
                                                            claimNumber: claim.claim_number,
                                                            autoFilterClaim: true
                                                        }
                                                    });
                                                }
                                            }}
                                            style={{ ...styles.btnView, background: 'rgba(167,139,250,0.2)', borderColor: '#a78bfa' }}
                                            className="card-btn"
                                            title={`View ${claim.documents_count || 0} document(s) for review`}
                                        >
                                            📄 View Docs ({claim.documents_count || 0})
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={styles.pagination}>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            style={currentPage === 1 ? styles.pageNavDisabled : styles.pageNav}
                        >
                            ← Previous
                        </button>
                        <div style={styles.pageNumbers}>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        style={currentPage === pageNum ? styles.pageNumActive : styles.pageNum}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            style={currentPage === totalPages ? styles.pageNavDisabled : styles.pageNav}
                        >
                            Next →
                        </button>
                    </div>
                )}

                {/* Info Bar */}
                <div style={styles.infoBar}>
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} claims
                </div>
            </div>

            {/* Claim Details Modal */}
            {selectedClaim && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>{selectedClaim.claim_number}</h2>
                            <button onClick={handleCloseDetails} style={styles.modalClose}>✕</button>
                        </div>

                        <div style={styles.modalBody}>
                            <div style={styles.detailRow}>
                                <div>
                                    <p style={styles.detailLabel}>Claim Type</p>
                                    <p style={styles.detailValue}>{CLAIM_TYPES[selectedClaim.claim_type] || selectedClaim.claim_type}</p>
                                </div>
                                <div>
                                    <p style={styles.detailLabel}>Status</p>
                                    <span style={{ ...styles.statusBadge, color: STATUS_STYLES[selectedClaim.status].color, background: STATUS_STYLES[selectedClaim.status].bg, borderColor: STATUS_STYLES[selectedClaim.status].border }}>
                                        {STATUS_STYLES[selectedClaim.status].badge} {selectedClaim.status.replace(/_/g, ' ').toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p style={styles.detailLabel}>Amount</p>
                                    <p style={styles.detailValue}>₹{parseFloat(selectedClaim.amount_claimed).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                                </div>
                            </div>

                            <div style={styles.detailRow}>
                                <div>
                                    <p style={styles.detailLabel}>Incident Date</p>
                                    <p style={styles.detailValue}>{selectedClaim.incident_date}</p>
                                </div>
                                <div>
                                    <p style={styles.detailLabel}>Filed</p>
                                    <p style={styles.detailValue}>{new Date(selectedClaim.created_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p style={styles.detailLabel}>Documents</p>
                                    <p style={styles.detailValue}>{selectedClaim.documents_count || 0}</p>
                                </div>
                            </div>

                            {selectedClaim.description && (
                                <div style={styles.descriptionBox}>
                                    <p style={styles.descriptionLabel}>Description</p>
                                    <p style={styles.descriptionText}>{selectedClaim.description}</p>
                                </div>
                            )}

                            <div style={styles.modalFooter}>
                                <button onClick={handleCloseDetails} style={styles.btnSecondary} className="secondary-btn">
                                    Close
                                </button>
                                {selectedClaim.status !== 'approved' && selectedClaim.status !== 'rejected' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                handleApproveClaim(selectedClaim.id);
                                                setTimeout(handleCloseDetails, 1000);
                                            }}
                                            style={styles.btnPrimary}
                                            className="primary-btn"
                                        >
                                            ✓ Approve Claim
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleRejectClaim(selectedClaim.id);
                                                setTimeout(handleCloseDetails, 1000);
                                            }}
                                            style={{ ...styles.btnSecondary, background: 'linear-gradient(135deg,#b91c1c,#dc2626)', color: '#fff' }}
                                            className="primary-btn"
                                        >
                                            ✕ Reject Claim
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Styles
const styles = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b2e 40%, #0a1628 70%, #06111f 100%)',
        padding: '48px 20px',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        position: 'relative',
        overflow: 'hidden',
    },
    blob1: { position: 'fixed', top: '-110px', right: '-80px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,0.12) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 },
    blob2: { position: 'fixed', bottom: '-120px', left: '-100px', width: '560px', height: '560px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.10) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 },
    blob3: { position: 'fixed', top: '42%', left: '48%', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(52,211,153,0.05) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0, transform: 'translate(-50%,-50%)' },
    container: { maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 },
    // Header
    header: { marginBottom: '36px' },
    headerBadge: { display: 'inline-block', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', fontSize: '13px', fontWeight: '600', letterSpacing: '0.08em', padding: '6px 14px', borderRadius: '20px', marginBottom: '14px' },
    headerTitle: { fontSize: '46px', fontWeight: '800', background: 'linear-gradient(135deg,#f1f5f9 0%,#94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 10px 0', letterSpacing: '-1px', lineHeight: 1.1 },
    headerSub: { color: '#64748b', fontSize: '16px', margin: 0 },
    // Error
    errorBox: { display: 'flex', alignItems: 'flex-start', gap: '14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '14px', padding: '18px 22px', marginBottom: '28px' },
    errorIcon: { fontSize: '22px', flexShrink: 0 },
    errorText: { color: '#fca5a5', fontSize: '14px', margin: '0 0 8px 0' },
    retryBtn: { background: 'none', border: 'none', color: '#60a5fa', fontWeight: '700', fontSize: '13px', cursor: 'pointer', padding: 0, letterSpacing: '0.04em' },
    // Stats
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px', marginBottom: '24px' },
    statCard: { borderRadius: '16px', padding: '24px 22px', border: '1px solid', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(10px)', transition: 'transform 0.2s ease' },
    statIcon: { fontSize: '24px', marginBottom: '10px', display: 'block' },
    statLabel: { color: '#94a3b8', fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 4px 0' },
    statValue: { fontSize: '38px', fontWeight: '800', margin: 0, letterSpacing: '-1px', lineHeight: 1 },
    statGlow: { position: 'absolute', bottom: '-30px', right: '-30px', width: '90px', height: '90px', borderRadius: '50%', opacity: 0.08, filter: 'blur(20px)' },
    // Filter
    filterCard: { display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '18px 24px', marginBottom: '24px', backdropFilter: 'blur(20px)' },
    filterLabel: { color: '#64748b', fontSize: '13px', fontWeight: '600', letterSpacing: '0.06em', flexShrink: 0 },
    filterBtns: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
    filterBtnActive: { background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(109,40,217,0.4)', transition: 'transform 0.15s' },
    filterBtnIdle: { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', padding: '8px 18px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'background 0.15s, color 0.15s' },
    // Claims grid
    claimsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' },
    claimCard: { background: 'rgba(15,23,42,0.75)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', overflow: 'hidden', backdropFilter: 'blur(20px)', boxShadow: '0 4px 30px rgba(0,0,0,0.3)', transition: 'transform 0.2s ease, box-shadow 0.2s ease', display: 'flex', flexDirection: 'column' },
    claimCardHeader: { padding: '20px 20px 16px', background: 'linear-gradient(135deg, rgba(109,40,217,0.12), rgba(59,130,246,0.10))', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' },
    claimCardHeaderLeft: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1 },
    claimTypeIcon: { fontSize: '28px', flexShrink: 0 },
    claimNumber: { color: '#e2e8f0', fontWeight: '700', fontSize: '15px', margin: '0 0 3px 0' },
    claimType: { color: '#64748b', fontSize: '12px', margin: 0, fontWeight: '700', letterSpacing: '0.08em' },
    statusBadge: { fontSize: '11px', fontWeight: '800', padding: '6px 12px', borderRadius: '8px', border: '1px solid', letterSpacing: '0.06em', flexShrink: 0, whiteSpace: 'nowrap' },
    claimCardBody: { padding: '18px 20px', flex: 1 },
    claimMeta: { display: 'flex', flexDirection: 'column', gap: '10px' },
    metaRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    metaLabel: { color: '#475569', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' },
    metaValue: { color: '#cbd5e1', fontSize: '13px', fontWeight: '600' },
    claimCardFooter: { padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '10px' },
    btnView: { flex: 0.5, background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', boxShadow: '0 3px 12px rgba(37,99,235,0.35)', transition: 'transform 0.15s' },
    btnApprove: { flex: 1, background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', boxShadow: '0 3px 12px rgba(16,185,129,0.3)', transition: 'transform 0.15s' },
    btnReject: { flex: 1, background: 'linear-gradient(135deg, #b91c1c, #dc2626)', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', boxShadow: '0 3px 12px rgba(220,38,38,0.3)', transition: 'transform 0.15s' },
    btnApprovedDisabled: { flex: 1, background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 8px', fontWeight: '700', fontSize: '13px', cursor: 'not-allowed', opacity: 0.7 },
    btnRejectedDisabled: { flex: 1, background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 8px', fontWeight: '700', fontSize: '13px', cursor: 'not-allowed', opacity: 0.7 },
    btnLoading: { flex: 1, background: 'rgba(255,255,255,0.1)', color: '#94a3b8', border: 'none', borderRadius: '8px', padding: '9px 8px', fontWeight: '700', fontSize: '13px', cursor: 'not-allowed' },
    // Empty
    emptyState: { background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '64px 32px', textAlign: 'center', backdropFilter: 'blur(20px)', marginBottom: '24px' },
    emptyIcon: { fontSize: '48px', marginBottom: '14px' },
    emptyText: { color: '#94a3b8', fontSize: '18px', fontWeight: '600', margin: '0 0 6px 0' },
    emptySubText: { color: '#475569', fontSize: '14px', margin: 0 },
    // Pagination
    pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' },
    pageNav: { background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 22px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(109,40,217,0.4)', transition: 'transform 0.15s' },
    pageNavDisabled: { background: 'rgba(255,255,255,0.05)', color: '#475569', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '10px 22px', fontWeight: '700', fontSize: '14px', cursor: 'not-allowed' },
    pageNumbers: { display: 'flex', gap: '8px' },
    pageNumActive: { background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', color: '#fff', border: 'none', borderRadius: '8px', width: '40px', height: '40px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(109,40,217,0.4)' },
    pageNum: { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', width: '40px', height: '40px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'background 0.15s' },
    infoBar: { textAlign: 'center', color: '#475569', fontSize: '13px', paddingBottom: '20px' },
    // Loading
    loadingScreen: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a0f1e, #0d1b2e)', gap: '16px' },
    spinner: { width: '44px', height: '44px', border: '3px solid rgba(96,165,250,0.2)', borderTop: '3px solid #60a5fa', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    loadingText: { color: '#64748b', fontSize: '16px', fontWeight: '500', margin: 0 },
    // Modal
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '20px' },
    modalContent: { background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', backdropFilter: 'blur(30px)', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflow: 'auto' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '28px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
    modalTitle: { fontSize: '24px', fontWeight: '800', color: '#f1f5f9', margin: 0 },
    modalClose: { background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer', padding: 0, width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', transition: 'background 0.15s, color 0.15s' },
    modalBody: { padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '24px' },
    detailRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' },
    detailLabel: { color: '#475569', fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px 0' },
    detailValue: { color: '#e2e8f0', fontSize: '15px', fontWeight: '600', margin: 0 },
    descriptionBox: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '18px 20px' },
    descriptionLabel: { color: '#475569', fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px 0' },
    descriptionText: { color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' },
    modalFooter: { display: 'flex', gap: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' },
    btnPrimary: { flex: 1, background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 20px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,0.3)', transition: 'transform 0.15s' },
    btnSecondary: { flex: 1, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 20px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'background 0.15s, color 0.15s' },
};

const keyframes = `@keyframes spin { to { transform: rotate(360deg); } }`;

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; }

.stat-card:hover { transform: translateY(-4px); }

.claim-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 48px rgba(0,0,0,0.5) !important;
    border-color: rgba(255,255,255,0.13) !important;
}

.card-btn:hover { transform: scale(1.04); }

.filter-btn:hover { background: rgba(255,255,255,0.1) !important; color: #e2e8f0 !important; }

.page-nav:hover { transform: scale(1.04); }
.page-num:hover { background: rgba(255,255,255,0.1) !important; color: #e2e8f0 !important; }

.primary-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(16,185,129,0.4) !important; }
.secondary-btn:hover { background: rgba(255,255,255,0.09) !important; color: #cbd5e1 !important; }

.modal-close:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }

@keyframes spin { to { transform: rotate(360deg); } }
`;
