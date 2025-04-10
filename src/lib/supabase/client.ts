import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig, getEnvironmentName } from './config';

// Get the appropriate Supabase configuration based on environment
const config = getSupabaseConfig();

// Create a single supabase client for interacting with your database
export const supabase = createClient(config.url, config.anonKey);

// Log which environment we're using (only in development)
if (process.env.NODE_ENV !== 'production') {
  console.log(`[Supabase Client] Using ${getEnvironmentName()} environment`);
}

// Types for our database tables
export type UserValues = {
  id: string;
  created_at: string;
  values: Record<string, number>; // Store values as key-value pairs
  interests?: string[]; // Array of interest keywords
  selected_image_values?: Record<string, string[]>; // Store selected image IDs by category
  questionnaire_type?: string; // Type of questionnaire used (text or image)
  strengths?: Record<string, number>; // Store strengths as key-value pairs
};

export type Company = {
  id: string;
  name: string;
  industry: string;
  description: string;
  size: string;
  values: Record<string, number>; // Company values as key-value pairs
  logo_url?: string | null;
  site_url?: string | null;
  data_source: string;
  last_updated: string;
  company_values?: string; // Text description of company values
};

export type Recommendation = {
  id: string;
  user_id: string;
  company_id: string;
  created_at: string;
  matching_points: string[]; // Array of matching value points
  feedback?: 'interested' | 'not_interested'; // User feedback
  value_match_ratings?: Record<string, number>; // Ratings (1-10) for value matches
  strength_match_ratings?: Record<string, number>; // Ratings (1-10) for strength matches
  value_matching_details?: Record<string, string>; // Detailed explanations for value matches
  strength_matching_details?: Record<string, string>; // Detailed explanations for strength matches
};

// Type for image attribution
export type ImageAttribution = {
  photographer_name: string;
  photographer_url: string;
  photo_url: string;
};

// Type for image sizes
export type ImageSizes = {
  thumb: string;
  small: string;
  regular: string;
  full: string;
  raw: string;
};

// Type for value images
export type ValueImage = {
  id: string;
  created_at: string;
  category: string; // e.g., 'work_environment', 'leadership_style'
  value_name: string; // e.g., 'collaborative', 'mentorship'
  image_url: string;
  description?: string;
  tags?: string[];
  // Unsplash-specific fields
  unsplash_id?: string;
  // Pexels-specific fields
  pexels_id?: string;
  attribution?: ImageAttribution;
  image_sizes?: ImageSizes;
};
