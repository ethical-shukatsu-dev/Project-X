# Environment Setup for Project X

This guide explains how to set up your environment variables for connecting to different Supabase databases based on your environment (development or production).

## Environment Configuration

Project X now supports connecting to different Supabase databases based on the current environment:

- **Development Environment**: Uses your development Supabase project (configured in `.env.local`)
- **Production Environment**: Uses your production Supabase project (configured in `.env.production`)

## Setting Up Environment Variables

### For Development (Default)

1. Create a `.env.local` file in your project root (if you don't already have one)
2. Add the following variables for your development database:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_dev_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_dev_supabase_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_dev_supabase_service_role_key
```

### For Production

For production, we use a separate environment file:

1. Create a `.env.production` file in your project root
2. Add the following variables for your production database:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_prod_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_prod_supabase_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_prod_supabase_service_role_key
```

When deploying to a hosting platform (e.g., Vercel), add these environment variables to your project settings.

## Setting Up Database Tables

### For Development

Your development database should already be set up with the necessary tables. If not, follow the instructions in [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

### For Production

To set up your production database tables:

1. In the Supabase dashboard for your production project, navigate to the "SQL Editor" section
2. Click "New Query"
3. Copy and paste the contents of the `setup-tables.sql` file into the SQL editor
4. Click "Run" to execute the SQL script

This will create the necessary tables (`user_values`, `companies`, and `recommendations`) in your production database.

5. Verify your production setup:
   ```bash
   bun run verify-supabase:prod
   ```

## Backward Compatibility

For backward compatibility, the system will fall back to the original environment variables if the new ones are not set:

```
# Legacy variables (used as fallback for development)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## How Environment Detection Works

The system determines which environment to use based on:

1. **NODE_ENV**: Set automatically to 'production' in production builds
2. **NEXT_PUBLIC_APP_ENV**: Optional override to force a specific environment

In most cases, you don't need to set `NEXT_PUBLIC_APP_ENV` as the system will detect the environment automatically.

## Testing Production Configuration Locally

If you want to test your production database configuration locally:

1. Make sure your `.env.production` file is properly configured
2. Set `NEXT_PUBLIC_APP_ENV=production` in your `.env.local` file
3. Run your application normally with `bun run dev`

The application will connect to your production database even though you're running in development mode.

## Verifying Your Configuration

When the application starts in development mode, it will log which environment it's using:

```
[Supabase Client] Using development environment
[Supabase Admin Client] Using development environment
```

or

```
[Supabase Client] Using production environment
[Supabase Admin Client] Using production environment
```

This helps you confirm that you're connected to the correct database.

## Getting Supabase Credentials

1. **For Development**: Get credentials from your existing Supabase project
2. **For Production**: Get credentials from your "Project X Production" Supabase project

For both projects, you can find the credentials in the Supabase dashboard under:

- Project Settings > API > Project URL (for the URL)
- Project Settings > API > Project API Keys > anon public (for the anon key)
- Project Settings > API > Project API Keys > service_role (for the service role key)
