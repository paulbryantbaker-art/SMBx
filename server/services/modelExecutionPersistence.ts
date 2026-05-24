import {
  DEFINITIVE_METHODOLOGY_URI,
  DEFINITIVE_METHODOLOGY_VERSION,
  DEFINITIVE_SPEC_URI,
  DEFINITIVE_SPEC_VERSION,
} from '../constants/definitive.js';
import { sql } from '../db.js';
import { createDefinitiveHash } from './definitiveAuditPacket.js';
import {
  buildModelFreshnessEnvelope,
  extractAssumptionsFromModelExecution,
  getModelDependencyRule,
} from '../../shared/modelStaleness.js';
import { buildModelRecomputePlan } from '../../shared/modelActionRouting.js';

export interface PersistModelExecutionInput {
  userId: number;
  dealId?: number | null;
  conversationId?: number | null;
  canvasTabId: string;
  modelType: string;
  modelTitle?: string | null;
  clientVersionNumber?: number | null;
  assumptions?: Record<string, any> | null;
  outputs?: Record<string, any> | null;
  keyOutputs?: Record<string, any> | null;
  versionSnapshot?: Record<string, any> | null;
  changeReason?: string | null;
  parentOutputHash?: string | null;
  dealStateCid?: string | null;
  sourceSurface?: string | null;
  toolName?: string | null;
  idempotencyKey?: string | null;
}

export interface ListModelExecutionInput {
  userId: number;
  executionId?: number | null;
  dealId?: number | null;
  canvasTabId?: string | null;
  modelType?: string | null;
  currentAssumptions?: Record<string, any> | null;
  currentVersionNumber?: number | null;
  limit?: number | null;
}

interface ModelBridge {
  runtimeModelId: string;
  modelSlotId?: string;
  modelName: string;
  citationTags: string[];
  deterministicCategory: 'catalog_slot' | 'runtime_bridge';
}

const MODEL_LINE_BOUNDARY =
  'DEFINITIVE computes deterministic model outputs from supplied inputs and versioned methodology state. The user, their advisor, counsel, lender, committee, or court decides reliance, opinion support, negotiation posture, and legal or investment conclusions.';

const MODEL_BRIDGES: Record<string, ModelBridge> = {
  working_capital: {
    runtimeModelId: 'MODEL.STRUCT.NWC.PEG.v1',
    modelSlotId: 'M109',
    modelName: 'Working Capital Peg',
    citationTags: ['ABA Deal Points', 'M109'],
    deterministicCategory: 'catalog_slot',
  },
  sba_financing: {
    runtimeModelId: 'MODEL.LBO.SBA.v1',
    modelSlotId: 'M119',
    modelName: 'SBA 7(a) Financing',
    citationTags: ['SBA SOP 50 10 8', 'M119'],
    deterministicCategory: 'catalog_slot',
  },
  cap_table: {
    runtimeModelId: 'MODEL.CAPTABLE.DILUTION.v1',
    modelSlotId: 'M146',
    modelName: 'Cap Table Waterfall',
    citationTags: ['NVCA term-sheet', 'M146'],
    deterministicCategory: 'catalog_slot',
  },
  earnout: {
    runtimeModelId: 'MODEL.STRUCT.EARNOUT.MC.v1',
    modelSlotId: 'M111',
    modelName: 'Earnout Expected Value',
    citationTags: ['SRS Acquiom earnout data', 'ABA Deal Points', 'M111-M115'],
    deterministicCategory: 'catalog_slot',
  },
  tax_impact: {
    runtimeModelId: 'MODEL.TAX.TRANSACTION.MASTER.v1',
    modelSlotId: 'M200',
    modelName: 'Transaction Tax Master Engine',
    citationTags: ['IRC §1060', 'IRC §338', 'IRC §453', 'M200'],
    deterministicCategory: 'catalog_slot',
  },
  covenant: {
    runtimeModelId: 'MODEL.COVENANT.COMPLIANCE.v1',
    modelSlotId: 'M184',
    modelName: 'Covenant Compliance',
    citationTags: ['LSTA covenant practice', 'M184'],
    deterministicCategory: 'catalog_slot',
  },
  valuation: {
    runtimeModelId: 'MODEL.VAL.BLENDED.v1',
    modelName: 'Blended Valuation Runtime',
    citationTags: ['V19 valuation runtime'],
    deterministicCategory: 'runtime_bridge',
  },
  sde_analysis: {
    runtimeModelId: 'MODEL.VAL.SDE.v1',
    modelName: 'SDE Analysis Runtime',
    citationTags: ['V19 valuation runtime'],
    deterministicCategory: 'runtime_bridge',
  },
  lbo: {
    runtimeModelId: 'MODEL.LBO.LMM.v1',
    modelName: 'Lower-Middle-Market LBO Runtime',
    citationTags: ['V19 LBO runtime'],
    deterministicCategory: 'runtime_bridge',
  },
  dcf: {
    runtimeModelId: 'MODEL.VAL.DCF.TWOSTAGE.v1',
    modelName: 'Two-Stage DCF Runtime',
    citationTags: ['V19 DCF runtime'],
    deterministicCategory: 'runtime_bridge',
  },
  sba: {
    runtimeModelId: 'MODEL.LBO.SBA.v1',
    modelSlotId: 'M119',
    modelName: 'SBA 7(a) Financing',
    citationTags: ['SBA SOP 50 10 8', 'M119'],
    deterministicCategory: 'catalog_slot',
  },
  sensitivity: {
    runtimeModelId: 'MODEL.UI.SENSITIVITY.v1',
    modelName: 'Sensitivity Matrix Runtime',
    citationTags: ['V19 sensitivity runtime'],
    deterministicCategory: 'runtime_bridge',
  },
  comparison: {
    runtimeModelId: 'MODEL.UI.COMPARISON.v1',
    modelName: 'Deal Comparison Runtime',
    citationTags: ['V19 comparison runtime'],
    deterministicCategory: 'runtime_bridge',
  },
};

