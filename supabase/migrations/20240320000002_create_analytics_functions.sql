-- Create analytics functions
-- Function to get unique visitor counts
CREATE OR REPLACE FUNCTION get_unique_visitor_counts(start_date TIMESTAMP, event_type_param TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'unique_sessions', (
      SELECT count(distinct session_id)
      FROM analytics_events
      WHERE analytics_events.event_type = event_type_param
      AND session_id IS NOT NULL
      AND timestamp >= start_date
    ),
    'unique_users', (
      SELECT count(distinct user_id)
      FROM analytics_events
      WHERE analytics_events.event_type = event_type_param
      AND user_id IS NOT NULL
      AND timestamp >= start_date
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function to get event counts
CREATE OR REPLACE FUNCTION get_event_counts(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE(event_type TEXT, count BIGINT) AS $$
BEGIN
  IF end_date IS NULL THEN
    end_date := NOW();
  END IF;

  RETURN QUERY
  SELECT 
    ae.event_type,
    COUNT(*)::BIGINT as count
  FROM 
    analytics_events ae
  WHERE 
    ae.timestamp >= start_date
    AND ae.timestamp <= end_date
  GROUP BY 
    ae.event_type
  ORDER BY 
    count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get daily event counts
CREATE OR REPLACE FUNCTION get_daily_event_counts(
  days INTEGER DEFAULT 30,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE(
  event_date DATE, 
  event_type TEXT, 
  count BIGINT
) AS $$
BEGIN
  IF start_date IS NULL AND end_date IS NULL THEN
    start_date := CURRENT_DATE - (days * INTERVAL '1 day');
    end_date := CURRENT_DATE;
  ELSIF start_date IS NOT NULL AND end_date IS NULL THEN
    end_date := CURRENT_DATE;
  ELSIF start_date IS NULL AND end_date IS NOT NULL THEN
    start_date := end_date::DATE - (days * INTERVAL '1 day');
  END IF;

  RETURN QUERY
  SELECT 
    DATE_TRUNC('day', ae.timestamp)::DATE as event_date,
    ae.event_type,
    COUNT(*)::BIGINT as count
  FROM 
    analytics_events ae
  WHERE 
    ae.timestamp >= start_date
    AND ae.timestamp <= end_date + INTERVAL '1 day' - INTERVAL '1 second'
  GROUP BY 
    event_date, ae.event_type
  ORDER BY 
    event_date, ae.event_type;
END;
$$ LANGUAGE plpgsql;

-- Function to get multiple event counts
CREATE OR REPLACE FUNCTION get_multiple_event_counts(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
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
  IF end_date IS NULL THEN
    end_date := NOW();
  END IF;

  -- Get unique home page visits
  SELECT jsonb_build_object(
    'unique_users', count(distinct user_id)
  )
  INTO home_visits
  FROM analytics_events
  WHERE event_type = 'home_page_visit'
  AND created_at >= start_date
  AND created_at <= end_date;

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
  AND created_at >= start_date
  AND created_at <= end_date;

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
  AND created_at >= start_date
  AND created_at <= end_date;

  -- Get unique recommendations page visits
  SELECT jsonb_build_object(
    'unique_users', count(distinct user_id)
  )
  INTO rec_visits
  FROM analytics_events
  WHERE event_type = 'recommendations_page_visit'
  AND created_at >= start_date
  AND created_at <= end_date;

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
  AND created_at >= start_date
  AND created_at <= end_date;

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
  AND created_at >= start_date
  AND created_at <= end_date;

  signup_stats := jsonb_build_object(
    'email_signups', email_signups,
    'google_signups', google_signups,
    'unique_email_users', unique_email_users,
    'unique_google_users', unique_google_users,
    'unique_users', total_signups,
    'anonymous_email_signups', (SELECT COUNT(DISTINCT user_id) FROM analytics_events 
      WHERE event_type = 'signup_email' 
      AND properties->>'isAnonymous' = 'true' 
      AND user_id IS NOT NULL 
      AND created_at >= start_date
      AND created_at <= end_date),
    'non_anonymous_email_signups', (SELECT COUNT(DISTINCT user_id) FROM analytics_events 
      WHERE event_type = 'signup_email' 
      AND (properties->>'isAnonymous' = 'false' OR properties->>'isAnonymous' IS NULL) 
      AND user_id IS NOT NULL 
      AND created_at >= start_date
      AND created_at <= end_date),
    'anonymous_google_signups', (SELECT COUNT(DISTINCT user_id) FROM analytics_events 
      WHERE event_type = 'signup_google' 
      AND properties->>'isAnonymous' = 'true' 
      AND user_id IS NOT NULL 
      AND created_at >= start_date
      AND created_at <= end_date),
    'non_anonymous_google_signups', (SELECT COUNT(DISTINCT user_id) FROM analytics_events 
      WHERE event_type = 'signup_google' 
      AND (properties->>'isAnonymous' = 'false' OR properties->>'isAnonymous' IS NULL) 
      AND user_id IS NOT NULL 
      AND created_at >= start_date
      AND created_at <= end_date)
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
    AND created_at <= end_date
    AND properties->>'surveyType' is not null
    GROUP BY lower(properties->>'surveyType')
  ) survey_types;

  -- Get step stats
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
    AND created_at <= end_date
    GROUP BY properties->>'stepId'
  ) step_counts;

  -- Get dropoff stats
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
    AND created_at <= end_date
    GROUP BY properties->>'stepId'
  ) dropoff_counts;

  -- Get anonymous user stats
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
  AND created_at >= start_date
  AND created_at <= end_date;

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
  AND created_at >= start_date
  AND created_at <= end_date;

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

-- Add comments
COMMENT ON FUNCTION get_unique_visitor_counts IS 'Returns unique visitor and session counts for a specific event type';
COMMENT ON FUNCTION get_event_counts IS 'Returns counts of all event types within a date range';
COMMENT ON FUNCTION get_daily_event_counts IS 'Returns daily event counts within a specified date range';
COMMENT ON FUNCTION get_multiple_event_counts IS 'Returns detailed analytics for multiple event types'; 