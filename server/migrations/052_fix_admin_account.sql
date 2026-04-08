-- Fix: ensure column exists BEFORE creating admin account
-- Migrations 049/050 failed because trial_ends_at didn't exist yet

ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- Grant trial to existing users missing it
UPDATE users SET trial_ends_at = NOW() + INTERVAL '90 days'
WHERE trial_ends_at IS NULL;

-- Create or update admin account
INSERT INTO users (email, password, display_name, role, trial_ends_at)
VALUES (
  'pbaker@smbx.ai',
  '$2b$10$mNL0ykJmWlbqzVCzLM4w4.KuHpAkezdSQSzEN6F2x/tKrKL9fqYFW',
  'Paul Baker',
  'admin',
  NOW() + INTERVAL '90 days'
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = 'admin',
  trial_ends_at = COALESCE(users.trial_ends_at, EXCLUDED.trial_ends_at);
