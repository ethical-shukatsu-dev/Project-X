import {createClient} from "@supabase/supabase-js";

// These environment variables need to be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type UserValues = {
  id: string;
  created_at: string;
  values: Record<string, number>; // Store values as key-value pairs
  interests: string[]; // Array of interest keywords
  selected_image_values?: Record<string, string[]>; // Store selected image IDs by category
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
};

export type Recommendation = {
  id: string;
  user_id: string;
  company_id: string;
  created_at: string;
  matching_points: string[]; // Array of matching value points
  feedback?: "interested" | "not_interested"; // User feedback
};

// New type for value images
export type ValueImage = {
  id: string;
  created_at: string;
  category: string; // e.g., 'work_environment', 'leadership_style'
  value_name: string; // e.g., 'collaborative', 'mentorship'
  image_url: string;
  description?: string;
  tags?: string[];
};
