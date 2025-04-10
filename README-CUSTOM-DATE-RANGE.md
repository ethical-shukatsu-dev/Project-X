# Adding Custom Date Range to Analytics Dashboard

This feature allows users to filter analytics data by custom date ranges in addition to the preset time periods (24h, 7d, 30d, all).

## Implementation Details

1. Added `custom` option to the `TimeRange` type
2. Created `DateRange` interface to store start and end dates
3. Updated the `useAnalytics` hook to handle custom date ranges
4. Added date picker UI component to the analytics dashboard
5. Updated the API routes to handle custom date parameters
6. Created new database functions that support date ranges

## Deployment Steps

### 1. Deploy Frontend Changes

The following files have been modified for the frontend implementation:

- `src/types/analytics.ts` - Added `custom` to `TimeRange` type and created `DateRange` interface
- `src/hooks/useAnalytics.ts` - Updated to handle custom date ranges
- `src/components/analytics/AnalyticsDashboard.tsx` - Added date picker UI

These changes will be deployed automatically when the application is deployed.

### 2. Deploy Database Function Changes

The database functions need to be updated to support custom date ranges. Execute the SQL in `migrations/custom-date-range-functions.sql` on your Supabase instance:

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of `migrations/custom-date-range-functions.sql`
5. Run the query to update the functions

This will update the following functions:

- `get_event_counts` - To accept an end_date parameter
- `get_daily_event_counts` - To support custom date ranges
- `get_multiple_event_counts` - To accept an end_date parameter

### 3. Deploy API Changes

The following API routes have been updated:

- `src/app/api/admin/analytics/route.ts` - Updated to handle custom date ranges
- `src/app/api/admin/analytics/trends/route.ts` - Updated to support date parameters

These changes will be deployed automatically when the application is deployed.

## Usage

1. Go to the Analytics Dashboard
2. Click on the "Custom Range" tab
3. Select start and end dates in the date picker dialog
4. Click "Apply Range" to filter the analytics data

The dashboard will update to show data only from the selected date range.

## Limitations

- The date range must be valid (start date must be before end date)
- For performance reasons, extremely large date ranges (multiple years) may be slow to load
- Historical data availability depends on your data retention policy
