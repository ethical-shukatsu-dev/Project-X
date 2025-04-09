-- Update get_event_counts function to accept an end_date parameter
CREATE OR REPLACE FUNCTION get_event_counts(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE(event_type TEXT, count BIGINT) AS $$
BEGIN
  IF end_date IS NULL THEN
    end_date := NOW(); -- Default to current time if not provided
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

-- Update get_daily_event_counts function to support custom date ranges
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
  -- Handle the different ways this function can be called
  IF start_date IS NULL AND end_date IS NULL THEN
    -- Original behavior: Use days parameter to determine range
    start_date := CURRENT_DATE - (days * INTERVAL '1 day');
    end_date := CURRENT_DATE;
  ELSIF start_date IS NOT NULL AND end_date IS NULL THEN
    -- Only start_date provided, set end_date to current date
    end_date := CURRENT_DATE;
  ELSIF start_date IS NULL AND end_date IS NOT NULL THEN
    -- Only end_date provided, calculate start_date based on days
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
    AND ae.timestamp <= end_date + INTERVAL '1 day' - INTERVAL '1 second' -- Include the entire end date
  GROUP BY 
    event_date, ae.event_type
  ORDER BY 
    event_date, ae.event_type;
END;
$$ LANGUAGE plpgsql;

-- Update get_multiple_event_counts function to accept an end_date parameter
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
    end_date := NOW(); -- Default to current time if not provided
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

  -- Get unique dialog closes
  SELECT jsonb_build_object(
    'total', count(*),
    'unique_users', count(distinct user_id)
  )
  INTO dialog_closes
  FROM analytics_events
  WHERE event_type = 'signup_dialog_close'
  AND created_at >= start_date
  AND created_at <= end_date;

  -- Get survey types (text vs image)
  SELECT jsonb_build_object(
    'text', json_build_object(
      'unique_users', count(distinct user_id) 
      FILTER (WHERE properties->>'surveyType' = 'text')
    ),
    'image', json_build_object(
      'unique_users', count(distinct user_id) 
      FILTER (WHERE properties->>'surveyType' = 'image')
    )
  )
  INTO survey_type_stats
  FROM analytics_events
  WHERE event_type = 'survey_start_click'
  AND created_at >= start_date
  AND created_at <= end_date;

  -- Return everything as a single JSON object
  RETURN jsonb_build_object(
    'home_page_visits', home_visits,
    'survey_starts', survey_start,
    'survey_completions', survey_complete,
    'signups', signup_stats,
    'survey_types', survey_type_stats,
    'dialog_closes', dialog_closes
  );
END;
$$; 