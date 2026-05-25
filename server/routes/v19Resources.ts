import { Router } from 'express';
import { listV19ResourceContract } from '../services/v19ResourceContract.js';
import { readV19Resource } from '../services/v19ResourceReader.js';
import { executeDefinitiveMcpTool, listDefinitiveMcpTools } from '../services/definitiveMcp.js';
import { readDefinitiveAuditPacket } from '../services/definitiveAuditPacketReader.js';
import {
  createDefinitiveDataRightsGrant,
  listDefinitiveCorpusObservationTypes,
  readDefinitiveDataRightsState,
  recordDefinitiveCorpusObservation,
  revokeDefinitiveDataRightsGrant,
} from '../services/definitiveCorpusService.js';
import { listDefinitiveLineInventory } from '../services/agencyActionRegistry.js';
import { signDefinitiveAgentToken } from '../middleware/auth.js';
import {
  listDefinitiveDealPackets,
  persistDefinitiveDealStateCall,
  readLatestDefinitiveDealStateSnapshot,
} from '../services/definitiveDealStatePersistence.js';
import {
  checkV19Entitlement,
  formatV19TollgateForYulia,
  readV19UsageMeter,
  recordV19UsageEvent,
} from '../services/v19EntitlementService.js';

export const v19ResourcesRouter = Router();

v19ResourcesRouter.get('/v19/resource-contract', (_req, res) => {
  res.json(listV19ResourceContract());
});

v19ResourcesRouter.get('/definitive/tools/list', (_req, res) => {
  res.json(listDefinitiveMcpTools());
});

v19ResourcesRouter.get('/definitive/line/inventory', (_req, res) => {
  const inventory = listDefinitiveLineInventory();
  res.json({
    spec: 'DEFINITIVE.v1.0',
    status: 'internal_inventory',
    summary: inventory.reduce<Record<string, number>>((acc, contract) => {
      acc[contract.lineStatus] = (acc[contract.lineStatus] || 0) + 1;
      return acc;
    }, {}),
    inventory: inventory.map(contract => ({
      toolName: contract.toolName,
      actionId: contract.actionId,
      label: contract.label,
      lineStatus: contract.lineStatus,
      refusalBehavior: contract.refusalBehavior,
      lineReason: contract.lineReason,
      lineRisks: contract.lineRisks,
      permissionLevel: contract.permissionLevel,
      riskLevel: contract.riskLevel,
      confirmation: contract.confirmation,
      requiredScopes: contract.requiredScopes,
      citationRequirement: contract.citationRequirement,
      billing: contract.billing,
      externalAgentReady: contract.externalAgentReady,
    })),
  });
});

v19ResourcesRouter.get('/definitive/corpus/observation-types', (_req, res) => {
  res.json(listDefinitiveCorpusObservationTypes());
});

