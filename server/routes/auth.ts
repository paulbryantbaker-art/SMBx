import { Router } from 'express';
import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { requireAuth, signToken } from '../middleware/auth.js';

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
      INSERT INTO users (email, password, display_name)
      VALUES (${emailLower}, ${hashedPassword}, ${displayName || emailLower})
      RETURNING id, email, display_name, google_id, league, role, created_at, updated_at
    `;

    await sql`INSERT INTO wallets (user_id, balance_cents) VALUES (${user.id}, 0)`;

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
      SELECT id, email, display_name, google_id, league, role, created_at, updated_at
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
      // Create new user
      [user] = await sql`
        INSERT INTO users (email, google_id, display_name)
        VALUES (${emailLower}, ${googleId}, ${name || emailLower})
        RETURNING id, email, display_name, google_id, league, role, created_at, updated_at
      `;

      await sql`INSERT INTO wallets (user_id, balance_cents) VALUES (${user.id}, 0)`;
    }

    const token = signToken(user.id);
    return res.json({ token, user });
  } catch (err: any) {
    console.error('Google auth error:', err.message);
    return res.status(500).json({ error: 'Google authentication failed' });
  }
});

// ─── Logout (client-side only, but endpoint for completeness) ─

authRouter.post('/logout', (_req, res) => {
  res.json({ ok: true });
});
