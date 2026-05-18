import { createHash } from 'crypto';
import { HSR_2026, SBA_SOP_50_10_8 } from '../constants/v19Regulatory.js';
import { canonicalizeModelId, getRegisteredModel } from './modelRegistry.js';

export type V19ModelStatus = 'complete' | 'needs_inputs';

export interface V19ModelExecutionInput {
  modelId: string;
  input?: Record<string, any>;
  dealId?: number | null;
  userId?: number | null;
  conversationId?: number | null;
}

export interface V19ModelExecution {
  modelId: string;
  version: string;
  status: V19ModelStatus;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  missingInputs: string[];
  citationTags: string[];
  outputHash: string;
  auditPayload: {
    modelId: string;
    version: string;
    dealId: number | null;
    userId: number | null;
    conversationId: number | null;
    inputHash: string;
    outputHash: string;
    missingInputs: string[];
    executedAt: string;
  };
}

export interface V19ModelExecutionRecord {
  id: number;
  createdAt: string;
}

export interface V19ModelExecutionPersistenceInput {
  studioBookId?: number | null;
  studioVersionId?: number | null;
  toolName?: string | null;
}

interface V19ModelDefinition {
  id: string;
  version: string;
  inputSchema: Record<string, any>;
  citationTags: string[];
  run: (input: Record<string, any>) => { outputs: Record<string, any>; missingInputs?: string[] };
}