v19ResourcesRouter.post('/definitive/agent-tokens', async (req, res) => {
  const userId = Number((req as any).userId);
  if (!Number.isFinite(userId) || userId <= 0) return res.status(401).json({ error: 'Not authenticated' });
  const claims = (req as any).authClaims && typeof (req as any).authClaims === 'object' ? (req as any).authClaims : {};
  if (claims.tokenUse === 'definitive_agent') {
    return res.status(403).json({
      ok: false,
      error: 'agent_token_cannot_mint_agent_token',
      message: 'Mint scoped DEFINITIVE agent tokens from a human app session or future OAuth authorization flow, not from another agent token.',
    });
  }

  const profile = typeof req.body?.profile === 'string' ? req.body.profile : 'deal_operator';
  const requestedScopes = normalizeScopeClaim(req.body?.scopes);
  const scopes = requestedScopes.length ? requestedScopes : defaultAgentTokenScopes(profile);
  const unsupportedScopes = scopes.filter(scope => !SELF_SERVE_AGENT_TOKEN_SCOPES.has(scope));
  if (!scopes.length || unsupportedScopes.length) {
    return res.status(400).json({
      ok: false,
      error: 'unsupported_agent_token_scopes',
      message: 'The requested scopes are not available for self-serve DEFINITIVE agent tokens.',
      requestedScopes: scopes,
      unsupportedScopes,
      supportedScopes: [...SELF_SERVE_AGENT_TOKEN_SCOPES].sort(),
      profiles: DEFINITIVE_AGENT_TOKEN_PROFILES,
    });
  }

  const ttlMinutes = clampNumber(Number(req.body?.expiresInMinutes), 5, 24 * 60, 8 * 60);
  const agentId = typeof req.body?.agentId === 'string' && req.body.agentId.trim()
    ? req.body.agentId.trim()
    : `agent:definitive:${userId}:${Date.now()}`;
  const agentPlatformId = typeof req.body?.agentPlatformId === 'string' && req.body.agentPlatformId.trim()
    ? req.body.agentPlatformId.trim()
    : 'external_agent';
  const mandateId = typeof req.body?.mandateId === 'string' && req.body.mandateId.trim()
    ? req.body.mandateId.trim()
    : `mandate:definitive:${userId}`;
  const token = signDefinitiveAgentToken({
    userId,
    scopes,
    agentId,
    agentPlatformId,
    mandateId,
    beneficialCustomerId: req.body?.beneficialCustomerId,
    billingOrgId: req.body?.billingOrgId,
    expiresInSeconds: ttlMinutes * 60,
  });

  return res.json({
    ok: true,
    schema: 'DEFINITIVE.agent-token.v0.1',
    status: 'short_lived_scoped_jwt_bridge',
    tokenType: 'Bearer',
    tokenUse: 'definitive_agent',
    token,
    expiresInSeconds: ttlMinutes * 60,
    expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString(),
    agent: {
      agentId,
      agentPlatformId,
      mandateId,
      profile,
    },
    scopes,
    scopeRule: 'requestedScopes may be omitted or narrowed by the caller, but cannot exceed these token-bound scopes.',
    productionTarget: 'OAuth 2.1 + PKCE + scoped, audience-bound agent tokens',
  });
});

v19ResourcesRouter.get('/definitive/corpus/rights', async (req, res) => {
  const userId = Number((req as any).userId);
  if (!Number.isFinite(userId) || userId <= 0) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const state = await readDefinitiveDataRightsState({
      userId,
      organizationId: nullablePositiveNumber(req.query.organizationId),
      billingOrgId: nullablePositiveNumber(req.query.billingOrgId),
      beneficialCustomerId: nullablePositiveNumber(req.query.beneficialCustomerId),
    });
    return res.json(state);
  } catch (err: any) {
    console.error('[definitive] read corpus rights failed:', err.message);
    return res.status(500).json({ error: 'Failed to read DEFINITIVE data-rights state' });
  }
});

v19ResourcesRouter.post('/definitive/corpus/rights/grants', async (req, res) => {
  const userId = Number((req as any).userId);
  if (!Number.isFinite(userId) || userId <= 0) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const result = await createDefinitiveDataRightsGrant({
      userId,
      organizationId: nullablePositiveNumber(req.body?.organizationId),
      billingOrgId: nullablePositiveNumber(req.body?.billingOrgId),
      beneficialCustomerId: nullablePositiveNumber(req.body?.beneficialCustomerId),
      grantType: typeof req.body?.grantType === 'string' ? req.body.grantType : undefined,
      scope: req.body?.scope && typeof req.body.scope === 'object' ? req.body.scope : undefined,
      source: typeof req.body?.source === 'string' ? req.body.source : 'user',
      sourceReference: typeof req.body?.sourceReference === 'string' ? req.body.sourceReference : null,
      expiresAt: typeof req.body?.expiresAt === 'string' ? req.body.expiresAt : null,
      metadata: req.body?.metadata && typeof req.body.metadata === 'object' ? req.body.metadata : undefined,
    });
    return res.json(result);
  } catch (err: any) {
    console.error('[definitive] create corpus rights grant failed:', err.message);
    return res.status(500).json({ error: 'Failed to create DEFINITIVE data-rights grant' });
  }
});

