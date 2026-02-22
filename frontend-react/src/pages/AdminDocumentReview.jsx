import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DocumentPreviewModal from '../components/DocumentPreviewModal';

export default function AdminDocumentReview({ token: propToken }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [approvalState, setApprovalState] = useState({}); // Track button states per document
    const [searchClaimNumber, setSearchClaimNumber] = useState(''); // Filter by claim number
    const navigate = useNavigate();
    const location = useLocation();

    const token = propToken || localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const itemsPerPage = 20;

    useEffect(() => {
        if (!user.is_admin && user.role !== 'admin') {
            navigate('/home');
        }
    }, [navigate, user]);

    // Apply claim filter from location state
    useEffect(() => {
        if (location.state?.claimNumber) {
            setSearchClaimNumber(location.state.claimNumber);
        }
    }, [location.state]);

    // Fetch documents when page, token, search, or filter changes
    useEffect(() => {
        if (token) {
            fetchDocuments();
        }
    }, [currentPage, token, searchClaimNumber, selectedFilter]);

    // Reset to page 1 when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchClaimNumber, selectedFilter]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            setError('');

            // Verify token exists before making request
            if (!token) {
                setError('Authentication token missing. Please log in again.');
                setLoading(false);
                navigate('/login');
                return;
            }

            const skip = (currentPage - 1) * itemsPerPage;

            // Build URL with claim_number filter if searching
            let url = `http://localhost:8000/admin/claim-documents-list?token=${token}&skip=${skip}&limit=${itemsPerPage}`;
            if (searchClaimNumber.trim()) {
                url += `&claim_number=${encodeURIComponent(searchClaimNumber.trim())}`;
            }

            const res = await fetch(url);

            if (!res.ok) {
                let errorMsg = `Failed to fetch documents: ${res.status} ${res.statusText}`;
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
                setDocuments(data.data.documents || []);
                setTotalCount(data.data.total_count || 0);
            } else {
                throw new Error(data.message || 'Failed to fetch documents');
            }
        } catch (err) {
            setError(err.message);
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (fileType) => {
        if (!fileType || typeof fileType !== 'string') return '📁';
        const lowerType = fileType.toLowerCase();
        if (lowerType.includes('pdf')) return '📄';
        if (lowerType.includes('image') || lowerType.includes('jpeg') || lowerType.includes('png') || lowerType.includes('gif')) return '🖼️';
        if (lowerType.includes('video') || lowerType.includes('mp4') || lowerType.includes('avi')) return '🎥';
        if (lowerType.includes('word') || lowerType.includes('document') || lowerType.includes('docx')) return '📋';
        if (lowerType.includes('sheet') || lowerType.includes('excel') || lowerType.includes('xlsx')) return '📊';
        return '📁';
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleApproveDocument = async (docId) => {
        if (window.confirm('Are you sure you want to approve this document?')) {
            try {
                setApprovalState(prev => ({ ...prev, [docId]: 'loading' }));
                setError(''); // Clear previous errors

                if (!token) {
                    throw new Error('Authentication token missing. Please log in again.');
                }

                const res = await fetch(
                    `http://localhost:8000/admin/documents/${docId}/approve?token=${token}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    }
                );

                if (!res.ok) {
                    let errorMsg = `Failed to approve document (Error ${res.status})`;
                    try {
                        const errorData = await res.json();
                        if (errorData.detail) {
                            errorMsg = errorData.detail;
                        }
                    } catch (parseErr) {
                        // Response wasn't JSON, use default error
                    }

                    setApprovalState(prev => ({ ...prev, [docId]: 'error' }));
                    setError(errorMsg);
                    console.error('Approve failed:', errorMsg);
                    return;
                }

                // Update document status locally
                setDocuments(prevDocs =>
                    prevDocs.map(doc =>
                        doc.id === docId ? { ...doc, approval_status: 'approved' } : doc
                    )
                );
                setApprovalState(prev => ({ ...prev, [docId]: 'approved' }));

                // Auto-hide this document after a short delay
                setTimeout(() => {
                    setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== docId));
                }, 1500);
            } catch (err) {
                console.error('Approve error:', err);
                setApprovalState(prev => ({ ...prev, [docId]: 'error' }));
                setError('Error approving document: ' + (err.message || 'Unknown error'));
            }
        }
    };

    const handleRejectDocument = async (docId) => {
        const reason = prompt('Enter rejection reason (required):');
        if (reason === null) return; // User cancelled

        if (!reason.trim()) {
            alert('❌ Rejection reason is required');
            return;
        }

        try {
            setApprovalState(prev => ({ ...prev, [docId]: 'loading' }));
            setError(''); // Clear previous errors

            if (!token) {
                throw new Error('Authentication token missing. Please log in again.');
            }

            const reasonParam = `&reason=${encodeURIComponent(reason)}`;
            const res = await fetch(
                `http://localhost:8000/admin/documents/${docId}/reject?token=${token}${reasonParam}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            if (!res.ok) {
                let errorMsg = `Failed to reject document (Error ${res.status})`;
                try {
                    const errorData = await res.json();
                    if (errorData.detail) {
                        errorMsg = errorData.detail;
                    }
                } catch (parseErr) {
                    // Response wasn't JSON, use default error
                }

                setApprovalState(prev => ({ ...prev, [docId]: 'error' }));
                setError(errorMsg);
                console.error('Reject failed:', errorMsg);
                return;
            }

            // Update document status locally
            setDocuments(prevDocs =>
                prevDocs.map(doc =>
                    doc.id === docId ? { ...doc, approval_status: 'rejected' } : doc
                )
            );
            setApprovalState(prev => ({ ...prev, [docId]: 'rejected' }));

            // Auto-hide this document after a short delay
            setTimeout(() => {
                setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== docId));
            }, 1500);
        } catch (err) {
            console.error('Reject error:', err);
            setApprovalState(prev => ({ ...prev, [docId]: 'error' }));
            setError('Error rejecting document: ' + (err.message || 'Unknown error'));
        }
    };

    const filteredDocuments = documents.filter(doc => {
        // File type filtering (backend handles claim number filtering now)
        const docType = doc?.file_type || '';
        const lowerDocType = docType.toLowerCase();
        if (selectedFilter === 'All') return true;
        if (selectedFilter === 'PDF') return lowerDocType.includes('pdf');
        if (selectedFilter === 'Images') return lowerDocType.includes('image') || lowerDocType.includes('jpeg') || lowerDocType.includes('png');
        if (selectedFilter === 'Videos') return lowerDocType.includes('video') || lowerDocType.includes('mp4');
        return true;
    });

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const handleViewDocument = (doc) => {
        if (!doc?.id) { console.error('Invalid document: missing ID'); return; }
        setSelectedDocument(doc);
        setIsPreviewOpen(true);
    };

    const handleClosePreview = () => {
        setIsPreviewOpen(false);
        setSelectedDocument(null);
    };

    if (loading && documents.length === 0) {
        return (
            <div style={styles.loadingScreen}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Loading documents...</p>
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
                    <div style={styles.headerBadge}>📂 Document Management</div>
                    <h1 style={styles.headerTitle}>Document Review</h1>
                    <p style={styles.headerSub}>View and manage all uploaded claim documents</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={styles.errorBox}>
                        <span style={styles.errorIcon}>⚠️</span>
                        <div>
                            <p style={styles.errorText}><strong>Error:</strong> {error}</p>
                            <button onClick={fetchDocuments} style={styles.retryBtn}>Try Again →</button>
                        </div>
                    </div>
                )}

                {/* Stats Bar */}
                <div style={styles.statsGrid}>
                    {[
                        { label: "Total Documents", value: totalCount, icon: "📁", accent: "#38bdf8", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.25)" },
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
                    <span style={styles.filterLabel}>Filter by type:</span>
                    <div style={styles.filterBtns}>
                        {['All', 'PDF', 'Images', 'Videos'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setSelectedFilter(filter)}
                                style={selectedFilter === filter ? styles.filterBtnActive : styles.filterBtnIdle}
                                className="filter-btn"
                            >
                                {filter === 'All' && '🗂️ '}
                                {filter === 'PDF' && '📄 '}
                                {filter === 'Images' && '🖼️ '}
                                {filter === 'Videos' && '🎥 '}
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search by Claim Number */}
                <div style={styles.filterCard}>
                    <span style={styles.filterLabel}>Search by claim:</span>
                    <input
                        type="text"
                        placeholder="Enter claim number (e.g., CLM-3A6D4684 or just 3A6D4684)"
                        value={searchClaimNumber}
                        onChange={(e) => setSearchClaimNumber(e.target.value)}
                        style={styles.searchInput}
                    />
                    {searchClaimNumber && (
                        <button
                            onClick={() => setSearchClaimNumber('')}
                            style={styles.clearSearchBtn}
                        >
                            ✕ Clear Search
                        </button>
                    )}
                </div>

                {/* Documents Grid */}
                {filteredDocuments.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>📭</div>
                        <p style={styles.emptyText}>No documents found</p>
                        <p style={styles.emptySubText}>Try changing your filter or check back later</p>
                    </div>
                ) : (
                    <div style={styles.docsGrid}>
                        {filteredDocuments.map(doc => (
                            <div key={doc.id} style={styles.docCard} className="doc-card">
                                {/* Card Header */}
                                <div style={styles.docCardHeader}>
                                    <span style={styles.docFileIcon}>{getFileIcon(doc?.file_type)}</span>
                                    <div style={styles.docCardHeaderText}>
                                        <p style={styles.docFileName}>{doc?.file_name || 'Unnamed Document'}</p>
                                        <p style={styles.docType}>{doc?.doc_type || 'Unknown Type'}</p>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div style={styles.docCardBody}>
                                    <div style={styles.docMeta}>
                                        <div style={styles.docMetaItem}>
                                            <span style={styles.docMetaLabel}>📋 CLAIM</span>
                                            <span style={{ ...styles.docMetaValue, color: '#38bdf8', fontWeight: 'bold' }}>
                                                {doc?.claim_number ? `#${doc.claim_number}` : `ID: ${doc?.claim_id || 'N/A'}`}
                                            </span>
                                        </div>
                                        <div style={styles.docMetaItem}>
                                            <span style={styles.docMetaLabel}>STATUS</span>
                                            <span style={{ ...styles.docMetaValue, color: doc?.claim_status === 'approved' ? '#34d399' : doc?.claim_status === 'rejected' ? '#f87171' : '#fb923c' }}>
                                                {doc?.claim_status ? doc.claim_status.toUpperCase() : 'UNKNOWN'}
                                            </span>
                                        </div>
                                        <div style={styles.docMetaItem}>
                                            <span style={styles.docMetaLabel}>FILE TYPE</span>
                                            <span style={styles.docMetaValue}>{doc?.file_type || 'Unknown'}</span>
                                        </div>
                                        <div style={styles.docMetaItem}>
                                            <span style={styles.docMetaLabel}>FILE SIZE</span>
                                            <span style={styles.docMetaValue}>
                                                {doc?.file_size_bytes ? formatFileSize(doc.file_size_bytes) : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div style={styles.docCardFooter}>
                                    <button onClick={() => handleViewDocument(doc)} style={styles.btnView} className="card-btn" title="View document preview">
                                        👁️ View
                                    </button>
                                    <button
                                        onClick={() => handleApproveDocument(doc.id)}
                                        style={
                                            approvalState[doc.id] === 'approved' || approvalState[doc.id] === 'error'
                                                ? { ...styles.btnApprove, opacity: 0.5, cursor: 'not-allowed' }
                                                : styles.btnApprove
                                        }
                                        disabled={approvalState[doc.id] === 'approved' || approvalState[doc.id] === 'error' || !token}
                                        className="card-btn"
                                        title={!token ? 'Please log in' : approvalState[doc.id] === 'error' ? 'Error occurred - try again' : 'Approve this document'}
                                    >
                                        {approvalState[doc.id] === 'loading' ? '⏳ Processing...' : approvalState[doc.id] === 'approved' ? '✓ Approved' : '✓ Approve'}
                                    </button>
                                    <button
                                        onClick={() => handleRejectDocument(doc.id)}
                                        style={
                                            approvalState[doc.id] === 'rejected' || approvalState[doc.id] === 'error'
                                                ? { ...styles.btnReject, opacity: 0.5, cursor: 'not-allowed' }
                                                : styles.btnReject
                                        }
                                        disabled={approvalState[doc.id] === 'rejected' || approvalState[doc.id] === 'error' || !token}
                                        className="card-btn"
                                        title={!token ? 'Please log in' : approvalState[doc.id] === 'error' ? 'Error occurred - try again' : 'Reject this document'}
                                    >
                                        {approvalState[doc.id] === 'loading' ? '⏳ Processing...' : approvalState[doc.id] === 'rejected' ? '✕ Rejected' : '✕ Reject'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={styles.pagination}>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            style={currentPage === 1 ? styles.pageNavDisabled : styles.pageNav}
                            className="page-nav"
                        >
                            ← Previous
                        </button>

                        <div style={styles.pageNumbers}>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) pageNum = i + 1;
                                else if (currentPage <= 3) pageNum = i + 1;
                                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                else pageNum = currentPage - 2 + i;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        style={currentPage === pageNum ? styles.pageNumActive : styles.pageNum}
                                        className="page-num"
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            style={currentPage === totalPages ? styles.pageNavDisabled : styles.pageNav}
                            className="page-nav"
                        >
                            Next →
                        </button>
                    </div>
                )}

                {/* Info */}
                <div style={styles.infoBar}>
                    Showing <strong style={{ color: '#94a3b8' }}>{Math.min(itemsPerPage, filteredDocuments.length)}</strong> of <strong style={{ color: '#94a3b8' }}>{totalCount}</strong> documents
                </div>
            </div>

            {/* Document Preview Modal */}
            {selectedDocument && (
                <DocumentPreviewModal
                    isOpen={isPreviewOpen}
                    onClose={handleClosePreview}
                    documentId={selectedDocument?.id}
                    documentName={selectedDocument?.file_name}
                    documentType={selectedDocument?.file_type}
                    token={token}
                />
            )}
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
        position: 'fixed', top: '-120px', right: '-80px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.11) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
    },
    blob2: {
        position: 'fixed', bottom: '-100px', left: '-120px',
        width: '550px', height: '550px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.09) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
    },
    blob3: {
        position: 'fixed', top: '45%', left: '48%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0, transform: 'translate(-50%,-50%)',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
    },
    // Header
    header: { marginBottom: '44px' },
    headerBadge: {
        display: 'inline-block',
        background: 'rgba(59,130,246,0.15)',
        border: '1px solid rgba(59,130,246,0.3)',
        color: '#60a5fa',
        fontSize: '13px', fontWeight: '600',
        letterSpacing: '0.08em',
        padding: '6px 14px',
        borderRadius: '20px',
        marginBottom: '14px',
    },
    headerTitle: {
        fontSize: '46px', fontWeight: '800',
        background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        margin: '0 0 10px 0', letterSpacing: '-1px', lineHeight: 1.1,
    },
    headerSub: { color: '#64748b', fontSize: '16px', margin: 0 },
    // Error
    errorBox: {
        display: 'flex', alignItems: 'flex-start', gap: '14px',
        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: '14px', padding: '18px 22px', marginBottom: '28px',
    },
    errorIcon: { fontSize: '22px', flexShrink: 0 },
    errorText: { color: '#fca5a5', fontSize: '14px', margin: '0 0 8px 0' },
    retryBtn: {
        background: 'none', border: 'none', color: '#60a5fa',
        fontWeight: '700', fontSize: '13px', cursor: 'pointer', padding: 0,
        letterSpacing: '0.04em',
    },
    // Stats
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '18px', marginBottom: '24px',
    },
    statCard: {
        borderRadius: '16px', padding: '24px 22px',
        border: '1px solid', position: 'relative', overflow: 'hidden',
        backdropFilter: 'blur(10px)', transition: 'transform 0.2s ease',
    },
    statIcon: { fontSize: '24px', marginBottom: '10px', display: 'block' },
    statLabel: {
        color: '#94a3b8', fontSize: '11px', fontWeight: '600',
        letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 4px 0',
    },
    statValue: { fontSize: '38px', fontWeight: '800', margin: 0, letterSpacing: '-1px', lineHeight: 1 },
    statGlow: {
        position: 'absolute', bottom: '-30px', right: '-30px',
        width: '90px', height: '90px', borderRadius: '50%',
        opacity: 0.08, filter: 'blur(20px)',
    },
    // Filter
    filterCard: {
        display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
        background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '14px', padding: '18px 24px', marginBottom: '24px',
        backdropFilter: 'blur(20px)',
    },
    filterLabel: { color: '#64748b', fontSize: '13px', fontWeight: '600', letterSpacing: '0.06em', flexShrink: 0 },
    filterBtns: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
    filterBtnActive: {
        background: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
        color: '#fff', border: 'none',
        padding: '8px 18px', borderRadius: '8px',
        fontWeight: '700', fontSize: '13px', cursor: 'pointer',
        boxShadow: '0 4px 14px rgba(109,40,217,0.4)',
        transition: 'transform 0.15s',
    },
    filterBtnIdle: {
        background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '8px 18px', borderRadius: '8px',
        fontWeight: '600', fontSize: '13px', cursor: 'pointer',
        transition: 'background 0.15s, color 0.15s',
    },
    searchInput: {
        flex: 1, minWidth: '250px', maxWidth: '400px',
        background: 'rgba(255,255,255,0.08)', color: '#e2e8f0',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px',
        padding: '10px 14px', fontSize: '13px', fontWeight: '500',
        transition: 'border-color 0.15s, background 0.15s',
        fontFamily: 'inherit',
    },
    clearSearchBtn: {
        background: 'rgba(239,68,68,0.15)', color: '#fca5a5',
        border: '1px solid rgba(239,68,68,0.3)',
        padding: '8px 14px', borderRadius: '8px',
        fontWeight: '600', fontSize: '13px', cursor: 'pointer',
        transition: 'background 0.15s, color 0.15s',
    },
    // Docs grid
    docsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px', marginBottom: '32px',
    },
    docCard: {
        background: 'rgba(15,23,42,0.75)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '18px', overflow: 'hidden',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        display: 'flex', flexDirection: 'column',
    },
    docCardHeader: {
        padding: '20px 20px 16px',
        background: 'linear-gradient(135deg, rgba(109,40,217,0.12), rgba(59,130,246,0.10))',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: '14px',
    },
    docFileIcon: { fontSize: '34px', flexShrink: 0 },
    docCardHeaderText: { flex: 1, minWidth: 0 },
    docFileName: {
        color: '#e2e8f0', fontWeight: '700', fontSize: '14px',
        margin: '0 0 4px 0',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    },
    docType: { color: '#64748b', fontSize: '12px', margin: 0, textTransform: 'capitalize' },
    docCardBody: { padding: '18px 20px', flex: 1 },
    docMeta: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
    docMetaItem: { display: 'flex', flexDirection: 'column', gap: '3px' },
    docMetaLabel: {
        color: '#475569', fontSize: '10px', fontWeight: '700',
        letterSpacing: '0.1em', textTransform: 'uppercase',
    },
    docMetaValue: { color: '#cbd5e1', fontSize: '13px', fontWeight: '600' },
    docCardFooter: {
        padding: '14px 20px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(0,0,0,0.2)',
        display: 'flex', gap: '10px',
    },
    btnView: {
        flex: 1, background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
        color: '#fff', border: 'none', borderRadius: '8px',
        padding: '9px 8px', fontWeight: '700', fontSize: '13px',
        cursor: 'pointer', boxShadow: '0 3px 12px rgba(37,99,235,0.35)',
        transition: 'transform 0.15s, box-shadow 0.15s',
    },
    btnApprove: {
        flex: 1, background: 'linear-gradient(135deg, #059669, #10b981)',
        color: '#fff', border: 'none', borderRadius: '8px',
        padding: '9px 8px', fontWeight: '700', fontSize: '13px',
        cursor: 'pointer', boxShadow: '0 3px 12px rgba(16,185,129,0.3)',
        transition: 'transform 0.15s',
    },
    btnReject: {
        flex: 1, background: 'linear-gradient(135deg, #b91c1c, #dc2626)',
        color: '#fff', border: 'none', borderRadius: '8px',
        padding: '9px 8px', fontWeight: '700', fontSize: '13px',
        cursor: 'pointer', boxShadow: '0 3px 12px rgba(220,38,38,0.3)',
        transition: 'transform 0.15s',
    },
    // Empty
    emptyState: {
        background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '20px', padding: '64px 32px', textAlign: 'center',
        backdropFilter: 'blur(20px)', marginBottom: '24px',
    },
    emptyIcon: { fontSize: '48px', marginBottom: '14px' },
    emptyText: { color: '#94a3b8', fontSize: '18px', fontWeight: '600', margin: '0 0 6px 0' },
    emptySubText: { color: '#475569', fontSize: '14px', margin: 0 },
    // Pagination
    pagination: {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '12px', marginBottom: '24px', flexWrap: 'wrap',
    },
    pageNav: {
        background: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
        color: '#fff', border: 'none', borderRadius: '10px',
        padding: '10px 22px', fontWeight: '700', fontSize: '14px',
        cursor: 'pointer', boxShadow: '0 4px 16px rgba(109,40,217,0.4)',
        transition: 'transform 0.15s',
    },
    pageNavDisabled: {
        background: 'rgba(255,255,255,0.05)',
        color: '#475569', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '10px', padding: '10px 22px',
        fontWeight: '700', fontSize: '14px', cursor: 'not-allowed',
    },
    pageNumbers: { display: 'flex', gap: '8px' },
    pageNumActive: {
        background: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
        color: '#fff', border: 'none', borderRadius: '8px',
        width: '40px', height: '40px', fontWeight: '700', fontSize: '14px',
        cursor: 'pointer', boxShadow: '0 4px 14px rgba(109,40,217,0.4)',
    },
    pageNum: {
        background: 'rgba(255,255,255,0.05)',
        color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px', width: '40px', height: '40px',
        fontWeight: '600', fontSize: '14px', cursor: 'pointer',
        transition: 'background 0.15s',
    },
    // Info
    infoBar: {
        textAlign: 'center', color: '#475569',
        fontSize: '13px', paddingBottom: '20px',
    },
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
    loadingText: { color: '#64748b', fontSize: '16px', fontWeight: '500', margin: 0 },
};

const keyframes = `@keyframes spin { to { transform: rotate(360deg); } }`;

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; }

.stat-card:hover { transform: translateY(-4px); }

.doc-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 48px rgba(0,0,0,0.5) !important;
    border-color: rgba(255,255,255,0.13) !important;
}

.card-btn:hover { transform: scale(1.04); }

.filter-btn:hover { background: rgba(255,255,255,0.1) !important; color: #e2e8f0 !important; }

.page-nav:hover { transform: scale(1.04); }
.page-num:hover { background: rgba(255,255,255,0.1) !important; color: #e2e8f0 !important; }

@keyframes spin { to { transform: rotate(360deg); } }
`;
