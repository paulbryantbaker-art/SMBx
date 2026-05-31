/**
 * SIM-RAISE-DEBT-ABL-001 — $30M ABL facility (borrower + lender sides).
 *
 * Underlying truth: SAMPLE_RAISE_DEBT_ABL.
 * Borrower side: Wholesale distributor with $80M revenue, $10M revolver out at close.
 * Lender side: ABL underwriter sizing the commitment against eligible collateral.
 *
 * Substrate features:
 *  - MODEL.FINANCE.ABL.BORROWING_BASE.v1 — advance-rate math for AR + inventory
 *  - MODEL.FINANCE.COVENANT_BASKETS.v1 — springing covenant + debt baskets
 *  - MODEL.COVENANT.COMPLIANCE.v1 — FCCR/fixed-charge cushion modeling
 *  - Symmetry: borrowing-base availability math identical on both sides
 *  - Isolation: borrower's stretch-availability plan + lender's loss-given-default
 *    assumptions never cross
 */

import type { DealSimulation } from '../types.js';
import { SAMPLE_RAISE_DEBT_ABL } from '../data/sample-deal-facts.js';

const sim: DealSimulation = {
  id: 'SIM-RAISE-DEBT-ABL-001',
  description: 'RAISE debt ABL — $30M committed against eligible AR (85%) + inventory (50%), $10M outstanding at close, distributor borrower. Tests borrowing-base substrate symmetry + covenant compliance isolation.',
  league: 'L4',
  journeys: ['raise'],
  factPattern: SAMPLE_RAISE_DEBT_ABL,

  parties: [
    // ─── BORROWER SIDE ───────────────────────────────────
    {
      role: 'borrower',
      agentIdentity: 'agent_borrower_sim_abl_001',
      beneficialCustomer: 'distributor_borrower_001',
      tier: 'pro',
      payloadFromTruth: (facts) => ({
        journey: 'raise',
        raise_role: 'borrower',
        industry: facts.industry,
        jurisdiction: facts.jurisdiction,
        instrument: 'abl',
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: { journey: 'raise', raise_role: 'borrower', industry: 'wholesale distribution', jurisdiction: 'US-IL', instrument: 'abl' },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'raise', subJourney: 'debt_raise' },
            missingFields: ['facility_size', 'collateral_pool', 'advance_rates'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_abl',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            facility_commitment_cents: 3000_000_000,
            target_revenue_cents: 8000_000_000,
            eligible_ar_cents: 2400_000_000,
            eligible_inventory_cents: 2000_000_000,
            advance_rate_ar: 0.85,
            advance_rate_inventory: 0.50,
            outstanding_at_close_cents: 1000_000_000,
            instrument: 'abl',
            borrower_target_dpo_days: 65, // BORROWER-ONLY: liquidity strategy
            borrower_stretch_availability_intent_cents: 2200_000_000, // BORROWER-ONLY
          }),
          expect: { responseType: 'classification_with_work', classification: { league: 'L4' } },
        },
        {
          step: 'compose_stack',
          tool: 'compose_model_stack',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: { responseType: 'classification_with_work', captureToState: ['applicable_models'] },
        },
        {
          step: 'execute_borrowing_base',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.FINANCE.ABL.BORROWING_BASE.v1',
            inputs: {
              eligible_ar_cents: 2400_000_000,
              eligible_inventory_cents: 2000_000_000,
              advance_rate_ar: 0.85,
              advance_rate_inventory: 0.50,
              reserves_cents: 200_000_000,
              commitment_cents: 3000_000_000,
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['borrowing_base_hash', 'availability_cents'] },
        },
        {
          step: 'execute_covenant_compliance',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.COVENANT.COMPLIANCE.v1',
            inputs: {
              springing_fccr_threshold: 1.10,
              base_availability_threshold_pct: 0.125,
              ebitda_cents: 1200_000_000,
              fixed_charges_cents: 950_000_000,
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['covenant_compliance_hash'] },
        },
        {
          step: 'finalize_package',
          tool: 'finalize_deal_package',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: { responseType: 'classification_with_work', captureToState: ['package_id', 'merkle_root'] },
        },
      ],
    },

    // ─── LENDER SIDE ─────────────────────────────────────
    {
      role: 'lender',
      agentIdentity: 'agent_lender_sim_abl_001',
      beneficialCustomer: 'abl_lender_001',
      tier: 'enterprise',
      payloadFromTruth: (facts) => ({
        journey: 'raise',
        raise_role: 'lender',
        industry: facts.industry,
        jurisdiction: facts.jurisdiction,
        instrument: 'abl',
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: { journey: 'raise', raise_role: 'lender', industry: 'wholesale distribution', jurisdiction: 'US-IL', instrument: 'abl' },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'raise', subJourney: 'debt_raise' },
            missingFields: ['facility_size', 'collateral_pool'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_abl',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            facility_commitment_cents: 3000_000_000,
            target_revenue_cents: 8000_000_000,
            eligible_ar_cents: 2400_000_000,
            eligible_inventory_cents: 2000_000_000,
            advance_rate_ar: 0.85,
            advance_rate_inventory: 0.50,
            outstanding_at_close_cents: 1000_000_000,
            instrument: 'abl',
            lender_lgd_assumption_pct: 0.25, // LENDER-ONLY
            lender_pd_assumption_pct: 0.04,  // LENDER-ONLY
          }),
          expect: { responseType: 'classification_with_work', classification: { league: 'L4' } },
        },
        {
          step: 'compose_stack',
          tool: 'compose_model_stack',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: { responseType: 'classification_with_work', captureToState: ['applicable_models'] },
        },
        {
          step: 'execute_borrowing_base',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.FINANCE.ABL.BORROWING_BASE.v1',
            inputs: {
              eligible_ar_cents: 2400_000_000,
              eligible_inventory_cents: 2000_000_000,
              advance_rate_ar: 0.85,
              advance_rate_inventory: 0.50,
              reserves_cents: 200_000_000,
              commitment_cents: 3000_000_000,
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['borrowing_base_hash', 'availability_cents'] },
        },
        {
          step: 'execute_covenant_compliance',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.COVENANT.COMPLIANCE.v1',
            inputs: {
              springing_fccr_threshold: 1.10,
              base_availability_threshold_pct: 0.125,
              ebitda_cents: 1200_000_000,
              fixed_charges_cents: 950_000_000,
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['covenant_compliance_hash'] },
        },
        {
          step: 'execute_dscr_stress',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.DSCR.STRESS.v1',
            inputs: { ebitda_cents: 1200_000_000, debt_service_cents: 950_000_000, stress_scenarios: [0.0, -0.10, -0.20, -0.30] },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['dscr_stress_hash'] },
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
    { description: 'Borrowing-base availability identical on both sides', field: 'borrowing_base_hash', mode: 'equal', parties: ['borrower', 'lender'] },
    { description: 'Calculated availability dollar amount matches', field: 'availability_cents', mode: 'equal', parties: ['borrower', 'lender'] },
    { description: 'Covenant compliance evaluation matches', field: 'covenant_compliance_hash', mode: 'equal', parties: ['borrower', 'lender'] },
    { description: 'Both sides return same methodology + spec version pins', field: 'methodology_version', mode: 'equal' },
  ],

  isolation: [
    { description: "Borrower's stretch-availability intent never appears in lender substrate output", sourceField: 'borrower_stretch_availability_intent_cents', sourceParty: 'borrower', targetParty: 'lender' },
    { description: "Borrower's DPO target never appears in lender substrate output", sourceField: 'borrower_target_dpo_days', sourceParty: 'borrower', targetParty: 'lender' },
    { description: "Lender's LGD assumption never appears in borrower substrate output", sourceField: 'lender_lgd_assumption_pct', sourceParty: 'lender', targetParty: 'borrower' },
    { description: "Lender's DSCR stress scenario hash never appears in borrower substrate output", sourceField: 'dscr_stress_hash', sourceParty: 'lender', targetParty: 'borrower' },
  ],

  refusals: [
    {
      description: 'Asking substrate to negotiate pricing or advance rates is refused',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'NEGOTIATION.RECOMMEND.v1', inputs: { advance_rate_ar: 0.90 } } },
      expectedRefusal: 'LINE_VIOLATION',
    },
    {
      description: 'Asking for a fairness opinion routes to counsel_review_required',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'OPINION.FAIRNESS.v1' } },
      expectedRefusal: 'counsel_review_required',
    },
    {
      description: 'Asking substrate to commit the facility on the lender\'s behalf is refused',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'COMMIT.FACILITY.v1' } },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'counterparty_contact',
    },
  ],

  completion: [
    { party: 'borrower', endpoint: 'Reaches finalize_deal_package with borrowing-base + covenant compliance', minAuditRows: 6, requiredFinalCalls: ['finalize_deal_package'] },
    { party: 'lender', endpoint: 'Reaches finalize_deal_package with borrowing-base + covenant + DSCR stress', minAuditRows: 7, requiredFinalCalls: ['finalize_deal_package'] },
  ],

  partyTiers: { borrower: 'pro', lender: 'enterprise' },
};

export default sim;