v19ResourcesRouter.post('/definitive/corpus/rights/grants/:grantId/revoke', async (req, res) => {
  const userId = Number((req as any).userId);
  const grantId = Number(req.params.grantId);
  if (!Number.isFinite(userId) || userId <= 0) return res.status(401).json({ error: 'Not authenticated' });
  if (!Number.isFinite(grantId) || grantId <= 0) return res.status(400).json({ error: 'Invalid grant id' });

  try {
    const result = await revokeDefinitiveDataRightsGrant({ userId, grantId });
    return res.status(result.ok ? 200 : 404).json(result);
  } catch (err: any) {
    console.error('[definitive] revoke corpus rights grant failed:', err.message);
    return res.status(500).json({ error: 'Failed to revoke DEFINITIVE data-rights grant' });
  }
});

v19ResourcesRouter.post('/definitive/corpus/observations', async (req, res) => {
  const userId = Number((req as any).userId);
  if (!Number.isFinite(userId) || userId <= 0) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const result = await recordDefinitiveCorpusObservation({
      userId,
      organizationId: nullablePositiveNumber(req.body?.organizationId),
      billingOrgId: nullablePositiveNumber(req.body?.billingOrgId),
      beneficialCustomerId: nullablePositiveNumber(req.body?.beneficialCustomerId),
      dealId: nullablePositiveNumber(req.body?.dealId),
      observationType: String(req.body?.observationType || ''),
      observation: req.body?.observation && typeof req.body.observation === 'object' ? req.body.observation : {},
      anonymizationBucket: req.body?.anonymizationBucket && typeof req.body.anonymizationBucket === 'object' ? req.body.anonymizationBucket : {},
      sourceArtifactType: typeof req.body?.sourceArtifactType === 'string' ? req.body.sourceArtifactType : null,
      sourceArtifactId: req.body?.sourceArtifactId ?? null,
      sourceHash: typeof req.body?.sourceHash === 'string' ? req.body.sourceHash : null,
      minReleaseCount: nullablePositiveNumber(req.body?.minReleaseCount),
      metadata: req.body?.metadata && typeof req.body.metadata === 'object' ? req.body.metadata : {},
    });
    const status = result.ok ? 200 : result.error === 'data_rights_required' ? 428 : 400;
    return res.status(status).json(result);
  } catch (err: any) {
    console.error('[definitive] record corpus observation failed:', err.message);
    return res.status(500).json({ error: 'Failed to record DEFINITIVE corpus observation' });
  }
});

v19ResourcesRouter.get('/definitive/audit-packets/:auditTrailId', async (req, res) => {
  const userId = Number((req as any).userId);
  const auditTrailId = Number(req.params.auditTrailId);
  if (!Number.isFinite(userId) || userId <= 0) return res.status(401).json({ error: 'Not authenticated' });
  if (!Number.isFinite(auditTrailId) || auditTrailId <= 0) return res.status(400).json({ error: 'Invalid audit trail id' });

  try {
    const packet = await readDefinitiveAuditPacket(userId, auditTrailId);
    if (!packet) return res.status(404).json({ error: 'DEFINITIVE audit packet not found' });
    res.set({
      'Cache-Control': 'no-store',
      'Content-Disposition': req.query.download === '1'
        ? `attachment; filename="definitive-audit-${auditTrailId}.json"`
        : 'inline',
    });
    return res.json(packet);
  } catch (err: any) {
    console.error('[definitive] read audit packet failed:', err.message);
    return res.status(500).json({ error: 'Failed to read DEFINITIVE audit packet' });
  }
});

v19ResourcesRouter.post('/definitive/tools/call', async (req, res) => {
  const userId = Number((req as any).userId);
  if (!Number.isFinite(userId) || userId <= 0) return res.status(401).json({ error: 'Not authenticated' });

  const toolName = String(req.body?.toolName || '').trim();
  if (!toolName) return res.status(400).json({ error: 'toolName is required' });
  const scopedEnvelope = buildTokenScopedDefinitiveEnvelope(req, req.body || {});
  if (!scopedEnvelope.ok) return res.status(scopedEnvelope.status).json(scopedEnvelope.body);

  try {
    const response = await executeDefinitiveMcpTool({
      userId,
      toolName,
      input: req.body?.input && typeof req.body.input === 'object' ? req.body.input : {},
      envelope: scopedEnvelope.envelope,
    });
    (response.body as Record<string, any>).persistence = await persistDealStateCallBestEffort({
      userId,
      toolName,
      toolInput: req.body?.input && typeof req.body.input === 'object' ? req.body.input : {},
      envelope: scopedEnvelope.envelope,
      responseBody: response.body,
    });
    return res.status(response.status).json(response.body);
  } catch (err: any) {
    console.error('[definitive] tool call failed:', err.message);
    return res.status(500).json({ error: 'Failed to execute DEFINITIVE tool' });
  }
});

