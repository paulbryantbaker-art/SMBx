-- Reset admin email verification for testing
UPDATE users SET email_verified = false WHERE email = 'pbaker@smbx.ai';
DELETE FROM email_verification_tokens WHERE user_id = (SELECT id FROM users WHERE email = 'pbaker@smbx.ai');
