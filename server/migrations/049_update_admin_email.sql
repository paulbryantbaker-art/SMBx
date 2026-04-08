-- Migrate admin account from personal Gmail to Google Workspace
UPDATE users
SET email = 'pbaker@smbx.ai',
    password = '$2b$10$mNL0ykJmWlbqzVCzLM4w4.KuHpAkezdSQSzEN6F2x/tKrKL9fqYFW',
    google_id = NULL
WHERE email = 'paulbryantbaker@gmail.com';
