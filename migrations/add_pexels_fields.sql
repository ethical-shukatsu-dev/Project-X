-- Add Pexels-specific fields to value_images table
ALTER TABLE value_images
ADD COLUMN IF NOT EXISTS pexels_id TEXT;

-- Create indexes for the new field
CREATE INDEX IF NOT EXISTS value_images_pexels_id_idx ON value_images (pexels_id);

-- Add a comment explaining the purpose of this field
COMMENT ON COLUMN value_images.pexels_id IS 'The Pexels photo ID for proper attribution'; 