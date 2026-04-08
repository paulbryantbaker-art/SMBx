-- Safety net: ensure trial_ends_at column exists on users table
-- Migration 048 may have been recorded as applied before the column was actually added
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- Grant trial to any users missing it
UPDATE users SET trial_ends_at = NOW() + INTERVAL '90 days'
WHERE trial_ends_at IS NULL;
