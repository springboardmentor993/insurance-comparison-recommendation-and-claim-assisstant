import React, { useState, useEffect, useRef } from 'react';

/**
 * Notification Bell Component
 * - Shows unread notification count
 * - Displays notification dropdown
 * - Real-time polling for new notifications
 */
export default function NotificationBell({ token, user }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch notifications
    const fetchNotifications = React.useCallback(async () => {
        if (!token) return;

        try {
            setLoading(true);
            const res = await fetch(
                `http://localhost:8000/api/user/notifications?token=${token}&limit=10`
            );

            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unread_count || 0);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Fetch on mount and set up polling
    useEffect(() => {
        fetchNotifications();

        // Poll every 3 seconds
        const pollInterval = setInterval(fetchNotifications, 3000);

        return () => clearInterval(pollInterval);
    }, [fetchNotifications]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (notificationId) => {
        try {
            const res = await fetch(
                `http://localhost:8000/api/notifications/${notificationId}/read?token=${token}`,
                { method: 'POST' }
            );

            if (res.ok) {
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

    const notificationStatusStyles = {
        container: {
            position: 'relative',
            display: 'inline-block'
        },
        bellButton: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            position: 'relative',
            padding: '8px',
            transition: 'transform 0.2s'
        },
        badge: {
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            background: '#dc2626',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold'
        },
        dropdown: {
            position: 'absolute',
            top: '100%',
            right: 0,
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            minWidth: '350px',
            maxWidth: '450px',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 50,
            marginTop: '8px'
        },
        dropdownHeader: {
            padding: '12px 16px',
            borderBottom: '1px solid #e5e7eb',
            fontWeight: '600',
            fontSize: '14px',
            color: '#1f2937',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            background: 'white'
        },
        notificationItem: (isRead) => ({
            padding: '12px 16px',
            borderBottom: '1px solid #f3f4f6',
            cursor: 'pointer',
            background: isRead ? '#ffffff' : '#f0f9ff',
            transition: 'background 0.2s',
            '&:hover': {
                background: '#f9fafb'
            }
        }),
        notificationTitle: {
            fontWeight: '600',
            fontSize: '13px',
            color: '#1f2937',
            marginBottom: '4px'
        },
        notificationMessage: {
            fontSize: '12px',
            color: '#6b7280',
            lineHeight: '1.4',
            marginBottom: '6px'
        },
        notificationTime: {
            fontSize: '11px',
            color: '#9ca3af'
        },
        notificationBadge: (status) => ({
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '600',
            background: status === 'unread' ? '#fed7aa' : '#dbeafe',
            color: status === 'unread' ? '#92400e' : '#1e40af',
            marginTop: '4px'
        }),
        emptyState: {
            padding: '32px 16px',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '13px'
        },
        clearButton: {
            padding: '6px 12px',
            fontSize: '12px',
            background: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background 0.2s'
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;

            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch {
            return dateString;
        }
    };

    return (
        <div style={notificationStatusStyles.container} ref={dropdownRef}>
            <button
                style={notificationStatusStyles.bellButton}
                onClick={() => setShowDropdown(!showDropdown)}
                title="Notifications"
                onMouseEnter={(e) => (e.target.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
            >
                🔔
                {unreadCount > 0 && (
                    <div style={notificationStatusStyles.badge}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                )}
            </button>

            {showDropdown && (
                <div style={notificationStatusStyles.dropdown}>
                    <div style={notificationStatusStyles.dropdownHeader}>
                        <span>
                            Notifications {unreadCount > 0 && `(${unreadCount})`}
                        </span>
                        <button
                            style={notificationStatusStyles.clearButton}
                            onClick={() => setShowDropdown(false)}
                            title="Close"
                        >
                            ✕
                        </button>
                    </div>

                    {notifications.length === 0 ? (
                        <div style={notificationStatusStyles.emptyState}>
                            {loading ? 'Loading notifications...' : 'No notifications yet'}
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                style={notificationStatusStyles.notificationItem(notification.status === 'read')}
                                onClick={() => {
                                    if (notification.status === 'unread') {
                                        handleMarkAsRead(notification.id);
                                    }
                                }}
                            >
                                <div style={notificationStatusStyles.notificationTitle}>
                                    {notification.title}
                                </div>
                                <div style={notificationStatusStyles.notificationMessage}>
                                    {notification.message}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={notificationStatusStyles.notificationTime}>
                                        {formatDate(notification.created_at)}
                                    </span>
                                    {notification.status === 'unread' && (
                                        <span style={{
                                            display: 'inline-block',
                                            width: '8px',
                                            height: '8px',
                                            background: '#3b82f6',
                                            borderRadius: '50%'
                                        }} />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
