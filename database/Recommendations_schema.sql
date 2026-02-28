CREATE TABLE recommendations (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    policy_id INT NOT NULL,
    score NUMERIC,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE recommendations
ADD CONSTRAINT fk_recommendations_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE recommendations
ADD CONSTRAINT fk_recommendations_policy
FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE;

INSERT INTO recommendations (user_id, policy_id, score, reason)
VALUES
(1, 6, 0.92, 'Recommended based on family health coverage and affordability'),
(1, 12, 0.90, 'Recommended due to restore benefits and comprehensive hospitalization');

INSERT INTO recommendations (user_id, policy_id, score, reason)
VALUES
(1, 7, 0.85, 'Recommended for frequent domestic travel'),
(1, 13, 0.88, 'Recommended for international travel and medical emergencies');

INSERT INTO recommendations (user_id, policy_id, score, reason)
VALUES
(1, 8, 0.95, 'Recommended for long-term financial protection'),
(1, 15, 0.93, 'Recommended for life cover with savings benefit');

INSERT INTO recommendations (user_id, policy_id, score, reason)
VALUES
(1, 9, 0.89, 'Recommended for private car insurance with roadside assistance'),
(1, 14, 0.86, 'Recommended for two-wheeler insurance and accident cover');

INSERT INTO recommendations (user_id, policy_id, score, reason)
VALUES
(1, 10, 0.87, 'Recommended for home structure and content protection'),
(1, 16, 0.91, 'Recommended for comprehensive home insurance coverage');
