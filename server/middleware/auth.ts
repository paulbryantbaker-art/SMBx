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
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const token = header.slice(7);
      const payload = jwt.verify(token, JWT_SECRET) as AuthTokenClaims;
      (req as any).userId = payload.userId;
      (req as any).authClaims = payload;
    } catch {
      // Invalid token — treat as unauthenticated
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
