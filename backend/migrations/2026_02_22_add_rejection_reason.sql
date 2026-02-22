-- Migration: Add rejection_reason fields for improved claim workflow tracking
-- Date: 2026-02-22
-- Purpose: Store rejection reasons for better user communication

-- Add rejection_reason to claims table
ALTER TABLE claims 
ADD COLUMN rejection_reason TEXT NULL;

-- Add rejection_reason to document_approvals table
ALTER TABLE document_approvals 
ADD COLUMN rejection_reason TEXT NULL;

-- Add index for faster rejection reason queries
CREATE INDEX idx_claims_rejection_reason ON claims(rejection_reason) 
WHERE rejection_reason IS NOT NULL;

-- Update existing rejected claims with a default message if rejection_reason is NULL
UPDATE claims 
SET rejection_reason = 'Claim rejected due to document issues. Please review notifications for details.' 
WHERE status = 'rejected' AND rejection_reason IS NULL;
