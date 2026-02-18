import { Router } from 'express';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '../db.js';
import { users, wallets } from '../../shared/schema.js';
import { passport, requireAuth } from '../middleware/auth.js';

const BCRYPT_ROUNDS = 12;

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

    // Check if email already taken
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const [user] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        password: hashedPassword,
        displayName: displayName || email,
      })
      .returning();

    // Create wallet with 0 balance
    await db.insert(wallets).values({ userId: user.id });

    // Log in immediately
    req.login(user, (err) => {
      if (err) return next(err);
      const { password: _, ...safeUser } = user;
      return res.status(201).json(safeUser);
    });
  } catch (err) {
    next(err);
  }
});

// ─── Login ─────────────────────────────────────────────────

authRouter.post('/login', (req, res, next) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ error: info?.message || 'Invalid credentials' });
    }
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
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
