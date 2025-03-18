-- Add Unsplash-specific fields to value_images table
ALTER TABLE value_images
ADD COLUMN IF NOT EXISTS unsplash_id TEXT,
ADD COLUMN IF NOT EXISTS attribution JSONB,
ADD COLUMN IF NOT EXISTS image_sizes JSONB;

-- Create indexes for the new fields
CREATE INDEX IF NOT EXISTS value_images_unsplash_id_idx ON value_images (unsplash_id);

-- Add a comment explaining the purpose of these fields
COMMENT ON COLUMN value_images.unsplash_id IS 'The Unsplash photo ID for proper attribution';
COMMENT ON COLUMN value_images.attribution IS 'Attribution information including photographer name, photographer URL, and photo URL';
COMMENT ON COLUMN value_images.image_sizes IS 'Different size variants of the image for responsive usage'; 