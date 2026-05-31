/**
 * SIM-L4-BUY-SELL-DISTRESSED-001 — L4 363 sale (in-court, stalking-horse).
 *
 * Underlying truth: SAMPLE_L4_DISTRESSED_363.
 * Buy side: stalking-horse bidder running a §363 sale process.
 * Sell side: debtor-in-possession (DIP) management running asset sale to maximize estate value.
 *
 * G28 distressed/restructuring overlay triggers via factPattern signals:
 *   cashRunwayDays: 75 (< 90 day boundary)
 *   fccr: 0.85 (covenant stress)
 *   securedDebtPriceCents: 55 (< 60¢ secured-debt distress threshold)
 *
 * Stack adds MODEL.RESTRUCTURING.363_SALE.v1 + SOLVENCY.THREE_PRONG + BIOC.
 */

import type { DealSimulation } from '../types.js';
import { SAMPLE_L4_DISTRESSED_363 } from '../data/sample-deal-facts.js';

const sim: DealSimulation = {
  id: 'SIM-L4-BUY-SELL-DISTRESSED-001',
  description:
    'L4 distressed 363 sale — $5M EBITDA industrial services co, secured debt at 55¢, cash runway 75d, stalking-horse bidder vs. DIP. Tests G28 distressed overlay routing + 363/SOLVENCY/BIOC model stack on both sides.',
  league: 'L4',
  journeys: ['buy', 'sell'],
  factPattern: SAMPLE_L4_DISTRESSED_363,

  parties: [
    // ─── BUY SIDE (stalking-horse) ────────────────────────
    {
      role: 'buyer',
      agentIdentity: 'agent_buy_sim_l4_dist_001',
      beneficialCustomer: 'stalking_horse_bidder_sim_l4_dist_001',
      tier: 'pro',
      payloadFromTruth: (facts) => ({
        journey: 'buy',
        target_industry: facts.industry,
        target_jurisdiction: facts.jurisdiction,
        distressed: true,
        process_type: '363_sale',
        bidder_role: 'stalking_horse',
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: {
            journey: 'buy',
            target_industry: 'industrial services',
            target_jurisdiction: 'US-DE',
            distressed: true,
            process_type: '363_sale',
            bidder_role: 'stalking_horse',
          },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: {
              journey: 'buy',
              subJourney: 'distressed_buy_side',
              distressPosture: 'full_distress',
            },
            missingFields: ['target_ebitda', 'cash_runway_days', 'lien_amount', 'stalking_horse_bid'],
            nextCallsInclude: ['update_deal_payload'],
            captureToState: ['deal_id', 'state_cid'],
          },
        },
        {
          step: 'enrich_with_distress_facts',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 500_000_000,
            naics: '561720',
            stalking_horse_bid_cents: 1500_000_000,
            lien_amount_cents: 2500_000_000,
            secured_debt_price_cents: 55,
            cash_runway_days: 75,
            fccr: 0.85,
            breakup_fee_cents: 45_000_000, // 3%
            overbid_increment_cents: 25_000_000,
          }),
          expect: {
            responseType: 'classification_with_work',
            classification: {
              league: 'L4',
              distressPosture: 'full_distress',
            },
            nextCallsInclude: ['compose_model_stack'],
            captureToState: ['parent_cid', 'state_cid', 'overlays_applied'],
          },
        },
        {
          step: 'compose_stack_with_g28_overlay',
          tool: 'compose_model_stack',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['applicable_models', 'overlays_applied'],
          },
        },
        {
          step: 'execute_ebitda_valuation_distressed',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.VAL.EBITDA.v1',
            inputs: {
              ebitda_cents: 500_000_000,
              comparables_multiple_range: { low: 2.5, high: 4.0 }, // distressed band
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['valuation_output_hash', 'valuation_range'],
          },
        },
        {
          step: 'execute_363_sale',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.RESTRUCTURING.363_SALE.v1',
            inputs: {
              purchase_price_cents: 1500_000_000,
              lien_amount_cents: 2500_000_000,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['sale363_output_hash', 'free_and_clear_status'],
          },
        },
        {
          step: 'execute_solvency_screen',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.RESTRUCTURING.SOLVENCY.THREE_PRONG.v1',
            inputs: {
              fair_value_assets_cents: 1500_000_000,
              liabilities_cents: 2700_000_000,
              projected_cash_flow_cents: 200_000_000,
              debts_due_cents: 600_000_000,
              available_capital_cents: 100_000_000,
              required_capital_cents: 300_000_000,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['solvency_output_hash'],
          },
        },
        {
          step: 'compose_loi_plan',
          tool: 'compose_deal_plan',
          input: (state) => ({ deal_id: state.deal_id, stage: 'stalking_horse_apa' }),
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

    // ─── SELL SIDE (DIP / debtor) ─────────────────────────
    {
      role: 'seller',
      agentIdentity: 'agent_sell_sim_l4_dist_001',
      beneficialCustomer: 'dip_debtor_sim_l4_dist_001',
      tier: 'enterprise',
      payloadFromTruth: (facts) => ({
        journey: 'sell',
        seller_role: 'principal',
        industry: facts.industry,
        jurisdiction: facts.jurisdiction,
        distressed: true,
        process_type: '363_sale',
        seller_status: 'debtor_in_possession',
      }),
      callSequence: [
        {
          step: 'cold_intake_dip',
          tool: 'ingest_deal_payload',
          input: {
            journey: 'sell',
            seller_role: 'principal',
            industry: 'industrial services',
            jurisdiction: 'US-DE',
            distressed: true,
            process_type: '363_sale',
            seller_status: 'debtor_in_possession',
          },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: {
              journey: 'sell',
              subJourney: 'principal_seller',
              distressPosture: 'full_distress',
            },
            missingFields: ['ebitda', 'lien_amount', 'creditor_classes'],
            nextCallsInclude: ['update_deal_payload'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_with_distress_facts',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            ebitda_cents: 500_000_000,
            naics: '561720',
            lien_amount_cents: 2500_000_000,
            secured_debt_price_cents: 55,
            cash_runway_days: 75,
            fccr: 0.85,
            estate_value_cents: 1500_000_000,
            creditor_classes: [
              { class: 'admin', cents: 50_000_000, priority: 1 },
              { class: 'secured', cents: 2500_000_000, priority: 2 },
              { class: 'priority_unsec', cents: 100_000_000, priority: 3 },
              { class: 'general_unsec', cents: 400_000_000, priority: 4 },
            ],
          }),
          expect: {
            responseType: 'classification_with_work',
            classification: { league: 'L4', distressPosture: 'full_distress' },
          },
        },
        {
          step: 'compose_stack',
          tool: 'compose_model_stack',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['applicable_models', 'overlays_applied'],
          },
        },
        {
          step: 'execute_ebitda_valuation_distressed',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.VAL.EBITDA.v1',
            inputs: {
              ebitda_cents: 500_000_000,
              comparables_multiple_range: { low: 2.5, high: 4.0 },
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['valuation_output_hash', 'valuation_range'],
          },
        },
        {
          step: 'execute_363_sale',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.RESTRUCTURING.363_SALE.v1',
            inputs: {
              purchase_price_cents: 1500_000_000,
              lien_amount_cents: 2500_000_000,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['sale363_output_hash', 'free_and_clear_status'],
          },
        },
        {
          step: 'execute_ch7_waterfall',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.RESTRUCTURING.CH7_WATERFALL.v1',
            inputs: {
              estate_value_cents: 1500_000_000,
              claims: [
                { class: 'admin', cents: 50_000_000, priority: 1 },
                { class: 'secured', cents: 2500_000_000, priority: 2 },
                { class: 'priority_unsec', cents: 100_000_000, priority: 3 },
                { class: 'general_unsec', cents: 400_000_000, priority: 4 },
              ],
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['waterfall_output_hash'],
          },
        },
        {
          step: 'execute_bioc_screen',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.RESTRUCTURING.BIOC.v1',
            inputs: {
              creditor_classes: [
                { class: 'secured', plan_recovery_cents: 1450_000_000, ch7_recovery_cents: 1350_000_000 },
                { class: 'general_unsec', plan_recovery_cents: 10_000_000, ch7_recovery_cents: 0 },
              ],
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['bioc_output_hash'],
          },
        },
        {
          step: 'compose_sale_process_plan',
          tool: 'compose_deal_plan',
          input: (state) => ({ deal_id: state.deal_id, stage: '363_bidding_procedures' }),
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
      description: 'Distressed valuation ranges overlap',
      field: 'valuation_range',
      mode: 'overlap',
      parties: ['buyer', 'seller'],
    },
    {
      description: '363 sale free-and-clear status matches across sides (deterministic)',
      field: 'free_and_clear_status',
      mode: 'equal',
      parties: ['buyer', 'seller'],
    },
    {
      description: 'Both sides cite 11 U.S.C. 363 / 365 / RadLAX / Fisker authorities',
      field: 'restructuring_citation_refs',
      mode: 'subset',
      parties: ['buyer', 'seller'],
    },
    {
      description: 'G28 distressed overlay applied on both sides',
      field: 'overlays_applied',
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
      description: "Buyer's stalking-horse bid never appears in seller substrate output beyond what seller provided",
      sourceField: 'stalking_horse_bid_cents',
      sourceParty: 'buyer',
      targetParty: 'seller',
    },
    {
      description: "Buyer's break-up fee terms never appear in seller substrate output",
      sourceField: 'breakup_fee_cents',
      sourceParty: 'buyer',
      targetParty: 'seller',
    },
    {
      description: "Seller's waterfall recovery analysis never appears in buyer substrate output",
      sourceField: 'waterfall_output_hash',
      sourceParty: 'seller',
      targetParty: 'buyer',
    },
    {
      description: "Seller's BIOC analysis never appears in buyer substrate output",
      sourceField: 'bioc_output_hash',
      sourceParty: 'seller',
      targetParty: 'buyer',
    },
  ],

  refusals: [
    {
      description: 'Asking substrate to file the 363 motion is refused (unauthorized filing) on both sides',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'BANKRUPTCY.FILE_363_MOTION.v1' },
      },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'unauthorized_filing',
    },
    {
      description: 'Asking for a feasibility / fairness opinion routes to counsel_review_required',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'OPINION.FEASIBILITY.v1' },
      },
      expectedRefusal: 'counsel_review_required',
    },
    {
      description: 'Asking substrate to negotiate the secured-debt recovery split is refused identically',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'NEGOTIATION.RECOMMEND.v1', inputs: { lever: 'secured_recovery' } },
      },
      expectedRefusal: 'LINE_VIOLATION',
    },
    {
      description: 'Asking substrate to hold the cash deposit in escrow is refused (custody)',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'ESCROW.HOLD_DEPOSIT.v1' },
      },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'custody',
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

  partyTiers: { buyer: 'pro', seller: 'enterprise' },
};

export default sim;
