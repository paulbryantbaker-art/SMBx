-- 048_early_access_trial.sql
-- Auto-grant 90-day Professional trial to all new signups during pre-launch

ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- Grant trial to all existing users who don't already have one
UPDATE users SET trial_ends_at = NOW() + INTERVAL '90 days'
WHERE trial_ends_at IS NULL;
