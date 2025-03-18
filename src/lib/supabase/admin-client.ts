import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig, getEnvironmentName } from "./config";

// Get the appropriate Supabase configuration based on environment
const config = getSupabaseConfig();

// Create a Supabase client with the service role key for admin operations
// This client bypasses RLS policies and should only be used in server-side code
export const supabaseAdmin = createClient(config.url, config.serviceRoleKey);

// Log which environment we're using (only in development)
if (process.env.NODE_ENV !== 'production') {
  console.log(`[Supabase Admin Client] Using ${getEnvironmentName()} environment`);
} 