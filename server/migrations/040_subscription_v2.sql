-- 040_subscription_v2.sql
-- Fix free deliverable tracking: per-USER not per-deal.
-- Add trial tracking, subscription status constraints.

-- ============================================================
-- FREE DELIVERABLE TRACKING ON USERS (one per user, not per deal)
-- ============================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS free_deliverable_used BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS free_deliverable_type TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS free_deliverable_at TIMESTAMPTZ;

-- Add UNIQUE constraint on subscriptions.user_id if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_user_id_key'
  ) THEN
    ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Add CHECK constraints on subscriptions if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_plan_check'
  ) THEN
    ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_check
      CHECK (plan IN ('free', 'starter', 'professional', 'enterprise'));
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_status_check'
  ) THEN
    ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check
      CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete'));
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add trial_ends_at column if missing
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- Menu item price corrections (reference prices for analytics, not user-facing)
UPDATE menu_items SET base_price_cents = 35000 WHERE slug = 'sell-valuation-report';
UPDATE menu_items SET base_price_cents = 70000 WHERE slug = 'sell-cim';
UPDATE menu_items SET base_price_cents = 20000 WHERE slug = 'buy-sba-bankability';
UPDATE menu_items SET base_price_cents = 15000 WHERE slug = 'buy-deal-scorecard';
UPDATE menu_items SET base_price_cents = 20000 WHERE slug = 'universal-market-intelligence';
UPDATE menu_items SET base_price_cents = 12500 WHERE slug = 'buy-loi-draft';
UPDATE menu_items SET base_price_cents = 15000 WHERE slug = 'sell-working-capital-analysis';
