import { Router } from 'express';
import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { passport, requireAuth } from '../middleware/auth.js';

const BCRYPT_ROUNDS = 12;

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  prepare: false,
});

export const authRouter = Router();

// ─── Register ──────────────────────────────────────────────

authRouter.post('/register', async (req, res, next) => {
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

    req.login(user, (err) => {
      if (err) return next(err);
      return res.status(201).json(user);
    });
  } catch (err: any) {
    console.error('Register error:', err.message);
    next(err);
  }
});

// ─── Login ─────────────────────────────────────────────────

authRouter.post('/login', (req, res, next) => {
  console.log('POST /api/auth/login body:', { email: req.body?.email });
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      console.error('Login passport error:', err.message);
      return next(err);
    }
    if (!user) {
      console.log('Login failed:', info?.message);
      return res.status(401).json({ error: info?.message || 'Invalid credentials' });
    }
    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error('Login session error:', loginErr.message);
        return next(loginErr);
      }
      console.log('Login success:', user.id, user.email);
      const { password: _, ...safeUser } = user;
      return res.json(safeUser);
    });
  })(req, res, next);
});

// ─── Google OAuth ──────────────────────────────────────────

authRouter.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

authRouter.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (_req, res) => {
    res.redirect('/');
  },
);

// ─── Logout ────────────────────────────────────────────────

authRouter.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy((destroyErr) => {
      if (destroyErr) return next(destroyErr);
      res.clearCookie('connect.sid');
      return res.json({ ok: true });
    });
  });
});

// ─── Current user ──────────────────────────────────────────

authRouter.get('/me', requireAuth, (req, res) => {
  const { password: _, ...safeUser } = req.user as any;
  res.json(safeUser);
});
