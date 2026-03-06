-- 023: Intelligence schema — company profiles expansion, theses, discovery targets
-- Enables knowledge graph, buyer demand signals, and sourcing engine (Sessions 4+)

-- ============================================================
-- Expand company_profiles (created in 020) with intelligence columns
-- ============================================================
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS industry_label TEXT;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS metro TEXT;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS deal_id INTEGER REFERENCES deals(id);

-- Financials (user-reported, from Yulia conversations)
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS revenue_reported BIGINT;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS sde_reported BIGINT;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS ebitda_reported BIGINT;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS employee_count INTEGER;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS years_in_operation INTEGER;

-- Financials (AI-estimated, from enrichment pipeline)
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS revenue_estimated_low BIGINT;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS revenue_estimated_high BIGINT;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS revenue_estimation_method TEXT;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS revenue_confidence NUMERIC(3,2);

-- Valuation
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS valuation_low BIGINT;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS valuation_high BIGINT;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS valuation_method TEXT;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS valuation_updated_at TIMESTAMPTZ;

-- Deal status
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS deal_status_v2 TEXT DEFAULT 'private';

-- Enrichment
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS domain TEXT;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS domain_registered_date DATE;

-- Sale readiness scoring (Phase 5+)
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS sale_readiness_score INTEGER;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS sale_readiness_signals JSONB DEFAULT '[]';

-- Embedding for semantic matching — requires pgvector extension
-- Run `CREATE EXTENSION IF NOT EXISTS vector;` first if available
-- ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS profile_embedding VECTOR(1536);

CREATE INDEX IF NOT EXISTS idx_company_profiles_session ON company_profiles(session_id);
CREATE INDEX IF NOT EXISTS idx_company_profiles_deal_status_v2 ON company_profiles(deal_status_v2);

-- ============================================================
-- Buyer theses: stored acquisition criteria with live match counts
-- ============================================================
CREATE TABLE IF NOT EXISTS theses (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  deal_id INTEGER REFERENCES deals(id),

  -- Criteria
  buyer_type TEXT,                          -- 'individual' | 'searcher' | 'pe' | 'strategic' | 'family_office'
  industries JSONB DEFAULT '[]',            -- list of NAICS codes or industry labels
  geographies JSONB DEFAULT '[]',           -- states, metros, or 'national'

  revenue_min BIGINT,                       -- in cents
  revenue_max BIGINT,
  sde_min BIGINT,
  sde_max BIGINT,
  deal_value_min BIGINT,
  deal_value_max BIGINT,

  equity_available BIGINT,                  -- how much they can invest
  prefers_sba BOOLEAN DEFAULT false,

  -- Thesis document (the deliverable output)
  thesis_document TEXT,                     -- full markdown content
  thesis_document_generated_at TIMESTAMPTZ,

  -- Match tracking
  internal_match_count INTEGER DEFAULT 0,   -- matches against company_profiles
  last_match_scan_at TIMESTAMPTZ,

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_theses_session ON theses(session_id);
CREATE INDEX IF NOT EXISTS idx_theses_active ON theses(is_active);

-- ============================================================
-- Discovery targets: off-market companies flagged for buyers (Phase 4+)
-- ============================================================
CREATE TABLE IF NOT EXISTS discovery_targets (
  id SERIAL PRIMARY KEY,
  thesis_id INTEGER REFERENCES theses(id),
  company_profile_id INTEGER REFERENCES company_profiles(id),

  -- Source
  source TEXT NOT NULL,                     -- 'google_places' | 'bizbuysell' | 'manual' | 'internal_match'
  source_url TEXT,
  source_id TEXT,                           -- external ID (Google Place ID, BizBuySell listing ID, etc.)

  -- Enrichment status
  enrichment_status TEXT DEFAULT 'pending', -- 'pending' | 'enriching' | 'complete' | 'failed'
  enrichment_attempted_at TIMESTAMPTZ,

  -- Scoring
  thesis_fit_score INTEGER,                 -- 0-100, how well this matches the buyer's thesis
  sale_readiness_score INTEGER,             -- 0-100
  overall_score INTEGER,                    -- composite

  -- Buyer action
  buyer_status TEXT DEFAULT 'flagged',      -- 'flagged' | 'reviewing' | 'pursuing' | 'passed'
  buyer_notes TEXT,
  buyer_actioned_at TIMESTAMPTZ,

  -- Raw data from discovery
  raw_data JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_discovery_targets_thesis ON discovery_targets(thesis_id);
CREATE INDEX IF NOT EXISTS idx_discovery_targets_status ON discovery_targets(buyer_status);
CREATE INDEX IF NOT EXISTS idx_discovery_targets_source ON discovery_targets(source);

-- ============================================================
-- Update conversations table with intelligence columns
-- ============================================================
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS journey TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS current_gate TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS league TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS deal_id INTEGER REFERENCES deals(id);
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS company_profile_id INTEGER REFERENCES company_profiles(id);
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS thesis_id INTEGER REFERENCES theses(id);
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS extracted_data JSONB DEFAULT '{}';
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS journey_context TEXT;
