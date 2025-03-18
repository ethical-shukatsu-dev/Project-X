-- Deduplicate companies based on site_url
-- This query will identify all duplicates and keep only the most recently updated record
-- First, let's create a temporary table to store the IDs we want to keep

-- Step 1: Create a temporary table with the records we want to KEEP
-- For each site_url, we keep the record with the most recent last_updated timestamp
CREATE TEMP TABLE companies_to_keep AS
SELECT DISTINCT ON (site_url) id
FROM companies
WHERE site_url IS NOT NULL
ORDER BY site_url, last_updated DESC;

-- Step 2: Create a temporary table with the records we want to DELETE
-- These are all records with the same site_url as a record in companies_to_keep
-- but with a different ID
CREATE TEMP TABLE companies_to_delete AS
SELECT c1.id, c1.name, c1.site_url
FROM companies c1
WHERE c1.site_url IS NOT NULL
AND c1.id NOT IN (SELECT id FROM companies_to_keep)
AND EXISTS (
    SELECT 1 FROM companies c2
    WHERE c2.site_url = c1.site_url
    AND c2.id <> c1.id
    AND c2.id IN (SELECT id FROM companies_to_keep)
);

-- Step 3: Display the companies that will be deleted for verification
SELECT id, name, site_url
FROM companies_to_delete
ORDER BY site_url;

-- Step 4: Count the records that will be deleted
SELECT COUNT(*) AS records_to_delete
FROM companies_to_delete;

-- Step 5: Check for references in the recommendations table before deletion
-- This ensures we don't break referential integrity
SELECT r.id AS recommendation_id, r.company_id, c.name, c.site_url
FROM recommendations r
JOIN companies_to_delete c ON r.company_id = c.id;

-- Step 6: Check if we need to update recommendations
-- If there are recommendations referencing companies to be deleted,
-- we need to update them to point to the companies we're keeping
WITH recommendation_updates AS (
    SELECT
        r.id AS recommendation_id,
        r.company_id AS old_company_id,
        k.id AS new_company_id
    FROM recommendations r
    JOIN companies_to_delete d ON r.company_id = d.id
    JOIN companies k ON k.site_url = d.site_url
    WHERE k.id IN (SELECT id FROM companies_to_keep)
)
SELECT * FROM recommendation_updates;

-- Step 7: Update recommendations to point to the companies we're keeping
-- Uncomment this after reviewing the output of the previous query
/*
WITH recommendation_updates AS (
    SELECT
        r.id AS recommendation_id,
        r.company_id AS old_company_id,
        k.id AS new_company_id
    FROM recommendations r
    JOIN companies_to_delete d ON r.company_id = d.id
    JOIN companies k ON k.site_url = d.site_url
    WHERE k.id IN (SELECT id FROM companies_to_keep)
)
UPDATE recommendations r
SET company_id = u.new_company_id
FROM recommendation_updates u
WHERE r.id = u.recommendation_id;
*/

-- Step 8: Delete the duplicate companies
-- Uncomment this after reviewing the output of Steps 3 and 4
/*
DELETE FROM companies
WHERE id IN (SELECT id FROM companies_to_delete);
*/

-- Step 9: Report how many records were deleted
-- Uncomment this after running the DELETE command
/*
SELECT 'Deleted companies count: ' || COUNT(*) AS result
FROM companies_to_delete;
*/

-- Step 10: Drop temporary tables when done
-- Uncomment this after everything else is complete
/*
DROP TABLE companies_to_keep;
DROP TABLE companies_to_delete;
*/ 