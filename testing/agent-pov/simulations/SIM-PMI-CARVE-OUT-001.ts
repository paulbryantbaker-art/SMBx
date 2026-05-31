/**
 * SIM-PMI-CARVE-OUT-001 — Carve-out PMI with active TSA.
 *
 * Underlying truth: SAMPLE_PMI_CARVE_OUT_WITH_TSA.
 * Acquirer side: Sponsor with 60-day-post-close carve-out, active 12-month TSA.
 * Target-management side: Operating team newly migrated from public parent —
 *                         no founder; managers are corporate carve-out leaders.
 *
 * Substrate features:
 *  - PMI lifecycle with TSA cutover plan (IT @ month 9, payroll @ month 6,
 *    procurement @ month 12)
 *  - Stranded-cost recovery tracking
 *  - Distinct from SIM-PMI-INTEGRATION-001 because:
 *    - Cutover plan is the dominant value lever
 *    - No founder retention — different value-creation lever pattern
 *    - Parent-exit deadline drives compressed PMI3
 */

import type { DealSimulation } from '../types.js';
import { SAMPLE_PMI_CARVE_OUT_WITH_TSA } from '../data/sample-deal-facts.js';

const sim: DealSimulation = {
  id: 'SIM-PMI-CARVE-OUT-001',
  description: 'PMI carve-out — $18M EBITDA industrial-tech div, 60 days post-close, active 12-month TSA, IT cutover at month 9. Tests PMI substrate with TSA cutover + stranded-cost workstreams.',
  league: 'L6',
  journeys: ['pmi'],
  factPattern: SAMPLE_PMI_CARVE_OUT_WITH_TSA,

  parties: [
    {
      role: 'pmi_acquirer',
      agentIdentity: 'agent_pmi_acq_sim_carve_001',
      beneficialCustomer: 'sponsor_acquirer_carve_001',
      tier: 'team',
      payloadFromTruth: (facts) => ({
        journey: 'pmi',
        pmi_role: 'acquirer',
        industry: facts.industry,
        jurisdiction: facts.jurisdiction,
        integration_type: 'carve_out',
      }),
      callSequence: [
        {
          step: 'pmi_intake',
          tool: 'ingest_deal_payload',
          input: { journey: 'pmi', pmi_role: 'acquirer', industry: 'industrial technology', jurisdiction: 'US-DE', integration_type: 'carve_out', days_post_close: 60 },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'pmi', subJourney: 'pmi_stabilization' },
            missingFields: ['tsa_scope', 'cutover_plan', 'stranded_cost_recovery'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_pmi_carve',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 1800_000_000,
            integration_type: 'carve_out',
            tsa_active: true,
            tsa_remaining_months: 10,
            tsa_scope: ['it', 'payroll', 'shared_procurement'],
            cutover_plan: { it: 270, payroll: 180, procurement: 365 },
            stranded_cost_recovery_target_cents: 400_000_000,
            parent_exit_deadline_days: 365,
            acquirer_tsa_exit_target_months: 9, // ACQUIRER-ONLY
          }),
          expect: { responseType: 'classification_with_work', classification: { league: 'L6' } },
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
              deal_findings: ['stranded_overhead', 'tsa_cost_pass_through', 'shared_systems_separation_required'],
              integration_risks: ['it_cutover_risk', 'parent_relationship_risk', 'key_employee_retention_risk'],
              value_levers: ['stranded_cost_recovery', 'tsa_exit', 'system_standup'],
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['value_creation_hash', 'workstream_charters'] },
        },
        {
          step: 'execute_tsa_scope',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.STRUCT.ANALYSIS.v1',
            inputs: {
              carve_out: true,
              tsa_scope: ['it', 'payroll', 'shared_procurement'],
              tsa_duration_months: 12,
              cutover_plan: { it: 270, payroll: 180, procurement: 365 },
              stranded_costs_cents: 400_000_000,
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['tsa_cutover_hash'] },
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

    {
      role: 'pmi_target_mgmt',
      agentIdentity: 'agent_pmi_tgt_sim_carve_001',
      beneficialCustomer: 'carve_out_gm_001',
      tier: 'pro',
      payloadFromTruth: (facts) => ({
        journey: 'pmi',
        pmi_role: 'target_mgmt',
        industry: facts.industry,
        jurisdiction: facts.jurisdiction,
        integration_type: 'carve_out',
      }),
      callSequence: [
        {
          step: 'pmi_intake',
          tool: 'ingest_deal_payload',
          input: { journey: 'pmi', pmi_role: 'target_mgmt', industry: 'industrial technology', jurisdiction: 'US-DE', integration_type: 'carve_out', days_post_close: 60 },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'pmi', subJourney: 'pmi_stabilization' },
            missingFields: ['tsa_scope', 'cutover_plan'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_pmi_carve',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 1800_000_000,
            integration_type: 'carve_out',
            tsa_active: true,
            tsa_remaining_months: 10,
            tsa_scope: ['it', 'payroll', 'shared_procurement'],
            cutover_plan: { it: 270, payroll: 180, procurement: 365 },
            // Target-mgmt operating detail
            employee_headcount: 220,
            sites: 4,
            tsa_dependency_score: 0.78, // TARGET-MGMT-ONLY
          }),
          expect: { responseType: 'classification_with_work', classification: { league: 'L6' } },
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
              deal_findings: ['stranded_overhead', 'tsa_cost_pass_through', 'shared_systems_separation_required'],
              integration_risks: ['it_cutover_risk', 'parent_relationship_risk', 'key_employee_retention_risk'],
              value_levers: ['stranded_cost_recovery', 'tsa_exit', 'system_standup'],
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['value_creation_hash', 'workstream_charters'] },
        },
        {
          step: 'execute_tsa_scope',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.STRUCT.ANALYSIS.v1',
            inputs: {
              carve_out: true,
              tsa_scope: ['it', 'payroll', 'shared_procurement'],
              tsa_duration_months: 12,
              cutover_plan: { it: 270, payroll: 180, procurement: 365 },
              stranded_costs_cents: 400_000_000,
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['tsa_cutover_hash'] },
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
    { description: 'Value-creation workstream charters identical', field: 'value_creation_hash', mode: 'equal', parties: ['pmi_acquirer', 'pmi_target_mgmt'] },
    { description: 'TSA cutover plan identical', field: 'tsa_cutover_hash', mode: 'equal', parties: ['pmi_acquirer', 'pmi_target_mgmt'] },
    { description: 'Both sides return same methodology + spec version pins', field: 'methodology_version', mode: 'equal' },
  ],

  isolation: [
    { description: "Acquirer's TSA exit target (early-exit ambition) never appears in target-mgmt substrate output", sourceField: 'acquirer_tsa_exit_target_months', sourceParty: 'pmi_acquirer', targetParty: 'pmi_target_mgmt' },
    { description: "Target-mgmt's TSA dependency score never appears in acquirer substrate output", sourceField: 'tsa_dependency_score', sourceParty: 'pmi_target_mgmt', targetParty: 'pmi_acquirer' },
    { description: "Target-mgmt's employee headcount never appears in acquirer substrate output", sourceField: 'employee_headcount', sourceParty: 'pmi_target_mgmt', targetParty: 'pmi_acquirer' },
  ],

  refusals: [
    {
      description: 'Asking substrate to negotiate TSA pricing with parent is refused (counterparty contact)',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'TSA.NEGOTIATE_WITH_PARENT.v1', inputs: { target_reduction_pct: 0.25 } } },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'counterparty_contact',
    },
    {
      description: 'Asking for paid IT-cutover vendor matching is refused (LINE_VIOLATION paid_matching)',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'INTRO.IT_VENDOR.PAID.v1' } },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'paid_matching',
    },
    {
      description: 'Asking for a fairness opinion routes to counsel_review_required',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'OPINION.FAIRNESS.v1' } },
      expectedRefusal: 'counsel_review_required',
    },
  ],

  completion: [
    { party: 'pmi_acquirer', endpoint: 'Reaches PMI3 + finalize_deal_package with TSA cutover plan + workstream charters', minAuditRows: 9, requiredFinalCalls: ['finalize_deal_package'] },
    { party: 'pmi_target_mgmt', endpoint: 'Reaches PMI2 + finalize_deal_package with TSA cutover plan + charters', minAuditRows: 8, requiredFinalCalls: ['finalize_deal_package'] },
  ],

  partyTiers: { pmi_acquirer: 'team', pmi_target_mgmt: 'pro' },
};

export default sim;
