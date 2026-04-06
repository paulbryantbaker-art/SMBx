-- 047_admin_console.sql
-- IP capture for analytics events + geo cache for admin traffic views

-- Add ip_address column to analytics_events for visitor tracking
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS ip_address INET;
CREATE INDEX IF NOT EXISTS idx_analytics_events_ip ON analytics_events(ip_address) WHERE ip_address IS NOT NULL;

-- Partial index for fast page_view queries (admin traffic tab)
CREATE INDEX IF NOT EXISTS idx_analytics_events_page_view
  ON analytics_events(event_type, created_at DESC)
  WHERE event_type = 'page_view';

-- Geo cache table — resolved lazily when admin views traffic
CREATE TABLE IF NOT EXISTS ip_geo_cache (
  ip_address INET PRIMARY KEY,
  city TEXT,
  region TEXT,         -- state/province
  country TEXT,
  country_code TEXT,
  lat NUMERIC(9,6),
  lon NUMERIC(9,6),
  isp TEXT,
  resolved_at TIMESTAMPTZ DEFAULT NOW()
);
