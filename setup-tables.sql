-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_values table
CREATE TABLE user_values (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  values JSONB NOT NULL,
  interests TEXT[] NOT NULL,
  selected_image_values JSONB NOT NULL
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
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recommendations table
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_values(id),
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  matching_points TEXT[] NOT NULL,
  feedback TEXT
);

-- Create value_images table
CREATE TABLE IF NOT EXISTS value_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category VARCHAR(255) NOT NULL, -- e.g., 'work_environment', 'leadership_style'
  value_name VARCHAR(255) NOT NULL, -- e.g., 'collaborative', 'mentorship'
  image_url TEXT NOT NULL,
  description TEXT, -- Description of what the image represents
  tags TEXT[] -- Array of tags for better categorization and searching
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS value_images_category_idx ON value_images (category);
CREATE INDEX IF NOT EXISTS value_images_value_name_idx ON value_images (value_name); 
