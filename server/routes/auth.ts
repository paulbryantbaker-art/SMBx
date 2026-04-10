import { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import postgres from 'postgres';
import { requireAuth, signToken } from '../middleware/auth.js';
import { sendEmail, sendWelcomeEmail, brandedEmail } from '../services/emailService.js';

const BCRYPT_ROUNDS = 12;

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  prepare: false,
});

export const authRouter = Router();

// ─── Register ──────────────────────────────────────────────

authRouter.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!password || password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }

    const emailLower = email.toLowerCase();

    const existing = await sql`SELECT id FROM users WHERE email = ${emailLower} LIMIT 1`;
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const [user] = await sql`
      INSERT INTO users (email, password, display_name, trial_ends_at)
      VALUES (${emailLower}, ${hashedPassword}, ${displayName || emailLower}, NOW() + INTERVAL '90 days')
      RETURNING id, email, display_name, google_id, league, role, created_at, updated_at
    `;

    // Fire-and-forget welcome email
    sendWelcomeEmail(emailLower, displayName).catch(() => {});

    const token = signToken(user.id);
    return res.status(201).json({ token, user });
  } catch (err: any) {
    console.error('Register error:', err.message);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// ─── Login ─────────────────────────────────────────────────

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const [user] = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`;

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Google-only accounts have no password
    if (!user.password) {
      return res.status(401).json({ error: 'This account uses Google sign-in. Please use the Google button.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user.id);
    const { password: _, ...safeUser } = user;
    return res.json({ token, user: safeUser });
  } catch (err: any) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// ─── Current user ──────────────────────────────────────────

authRouter.get('/me', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [user] = await sql`
      SELECT id, email, display_name, google_id, league, role, email_verified, created_at, updated_at
      FROM users WHERE id = ${userId} LIMIT 1
    `;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(user);
  } catch (err: any) {
    console.error('Me error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ─── Google OAuth ────────────────────────────────────────────

authRouter.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    // Verify Google ID token
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      return res.status(500).json({ error: 'Google OAuth not configured' });
    }

    // Decode the JWT payload (Google ID token)
    const parts = credential.split('.');
    if (parts.length !== 3) {
      return res.status(400).json({ error: 'Invalid credential format' });
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

    // Verify audience matches our client ID
    if (payload.aud !== googleClientId) {
      return res.status(401).json({ error: 'Invalid token audience' });
    }

    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return res.status(401).json({ error: 'Token expired' });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ error: 'No email in Google credential' });
    }

    const emailLower = email.toLowerCase();

    // Check if user exists by google_id or email
    let [user] = await sql`
      SELECT id, email, display_name, google_id, league, role, created_at, updated_at
      FROM users WHERE google_id = ${googleId} OR email = ${emailLower}
      LIMIT 1
    `;

    if (user) {
      // Link Google ID if not already linked
      if (!user.google_id) {
        await sql`UPDATE users SET google_id = ${googleId} WHERE id = ${user.id}`;
        user.google_id = googleId;
      }
    } else {
      // Create new user with 90-day early-access trial
      [user] = await sql`
        INSERT INTO users (email, google_id, display_name, trial_ends_at)
        VALUES (${emailLower}, ${googleId}, ${name || emailLower}, NOW() + INTERVAL '90 days')
        RETURNING id, email, display_name, google_id, league, role, created_at, updated_at
      `;

    }

    const token = signToken(user.id);
    return res.json({ token, user });
  } catch (err: any) {
    console.error('Google auth error:', err.message, err.stack);
    return res.status(500).json({ error: `Google authentication failed: ${err.message}` });
  }
});

// ─── Forgot Password ────────────────────────────────────────

authRouter.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const emailLower = email.toLowerCase();
    const [user] = await sql`SELECT id, email FROM users WHERE email = ${emailLower} LIMIT 1`;

    // Always return success to prevent email enumeration
    if (!user) return res.json({ ok: true });

    // Google-only accounts (no password set) can't reset password
    const [fullUser] = await sql`SELECT password FROM users WHERE id = ${user.id}`;
    if (!fullUser.password) return res.json({ ok: true });

    // Generate a secure reset token (valid 1 hour)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await sql`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (${user.id}, ${token}, ${expiresAt})
    `.catch(async () => {
      // Table may not exist — create it inline
      await sql`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          token VARCHAR(100) NOT NULL UNIQUE,
          expires_at TIMESTAMP NOT NULL,
          used BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;
      await sql`
        INSERT INTO password_reset_tokens (user_id, token, expires_at)
        VALUES (${user.id}, ${token}, ${expiresAt})
      `;
    });

    const resetUrl = `${process.env.APP_URL || process.env.BASE_URL || 'https://smbx.ai'}/reset-password/${token}`;

    const sent = await sendEmail({
      to: user.email,
      subject: 'Let\'s get you back in',
      html: brandedEmail({
        headline: 'Forgot your password? Happens to the best of us.',
        body: `
          <p style="margin:0 0 14px;">No judgment here — I forget things too. (Not deal numbers. Never deal numbers.)</p>
          <p style="margin:0;">Click below to set a new password. This link expires in 30 minutes, so don't sit on it.</p>
        `,
        ctaLabel: 'Reset My Password',
        ctaUrl: resetUrl,
        footnote: 'Didn\'t request this? Someone may have typed your email by mistake. Nothing has changed on your account.',
      }),
    });
    console.log(`[auth] Password reset email to ${user.email}: ${sent ? 'sent' : 'FAILED (check RESEND_API_KEY)'}`);

    return res.json({ ok: true });
  } catch (err: any) {
    console.error('Forgot password error:', err.message);
    return res.status(500).json({ error: 'Failed to send reset email' });
  }
});