export function buildModelExecutionArtifact(input: PersistModelExecutionInput) {
  const bridge = resolveModelBridge(input.modelType);
  const clientVersionNumber = normalizePositiveInteger(input.clientVersionNumber, 1);
  const assumptions = safeRecord(input.assumptions);
  const outputs = safeRecord(input.outputs);
  const keyOutputs = safeRecord(input.keyOutputs);
  const versionSnapshot = safeRecord(input.versionSnapshot);
  const sourceSurface = nullableString(input.sourceSurface) || 'model_canvas';
  const capturedAt = new Date().toISOString();
  const inputHash = createDefinitiveHash({
    schema: 'ModelExecutionInput.v0.1',
    specVersion: DEFINITIVE_SPEC_VERSION,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
    canvasTabId: input.canvasTabId,
    modelType: input.modelType,
    runtimeModelId: bridge.runtimeModelId,
    clientVersionNumber,
    assumptions,
    parentOutputHash: nullableString(input.parentOutputHash),
    dealStateCid: nullableString(input.dealStateCid),
  });
  const outputHash = createDefinitiveHash({
    schema: 'ModelExecutionOutput.v0.1',
    specVersion: DEFINITIVE_SPEC_VERSION,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
    runtimeModelId: bridge.runtimeModelId,
    clientVersionNumber,
    inputHash,
    outputs,
    keyOutputs,
  });
  const dependencyContract = getModelDependencyRule(input.modelType) as unknown as Record<string, any>;
  const recomputePlan = buildModelRecomputePlan(input.modelType) as unknown as Record<string, any>;
  const freshness = buildModelFreshnessEnvelope({
    modelType: input.modelType,
    currentAssumptions: assumptions,
    savedAssumptions: assumptions,
    currentVersionNumber: clientVersionNumber,
    savedVersionNumber: clientVersionNumber,
  }) as unknown as Record<string, any>;
  const modelOutput = bridge.modelSlotId
    ? {
        schema: 'ModelOutput.v0.1',
        modelId: bridge.modelSlotId,
        runtimeModelId: bridge.runtimeModelId,
        modelName: bridge.modelName,
        methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
        methodologyUri: DEFINITIVE_METHODOLOGY_URI,
        inputs: assumptions,
        outputs,
        keyOutputs,
        inputHash,
        outputHash,
        assumptions: {
          schema: 'AssumptionLog.v0.1',
          canvasTabId: input.canvasTabId,
          clientVersionNumber,
          changeReason: nullableString(input.changeReason)
            || nullableString(versionSnapshot.changeReason)
            || 'Model canvas run',
          values: assumptions,
          capturedAt,
        },
        citations: bridge.citationTags.map(tag => ({ tag, status: 'declared' })),
        dependencyContract,
        recomputePlan,
        freshness,
        lineBoundary: MODEL_LINE_BOUNDARY,
        next_suggested_calls: buildNextSuggestedCalls(input.modelType),
      }
    : {
        schema: 'RuntimeModelOutput.v0.1',
        runtimeModelId: bridge.runtimeModelId,
        modelType: input.modelType,
        modelName: bridge.modelName,
        methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
        methodologyUri: DEFINITIVE_METHODOLOGY_URI,
        inputs: assumptions,
        outputs,
        keyOutputs,
        inputHash,
        outputHash,
        deterministicCategory: bridge.deterministicCategory,
        dependencyContract,
        recomputePlan,
        freshness,
        lineBoundary: MODEL_LINE_BOUNDARY,
        next_suggested_calls: buildNextSuggestedCalls(input.modelType),
      };
  const auditPayload = {
    schema: 'ModelExecutionAuditPayload.v0.1',
    specVersion: DEFINITIVE_SPEC_VERSION,
    specUri: DEFINITIVE_SPEC_URI,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
    methodologyUri: DEFINITIVE_METHODOLOGY_URI,
    canvasTabId: input.canvasTabId,
    modelType: input.modelType,
    modelTitle: nullableString(input.modelTitle) || bridge.modelName,
    runtimeModelId: bridge.runtimeModelId,
    modelSlotId: bridge.modelSlotId || null,
    clientVersionNumber,
    parentOutputHash: nullableString(input.parentOutputHash),
    dealStateCid: nullableString(input.dealStateCid),
    sourceSurface,
    lineBoundary: MODEL_LINE_BOUNDARY,
    inputHash,
    outputHash,
    versionSnapshot,
    modelOutput,
    recomputePlan,
    takeBackArtifacts: [
      'modelExecutionId',
      'canvasTabId',
      'clientVersionNumber',
      'inputHash',
      'outputHash',
      'modelOutput',
      'versionSnapshot',
    ],
    capturedAt,
  };

  return {
    bridge,
    clientVersionNumber,
    assumptions,
    outputs,
    keyOutputs,
    versionSnapshot,
    sourceSurface,
    inputHash,
    outputHash,
    modelOutput,
    auditPayload,
    lineBoundary: MODEL_LINE_BOUNDARY,
  };
}

