export function buildTokenScopedDefinitiveEnvelope(
  claims: Record<string, any>,
  envelope: Record<string, any>,
) {
  const tokenScopes = normalizeScopeClaim(claims.scopes ?? claims.scope);
  const tokenLooksAgentScoped =
    tokenScopes.length > 0 ||
    claims.tokenUse === 'definitive_agent' ||
    typeof claims.agentId === 'string' ||
    typeof claims.agentPlatformId === 'string';

  if (!tokenLooksAgentScoped) {
    return { ok: true as const, envelope };
  }

  if (tokenScopes.length === 0) {
    return {
      ok: false as const,
      status: 403,
      body: {
        ok: false,
        error: 'agent_token_missing_scopes',
        message: 'DEFINITIVE agent tokens must carry token-bound scopes. Use a human app JWT for internal UI calls or a scoped agent token for external agent calls.',
      },
    };
  }

  const requestedScopes = normalizeScopeClaim(envelope.requestedScopes);
  const effectiveRequestedScopes = requestedScopes.length > 0 ? requestedScopes : tokenScopes;
  const unauthorizedScopes = effectiveRequestedScopes.filter(scope => !tokenScopes.includes(scope));

  if (unauthorizedScopes.length > 0) {
    return {
      ok: false as const,
      status: 403,
      body: {
        ok: false,
        error: 'token_scope_exceeded',
        message: 'The requested DEFINITIVE scopes exceed the scopes bound to this agent token.',
        requestedScopes: effectiveRequestedScopes,
        tokenBoundScopes: tokenScopes,
        unauthorizedScopes,
      },
    };
  }

  return {
    ok: true as const,
    envelope: {
      ...envelope,
      requestedScopes: effectiveRequestedScopes,
      tokenBoundScopes: tokenScopes,
      agentId: envelope.agentId ?? claims.agentId,
      agentPlatformId: envelope.agentPlatformId ?? claims.agentPlatformId,
      beneficialCustomerId: envelope.beneficialCustomerId ?? claims.beneficialCustomerId,
      billingOrgId: envelope.billingOrgId ?? claims.billingOrgId,
      mandateId: envelope.mandateId ?? claims.mandateId,
      authMode: envelope.authMode ?? 'token_bound_agent_scope',
    },
  };
}

export function normalizeScopeClaim(value: unknown): string[] {
  if (Array.isArray(value)) {
    return [...new Set(value.filter(item => typeof item === 'string').map(item => item.trim()).filter(Boolean))];
  }
  if (typeof value === 'string') {
    return [...new Set(value.split(/[,\s]+/).map(item => item.trim()).filter(Boolean))];
  }
  return [];
}
