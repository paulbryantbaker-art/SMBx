export type ModelFreshnessStatus = 'current' | 'needs_rerun' | 'superseded' | 'unknown';

export interface ModelDependencyInput {
  key: string;
  label: string;
  aliases?: string[];
  material?: boolean;
}

export interface ModelDependencyRule {
  modelType: string;
  label: string;
  primaryModelSlot?: string;
  criticalInputs: ModelDependencyInput[];
  sensitiveInputs: ModelDependencyInput[];
  rerunTriggers: string[];
  nextSuggestedCalls: string[];
}

export interface ModelInputChange {
  key: string;
  label: string;
  material: boolean;
  priorValue: unknown;
  currentValue: unknown;
}

export interface ModelFreshnessEnvelope {
  schema: 'ModelFreshness.v0.1';
  status: ModelFreshnessStatus;
  statusLabel: string;
  modelType: string;
  modelLabel: string;
  primaryModelSlot?: string;
  watchedInputs: Array<{ key: string; label: string; material: boolean }>;
  criticalInputChanges: ModelInputChange[];
  sensitiveInputChanges: ModelInputChange[];
  rerunTriggers: string[];
  rerunPrompt: string;
  next_suggested_calls: string[];
  comparedVersion: {
    currentVersionNumber?: number | null;
    savedVersionNumber?: number | null;
  };
}

const MONEY_ALIASES = ['enterpriseValue', 'ev', 'purchasePrice', 'askingPrice', 'salePrice'];

