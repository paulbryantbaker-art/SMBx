/**
 * Practice mode — smbX as a private buy-side corp-dev practice (THE LINE v2,
 * 2026-07-11). The app serves the practice team only:
 *
 *   - signup/login are allowlist-gated (routes/auth.ts)
 *   - every authenticated API/MCP request is perimeter-checked (practicePerimeter)
 *   - team members get full entitlements (subscriptionService short-circuit)
 *   - the public product surfaces are off: anonymous chat and Stripe checkout 410
 *
 * Default is ON. Set PRACTICE_MODE=false only to restore the retired public
 * product posture (a deliberate act — see THE_LINE_POLICY.md v2).
 * TEAM_ALLOWLIST is a comma-separated email list; unset, it falls back to the
 * practitioner.
 */
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createSql } from '../dbConfig.js';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'dev-secret-change-me';
const DEFAULT_TEAM = ['paulbryantbaker@gmail.com'];

export function practiceModeEnabled(): boolean {
  return process.env.PRACTICE_MODE !== 'false';
}

export function teamAllowlist(): string[] {
  const env = (process.env.TEAM_ALLOWLIST || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
  return env.length ? env : DEFAULT_TEAM;
}

export function isTeamEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return teamAllowlist().includes(email.toLowerCase());
}

export const PRACTICE_DENIED = 'smbX.ai is a private practice tool. Access is by invitation from the practice.';

// ─── Perimeter middleware ─────────────────────────────────────
//
// Requests carrying a valid JWT are checked against the team allowlist; a
// non-team identity gets 403 regardless of which route it targets (this is how
// pre-pivot accounts — trials, early access, external agent keys — lose access
// without waiting out token expiry). Requests with no token pass through to
// each route's own auth, so genuinely public token-link surfaces (shared docs,
// day-pass views) keep working.

let sqlClient: ReturnType<typeof createSql> | null = null;
function getSql() {
  if (!sqlClient) sqlClient = createSql();
  return sqlClient;
}
const CACHE_TTL_MS = 5 * 60 * 1000;
const teamCache = new Map<number, { ok: boolean; exp: number }>();

async function userIsTeam(userId: number): Promise<boolean> {
  const hit = teamCache.get(userId);
  if (hit && hit.exp > Date.now()) return hit.ok;
  try {
    const [user] = await getSql()`SELECT email FROM users WHERE id = ${userId} LIMIT 1`;
    const ok = isTeamEmail(user?.email);
    teamCache.set(userId, { ok, exp: Date.now() + CACHE_TTL_MS });
    return ok;
  } catch (err: any) {
    // DB hiccup: fail closed for unknown identities is tempting, but locking the
    // practitioner out of their own tool on a transient error is worse. Fail open
    // WITHOUT caching (the next request re-checks) and let the route's own auth
    // and queries stand — with the DB down, data routes can't serve anyway.
    console.error('[practice] allowlist lookup failed:', err.message);
    return true;
  }
}

export function practicePerimeter(req: Request, res: Response, next: NextFunction) {
  if (!practiceModeEnabled()) return next();

  // Auth routes carry their own allowlist gates (and must stay reachable so the
  // team can sign in); health/config are public plumbing.
  const path = req.path;
  if (path.startsWith('/api/auth/') || path === '/api/health' || path === '/api/config') {
    return next();
  }

  const header = req.headers.authorization;
  const bearer = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  const queryToken = typeof req.query.token === 'string' ? req.query.token : null; // SSE routes
  const token = bearer || queryToken;
  if (!token) return next();

  let userId: number | undefined;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId?: number };
    userId = payload.userId;
  } catch {
    return next(); // invalid token → the route's own auth rejects it with the right challenge
  }
  if (!userId) return next();

  userIsTeam(userId).then(ok => {
    if (ok) return next();
    res.status(403).json({ error: PRACTICE_DENIED });
  }).catch(() => next());
}

/** 410 handler for retired public product surfaces (anonymous chat, checkout). */
export function retiredSurface(_req: Request, res: Response) {
  res.status(410).json({ error: 'This surface was retired. smbX.ai now operates as a private buy-side practice.' });
}
