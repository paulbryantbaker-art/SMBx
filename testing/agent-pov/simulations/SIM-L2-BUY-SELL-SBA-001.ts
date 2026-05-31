/**
 * SIM-L2-BUY-SELL-SBA-001 — L2 micro-LMM base SBA-financed acquisition.
 *
 * Underlying truth: SAMPLE_L2_SBA_RESTAURANT.
 * Buy side: first-time buyer, 12.5% down, SBA 7(a) + $300K seller note.
 * Sell side: principal LLC seller exiting an owner-operator restaurant.
 *
 * Mirrors SIM-L4-BUY-SELL-HEALTHY-001 structure. Both sides drive their
 * payloads from the same SAMPLE_L2_SBA_RESTAURANT fact pattern.
 */

import type { DealSimulation } from '../types.js';
import { SAMPLE_L2_SBA_RESTAURANT } from '../data/sample-deal-facts.js';

const sim: DealSimulation = {
  id: 'SIM-L2-BUY-SELL-SBA-001',
  description:
    'L2 micro-LMM base — $1M SDE restaurant in TX, $4M SBA-financed acquisition, first-time buyer + principal seller. Tests micro-LMM substrate symmetry + SBA 7(a) routing.',
  league: 'L2',
  journeys: ['buy', 'sell'],
  factPattern: SAMPLE_L2_SBA_RESTAURANT,

  parties: [
    // ─── BUY SIDE ────────────────────────────────────────
    {
      role: 'buyer',
      agentIdentity: 'agent_buy_sim_l2_001',
      beneficialCustomer: 'first_time_buyer_sim_l2_001',
      tier: 'solo',
      payloadFromTruth: (facts) => ({
        journey: 'buy',
        target_industry: facts.industry,
        target_jurisdiction: facts.jurisdiction,
        sba_eligible_intent: true,
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
          },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'buy', subJourney: 'healthy_buy_side' },
            missingFields: ['target_sde', 'purchase_price_range', 'buyer_equity_cents'],
            nextCallsInclude: ['update_deal_payload'],
            persistsDealState: true,
            versionPins: true,
            captureToState: ['deal_id', 'state_cid'],
          },
        },
        {
          step: 'enrich_with_financials',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_sde_cents: 100_000_000,
            target_revenue_cents: 350_000_000,
            naics: '722511',
            purchase_price_range_cents: { low: 350_000_000, high: 450_000_000 },
            buyer_equity_cents: 50_000_000,
            seller_note_cents: 30_000_000,
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
          input: (state) => ({
            deal_id: state.deal_id,
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
          step: 'execute_lbo_sba',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.LBO.SBA.v1',
            inputs: {
              purchase_price_cents: 400_000_000,
              cash_flow_cents: 100_000_000,
              buyer_equity_cents: 50_000_000,
              annual_debt_service_cents: 42_000_000,
              senior_debt_cents: 320_000_000,
              seller_note_cents: 30_000_000,
              hold_years: 10,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['lbo_output_hash', 'dscr_value'],
          },
        },
        {
          step: 'execute_dscr_stress',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.DSCR.STRESS.v1',
            inputs: {
              cash_flow_cents: 100_000_000,
              annual_debt_service_cents: 42_000_000,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['dscr_stress_output_hash'],
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
      agentIdentity: 'agent_sell_sim_l2_001',
      beneficialCustomer: 'seller_owner_sim_l2_001',
      tier: 'solo',
      payloadFromTruth: (facts) => ({
        journey: 'sell',
        seller_role: 'principal',
        industry: facts.industry,
        jurisdiction: facts.jurisdiction,
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
          },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'sell', subJourney: 'principal_seller' },
            missingFields: ['sde', 'multi_year_pnl_present', 'owner_perks'],
            nextCallsInclude: ['update_deal_payload'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_with_sde',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            sde_cents: 100_000_000,
            multi_year_pnl_present: true,
            owner_perks_cents: 8_000_000,
            naics: '722511',
            sba_eligible: true,
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
          expect: {
            responseType: 'classification_with_work',
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
          step: 'execute_qoe_lite',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.QOE.LITE.v1',
            inputs: {
              sde_cents: 100_000_000,
              owner_perks_cents: 8_000_000,
              financial_facts: {
                trailing_periods: 3,
                add_backs_cents: 8_000_000,
              },
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

  // ─── Symmetry: both sides reach overlapping valuation conclusions ─
  symmetry: [
    {
      description: 'Valuation ranges overlap (both sides used SDE-multiple)',
      field: 'valuation_range',
      mode: 'overlap',
      parties: ['buyer', 'seller'],
    },
    {
      description: 'Both sides cite the same SDE valuation authority',
      field: 'valuation_citation_refs',
      mode: 'subset',
      parties: ['buyer', 'seller'],
    },
    {
      description: 'Both sides return identical methodology_version pin',
      field: 'methodology_version',
      mode: 'equal',
    },
    {
      description: 'Both sides classify deal as L2',
      field: 'league',
      mode: 'equal',
      parties: ['buyer', 'seller'],
    },
  ],

  // ─── Isolation: no info leaks across parties ──────────────────────
  isolation: [
    {
      description: "Buyer's specific equity-down ($500K) never appears in seller substrate output",
      sourceField: 'buyer_equity_cents',
      sourceParty: 'buyer',
      targetParty: 'seller',
    },
    {
      description: "Buyer's DSCR stress assumptions never appear in seller substrate output",
      sourceField: 'dscr_stress_output_hash',
      sourceParty: 'buyer',
      targetParty: 'seller',
    },
    {
      description: "Seller's owner perks ($80K) never appear in buyer substrate output",
      sourceField: 'owner_perks_cents',
      sourceParty: 'seller',
      targetParty: 'buyer',
    },
    {
      description: "Seller's normalized SDE never appears in buyer substrate output",
      sourceField: 'normalized_sde_cents',
      sourceParty: 'seller',
      targetParty: 'buyer',
    },
  ],

  // ─── Refusals: identical regardless of asking side ────────────────
  refusals: [
    {
      description: 'Asking substrate to negotiate is refused identically on both sides',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'NEGOTIATION.RECOMMEND.v1', inputs: { my_position: 'accept_4m' } },
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
      description: 'Asking substrate to file SBA loan application is refused (unauthorized filing)',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'SBA.FILE_APPLICATION.v1' },
      },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'unauthorized_filing',
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
      minAuditRows: 7,
      requiredFinalCalls: ['finalize_deal_package'],
    },
  ],

  partyTiers: { buyer: 'solo', seller: 'solo' },
};

export default sim;
