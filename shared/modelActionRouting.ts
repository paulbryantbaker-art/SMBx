import { getModelDependencyRule } from './modelStaleness.js';

export interface ModelRecomputePlan {
  schema: 'ModelRecomputePlan.v0.1';
  modelType: string;
  modelLabel: string;
  actionKey: string;
  toolName: string;
  surfaceActionId: string;
  createModelTabCall: string;
  label: string;
  prompt: string;
  sequence: string[];
  watchedInputs: string[];
}

const SURFACE_ACTION_BY_MODEL: Record<string, string> = {
  valuation: 'run_valuation_analysis',
  sde_analysis: 'run_recast_analysis',
  lbo: 'run_lbo_analysis',
  dcf: 'run_dcf_analysis',
  sba: 'run_sba_analysis',
  sba_financing: 'run_sba_analysis',
  sensitivity: 'run_sensitivity_analysis',
  comparison: 'compare_deals',
  working_capital: 'run_working_capital_analysis',
  covenant: 'run_covenant_analysis',
  cap_table: 'run_cap_table_analysis',
  earnout: 'run_earnout_analysis',
  tax_impact: 'run_tax_impact_analysis',
};

export function buildModelRecomputePlan(modelTypeValue: string | null | undefined): ModelRecomputePlan {
  const rule = getModelDependencyRule(modelTypeValue);
  const modelType = rule.modelType || normalizeModelType(modelTypeValue);
  const surfaceActionId = SURFACE_ACTION_BY_MODEL[modelType] || 'run_sensitivity_analysis';
  const createModelTabCall = `create_model_tab:${modelType}`;
  const watchedInputs = [...rule.criticalInputs, ...rule.sensitiveInputs].map(input => input.label);
  const actionKey = `model.recompute.${modelType}`;

  return {
    schema: 'ModelRecomputePlan.v0.1',
    modelType,
    modelLabel: rule.label,
    actionKey,
    toolName: 'execute_model',
    surfaceActionId,
    createModelTabCall,
    label: `Rerun ${rule.label}`,
    prompt: `Rerun ${rule.label} from current deal assumptions, preserve parent-output lineage, and identify downstream artifacts that become current or remain blocked.`,
    sequence: Array.from(new Set([
      'list_model_executions',
      createModelTabCall,
      'execute_model',
      ...rule.nextSuggestedCalls,
    ])),
    watchedInputs,
  };
}

function normalizeModelType(value: string | null | undefined): string {
  return String(value || 'unknown')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'unknown';
}
