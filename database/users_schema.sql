-- ===============================
-- USERS TABLE
-- ===============================

CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    dob DATE,
    risk_profile JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
