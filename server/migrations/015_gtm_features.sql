-- GTM Features: transaction tokens, escrow, deal velocity, journey bridges

-- Transaction tokens (success fees on closed deals)
CREATE TABLE IF NOT EXISTS transaction_tokens (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  deal_value_cents BIGINT NOT NULL, -- total deal value
  fee_rate DECIMAL(5,4) NOT NULL DEFAULT 0.005, -- 0.5%
  fee_cents BIGINT NOT NULL, -- calculated fee (max of rate * value or minimum)
  minimum_fee_cents INTEGER NOT NULL DEFAULT 200000, -- $2,000 minimum
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'invoiced', 'paid', 'waived'
  stripe_payment_intent_id VARCHAR(100),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_txn_tokens_deal ON transaction_tokens(deal_id);
CREATE INDEX IF NOT EXISTS idx_txn_tokens_user ON transaction_tokens(user_id);

-- Escrow tracking
CREATE TABLE IF NOT EXISTS escrow_transactions (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL, -- 'earnest_money', 'deposit', 'earnout_milestone', 'holdback'
  amount_cents BIGINT NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'received', 'released', 'returned'
  due_date DATE,
  received_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escrow_deal ON escrow_transactions(deal_id);

-- Earnout schedules
CREATE TABLE IF NOT EXISTS earnout_schedules (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  milestone_name VARCHAR(255) NOT NULL,
  target_metric VARCHAR(100), -- 'revenue', 'ebitda', 'customer_count'
  target_value DECIMAL(15,2),
  earnout_amount_cents BIGINT NOT NULL,
  measurement_start DATE,
  measurement_end DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'measuring', 'achieved', 'missed'
  actual_value DECIMAL(15,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_earnout_deal ON earnout_schedules(deal_id);

-- Journey bridge credits (cross-journey incentives)
CREATE TABLE IF NOT EXISTS journey_bridge_credits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_journey VARCHAR(10) NOT NULL,
  to_journey VARCHAR(10) NOT NULL,
  credit_cents INTEGER NOT NULL,
  reason VARCHAR(255),
  applied_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '90 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bridge_credits_user ON journey_bridge_credits(user_id);

-- Deal velocity analytics (aggregated metrics)
CREATE TABLE IF NOT EXISTS deal_velocity_stats (
  id SERIAL PRIMARY KEY,
  journey_type VARCHAR(10) NOT NULL,
  gate VARCHAR(10) NOT NULL,
  avg_days_in_gate DECIMAL(6,1),
  median_days_in_gate DECIMAL(6,1),
  p90_days_in_gate DECIMAL(6,1),
  sample_size INTEGER NOT NULL DEFAULT 0,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_velocity_stats_gate ON deal_velocity_stats(journey_type, gate);

-- Ghost profiles (tracked unclaimed businesses)
CREATE TABLE IF NOT EXISTS ghost_profiles (
  id SERIAL PRIMARY KEY,
  created_by INTEGER NOT NULL REFERENCES users(id),
  business_name VARCHAR(255),
  industry VARCHAR(100),
  naics_code VARCHAR(10),
  location VARCHAR(255),
  estimated_revenue INTEGER,
  estimated_employees INTEGER,
  source_url TEXT,
  notes TEXT,
  owner_contacted BOOLEAN NOT NULL DEFAULT false,
  owner_contact_date TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'tracking', -- 'tracking', 'contacted', 'listed', 'archived'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ghost_user ON ghost_profiles(created_by);
