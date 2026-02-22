-- ============================================
-- ADMIN CLAIM APPROVAL + USER NOTIFICATION SYSTEM
-- Complete PostgreSQL Schema
-- ============================================

-- Enhanced Claims Table
CREATE TABLE IF NOT EXISTS claims (
    id SERIAL PRIMARY KEY,
    user_policy_id INTEGER NOT NULL REFERENCES user_policies(id),
    claim_number VARCHAR(255) UNIQUE NOT NULL,
    claim_type VARCHAR(50) NOT NULL,
    incident_date DATE NOT NULL,
    amount_claimed NUMERIC(10,2) NOT NULL,
    description TEXT,
    status ENUM('draft','submitted','under_review','approved','rejected','paid') DEFAULT 'draft',
    reviewed_at TIMESTAMP NULL,
    reviewed_by INTEGER REFERENCES users(id),
    admin_comment TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table (existing)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    dob DATE,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- New Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    claim_id INTEGER NOT NULL REFERENCES claims(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) DEFAULT 'claim_status', -- claim_approved, claim_rejected, document_reviewed, etc.
    status ENUM('unread','read','archived') DEFAULT 'unread',
    admin_id INTEGER REFERENCES users(id), -- Which admin took action
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_claim_id (claim_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Admin Audit Log Table (existing but enhanced)
CREATE TABLE IF NOT EXISTS admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- approve, reject, review, etc.
    action_type VARCHAR(50) NOT NULL, -- claim, document, user, etc.
    target_type VARCHAR(50) NOT NULL,
    target_id INTEGER NOT NULL,
    old_value JSONB,
    new_value JSONB,
    reason TEXT,
    ip_address VARCHAR(45),
    details JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_admin_id (admin_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_action (action)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_claims_user_policy ON claims(user_policy_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_created_at ON claims(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(status) WHERE status = 'unread';

-- ============================================
-- VIEWS FOR EASY QUERYING
-- ============================================

-- View: Admin Dashboard Stats
CREATE OR REPLACE VIEW admin_claim_stats AS
SELECT 
    COUNT(*) as total_claims,
    COUNT(CASE WHEN status = 'under_review' THEN 1 END) as pending_claims,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
    COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count
FROM claims;

-- View: User Claim Summary
CREATE OR REPLACE VIEW user_claim_summary AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    COUNT(c.id) as total_claims,
    COUNT(CASE WHEN c.status = 'approved' THEN 1 END) as approved_claims,
    COUNT(CASE WHEN c.status = 'rejected' THEN 1 END) as rejected_claims,
    COUNT(CASE WHEN c.status = 'under_review' THEN 1 END) as pending_claims
FROM users u
LEFT JOIN user_policies up ON u.id = up.user_id
LEFT JOIN claims c ON up.id = c.user_policy_id
GROUP BY u.id, u.name, u.email;

-- ============================================
-- SAMPLE QUERIES FOR API ENDPOINTS
-- ============================================

-- Get claims for admin review (under_review status)
-- SELECT c.*, up.user_id, u.name, u.email 
-- FROM claims c
-- JOIN user_policies up ON c.user_policy_id = up.id
-- JOIN users u ON up.user_id = u.id
-- WHERE c.status = 'under_review'
-- ORDER BY c.created_at DESC;

-- Get user's claims
-- SELECT c.*, up.user_id
-- FROM claims c
-- JOIN user_policies up ON c.user_policy_id = up.id
-- WHERE up.user_id = $1
-- ORDER BY c.created_at DESC;

-- Get user notifications
-- SELECT * FROM notifications
-- WHERE user_id = $1
-- ORDER BY created_at DESC
-- LIMIT 20;

-- Get unread notification count
-- SELECT COUNT(*) as unread_count FROM notifications
-- WHERE user_id = $1 AND status = 'unread';

-- Update claim status and create notification
-- BEGIN;
-- UPDATE claims SET status = 'approved', reviewed_at = NOW(), reviewed_by = $1 
-- WHERE id = $2;
-- INSERT INTO notifications (user_id, claim_id, title, message, notification_type, admin_id)
-- SELECT up.user_id, $2, 'Claim Approved', 'Your claim has been approved', 'claim_approved', $1
-- FROM claims c
-- JOIN user_policies up ON c.user_policy_id = up.id
-- WHERE c.id = $2;
-- COMMIT;
