-- Session F: Franchise Matching
-- Franchise brand database for matching buyers with franchise opportunities

CREATE TABLE IF NOT EXISTS franchise_brands (
  id SERIAL PRIMARY KEY,
  legal_name TEXT NOT NULL,
  trade_name TEXT,
  parent_company TEXT,
  industry TEXT,
  naics_code TEXT,
  category TEXT,                   -- QSR, fitness, home_services, automotive, cleaning, education, health, pet, etc.
  franchise_fee_cents BIGINT,
  royalty_rate NUMERIC(5,3),
  ad_fund_rate NUMERIC(5,3),
  total_investment_min_cents BIGINT,
  total_investment_max_cents BIGINT,
  liquid_capital_required_cents BIGINT,
  net_worth_required_cents BIGINT,
  model_type TEXT,                 -- owner_operator, semi_absentee, absentee, executive
  multi_unit_allowed BOOLEAN DEFAULT true,
  home_based BOOLEAN DEFAULT false,
  item_19_available BOOLEAN DEFAULT false,
  avg_unit_revenue_cents BIGINT,
  avg_owner_cash_flow_cents BIGINT,
  units_open INTEGER,
  units_opened_last_year INTEGER,
  units_closed_last_year INTEGER,
  franchise_health_score INTEGER,  -- 0-100
  fdd_data JSONB DEFAULT '{}',
  fdd_source TEXT,
  states_registered TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_franchise_category ON franchise_brands(category);
CREATE INDEX IF NOT EXISTS idx_franchise_investment ON franchise_brands(total_investment_min_cents);
CREATE INDEX IF NOT EXISTS idx_franchise_model ON franchise_brands(model_type);
