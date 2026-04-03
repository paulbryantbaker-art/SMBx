-- 043_analytics.sql
-- Analytics events + daily metrics for admin dashboards

-- Lightweight append-only event log
CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  session_id TEXT,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at);

-- Aggregated daily metrics (materialized by nightly job)
CREATE TABLE IF NOT EXISTS daily_metrics (
  date DATE PRIMARY KEY,
  total_users INTEGER DEFAULT 0,
  active_users_7d INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  deliverables_generated INTEGER DEFAULT 0,
  exports_downloaded INTEGER DEFAULT 0,
  model_interactions INTEGER DEFAULT 0,
  sourcing_scans INTEGER DEFAULT 0,
  mrr_cents BIGINT DEFAULT 0,
  subscriptions_started INTEGER DEFAULT 0,
  subscriptions_canceled INTEGER DEFAULT 0,
  paywall_shown INTEGER DEFAULT 0,
  paywall_converted INTEGER DEFAULT 0,
  avg_session_seconds INTEGER DEFAULT 0,
  errors_total INTEGER DEFAULT 0,
  errors_critical INTEGER DEFAULT 0
);