const MODEL_DEFINITIONS: Record<string, V19ModelDefinition> = {
  'MODEL.VAL.SDE.v1': defineModel('MODEL.VAL.SDE.v1', ['seller_discretionary_earnings_cents'], ['[Pepperdine PCAP 2025]'], input => {
    const sde = cents(input.seller_discretionary_earnings_cents ?? input.sde_cents);
    const addBacks = cents(input.add_backs_cents) ?? 0;
    const ownerComp = cents(input.owner_comp_cents) ?? 0;
    const missing = requireInputs({ seller_discretionary_earnings_cents: sde });
    return {
      missingInputs: missing,
      outputs: missing.length ? {} : { normalized_sde_cents: sde! + addBacks + ownerComp },
    };
  }),
  'MODEL.VAL.EBITDA.v1': defineModel('MODEL.VAL.EBITDA.v1', ['ebitda_cents'], ['[Damodaran 2026]', '[Kroll 2024]'], input => {
    const ebitda = cents(input.ebitda_cents);
    const adjustments = cents(input.adjustments_cents) ?? 0;
    const missing = requireInputs({ ebitda_cents: ebitda });
    return {
      missingInputs: missing,
      outputs: missing.length ? {} : { adjusted_ebitda_cents: ebitda! + adjustments },
    };
  }),
  'MODEL.VAL.TRIANGULATION.v1': defineModel('MODEL.VAL.TRIANGULATION.v1', ['normalized_earnings_cents', 'low_multiple', 'high_multiple'], ['[Damodaran 2026]', '[Pepperdine PCAP 2025]'], input => {
    const earnings = cents(input.normalized_earnings_cents ?? input.adjusted_ebitda_cents ?? input.normalized_sde_cents);
    const lowMultiple = number(input.low_multiple);
    const highMultiple = number(input.high_multiple);
    const missing = requireInputs({ normalized_earnings_cents: earnings, low_multiple: lowMultiple, high_multiple: highMultiple });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const low = Math.round(earnings! * lowMultiple!);
    const high = Math.round(earnings! * highMultiple!);
    return { outputs: { enterprise_value_low_cents: low, enterprise_value_mid_cents: Math.round((low + high) / 2), enterprise_value_high_cents: high } };
  }),
  'MODEL.DSCR.STRESS.v1': defineModel('MODEL.DSCR.STRESS.v1', ['cash_flow_cents', 'annual_debt_service_cents'], ['[SBA SOP 50 10 8]', '[FRED:DPRIME]'], input => {
    const cashFlow = cents(input.cash_flow_cents ?? input.adjusted_ebitda_cents ?? input.normalized_sde_cents);
    const debtService = cents(input.annual_debt_service_cents);
    const missing = requireInputs({ cash_flow_cents: cashFlow, annual_debt_service_cents: debtService });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const scenarios = [0, -0.1, -0.2, -0.3].map(change => {
      const stressedCashFlow = Math.round(cashFlow! * (1 + change));
      return {
        revenue_change_pct: change,
        cash_flow_cents: stressedCashFlow,
        dscr: round(stressedCashFlow / debtService!, 2),
      };
    });
    return { outputs: { base_dscr: scenarios[0].dscr, stressed_cases: scenarios, lender_floor: SBA_SOP_50_10_8.DSCR_LENDER_STD } };
  }),
  'MODEL.STRUCT.NWC.PEG.v1': defineModel('MODEL.STRUCT.NWC.PEG.v1', ['monthly_nwc_cents'], ['[ABA 2025]', '[SRS 2025]'], input => {
    const monthly = arrayOfCents(input.monthly_nwc_cents);
    if (!monthly.length) return { missingInputs: ['monthly_nwc_cents'], outputs: {} };
    const sum = monthly.reduce((acc, value) => acc + value, 0);
    return {
      outputs: {
        peg_cents: Math.round(sum / monthly.length),
        observed_months: monthly.length,
        low_cents: Math.min(...monthly),
        high_cents: Math.max(...monthly),
      },
    };
  }),
  'MODEL.SOURCES.USES.v1': defineModel('MODEL.SOURCES.USES.v1', ['sources_cents', 'uses_cents'], [], input => {
    const sources = sumCents(input.sources_cents);
    const uses = sumCents(input.uses_cents);
    const missing = requireInputs({ sources_cents: sources, uses_cents: uses });
    return {
      missingInputs: missing,
      outputs: missing.length ? {} : { total_sources_cents: sources!, total_uses_cents: uses!, funding_gap_cents: uses! - sources! },
    };
  }),
  'MODEL.LBO.SBA.v1': defineModel('MODEL.LBO.SBA.v1', ['purchase_price_cents', 'cash_flow_cents', 'buyer_equity_cents', 'annual_debt_service_cents'], ['[SBA SOP 50 10 8]', '[FRED:DPRIME]'], input => {
    const purchasePrice = cents(input.purchase_price_cents);
    const cashFlow = cents(input.cash_flow_cents);
    const equity = cents(input.buyer_equity_cents);
    const debtService = cents(input.annual_debt_service_cents);
    const missing = requireInputs({ purchase_price_cents: purchasePrice, cash_flow_cents: cashFlow, buyer_equity_cents: equity, annual_debt_service_cents: debtService });
    if (missing.length) return { missingInputs: missing, outputs: {} };
    const equityPct = equity! / purchasePrice!;
    const dscr = cashFlow! / debtService!;
    return {
      outputs: {
        buyer_equity_pct: round(equityPct, 4),
        dscr: round(dscr, 2),
        meets_sba_equity_floor: equityPct >= SBA_SOP_50_10_8.EQUITY_INJECTION_PCT,
        meets_sba_dscr_floor: dscr >= SBA_SOP_50_10_8.DSCR_SBA_FLOOR,
        max_7a_loan_cents: SBA_SOP_50_10_8.LOAN_7A_MAX * 100,
      },
    };
  }),
  'MODEL.HSR.TRIAGE.v1': defineModel('MODEL.HSR.TRIAGE.v1', ['enterprise_value_cents'], ['[FTC 2026 HSR - Size of Transaction]'], input => {
    const enterpriseValue = cents(input.enterprise_value_cents);
    const missing = requireInputs({ enterprise_value_cents: enterpriseValue });
    return {
      missingInputs: missing,
      outputs: missing.length ? {} : {
        size_of_transaction_cents: enterpriseValue,
        threshold_cents: HSR_2026.SIZE_OF_TRANSACTION * 100,
        hsr_size_triggered: enterpriseValue! >= HSR_2026.SIZE_OF_TRANSACTION * 100,
        auto_reportable_cents: HSR_2026.AUTO_REPORTABLE * 100,
      },
    };
  }),
  'MODEL.QOE.LITE.v1': defineModel('MODEL.QOE.LITE.v1', ['financial_facts'], ['[ABA 2025]', '[SRS 2025]'], input => {
    const facts = Array.isArray(input.financial_facts) ? input.financial_facts : [];
    const adjustments = Array.isArray(input.adjustments) ? input.adjustments : [];
    const missing = facts.length ? [] : ['financial_facts'];
    return {
      missingInputs: missing,
      outputs: missing.length ? {} : {
        fact_count: facts.length,
        adjustment_count: adjustments.length,
        unsupported_adjustments: adjustments.filter((item: any) => !item?.source_id && !item?.citation_tag).length,
      },
    };
  }),
};

const GENERIC_MODELS = new Set([
  'MODEL.TAX.STRUCTURE.v1',
  'MODEL.LEGAL.HALTSCAN.v1',
  'MODEL.BUYER.FIT.v1',
  'MODEL.DEAL.SCORE.v1',
  'MODEL.MARKET.CONTEXT.v1',
  'MODEL.SENSITIVITY.MATRIX.v1',
  'MODEL.DEAL.COMPARISON.v1',
  'MODEL.LBO.LMM.v1',
  'MODEL.CAPTABLE.DILUTION.v1',
  'MODEL.STRUCT.EARNOUT.MC.v1',
  'MODEL.COVENANT.COMPLIANCE.v1',
  'MODEL.VAL.DCF.TWOSTAGE.v1',
  'MODEL.PMI.VALUE.CREATION.v1',
  'MODEL.STRUCT.PPA.v1',
  'MODEL.STRUCT.ROLLOVER.v1',
  'MODEL.STRUCT.ANALYSIS.v1',
  'MODEL.DEALKILL.PROB.v1',
  'MODEL.TIMELINE.MC.v1',
]);

