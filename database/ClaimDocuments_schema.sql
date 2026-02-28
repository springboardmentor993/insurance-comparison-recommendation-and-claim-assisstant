CREATE TABLE ClaimDocuments (
    id SERIAL PRIMARY KEY,
    claim_id INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    doc_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_claim
        FOREIGN KEY(claim_id)
        REFERENCES claims(id)
        ON DELETE CASCADE
);
