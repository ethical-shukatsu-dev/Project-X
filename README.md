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
create or replace function get_multiple_event_counts(start_date timestamp with time zone)
returns jsonb
language plpgsql
security definer
as $$
declare
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
  email_signups bigint;
  google_signups bigint;
  total_signups bigint;
  total_anon_users bigint;
  completed_anon_surveys bigint;
begin
  -- Get unique home page visits
  select jsonb_build_object(
    'unique_users', count(distinct user_id)
  )
  into home_visits
  from analytics_events
  where event_type = 'home_page_visit'
  and created_at >= start_date;

  -- Get unique survey starts
  select jsonb_build_object(
    'unique_users', count(distinct user_id)
  )
  into survey_start
  from analytics_events
  where event_type = 'survey_start_click'
  and created_at >= start_date;

  -- Get unique survey completions
  select jsonb_build_object(
    'unique_users', count(distinct user_id)
  )
  into survey_complete
  from analytics_events
  where event_type = 'survey_completed'
  and created_at >= start_date;

  -- Get unique recommendations page visits
  select jsonb_build_object(
    'unique_users', count(distinct user_id)
  )
  into rec_visits
  from analytics_events
  where event_type = 'recommendations_page_visit'
  and created_at >= start_date;

  -- Get unique company interested clicks and total clicks
  select jsonb_build_object(
    'unique_users', count(distinct user_id),
    'total_clicks', count(*)
  )
  into company_int
  from analytics_events
  where event_type = 'company_interested_click'
  and created_at >= start_date;

  -- Get signup counts
  select 
    count(*) filter (where event_type = 'signup_email'),
    count(*) filter (where event_type = 'signup_google'),
    count(distinct user_id)
  into 
    email_signups,
    google_signups,
    total_signups
  from analytics_events
  where event_type in ('signup_email', 'signup_google')
  and created_at >= start_date;

  signup_stats := jsonb_build_object(
    'email_signups', email_signups,
    'google_signups', google_signups,
    'unique_users', total_signups
  );

  -- Get survey type stats
  select jsonb_object_agg(
    survey_type,
    jsonb_build_object('unique_users', unique_users)
  )
  into survey_type_stats
  from (
    select
      properties->>'surveyType' as survey_type,
      count(distinct user_id) as unique_users
    from analytics_events
    where event_type = 'survey_completed'
    and created_at >= start_date
    group by properties->>'surveyType'
  ) survey_types;

  -- Get step stats
  select jsonb_object_agg(
    step,
    jsonb_build_object('unique_users', unique_users)
  )
  into step_stats
  from (
    select
      properties->>'step' as step,
      count(distinct user_id) as unique_users
    from analytics_events
    where event_type = 'survey_step_complete'
    and created_at >= start_date
    group by properties->>'step'
  ) step_counts;

  -- Get dropoff stats
  select jsonb_object_agg(
    step,
    jsonb_build_object(
      'unique_users', unique_users,
      'avg_time_spent', avg_time_spent
    )
  )
  into dropoff_stats
  from (
    select
      properties->>'step' as step,
      count(distinct user_id) as unique_users,
      avg((properties->>'timeSpentSeconds')::numeric) as avg_time_spent
    from analytics_events
    where event_type = 'survey_step_dropoff'
    and created_at >= start_date
    group by properties->>'step'
  ) dropoff_counts;

  -- Get anonymous user stats
  select
    count(distinct user_id),
    count(distinct case when event_type = 'survey_completed' then user_id end)
  into
    total_anon_users,
    completed_anon_surveys
  from analytics_events
  where properties->>'isAnonymous' = 'true'
  and created_at >= start_date;

  anon_stats := jsonb_build_object(
    'total_unique_users', total_anon_users,
    'completed_surveys', completed_anon_surveys
  );

  -- Return combined stats
  return jsonb_build_object(
    'home_page_visits', home_visits,
    'survey_starts', survey_start,
    'survey_completions', survey_complete,
    'recommendations_page_visits', rec_visits,
    'company_interests', company_int,
    'signups', signup_stats,
    'survey_types', survey_type_stats,
    'survey_steps', step_stats,
    'survey_dropoffs', dropoff_stats,
    'anonymous_users', anon_stats
  );
end;
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