v19ResourcesRouter.post('/definitive/tools/:toolName/call', async (req, res) => {
  const userId = Number((req as any).userId);
  if (!Number.isFinite(userId) || userId <= 0) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const toolInput = req.body?.input && typeof req.body.input === 'object' ? req.body.input : req.body || {};
    const scopedEnvelope = buildTokenScopedDefinitiveEnvelope(req, req.body || {});
    if (!scopedEnvelope.ok) return res.status(scopedEnvelope.status).json(scopedEnvelope.body);
    const response = await executeDefinitiveMcpTool({
      userId,
      toolName: String(req.params.toolName || '').trim(),
      input: toolInput,
      envelope: scopedEnvelope.envelope,
    });
    (response.body as Record<string, any>).persistence = await persistDealStateCallBestEffort({
      userId,
      toolName: String(req.params.toolName || '').trim(),
      toolInput,
      envelope: scopedEnvelope.envelope,
      responseBody: response.body,
    });
    return res.status(response.status).json(response.body);
  } catch (err: any) {
    console.error('[definitive] tool call failed:', err.message);
    return res.status(500).json({ error: 'Failed to execute DEFINITIVE tool' });
  }
});

v19ResourcesRouter.get('/definitive/deal-state/latest', async (req, res) => {
  const userId = Number((req as any).userId);
  if (!Number.isFinite(userId) || userId <= 0) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const result = await readLatestDefinitiveDealStateSnapshot({
      userId,
      dealId: nullablePositiveNumber(req.query.dealId),
      conversationId: nullablePositiveNumber(req.query.conversationId),
      stateCid: typeof req.query.stateCid === 'string' ? req.query.stateCid : null,
    });
    if (!result.ok) return res.status(result.error === 'not_found' ? 404 : 400).json(result);
    return res.json(result);
  } catch (err: any) {
    console.error('[definitive] read latest deal state failed:', err.message);
    return res.status(500).json({ error: 'Failed to read DEFINITIVE deal state' });
  }
});

v19ResourcesRouter.get('/definitive/deal-packets', async (req, res) => {
  const userId = Number((req as any).userId);
  if (!Number.isFinite(userId) || userId <= 0) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const result = await listDefinitiveDealPackets({
      userId,
      dealId: nullablePositiveNumber(req.query.dealId),
      conversationId: nullablePositiveNumber(req.query.conversationId),
      stateCid: typeof req.query.stateCid === 'string' ? req.query.stateCid : null,
      packetRowId: nullablePositiveNumber(req.query.packetRowId ?? req.query.rowId ?? req.query.id),
      limit: nullablePositiveNumber(req.query.limit),
    });
    if (!result.ok) return res.status(400).json(result);
    return res.json(result);
  } catch (err: any) {
    console.error('[definitive] list deal packets failed:', err.message);
    return res.status(500).json({ error: 'Failed to list DEFINITIVE deal packets' });
  }
});

v19ResourcesRouter.get('/v19/entitlements', async (req, res) => {
  const userId = Number((req as any).userId);
  if (!Number.isFinite(userId) || userId <= 0) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const usage = await readV19UsageMeter(userId);
    return res.json({
      usage,
      tollgateStates: ['credit_budget_required', 'human_approval_required', 'enterprise_scope_required'],
    });
  } catch (err: any) {
    console.error('[v19] read entitlements failed:', err.message);
    return res.status(500).json({ error: 'Failed to read V19 entitlements' });
  }
});

