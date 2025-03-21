-- Create a function to get event counts by type
CREATE OR REPLACE FUNCTION get_event_counts(start_date TIMESTAMP WITH TIME ZONE)
RETURNS TABLE(event_type TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ae.event_type,
    COUNT(*)::BIGINT as count
  FROM 
    analytics_events ae
  WHERE 
    ae.timestamp >= start_date
  GROUP BY 
    ae.event_type
  ORDER BY 
    count DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get daily event counts for trending
CREATE OR REPLACE FUNCTION get_daily_event_counts(days INTEGER)
RETURNS TABLE(
  event_date DATE, 
  event_type TEXT, 
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE_TRUNC('day', ae.timestamp)::DATE as event_date,
    ae.event_type,
    COUNT(*)::BIGINT as count
  FROM 
    analytics_events ae
  WHERE 
    ae.timestamp >= (CURRENT_DATE - (days * INTERVAL '1 day'))
  GROUP BY 
    event_date, ae.event_type
  ORDER BY 
    event_date, ae.event_type;
END;
$$ LANGUAGE plpgsql; 