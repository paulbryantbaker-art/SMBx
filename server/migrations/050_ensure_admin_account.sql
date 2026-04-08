-- Ensure admin account exists (049 was a no-op if no prior Gmail signup)
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
  role = 'admin';
