import { Router } from 'express';
import { listV19ResourceContract } from '../services/v19ResourceContract.js';
import { readV19Resource } from '../services/v19ResourceReader.js';
import {
  checkV19Entitlement,
  formatV19TollgateForYulia,
  recordV19UsageEvent,
} from '../services/v19EntitlementService.js';

export const v19ResourcesRouter = Router();

v19ResourcesRouter.get('/v19/resource-contract', (_req, res) => {
  res.json(listV19ResourceContract());
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
      metadata: { uri, kind: resource.kind },
    });
    return res.json(resource);
  } catch (err: any) {
    const message = err.message || 'Failed to read V19 resource';
    const status = /not found/i.test(message) ? 404 : /invalid|required|must be|unknown|unsupported/i.test(message) ? 400 : 500;
    return res.status(status).json({ error: message });
  }
});
