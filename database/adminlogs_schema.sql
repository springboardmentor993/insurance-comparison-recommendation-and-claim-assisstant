CREATE TABLE adminlogs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES users(id),
    action TEXT NOT NULL,
    target_type VARCHAR NOT NULL,
    target_id INTEGER NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);