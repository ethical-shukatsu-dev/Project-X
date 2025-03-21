-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  session_id TEXT,
  user_id UUID,
  properties JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS analytics_events_event_type_idx ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS analytics_events_timestamp_idx ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS analytics_events_session_id_idx ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS analytics_events_user_id_idx ON analytics_events(user_id);

-- Create a function to clean up old analytics events
-- This will keep the table size manageable by removing events older than the specified number of days
CREATE OR REPLACE FUNCTION cleanup_old_analytics_events(days_to_keep INTEGER)
RETURNS void AS $$
BEGIN
  DELETE FROM analytics_events
  WHERE timestamp < (NOW() - (days_to_keep * INTERVAL '1 day'));
END;
$$ LANGUAGE plpgsql; 