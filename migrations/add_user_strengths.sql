-- Add strengths column to user_values table
ALTER TABLE user_values
ADD COLUMN IF NOT EXISTS strengths JSONB;

-- Comment to explain purpose
COMMENT ON COLUMN user_values.strengths IS 'JSON with user strengths as key-value pairs (1-10 ratings)'; 