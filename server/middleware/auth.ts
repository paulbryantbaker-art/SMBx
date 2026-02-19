import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcrypt';
import pg from 'pg';
import postgres from 'postgres';
import type { Request, Response, NextFunction } from 'express';

const PgStore = connectPgSimple(session);

// ─── Raw SQL connection for auth queries ────────────────────

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  prepare: false,
});

// ─── Session store pool (uses pg, not postgres-js) ──────────

const dbUrl = process.env.DATABASE_URL!;
console.log('Session pool DATABASE_URL:', dbUrl ? `set (${dbUrl.split('@')[1]?.split('/')[0] || '?'})` : 'MISSING!');

// Parse URL into individual params (most robust for pg.Pool)
const dbParsed = new URL(dbUrl);
const sessionPool = new pg.Pool({
  host: dbParsed.hostname,
  port: parseInt(dbParsed.port, 10) || 5432,
  database: dbParsed.pathname.slice(1),
  user: decodeURIComponent(dbParsed.username),
  password: decodeURIComponent(dbParsed.password),
  ssl: { rejectUnauthorized: false },
});

sessionPool.on('error', (err) => {
  console.error('Session pool error:', err.message);
});

// Verify pool can connect
sessionPool.query('SELECT 1 as ok').then(r => {
  console.log('Session pool connected:', r.rows[0]?.ok === 1 ? 'OK' : 'unexpected');
}).catch(err => {
  console.error('Session pool connect FAILED:', err.message);
});

// ─── Session ────────────────────────────────────────────────

export const sessionMiddleware = session({
  store: new PgStore({
    pool: sessionPool,
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  proxy: true,
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
