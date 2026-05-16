-- 066: V19 market-intelligence runtime
-- Deal-level and portfolio-level market intelligence profiles, sources, and refresh jobs.

CREATE TABLE IF NOT EXISTS market_intelligence_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  organization_id INTEGER,
  deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
  scope TEXT NOT NULL DEFAULT 'deal',
  profile_key TEXT NOT NULL,
  industry TEXT,
  naics_code TEXT,
  geography TEXT,
  league TEXT,
  role_context TEXT,
  transaction_type TEXT,
  freshness_status TEXT NOT NULL DEFAULT 'seeded',
  confidence NUMERIC(4,3),
  source_count INTEGER NOT NULL DEFAULT 0,
  market_summary TEXT,
  buyer_universe_summary TEXT,
  capital_availability_summary TEXT,
  forecast_summary TEXT,
  rule_change_summary TEXT,
  source_gap_summary TEXT,
  signals JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_gaps JSONB NOT NULL DEFAULT '[]'::jsonb,
  rule_changes JSONB NOT NULL DEFAULT '[]'::jsonb,
  forecasts JSONB NOT NULL DEFAULT '[]'::jsonb,
  buyer_universe JSONB NOT NULL DEFAULT '{}'::jsonb,
  capital_stack JSONB NOT NULL DEFAULT '{}'::jsonb,
  citations JSONB NOT NULL DEFAULT '[]'::jsonb,
  evidence_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_researched_at TIMESTAMPTZ,
  next_refresh_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_market_intelligence_profiles_deal_scope
  ON market_intelligence_profiles(user_id, deal_id, scope)
  WHERE deal_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_market_intelligence_profiles_user
  ON market_intelligence_profiles(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_market_intelligence_profiles_deal
  ON market_intelligence_profiles(deal_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS market_intelligence_sources (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES market_intelligence_profiles(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  title TEXT NOT NULL,
  publisher TEXT,
  url TEXT,
  published_at TIMESTAMPTZ,
  retrieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reliability TEXT NOT NULL DEFAULT 'system',
  summary TEXT,
  citation_tag TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_intelligence_sources_profile
  ON market_intelligence_sources(profile_id, source_type, retrieved_at DESC);

CREATE TABLE IF NOT EXISTS market_intelligence_jobs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  organization_id INTEGER,
  deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
  profile_id INTEGER REFERENCES market_intelligence_profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  trigger_reason TEXT NOT NULL DEFAULT 'manual',
  source_surface TEXT NOT NULL DEFAULT 'system',
  source_agent TEXT,
  action_event_id INTEGER REFERENCES agency_action_events(id) ON DELETE SET NULL,
  usage_event_id INTEGER REFERENCES agency_usage_events(id) ON DELETE SET NULL,
  job_input JSONB NOT NULL DEFAULT '{}'::jsonb,
  job_output JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_message TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_intelligence_jobs_user
  ON market_intelligence_jobs(user_id, requested_at DESC);

CREATE INDEX IF NOT EXISTS idx_market_intelligence_jobs_deal_status
  ON market_intelligence_jobs(deal_id, status, requested_at DESC);

CREATE INDEX IF NOT EXISTS idx_market_intelligence_jobs_profile
  ON market_intelligence_jobs(profile_id, requested_at DESC);
