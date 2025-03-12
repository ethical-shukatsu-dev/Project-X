-- Add site_url column to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS site_url TEXT;

-- Update the last_updated timestamp for all companies
UPDATE companies SET last_updated = NOW(); 