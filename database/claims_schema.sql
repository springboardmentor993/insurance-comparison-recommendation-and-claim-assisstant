CREATE TABLE Claims (
    id SERIAL PRIMARY KEY,
    user_policy_id INTEGER NOT NULL,
    claim_number VARCHAR(50) UNIQUE NOT NULL,
    claim_type VARCHAR(100) NOT NULL,
    incident_date DATE NOT NULL,
    amount_claimed NUMERIC(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_policy
        FOREIGN KEY(user_policy_id)
        REFERENCES userpolicies(id)
        ON DELETE CASCADE
);
