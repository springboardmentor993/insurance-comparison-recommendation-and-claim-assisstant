-- ===============================
-- PROVIDERS TABLE
-- ===============================

CREATE TABLE public.providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
