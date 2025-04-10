# Testing the Supabase Integration

This guide will help you test that your Supabase integration is working correctly with the Project X application.

## Prerequisites

Before testing, make sure you have:

1. Set up your Supabase project following the instructions in `SUPABASE_SETUP.md`
2. Created the required tables and added sample data using `setup-tables.sql`
3. Configured your `.env.local` file with the correct Supabase URL and key
4. Verified your Supabase connection using `bun run verify-supabase`

## Testing the Questionnaire

1. Start the development server:

   ```bash
   bun run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. Click on "Get Started" to go to the questionnaire page

4. Fill out the questionnaire with your preferences and interests

5. Submit the form

6. Check your Supabase dashboard:
   - Go to the "Table Editor" in your Supabase dashboard
   - Select the `user_values` table
   - You should see a new entry with the values and interests you submitted

## Testing Recommendations

1. After submitting the questionnaire, you should be redirected to the recommendations page

2. The page should display company recommendations based on your values

3. Check your Supabase dashboard:

   - Go to the "Table Editor" in your Supabase dashboard
   - Select the `recommendations` table
   - You should see new entries with recommendations for the user

4. Test the feedback system:
   - Click "Interested" or "Not Interested" on some recommendations
   - Check the `recommendations` table in Supabase
   - The `feedback` column should be updated for those recommendations

## Troubleshooting

If you encounter issues:

1. **No recommendations appear**:

   - Check the browser console for errors
   - Verify that your OpenAI API key is correct
   - Check that your Supabase tables have sample company data

2. **Form submission fails**:

   - Check that your Supabase URL and key are correct
   - Verify that the `user_values` table exists and has the correct schema

3. **Feedback doesn't update**:
   - Check the browser console for errors
   - Verify that the `recommendations` table has the correct schema
   - Check that the recommendation IDs are being passed correctly

## Advanced Testing

For more advanced testing:

1. Use the Supabase SQL Editor to query your tables directly
2. Check the Network tab in your browser's developer tools to see the API requests
3. Add `console.log` statements to your API routes to debug server-side issues
