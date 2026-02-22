import React, { useState, useEffect, useCallback } from 'react';
import './AdminReview.css';

/**
 * Enterprise Admin Claim Review Component
 * - Real-time dashboard stats with polling
 * - Transaction-safe approvals/rejections
 * - Audit trail visibility
 * - Bulk actions
 */
export default function AdminReview({ token }) {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        total_claims: 0,
        pending_claims: 0,
        approved_count: 0,
        rejected_count: 0
    });
    const [selectedClaims, setSelectedClaims] = useState(new Set());
    const [actionInProgress, setActionInProgress] = useState(null);
    const [filterStatus, setFilterStatus] = useState('under_review');
    const [showAuditLog, setShowAuditLog] = useState(false);
    const [auditLogs, setAuditLogs] = useState([]);

    // Polling interval for real-time updates
    useEffect(() => {
        fetchDashboardStats();
        fetchClaims();

        // Poll stats every 5 seconds
        const statsInterval = setInterval(() => {
            fetchDashboardStats();
        }, 5000);

        return () => clearInterval(statsInterval);
    }, [token, filterStatus]);

    const fetchDashboardStats = useCallback(async () => {
        try {
            const res = await fetch(
                `http://localhost:8000/api/admin/dashboard/stats?token=${token}`
            );
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats);
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    }, [token]);

    const fetchClaims = useCallback(async () => {
        try {
            setLoading(true);
            let url = `http://localhost:8000/admin/claims?token=${token}`;
            if (filterStatus) {
                url += `&status=${filterStatus}`;
            }

            const res = await fetch(url);
            if (!res.ok) throw new Error(`Failed: ${res.status}`);

            const data = await res.json();
            setClaims(data.claims || []);
            setError('');
        } catch (err) {
            setError(`Error loading claims: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [token, filterStatus]);

    const approveClaim = useCallback(async (claimId, reason = 'Approved') => {
        try {
            setActionInProgress(claimId);
            const res = await fetch(
                `http://localhost:8000/api/admin/claims/${claimId}/approve?token=${token}&reason=${encodeURIComponent(reason)}`,
                { method: 'POST' }
            );

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.detail || 'Approval failed');
            }

            // Refresh claims and stats
            await fetchClaims();
            await fetchDashboardStats();

        } catch (err) {
            setError(`Approval error: ${err.message}`);
        } finally {
            setActionInProgress(null);
        }
    }, [token, fetchClaims, fetchDashboardStats]);

    const rejectClaim = useCallback(async (claimId, reason) => {
        if (!reason || reason.trim() === '') {
            setError('Rejection reason is required');
            return;
        }

        try {
            setActionInProgress(claimId);
            const res = await fetch(
                `http://localhost:8000/api/admin/claims/${claimId}/reject?token=${token}&reason=${encodeURIComponent(reason)}`,
                { method: 'POST' }
            );

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.detail || 'Rejection failed');
            }

            // Refresh
            await fetchClaims();
            await fetchDashboardStats();

        } catch (err) {
            setError(`Rejection error: ${err.message}`);
        } finally {
            setActionInProgress(null);
        }
    }, [token, fetchClaims, fetchDashboardStats]);

    const fetchAuditLogs = useCallback(async () => {
        try {
            const res = await fetch(
                `http://localhost:8000/api/admin/audit-logs?token=${token}&limit=50`
            );
            if (res.ok) {
                const data = await res.json();
                setAuditLogs(data.logs);
            }
        } catch (err) {
            setError('Failed to fetch audit logs');
        }
    }, [token]);

    useEffect(() => {
        if (showAuditLog) {
            fetchAuditLogs();
        }
    }, [showAuditLog, fetchAuditLogs]);

    const handleSelectClaim = (claimId) => {
        const newSelected = new Set(selectedClaims);
        if (newSelected.has(claimId)) {
            newSelected.delete(claimId);
        } else {
            newSelected.add(claimId);
        }
        setSelectedClaims(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedClaims.size === claims.length) {
            setSelectedClaims(new Set());
        } else {
            setSelectedClaims(new Set(claims.map(c => c.id)));
        }
    };

    const handleBulkApprove = async () => {
        if (selectedClaims.size === 0) {
            setError('Select claims to approve');
            return;
        }

        for (const claimId of selectedClaims) {
            await approveClaim(claimId, 'Bulk approved');
        }
        setSelectedClaims(new Set());
    };

    if (loading) {
        return (
            <div className="admin-review-container">
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading claims...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-review-container">
            {/* Error Banner */}
            {error && (
                <div className="error-banner">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="close-btn">×</button>
                </div>
            )}

            {/* Dashboard Stats */}
            <div className="dashboard-stats">
                <div className="stat-card">
                    <div className="stat-label">Total Claims</div>
                    <div className="stat-value">{stats.total_claims}</div>
                </div>
                <div className="stat-card pending">
                    <div className="stat-label">Pending Review</div>
                    <div className="stat-value">{stats.pending_claims}</div>
                </div>
                <div className="stat-card approved">
                    <div className="stat-label">Approved</div>
                    <div className="stat-value">{stats.approved_count}</div>
                </div>
                <div className="stat-card rejected">
                    <div className="stat-label">Rejected</div>
                    <div className="stat-value">{stats.rejected_count}</div>
                </div>
            </div>

            {/* Controls */}
            <div className="controls-bar">
                <div className="filter-group">
                    <label>Filter by Status:</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Claims</option>
                        <option value="under_review">Pending Review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <div className="action-buttons">
                    <button
                        onClick={handleBulkApprove}
                        disabled={selectedClaims.size === 0}
                        className="btn btn-success"
                    >
                        Approve ({selectedClaims.size})
                    </button>
                    <button
                        onClick={() => setShowAuditLog(!showAuditLog)}
                        className="btn btn-secondary"
                    >
                        📋 Audit Log
                    </button>
                </div>
            </div>

            {/* Claims Table */}
            <div className="claims-table">
                <table>
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={selectedClaims.size === claims.length && claims.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th>Claim ID</th>
                            <th>Policy</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {claims.length === 0 ? (
                            <tr><td colSpan="7" className="no-data">No claims to review</td></tr>
                        ) : (
                            claims.map(claim => (
                                <tr key={claim.id} className={`status-${claim.status}`}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedClaims.has(claim.id)}
                                            onChange={() => handleSelectClaim(claim.id)}
                                        />
                                    </td>
                                    <td className="claim-id">{claim.claim_number}</td>
                                    <td>{claim.user_policy_id}</td>
                                    <td>${parseFloat(claim.amount_claimed).toFixed(2)}</td>
                                    <td>
                                        <span className={`badge badge-${claim.status}`}>
                                            {claim.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </td>
                                    <td>{new Date(claim.created_at).toLocaleDateString()}</td>
                                    <td className="actions">
                                        {claim.status === 'under_review' ? (
                                            <>
                                                <button
                                                    onClick={() => approveClaim(claim.id)}
                                                    disabled={actionInProgress === claim.id}
                                                    className="btn-small btn-approve"
                                                >
                                                    ✓ Approve
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const reason = prompt('Rejection reason:');
                                                        if (reason) {
                                                            rejectClaim(claim.id, reason);
                                                        }
                                                    }}
                                                    disabled={actionInProgress === claim.id}
                                                    className="btn-small btn-reject"
                                                >
                                                    ✕ Reject
                                                </button>
                                            </>
                                        ) : (
                                            <span className="read-only">
                                                {claim.status === 'approved' ? '✓ Reviewed' : '✕ Reviewed'}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Audit Log Section */}
            {showAuditLog && (
                <div className="audit-log-section">
                    <h3>Recent Admin Actions</h3>
                    <div className="audit-logs">
                        {auditLogs.length === 0 ? (
                            <p>No audit logs</p>
                        ) : (
                            <ul>
                                {auditLogs.map(log => (
                                    <li key={log.id} className="audit-entry">
                                        <div className="audit-header">
                                            <strong>{log.admin_email}</strong>
                                            <span className="action">{log.action.toUpperCase()}</span>
                                        </div>
                                        <div className="audit-time">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </div>
                                        {log.reason && <div>Reason: {log.reason}</div>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
