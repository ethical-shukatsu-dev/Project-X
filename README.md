# Project X - Values-Based Company Matching Platform

Project X is a web application that helps job-seeking students find companies that align with their values and interests. The platform uses AI to match users with companies based on a short questionnaire.

## Features

- **Simple Values Questionnaire**: Complete a short questionnaire about your work preferences and interests in under 3 minutes.
- **AI-Powered Recommendations**: Get personalized company recommendations based on your values and interests.
- **Company Details**: View detailed information about each recommended company, including why it's a good match for you.
- **Feedback System**: Provide feedback on recommendations to improve future matches.
- **Visual Values Selection**: Choose values through image-based selection for a more intuitive experience.

## Tech Stack

- **Frontend**: Next.js, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase
- **AI**: OpenAI API
- **Deployment**: Vercel
- **Runtime**: Bun

## Getting Started

### Prerequisites

- Bun (v1.0 or later)
- Supabase account
- OpenAI API key

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### Database Setup

1. Create a new Supabase project
2. Create the necessary tables by following the instructions in `SUPABASE_SETUP.md`
3. Run the SQL script in `setup-tables.sql` to create tables and add sample data
4. Verify your Supabase setup by running:

```bash
bun run verify-supabase
```

This will check if your Supabase connection is working and if all required tables are set up correctly.

### Database Schema

**user_values**
```sql
CREATE TABLE user_values (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  values JSONB NOT NULL,
  interests TEXT[] NOT NULL,
  selected_image_values JSONB
);
```

**companies**
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  description TEXT NOT NULL,
  size TEXT NOT NULL,
  values JSONB NOT NULL,
  logo_url TEXT,
  site_url TEXT,
  data_source TEXT DEFAULT 'manual',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**recommendations**
```sql
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_values(id),
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  matching_points TEXT[] NOT NULL,
  feedback TEXT
);
```

**value_images**
```sql
CREATE TABLE value_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category VARCHAR(255) NOT NULL, -- e.g., 'work_environment', 'leadership_style'
  value_name VARCHAR(255) NOT NULL, -- e.g., 'collaborative', 'mentorship'
  image_url TEXT NOT NULL,
  description TEXT, -- Description of what the image represents
  tags TEXT[], -- Array of tags for better categorization and searching
  pexels_id TEXT, -- The Pexels photo ID for proper attribution
  unsplash_id TEXT, -- The Unsplash photo ID for proper attribution
  attribution JSONB, -- Attribution information including photographer name, photographer URL, and photo URL
  image_sizes JSONB -- Different size variants of the image for responsive usage
);
```

5. Create the required database functions:

