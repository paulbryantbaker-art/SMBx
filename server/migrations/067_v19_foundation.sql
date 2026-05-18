-- 067: V19 foundation schema
-- Adds the runtime-correctness substrate from methodology V19:
-- citations, registered models, response audit trail, model stacks,
-- tax positions, legal deferrals, and market-data cache.

CREATE TABLE IF NOT EXISTS market_data_cache (
  id BIGSERIAL PRIMARY KEY,
  source VARCHAR(30) NOT NULL,
  cache_key VARCHAR(255),
  data JSONB,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  series_id TEXT,
  value NUMERIC,
  as_of_date DATE,
  source_url TEXT,
  cite_tag TEXT,
  metadata JSONB
);

ALTER TABLE market_data_cache
  ADD COLUMN IF NOT EXISTS series_id TEXT,
  ADD COLUMN IF NOT EXISTS value NUMERIC,
  ADD COLUMN IF NOT EXISTS as_of_date DATE,
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS cite_tag TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB;

ALTER TABLE market_data_cache
  ALTER COLUMN data DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_market_data_cache_v19_unique
  ON market_data_cache(series_id, as_of_date)
  WHERE series_id IS NOT NULL AND as_of_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_market_data_cache_series
  ON market_data_cache(series_id, as_of_date DESC)
  WHERE series_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS citation_registry (
  id BIGSERIAL PRIMARY KEY,
  cite_tag TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  current_value TEXT,
  source_url TEXT,
  as_of_date DATE,
  validated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_citation_registry_category
  ON citation_registry(category, status);

CREATE TABLE IF NOT EXISTS model_registry (
  id BIGSERIAL PRIMARY KEY,
  model_id TEXT NOT NULL,
  version TEXT NOT NULL,
  hash TEXT NOT NULL,
  deployed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deprecated_at TIMESTAMPTZ,
  change_log TEXT,
  test_status TEXT NOT NULL DEFAULT 'pending',
  hallucination_test_status TEXT,
  UNIQUE (model_id, version)
);

CREATE INDEX IF NOT EXISTS idx_model_registry_model
  ON model_registry(model_id, deprecated_at);

CREATE TABLE IF NOT EXISTS audit_trail (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  deal_id INTEGER REFERENCES deals(id) ON DELETE SET NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE SET NULL,
  turn_id TEXT NOT NULL,
  journey TEXT,
  league TEXT,
  deal_type TEXT,
  model_stack JSONB,
  inputs_used JSONB,
  live_data_snapshots JSONB,
  citations_validated JSONB,
  mode_2_triggers JSONB,
  output_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_trail_deal
  ON audit_trail(deal_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_trail_session
  ON audit_trail(session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_trail_conversation
  ON audit_trail(conversation_id, created_at DESC);

CREATE TABLE IF NOT EXISTS deal_model_stack (
  id BIGSERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  journey TEXT NOT NULL,
  league TEXT NOT NULL,
  deal_type TEXT NOT NULL,
  primary_models JSONB NOT NULL,
  supporting JSONB NOT NULL,
  tax_legal JSONB NOT NULL,
  sensitivity JSONB NOT NULL,
  composed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  UNIQUE (deal_id, version)
);

CREATE INDEX IF NOT EXISTS idx_deal_model_stack_deal
  ON deal_model_stack(deal_id, composed_at DESC);

CREATE TABLE IF NOT EXISTS tax_position_registry (
  id BIGSERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  deal_type TEXT NOT NULL,
  structure_notes TEXT,
  rollover_pct NUMERIC,
  rollover_path TEXT,
  earnout_method TEXT,
  qsbs_eligible BOOLEAN,
  qsbs_state_conformity TEXT,
  s382_relevant BOOLEAN,
  s163j_relevant BOOLEAN,
  s168k_pct NUMERIC DEFAULT 100,
  international BOOLEAN DEFAULT FALSE,
  notes_jsonb JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tax_position_registry_deal
  ON tax_position_registry(deal_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS legal_defer_log (
  id BIGSERIAL PRIMARY KEY,
  deal_id INTEGER REFERENCES deals(id) ON DELETE SET NULL,
  session_id TEXT,
  trigger_code TEXT NOT NULL,
  context_text TEXT,
  briefing_packet JSONB,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_legal_defer_log_deal
  ON legal_defer_log(deal_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_legal_defer_log_user
  ON legal_defer_log(user_id, created_at DESC);

ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS deal_type TEXT,
  ADD COLUMN IF NOT EXISTS jurisdiction TEXT,
  ADD COLUMN IF NOT EXISTS buyer_state TEXT,
  ADD COLUMN IF NOT EXISTS naics_6digit TEXT,
  ADD COLUMN IF NOT EXISTS sic_code TEXT,
  ADD COLUMN IF NOT EXISTS entity_type TEXT,
  ADD COLUMN IF NOT EXISTS s_election_years INTEGER,
  ADD COLUMN IF NOT EXISTS rollover_pct NUMERIC,
  ADD COLUMN IF NOT EXISTS earnout_present BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS rwi_eligible BOOLEAN;

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS current_gate TEXT,
  ADD COLUMN IF NOT EXISTS journey TEXT,
  ADD COLUMN IF NOT EXISTS league TEXT;

INSERT INTO citation_registry (cite_tag, category, description, current_value, source_url, as_of_date) VALUES
  ('[FTC 2026 HSR - Size of Transaction]', 'FTC', '2026 HSR minimum size-of-transaction threshold', '$133.9M', 'https://www.ftc.gov/enforcement/competition-matters/2026/01/new-hsr-thresholds-filing-fees-2026', '2026-02-17'),
  ('[FTC 2026 HSR - Size of Person]', 'FTC', '2026 HSR size-of-person thresholds', '$267.8M / $26.8M', 'https://www.ftc.gov/enforcement/premerger-notification-program/current-thresholds', '2026-02-17'),
  ('[FTC 2026 HSR - Auto-Reportable]', 'FTC', '2026 HSR transaction value above which size-of-person test is not required', '$535.5M', 'https://www.ftc.gov/enforcement/premerger-notification-program/current-thresholds', '2026-02-17'),
  ('[FTC 2026 HSR - Filing Fee Tier 1]', 'FTC', '2026 HSR lowest filing fee tier', '$35,000 for transactions under $189.6M', 'https://www.ftc.gov/enforcement/premerger-notification-program/filing-fee-information', '2026-02-17'),
  ('[FTC 2026 HSR - Filing Fee Top]', 'FTC', '2026 HSR top filing fee tier', '$2.46M for transactions $5.869B or more', 'https://www.ftc.gov/enforcement/premerger-notification-program/filing-fee-information', '2026-02-17'),
  ('[OBBBA Sec. 70301]', 'OBBBA', 'Section 168(k) 100% bonus depreciation permanent', '100% post Jan 19 2025', 'https://www.congress.gov/119/plaws/publ21/PLAW-119publ21.pdf', '2025-07-04'),
  ('[OBBBA Sec. 70302]', 'OBBBA', 'Section 163(j) ATI EBITDA-based permanent', 'EBITDA-based post Dec 31 2024', 'https://www.congress.gov/119/plaws/publ21/PLAW-119publ21.pdf', '2025-07-04'),
  ('[OBBBA Sec. 70307]', 'OBBBA', 'Section 168(n) Qualified Production Property', '100% post Jul 4 2025', 'https://www.congress.gov/119/plaws/publ21/PLAW-119publ21.pdf', '2025-07-04'),
  ('[OBBBA Sec. 70322]', 'OBBBA', 'NCTI/FDDEI/BEAT permanent rates', '12.6% NCTI; approx. 14% FDDEI; 10.5% BEAT', 'https://www.congress.gov/119/plaws/publ21/PLAW-119publ21.pdf', '2025-07-04'),
  ('[OBBBA Sec. 70425]', 'OBBBA', 'Section 1202 QSBS expanded', '$15M/10x cap; $75M assets; tiered 3/4/5 year exclusions', 'https://www.congress.gov/119/plaws/publ21/PLAW-119publ21.pdf', '2025-07-04'),
  ('[OBBBA Sec. 70505]', 'OBBBA', 'SALT cap raised', '$40K 2025; phaseout above $500K; reverts 2030', 'https://www.congress.gov/119/plaws/publ21/PLAW-119publ21.pdf', '2025-07-04'),
  ('[Rev. Rul. 2026-9]', 'RevRul', 'Section 382 long-term tax-exempt rate for May 2026', '3.65%', 'https://www.irs.gov/irb/2026-19_IRB', '2026-05-01'),
  ('[Rev. Rul. 2026-03]', 'RevRul', 'Section 382 long-term tax-exempt rate for February 2026', '3.56%', 'https://www.irs.gov/irb/', '2026-02-01'),
  ('[Rev. Rul. 2026-02]', 'RevRul', 'Section 382 long-term tax-exempt rate for January 2026', '3.51%', 'https://www.irs.gov/irb/', '2026-01-01'),
  ('[SBA SOP 50 10 8]', 'SBA', 'Current SBA SOP for 7(a) and 504 loans', 'Version 8 effective Jun 1 2025; technical update notice effective May 29 2025', 'https://www.sba.gov/document/sop-50-10-lender-development-company-loan-programs', '2025-06-01'),
  ('[Damodaran 2026]', 'Damodaran', 'Damodaran ERP / beta / multiples reference set', 'ERP 4.23% Jan 2026', 'https://pages.stern.nyu.edu/~adamodar/', '2026-01-01'),
  ('[Kroll 2024]', 'Kroll', 'Kroll recommended U.S. equity risk premium', '5.00% since Jun 5 2024', 'https://www.kroll.com/', '2024-06-05'),
  ('[ABA 2025]', 'ABA', 'ABA Private Target Deal Points Study 2025', '139 deals 2024-Q1 2025; $25-900M', NULL, '2025-12-16'),
  ('[SRS 2025]', 'SRS', 'SRS Acquiom 2025 M&A Deal Terms Study', '2200+ deals; $505B', NULL, '2025-12-01'),
  ('[Marsh TRI 2025]', 'Marsh', 'Marsh Transactional Risk Insurance Report 2025', 'NA ROL +16% YoY; Q4 2025 avg 3.23%', NULL, '2026-01-15'),
  ('[Pepperdine PCAP 2025]', 'Pepperdine', 'Pepperdine Private Capital Markets Project 2025', 'Sep 12 2025', 'https://digitalcommons.pepperdine.edu/gsbm_pcm_pcmr/18', '2025-09-12'),
  ('[FRED:SOFR]', 'FRED', 'Secured Overnight Financing Rate', 'live', 'https://fred.stlouisfed.org/series/SOFR', NULL),
  ('[FRED:DGS10]', 'FRED', '10-Year Treasury Constant Maturity', 'live', 'https://fred.stlouisfed.org/series/DGS10', NULL),
  ('[FRED:BAMLH0A0HYM2]', 'FRED', 'ICE BofA US High Yield Option-Adjusted Spread', 'live', 'https://fred.stlouisfed.org/series/BAMLH0A0HYM2', NULL),
  ('[FRED:BAMLC0A0CM]', 'FRED', 'ICE BofA US Corporate Option-Adjusted Spread', 'live', 'https://fred.stlouisfed.org/series/BAMLC0A0CM', NULL),
  ('[FRED:VIXCLS]', 'FRED', 'CBOE Volatility Index: VIX', 'live', 'https://fred.stlouisfed.org/series/VIXCLS', NULL),
  ('[FRED:DPRIME]', 'FRED', 'Bank Prime Loan Rate', 'live', 'https://fred.stlouisfed.org/series/DPRIME', NULL),
  ('[FRED:EFFR]', 'FRED', 'Effective Federal Funds Rate', 'live', 'https://fred.stlouisfed.org/series/EFFR', NULL)
ON CONFLICT (cite_tag) DO UPDATE
  SET category = EXCLUDED.category,
      description = EXCLUDED.description,
      current_value = EXCLUDED.current_value,
      source_url = EXCLUDED.source_url,
      as_of_date = EXCLUDED.as_of_date,
      validated_at = NOW(),
      status = 'active';
