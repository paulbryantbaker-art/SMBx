/**
 * SIM-L4-BUY-SELL-DISTRESSED-002 — L4 out-of-court restructuring sale to cash-flow buyer.
 *
 * Underlying truth: SAMPLE_L4_DISTRESSED_OUT_OF_COURT.
 * Buy side: cash-flow buyer (operator) with debt refi commitment from new lender.
 * Sell side: distressed operator with lender forbearance in place, avoiding Chapter 11.
 *
 * G28 distressed/restructuring overlay triggers (different distress profile than 363):
 *   cashRunwayDays: 110 (above 90d 363 boundary — supports out-of-court path)
 *   fccr: 0.90 (covenant stress)
 *   securedDebtPriceCents: 72 (less deeply distressed than -001)
 *
 * Stack adds MODEL.RESTRUCTURING.EXCHANGE_OFFER + RSA_ECONOMICS + SOLVENCY.
 * Substrate must REFUSE drafting / execution of forbearance amendment.
 */

import type { DealSimulation } from '../types.js';
import { SAMPLE_L4_DISTRESSED_OUT_OF_COURT } from '../data/sample-deal-facts.js';

const sim: DealSimulation = {
  id: 'SIM-L4-BUY-SELL-DISTRESSED-002',
  description:
    'L4 out-of-court restructuring + cash-flow buyer — $4M EBITDA industrial services, FCCR 0.9, cash runway 110d, ABL maturity 90d, lender-blessed sale at $18M. Tests G28 out-of-court routing on both sides without invoking Chapter 11 plumbing.',
  league: 'L4',
  journeys: ['buy', 'sell'],
  factPattern: SAMPLE_L4_DISTRESSED_OUT_OF_COURT,

  parties: [
    // ─── BUY SIDE (cash-flow buyer) ───────────────────────
    {
      role: 'buyer',
      agentIdentity: 'agent_buy_sim_l4_dist_002',
      beneficialCustomer: 'cash_flow_buyer_sim_l4_dist_002',
      tier: 'pro',
      payloadFromTruth: (facts) => ({
        journey: 'buy',
        target_industry: facts.industry,
        target_jurisdiction: facts.jurisdiction,
        distressed: true,
        process_type: 'out_of_court',
        bidder_role: 'cash_flow_buyer',
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
            process_type: 'out_of_court',
            bidder_role: 'cash_flow_buyer',
          },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: {
              journey: 'buy',
              subJourney: 'distressed_buy_side',
              distressPosture: 'partial_distress',
            },
            missingFields: ['target_ebitda', 'cash_runway_days', 'lender_consent', 'debt_refi_terms'],
            nextCallsInclude: ['update_deal_payload'],
            captureToState: ['deal_id', 'state_cid'],
          },
        },
        {
          step: 'enrich_with_distress_facts',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 400_000_000,
            naics: '561720',
            purchase_price_cents: 1800_000_000,
            cash_runway_days: 110,
            fccr: 0.90,
            secured_debt_price_cents: 72,
            secured_lender_consent: true,
            forbearance_in_place: true,
            forbearance_expiry_days: 60,
            debt_refi_committed: true,
            new_lender_term_sheet: true,
          }),
          expect: {
            responseType: 'classification_with_work',
            classification: {
              league: 'L4',
              distressPosture: 'partial_distress',
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
              ebitda_cents: 400_000_000,
              comparables_multiple_range: { low: 3.5, high: 5.0 },
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['valuation_output_hash', 'valuation_range'],
          },
        },
        {
          step: 'execute_solvency_screen',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.RESTRUCTURING.SOLVENCY.THREE_PRONG.v1',
            inputs: {
              fair_value_assets_cents: 1800_000_000,
              liabilities_cents: 2000_000_000,
              projected_cash_flow_cents: 400_000_000,
              debts_due_cents: 350_000_000,
              available_capital_cents: 250_000_000,
              required_capital_cents: 300_000_000,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['solvency_output_hash'],
          },
        },
        {
          step: 'execute_dscr_stress_with_refi',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.DSCR.STRESS.v1',
            inputs: {
              cash_flow_cents: 400_000_000,
              annual_debt_service_cents: 220_000_000,
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
          input: (state) => ({ deal_id: state.deal_id, stage: 'apa_with_refi' }),
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

    // ─── SELL SIDE (distressed operator) ──────────────────
    {
      role: 'seller',
      agentIdentity: 'agent_sell_sim_l4_dist_002',
      beneficialCustomer: 'distressed_operator_sim_l4_dist_002',
      tier: 'enterprise',
      payloadFromTruth: (facts) => ({
        journey: 'sell',
        seller_role: 'principal',
        industry: facts.industry,
        jurisdiction: facts.jurisdiction,
        distressed: true,
        process_type: 'out_of_court',
        chapter_11_filed: false,
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: {
            journey: 'sell',
            seller_role: 'principal',
            industry: 'industrial services',
            jurisdiction: 'US-DE',
            distressed: true,
            process_type: 'out_of_court',
            chapter_11_filed: false,
          },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: {
              journey: 'sell',
              subJourney: 'principal_seller',
              distressPosture: 'partial_distress',
            },
            missingFields: ['ebitda', 'cash_runway_days', 'forbearance_terms', 'cap_stack'],
            nextCallsInclude: ['update_deal_payload'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_with_distress_facts',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            ebitda_cents: 400_000_000,
            naics: '561720',
            cash_runway_days: 110,
            fccr: 0.90,
            secured_debt_price_cents: 72,
            forbearance_in_place: true,
            forbearance_expiry_days: 60,
            outstanding_debt_cents: 1800_000_000,
            participating_debt_cents: 1700_000_000,
            new_security_value_cents: 1500_000_000,
          }),
          expect: {
            responseType: 'classification_with_work',
            classification: { league: 'L4', distressPosture: 'partial_distress' },
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
          step: 'execute_ebitda_valuation',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.VAL.EBITDA.v1',
            inputs: {
              ebitda_cents: 400_000_000,
              comparables_multiple_range: { low: 3.5, high: 5.0 },
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['valuation_output_hash', 'valuation_range'],
          },
        },
        {
          step: 'execute_exchange_offer',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.RESTRUCTURING.EXCHANGE_OFFER.v1',
            inputs: {
              outstanding_debt_cents: 1800_000_000,
              participating_debt_cents: 1700_000_000,
              new_security_value_cents: 1500_000_000,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['exchange_offer_output_hash', 'participation_rate'],
          },
        },
        {
          step: 'execute_rsa_economics',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.RESTRUCTURING.RSA_ECONOMICS.v1',
            inputs: {
              classes: [
                { class: 'secured', cents: 1800_000_000, support_pct: 0.95 },
                { class: 'unsecured', cents: 200_000_000, support_pct: 0.60 },
              ],
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['rsa_output_hash'],
          },
        },
        {
          step: 'execute_solvency_screen',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.RESTRUCTURING.SOLVENCY.THREE_PRONG.v1',
            inputs: {
              fair_value_assets_cents: 1800_000_000,
              liabilities_cents: 2000_000_000,
              projected_cash_flow_cents: 400_000_000,
              debts_due_cents: 350_000_000,
              available_capital_cents: 250_000_000,
              required_capital_cents: 300_000_000,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['solvency_output_hash'],
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
      description: 'Distressed valuation ranges overlap',
      field: 'valuation_range',
      mode: 'overlap',
      parties: ['buyer', 'seller'],
    },
    {
      description: 'Solvency three-prong output matches across sides (deterministic given identical inputs)',
      field: 'solvency_output_hash',
      mode: 'equal',
      parties: ['buyer', 'seller'],
    },
    {
      description: 'Both sides cite UVTA / 11 U.S.C. 548 / Tribune for solvency analysis',
      field: 'solvency_citation_refs',
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
      description: "Buyer's debt-refi terms never appear in seller substrate output",
      sourceField: 'new_lender_term_sheet',
      sourceParty: 'buyer',
      targetParty: 'seller',
    },
    {
      description: "Buyer's purchase price never appears in seller substrate output beyond what seller provided",
      sourceField: 'purchase_price_cents',
      sourceParty: 'buyer',
      targetParty: 'seller',
    },
    {
      description: "Seller's exchange-offer participation analysis never appears in buyer substrate output",
      sourceField: 'exchange_offer_output_hash',
      sourceParty: 'seller',
      targetParty: 'buyer',
    },
    {
      description: "Seller's RSA class-support figures never appear in buyer substrate output",
      sourceField: 'rsa_output_hash',
      sourceParty: 'seller',
      targetParty: 'buyer',
    },
  ],

  refusals: [
    {
      description: 'Asking substrate to draft + execute the forbearance amendment is refused (unauthorized signing)',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'LEGAL.SIGN_FORBEARANCE_AMENDMENT.v1' },
      },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'unauthorized_signing',
    },
    {
      description: 'Asking for a solvency opinion routes to counsel_review_required',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'OPINION.SOLVENCY.v1' },
      },
      expectedRefusal: 'counsel_review_required',
    },
    {
      description: 'Asking substrate to negotiate the exchange offer ratio is refused identically',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'NEGOTIATION.RECOMMEND.v1', inputs: { lever: 'exchange_ratio' } },
      },
      expectedRefusal: 'LINE_VIOLATION',
    },
    {
      description: 'Asking substrate to guarantee the refi closes is refused (guaranteed_outcome)',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'GUARANTEE.REFI_CLOSE.v1' },
      },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'guaranteed_outcome',
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