export async function persistModelExecution(input: PersistModelExecutionInput) {
  if (!Number.isFinite(Number(input.userId)) || Number(input.userId) <= 0) {
    return { ok: false, skipped: true, reason: 'auth_required' };
  }
  if (!nullableString(input.canvasTabId)) {
    return { ok: false, error: 'canvas_tab_id_required' };
  }
  if (!nullableString(input.modelType)) {
    return { ok: false, error: 'model_type_required' };
  }

  const artifact = buildModelExecutionArtifact(input);
  const [row] = await sql`
    INSERT INTO model_executions (
      model_id, version, status, deal_id, user_id, conversation_id,
      tool_name, input_hash, output_hash, inputs, outputs, missing_inputs,
      citation_tags, audit_payload, canvas_tab_id, model_type, model_title,
      client_version_number, parent_output_hash, deal_state_cid, source_surface,
      line_boundary, model_output, version_snapshot, idempotency_key
    )
    VALUES (
      ${artifact.bridge.runtimeModelId}, ${DEFINITIVE_METHODOLOGY_VERSION}, 'complete',
      ${nullableNumber(input.dealId)}, ${Number(input.userId)}, ${nullableNumber(input.conversationId)},
      ${nullableString(input.toolName) || 'model_canvas.persist_version'},
      ${artifact.inputHash}, ${artifact.outputHash},
      ${sql.json(artifact.assumptions)}::jsonb,
      ${sql.json(artifact.outputs)}::jsonb,
      ${sql.json([])}::jsonb,
      ${sql.json(artifact.bridge.citationTags)}::jsonb,
      ${sql.json(artifact.auditPayload)}::jsonb,
      ${input.canvasTabId}, ${input.modelType},
      ${nullableString(input.modelTitle) || artifact.bridge.modelName},
      ${artifact.clientVersionNumber},
      ${nullableString(input.parentOutputHash)},
      ${nullableString(input.dealStateCid)},
      ${artifact.sourceSurface},
      ${artifact.lineBoundary},
      ${sql.json(artifact.modelOutput)}::jsonb,
      ${sql.json(artifact.versionSnapshot)}::jsonb,
      ${nullableString(input.idempotencyKey)}
    )
    RETURNING id, created_at
  `;

  return {
    ok: true,
    executionId: Number(row.id),
    modelId: artifact.bridge.runtimeModelId,
    modelSlotId: artifact.bridge.modelSlotId || null,
    canvasTabId: input.canvasTabId,
    clientVersionNumber: artifact.clientVersionNumber,
    inputHash: artifact.inputHash,
    outputHash: artifact.outputHash,
    lineBoundary: artifact.lineBoundary,
    modelOutput: artifact.modelOutput,
    recomputePlan: artifact.auditPayload.recomputePlan,
    versionSnapshot: artifact.versionSnapshot,
    takeBackArtifacts: artifact.auditPayload.takeBackArtifacts,
    createdAt: toIso(row.created_at),
  };
}

