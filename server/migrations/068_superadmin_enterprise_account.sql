-- 068_superadmin_enterprise_account.sql
-- Paul is the owner/tester account: full admin surface + enterprise Yulia access.

ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan VARCHAR(20) NOT NULL DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS free_deliverable_used BOOLEAN DEFAULT FALSE;

INSERT INTO users (
  email, password, display_name, role, is_advisor, league, plan,
  trial_ends_at, free_deliverable_used
)
VALUES (
  'pbaker@smbx.ai',
  '$2b$10$mNL0ykJmWlbqzVCzLM4w4.KuHpAkezdSQSzEN6F2x/tKrKL9fqYFW',
  'Paul Baker',
  'superadmin',
  true,
  'L4',
  'enterprise',
  NOW() + INTERVAL '90 days',
  false
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  display_name = EXCLUDED.display_name,
  role = 'superadmin',
  is_advisor = true,
  league = COALESCE(users.league, EXCLUDED.league),
  plan = 'enterprise',
  trial_ends_at = GREATEST(COALESCE(users.trial_ends_at, NOW()), EXCLUDED.trial_ends_at),
  free_deliverable_used = false,
  updated_at = NOW();

INSERT INTO subscriptions (
  user_id, plan, status, stripe_subscription_id, stripe_customer_id,
  current_period_start, current_period_end, trial_ends_at
)
SELECT
  id,
  'enterprise',
  'active',
  'dev_superadmin_enterprise',
  'dev_superadmin',
  NOW(),
  NOW() + INTERVAL '30 days',
  NOW() + INTERVAL '90 days'
FROM users
WHERE email = 'pbaker@smbx.ai'
ON CONFLICT (user_id) DO UPDATE SET
  plan = 'enterprise',
  status = 'active',
  trial_ends_at = EXCLUDED.trial_ends_at,
  updated_at = NOW();
