-- 039_subscriptions.sql
-- Switch from one-time execution fee to monthly subscriptions.
-- Canonical monthly plans are free, solo, pro, team, enterprise.
-- Legacy starter/professional keys may still exist in older subscription rows and are normalized in application code.

-- ============================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  plan VARCHAR(20) NOT NULL DEFAULT 'free',       -- free | solo | pro | team | enterprise | legacy starter/professional
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