const MODEL_RULES: Record<string, ModelDependencyRule> = {
  valuation: {
    modelType: 'valuation',
    label: 'Valuation',
    criticalInputs: [
      input('sde', 'SDE', ['sellerDiscretionaryEarnings']),
      input('ebitda', 'EBITDA'),
      input('enterpriseValue', 'EV', MONEY_ALIASES),
      input('league', 'League'),
      input('multipleOverride', 'Multiple range'),
    ],
    sensitiveInputs: [
      input('revenue', 'Revenue'),
      input('ownerComp', 'Owner comp'),
      input('dcfValue', 'DCF value'),
      input('assetValue', 'Asset value'),
      input('multipleWeight', 'Multiple weight', [], false),
      input('dcfWeight', 'DCF weight', [], false),
      input('assetWeight', 'Asset weight', [], false),
    ],
    rerunTriggers: ['EV or purchase price changes', 'SDE/EBITDA changes', 'league or multiple range changes'],
    nextSuggestedCalls: ['compose_model_stack', 'execute_model', 'create_model_tab:lbo', 'create_model_tab:dcf'],
  },
  sde_analysis: {
    modelType: 'sde_analysis',
    label: 'SDE analysis',
    criticalInputs: [
      input('netIncome', 'Net income'),
      input('ownerSalary', 'Owner salary'),
      input('addBacks', 'Add-backs'),
      input('league', 'League'),
    ],
    sensitiveInputs: [input('multipleOverride', 'Multiple range'), input('revenue', 'Revenue')],
    rerunTriggers: ['financial statements change', 'owner comp or add-backs change', 'league changes'],
    nextSuggestedCalls: ['create_model_tab:valuation', 'create_model_tab:lbo'],
  },
  lbo: {
    modelType: 'lbo',
    label: 'LBO',
    criticalInputs: [
      input('purchasePrice', 'EV / purchase price', MONEY_ALIASES),
      input('ebitda', 'EBITDA'),
      input('seniorDebtPct', 'Senior debt %'),
      input('seniorRate', 'Senior rate'),
      input('exitMultiple', 'Exit multiple'),
      input('holdPeriod', 'Hold period'),
    ],
    sensitiveInputs: [
      input('revenue', 'Revenue'),
      input('revenueGrowthRate', 'Revenue growth'),
      input('ebitdaMargin', 'EBITDA margin'),
      input('mezDebtPct', 'Mezz debt %'),
      input('mezRate', 'Mezz rate'),
      input('workingCapital', 'Working capital'),
    ],
    rerunTriggers: ['EV or purchase price changes', 'EBITDA changes', 'debt terms change', 'exit multiple or hold period changes'],
    nextSuggestedCalls: ['list_model_executions', 'run_model_iteration', 'optimize_scenario', 'create_model_tab:sensitivity', 'compose_deal_plan'],
  },
  dcf: {
    modelType: 'dcf',
    label: 'DCF',
    criticalInputs: [
      input('baseFCF', 'Base FCF'),
      input('growthRate', 'Growth rate'),
      input('discountRate', 'Discount rate'),
      input('terminalGrowthRate', 'Terminal growth'),
      input('projectionYears', 'Projection years'),
    ],
    sensitiveInputs: [input('enterpriseValue', 'EV', MONEY_ALIASES), input('ebitda', 'EBITDA')],
    rerunTriggers: ['base FCF changes', 'growth or discount assumptions change', 'terminal-growth assumption changes'],
    nextSuggestedCalls: ['list_model_executions', 'create_model_tab:valuation', 'create_model_tab:sensitivity'],
  },
  sba_financing: {
    modelType: 'sba_financing',
    label: 'SBA financing',
    primaryModelSlot: 'M119',
    criticalInputs: [
      input('purchasePrice', 'EV / purchase price', MONEY_ALIASES),
      input('earnings', 'Earnings'),
      input('downPaymentPct', 'Down payment %'),
      input('interestRate', 'Interest rate'),
      input('termMonths', 'Term'),
    ],
    sensitiveInputs: [input('sellerNotePct', 'Seller note %'), input('workingCapital', 'Working capital')],
    rerunTriggers: ['EV or purchase price changes', 'earnings changes', 'rate or term changes', 'seller note / working capital changes'],
    nextSuggestedCalls: ['execute_model', 'create_model_tab:lbo', 'compose_model_stack'],
  },
  tax_impact: {
    modelType: 'tax_impact',
    label: 'Tax impact',
    primaryModelSlot: 'M200',
    criticalInputs: [
      input('salePrice', 'Sale price', MONEY_ALIASES),
      input('sellerBasis', 'Seller basis'),
      input('assetAllocations', 'Asset allocation'),
      input('stateTaxRate', 'State tax rate'),
    ],
    sensitiveInputs: [
      input('downPayment', 'Down payment'),
      input('annualPayments', 'Annual payments'),
      input('installmentYears', 'Installment years'),
    ],
    rerunTriggers: ['price changes', 'basis or allocation changes', 'installment terms change', 'state tax rate changes'],
    nextSuggestedCalls: ['execute_model', 'defer_to_counsel', 'compose_deal_plan'],
  },
  working_capital: {
    modelType: 'working_capital',
    label: 'Working capital peg',
    primaryModelSlot: 'M109',
    criticalInputs: [input('monthlyData', 'Monthly current asset/liability data')],
    sensitiveInputs: [input('targetWorkingCapital', 'Target working capital'), input('purchasePrice', 'EV / purchase price', MONEY_ALIASES)],
    rerunTriggers: ['monthly balance sheet data changes', 'peg methodology changes', 'closing estimate changes'],
    nextSuggestedCalls: ['execute_model', 'create_model_tab:tax_impact', 'prepare_negotiation_brief'],
  },
  covenant: {
    modelType: 'covenant',
    label: 'Covenant compliance',
    primaryModelSlot: 'M184',
    criticalInputs: [
      input('ebitda', 'EBITDA'),
      input('annualDebtService', 'Annual debt service'),
      input('totalDebt', 'Total debt'),
      input('assetValue', 'Asset value'),
    ],
    sensitiveInputs: [
      input('minDscr', 'Min DSCR'),
      input('maxDebtToEbitda', 'Max Debt/EBITDA'),
      input('maxLtv', 'Max LTV'),
    ],
    rerunTriggers: ['EBITDA changes', 'debt service changes', 'debt or asset value changes', 'covenant thresholds change'],
    nextSuggestedCalls: ['execute_model', 'compose_close_readiness', 'compose_model_stack'],
  },
  cap_table: {
    modelType: 'cap_table',
    label: 'Cap table',
    primaryModelSlot: 'M146',
    criticalInputs: [input('foundersShares', 'Founder shares'), input('rounds', 'Financing rounds'), input('exitValues', 'Exit values')],
    sensitiveInputs: [input('optionPool', 'Option pool'), input('rolloverPct', 'Rollover %')],
    rerunTriggers: ['round terms change', 'exit value changes', 'option pool or rollover changes'],
    nextSuggestedCalls: ['execute_model', 'create_model_tab:valuation'],
  },
  earnout: {
    modelType: 'earnout',
    label: 'Earnout',
    primaryModelSlot: 'M111',
    criticalInputs: [input('milestones', 'Earnout milestones'), input('discountRate', 'Discount rate')],
    sensitiveInputs: [input('salePrice', 'Sale price', MONEY_ALIASES), input('ebitda', 'EBITDA')],
    rerunTriggers: ['milestone economics change', 'probabilities change', 'discount rate changes'],
    nextSuggestedCalls: ['execute_model', 'prepare_negotiation_brief', 'compose_document_draft'],
  },
  sensitivity: {
    modelType: 'sensitivity',
    label: 'Sensitivity matrix',
    criticalInputs: [
      input('sourceTabAssumptions', 'Source model assumptions'),
      input('var1Key', 'First variable'),
      input('var1Values', 'First variable cases'),
      input('var2Key', 'Second variable'),
      input('var2Values', 'Second variable cases'),
      input('outputMetric', 'Output metric'),
    ],
    sensitiveInputs: [],
    rerunTriggers: ['source model changes', 'variable grid changes', 'output metric changes'],
    nextSuggestedCalls: ['list_model_executions', 'update_model'],
  },
  comparison: {
    modelType: 'comparison',
    label: 'Deal comparison',
    criticalInputs: [input('comparisonData', 'Comparison data'), input('linkedTabs', 'Linked models')],
    sensitiveInputs: [],
    rerunTriggers: ['compared deal or model data changes'],
    nextSuggestedCalls: ['list_model_executions', 'compose_deal_plan'],
  },
};

