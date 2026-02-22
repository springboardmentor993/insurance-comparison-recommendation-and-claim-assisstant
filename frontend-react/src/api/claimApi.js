/**
 * Enterprise Claim Management - API Integration Examples
 * Complete guide to integrating the new claim approval workflow
 */

// ==================== CONFIGURATION ====================

const API_BASE = 'http://localhost:8000';

// Get token from localStorage (set during login)
const getToken = () => localStorage.getItem('token');

// ==================== ADMIN ENDPOINTS ====================

/**
 * 1. APPROVE CLAIM WITH AUDIT LOG
 * 
 * Method: POST
 * Endpoint: /api/admin/claims/{claim_id}/approve
 * 
 * Features:
 * - Role-based access control
 * - Automatic audit logging
 * - Real-time user notification
 * - Transaction-safe database update
 */
export async function approveClaim(claimId, reason = null, adminNotes = null) {
    try {
        const params = new URLSearchParams();
        params.append('token', getToken());
        if (reason) params.append('reason', reason);
        if (adminNotes) params.append('admin_notes', adminNotes);

        const response = await fetch(
            `${API_BASE}/api/admin/claims/${claimId}/approve`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Approval failed');
        }

        const result = await response.json();
        console.log('✅ Claim approved:', result);
        return result;

    } catch (error) {
        console.error('❌ Error approving claim:', error);
        throw error;
    }
}

/**
 * 2. REJECT CLAIM WITH REQUIRED REASON
 * 
 * Method: POST
 * Endpoint: /api/admin/claims/{claim_id}/reject
 * 
 * Features:
 * - Requires rejection reason (mandatory)
 * - Audit trail with detailed logging
 * - Notification sent to user
 */
export async function rejectClaim(claimId, reason, adminNotes = null) {
    try {
        if (!reason || reason.trim() === '') {
            throw new Error('Rejection reason is required');
        }

        const params = new URLSearchParams();
        params.append('token', getToken());
        params.append('reason', reason);
        if (adminNotes) params.append('admin_notes', adminNotes);

        const response = await fetch(
            `${API_BASE}/api/admin/claims/${claimId}/reject`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Rejection failed');
        }

        const result = await response.json();
        console.log('✅ Claim rejected:', result);
        return result;

    } catch (error) {
        console.error('❌ Error rejecting claim:', error);
        throw error;
    }
}

/**
 * 3. GET ADMIN DASHBOARD STATISTICS
 * 
 * Real-time dashboard with auto-updating counters
 * Polls every 5 seconds for live updates
 */
export async function getAdminDashboardStats() {
    try {
        const response = await fetch(
            `${API_BASE}/api/admin/dashboard/stats?token=${getToken()}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard stats');
        }

        const data = await response.json();
        return {
            total_claims: data.stats.total_claims,
            pending_claims: data.stats.pending_claims,
            approved_count: data.stats.approved_count,
            rejected_count: data.stats.rejected_count,
            timestamp: new Date()
        };

    } catch (error) {
        console.error('❌ Error fetching dashboard stats:', error);
        throw error;
    }
}

/**
 * 4. GET AUDIT LOGS FOR COMPLIANCE
 * 
 * Method: GET
 * Endpoint: /api/admin/audit-logs
 * 
 * Query Parameters:
 * - admin_id (optional): Filter by specific admin
 * - target_type (optional): Filter by target type (claim, document, etc.)
 * - limit (1-500): Number of logs to return
 * - offset: Pagination offset
 */
export async function getAuditLogs(
    adminId = null,
    targetType = null,
    limit = 100,
    offset = 0
) {
    try {
        const params = new URLSearchParams();
        params.append('token', getToken());
        params.append('limit', limit);
        params.append('offset', offset);
        if (adminId) params.append('admin_id', adminId);
        if (targetType) params.append('target_type', targetType);

        const response = await fetch(
            `${API_BASE}/api/admin/audit-logs?${params.toString()}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch audit logs');
        }

        const data = await response.json();
        return data.logs.map(log => ({
            id: log.id,
            admin: log.admin_email,
            action: log.action,
            target: `${log.target_type} #${log.target_id}`,
            reason: log.reason,
            timestamp: new Date(log.timestamp),
            details: log.details
        }));

    } catch (error) {
        console.error('❌ Error fetching audit logs:', error);
        throw error;
    }
}

// ==================== USER/NOTIFICATION ENDPOINTS ====================

/**
 * 5. GET USER NOTIFICATIONS
 * 
 * Real-time notifications about claim decisions
 * Polls every 3 seconds for new notifications
 */
