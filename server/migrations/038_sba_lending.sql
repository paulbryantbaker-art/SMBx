-- Migration 038: SBA 7(a) lending statistics cache table
CREATE TABLE IF NOT EXISTS sba_loan_stats (
  id SERIAL PRIMARY KEY,
  naics_code VARCHAR(10) NOT NULL,
  state_code VARCHAR(2),
  fiscal_year INTEGER NOT NULL,
  loan_count INTEGER NOT NULL DEFAULT 0,
  total_amount_cents BIGINT NOT NULL DEFAULT 0,
  avg_loan_cents BIGINT NOT NULL DEFAULT 0,
  approval_rate NUMERIC(5,2),
  avg_term_months INTEGER,
  avg_interest_rate NUMERIC(5,2),
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(naics_code, state_code, fiscal_year)
);

CREATE INDEX IF NOT EXISTS idx_sba_loan_stats_naics ON sba_loan_stats(naics_code);
CREATE INDEX IF NOT EXISTS idx_sba_loan_stats_state ON sba_loan_stats(state_code);

-- Website enrichment cache for discovery targets
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS enrichment_data JSONB;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMPTZ;