export function getModelDependencyRule(modelType: string | null | undefined): ModelDependencyRule {
  const key = normalizeModelType(modelType);
  return MODEL_RULES[key] || {
    modelType: key || 'unknown',
    label: key ? titleize(key) : 'Model',
    criticalInputs: [
      input('enterpriseValue', 'EV', MONEY_ALIASES),
      input('purchasePrice', 'Purchase price', MONEY_ALIASES),
      input('ebitda', 'EBITDA'),
      input('sde', 'SDE'),
    ],
    sensitiveInputs: [],
    rerunTriggers: ['core deal economics change', 'source data changes', 'deal stage changes'],
    nextSuggestedCalls: ['list_model_executions', 'compose_model_stack', 'execute_model'],
  };
}

export function buildModelFreshnessEnvelope(inputValue: {
  modelType: string | null | undefined;
  currentAssumptions?: Record<string, unknown> | null;
  savedAssumptions?: Record<string, unknown> | null;
  currentVersionNumber?: number | null;
  savedVersionNumber?: number | null;
}): ModelFreshnessEnvelope {
  const rule = getModelDependencyRule(inputValue.modelType);
  const current = normalizeRecord(inputValue.currentAssumptions);
  const saved = normalizeRecord(inputValue.savedAssumptions);
  const currentVersionNumber = numberOrNull(inputValue.currentVersionNumber);
  const savedVersionNumber = numberOrNull(inputValue.savedVersionNumber);
  const watchedInputs = [...rule.criticalInputs, ...rule.sensitiveInputs].map(item => ({
    key: item.key,
    label: item.label,
    material: item.material !== false,
  }));

  if (!Object.keys(current).length || !Object.keys(saved).length) {
    return {
      schema: 'ModelFreshness.v0.1',
      status: 'unknown',
      statusLabel: 'Needs baseline',
      modelType: rule.modelType,
      modelLabel: rule.label,
      primaryModelSlot: rule.primaryModelSlot,
      watchedInputs,
      criticalInputChanges: [],
      sensitiveInputChanges: [],
      rerunTriggers: rule.rerunTriggers,
      rerunPrompt: `Re-run ${rule.label} once the current assumptions and a saved baseline are both available.`,
      next_suggested_calls: ['list_model_executions', ...rule.nextSuggestedCalls],
      comparedVersion: { currentVersionNumber, savedVersionNumber },
    };
  }

  const criticalInputChanges = detectChanges(rule.criticalInputs, saved, current);
  const sensitiveInputChanges = detectChanges(rule.sensitiveInputs, saved, current);
  const versionSuperseded = currentVersionNumber != null && savedVersionNumber != null && currentVersionNumber > savedVersionNumber;
  const status: ModelFreshnessStatus = criticalInputChanges.length
    ? 'needs_rerun'
    : versionSuperseded || sensitiveInputChanges.length
      ? 'superseded'
      : 'current';
  const statusLabel = status === 'needs_rerun'
    ? 'Rerun needed'
    : status === 'superseded'
      ? 'Superseded'
      : 'Current';
  const changedLabels = [...criticalInputChanges, ...sensitiveInputChanges].map(change => change.label);

  return {
    schema: 'ModelFreshness.v0.1',
    status,
    statusLabel,
    modelType: rule.modelType,
    modelLabel: rule.label,
    primaryModelSlot: rule.primaryModelSlot,
    watchedInputs,
    criticalInputChanges,
    sensitiveInputChanges,
    rerunTriggers: rule.rerunTriggers,
    rerunPrompt: status === 'current'
      ? `${rule.label} is current against the compared assumption set.`
      : `Re-run ${rule.label} because ${humanJoin(changedLabels.length ? changedLabels : ['a newer version exists'])} changed.`,
    next_suggested_calls: status === 'current'
      ? ['compose_deal_plan', 'prepare_loi_packet']
      : ['execute_model', 'list_model_executions', ...rule.nextSuggestedCalls],
    comparedVersion: { currentVersionNumber, savedVersionNumber },
  };
}

