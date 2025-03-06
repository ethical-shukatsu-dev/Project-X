-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_values table
CREATE TABLE user_values (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  values JSONB NOT NULL,
  interests TEXT[] NOT NULL
);

-- Create companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  description TEXT NOT NULL,
  size TEXT NOT NULL,
  values JSONB NOT NULL,
  logo_url TEXT
);

-- Create recommendations table
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_values(id),
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  matching_points TEXT[] NOT NULL,
  score INTEGER NOT NULL,
  feedback TEXT
);

-- Create sample companies data
INSERT INTO companies (id, name, industry, description, size, values, logo_url)
VALUES 
  (
    uuid_generate_v4(), 
    'TechInnovate', 
    'Technology', 
    'A forward-thinking tech company focused on sustainable innovation and employee growth.', 
    'Medium (50-250 employees)', 
    '{"work_life_balance": "high", "remote_work": "flexible", "innovation": "high", "social_impact": "medium"}',
    NULL
  ),
  (
    uuid_generate_v4(), 
    'GreenEarth Solutions', 
    'Environmental Services', 
    'Dedicated to creating sustainable solutions for environmental challenges worldwide.', 
    'Small (10-50 employees)', 
    '{"social_impact": "high", "work_life_balance": "medium", "team_culture": "collaborative", "growth_opportunities": "medium"}',
    NULL
  ),
  (
    uuid_generate_v4(), 
    'FinanceForward', 
    'Financial Services', 
    'A modern financial institution focused on ethical investing and customer-centric solutions.', 
    'Large (250+ employees)', 
    '{"stability": "high", "compensation": "competitive", "professional_development": "high", "work_structure": "structured"}',
    NULL
  ),
  (
    uuid_generate_v4(), 
    'HealthPlus', 
    'Healthcare', 
    'Innovative healthcare provider committed to improving patient outcomes through technology.', 
    'Large (250+ employees)', 
    '{"social_impact": "high", "work_life_balance": "medium", "innovation": "high", "stability": "high"}',
    NULL
  ),
  (
    uuid_generate_v4(), 
    'CreativeMinds', 
    'Design & Media', 
    'A creative agency known for its cutting-edge designs and inclusive workplace culture.', 
    'Small (10-50 employees)', 
    '{"creativity": "high", "flexibility": "high", "team_culture": "collaborative", "work_environment": "casual"}',
    NULL
  ); 