export async function executeV19Model(args: V19ModelExecutionInput): Promise<V19ModelExecution> {
  const modelId = canonicalizeModelId(args.modelId);
  const registered = getRegisteredModel(modelId);
  const definition = MODEL_DEFINITIONS[modelId] || genericDefinition(modelId, registered?.citationTags || []);
  if (!definition) {
    throw new Error(`Unknown V19 model: ${args.modelId}`);
  }

  const inputs = sanitizeInputs(args.input || {});
  const run = definition.run(inputs);
  const missingInputs = [...new Set(run.missingInputs || [])];
  const status: V19ModelStatus = missingInputs.length ? 'needs_inputs' : 'complete';
  const outputs = run.outputs || {};
  const inputHash = hash({ modelId, inputs });
  const outputHash = hash({ modelId, status, outputs, missingInputs });
  const auditPayload = {
    modelId,
    version: definition.version,
    dealId: args.dealId ?? null,
    userId: args.userId ?? null,
    conversationId: args.conversationId ?? null,
    inputHash,
    outputHash,
    missingInputs,
    executedAt: new Date().toISOString(),
  };

  return {
    modelId,
    version: definition.version,
    status,
    inputs,
    outputs,
    missingInputs,
    citationTags: definition.citationTags,
    outputHash,
    auditPayload,
  };
}

export async function persistV19ModelExecution(
  execution: V19ModelExecution,
  context: V19ModelExecutionPersistenceInput = {},
): Promise<V19ModelExecutionRecord> {
  const { sql } = await import('../db.js');
  const [row] = await sql`
    INSERT INTO model_executions (
      model_id, version, status, deal_id, user_id, conversation_id, studio_book_id,
      studio_version_id, tool_name, input_hash, output_hash, inputs, outputs,
      missing_inputs, citation_tags, audit_payload
    )
    VALUES (
      ${execution.modelId},
      ${execution.version},
      ${execution.status},
      ${execution.auditPayload.dealId},
      ${execution.auditPayload.userId},
      ${execution.auditPayload.conversationId},
      ${context.studioBookId ?? null},
      ${context.studioVersionId ?? null},
      ${context.toolName ?? null},
      ${execution.auditPayload.inputHash},
      ${execution.outputHash},
      ${sql.json(execution.inputs)}::jsonb,
      ${sql.json(execution.outputs)}::jsonb,
      ${sql.json(execution.missingInputs)}::jsonb,
      ${sql.json(execution.citationTags)}::jsonb,
      ${sql.json(execution.auditPayload)}::jsonb
    )
    RETURNING id, created_at
  `;
  return { id: Number(row.id), createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at) };
}

function defineModel(
  id: string,
  required: string[],
  citationTags: string[],
  run: V19ModelDefinition['run'],
): V19ModelDefinition {
  return {
    id,
    version: 'v1',
    inputSchema: { type: 'object', required },
    citationTags,
    run,
  };
}

function genericDefinition(id: string, citationTags: string[]): V19ModelDefinition | null {
  if (!GENERIC_MODELS.has(id) && !getRegisteredModel(id)) return null;
  return defineModel(id, [], citationTags, input => ({
    outputs: {
      status: 'framework_ready',
      input_keys: Object.keys(input).sort(),
      note: 'Deterministic runner registered. Specific calculations will be added in the Tier-0 model pass.',
    },
  }));
}

function requireInputs(values: Record<string, unknown>): string[] {
  return Object.entries(values)
    .filter(([, value]) => value === null || value === undefined || Number.isNaN(value))
    .map(([key]) => key);
}

function cents(value: unknown): number | null {
  const parsed = number(value);
  return parsed == null ? null : Math.round(parsed);
}

function number(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function arrayOfCents(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.map(cents).filter((item): item is number => item !== null);
}

function sumCents(value: unknown): number | null {
  if (Array.isArray(value)) {
    const parsed = arrayOfCents(value);
    return parsed.length ? parsed.reduce((acc, item) => acc + item, 0) : null;
  }
  if (value && typeof value === 'object') {
    const parsed = Object.values(value).map(cents).filter((item): item is number => item !== null);
    return parsed.length ? parsed.reduce((acc, item) => acc + item, 0) : null;
  }
  return cents(value);
}

function sanitizeInputs(input: Record<string, any>): Record<string, any> {
  return JSON.parse(JSON.stringify(input ?? {}));
}

function round(value: number, places: number): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function hash(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}
