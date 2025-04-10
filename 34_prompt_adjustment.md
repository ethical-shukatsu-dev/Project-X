# Database Migration Guide: Adding Recommendation Details

This document outlines the steps to migrate the database schema to add support for detailed recommendation information, including company values, value match ratings, and strength match ratings.

## Overview of Changes

This migration:

1. Adds a `company_values` column to the `companies` table
2. Adds multiple JSONB columns to the `recommendations` table:
   - `value_match_ratings`
   - `strength_match_ratings`
   - `value_matching_details`
   - `strength_matching_details`

## Migration Steps

### 1. Create a Backup (IMPORTANT)

Always back up your database before making schema changes:

```bash
# For development database
pg_dump -h <host> -p <port> -U <user> -d <database> -f backup_dev_$(date +%Y%m%d).sql

# For production database
pg_dump -h <host> -p <port> -U <user> -d <database> -f backup_prod_$(date +%Y%m%d).sql
```

### 2. Run the Migration Script

Execute the SQL migration script in your database:

```bash
# From your Supabase dashboard:
# 1. Navigate to the SQL Editor
# 2. Click "New Query"
# 3. Paste the contents of migrations/add_recommendation_details.sql
# 4. Click "Run"
```

Alternatively, if you have direct database access:

```bash
psql -h <host> -p <port> -U <user> -d <database> -f migrations/add_recommendation_details.sql
```

### 3. Verify the Migration

After running the migration, verify that the columns were added correctly:

```sql
-- Verify companies table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'companies'
AND column_name = 'company_values';

-- Verify recommendations table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'recommendations'
AND column_name IN ('value_match_ratings', 'strength_match_ratings', 'value_matching_details', 'strength_matching_details');
```

### 4. Deploy Code Changes

Deploy the following code changes to support the new schema:

1. Updated type definitions in `src/lib/supabase/client.ts`
2. Modified recommendation API in `src/app/api/recommendations/route.ts`
3. Updated company creation logic in `src/lib/companies/client.ts`
4. Updated OpenAI client in `src/lib/openai/client.ts`

### 5. Handling Existing Data

Existing records will have NULL values for the new columns. If you need to backfill this data:

1. For existing companies, you can run an update job to generate company values:

   ```typescript
   // Example backfill script
   import { supabase } from '../src/lib/supabase/client';
   import { fetchCompanyData } from '../src/lib/openai/client';

   async function backfillCompanyValues() {
     const { data: companies } = await supabase
       .from('companies')
       .select('*')
       .is('company_values', null);

     for (const company of companies) {
       try {
         const companyData = await fetchCompanyData(company.name, company.industry);
         await supabase
           .from('companies')
           .update({ company_values: companyData.company_values })
           .eq('id', company.id);
         console.log(`Updated ${company.name}`);
       } catch (error) {
         console.error(`Error updating ${company.name}:`, error);
       }
     }
   }
   ```

2. For existing recommendations, you may need to regenerate them with the new format, or leave them with NULL values for the new fields.

### 6. Rollback Plan

If issues are encountered after migration, use this rollback plan:

```sql
-- Rollback SQL
ALTER TABLE companies DROP COLUMN IF EXISTS company_values;

ALTER TABLE recommendations
DROP COLUMN IF EXISTS value_match_ratings,
DROP COLUMN IF EXISTS strength_match_ratings,
DROP COLUMN IF EXISTS value_matching_details,
DROP COLUMN IF EXISTS strength_matching_details;
```

## Deployment Checklist

- [x] Back up the database
- [x] Run the migration script
- [x] Verify the migration
- [ ] Deploy code changes
- [ ] Monitor for any errors
- [ ] Run backfill scripts if needed
