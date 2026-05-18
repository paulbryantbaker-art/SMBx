import { Router } from 'express';
import { listV19ResourceContract } from '../services/v19ResourceContract.js';
import { readV19Resource } from '../services/v19ResourceReader.js';

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
    const resource = await readV19Resource(userId, uri);
    return res.json(resource);
  } catch (err: any) {
    const message = err.message || 'Failed to read V19 resource';
    const status = /not found/i.test(message) ? 404 : /invalid|required|must be|unknown|unsupported/i.test(message) ? 400 : 500;
    return res.status(status).json({ error: message });
  }
});
