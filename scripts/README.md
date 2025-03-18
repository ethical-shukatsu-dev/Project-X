# Database Maintenance Scripts

## Company Deduplication Script

This script removes duplicate company records in the database that have the same `site_url`.
For each set of duplicates, it keeps the most recently updated record and removes the others.

### How it works

1. Fetches all companies with a non-null `site_url`
2. Groups them by normalized site URL (lowercase, no trailing slashes)
3. For each group, keeps the most recently updated record and marks others for deletion
4. Updates any recommendations pointing to companies that will be deleted
5. Deletes the duplicate company records

### Usage

Run the deduplication script using:

```bash
npm run deduplicate-companies
# or
yarn deduplicate-companies
# or
bun deduplicate-companies
```

### Safety features

- The script doesn't delete companies without site URLs
- It keeps the most recently updated record for each site URL
- It updates any recommendations that reference companies to be deleted
- It provides detailed logging to track progress and any errors

### When to run

Run this script when:
- You notice duplicate company entries in the database
- You've imported company data from multiple sources
- You want to clean up the database before a major update

### Backup recommendation

As this is a HIGH-RISK operation that permanently removes data, it's recommended to:
1. Create a database backup before running this script
2. Run the script in a testing environment first if possible
3. Review the logs carefully to ensure the operation completed successfully 