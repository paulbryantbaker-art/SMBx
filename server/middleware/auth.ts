import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcrypt';
import postgres from 'postgres';
import type { Request, Response, NextFunction } from 'express';

// ─── Raw SQL connection for auth queries ────────────────────

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  prepare: false,
});

// ─── Session (MemoryStore — will add DB sessions later) ─────

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  },
});

// ─── Passport serialization ────────────────────────────────

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const [user] = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
    done(null, user || null);
  } catch (err: any) {
    console.error('Deserialize error:', err.message);
    done(err, null);
  }
});

// ─── Local strategy ────────────────────────────────────────

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        console.log('Login attempt:', email.toLowerCase());
        const [user] = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`;

        console.log('User found:', user ? `id=${user.id}` : 'not found');

        if (!user || !user.password) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, user);
      } catch (err: any) {
        console.error('Local strategy error:', err.message, err.stack);
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

          let [user] = await sql`SELECT * FROM users WHERE google_id = ${profile.id} LIMIT 1`;

          if (!user) {
            [user] = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`;

            if (user) {
              [user] = await sql`UPDATE users SET google_id = ${profile.id} WHERE id = ${user.id} RETURNING *`;
            } else {
              [user] = await sql`
                INSERT INTO users (email, display_name, google_id)
                VALUES (${email.toLowerCase()}, ${profile.displayName || email}, ${profile.id})
                RETURNING *
              `;
              await sql`INSERT INTO wallets (user_id, balance_cents) VALUES (${user.id}, 0)`;
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
