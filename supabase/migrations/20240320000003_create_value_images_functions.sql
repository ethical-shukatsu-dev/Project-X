-- Create functions for value_images
-- Function to get random value images by category
CREATE OR REPLACE FUNCTION get_random_value_images_by_category(category_param TEXT, limit_param INTEGER DEFAULT 4)
RETURNS SETOF value_images
LANGUAGE SQL
AS $$
  SELECT * FROM value_images 
  WHERE category = category_param
  ORDER BY RANDOM()
  LIMIT limit_param;
$$;

-- Function to get random value images from all categories
CREATE OR REPLACE FUNCTION get_random_value_images(limit_param INTEGER DEFAULT 4)
RETURNS SETOF value_images
LANGUAGE SQL
AS $$
  SELECT * FROM value_images 
  ORDER BY RANDOM()
  LIMIT limit_param;
$$;

-- Function to create random_value_images view
CREATE OR REPLACE FUNCTION create_random_value_images_view()
RETURNS void AS $$
BEGIN
  -- Drop the view if it exists
  DROP VIEW IF EXISTS random_value_images;
  
  -- Create the view that selects all columns from value_images and orders them randomly
  CREATE VIEW random_value_images AS 
  SELECT * FROM value_images ORDER BY random();
END;
$$ LANGUAGE plpgsql;

-- Execute the function to create the view
SELECT create_random_value_images_view();

-- Grant necessary permissions
GRANT SELECT ON random_value_images TO authenticated;
GRANT SELECT ON random_value_images TO anon;

-- Add comments
COMMENT ON FUNCTION get_random_value_images_by_category IS 'Returns a random set of value images for a specific category';
COMMENT ON FUNCTION get_random_value_images IS 'Returns a random set of value images from all categories';
COMMENT ON FUNCTION create_random_value_images_view IS 'Creates or updates the random_value_images view'; 