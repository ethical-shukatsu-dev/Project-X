# Supabase Setup Guide for Project X

This guide will walk you through setting up your Supabase project for Project X.

## 1. Create a Supabase Project

1. Go to [https://supabase.com/](https://supabase.com/) and sign up or log in
2. Click on "New Project" to create a new project
3. Fill in the project details:
   - Name: Project-X
   - Database Password: Create a secure password (make sure to save this)
   - Region: Choose the region closest to your users
   - Pricing Plan: Free tier is sufficient for development
4. Click "Create new project" and wait for it to be created (this may take a few minutes)

## 2. Set Up Database Tables

Once your project is created, you'll need to set up the database tables:

1. In the Supabase dashboard, navigate to the "SQL Editor" section
2. Click "New Query"
3. Copy and paste the contents of the `setup-tables.sql` file into the SQL editor
4. Click "Run" to execute the SQL script

This will:

- Create the necessary tables (`user_values`, `companies`, and `recommendations`)
- Insert sample company data for testing

## 3. Configure Environment Variables

After setting up your Supabase project, you need to configure your environment variables:

1. In the Supabase dashboard, go to "Project Settings" > "API"
2. Copy the "Project URL" and "anon public" key
3. Create a `.env.local` file in your project root by copying the `.env.local.example` file:
   ```bash
   cp .env.local.example .env.local
   ```
4. Edit the `.env.local` file and replace the placeholder values with your actual Supabase URL and key:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   ```

5. For production setup, see the [Environment Setup Guide](ENVIRONMENT_SETUP.md)

## 4. Verify Setup

To verify that your setup is working correctly:

1. Run the verification script:

   ```bash
   bun run verify-supabase
   ```

   This will check your Supabase connection and verify that all required tables exist.

2. If successful, you should see confirmation messages for each table.

3. You can also manually check in the Supabase dashboard:
   - Go to "Table Editor"
   - You should see the three tables you created: `user_values`, `companies`, and `recommendations`
   - Check that the `companies` table has the sample data you inserted

## Troubleshooting

- If you encounter any errors during SQL execution, check for syntax errors or conflicts
- If your application can't connect to Supabase, verify that your environment variables are correct
- Make sure your Supabase project is on the active plan (not paused)
- If the verification script fails, check the error message for details on what went wrong

## Next Steps

Once your Supabase project is set up, you can:

1. Run your Next.js application locally to test the connection:

   ```bash
   bun run dev
   ```

2. Add more sample company data if needed

3. Test the questionnaire and recommendation features

## Multiple Environments

For information on setting up and switching between development and production environments, see the [Environment Setup Guide](ENVIRONMENT_SETUP.md).
