import { Router } from 'express';
import {
  listModelExecutions,
  persistModelExecution,
} from '../services/modelExecutionPersistence.js';

export const modelExecutionsRouter = Router();

modelExecutionsRouter.post('/model-executions', async (req, res) => {
  try {
    const userId = Number((req as any).userId);
    const result = await persistModelExecution({
      userId,
      dealId: req.body?.dealId,
      conversationId: req.body?.conversationId,
      canvasTabId: req.body?.canvasTabId,
      modelType: req.body?.modelType,
      modelTitle: req.body?.modelTitle,
      clientVersionNumber: req.body?.clientVersionNumber,
      assumptions: req.body?.assumptions,
      outputs: req.body?.outputs,
      keyOutputs: req.body?.keyOutputs,
      versionSnapshot: req.body?.versionSnapshot,
      changeReason: req.body?.changeReason,
      parentOutputHash: req.body?.parentOutputHash,
      dealStateCid: req.body?.dealStateCid,
      sourceSurface: req.body?.sourceSurface || 'model_canvas',
      toolName: req.body?.toolName,
      idempotencyKey: req.body?.idempotencyKey,
    });

    if ((result as any).ok === false && (result as any).error) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (err: any) {
    console.error('Persist model execution error:', err.message);
    return res.status(500).json({ ok: false, error: 'model_execution_persist_failed' });
  }
});

modelExecutionsRouter.get('/model-executions', async (req, res) => {
  try {
    const userId = Number((req as any).userId);
    const result = await listModelExecutions({
      userId,
      executionId: req.query.executionId == null ? null : Number(req.query.executionId),
      dealId: req.query.dealId == null ? null : Number(req.query.dealId),
      canvasTabId: req.query.canvasTabId as string | undefined,
      modelType: req.query.modelType as string | undefined,
      currentAssumptions: parseJsonObject(req.query.currentAssumptions),
      currentVersionNumber: req.query.currentVersionNumber == null ? null : Number(req.query.currentVersionNumber),
      limit: req.query.limit == null ? null : Number(req.query.limit),
    });
    return res.json(result);
  } catch (err: any) {
    console.error('List model executions error:', err.message);
    return res.status(500).json({ ok: false, error: 'model_execution_list_failed' });
  }
});

function parseJsonObject(value: unknown): Record<string, any> | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
