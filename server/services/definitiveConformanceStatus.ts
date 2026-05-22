import {
  DEFINITIVE_METHODOLOGY_URI,
  DEFINITIVE_METHODOLOGY_VERSION,
  DEFINITIVE_SPEC_URI,
  DEFINITIVE_SPEC_VERSION,
} from '../constants/definitive.js';

export const DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CASE_COUNT = 202;
export const DEFINITIVE_CONFORMANCE_DEAL_ROUTE_CASE_COUNT = 60;
export const DEFINITIVE_CONFORMANCE_PROMPT_META_CASE_COUNT = 39;
export const DEFINITIVE_CONFORMANCE_ROUTE_TRIGGER_CASE_COUNT = 30;
export const DEFINITIVE_CONFORMANCE_MODEL_STACK_CASE_COUNT = 29;
export const DEFINITIVE_CONFORMANCE_TOTAL_CASE_COUNT =
  DEFINITIVE_CONFORMANCE_MODEL_RUNTIME_CASE_COUNT +
  DEFINITIVE_CONFORMANCE_DEAL_ROUTE_CASE_COUNT +
  DEFINITIVE_CONFORMANCE_PROMPT_META_CASE_COUNT +
  DEFINITIVE_CONFORMANCE_ROUTE_TRIGGER_CASE_COUNT +
  DEFINITIVE_CONFORMANCE_MODEL_STACK_CASE_COUNT;

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
  'authority_seed_plan',
  'pass_through_boundary',
  'prompt_meta_behavior',
  'route_trigger_behavior',
  'model_stack_behavior',
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
      promptMeta: DEFINITIVE_CONFORMANCE_PROMPT_META_CASE_COUNT,
      routeTrigger: DEFINITIVE_CONFORMANCE_ROUTE_TRIGGER_CASE_COUNT,
      modelStack: DEFINITIVE_CONFORMANCE_MODEL_STACK_CASE_COUNT,
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
      'Yulia prompt/meta boundaries',
      'surface guidance consistency',
      'Authority Register seed-plan coverage',
      'G28/G29/G30 trigger thresholds',
      'compose_model_stack payload behavior',
    ],
    command: 'npm run test:definitive-conformance',
    authenticatedRouteSmoke: {
      status: 'expanded',
      command: 'npm run test:definitive-auth-route',
      fixture: 'DB fixture + JWT bearer token + live API server',
      assertions: [
        'protected endpoints reject missing JWT',
        'tool inventory is available with JWT',
        'THE LINE inventory is available with JWT',
        'corpus observation types publish structured-only rules',
        'corpus rights can be read and granted with JWT',
        'corpus observations strip identifiers and raw text before storage',
        'unsupported spec versions refuse before execution',
        'THE LINE returns human-approval refusal envelopes with JWT',
        'THE LINE returns counsel-review refusal envelopes with JWT',
        'THE LINE returns enterprise-scope refusal envelopes with JWT',
        'compose_model_stack returns mandate chain and G28/G29/G30 route map',
        'audit packet retrieval returns pinned reproducibility payloads',
        'Studio export audit packet routes return pinned export payloads',
        'staged agency action routes expose and cancel confirmation holds',
      ],
    },
    entitlementSmoke: {
      status: 'started',
      command: 'npm run test:definitive-entitlements',
      fixture: 'DB fixtures with TEST_MODE / DEV_NO_PAYWALL disabled inside the test process',
      assertions: [
        'Pro plan resolves without local dev entitlement bypass',
        'Pro API access is allowed before allowance exhaustion',
        'Pro API access returns credit_budget_required after allowance exhaustion',
        'Free API access returns enterprise_scope_required for MCP/API scope',
      ],
    },
    nextTarget: 750,
  };
}
