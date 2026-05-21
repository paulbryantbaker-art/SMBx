import {
  DEFINITIVE_METHODOLOGY_URI,
  DEFINITIVE_METHODOLOGY_VERSION,
  DEFINITIVE_SPEC_URI,
  DEFINITIVE_SPEC_VERSION,
} from '../constants/definitive.js';

export const DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CASE_COUNT = 118;
export const DEFINITIVE_CONFORMANCE_DEAL_ROUTE_CASE_COUNT = 12;
export const DEFINITIVE_CONFORMANCE_TOTAL_CASE_COUNT =
  DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CASE_COUNT + DEFINITIVE_CONFORMANCE_DEAL_ROUTE_CASE_COUNT;

export const DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CATEGORIES = [
  'valuation',
  'normalization',
  'working_capital',
  'qoe_lite',
  'tax_structure',
  'real_estate_mechanics',
  'real_estate_gap_closure',
  'agreement_economics',
  'connected_tax',
  'tax_allocation',
  'credit_mechanics',
  'ip_mechanics',
  'dscr_stress',
  'sources_uses',
  'lbo',
  'hsr_triage',
  'legal_halt_scan',
  'earnout',
  'ppa',
  'rollover',
  'structure_analysis',
  'buyer_fit',
  'market_context',
  'sensitivity',
  'deal_comparison',
  'covenant_compliance',
  'pmi_value_creation',
  'deal_kill_probability',
  'timeline',
  'deal_scoring',
  'cap_table',
  'dcf_refusal',
  'deal_mechanics_route_map',
  'deal_mechanics_readiness',
  'pass_through_boundary',
] as const;

export function buildDefinitiveConformanceStatus() {
  return {
    suite: 'DEFINITIVE.conformance.v1',
    status: 'started',
    specVersion: DEFINITIVE_SPEC_VERSION,
    specUri: DEFINITIVE_SPEC_URI,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
    methodologyUri: DEFINITIVE_METHODOLOGY_URI,
    cases: {
      modelRuntime: DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CASE_COUNT,
      dealMechanicsRoute: DEFINITIVE_CONFORMANCE_DEAL_ROUTE_CASE_COUNT,
      total: DEFINITIVE_CONFORMANCE_TOTAL_CASE_COUNT,
    },
    categories: DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CATEGORIES,
    assertions: [
      'version pins',
      'methodology pins',
      'output hash shape',
      'deterministic outputs',
      'nested deterministic outputs',
      'missing-input behavior',
      'refusal states',
    ],
    command: 'npm run test:definitive-conformance',
    nextTarget: 150,
  };
}