```sql
-- Analytics function for counting unique visitors and actions
create or replace function get_unique_visitor_counts(start_date timestamp, event_type_param text)
returns json
language plpgsql
security definer
as $$
declare
  result json;
begin
  select json_build_object(
    'unique_sessions', (
      select count(distinct session_id)
      from analytics_events
      where analytics_events.event_type = event_type_param
      and session_id is not null
      and timestamp >= start_date
    ),
    'unique_users', (
      select count(distinct user_id)
      from analytics_events
      where analytics_events.event_type = event_type_param
      and user_id is not null
      and timestamp >= start_date
    )
  ) into result;
  
  return result;
end;
$$;

-- Function to get unique counts for multiple event types
CREATE OR REPLACE FUNCTION get_multiple_event_counts(start_date timestamp with time zone)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  home_visits jsonb;
  survey_start jsonb;
  survey_complete jsonb;
  rec_visits jsonb;
  company_int jsonb;
  signup_stats jsonb;
  survey_type_stats jsonb;
  step_stats jsonb;
  dropoff_stats jsonb;
  anon_stats jsonb;
  dialog_closes jsonb;
  email_signups bigint;
  google_signups bigint;
  unique_email_users bigint;
  unique_google_users bigint;
  total_signups bigint;
  total_anon_users bigint;
  completed_anon_surveys bigint;
  anon_survey_starts bigint;
  non_anon_survey_starts bigint;
BEGIN
  -- Get unique home page visits
  SELECT jsonb_build_object(
    'unique_users', count(distinct user_id)
  )
  INTO home_visits
  FROM analytics_events
  WHERE event_type = 'home_page_visit'
  AND created_at >= start_date;

  -- Get unique survey starts with anonymous breakdown
  SELECT 
    count(distinct case when properties->>'isAnonymous' = 'true' then user_id end) as anon_starts,
    count(distinct case when properties->>'isAnonymous' = 'false' then user_id end) as non_anon_starts,
    count(distinct user_id) as total_starts
  INTO 
    anon_survey_starts,
    non_anon_survey_starts,
    survey_start
  FROM analytics_events
  WHERE event_type = 'survey_start_click'
  AND created_at >= start_date;

  survey_start := jsonb_build_object(
    'unique_users', survey_start,
    'anonymous_starts', anon_survey_starts,
    'non_anonymous_starts', non_anon_survey_starts
  );

  -- Get unique survey completions
  SELECT jsonb_build_object(
    'unique_users', count(distinct user_id)
  )
  INTO survey_complete
  FROM analytics_events
  WHERE event_type = 'survey_completed'
  AND created_at >= start_date;

  -- Get unique recommendations page visits
  SELECT jsonb_build_object(
    'unique_users', count(distinct user_id)
  )
  INTO rec_visits
  FROM analytics_events
  WHERE event_type = 'recommendations_page_visit'
  AND created_at >= start_date;

  -- Get unique company interested clicks and total clicks with anonymous breakdown
  SELECT jsonb_build_object(
    'unique_users', count(distinct user_id),
    'total_clicks', count(*),
    'anonymous_clicks', count(distinct case when properties->>'isAnonymous' = 'true' then user_id end),
    'non_anonymous_clicks', count(distinct case when properties->>'isAnonymous' = 'false' then user_id end)
  )
  INTO company_int
  FROM analytics_events
  WHERE event_type = 'company_interested_click'
  AND created_at >= start_date;

  -- Get signup counts
  SELECT 
    count(*) FILTER (WHERE event_type = 'signup_email'),
    count(*) FILTER (WHERE event_type = 'signup_google'),
    count(distinct user_id) FILTER (WHERE event_type = 'signup_email'),
    count(distinct user_id) FILTER (WHERE event_type = 'signup_google'),
    count(distinct user_id)
  INTO 
    email_signups,
    google_signups,
    unique_email_users,
    unique_google_users,
    total_signups
  FROM analytics_events
  WHERE event_type IN ('signup_email', 'signup_google')
  AND created_at >= start_date;

  signup_stats := jsonb_build_object(
    'email_signups', email_signups,
    'google_signups', google_signups,
    'unique_email_users', unique_email_users,
    'unique_google_users', unique_google_users,
    'unique_users', total_signups
  );

  -- Get survey type stats
  SELECT jsonb_object_agg(
    coalesce(survey_type, 'unknown'),
    jsonb_build_object('unique_users', unique_users)
  )
  INTO survey_type_stats
  FROM (
    SELECT
      lower(properties->>'surveyType') as survey_type,
      count(distinct user_id) as unique_users
    FROM analytics_events
    WHERE event_type = 'survey_completed'
    AND created_at >= start_date
    AND properties->>'surveyType' is not null
    GROUP BY lower(properties->>'surveyType')
  ) survey_types;

  -- Get step stats - FIXED to use the correct event type 'survey_step_completed' 
  -- instead of previously incorrect 'survey_step_complete'
  -- And return as an array of objects instead of a JSON object
  SELECT jsonb_agg(
    jsonb_build_object(
      'step_id', step,
      'unique_users', unique_users
    )
  )
  INTO step_stats
  FROM (
    SELECT
      properties->>'stepId' as step,
      count(distinct user_id) as unique_users
    FROM analytics_events
    WHERE event_type = 'survey_step_completed'
    AND created_at >= start_date
    GROUP BY properties->>'stepId'
  ) step_counts;

  -- Get dropoff stats - Using 'survey_step_abandoned' instead of 'survey_step_dropoff'
  -- Also return as an array for consistency
  SELECT jsonb_agg(
    jsonb_build_object(
      'step_id', step,
      'unique_users', unique_users,
      'avg_time_spent', avg_time_spent
    )
  )
  INTO dropoff_stats
  FROM (
    SELECT
      properties->>'stepId' as step,
      count(distinct user_id) as unique_users,
      avg((properties->>'timeSpentSeconds')::numeric) as avg_time_spent
    FROM analytics_events
    WHERE event_type = 'survey_step_abandoned'
    AND created_at >= start_date
    GROUP BY properties->>'stepId'
  ) dropoff_counts;

  -- Get anonymous user stats with starts included
  SELECT
    count(distinct user_id),
    count(distinct case when event_type = 'survey_completed' then user_id end),
    count(distinct case when event_type = 'survey_start_click' then user_id end)
  INTO
    total_anon_users,
    completed_anon_surveys,
    anon_survey_starts
  FROM analytics_events
  WHERE properties->>'isAnonymous' = 'true'
  AND created_at >= start_date;

  anon_stats := jsonb_build_object(
    'total_unique_users', total_anon_users,
    'completed_surveys', completed_anon_surveys,
    'started_surveys', anon_survey_starts
  );

  -- Get dialog closes stats
  SELECT jsonb_build_object(
    'unique_users', count(distinct user_id),
    'total_clicks', count(*)
  )
  INTO dialog_closes
  FROM analytics_events
  WHERE event_type = 'dialog_closes'
  AND created_at >= start_date;

  -- Return combined stats
  RETURN jsonb_build_object(
    'home_page_visits', home_visits,
    'survey_starts', survey_start,
    'survey_completions', survey_complete,
    'recommendations_page_visits', rec_visits,
    'company_interests', company_int,
    'signups', signup_stats,
    'survey_types', survey_type_stats,
    'survey_steps', step_stats,
    'survey_dropoffs', dropoff_stats,
    'anonymous_users', anon_stats,
    'dialog_closes', dialog_closes
  );
END;
$$; 

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/project-x.git
cd project-x
```

2. Install dependencies
```bash
bun install
```

3. Run the development server
```bash
bun run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

The application can be easily deployed to Vercel:

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Add the environment variables in the Vercel dashboard
4. Deploy

## License

This project is licensed under the MIT License - see the LICENSE file for details.