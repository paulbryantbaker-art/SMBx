/**
 * SIM-L4-BUY-SELL-HEALTHY-003 — L4 healthy with foreign seller (FIRPTA exposure).
 *
 * Underlying truth: SAMPLE_L4_HEALTHY_FOREIGN_SELLER_B2B_SERVICES.
 * Buy side: LMM PE sponsor; must apply FIRPTA §1445 withholding given target's US real property.
 * Sell side: Cayman holdco seller with US real property holdings.
 *
 * G30 real-estate overlay should compose on top of the L4 stack because the
 * target holds a US office building (USRPI > 25% threshold consideration).
 * MODEL.RE.FIRPTA.WITHHOLDING.v1 (and/or .V11.v1) must appear in the stack.
 */

import type { DealSimulation } from '../types.js';
import { SAMPLE_L4_HEALTHY_FOREIGN_SELLER_B2B_SERVICES } from '../data/sample-deal-facts.js';

const sim: DealSimulation = {
  id: 'SIM-L4-BUY-SELL-HEALTHY-003',
  description:
    'L4 healthy BUY-SELL with foreign seller — $5M EBITDA B2B services in TX, Cayman holdco seller with $6M US office building, $25M cash deal. Tests FIRPTA §1445 withholding routing (MODEL.RE.FIRPTA.WITHHOLDING.v1) on both sides.',
  league: 'L4',
  journeys: ['buy', 'sell'],
  factPattern: SAMPLE_L4_HEALTHY_FOREIGN_SELLER_B2B_SERVICES,

  parties: [
    // ─── BUY SIDE ────────────────────────────────────────
    {
      role: 'buyer',
      agentIdentity: 'agent_buy_sim_l4_003',
      beneficialCustomer: 'pe_sponsor_acme_sim_l4_003',
      tier: 'pro',
      payloadFromTruth: (facts) => ({
        journey: 'buy',
        target_industry: facts.industry,
        target_jurisdiction: facts.jurisdiction,
        counterparty_jurisdiction: 'KY',
        target_holds_us_real_property: true,
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: {
            journey: 'buy',
            target_industry: 'B2B services',
            target_jurisdiction: 'US-TX',
            counterparty_jurisdiction: 'KY',
            target_holds_us_real_property: true,
          },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: {
              journey: 'buy',
              subJourney: 'healthy_buy_side',
              assetClass: 'mixed',
            },
            missingFields: ['target_ebitda', 'us_real_property_value', 'seller_foreign_person_status'],
            nextCallsInclude: ['update_deal_payload'],
            captureToState: ['deal_id', 'state_cid'],
          },
        },
        {
          step: 'enrich_with_firpta_facts',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 500_000_000,
            target_revenue_cents: 1800_000_00,
            naics: '541512',
            purchase_price_cents: 2500_000_000,
            us_real_property_value_cents: 600_000_000,
            seller_foreign_person: true,
            seller_jurisdiction: 'KY',
            firpta_withholding_planned: true,
          }),
          expect: {
            responseType: 'classification_with_work',
            classification: { league: 'L4', assetClass: 'mixed' },
            nextCallsInclude: ['compose_model_stack'],
            captureToState: ['parent_cid', 'state_cid'],
          },
        },
        {
          step: 'compose_stack_with_g30_overlay',
          tool: 'compose_model_stack',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: {
            responseType: 'classification_with_work',
            nextCallsInclude: ['execute_model'],
            captureToState: ['applicable_models', 'overlays_applied'],
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
          step: 'execute_firpta_withholding',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.RE.FIRPTA.WITHHOLDING.V11.v1',
            inputs: {
              amount_realized_cents: 600_000_000,
              seller_foreign_person: true,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['firpta_withholding_output_hash', 'firpta_withholding_cents'],
          },
        },
        {
          step: 'execute_lbo',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.LBO.LMM.v1',
            inputs: {
              purchase_price_cents: 2500_000_000,
              debt_cents: 900_000_000,
              sponsor_equity_cents: 1600_000_000,
              entry_ebitda_cents: 500_000_000,
              exit_multiple: 8.5,
              hold_years: 5,
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

    // ─── SELL SIDE (foreign holdco) ──────────────────────
    {
      role: 'seller',
      agentIdentity: 'agent_sell_sim_l4_003',
      beneficialCustomer: 'cayman_holdco_seller_sim_l4_003',
      tier: 'pro',
      payloadFromTruth: (facts) => ({
        journey: 'sell',
        seller_role: 'principal',
        industry: facts.industry,
        jurisdiction: facts.jurisdiction,
        seller_jurisdiction: 'KY',
        seller_foreign_person: true,
        us_real_property_owned: true,
      }),
      callSequence: [
        {
          step: 'cold_intake_foreign',
          tool: 'ingest_deal_payload',
          input: {
            journey: 'sell',
            seller_role: 'principal',
            industry: 'B2B services',
            jurisdiction: 'US-TX',
            seller_jurisdiction: 'KY',
            seller_foreign_person: true,
            us_real_property_owned: true,
          },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: {
              journey: 'sell',
              subJourney: 'principal_seller',
              taxClassification: 'foreign_entity',
            },
            missingFields: ['ebitda', 'us_real_property_value', 'fmv_realized'],
            nextCallsInclude: ['update_deal_payload'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_with_firpta_facts',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            ebitda_cents: 500_000_000,
            multi_year_pnl_present: true,
            naics: '541512',
            us_real_property_value_cents: 600_000_000,
            amount_realized_cents: 600_000_000,
            seller_foreign_person: true,
          }),
          expect: {
            responseType: 'classification_with_work',
            classification: { league: 'L4', taxClassification: 'foreign_entity' },
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
          step: 'execute_firpta_withholding',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.RE.FIRPTA.WITHHOLDING.V11.v1',
            inputs: {
              amount_realized_cents: 600_000_000,
              seller_foreign_person: true,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['firpta_withholding_output_hash', 'firpta_withholding_cents'],
          },
        },
        {
          step: 'execute_qoe_lite',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.QOE.LITE.v1',
            inputs: {
              sde_cents: 500_000_000,
              owner_perks_cents: 0,
              financial_facts: { trailing_periods: 3 },
            },
          }),
          expect: { responseType: 'classification_with_work' },
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
      description: 'FIRPTA withholding calculation matches exactly (deterministic given identical inputs)',
      field: 'firpta_withholding_cents',
      mode: 'equal',
      parties: ['buyer', 'seller'],
    },
    {
      description: 'Both sides cite same FIRPTA authority set (IRC 1445 / Form 8288)',
      field: 'firpta_citation_refs',
      mode: 'subset',
      parties: ['buyer', 'seller'],
    },
    {
      description: 'G30 real-estate overlay applied on both sides',
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
      description: "Buyer's specific purchase price ($25M) never appears in seller substrate output",
      sourceField: 'purchase_price_cents',
      sourceParty: 'buyer',
      targetParty: 'seller',
    },
    {
      description: "Buyer's LBO assumptions never appear in seller substrate output",
      sourceField: 'lbo_output_hash',
      sourceParty: 'buyer',
      targetParty: 'seller',
    },
    {
      description: "Seller's Cayman holdco identity never appears in buyer substrate output",
      sourceField: 'cayman_holdco_seller_sim_l4_003',
      sourceParty: 'seller',
      targetParty: 'buyer',
    },
  ],

  refusals: [
    {
      description: 'Asking substrate to file Form 8288 is refused (unauthorized filing) on both sides',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'IRS.FILE_FORM_8288.v1' },
      },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'unauthorized_filing',
    },
    {
      description: 'Asking for a FIRPTA opinion routes to counsel_review_required',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'OPINION.FIRPTA.v1' },
      },
      expectedRefusal: 'counsel_review_required',
    },
    {
      description: 'Asking to negotiate the withholding rate is refused identically',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'NEGOTIATION.RECOMMEND.v1', inputs: { lever: 'firpta_rate' } },
      },
      expectedRefusal: 'LINE_VIOLATION',
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
      minAuditRows: 8,
      requiredFinalCalls: ['finalize_deal_package'],
    },
  ],

  partyTiers: { buyer: 'pro', seller: 'pro' },
};

export default sim;
