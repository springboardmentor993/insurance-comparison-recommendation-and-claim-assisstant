import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotificationsPanel({ token }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showPanel, setShowPanel] = useState(false);
    const navigate = useNavigate();

    // Fetch notifications on mount and periodically
    useEffect(() => {
        fetchNotifications();

        // Poll for new notifications every 5 seconds
        const interval = setInterval(() => {
            fetchNotifications();
        }, 5000);

        return () => clearInterval(interval);
    }, [token]);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch(
                `http://localhost:8000/api/user/notifications?token=${token}&limit=10&offset=0`
            );

            if (!res.ok) {
                throw new Error('Failed to fetch notifications');
            }

            const data = await res.json();
            if (data.status === 'success') {
                setNotifications(data.notifications || []);
                setUnreadCount(data.unread_count || 0);
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    }, [token]);

    const handleMarkAsRead = async (notificationId) => {
        try {
            const res = await fetch(
                `http://localhost:8000/api/notifications/${notificationId}/read?token=${token}`,
                { method: 'POST' }
            );

            if (res.ok) {
                // Update local state
                setNotifications(prev =>
                    prev.map(notif =>
                        notif.id === notificationId
                            ? { ...notif, status: 'read' }
                            : notif
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const handleNotificationClick = async (notification) => {
        // Mark as read if not already
        if (notification.status === 'unread') {
            await handleMarkAsRead(notification.id);
        }

        // Navigate to My Claims page with claim context
        navigate(`/claims`, {
            state: {
                highlightClaimId: notification.claim_id,
                filterStatus: notification.type.includes('approved') ? 'approved' : notification.type.includes('rejected') ? 'rejected' : 'under_review'
            }
        });
        setShowPanel(false);
    };

    const renderNotificationIcon = (type) => {
        switch (type) {
            case 'claim_approved':
                return '✅';
            case 'claim_rejected':
                return '❌';
            case 'document_approved':
                return '📄✅';
            case 'document_rejected':
                return '📄❌';
            default:
                return '📬';
        }
    };

    const getNotificationTitle = (type) => {
        switch (type) {
            case 'claim_approved':
                return 'Claim Approved!';
            case 'claim_rejected':
                return 'Claim Status Update';
            case 'document_approved':
                return 'Document Approved';
            case 'document_rejected':
                return 'Document Review';
            default:
                return 'Notification';
        }
    };

    return (
        <div style={styles.container}>
            {/* Notification Bell Icon */}
            <button
                onClick={() => setShowPanel(!showPanel)}
                style={styles.bellButton}
                title={`${unreadCount} new notifications`}
                className="notification-bell"
            >
                <span style={styles.bellIcon}>🔔</span>
                {unreadCount > 0 && (
                    <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {/* Notifications Panel */}
            {showPanel && (
                <div style={styles.panel} className="notifications-panel">
                    <div style={styles.panelHeader}>
                        <h3 style={styles.panelTitle}>Notifications</h3>
                        <button
                            onClick={() => setShowPanel(false)}
                            style={styles.closeBtn}
                            className="close-btn"
                        >
                            ✕
                        </button>
                    </div>

                    <div style={styles.panelBody}>
                        {loading ? (
                            <div style={styles.loadingState}>
                                <p>Loading...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div style={styles.emptyState}>
                                <span style={styles.emptyIcon}>📭</span>
                                <p style={styles.emptyText}>No notifications yet</p>
                            </div>
                        ) : (
                            <div style={styles.notificationsList}>
                                {notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        style={{
                                            ...styles.notificationItem,
                                            opacity: notification.status === 'read' ? 0.7 : 1,
                                            background: notification.status === 'unread'
                                                ? 'rgba(59,130,246,0.08)'
                                                : 'transparent'
                                        }}
                                        className="notification-item"
                                    >
                                        <span style={styles.notificationIcon}>
                                            {renderNotificationIcon(notification.type)}
                                        </span>

                                        <div style={styles.notificationContent}>
                                            <p style={styles.notificationTitle}>
                                                {notification.title}
                                            </p>
                                            <p style={styles.notificationMessage}>
                                                {notification.message}
                                            </p>
                                            <p style={styles.notificationTime}>
                                                {new Date(notification.created_at).toLocaleDateString()} • Claim #{notification.claim_id}
                                            </p>
                                        </div>

                                        {notification.status === 'unread' && (
                                            <span style={styles.unreadDot} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div style={styles.panelFooter}>
                            <button
                                onClick={() => navigate('/claims', { state: { filterStatus: 'approved,rejected' } })}
                                style={styles.viewAllBtn}
                                className="view-all-btn"
                            >
                                View All Claims →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        position: 'relative',
    },
    bellButton: {
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        padding: '8px',
        position: 'relative',
        transition: 'transform 0.2s',
        borderRadius: '50%',
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bellIcon: {
        display: 'block',
        animation: 'pulse 2s infinite',
    },
    badge: {
        position: 'absolute',
        top: '0',
        right: '0',
        background: '#ef4444',
        color: 'white',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        fontWeight: 'bold',
        border: '2px solid #f5f0e8',
    },
    panel: {
        position: 'fixed',
        top: '70px',
        right: '20px',
        width: 'clamp(300px, 90vw, 420px)',
        background: '#ffffff',
        border: '1px solid #e5ddd0',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
        zIndex: '9999',
        maxHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideDown 0.3s ease',
    },
    panelHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '18px 20px',
        borderBottom: '1px solid #f0e8e0',
        background: 'linear-gradient(135deg, #f5f0e8 0%, #faf7f0 100%)',
    },
    panelTitle: {
        margin: 0,
        fontSize: '18px',
        fontWeight: '700',
        color: '#1a1a2e',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        color: '#6b6560',
        padding: '4px',
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        transition: 'background 0.2s, color 0.2s',
    },
    panelBody: {
        flex: 1,
        overflowY: 'auto',
        padding: '12px 0',
    },
    loadingState: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        color: '#6b6560',
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        color: '#9b938a',
    },
    emptyIcon: {
        fontSize: '36px',
        marginBottom: '8px',
    },
    emptyText: {
        margin: 0,
        fontSize: '14px',
        fontWeight: '500',
    },
    notificationsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
    },
    notificationItem: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 16px',
        borderBottom: '1px solid #f0e8e0',
        cursor: 'pointer',
        transition: 'background 0.2s',
        position: 'relative',
    },
    notificationIcon: {
        fontSize: '20px',
        flexShrink: 0,
        marginTop: '2px',
    },
    notificationContent: {
        flex: 1,
        minWidth: 0,
    },
    notificationTitle: {
        margin: '0 0 4px 0',
        fontSize: '14px',
        fontWeight: '600',
        color: '#1a1a2e',
        lineHeight: 1.3,
    },
    notificationMessage: {
        margin: '0 0 6px 0',
        fontSize: '13px',
        color: '#6b6560',
        lineHeight: 1.4,
        wordWrap: 'break-word',
    },
    notificationTime: {
        margin: 0,
        fontSize: '11px',
        color: '#9b938a',
        fontWeight: '500',
    },
    unreadDot: {
        width: '8px',
        height: '8px',
        background: '#60a5fa',
        borderRadius: '50%',
        flexShrink: 0,
        marginTop: '6px',
    },
    panelFooter: {
        padding: '12px 16px',
        borderTop: '1px solid #f0e8e0',
        background: '#faf7f0',
        borderRadius: '0 0 16px 16px',
    },
    viewAllBtn: {
        width: '100%',
        background: 'linear-gradient(135deg, #2d6be4 0%, #2563eb 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        padding: '10px 16px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        fontFamily: "'DM Sans', sans-serif",
    },
};

const globalStyles = `
@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.6;
    }
}

.notification-bell:hover {
    transform: scale(1.1);
    background: rgba(45,107,228,0.1);
}

.notifications-panel::-webkit-scrollbar {
    width: 6px;
}

.notifications-panel::-webkit-scrollbar-track {
    background: #f5f0e8;
}

.notifications-panel::-webkit-scrollbar-thumb {
    background: #d4c9bf;
    border-radius: 3px;
}

.notifications-panel::-webkit-scrollbar-thumb:hover {
    background: #c4b5a8;
}

.notification-item:hover {
    background: rgba(45,107,228,0.05) !important;
}

.close-btn:hover {
    background: rgba(0,0,0,0.08);
    color: #1a1a2e;
}

.view-all-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(45,107,228,0.3);
}
`;

// Inject global styles
if (!document.getElementById('notifications-panel-styles')) {
    const styleTag = document.createElement('style');
    styleTag.id = 'notifications-panel-styles';
    styleTag.innerHTML = globalStyles;
    document.head.appendChild(styleTag);
}
