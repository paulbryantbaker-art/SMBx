import { extractAssumptionsFromModelExecution } from '@shared/modelStaleness';
import { listSavedModelExecutions, type SavedModelExecution } from './modelExecutionPersistence';

interface OpenSavedModelRerunInput {
  executionId: number | string;
  dealTitle?: string | null;
  currentAssumptions?: Record<string, any> | null;
  sourceSurface?: string;
  onTalkToYulia?: (prompt: string) => void;
}

export async function openSavedModelExecutionAsRerun(input: OpenSavedModelRerunInput): Promise<SavedModelExecution | null> {
  if (typeof window === 'undefined') return null;
  const executionId = Number(input.executionId);
  if (!Number.isFinite(executionId) || executionId <= 0) {
    input.onTalkToYulia?.('I could not find the saved model execution id for this refresh item. Explain the stale model stack and show the safest rerun path.');
    return null;
  }

  const result = await listSavedModelExecutions({ executionId, limit: 1 });
  const execution = result.ok ? result.executions?.[0] : null;
  if (!execution) {
    input.onTalkToYulia?.(`Saved model execution ${executionId} is not available in this workspace. Explain what needs rerun and reopen the closest model from current deal facts.`);
    return null;
  }

  const savedAssumptions = extractAssumptionsFromModelExecution(execution);
  const currentAssumptions = input.currentAssumptions && typeof input.currentAssumptions === 'object'
    ? input.currentAssumptions
    : {};
  const assumptions = { ...savedAssumptions, ...currentAssumptions };
  const tabId = `model-rerun-${execution.executionId}-${Date.now()}`;
  window.dispatchEvent(new CustomEvent('smbx:canvas_action', {
    detail: {
      canvas_action: 'create_model_tab',
      tabId,
      modelType: execution.modelType,
      title: `${execution.modelTitle} · rerun`,
      initialAssumptions: assumptions,
      dealId: execution.dealId ?? undefined,
      dealTitle: input.dealTitle ?? undefined,
      parentOutputHash: execution.outputHash,
      sourceSurface: input.sourceSurface || 'model_refresh',
      recomputeActionKey: execution.recomputePlan?.actionKey || null,
      modelExecutionId: execution.executionId,
    },
  }));

  return execution;
}
