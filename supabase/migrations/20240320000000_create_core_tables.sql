-- Create core tables for Project X
-- Create user_values table
CREATE TABLE user_values (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  values JSONB NOT NULL,
  interests TEXT[] NOT NULL,
  selected_image_values JSONB,
  strengths JSONB -- JSON with user strengths as key-value pairs (1-10 ratings)
);

-- Create companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  description TEXT NOT NULL,
  size TEXT NOT NULL,
  values JSONB NOT NULL,
  logo_url TEXT,
  site_url TEXT,
  data_source TEXT DEFAULT 'manual',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  company_values TEXT -- Text description of the company values (about 100 words)
);

-- Create recommendations table
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_values(id),
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  matching_points TEXT[] NOT NULL,
  feedback TEXT,
  value_match_ratings JSONB, -- JSON with ratings (1-10) for how well company matches each user value
  strength_match_ratings JSONB, -- JSON with ratings (1-10) for how well company utilizes each user strength
  value_matching_details JSONB, -- JSON with detailed explanations of how company matches each user value
  strength_matching_details JSONB -- JSON with detailed explanations of how company utilizes each user strength
);

-- Create value_images table
CREATE TABLE value_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category VARCHAR(255) NOT NULL, -- e.g., 'work_environment', 'leadership_style'
  value_name VARCHAR(255) NOT NULL, -- e.g., 'collaborative', 'mentorship'
  image_url TEXT NOT NULL,
  description TEXT, -- Description of what the image represents
  tags TEXT[], -- Array of tags for better categorization and searching
  pexels_id TEXT, -- The Pexels photo ID for proper attribution
  unsplash_id TEXT, -- The Unsplash photo ID for proper attribution
  attribution JSONB, -- Attribution information including photographer name, photographer URL, and photo URL
  image_sizes JSONB -- Different size variants of the image for responsive usage
);

-- Create indexes for value_images
CREATE INDEX value_images_pexels_id_idx ON value_images (pexels_id);
CREATE INDEX value_images_category_idx ON value_images (category);
CREATE INDEX value_images_value_name_idx ON value_images (value_name);

-- Add comments
COMMENT ON TABLE user_values IS 'Stores user preferences and values for company matching';
COMMENT ON TABLE companies IS 'Stores company information and their values';
COMMENT ON TABLE recommendations IS 'Stores company recommendations for users with matching details';
COMMENT ON TABLE value_images IS 'Stores images representing different company values and work environments'; 