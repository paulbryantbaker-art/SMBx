-- Intelligence Flywheel: transaction data collection, data products, ground truth

-- Anonymized transaction data (post-close, opt-in)
CREATE TABLE IF NOT EXISTS transaction_benchmarks (
  id SERIAL PRIMARY KEY,
  naics_code VARCHAR(10),
  industry VARCHAR(100),
  geography VARCHAR(100),
  deal_size_cents BIGINT, -- purchase price
  revenue_cents BIGINT,
  ebitda_cents BIGINT,
  sde_cents BIGINT,
  multiple DECIMAL(4,2), -- actual transaction multiple
  metric_used VARCHAR(10), -- 'sde' or 'ebitda'
  structure VARCHAR(50), -- 'asset', 'stock', 'merger'
  sba_financed BOOLEAN,
  days_to_close INTEGER,
  league VARCHAR(5),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_txn_bench_naics ON transaction_benchmarks(naics_code);
CREATE INDEX IF NOT EXISTS idx_txn_bench_multiple ON transaction_benchmarks(multiple);

-- Ground truth data (verified post-close financials for AI accuracy)
CREATE TABLE IF NOT EXISTS ground_truth_data (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER REFERENCES deals(id) ON DELETE SET NULL,
  data_type VARCHAR(50) NOT NULL, -- 'actual_revenue', 'actual_ebitda', 'actual_multiple', 'close_price'
  predicted_value DECIMAL(15,2),
  actual_value DECIMAL(15,2),
  variance_pct DECIMAL(6,2), -- (actual - predicted) / predicted * 100
  period VARCHAR(20), -- 'trailing_12m', 'forward_12m'
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ground_truth_type ON ground_truth_data(data_type);

-- Usage tracking (per-user token budgets)
CREATE TABLE IF NOT EXISTS usage_tracking (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  tool_calls INTEGER NOT NULL DEFAULT 0,
  deliverables_generated INTEGER NOT NULL DEFAULT 0,
  intelligence_queries INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_usage_user_date ON usage_tracking(user_id, date);

-- Data product subscriptions (for institutional clients)
CREATE TABLE IF NOT EXISTS data_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  product VARCHAR(50) NOT NULL, -- 'transaction_benchmark', 'industry_multiple_tracker', 'buyer_demand_index'
  tier VARCHAR(20) NOT NULL DEFAULT 'basic', -- 'basic', 'professional', 'institutional'
  price_cents_quarterly INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_data_subs_user ON data_subscriptions(user_id);
