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