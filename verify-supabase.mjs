// This script verifies your Supabase connection and checks if tables are set up correctly
// Run with: node verify-supabase.js

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Make sure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySupabaseSetup() {
  console.log('Verifying Supabase connection and table setup...');
  
  try {
    // Check connection
    console.log('Checking Supabase connection...');
    const { error: connectionError } = await supabase.from('companies').select('id').limit(1);
    
    if (connectionError) {
      throw new Error(`Connection error: ${connectionError.message}`);
    }
    
    console.log('✅ Supabase connection successful!');
    
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
    const { error: recommendationsError } = await supabase.from('recommendations').select('id').limit(1);
    
    if (recommendationsError && recommendationsError.code !== 'PGRST116') {
      throw new Error(`Recommendations table error: ${recommendationsError.message}`);
    }
    
    console.log('✅ Recommendations table exists');
    
    console.log('\n🎉 Supabase setup verification complete! Your database is ready to use.');
    
  } catch (error) {
    console.error('\n❌ Verification failed:');
    console.error(error.message);
    console.error('\nPlease check your Supabase setup and environment variables.');
    process.exit(1);
  }
}

verifySupabaseSetup(); 