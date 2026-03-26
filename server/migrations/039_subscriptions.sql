-- 039_subscriptions.sql
-- Switch from one-time execution fee to monthly subscriptions.
-- Plans: free (default), starter ($49), professional ($149), enterprise ($999).

-- ============================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  plan VARCHAR(20) NOT NULL DEFAULT 'free',       -- free | starter | professional | enterprise
  status VARCHAR(20) NOT NULL DEFAULT 'active',   -- active | canceled | past_due | trialing
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_cust ON subscriptions(stripe_customer_id);

-- ============================================================
-- ADD plan COLUMN TO USERS (denormalized for fast lookups)
-- ============================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan VARCHAR(20) NOT NULL DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

-- ============================================================
-- TRACK FIRST FREE DELIVERABLE PER DEAL
-- (each deal gets one free deliverable before subscription required)
-- ============================================================
ALTER TABLE deals ADD COLUMN IF NOT EXISTS free_deliverable_used BOOLEAN DEFAULT false;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS free_deliverable_id INTEGER;
