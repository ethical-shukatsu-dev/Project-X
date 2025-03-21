// Configuration for Supabase connections based on environment
// This file manages the connection details for development and production environments

// Interface for Supabase configuration
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

// Function to determine if we're in production environment
export const isProduction = (): boolean => {
  // Check for production environment
  // In Next.js, NODE_ENV is set to 'production' in production builds
  // We can also check for custom environment variables
  return (
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_APP_ENV === "production"
  );
};

// Function to get the appropriate Supabase configuration based on environment
export const getSupabaseConfig = (): SupabaseConfig => {
  // Use the same variable names for both environments
  // The actual values will come from .env.local (dev) or .env.production (prod)
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    serviceRoleKey:
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      "",
  };
};

// Export a helper function to get a descriptive environment name for logging
export const getEnvironmentName = (): string => {
  return isProduction() ? "production" : "development";
};
