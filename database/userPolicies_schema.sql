CREATE TABLE UserPolicies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    policy_id INTEGER NOT NULL,
    policy_number VARCHAR(50) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    premium NUMERIC(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    auto_renew BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
        
    CONSTRAINT fk_policy
        FOREIGN KEY(policy_id)
        REFERENCES policies(id)
        ON DELETE CASCADE
);

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

