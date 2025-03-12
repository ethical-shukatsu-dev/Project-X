import { createClient } from "@supabase/supabase-js";

// These environment variables need to be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || "";

// Create a Supabase client with the service role key for admin operations
// This client bypasses RLS policies and should only be used in server-side code
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey); 