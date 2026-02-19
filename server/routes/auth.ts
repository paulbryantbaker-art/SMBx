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
    console.log('POST /api/auth/login:', email);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [user] = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`;

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user.id);
    const { password: _, ...safeUser } = user;
    console.log('Login success:', user.id, user.email);
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

// ─── Logout (client-side only, but endpoint for completeness) ─

authRouter.post('/logout', (_req, res) => {
  res.json({ ok: true });
});