export async function getUserNotifications(limit = 20, offset = 0) {
    try {
        const response = await fetch(
            `${API_BASE}/api/user/notifications?token=${getToken()}&limit=${limit}&offset=${offset}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch notifications');
        }

        const data = await response.json();
        return {
            unread_count: data.unread_count,
            notifications: data.notifications.map(n => ({
                id: n.id,
                claim_id: n.claim_id,
                type: n.type,
                title: n.title,
                message: n.message,
                status: n.status,
                admin: n.admin_email,
                created_at: new Date(n.created_at),
                read_at: n.read_at ? new Date(n.read_at) : null
            }))
        };

    } catch (error) {
        console.error('❌ Error fetching notifications:', error);
        throw error;
    }
}

/**
 * 6. MARK NOTIFICATION AS READ
 * 
 * Method: POST
 * Endpoint: /api/notifications/{notification_id}/read
 */
export async function markNotificationAsRead(notificationId) {
    try {
        const response = await fetch(
            `${API_BASE}/api/notifications/${notificationId}/read?token=${getToken()}`,
            { method: 'POST' }
        );

        if (!response.ok) {
            throw new Error('Failed to mark notification as read');
        }

        console.log('✅ Notification marked as read');
        return true;

    } catch (error) {
        console.error('❌ Error marking notification as read:', error);
        throw error;
    }
}

// ==================== POLLING UTILITIES ====================

/**
 * SET UP AUTO-POLLING FOR DASHBOARD STATS
 * 
 * Usage:
 * const handle = setupStatPolling(5000, (stats) => {
 *     console.log('Updated stats:', stats);
 * });
 * // Stop polling
 * clearInterval(handle);
 */
export function setupStatPolling(intervalMs = 5000, onUpdate) {
    return setInterval(async () => {
        try {
            const stats = await getAdminDashboardStats();
            onUpdate(stats);
        } catch (error) {
            console.error('Error in stat polling:', error);
        }
    }, intervalMs);
}

/**
 * SET UP AUTO-POLLING FOR NOTIFICATIONS
 */
export function setupNotificationPolling(intervalMs = 3000, onUpdate) {
    return setInterval(async () => {
        try {
            const data = await getUserNotifications();
            onUpdate(data);
        } catch (error) {
            console.error('Error in notification polling:', error);
        }
    }, intervalMs);
}

// ==================== REACT HOOKS ====================

import { useEffect, useState, useCallback } from 'react';

/**
 * CUSTOM HOOK: useAdminDashboard
 * 
 * Usage:
 * const { stats, loading, error, refetch } = useAdminDashboard(5000);
 */
export function useAdminDashboard(pollInterval = 5000) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAdminDashboardStats();
            setStats(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refetch();
        const handle = setupStatPolling(pollInterval, setStats);
        return () => clearInterval(handle);
    }, [refetch, pollInterval]);

    return { stats, loading, error, refetch };
}

/**
 * CUSTOM HOOK: useUserNotifications
 * 
 * Usage:
 * const { notifications, unreadCount, loading, error } = useUserNotifications(3000);
 */
export function useUserNotifications(pollInterval = 3000) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const markAsRead = useCallback(async (notificationId) => {
        await markNotificationAsRead(notificationId);
        setNotifications(prev =>
            prev.map(n =>
                n.id === notificationId ? { ...n, status: 'read' } : n
            )
        );
        setUnreadCount(Math.max(0, unreadCount - 1));
    }, [unreadCount]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const data = await getUserNotifications();
                setNotifications(data.notifications);
                setUnreadCount(data.unread_count);
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
        const handle = setInterval(fetchNotifications, pollInterval);
        return () => clearInterval(handle);
    }, [pollInterval]);

    return { notifications, unreadCount, loading, error, markAsRead };
}

// ==================== TRANSACTION EXAMPLE ====================

/**
 * BULK CLAIM APPROVAL WITH TRANSACTION SAFETY
 * 
 * Each approval creates its own transaction
 * If one fails, others continue (best-effort approach)
 * All actions are logged to audit trail
 */
export async function bulkApproveClaims(claimIds, reason = null) {
    const results = {
        successful: [],
        failed: []
    };

    for (const claimId of claimIds) {
        try {
            const result = await approveClaim(claimId, reason);
            results.successful.push(result.claim_id);
        } catch (error) {
            results.failed.push({
                claim_id: claimId,
                error: error.message
            });
        }
    }

    return results;
}

// ==================== ERROR HANDLING ====================

/**
 * Standard Error Handling Pattern
 */
export async function executeClaimAction(action, claimId, ...args) {
    try {
        // Check admin access
        const token = getToken();
        if (!token) {
            throw new Error('Authentication required - please login');
        }

        // Execute action
        const result = await action(claimId, ...args);

        // Show success
        console.log('✅ Action successful:', result);
        return result;

    } catch (error) {
        // Categorize error
        if (error.message.includes('401')) {
            console.error('❌ Authentication failed - token expired');
            // Trigger re-login
        } else if (error.message.includes('403')) {
            console.error('❌ Access denied - admin role required');
        } else if (error.message.includes('404')) {
            console.error('❌ Claim not found');
        } else {
            console.error('❌ Action failed:', error.message);
        }

        throw error;
    }
}
