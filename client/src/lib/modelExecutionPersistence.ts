import type { ModelTab, ModelVersion } from './modelStore';
import type { ModelFreshnessEnvelope } from '@shared/modelStaleness';
import type { ModelRecomputePlan } from '@shared/modelActionRouting';
import { authHeaders } from '../hooks/useAuth';

export interface PersistModelVersionPayload {
  tab: ModelTab;
  versionSnapshot?: ModelVersion;
  parentOutputHash?: string | null;
  sourceSurface?: string;
}

export interface PersistModelVersionResult {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  executionId?: number;
  outputHash?: string;
}

export interface SavedModelExecution {
  executionId: number;
  modelId: string;
  modelSlotId?: string | null;
  dealId?: number | null;
  canvasTabId: string;
  modelType: string;
  modelTitle: string;
  clientVersionNumber: number;
  inputHash: string;
  outputHash: string;
  parentOutputHash?: string | null;
  sourceSurface?: string | null;
  lineBoundary?: string | null;
  modelOutput?: Record<string, any>;
  versionSnapshot?: Record<string, any>;
  recomputePlan?: ModelRecomputePlan | null;
  freshness?: ModelFreshnessEnvelope | null;
  createdAt?: string | null;
}

export interface SavedModelExecutionReadResult {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  executions?: SavedModelExecution[];
}

export async function persistModelVersionSnapshot(
  payload: PersistModelVersionPayload,
): Promise<PersistModelVersionResult> {
  if (typeof window === 'undefined') {
    return { ok: false, skipped: true, reason: 'server_render' };
  }

  const headers = authHeaders();
  if (!headers.Authorization) {
    return { ok: false, skipped: true, reason: 'auth_required' };
  }

  try {
    const res = await fetch('/api/model-executions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        dealId: payload.tab.dealId ?? null,
        canvasTabId: payload.tab.id,
        modelType: payload.tab.type,
        modelTitle: payload.tab.title,
        clientVersionNumber: payload.tab.versionNumber,
        assumptions: payload.tab.assumptions,
        outputs: payload.tab.outputs,
        keyOutputs: payload.versionSnapshot?.keyOutputs || {},
        versionSnapshot: payload.versionSnapshot || null,
        changeReason: payload.versionSnapshot?.changeReason || null,
        parentOutputHash: payload.parentOutputHash || null,
        sourceSurface: payload.sourceSurface || 'model_canvas',
        toolName: 'model_canvas.persist_version',
        idempotencyKey: `${payload.tab.id}:${payload.tab.versionNumber}:${payload.versionSnapshot?.createdAt || payload.tab.updatedAt}`,
      }),
    });

    if (res.status === 401 || res.status === 403) {
      return { ok: false, skipped: true, reason: 'auth_required' };
    }
    if (!res.ok) {
      return { ok: false, reason: `http_${res.status}` };
    }
    return await res.json();
  } catch {
    return { ok: false, skipped: true, reason: 'network_error' };
  }
}

export async function listSavedModelExecutions(input: {
  executionId?: number | string | null;
  canvasTabId?: string | null;
  dealId?: number | string | null;
  modelType?: string | null;
  currentAssumptions?: Record<string, any> | null;
  currentVersionNumber?: number | null;
  limit?: number;
}): Promise<SavedModelExecutionReadResult> {
  if (typeof window === 'undefined') {
    return { ok: false, skipped: true, reason: 'server_render' };
  }
  const headers = authHeaders();
  if (!headers.Authorization) {
    return { ok: false, skipped: true, reason: 'auth_required' };
  }

  const params = new URLSearchParams();
  if (input.executionId != null && String(input.executionId).trim()) params.set('executionId', String(input.executionId));
  if (input.canvasTabId) params.set('canvasTabId', input.canvasTabId);
  if (input.dealId != null && String(input.dealId).trim()) params.set('dealId', String(input.dealId));
  if (input.modelType) params.set('modelType', input.modelType);
  if (input.currentAssumptions) params.set('currentAssumptions', JSON.stringify(input.currentAssumptions));
  if (input.currentVersionNumber) params.set('currentVersionNumber', String(input.currentVersionNumber));
  if (input.limit) params.set('limit', String(input.limit));

  try {
    const res = await fetch(`/api/model-executions?${params.toString()}`, { headers });
    if (res.status === 401 || res.status === 403) {
      return { ok: false, skipped: true, reason: 'auth_required' };
    }
    if (!res.ok) return { ok: false, reason: `http_${res.status}` };
    return await res.json();
  } catch {
    return { ok: false, skipped: true, reason: 'network_error' };
  }
}
