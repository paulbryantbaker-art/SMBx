/**
 * SIM-PMI-INTEGRATION-001 — Standard post-close PMI (PMI0 → PMI3 lifecycle).
 *
 * Underlying truth: SAMPLE_PMI_INTEGRATION.
 * Acquirer side: LMM PE sponsor 30 days post-close needing 100-day plan.
 * Target-management side: Founder-CEO retained, drives day-to-day execution.
 *
 * Substrate features:
 *  - MODEL.PMI.VALUE.CREATION.v1 — value-creation lever sequencing
 *  - PMI0 → PMI1 → PMI2 → PMI3 lifecycle progression (per gatePrompts.ts)
 *  - Target operating data classified to acquirer's mandate ONLY (line of business
 *    detail visible to both, but P&L / employee comp visible to target-mgmt only)
 */

import type { DealSimulation } from '../types.js';
import { SAMPLE_PMI_INTEGRATION } from '../data/sample-deal-facts.js';

const sim: DealSimulation = {
  id: 'SIM-PMI-INTEGRATION-001',
  description: 'PMI standard integration — $5M EBITDA B2B services, 30 days post-close, PMI0→PMI3 lifecycle. Tests M-PMI substrate symmetry on workstream charters + isolation of operating detail.',
  league: 'L4',
  journeys: ['pmi'],
  factPattern: SAMPLE_PMI_INTEGRATION,

  parties: [
    // ─── ACQUIRER (LMM PE) ───────────────────────────────
    {
      role: 'pmi_acquirer',
      agentIdentity: 'agent_pmi_acq_sim_001',
      beneficialCustomer: 'pe_sponsor_acquirer_001',
      tier: 'pro',
      payloadFromTruth: (facts) => ({
        journey: 'pmi',
        pmi_role: 'acquirer',
        industry: facts.industry,
        jurisdiction: facts.jurisdiction,
        days_post_close: facts.extra?.daysPostClose,
      }),
      callSequence: [
        {
          step: 'pmi0_intake',
          tool: 'ingest_deal_payload',
          input: { journey: 'pmi', pmi_role: 'acquirer', industry: 'B2B services', jurisdiction: 'US-TX', days_post_close: 30 },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'pmi', subJourney: 'pmi_day_0' },
            missingFields: ['integration_type', 'value_levers', 'workstreams'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_pmi0',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 500_000_000,
            integration_type: 'tuck_in',
            value_levers: ['pricing', 'cost_to_serve', 'sales_enablement'],
            workstreams: ['finance', 'sales', 'people', 'systems'],
            acquirer_thesis_synergies_cents: 80_000_000, // ACQUIRER-ONLY
          }),
          expect: { responseType: 'classification_with_work' },
        },
        {
          step: 'compose_stack',
          tool: 'compose_model_stack',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: { responseType: 'classification_with_work', captureToState: ['applicable_models'] },
        },
        {
          step: 'execute_value_creation',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.PMI.VALUE.CREATION.v1',
            inputs: {
              deal_findings: ['pricing_below_market', 'high_cost_to_serve_small_accounts', 'underinvested_sales_ops'],
              integration_risks: ['founder_departure_risk', 'system_consolidation_risk'],
              value_levers: ['pricing', 'cost_to_serve', 'sales_enablement'],
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['value_creation_hash', 'workstream_charters'] },
        },
        {
          step: 'advance_to_pmi1',
          tool: 'compose_deal_plan',
          input: (state) => ({ deal_id: state.deal_id, stage: 'pmi1' }),
          expect: { responseType: 'classification_with_work' },
        },
        {
          step: 'advance_to_pmi2',
          tool: 'compose_deal_plan',
          input: (state) => ({ deal_id: state.deal_id, stage: 'pmi2' }),
          expect: { responseType: 'classification_with_work' },
        },
        {
          step: 'advance_to_pmi3',
          tool: 'compose_deal_plan',
          input: (state) => ({ deal_id: state.deal_id, stage: 'pmi3' }),
          expect: { responseType: 'classification_with_work' },
        },
        {
          step: 'finalize_package',
          tool: 'finalize_deal_package',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: { responseType: 'classification_with_work', captureToState: ['package_id', 'merkle_root'] },
        },
      ],
    },

    // ─── TARGET MANAGEMENT (Retained founder-CEO) ────────
    {
      role: 'pmi_target_mgmt',
      agentIdentity: 'agent_pmi_tgt_sim_001',
      beneficialCustomer: 'target_ceo_001',
      tier: 'solo',
      payloadFromTruth: (facts) => ({
        journey: 'pmi',
        pmi_role: 'target_mgmt',
        industry: facts.industry,
        jurisdiction: facts.jurisdiction,
        days_post_close: facts.extra?.daysPostClose,
      }),
      callSequence: [
        {
          step: 'pmi0_intake',
          tool: 'ingest_deal_payload',
          input: { journey: 'pmi', pmi_role: 'target_mgmt', industry: 'B2B services', jurisdiction: 'US-TX', days_post_close: 30 },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'pmi', subJourney: 'pmi_day_0' },
            missingFields: ['integration_type', 'workstreams'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_pmi0',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 500_000_000,
            integration_type: 'tuck_in',
            workstreams: ['finance', 'sales', 'people', 'systems'],
            // Target-mgmt operating detail (visible only to target_mgmt mandate)
            target_employee_count: 85,
            target_payroll_cents: 280_000_000,
            target_top_5_customer_pct: 0.42,
          }),
          expect: { responseType: 'classification_with_work' },
        },
        {
          step: 'compose_stack',
          tool: 'compose_model_stack',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: { responseType: 'classification_with_work', captureToState: ['applicable_models'] },
        },
        {
          step: 'execute_value_creation',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.PMI.VALUE.CREATION.v1',
            inputs: {
              deal_findings: ['pricing_below_market', 'high_cost_to_serve_small_accounts', 'underinvested_sales_ops'],
              integration_risks: ['founder_departure_risk', 'system_consolidation_risk'],
              value_levers: ['pricing', 'cost_to_serve', 'sales_enablement'],
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['value_creation_hash', 'workstream_charters'] },
        },
        {
          step: 'advance_to_pmi1',
          tool: 'compose_deal_plan',
          input: (state) => ({ deal_id: state.deal_id, stage: 'pmi1' }),
          expect: { responseType: 'classification_with_work' },
        },
        {
          step: 'advance_to_pmi2',
          tool: 'compose_deal_plan',
          input: (state) => ({ deal_id: state.deal_id, stage: 'pmi2' }),
          expect: { responseType: 'classification_with_work' },
        },
        {
          step: 'finalize_package',
          tool: 'finalize_deal_package',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: { responseType: 'classification_with_work', captureToState: ['package_id', 'merkle_root'] },
        },
      ],
    },
  ],

  symmetry: [
    { description: 'Value-creation workstream charters identical (same canonical charter set)', field: 'value_creation_hash', mode: 'equal', parties: ['pmi_acquirer', 'pmi_target_mgmt'] },
    { description: 'Workstream charters list identical', field: 'workstream_charters', mode: 'equal', parties: ['pmi_acquirer', 'pmi_target_mgmt'] },
    { description: 'Both sides return same methodology + spec version pins', field: 'methodology_version', mode: 'equal' },
  ],

  isolation: [
    { description: "Acquirer's thesis synergies never appear in target-mgmt substrate output", sourceField: 'acquirer_thesis_synergies_cents', sourceParty: 'pmi_acquirer', targetParty: 'pmi_target_mgmt' },
    { description: "Target-mgmt's employee_count never appears in acquirer substrate output (classified to target mandate)", sourceField: 'target_employee_count', sourceParty: 'pmi_target_mgmt', targetParty: 'pmi_acquirer' },
    { description: "Target-mgmt's payroll detail never appears in acquirer substrate output", sourceField: 'target_payroll_cents', sourceParty: 'pmi_target_mgmt', targetParty: 'pmi_acquirer' },
    { description: "Target-mgmt's top-5 customer concentration never appears in acquirer substrate output", sourceField: 'target_top_5_customer_pct', sourceParty: 'pmi_target_mgmt', targetParty: 'pmi_acquirer' },
  ],

  refusals: [
    {
      description: 'Asking substrate to find a paid synergy partner is refused (LINE_VIOLATION paid_matching)',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'INTRO.SYNERGY_PARTNER.PAID.v1', inputs: { success_fee_pct: 0.03 } } },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'paid_matching',
    },
    {
      description: 'Asking substrate to negotiate retention package terms is refused',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'NEGOTIATION.RECOMMEND.v1', inputs: { retention_bonus_pct: 0.15 } } },
      expectedRefusal: 'LINE_VIOLATION',
    },
    {
      description: 'Asking for a fairness opinion routes to counsel_review_required',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'OPINION.FAIRNESS.v1' } },
      expectedRefusal: 'counsel_review_required',
    },
  ],

  completion: [
    { party: 'pmi_acquirer', endpoint: 'Reaches PMI3 + finalize_deal_package with full value-creation plan', minAuditRows: 8, requiredFinalCalls: ['finalize_deal_package'] },
    { party: 'pmi_target_mgmt', endpoint: 'Reaches PMI2 + finalize_deal_package with workstream charters', minAuditRows: 7, requiredFinalCalls: ['finalize_deal_package'] },
  ],

  partyTiers: { pmi_acquirer: 'pro', pmi_target_mgmt: 'solo' },
};

export default sim;