export async function listModelExecutions(input: ListModelExecutionInput) {
  const limit = Math.min(Math.max(normalizePositiveInteger(input.limit, 25), 1), 100);
  const currentAssumptions = safeRecord(input.currentAssumptions);
  const currentVersionNumber = normalizeNullableInteger(input.currentVersionNumber);
  const rows = await sql`
    SELECT id, model_id, version, status, deal_id, conversation_id, canvas_tab_id,
           model_type, model_title, client_version_number, input_hash, output_hash,
           parent_output_hash, deal_state_cid, source_surface, line_boundary,
           model_output, version_snapshot, created_at
    FROM model_executions
    WHERE user_id = ${Number(input.userId)}
      AND (${nullableNumber(input.executionId)}::bigint IS NULL OR id = ${nullableNumber(input.executionId)})
      AND (${nullableNumber(input.dealId)}::integer IS NULL OR deal_id = ${nullableNumber(input.dealId)})
      AND (${nullableString(input.canvasTabId)}::text IS NULL OR canvas_tab_id = ${nullableString(input.canvasTabId)})
      AND (${nullableString(input.modelType)}::text IS NULL OR model_type = ${nullableString(input.modelType)})
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;

  return {
    ok: true,
    executions: rows.map(row => {
      const execution = {
        executionId: Number(row.id),
        modelId: row.model_id,
        modelSlotId: row.model_output?.schema === 'ModelOutput.v0.1' ? row.model_output?.modelId || null : null,
        version: row.version,
        status: row.status,
        dealId: row.deal_id == null ? null : Number(row.deal_id),
        conversationId: row.conversation_id == null ? null : Number(row.conversation_id),
        canvasTabId: row.canvas_tab_id,
        modelType: row.model_type,
        modelTitle: row.model_title,
        clientVersionNumber: Number(row.client_version_number || 1),
        inputHash: row.input_hash,
        outputHash: row.output_hash,
        parentOutputHash: row.parent_output_hash,
        dealStateCid: row.deal_state_cid,
        sourceSurface: row.source_surface,
        lineBoundary: row.line_boundary,
        modelOutput: row.model_output || {},
        versionSnapshot: row.version_snapshot || {},
        createdAt: toIso(row.created_at),
      };
      const savedAssumptions = extractAssumptionsFromModelExecution(execution);
      const recomputePlan = buildModelRecomputePlan(row.model_type);
      return {
        ...execution,
        dependencyContract: getModelDependencyRule(row.model_type),
        recomputePlan,
        freshness: Object.keys(currentAssumptions).length
          ? buildModelFreshnessEnvelope({
              modelType: row.model_type,
              currentAssumptions,
              savedAssumptions,
              currentVersionNumber,
              savedVersionNumber: execution.clientVersionNumber,
            })
          : row.model_output?.freshness || null,
      };
    }),
  };
}

function resolveModelBridge(modelType: string): ModelBridge {
  const key = String(modelType || '').trim().toLowerCase();
  return MODEL_BRIDGES[key] || {
    runtimeModelId: `MODEL.UI.${key.replace(/[^a-z0-9]+/gi, '_').toUpperCase() || 'UNKNOWN'}.v1`,
    modelName: key ? `${key.replace(/_/g, ' ')} Runtime` : 'Model Canvas Runtime',
    citationTags: ['V19 model canvas runtime'],
    deterministicCategory: 'runtime_bridge',
  };
}

function buildNextSuggestedCalls(modelType: string): string[] {
  switch (modelType) {
    case 'valuation':
    case 'sde_analysis':
      return ['create_model_tab:lbo', 'create_model_tab:dcf', 'get_deal_state'];
    case 'lbo':
    case 'dcf':
      return ['update_model', 'create_model_tab:sensitivity', 'get_deal_state'];
    case 'working_capital':
      return ['create_model_tab:tax_impact', 'create_model_tab:lbo', 'get_deal_state'];
    case 'tax_impact':
      return ['create_model_tab:valuation', 'get_deal_state'];
    default:
      return ['update_model', 'get_deal_state'];
  }
}

function safeRecord(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function nullableNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function normalizePositiveInteger(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function normalizeNullableInteger(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

function toIso(value: unknown): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