v19ResourcesRouter.get('/v19/resources', async (req, res) => {
  const userId = Number((req as any).userId);
  const uri = String(req.query.uri || '').trim();
  if (!Number.isFinite(userId) || userId <= 0) return res.status(401).json({ error: 'Not authenticated' });
  if (!uri) return res.status(400).json({ error: 'uri is required' });

  try {
    const gate = await checkV19Entitlement(userId, 'api_call', {
      actionId: 'read_v19_resource',
      toolName: 'read_v19_resource',
      sourceSurface: 'api',
      resourceType: 'v19_resource',
      resourceId: uri,
      metadata: { uri },
    });
    if (!gate.allowed) {
      return res.status(gate.tollgate?.code === 'credit_budget_required' ? 402 : 403).json({
        error: gate.tollgate?.message || 'V19 resource access is not available on the current plan',
        tollgate: formatV19TollgateForYulia(gate.tollgate),
        usage: gate.meter,
      });
    }

    const resource = await readV19Resource(userId, uri);
    await recordV19UsageEvent({
      userId,
      eventType: 'api_call',
      actionId: 'read_v19_resource',
      toolName: 'read_v19_resource',
      sourceSurface: 'api',
      resourceType: 'v19_resource',
      resourceId: uri,
      metadata: { uri, kind: (resource.artifact as any)?.kind || 'unknown' },
    });
    return res.json(resource);
  } catch (err: any) {
    const message = err.message || 'Failed to read V19 resource';
    const status = /not found/i.test(message) ? 404 : /invalid|required|must be|unknown|unsupported/i.test(message) ? 400 : 500;
    return res.status(status).json({ error: message });
  }
});

function nullablePositiveNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

const DEFINITIVE_AGENT_TOKEN_PROFILES = {
  discovery: ['capability:read', 'methodology:read', 'model-catalog:read', 'deal-plan:read', 'pricing:read', 'pass-through:read'],
  deal_operator: [
    'capability:read',
    'methodology:read',
    'authority:read',
    'deal-state:read',
    'deal-state:write',
    'deal:classify',
    'deal:read',
    'deal-plan:read',
    'model-catalog:read',
    'model-stack:compose',
    'model:read',
    'model:execute',
    'studio:draft',
    'data-room:read',
    'completeness:read',
    'deal-package:read',
    'deal-package:compose',
    'deal-package:verify',
    'permutation:read',
    'audit:write',
  ],
  document_builder: [
    'methodology:read',
    'deal-state:read',
    'deal-plan:read',
    'model:read',
    'studio:draft',
    'data-room:read',
    'deal-package:read',
    'deal-package:compose',
    'completeness:read',
  ],
} as const;

const SELF_SERVE_AGENT_TOKEN_SCOPES = new Set([
  ...DEFINITIVE_AGENT_TOKEN_PROFILES.discovery,
  ...DEFINITIVE_AGENT_TOKEN_PROFILES.deal_operator,
  ...DEFINITIVE_AGENT_TOKEN_PROFILES.document_builder,
  'citation:read',
  'market-data:read',
  'conformance:read',
]);

function defaultAgentTokenScopes(profile: string): string[] {
  if (profile === 'discovery') return [...DEFINITIVE_AGENT_TOKEN_PROFILES.discovery];
  if (profile === 'document_builder') return [...DEFINITIVE_AGENT_TOKEN_PROFILES.document_builder];
  return [...DEFINITIVE_AGENT_TOKEN_PROFILES.deal_operator];
}

function clampNumber(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(value)));
}

function buildTokenScopedDefinitiveEnvelope(req: any, envelope: Record<string, any>) {
  const claims = req.authClaims && typeof req.authClaims === 'object' ? req.authClaims : {};
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

function normalizeScopeClaim(value: unknown): string[] {
  if (Array.isArray(value)) {
    return [...new Set(value.filter(item => typeof item === 'string').map(item => item.trim()).filter(Boolean))];
  }
  if (typeof value === 'string') {
    return [...new Set(value.split(/[,\s]+/).map(item => item.trim()).filter(Boolean))];
  }
  return [];
}

async function persistDealStateCallBestEffort(input: {
  userId: number;
  toolName: string;
  toolInput: Record<string, any>;
  envelope: Record<string, any>;
  responseBody: Record<string, any>;
}) {
  try {
    return await persistDefinitiveDealStateCall(input);
  } catch (err: any) {
    console.warn('[definitive] deal-state persistence skipped:', err.message);
    return {
      ok: false,
      skipped: true,
      reason: 'persistence_failed',
      message: err.message,
    };
  }
}
