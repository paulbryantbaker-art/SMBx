/**
 * SIM-L2-BUY-SELL-SBA-002 — L2 SBA + seller note + 5-year earnout variation.
 *
 * Underlying truth: SAMPLE_L2_SBA_RESTAURANT_EARNOUT.
 * Buy side: first-time buyer with SBA 7(a), $300K seller note, $500K EBITDA-based earnout.
 * Sell side: principal LLC seller exiting with deferred consideration.
 *
 * Adds the earnout architecture model + imputed interest / OID model to the stack
 * (relative to SBA-001). Tests that earnout structure flows through both sides
 * symmetrically while keeping each party's specific bid/reserve isolated.
 */

import type { DealSimulation } from '../types.js';
import { SAMPLE_L2_SBA_RESTAURANT_EARNOUT } from '../data/sample-deal-facts.js';

const sim: DealSimulation = {
  id: 'SIM-L2-BUY-SELL-SBA-002',
  description:
    'L2 micro-LMM + seller note + 5-year EBITDA earnout — $1M SDE restaurant in TX, $4M base + $500K earnout, SBA 7(a) + $300K seller note. Tests earnout MC pricing symmetry and seller-note imputed-interest routing on both sides.',
  league: 'L2',
  journeys: ['buy', 'sell'],
  factPattern: SAMPLE_L2_SBA_RESTAURANT_EARNOUT,

  parties: [
    // ─── BUY SIDE ────────────────────────────────────────
    {
      role: 'buyer',
      agentIdentity: 'agent_buy_sim_l2_002',
      beneficialCustomer: 'first_time_buyer_sim_l2_002',
      tier: 'solo',
      payloadFromTruth: (facts) => ({
        journey: 'buy',
        target_industry: facts.industry,
        target_jurisdiction: facts.jurisdiction,
        sba_eligible_intent: true,
        deferred_consideration_intent: ['seller_note', 'earnout'],
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: {
            journey: 'buy',
            target_industry: 'restaurant',
            target_jurisdiction: 'US-TX',
            sba_eligible_intent: true,
            deferred_consideration_intent: ['seller_note', 'earnout'],
          },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'buy', subJourney: 'healthy_buy_side' },
            missingFields: ['target_sde', 'purchase_price_range', 'earnout_terms'],
            nextCallsInclude: ['update_deal_payload'],
            captureToState: ['deal_id', 'state_cid'],
          },
        },
        {
          step: 'enrich_with_financials_and_earnout',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_sde_cents: 100_000_000,
            target_revenue_cents: 350_000_000,
            naics: '722511',
            purchase_price_range_cents: { low: 400_000_000, high: 500_000_000 },
            buyer_equity_cents: 50_000_000,
            senior_debt_cents: 320_000_000,
            seller_note_cents: 30_000_000,
            seller_note_term_years: 5,
            seller_note_rate_pct: 0.07,
            earnout_max_cents: 50_000_000,
            earnout_metric: 'ebitda',
            earnout_years: 5,
            earnout_target_cents: 100_000_000,
          }),
          expect: {
            responseType: 'classification_with_work',
            classification: { league: 'L2' },
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
          step: 'execute_sde_valuation',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.VAL.SDE.v1',
            inputs: {
              seller_discretionary_earnings_cents: 100_000_000,
              comparables_multiple_range: { low: 3.0, high: 4.5 },
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
              earnout_targets: [100_000_000, 100_000_000, 100_000_000, 100_000_000, 100_000_000],
              probabilities: [0.6, 0.55, 0.5, 0.45, 0.4],
              discount_rate: 0.10,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['earnout_pv_cents', 'earnout_output_hash'],
          },
        },
        {
          step: 'execute_imputed_interest_seller_note',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.TAX.IMPUTED_INTEREST_OID.v1',
            inputs: {
              principal_cents: 30_000_000,
              stated_interest_rate: 0.07,
              afr_rate: 0.045,
              term_months: 60,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['imputed_interest_output_hash'],
          },
        },
        {
          step: 'execute_lbo_sba',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.LBO.SBA.v1',
            inputs: {
              purchase_price_cents: 400_000_000,
              cash_flow_cents: 100_000_000,
              buyer_equity_cents: 50_000_000,
              annual_debt_service_cents: 42_000_000,
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
      agentIdentity: 'agent_sell_sim_l2_002',
      beneficialCustomer: 'seller_owner_sim_l2_002',
      tier: 'solo',
      payloadFromTruth: (facts) => ({
        journey: 'sell',
        seller_role: 'principal',
        industry: facts.industry,
        jurisdiction: facts.jurisdiction,
        willing_to_accept_earnout: true,
        willing_to_carry_seller_note: true,
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: {
            journey: 'sell',
            seller_role: 'principal',
            industry: 'restaurant',
            jurisdiction: 'US-TX',
            willing_to_accept_earnout: true,
            willing_to_carry_seller_note: true,
          },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'sell', subJourney: 'principal_seller' },
            missingFields: ['sde', 'multi_year_pnl_present', 'earnout_terms'],
            nextCallsInclude: ['update_deal_payload'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_with_sde_and_earnout',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            sde_cents: 100_000_000,
            multi_year_pnl_present: true,
            owner_perks_cents: 8_000_000,
            naics: '722511',
            sba_eligible: true,
            earnout_max_cents: 50_000_000,
            earnout_metric: 'ebitda',
            earnout_years: 5,
            seller_note_cents: 30_000_000,
            seller_note_term_years: 5,
          }),
          expect: {
            responseType: 'classification_with_work',
            classification: { league: 'L2' },
          },
        },
        {
          step: 'compose_stack',
          tool: 'compose_model_stack',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: { responseType: 'classification_with_work', captureToState: ['applicable_models'] },
        },
        {
          step: 'execute_sde_valuation',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.VAL.SDE.v1',
            inputs: {
              seller_discretionary_earnings_cents: 100_000_000,
              comparables_multiple_range: { low: 3.0, high: 4.5 },
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
              earnout_targets: [100_000_000, 100_000_000, 100_000_000, 100_000_000, 100_000_000],
              probabilities: [0.65, 0.6, 0.55, 0.5, 0.45],
              discount_rate: 0.10,
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
              earnout_value_cents: 50_000_000,
              metrics: [{ name: 'ebitda', threshold_cents: 100_000_000, period_years: 5 }],
            },
          }),
          expect: { responseType: 'classification_with_work' },
        },
        {
          step: 'execute_qoe_lite',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.QOE.LITE.v1',
            inputs: {
              sde_cents: 100_000_000,
              owner_perks_cents: 8_000_000,
              financial_facts: { trailing_periods: 3, add_backs_cents: 8_000_000 },
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
      description: 'Earnout present-value pricing overlaps within tolerance',
      field: 'earnout_pv_cents',
      mode: 'within_tolerance',
      tolerance: 0.30, // wide — different probability views legitimately differ
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
      description: "Buyer's LBO debt-service inputs never appear in seller substrate output",
      sourceField: 'lbo_output_hash',
      sourceParty: 'buyer',
      targetParty: 'seller',
    },
    {
      description: "Seller's QoE add-back schedule never appears in buyer substrate output",
      sourceField: 'normalized_sde_cents',
      sourceParty: 'seller',
      targetParty: 'buyer',
    },
  ],

  refusals: [
    {
      description: 'Asking substrate to negotiate the earnout split is refused identically',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'NEGOTIATION.RECOMMEND.v1', inputs: { lever: 'earnout_split' } },
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
      description: 'Asking substrate to draft and sign the seller note is refused',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'LEGAL.SIGN_SELLER_NOTE.v1' },
      },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'unauthorized_signing',
    },
  ],

  completion: [
    {
      party: 'buyer',
      endpoint: 'Reaches finalize_deal_package with package_id + merkle_root',
      minAuditRows: 9,
      requiredFinalCalls: ['finalize_deal_package'],
    },
    {
      party: 'seller',
      endpoint: 'Reaches finalize_deal_package with package_id + merkle_root',
      minAuditRows: 9,
      requiredFinalCalls: ['finalize_deal_package'],
    },
  ],

  partyTiers: { buyer: 'solo', seller: 'solo' },
};

export default sim;
