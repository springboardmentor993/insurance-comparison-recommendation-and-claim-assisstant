import React, { useState, useEffect, useCallback } from 'react';

/**
 * NotificationCenter Component
 * - Displays claim approval/rejection notifications
 * - Real-time polling every 3 seconds
 * - Mark as read functionality
 * - Unread badge counter
 */
export default function NotificationCenter({ token, userId }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPanel, setShowPanel] = useState(false);

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        if (!token || !userId) return;

        try {
            setLoading(true);
            const res = await fetch(
                `http://localhost:8000/api/user/notifications?token=${token}&limit=20`
            );

            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unread_count || 0);
            } else if (res.status === 401) {
                console.warn('Unauthorized - token expired');
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [token, userId]);

    // Poll notifications every 3 seconds
    useEffect(() => {
        fetchNotifications();
        const pollInterval = setInterval(fetchNotifications, 3000);
        return () => clearInterval(pollInterval);
    }, [fetchNotifications]);

    const handleMarkAsRead = async (notificationId) => {
        try {
            const res = await fetch(
                `http://localhost:8000/api/notifications/${notificationId}/read?token=${token}`,
                { method: 'POST' }
            );

            if (res.ok) {
                // Update local state
                setNotifications(prev =>
                    prev.map(n =>
                        n.id === notificationId ? { ...n, status: 'read' } : n
                    )
                );
                setUnreadCount(Math.max(0, unreadCount - 1));
            }
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const getNotificationIcon = (type) => {
        if (!type) return '📢';
        const typeStr = type.toLowerCase();
        if (typeStr.includes('approved')) return '✅';
        if (typeStr.includes('rejected')) return '❌';
        if (typeStr.includes('document')) return '📋';
        return '📢';
    };

    const getNotificationColor = (type) => {
        if (!type) return '#f59e0b';
        const typeStr = type.toLowerCase();
        if (typeStr.includes('approved')) return '#10b981'; // green
        if (typeStr.includes('rejected')) return '#ef4444'; // red
        if (typeStr.includes('document')) return '#3b82f6'; // blue
        return '#f59e0b'; // amber
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return 'Just now';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div style={styles.container}>
            {/* Bell Icon Button */}
            <button
                onClick={() => setShowPanel(!showPanel)}
                style={styles.bellButton}
                title="Notifications"
            >
                🔔
                {unreadCount > 0 && (
                    <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {/* Notification Panel */}
            {showPanel && (
                <>
                    <div
                        style={styles.backdrop}
                        onClick={() => setShowPanel(false)}
                    />
                    <div style={styles.panel}>
                        {/* Header */}
                        <div style={styles.panelHeader}>
                            <h3 style={styles.panelTitle}>
                                💬 Notifications {unreadCount > 0 && `(${unreadCount})`}
                            </h3>
                            <button
                                onClick={() => setShowPanel(false)}
                                style={styles.closeBtn}
                                title="Close"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Notifications List */}
                        <div style={styles.notificationsList}>
                            {notifications.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <span style={styles.emptyIcon}>📭</span>
                                    <p style={styles.emptyText}>No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        style={{
                                            ...styles.notificationItem,
                                            background: notif.status === 'unread'
                                                ? 'rgba(59,130,246,0.08)'
                                                : 'transparent'
                                        }}
                                        onClick={() => notif.status === 'unread' && handleMarkAsRead(notif.id)}
                                    >
                                        {/* Icon */}
                                        <span
                                            style={{
                                                ...styles.notifIcon,
                                                color: getNotificationColor(notif.type)
                                            }}
                                        >
                                            {getNotificationIcon(notif.type)}
                                        </span>

                                        {/* Content */}
                                        <div style={styles.notifContent}>
                                            <p style={styles.notifTitle}>
                                                {notif.title}
                                                {notif.status === 'unread' && (
                                                    <span style={styles.unreadDot}>●</span>
                                                )}
                                            </p>
                                            <p style={styles.notifMessage}>{notif.message}</p>
                                            <p style={styles.notifTime}>
                                                {formatTime(notif.created_at)}
                                            </p>
                                        </div>

                                        {/* Action Button */}
                                        {notif.status === 'unread' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMarkAsRead(notif.id);
                                                }}
                                                style={styles.markReadBtn}
                                                title="Mark as read"
                                            >
                                                ✓
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div style={styles.panelFooter}>
                                <small style={styles.footerText}>
                                    Auto-refreshing every 3 seconds
                                </small>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

const styles = {
    container: {
        position: 'relative',
        display: 'inline-block',
    },
    bellButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '20px',
        position: 'relative',
        padding: '8px',
        transition: 'transform 0.2s',
        borderRadius: '8px',
    },
    badge: {
        position: 'absolute',
        top: '-4px',
        right: '-4px',
        background: '#ef4444',
        color: 'white',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        fontWeight: '700',
        border: '2px solid #1f2937',
    },
    backdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 998,
    },
    panel: {
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '12px',
        width: '380px',
        maxHeight: '500px',
        background: 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.95))',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '14px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 999,
    },
    panelHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    panelTitle: {
        margin: 0,
        color: '#e2e8f0',
        fontSize: '14px',
        fontWeight: '700',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: '#94a3b8',
        cursor: 'pointer',
        fontSize: '18px',
        padding: '4px 8px',
        borderRadius: '6px',
        transition: 'color 0.2s',
    },
    notificationsList: {
        flex: 1,
        overflowY: 'auto',
        padding: '8px',
    },
    emptyState: {
        textAlign: 'center',
        padding: '32px 20px',
        color: '#475569',
    },
    emptyIcon: {
        fontSize: '32px',
        display: 'block',
        marginBottom: '8px',
    },
    emptyText: {
        margin: 0,
        fontSize: '14px',
    },
    notificationItem: {
        padding: '12px 14px',
        marginBottom: '6px',
        borderRadius: '10px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        cursor: 'pointer',
        transition: 'background 0.2s',
        border: '1px solid rgba(255,255,255,0.04)',
    },
    notifIcon: {
        fontSize: '18px',
        flexShrink: 0,
        marginTop: '2px',
    },
    notifContent: {
        flex: 1,
        minWidth: 0,
    },
    notifTitle: {
        margin: '0 0 4px 0',
        color: '#e2e8f0',
        fontSize: '13px',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        justifyContent: 'space-between',
    },
    unreadDot: {
        color: '#3b82f6',
        fontSize: '12px',
    },
    notifMessage: {
        margin: '0 0 4px 0',
        color: '#cbd5e1',
        fontSize: '12px',
        lineHeight: 1.4,
    },
    notifTime: {
        margin: 0,
        color: '#64748b',
        fontSize: '11px',
    },
    markReadBtn: {
        background: 'rgba(59,130,246,0.2)',
        border: '1px solid rgba(59,130,246,0.3)',
        color: '#60a5fa',
        borderRadius: '6px',
        padding: '4px 8px',
        fontSize: '12px',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background 0.2s',
    },
    panelFooter: {
        padding: '8px 14px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        textAlign: 'center',
    },
    footerText: {
        color: '#64748b',
        fontSize: '11px',
    },
};