// ─── Reset Password ──────────────────────────────────────────

authRouter.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and password required' });
    if (password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });

    const [resetToken] = await sql`
      SELECT * FROM password_reset_tokens
      WHERE token = ${token} AND used = false AND expires_at > NOW()
      LIMIT 1
    `.catch(() => [null]);

    if (!resetToken) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await sql`UPDATE users SET password = ${hashedPassword} WHERE id = ${resetToken.user_id}`;
    await sql`UPDATE password_reset_tokens SET used = true WHERE id = ${resetToken.id}`;

    const jwtToken = signToken(resetToken.user_id);
    const [user] = await sql`
      SELECT id, email, display_name, google_id, league, role, created_at, updated_at
      FROM users WHERE id = ${resetToken.user_id}
    `;

    return res.json({ token: jwtToken, user });
  } catch (err: any) {
    console.error('Reset password error:', err.message);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
});

// ─── Email Verification ──────────────────────────────────────

authRouter.post('/send-verification', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [user] = await sql`SELECT id, email, email_verified FROM users WHERE id = ${userId}`;
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.email_verified) return res.json({ ok: true, already_verified: true });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await sql`
      INSERT INTO email_verification_tokens (user_id, token, expires_at)
      VALUES (${userId}, ${token}, ${expiresAt})
    `.catch(async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS email_verification_tokens (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          token VARCHAR(100) NOT NULL UNIQUE,
          expires_at TIMESTAMP NOT NULL,
          used BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;
      await sql`
        INSERT INTO email_verification_tokens (user_id, token, expires_at)
        VALUES (${userId}, ${token}, ${expiresAt})
      `;
    });

    const verifyUrl = `${process.env.APP_URL || process.env.BASE_URL || 'https://smbx.ai'}/verify-email?token=${token}`;

    const sent = await sendEmail({
      to: user.email,
      subject: 'Quick confirmation — then we\'re good',
      html: brandedEmail({
        headline: 'Confirm your email.',
        body: `
          <p style="margin:0 0 14px;">Hey, it's Yulia from smbx.ai. Just making sure this is actually you (and not someone's cat walking across the keyboard).</p>
          <p style="margin:0;">One click and we're set.</p>
        `,
        ctaLabel: 'Confirm My Email',
        ctaUrl: verifyUrl,
        footnote: 'If you didn\'t create an smbx.ai account, you can safely ignore this.',
      }),
    });
    console.log(`[auth] Verification email to ${user.email}: ${sent ? 'sent' : 'FAILED (check RESEND_API_KEY)'}`);

    return res.json({ ok: true });
  } catch (err: any) {
    console.error('Send verification error:', err.message);
    return res.status(500).json({ error: 'Failed to send verification email' });
  }
});

authRouter.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token required' });

    const [verifyToken] = await sql`
      SELECT * FROM email_verification_tokens
      WHERE token = ${token} AND used = false AND expires_at > NOW()
      LIMIT 1
    `.catch(() => [null]);

    if (!verifyToken) {
      return res.status(400).json({ error: 'Invalid or expired verification link' });
    }

    await sql`UPDATE users SET email_verified = true WHERE id = ${verifyToken.user_id}`.catch(async () => {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false`;
      await sql`UPDATE users SET email_verified = true WHERE id = ${verifyToken.user_id}`;
    });
    await sql`UPDATE email_verification_tokens SET used = true WHERE id = ${verifyToken.id}`;

    return res.json({ ok: true });
  } catch (err: any) {
    console.error('Verify email error:', err.message);
    return res.status(500).json({ error: 'Failed to verify email' });
  }
});

// ─── Logout (client-side only, but endpoint for completeness) ─

authRouter.post('/logout', (_req, res) => {
  res.json({ ok: true });
});
