import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import './MyClaims.css';

/**
 * User Claims Management Component
 * - View personal claims and status
 * - Real-time notifications about approvals/rejections
 * - Track claim progression
 */
export default function MyClaims({ token, user }) {
    const location = useLocation();
    const [claims, setClaims] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');
    const [highlightClaimId, setHighlightClaimId] = useState(null);

    // Fetch claims on mount and set up polling
    useEffect(() => {
        const loadClaims = async () => {
            try {
                setLoading(true);
                // Try direct claims API first, then fallback to user-policies
                let url = `http://localhost:8000/claims?token=${token}`;

                let res = await fetch(url);
                let data;

                if (res.ok) {
                    data = await res.json();
                    // If using direct claims endpoint
                    setClaims(data.claims || data);
                } else {
                    // Fallback to user-policies endpoint
                    url = `http://localhost:8000/user-policies?token=${token}`;
                    res = await fetch(url);
                    if (!res.ok) throw new Error('Failed to fetch claims');

                    data = await res.json();

                    // Extract claims from user policies
                    const allClaims = [];
                    if (data.user_policies) {
                        data.user_policies.forEach(policy => {
                            if (policy.claims) {
                                allClaims.push(...policy.claims);
                            }
                        });
                    }
                    setClaims(allClaims);
                }

                setError('');
            } catch (err) {
                setError(`Error loading claims: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        async function initPage() {
            await loadClaims();
            fetchMyNotifications();

            // Check if coming from notification - apply filters
            if (location.state?.filterStatus) {
                setFilterStatus(location.state.filterStatus);
            }
            if (location.state?.highlightClaimId) {
                setHighlightClaimId(location.state.highlightClaimId);
            }
        }

        initPage();

        // Poll for notifications every 2 seconds (faster update)
        const notificationInterval = setInterval(() => {
            fetchMyNotifications();
        }, 2000);

        // Also poll for claims every 3 seconds to get fresh status
        const claimsInterval = setInterval(() => {
            loadClaims();
        }, 3000);

        return () => {
            clearInterval(notificationInterval);
            clearInterval(claimsInterval);
        };
    }, [token]);

    const fetchMyNotifications = useCallback(async () => {
        try {
            const res = await fetch(
                `http://localhost:8000/api/user/notifications?token=${token}&limit=20`
            );

            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unread_count || 0);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    }, [token]);

    const markNotificationAsRead = useCallback(async (notificationId) => {
        try {
            await fetch(
                `http://localhost:8000/api/notifications/${notificationId}/read?token=${token}`,
                { method: 'POST' }
            );

            // Update local state
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId
                        ? { ...n, status: 'read' }
                        : n
                )
            );

            setUnreadCount(Math.max(0, unreadCount - 1));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    }, [token, unreadCount]);

    const getClaimStatusColor = (status) => {
        const colors = {
            draft: '#999',
            submitted: '#2196f3',
            under_review: '#ff9800',
            'under-review': '#ff9800',
            approved: '#4caf50',
            rejected: '#f44336',
            paid: '#00897b'
        };
        return colors[status] || '#999';
    };

    const getStatusIcon = (status) => {
        const icons = {
            draft: '📝',
            submitted: '📬',
            under_review: '👀',
            'under-review': '👀',
            approved: '✅',
            rejected: '❌',
            paid: '💰'
        };
        return icons[status] || '📋';
    };

    const filteredClaims = filterStatus
        ? claims.filter(c => c.status === filterStatus)
        : claims;

    if (loading) {
        return (
            <div className="my-claims-container">
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading your claims...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="my-claims-container">
            {/* Header with Notifications */}
            <div className="claims-header">
                <h1>📋 My Claims</h1>
                <div className="notification-bell">
                    <button
                        onClick={() => {
                            setShowNotifications(!showNotifications);
                            if (!showNotifications) {
                                fetchMyNotifications();
                            }
                        }}
                        className="bell-button"
                    >
                        🔔
                        {unreadCount > 0 && (
                            <span className="unread-badge">{unreadCount}</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="error-banner">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="close-btn">×</button>
                </div>
            )}

            {/* Notifications Dropdown */}
            {showNotifications && (
                <div className="notifications-panel">
                    <h3>Notifications ({unreadCount} unread)</h3>
                    {notifications.length === 0 ? (
                        <p className="no-notifications">No notifications yet</p>
                    ) : (
                        <div className="notifications-list">
                            {notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    className={`notification-item ${notif.status}`}
                                    onClick={() => {
                                        if (notif.status === 'unread') {
                                            markNotificationAsRead(notif.id);
                                        }
                                    }}
                                >
                                    <div className="notif-icon">
                                        {notif.type.includes('approved') ? '✅' : '❌'}
                                    </div>
                                    <div className="notif-content">
                                        <div className="notif-title">{notif.title}</div>
                                        <div className="notif-message">{notif.message}</div>
                                        <div className="notif-time">
                                            {new Date(notif.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                    {notif.status === 'unread' && (
                                        <div className="unread-dot"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Stats Summary */}
            <div className="claims-summary">
                <div className="summary-card">
                    <div className="summary-label">Total Claims</div>
                    <div className="summary-value">{claims.length}</div>
                </div>
                <div className="summary-card">
                    <div className="summary-label">Under Review</div>
                    <div className="summary-value">
                        {claims.filter(c => c.status === 'under_review' || c.status === 'under-review').length}
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-label">Approved</div>
                    <div className="summary-value">
                        {claims.filter(c => c.status === 'approved').length}
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-label">Rejected</div>
                    <div className="summary-value">
                        {claims.filter(c => c.status === 'rejected').length}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters">
                <label>Filter:</label>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Claims</option>
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="paid">Paid</option>
                </select>
            </div>

            {/* Claims List */}
            <div className="claims-list">
                {filteredClaims.length === 0 ? (
                    <div className="no-claims">
                        <p>No claims {filterStatus ? 'with that status' : 'yet'}</p>
                    </div>
                ) : (
                    filteredClaims.map(claim => (
                        <div
                            key={claim.id}
                            className={`claim-card ${highlightClaimId === claim.id ? 'highlight' : ''}`}
                            onClick={() => setSelectedClaim(selectedClaim?.id === claim.id ? null : claim)}
                            style={highlightClaimId === claim.id ? {
                                boxShadow: '0 0 15px rgba(76, 175, 80, 0.6)',
                                borderColor: '#4caf50',
                                borderWidth: '2px'
                            } : {}}
                        >
                            <div className="claim-header">
                                <div className="claim-info">
                                    <div className="claim-number">{claim.claim_number}</div>
                                    <div className="claim-description">{claim.claim_type}</div>
                                </div>
                                <div className="claim-status">
                                    <span
                                        className="status-badge"
                                        style={{ background: getClaimStatusColor(claim.status) }}
                                    >
                                        {getStatusIcon(claim.status)} {claim.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="claim-amount">
                                Amount Claimed: <strong>${parseFloat(claim.amount_claimed).toFixed(2)}</strong>
                            </div>

                            {selectedClaim?.id === claim.id && (
                                <div className="claim-details">
                                    <div className="detail-row">
                                        <label>Incident Date:</label>
                                        <span>{new Date(claim.incident_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Submitted:</label>
                                        <span>{new Date(claim.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Description:</label>
                                        <span>{claim.description || 'N/A'}</span>
                                    </div>

                                    {/* Display rejection reason if claim is rejected */}
                                    {claim.status === 'rejected' && claim.rejection_reason && (
                                        <div className="rejection-reason-section">
                                            <label>❌ Rejection Reason:</label>
                                            <div className="rejection-reason-text">{claim.rejection_reason}</div>
                                            <p className="rejection-note">Please review the mentioned documents and upload corrections as needed.</p>
                                        </div>
                                    )}

                                    {claim.documents && claim.documents.length > 0 && (
                                        <div className="documents-section">
                                            <label>Documents:</label>
                                            <ul>
                                                {claim.documents.map(doc => (
                                                    <li key={doc.id}>{doc.file_name}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
