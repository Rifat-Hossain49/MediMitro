-- Migration script to add missing credential fields to doctors table
-- Run this script to add the enhanced doctor credential columns

-- Add missing columns to doctors table
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS medical_degree VARCHAR(255),
ADD COLUMN IF NOT EXISTS university VARCHAR(255),
ADD COLUMN IF NOT EXISTS graduation_year INTEGER,
ADD COLUMN IF NOT EXISTS board_certification VARCHAR(255),
ADD COLUMN IF NOT EXISTS additional_qualifications TEXT,
ADD COLUMN IF NOT EXISTS languages TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_documents TEXT,
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS verified_by VARCHAR(255);

-- Update existing records to have default values
UPDATE doctors 
SET 
    medical_degree = 'Not Specified',
    university = 'Not Specified',
    graduation_year = 2000,
    board_certification = 'Not Specified',
    additional_qualifications = '[]',
    languages = '[]',
    bio = 'No bio provided',
    is_verified = FALSE,
    verification_status = 'pending'
WHERE medical_degree IS NULL;

-- Add constraints
ALTER TABLE doctors 
ALTER COLUMN medical_degree SET NOT NULL,
ALTER COLUMN university SET NOT NULL,
ALTER COLUMN graduation_year SET NOT NULL;

-- Create index for verification status
CREATE INDEX IF NOT EXISTS idx_doctors_verification_status ON doctors(verification_status);
CREATE INDEX IF NOT EXISTS idx_doctors_is_verified ON doctors(is_verified);

