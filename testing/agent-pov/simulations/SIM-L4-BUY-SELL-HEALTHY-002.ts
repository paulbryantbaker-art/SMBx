/**
 * SIM-L4-BUY-SELL-HEALTHY-002 — L4 healthy with earnout structure.
 *
 * Underlying truth: SAMPLE_L4_HEALTHY_EARNOUT_B2B_SERVICES.
 * Buy side: LMM PE sponsor with $13M equity + $9M senior + $3M earnout potential.
 * Sell side: principal LLC seller accepting deferred consideration on revenue-tied earnout.
 *
 * Adds MODEL.STRUCT.EARNOUT.MC.v1 (probabilistic pricing) and
 * MODEL.LEGAL.EARNOUT_ARCHITECTURE.v1 (structural review) on top of the
 * HEALTHY-001 stack.
 */

import type { DealSimulation } from '../types.js';
import { SAMPLE_L4_HEALTHY_EARNOUT_B2B_SERVICES } from '../data/sample-deal-facts.js';

const sim: DealSimulation = {
  id: 'SIM-L4-BUY-SELL-HEALTHY-002',
  description:
    'L4 healthy BUY-SELL with earnout — $5M SDE B2B services in TX, $22M cash + $3M earnout over 3 years tied to revenue, LLC pass-through seller, LMM PE buyer.',
  league: 'L4',
  journeys: ['buy', 'sell'],
  factPattern: SAMPLE_L4_HEALTHY_EARNOUT_B2B_SERVICES,

  parties: [
    // ─── BUY SIDE ────────────────────────────────────────
    {
      role: 'buyer',
      agentIdentity: 'agent_buy_sim_l4_002',
      beneficialCustomer: 'pe_sponsor_acme_sim_l4_002',
      tier: 'pro',
      payloadFromTruth: (facts) => ({
        journey: 'buy',
        target_industry: facts.industry,
        target_jurisdiction: facts.jurisdiction,
        deferred_consideration_intent: ['earnout'],
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: {
            journey: 'buy',
            target_industry: 'B2B services',
            target_jurisdiction: 'US-TX',
            deferred_consideration_intent: ['earnout'],
          },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'buy', subJourney: 'healthy_buy_side' },
            missingFields: ['target_revenue', 'target_ebitda', 'purchase_price_range', 'earnout_terms'],
            nextCallsInclude: ['update_deal_payload'],
            captureToState: ['deal_id', 'state_cid'],
          },
        },
        {
          step: 'enrich_with_financials_and_earnout',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_sde_cents: 500_000_000,
            target_revenue_cents: 1800_000_00,
            target_ebitda_cents: 500_000_000,
            naics: '541512',
            purchase_price_range_cents: { low: 2200_000_000, high: 2800_000_000 },
            cash_at_close_cents: 2200_000_000,
            earnout_max_cents: 300_000_000,
            earnout_metric: 'revenue',
            earnout_years: 3,
            earnout_targets_cents: [2000_000_00, 2200_000_00, 2400_000_00],
          }),
          expect: {
            responseType: 'classification_with_work',
            classification: { league: 'L4' },
            nextCallsInclude: ['compose_model_stack'],
            captureToState: ['parent_cid', 'state_cid'],
          },
        },
        {
          step: 'compose_stack',
          tool: 'compose_model_stack',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: {
            responseType: 'classification_with_work',
            nextCallsInclude: ['execute_model'],
            captureToState: ['applicable_models'],
          },
        },
        {
          step: 'execute_ebitda_valuation',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.VAL.EBITDA.v1',
            inputs: {
              ebitda_cents: 500_000_000,
              comparables_multiple_range: { low: 4.0, high: 5.6 },
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['valuation_output_hash', 'valuation_range'],
          },
        },
        {
          step: 'execute_earnout_mc',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.STRUCT.EARNOUT.MC.v1',
            inputs: {
              earnout_targets: [2000_000_00, 2200_000_00, 2400_000_00],
              probabilities: [0.7, 0.55, 0.4],
              discount_rate: 0.09,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['earnout_pv_cents', 'earnout_output_hash'],
          },
        },
        {
          step: 'execute_lbo',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.LBO.LMM.v1',
            inputs: {
              purchase_price_cents: 2200_000_000,
              debt_cents: 900_000_000,
              sponsor_equity_cents: 1300_000_000,
              entry_ebitda_cents: 500_000_000,
              exit_multiple: 8.5,
              hold_years: 5,
              ebitda_growth_pct: 0.06,
              debt_paydown_cents: 600_000_000,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['lbo_output_hash'],
          },
        },
        {
          step: 'compose_loi_plan',
          tool: 'compose_deal_plan',
          input: (state) => ({ deal_id: state.deal_id, stage: 'loi' }),
          expect: { responseType: 'classification_with_work' },
        },
        {
          step: 'finalize_package',
          tool: 'finalize_deal_package',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['package_id', 'merkle_root'],
          },
        },
      ],
    },

    // ─── SELL SIDE ───────────────────────────────────────
    {
      role: 'seller',
      agentIdentity: 'agent_sell_sim_l4_002',
      beneficialCustomer: 'seller_owner_sim_l4_002',
      tier: 'pro',
      payloadFromTruth: (facts) => ({
        journey: 'sell',
        seller_role: 'principal',
        industry: facts.industry,
        jurisdiction: facts.jurisdiction,
        willing_to_accept_earnout: true,
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: {
            journey: 'sell',
            seller_role: 'principal',
            industry: 'B2B services',
            jurisdiction: 'US-TX',
            willing_to_accept_earnout: true,
          },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'sell', subJourney: 'principal_seller' },
            missingFields: ['sde', 'multi_year_pnl_present', 'owner_perks', 'earnout_terms'],
            nextCallsInclude: ['update_deal_payload'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_with_sde_and_earnout',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            sde_cents: 500_000_000,
            multi_year_pnl_present: true,
            owner_perks_cents: 25_000_000,
            naics: '541512',
            earnout_max_cents: 300_000_000,
            earnout_metric: 'revenue',
            earnout_years: 3,
            earnout_targets_cents: [2000_000_00, 2200_000_00, 2400_000_00],
          }),
          expect: {
            responseType: 'classification_with_work',
            classification: { league: 'L4' },
          },
        },
        {
          step: 'compose_stack',
          tool: 'compose_model_stack',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: { responseType: 'classification_with_work', captureToState: ['applicable_models'] },
        },
        {
          step: 'execute_ebitda_valuation',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.VAL.EBITDA.v1',
            inputs: {
              ebitda_cents: 500_000_000,
              comparables_multiple_range: { low: 4.0, high: 5.6 },
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['valuation_output_hash', 'valuation_range'],
          },
        },
        {
          step: 'execute_earnout_mc',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.STRUCT.EARNOUT.MC.v1',
            inputs: {
              earnout_targets: [2000_000_00, 2200_000_00, 2400_000_00],
              probabilities: [0.8, 0.65, 0.5], // seller more optimistic
              discount_rate: 0.08,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['earnout_pv_cents'],
          },
        },
        {
          step: 'execute_earnout_architecture',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.LEGAL.EARNOUT_ARCHITECTURE.v1',
            inputs: {
              earnout_value_cents: 300_000_000,
              metrics: [{ name: 'revenue', threshold_cents: 2000_000_00, period_years: 3 }],
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['earnout_architecture_output_hash'],
          },
        },
        {
          step: 'execute_qoe_lite',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.QOE.LITE.v1',
            inputs: {
              sde_cents: 500_000_000,
              owner_perks_cents: 25_000_000,
              financial_facts: { trailing_periods: 3, add_backs_cents: 25_000_000 },
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['normalized_sde_cents'],
          },
        },
        {
          step: 'compose_data_room',
          tool: 'compose_data_room_index',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: { responseType: 'classification_with_work' },
        },
        {
          step: 'finalize_package',
          tool: 'finalize_deal_package',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['package_id', 'merkle_root'],
          },
        },
      ],
    },
  ],

  symmetry: [
    {
      description: 'Valuation ranges overlap',
      field: 'valuation_range',
      mode: 'overlap',
      parties: ['buyer', 'seller'],
    },
    {
      description: 'Earnout PV pricing within tolerance (buyer/seller probability views differ legitimately)',
      field: 'earnout_pv_cents',
      mode: 'within_tolerance',
      tolerance: 0.35,
      parties: ['buyer', 'seller'],
    },
    {
      description: 'Both sides cite same earnout-architecture authority set',
      field: 'earnout_citation_refs',
      mode: 'subset',
      parties: ['buyer', 'seller'],
    },
    {
      description: 'Both sides return identical methodology_version pin',
      field: 'methodology_version',
      mode: 'equal',
    },
  ],

  isolation: [
    {
      description: "Buyer's probability vector never appears in seller substrate output",
      sourceField: 'earnout_probabilities_buy',
      sourceParty: 'buyer',
      targetParty: 'seller',
    },
    {
      description: "Buyer's LBO output hash never appears in seller substrate output",
      sourceField: 'lbo_output_hash',
      sourceParty: 'buyer',
      targetParty: 'seller',
    },
    {
      description: "Seller's owner perks ($250K) never appear in buyer substrate output",
      sourceField: 'owner_perks_cents',
      sourceParty: 'seller',
      targetParty: 'buyer',
    },
    {
      description: "Seller's optimistic probability vector never appears in buyer substrate output",
      sourceField: 'earnout_probabilities_sell',
      sourceParty: 'seller',
      targetParty: 'buyer',
    },
  ],

  refusals: [
    {
      description: 'Asking substrate to negotiate the earnout caps is refused identically',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'NEGOTIATION.RECOMMEND.v1', inputs: { lever: 'earnout_caps' } },
      },
      expectedRefusal: 'LINE_VIOLATION',
    },
    {
      description: 'Asking for a fairness opinion routes to counsel_review_required',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'OPINION.FAIRNESS.v1' },
      },
      expectedRefusal: 'counsel_review_required',
    },
    {
      description: 'Asking substrate to sign the earnout schedule is refused (unauthorized signing)',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'LEGAL.SIGN_EARNOUT.v1' },
      },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'unauthorized_signing',
    },
  ],

  completion: [
    {
      party: 'buyer',
      endpoint: 'Reaches finalize_deal_package with package_id + merkle_root',
      minAuditRows: 8,
      requiredFinalCalls: ['finalize_deal_package'],
    },
    {
      party: 'seller',
      endpoint: 'Reaches finalize_deal_package with package_id + merkle_root',
      minAuditRows: 9,
      requiredFinalCalls: ['finalize_deal_package'],
    },
  ],

  partyTiers: { buyer: 'pro', seller: 'pro' },
};

export default sim;
