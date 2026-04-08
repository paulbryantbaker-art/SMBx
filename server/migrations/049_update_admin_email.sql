-- Migrate admin account from personal Gmail to Google Workspace
-- Update existing row if it exists
UPDATE users
SET email = 'pbaker@smbx.ai',
    password = '$2b$10$mNL0ykJmWlbqzVCzLM4w4.KuHpAkezdSQSzEN6F2x/tKrKL9fqYFW',
    google_id = NULL
WHERE email = 'paulbryantbaker@gmail.com';

-- Create admin account if it doesn't exist yet
INSERT INTO users (email, password, display_name, role, trial_ends_at)
VALUES (
  'pbaker@smbx.ai',
  '$2b$10$mNL0ykJmWlbqzVCzLM4w4.KuHpAkezdSQSzEN6F2x/tKrKL9fqYFW',
  'Paul Baker',
  'admin',
  NOW() + INTERVAL '90 days'
)
ON CONFLICT (email) DO NOTHING;
