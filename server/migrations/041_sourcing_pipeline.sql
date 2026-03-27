-- 041_sourcing_pipeline.sql
-- Sourcing Engine: 5-stage pipeline tables
-- sourcing_briefs → sourcing_portfolios → sourcing_candidates → sourcing_pipeline_jobs

-- ─── Stage 1 output: Acquisition Intelligence Brief ─────────────────

CREATE TABLE IF NOT EXISTS sourcing_briefs (
  id SERIAL PRIMARY KEY,
  thesis_id INTEGER NOT NULL REFERENCES buyer_theses(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Input snapshot (what was fed to Sonnet)
  input_snapshot JSONB NOT NULL DEFAULT '{}',

  -- Structured output sections
  market_density JSONB,
  deal_economics JSONB,
  acquisition_signals JSONB,
  competitive_landscape JSONB,
  key_risks JSONB,
  recommended_params JSONB,

  -- Full narrative
  narrative_markdown TEXT,

  -- Generation metadata
  model_used TEXT DEFAULT 'claude-sonnet-4-6',
  generation_time_ms INTEGER,
  input_tokens INTEGER,
  output_tokens INTEGER,
  status TEXT NOT NULL DEFAULT 'generating'
    CHECK (status IN ('generating', 'complete', 'failed')),
  error_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sourcing_briefs_thesis ON sourcing_briefs(thesis_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_briefs_user ON sourcing_briefs(user_id);

-- ─── Stage 5 container: Portfolio ───────────────────────────────────

CREATE TABLE IF NOT EXISTS sourcing_portfolios (
  id SERIAL PRIMARY KEY,
  thesis_id INTEGER NOT NULL REFERENCES buyer_theses(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brief_id INTEGER REFERENCES sourcing_briefs(id) ON DELETE SET NULL,

  name TEXT NOT NULL,

  -- Denormalized tier counts (updated after scoring)
  total_candidates INTEGER DEFAULT 0,
  a_tier_count INTEGER DEFAULT 0,
  b_tier_count INTEGER DEFAULT 0,
  c_tier_count INTEGER DEFAULT 0,
  d_tier_count INTEGER DEFAULT 0,

  -- Pipeline progress
  pipeline_status TEXT NOT NULL DEFAULT 'initializing'
    CHECK (pipeline_status IN (
      'initializing', 'brief_generating', 'expanding', 'enriching',
      'scoring', 'ready', 'stale', 'failed'
    )),
  stage_progress JSONB DEFAULT '{}',
  -- e.g. { "stage": 2, "pct": 45, "message": "Searching Houston TX..." }

  -- Refresh tracking
  last_expansion_at TIMESTAMPTZ,
  last_enrichment_at TIMESTAMPTZ,
  last_score_at TIMESTAMPTZ,
  next_refresh_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sourcing_portfolios_thesis ON sourcing_portfolios(thesis_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_portfolios_user ON sourcing_portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_portfolios_status ON sourcing_portfolios(pipeline_status);

-- ─── Stages 2-4 pipeline results: Candidates ───────────────────────

CREATE TABLE IF NOT EXISTS sourcing_candidates (
  id SERIAL PRIMARY KEY,
  portfolio_id INTEGER NOT NULL REFERENCES sourcing_portfolios(id) ON DELETE CASCADE,
  thesis_id INTEGER NOT NULL REFERENCES buyer_theses(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Identity
  google_place_id TEXT,
  name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  lat NUMERIC,
  lng NUMERIC,
  phone TEXT,
  website_url TEXT,

  -- Enrichment tier tracking (0=raw placeId, 1=essentials, 2=pro, 3=website, 4=deep)
  enrichment_tier INTEGER NOT NULL DEFAULT 0,
  enrichment_data JSONB DEFAULT '{}',

  -- Tier 1: Google Essentials
  business_status TEXT,
  place_types TEXT[],

  -- Tier 2: Google Pro
  rating NUMERIC(2,1),
  review_count INTEGER,
  price_level INTEGER,

  -- Tier 3: Haiku website analysis
  year_founded INTEGER,
  team_size_estimate TEXT,
  services TEXT[],
  certifications TEXT[],
  succession_signals TEXT[],
  recurring_revenue_signals TEXT[],
  commercial_vs_residential TEXT,
  owner_dependency_signals TEXT[],

  -- Tier 4: Sonnet deep analysis
  estimated_revenue_low_cents BIGINT,
  estimated_revenue_high_cents BIGINT,
  estimated_employees INTEGER,
  growth_indicators TEXT[],
  risk_factors TEXT[],
  ai_summary TEXT,

  -- SBA cross-reference
  sba_match BOOLEAN DEFAULT FALSE,
  sba_loan_data JSONB,
  -- e.g. { "loanAmount": 450000, "approvalDate": "2017-03-15", "yearsSince": 9, "exitSignal": "HIGH" }

  -- Scoring (Stage 4) — 6 dimensions totaling 100
  score_size INTEGER DEFAULT 0,               -- /20
  score_geography INTEGER DEFAULT 0,          -- /15
  score_industry INTEGER DEFAULT 0,           -- /15
  score_acquisition_signals INTEGER DEFAULT 0,-- /20
  score_quality INTEGER DEFAULT 0,            -- /15
  score_risk INTEGER DEFAULT 0,               -- /15 (inverted: higher = fewer risks)
  total_score INTEGER DEFAULT 0,              -- /100
  tier TEXT CHECK (tier IN ('A', 'B', 'C', 'D')),
  score_flags TEXT[],
  ai_score_summary TEXT,

  -- User pipeline status
  pipeline_status TEXT NOT NULL DEFAULT 'new'
    CHECK (pipeline_status IN (
      'new', 'reviewing', 'contacted', 'responded',
      'meeting', 'pursuing', 'passed', 'archived'
    )),
  user_notes TEXT,
  pipeline_status_changed_at TIMESTAMPTZ,

  -- Dedup
  fingerprint TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sourcing_candidates_dedup
  ON sourcing_candidates(portfolio_id, fingerprint) WHERE fingerprint IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sourcing_candidates_portfolio ON sourcing_candidates(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_candidates_thesis ON sourcing_candidates(thesis_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_candidates_tier ON sourcing_candidates(portfolio_id, tier, total_score DESC);
CREATE INDEX IF NOT EXISTS idx_sourcing_candidates_status ON sourcing_candidates(portfolio_id, pipeline_status);
CREATE INDEX IF NOT EXISTS idx_sourcing_candidates_place ON sourcing_candidates(google_place_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_candidates_score ON sourcing_candidates(portfolio_id, total_score DESC);

-- ─── Pipeline job tracking ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sourcing_pipeline_jobs (
  id SERIAL PRIMARY KEY,
  portfolio_id INTEGER NOT NULL REFERENCES sourcing_portfolios(id) ON DELETE CASCADE,
  stage INTEGER NOT NULL,
  job_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'complete', 'failed', 'rate_limited')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pipeline_jobs_portfolio ON sourcing_pipeline_jobs(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_jobs_status ON sourcing_pipeline_jobs(portfolio_id, status);
