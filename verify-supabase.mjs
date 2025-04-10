// This script verifies your Supabase connection and checks if tables are set up correctly
// Run with: bun run verify-supabase

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Allow specifying environment via command line
if (process.argv.includes('--production')) {
  process.env.NEXT_PUBLIC_APP_ENV = 'production';
  console.log('Forcing production environment check');
} else if (process.argv.includes('--development')) {
  process.env.NEXT_PUBLIC_APP_ENV = 'development';
  console.log('Forcing development environment check');
}

// Determine environment
const isProduction =
  process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_APP_ENV === 'production';
const environment = isProduction ? 'production' : 'development';

// Load appropriate environment variables
if (isProduction && fs.existsSync('.env.production')) {
  console.log('Loading production environment variables from .env.production');
  dotenv.config({ path: '.env.production' });
} else {
  console.log('Loading development environment variables from .env.local');
  dotenv.config({ path: '.env.local' });
}

// Get the Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(`Error: Missing Supabase environment variables for ${environment} environment`);
  console.error('Make sure you have the correct environment variables in your environment file');
  console.error(
    `For ${environment}: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.${isProduction ? 'production' : 'local'}`
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySupabaseSetup() {
  console.log(`Verifying Supabase connection and table setup for ${environment} environment...`);

  try {
    // Check connection
    console.log('Checking Supabase connection...');
    const { error: connectionError } = await supabase.from('companies').select('id').limit(1);

    if (connectionError) {
      throw new Error(`Connection error: ${connectionError.message}`);
    }

    console.log(`✅ Supabase connection successful to ${environment} database!`);

    // Check tables
    console.log('\nChecking database tables:');

    // Check companies table
    const { data: companies, error: companiesError } = await supabase.from('companies').select('*');

    if (companiesError) {
      throw new Error(`Companies table error: ${companiesError.message}`);
    }

    console.log(`✅ Companies table exists with ${companies.length} records`);

    // Check user_values table structure
    const { error: userValuesError } = await supabase.from('user_values').select('id').limit(1);

    if (userValuesError && userValuesError.code !== 'PGRST116') {
      // PGRST116 is "No rows returned" which is fine for this check
      throw new Error(`User values table error: ${userValuesError.message}`);
    }

    console.log('✅ User values table exists');

    // Check recommendations table structure
    const { error: recommendationsError } = await supabase
      .from('recommendations')
      .select('id')
      .limit(1);

    if (recommendationsError && recommendationsError.code !== 'PGRST116') {
      throw new Error(`Recommendations table error: ${recommendationsError.message}`);
    }

    console.log('✅ Recommendations table exists');

    console.log(
      `\n🎉 Supabase setup verification complete! Your ${environment} database is ready to use.`
    );
  } catch (error) {
    console.error('\n❌ Verification failed:');
    console.error(error.message);
    console.error(
      `\nPlease check your Supabase setup and environment variables for the ${environment} environment.`
    );
    process.exit(1);
  }
}

verifySupabaseSetup();
