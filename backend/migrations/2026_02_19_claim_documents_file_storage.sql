-- Migration for claim_documents table to store files in PostgreSQL
-- Run this SQL in your PostgreSQL database

ALTER TABLE claim_documents
    DROP COLUMN IF EXISTS file_url,
    DROP COLUMN IF EXISTS doc_type,
    DROP COLUMN IF EXISTS status,
    DROP COLUMN IF EXISTS admin_comment,
    DROP COLUMN IF EXISTS fraud_flag,
    DROP COLUMN IF EXISTS status_changed_at;

ALTER TABLE claim_documents
    ADD COLUMN file_name VARCHAR NOT NULL,
    ADD COLUMN file_type VARCHAR NOT NULL,
    ADD COLUMN file_data BYTEA NOT NULL;
