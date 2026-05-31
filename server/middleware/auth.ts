import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'dev-secret-change-me';

export interface AuthTokenClaims {
  userId: number;
  tokenUse?: string;
  scopes?: string[];
  scope?: string;
  agentId?: string;
  agentPlatformId?: string;
  beneficialCustomerId?: string | number;
  billingOrgId?: string | number;
  mandateId?: string;
  aud?: string | string[];
  iss?: string;
  clientId?: string;
  [key: string]: unknown;
}

export interface DefinitiveAgentTokenInput {
  userId: number;
  scopes: string[];
  agentId?: string | null;
  agentPlatformId?: string | null;
  beneficialCustomerId?: string | number | null;
  billingOrgId?: string | number | null;
  mandateId?: string | null;
  audience?: string | null;
  issuer?: string | null;
  clientId?: string | null;
  expiresInSeconds?: number;
}

/**
 * Optional auth — sets req.userId if a valid JWT is present, but does NOT
 * reject the request when the token is missing or invalid.
 *
 * When a token IS presented but fails verification, we surface the reason on
 * (req as any).authError so downstream handlers can include RFC 6750-compliant
 * error codes (`invalid_token`, with `error_description`) in WWW-Authenticate
 * challenges. Without this, clients can't distinguish "no token" from "token
 * expired" — which means they can't decide whether to refresh vs re-auth.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const token = header.slice(7);
    try {
      const payload = jwt.verify(token, JWT_SECRET) as AuthTokenClaims;
      (req as any).userId = payload.userId;
      (req as any).authClaims = payload;
    } catch (err) {
      // Token was presented but invalid — preserve the reason for downstream
      // WWW-Authenticate challenge construction.
      if (err instanceof jwt.TokenExpiredError) {
        (req as any).authError = { code: 'invalid_token', description: 'The access token has expired.' };
      } else if (err instanceof jwt.JsonWebTokenError) {
        (req as any).authError = { code: 'invalid_token', description: `Token verification failed: ${err.message}` };
      } else {
        (req as any).authError = { code: 'invalid_token', description: 'Token could not be verified.' };
      }
    }
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as AuthTokenClaims;
    (req as any).userId = payload.userId;
    (req as any).authClaims = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function signToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

export function signDefinitiveAgentToken(input: DefinitiveAgentTokenInput): string {
  const expiresIn = Math.max(300, Math.min(input.expiresInSeconds || 8 * 60 * 60, 24 * 60 * 60));
  return jwt.sign(
    {
      userId: input.userId,
      tokenUse: 'definitive_agent',
      scopes: input.scopes,
      agentId: input.agentId || undefined,
      agentPlatformId: input.agentPlatformId || undefined,
      beneficialCustomerId: input.beneficialCustomerId || undefined,
      billingOrgId: input.billingOrgId || undefined,
      mandateId: input.mandateId || undefined,
      clientId: input.clientId || undefined,
    },
    JWT_SECRET,
    {
      expiresIn,
      ...(input.audience ? { audience: input.audience } : {}),
      ...(input.issuer ? { issuer: input.issuer } : {}),
    },
  );
}
