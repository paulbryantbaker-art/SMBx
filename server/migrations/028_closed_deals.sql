-- Session 0: Closed deals corpus for comparable transaction intelligence

CREATE TABLE IF NOT EXISTS closed_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_synthetic BOOLEAN DEFAULT true,
  naics_code TEXT,
  naics_label TEXT,
  state TEXT,
  deal_size_league TEXT,
  exit_type TEXT,
  buyer_type TEXT,
  annual_revenue_cents BIGINT,
  sde_cents BIGINT,
  ebitda_cents BIGINT,
  asking_price_cents BIGINT,
  final_price_cents BIGINT,
  sde_multiple NUMERIC(4,2),
  ebitda_multiple NUMERIC(4,2),
  cash_at_close_pct INTEGER,
  seller_note_pct INTEGER,
  earnout_pct INTEGER,
  sba_financed BOOLEAN,
  earnout_present BOOLEAN,
  transition_period_days INTEGER,
  noncompete_years INTEGER,
  time_on_market_days INTEGER,
  total_buyers_contacted INTEGER,
  ioi_count INTEGER,
  loi_count INTEGER,
  competitive_process BOOLEAN,
  closed_year INTEGER,
  closed_quarter INTEGER,
  price_vs_ask_pct INTEGER,
  primary_value_driver TEXT,
  primary_deal_risk TEXT,
  dd_outcome TEXT,
  key_finding TEXT,
  deal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_closed_deals_naics ON closed_deals(naics_code);
CREATE INDEX IF NOT EXISTS idx_closed_deals_league ON closed_deals(deal_size_league);
CREATE INDEX IF NOT EXISTS idx_closed_deals_year ON closed_deals(closed_year);
