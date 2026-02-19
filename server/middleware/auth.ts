import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '../db.js';
import { users, wallets } from '../../shared/schema.js';
import type { Request, Response, NextFunction } from 'express';

const PgStore = connectPgSimple(session);

// ─── Session ────────────────────────────────────────────────

export const sessionMiddleware = session({
  store: new PgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ...(process.env.DATABASE_URL?.includes('railway.internal')
      ? {}
      : { conObject: { ssl: { rejectUnauthorized: false } } }),
  }),
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
});

// ─── Passport serialization ────────────────────────────────

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    done(null, user || null);
  } catch (err) {
    done(err, null);
  }
});

// ─── Local strategy ────────────────────────────────────────

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email.toLowerCase()))
          .limit(1);

        if (!user || !user.password) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

// ─── Google OAuth strategy ─────────────────────────────────

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const callbackURL = `${process.env.APP_URL || 'http://localhost:5173'}/api/auth/google/callback`;

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email from Google profile'));
          }

          // Check for existing user by googleId
          let [user] = await db
            .select()
            .from(users)
            .where(eq(users.googleId, profile.id))
            .limit(1);

          if (!user) {
            // Check if email already exists (link accounts)
            [user] = await db
              .select()
              .from(users)
              .where(eq(users.email, email.toLowerCase()))
              .limit(1);

            if (user) {
              // Link Google ID to existing account
              [user] = await db
                .update(users)
                .set({ googleId: profile.id })
                .where(eq(users.id, user.id))
                .returning();
            } else {
              // Create new user + wallet
              [user] = await db
                .insert(users)
                .values({
                  email: email.toLowerCase(),
                  displayName: profile.displayName || email,
                  googleId: profile.id,
                })
                .returning();

              await db.insert(wallets).values({ userId: user.id });
            }
          }

          return done(null, user);
        } catch (err) {
          return done(err as Error);
        }
      },
    ),
  );
}

// ─── Auth middleware ────────────────────────────────────────

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

export { passport };
