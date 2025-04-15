# Database Schema

This document outlines the database schema for Project X.

## Core Tables

### user_values

```sql
CREATE TABLE user_values (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  values JSONB NOT NULL,
  interests TEXT[] NOT NULL,
  selected_image_values JSONB,
  strengths JSONB -- JSON with user strengths as key-value pairs (1-10 ratings)
);
```

### companies

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
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  company_values TEXT -- Text description of company values
);
```

### recommendations

```sql
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_values(id),
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  matching_points TEXT[] NOT NULL,
  feedback TEXT,
  value_match_ratings JSONB,
  strength_match_ratings JSONB,
  value_matching_details JSONB,
  strength_matching_details JSONB
);
```

### value_images

```sql
CREATE TABLE value_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category VARCHAR(255) NOT NULL,
  value_name VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  pexels_id TEXT,
  unsplash_id TEXT,
  attribution JSONB,
  image_sizes JSONB
);
```

## Analytics Tables

### analytics_events

```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  session_id TEXT,
  user_id UUID,
  properties JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Database Functions

### Analytics Functions

- `get_unique_visitor_counts(start_date, event_type)`: Get unique visitors for an event type
- `get_event_counts(start_date, end_date)`: Get counts for all event types
- `get_daily_event_counts(days, start_date, end_date)`: Get daily event counts
- `get_multiple_event_counts(start_date, end_date)`: Get detailed analytics across multiple event types

### Value Images Functions

- `get_random_value_images_by_category(category, limit)`: Get random images for a category
- `get_random_value_images(limit)`: Get random images from all categories
- `random_value_images`: View that provides randomized access to value images

### Utility Functions

- `cleanup_old_analytics_events(days)`: Remove old analytics data
- `check_table_exists(table_name)`: Check if a table exists

## Maintenance

### Data Cleanup

```sql
-- Clean up old analytics data (only for dev environment)
SELECT cleanup_old_analytics_events(90);
```

### Monitoring

```sql
-- Monitor table sizes
SELECT pg_size_pretty(pg_total_relation_size('analytics_events'));

-- Check analytics health
SELECT get_multiple_event_counts(NOW() - INTERVAL '7 days');
```
