-- Create analytics tables and functions
-- Create analytics_events table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  session_id TEXT,
  user_id UUID,
  properties JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for analytics_events
CREATE INDEX analytics_events_event_type_idx ON analytics_events(event_type);
CREATE INDEX analytics_events_timestamp_idx ON analytics_events(timestamp);
CREATE INDEX analytics_events_session_id_idx ON analytics_events(session_id);
CREATE INDEX analytics_events_user_id_idx ON analytics_events(user_id);

-- Create ab_testing table
CREATE TABLE ab_testing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_anonymous BOOLEAN NOT NULL
);

-- Add RLS policy for ab_testing
ALTER TABLE ab_testing ENABLE ROW LEVEL SECURITY;

-- Grant permissions to service role
GRANT ALL ON ab_testing TO service_role;

-- Create policy for service role
CREATE POLICY "Service role can manage all ab_testing data"
  ON ab_testing
  FOR ALL
  TO service_role
  USING (true);

-- Create function to clean up old analytics events
CREATE OR REPLACE FUNCTION cleanup_old_analytics_events(days_to_keep INTEGER)
RETURNS void AS $$
BEGIN
  DELETE FROM analytics_events
  WHERE timestamp < (NOW() - (days_to_keep * INTERVAL '1 day'));
END;
$$ LANGUAGE plpgsql;

-- Create function to check if a table exists
CREATE OR REPLACE FUNCTION check_table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = table_name
  ) INTO table_exists;
  
  RETURN table_exists;
END;
$$;

-- Add comments
COMMENT ON TABLE analytics_events IS 'Stores user interaction events for analytics';
COMMENT ON TABLE ab_testing IS 'Stores A/B testing configuration and results';
COMMENT ON FUNCTION cleanup_old_analytics_events IS 'Removes analytics events older than specified days';
COMMENT ON FUNCTION check_table_exists IS 'Utility function to check if a table exists in the public schema'; 