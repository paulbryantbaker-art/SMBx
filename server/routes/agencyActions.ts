import { Router } from 'express';
import {
  getPendingStagedActionForUser,
  listPendingStagedActions,
  markStagedActionCanceled,
  markStagedActionConfirmed,
  markStagedActionResult,
} from '../services/agencyStagedActions.js';
import { executeGovernedTool } from '../services/governedToolExecutor.js';

export const agencyActionsRouter = Router();

function parseId(value: string): number | null {
  const id = Number.parseInt(value, 10);
  return Number.isFinite(id) ? id : null;
}

function parseJsonResult(result: string): any {
  try {
    return JSON.parse(result);
  } catch {
    return { raw: result };
  }
}

agencyActionsRouter.get('/agency/actions', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const conversationId = req.query.conversationId ? Number.parseInt(String(req.query.conversationId), 10) : undefined;
    const actions = await listPendingStagedActions(userId, Number.isFinite(conversationId) ? conversationId : undefined);
    return res.json({ actions });
  } catch (err: any) {
    console.error('[agency-actions] list error:', err.message);
    return res.status(500).json({ error: 'Failed to load staged actions' });
  }
});

agencyActionsRouter.post('/agency/actions/:id/confirm', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid staged action id' });

    const action = await getPendingStagedActionForUser(id, userId);
    if (!action) return res.status(404).json({ error: 'Pending staged action not found' });

    await markStagedActionConfirmed(id, userId);
    const resultText = await executeGovernedTool(
      action.tool_name,
      {
        ...action.input,
        confirmed: true,
        confirmationSummary: req.body?.confirmationSummary || `Confirmed staged action ${id}`,
      },
      userId,
      action.conversation_id || 0,
      {
        actorType: 'user',
        actorId: userId,
        actingOnBehalfOfUserId: userId,
        sourceSurface: 'confirmation_route',
        sourceAgent: 'agency-actions-api',
      },
    );
    const result = parseJsonResult(resultText);
    const status = result?.blocked ? 'blocked' : result?.error ? 'failed' : 'executed';
    await markStagedActionResult({
      id,
      userId,
      status,
      result,
      reason: result?.message || result?.error,
    });

    return res.json({ actionId: id, status, result });
  } catch (err: any) {
    console.error('[agency-actions] confirm error:', err.message);
    return res.status(500).json({ error: 'Failed to confirm staged action' });
  }
});

agencyActionsRouter.post('/agency/actions/:id/cancel', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid staged action id' });

    const action = await markStagedActionCanceled(id, userId);
    if (!action) return res.status(404).json({ error: 'Pending staged action not found' });

    return res.json({ actionId: id, status: 'canceled' });
  } catch (err: any) {
    console.error('[agency-actions] cancel error:', err.message);
    return res.status(500).json({ error: 'Failed to cancel staged action' });
  }
});
