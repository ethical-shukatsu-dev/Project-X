-- SQL query to remove all value_images and their relations

-- Begin transaction to ensure all operations succeed or fail together
BEGIN;

-- Step 1: Update the user_values table to remove selected_image_values references
-- This replaces the JSONB field with an empty JSONB object
UPDATE user_values
SET selected_image_values = '{}'::JSONB
WHERE selected_image_values IS NOT NULL AND selected_image_values != '{}'::JSONB;

-- Step 2: Drop the functions that use value_images
DROP FUNCTION IF EXISTS get_random_value_images_by_category(TEXT, INTEGER);
DROP FUNCTION IF EXISTS get_random_value_images(INTEGER);

-- Step 3: Delete all records from the value_images table
DELETE FROM value_images;

-- Step 4: Remove indexes on value_images (optional, but good for cleanup)
DROP INDEX IF EXISTS value_images_category_idx;
DROP INDEX IF EXISTS value_images_value_name_idx;
DROP INDEX IF EXISTS value_images_pexels_id_idx;
DROP INDEX IF EXISTS value_images_unsplash_id_idx;

-- Commit the transaction
COMMIT;

-- NOTE: This SQL query does not handle cleaning up the actual image files from Supabase Storage.
-- For that, you would need to run a separate process or use the Supabase client to delete files from the
-- 'images' bucket with a path prefix of 'value_images/'.

-- Instructions for cleaning up Supabase Storage:
-- 1. Using the Supabase Dashboard:
--    - Navigate to the Storage section
--    - Go to the 'images' bucket
--    - Filter files with prefix 'value_images/'
--    - Select all and delete
--
-- 2. Using the Supabase JavaScript client:
--    const { supabase } = require('@supabase/supabase-js')
--    
--    async function cleanupStorageFiles() {
--      const { data, error } = await supabase
--        .storage
--        .from('images')
--        .list('value_images');
--    
--      if (error) {
--        console.error('Error listing files:', error);
--        return;
--      }
--    
--      for (const file of data) {
--        const { error: deleteError } = await supabase
--          .storage
--          .from('images')
--          .remove([`value_images/${file.name}`]);
--    
--        if (deleteError) {
--          console.error(`Error deleting file ${file.name}:`, deleteError);
--        }
--      }
--    
--      console.log('Storage cleanup completed');
--    }
--    
--    cleanupStorageFiles();
