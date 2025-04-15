// Test script to verify environment-specific database connections
// Run with: bun test-environments.mjs

import dotenv from 'dotenv';
import { getSupabaseConfig, getEnvironmentName } from './src/lib/supabase/config.js';
import fs from 'fs';

// First load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Check if .env.production exists
const hasProductionEnv = fs.existsSync('.env.production');
console.log(
  `Production environment file (.env.production): ${hasProductionEnv ? '✅ Found' : '❌ Not found'}`
);

// If it exists, also load variables from .env.production for testing
if (hasProductionEnv) {
  // Save current env vars
  const currentEnv = { ...process.env };

  // Load production env vars
  dotenv.config({ path: '.env.production' });

  // Restore development env vars but keep production ones that don't conflict
  Object.keys(currentEnv).forEach((key) => {
    process.env[key] = currentEnv[key];
  });

  console.log('Loaded both .env.local and .env.production for testing');
}

async function testEnvironments() {
  console.log('\nTesting environment-specific database connections...');

  // Test development environment
  process.env.NEXT_PUBLIC_APP_ENV = 'development';
  const devConfig = getSupabaseConfig();
  console.log('\n--- Development Environment ---');
  console.log(`Environment: ${getEnvironmentName()}`);
  console.log(`URL: ${maskString(devConfig.url)}`);
  console.log(`Anon Key: ${maskString(devConfig.anonKey)}`);

  // Test production environment
  process.env.NEXT_PUBLIC_APP_ENV = 'production';
  const prodConfig = getSupabaseConfig();
  console.log('\n--- Production Environment ---');
  console.log(`Environment: ${getEnvironmentName()}`);
  console.log(`URL: ${maskString(prodConfig.url)}`);
  console.log(`Anon Key: ${maskString(prodConfig.anonKey)}`);

  // Check if both environments are properly configured
  const devConfigured = devConfig.url && devConfig.anonKey;
  const prodConfigured = prodConfig.url && prodConfig.anonKey;

  console.log('\n--- Configuration Status ---');
  console.log(
    `Development environment (.env.local): ${devConfigured ? '✅ Configured' : '❌ Not configured'}`
  );
  console.log(
    `Production environment (.env.production): ${prodConfigured ? '✅ Configured' : '❌ Not configured'}`
  );

  if (!devConfigured) {
    console.log('\nTo configure development environment, add these to .env.local:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
    console.log('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key');
  }

  if (!prodConfigured) {
    console.log('\nTo configure production environment, add these to .env.production:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=your_prod_supabase_url');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_prod_supabase_anon_key');
    console.log('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_prod_supabase_service_role_key');
  }

  console.log('\nFor more information, see ENVIRONMENT_SETUP.md');
}

// Helper function to mask sensitive strings
function maskString(str) {
  if (!str) return 'Not configured';
  if (str.length < 8) return '********';
  return str.substring(0, 4) + '...' + str.substring(str.length - 4);
}

testEnvironments();