export function extractAssumptionsFromModelExecution(value: Record<string, any> | null | undefined): Record<string, unknown> {
  const versionSnapshot = normalizeRecord(value?.versionSnapshot);
  if (normalizeRecord(versionSnapshot.assumptions) && Object.keys(normalizeRecord(versionSnapshot.assumptions)).length) {
    return normalizeRecord(versionSnapshot.assumptions);
  }
  const modelOutput = normalizeRecord(value?.modelOutput);
  const modelInputs = normalizeRecord(modelOutput.inputs);
  if (Object.keys(modelInputs).length) return modelInputs;
  const loggedValues = normalizeRecord(normalizeRecord(modelOutput.assumptions).values);
  if (Object.keys(loggedValues).length) return loggedValues;
  return {};
}

export function normalizeModelType(modelType: string | null | undefined): string {
  return String(modelType || '').trim().toLowerCase();
}

function input(key: string, label: string, aliases: string[] = [], material = true): ModelDependencyInput {
  return { key, label, aliases, material };
}

function detectChanges(
  inputs: ModelDependencyInput[],
  saved: Record<string, unknown>,
  current: Record<string, unknown>,
): ModelInputChange[] {
  return inputs.flatMap(item => {
    const priorValue = readAliased(saved, item);
    const currentValue = readAliased(current, item);
    const priorKnown = priorValue !== undefined && priorValue !== null && priorValue !== '';
    const currentKnown = currentValue !== undefined && currentValue !== null && currentValue !== '';
    if (!priorKnown && !currentKnown) return [];
    if (stableStringify(priorValue) === stableStringify(currentValue)) return [];
    return [{
      key: item.key,
      label: item.label,
      material: item.material !== false,
      priorValue,
      currentValue,
    }];
  });
}

function readAliased(record: Record<string, unknown>, item: ModelDependencyInput): unknown {
  const keys = [item.key, ...(item.aliases || [])];
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(record, key)) return record[key];
  }
  return undefined;
}

function normalizeRecord(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}

function numberOrNull(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value as Record<string, unknown>).sort().map(key => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function titleize(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

function humanJoin(values: string[]): string {
  const unique = [...new Set(values.filter(Boolean))];
  if (unique.length <= 1) return unique[0] || 'tracked assumptions';
  if (unique.length === 2) return `${unique[0]} and ${unique[1]}`;
  return `${unique.slice(0, -1).join(', ')}, and ${unique[unique.length - 1]}`;
}
