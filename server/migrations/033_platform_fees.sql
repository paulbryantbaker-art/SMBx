-- Migration 033: Platform Fee Model
-- Replaces per-deliverable wallet pricing with one-time per-deal platform fee.
-- OLD: wallet blocks, per-deliverable pricing with league multipliers
-- NEW: single platform fee at S2/B2 gate, everything after included

-- Platform fee schedule (one payment per deal, priced by league)
CREATE TABLE IF NOT EXISTS platform_fee_schedule (
  league TEXT PRIMARY KEY,
  fee_cents INTEGER NOT NULL,
  description TEXT
);

INSERT INTO platform_fee_schedule (league, fee_cents, description) VALUES
  ('L1', 99900, 'SDE < $500K'),
  ('L2', 150000, 'SDE $500K–$2M'),
  ('L3', 500000, 'EBITDA $2M–$5M'),
  ('L4', 1500000, 'EBITDA $5M–$10M'),
  ('L5', 2500000, 'EBITDA $10M–$50M'),
  ('L6', 5000000, 'EBITDA $50M+')
ON CONFLICT (league) DO UPDATE SET fee_cents = EXCLUDED.fee_cents, description = EXCLUDED.description;

-- Deal columns for platform fee tracking
ALTER TABLE deals ADD COLUMN IF NOT EXISTS platform_fee_cents INTEGER;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS platform_fee_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS platform_fee_paid_at TIMESTAMPTZ;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Advisor subscriptions (brokers/advisors — separate from per-deal flow)
CREATE TABLE IF NOT EXISTS advisor_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  plan TEXT NOT NULL CHECK (plan IN ('trial', 'pro', 'enterprise')),
  stripe_subscription_id TEXT,
  trial_deals_used INTEGER DEFAULT 0,
  trial_deals_limit INTEGER DEFAULT 3,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referral tracking (infrastructure for post-launch partnerships)
CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER REFERENCES deals(id),
  referral_type TEXT NOT NULL CHECK (referral_type IN ('lender', 'attorney', 'cpa', 'appraiser', 'insurance')),
  provider_name TEXT,
  provider_id TEXT,
  status TEXT DEFAULT 'referred',
  revenue_cents INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_advisor_subscriptions_user ON advisor_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_deal ON referrals(deal_id);
