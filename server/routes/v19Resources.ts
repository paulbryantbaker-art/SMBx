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

  try {
    const response = await executeDefinitiveMcpTool({
      userId,
      toolName,
      input: req.body?.input && typeof req.body.input === 'object' ? req.body.input : {},
      envelope: req.body || {},
    });
    (response.body as Record<string, any>).persistence = await persistDealStateCallBestEffort({
      userId,
      toolName,
      toolInput: req.body?.input && typeof req.body.input === 'object' ? req.body.input : {},
      envelope: req.body || {},
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
    const response = await executeDefinitiveMcpTool({
      userId,
      toolName: String(req.params.toolName || '').trim(),
      input: toolInput,
      envelope: req.body || {},
    });
    (response.body as Record<string, any>).persistence = await persistDealStateCallBestEffort({
      userId,
      toolName: String(req.params.toolName || '').trim(),
      toolInput,
      envelope: req.body || {},
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
