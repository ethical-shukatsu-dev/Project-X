-- Add company_values to companies table
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS company_values TEXT;

-- Comment to explain purpose
COMMENT ON COLUMN companies.company_values IS 'Text description of the company values (about 100 words)';

-- Add detailed rating and matching columns to recommendations table
ALTER TABLE recommendations
ADD COLUMN IF NOT EXISTS value_match_ratings JSONB,
ADD COLUMN IF NOT EXISTS strength_match_ratings JSONB,
ADD COLUMN IF NOT EXISTS value_matching_details JSONB,
ADD COLUMN IF NOT EXISTS strength_matching_details JSONB;

-- Comments to explain purpose
COMMENT ON COLUMN recommendations.value_match_ratings IS 'JSON with ratings (1-10) for how well company matches each user value';
COMMENT ON COLUMN recommendations.strength_match_ratings IS 'JSON with ratings (1-10) for how well company utilizes each user strength';
COMMENT ON COLUMN recommendations.value_matching_details IS 'JSON with detailed explanations of how company matches each user value';
COMMENT ON COLUMN recommendations.strength_matching_details IS 'JSON with detailed explanations of how company utilizes each user strength'; 