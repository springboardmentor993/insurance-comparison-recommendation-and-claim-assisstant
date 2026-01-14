-- ===============================
-- POLICY TYPE ENUM
-- ===============================

CREATE TYPE public.policy_type_enum AS ENUM (
    'auto',
    'health',
    'life',
    'home',
    'travel'
);

-- ===============================
-- POLICIES TABLE
-- ===============================

CREATE TABLE public.policies (
    id SERIAL PRIMARY KEY,
    provider_id INT NOT NULL,
    policy_type public.policy_type_enum NOT NULL,
    title VARCHAR(255) NOT NULL,
    coverage JSONB,
    premium NUMERIC,
    term_months INT,
    deductible NUMERIC,
    tnc_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_policies_provider
        FOREIGN KEY (provider_id)
        REFERENCES public.providers(id)
        ON DELETE CASCADE
);
