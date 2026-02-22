-- ============================================================================
-- PostgreSQL Verification & Setup Script for Claim Documents
-- ============================================================================
-- Run all these commands in pgAdmin or psql to verify/fix the database

-- 1. CHECK IF TABLE EXISTS
-- ============================================================================
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'claim_documents'
) as table_exists;

-- 2. CHECK TABLE STRUCTURE
-- ============================================================================
\d claim_documents

-- Or with more detail:
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'claim_documents'
ORDER BY ordinal_position;

-- 3. CHECK DATA TYPES
-- ============================================================================
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'claim_documents'
    AND column_name IN ('file_data', 'file_name', 'file_type', 'doc_type', 'uploaded_at');

-- 4. VERIFY FILE DATA IS STORED (if any documents exist)
-- ============================================================================
SELECT 
    id,
    claim_id,
    file_name,
    file_type,
    doc_type,
    octet_length(file_data) as file_size_bytes,
    uploaded_at
FROM claim_documents
ORDER BY uploaded_at DESC;

-- 5. COUNT DOCUMENTS
-- ============================================================================
SELECT COUNT(*) as total_documents FROM claim_documents;

-- 6. RECREATE TABLE (if columns are missing)
-- ============================================================================
-- BACKUP first (Optional):
-- SELECT * INTO claim_documents_backup FROM claim_documents;

-- Drop and recreate (WARNING: This deletes all data)
-- DROP TABLE IF EXISTS claim_documents CASCADE;
-- 
-- CREATE TABLE claim_documents (
--     id SERIAL PRIMARY KEY,
--     claim_id INTEGER NOT NULL REFERENCES claims(id),
--     file_data BYTEA NOT NULL,
--     file_name VARCHAR NOT NULL,
--     file_type VARCHAR NOT NULL,
--     doc_type VARCHAR NOT NULL,
--     uploaded_at TIMESTAMP DEFAULT NOW()
-- );

-- 7. ALTER TABLE TO ADD MISSING COLUMNS (Safe option)
-- ============================================================================
-- Add file_data if missing:
ALTER TABLE claim_documents ADD COLUMN IF NOT EXISTS file_data BYTEA;

-- Add file_name if missing:
ALTER TABLE claim_documents ADD COLUMN IF NOT EXISTS file_name VARCHAR;

-- Add file_type if missing:
ALTER TABLE claim_documents ADD COLUMN IF NOT EXISTS file_type VARCHAR;

-- Remove old file_url column if it exists:
ALTER TABLE claim_documents DROP COLUMN IF EXISTS file_url;

-- 8. VERIFY CONNECTION
-- ============================================================================
SELECT 
    datname as database,
    server_version,
    pg_database.datacl as privileges
FROM pg_database
WHERE datname = 'insurance_db';

-- 9. CHECK DATABASE ENCODING
-- ============================================================================
SELECT encoding, datcollate FROM pg_database WHERE datname = 'insurance_db';

-- 10. VERIFY CLAIM_DOCUMENTS STATISTICS
-- ============================================================================
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables
WHERE tablename = 'claim_documents';

-- 11. CHECK FOR FOREIGN KEY CONSTRAINTS
-- ============================================================================
SELECT
    constraint_name,
    constraint_type,
    table_name,
    column_name
FROM information_schema.key_column_usage
WHERE table_name = 'claim_documents';

-- 12. TEST INSERT (dummy data)
-- ============================================================================
-- This tests if the INSERT works
-- INSERT INTO claim_documents (claim_id, file_data, file_name, file_type, doc_type)
-- VALUES (1, E'\\x89504e470d0a1a0a', 'test.png', 'image/png', 'test');

-- 13. INSPECT ACTUAL FILE SIZES
-- ============================================================================
SELECT 
    id,
    file_name,
    octet_length(file_data) as size_bytes,
    CASE 
        WHEN octet_length(file_data) = 0 THEN 'EMPTY'
        WHEN octet_length(file_data) IS NULL THEN 'NULL'
        ELSE 'OK'
    END as data_status,
    uploaded_at
FROM claim_documents
ORDER BY id DESC;

-- 14. CLEANUP EMPTY DOCUMENTS (Optional)
-- ============================================================================
-- DELETE FROM claim_documents WHERE file_data IS NULL OR octet_length(file_data) = 0;
