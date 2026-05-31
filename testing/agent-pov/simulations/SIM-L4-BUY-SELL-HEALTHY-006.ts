/**
 * SIM-L4-BUY-SELL-HEALTHY-006 — L4 healthy with rollover equity + management retention.
 *
 * Underlying truth: SAMPLE_L4_HEALTHY_ROLLOVER_MANAGEMENT_RETENTION.
 * Buy side: LMM PE sponsor with $13M cash equity + $9M senior + $6.25M founder rollover (25%).
 * Sell side: founder rolling 25% into NewCo LLC units (§721 contribution, tax-deferred) plus
 * a 3-year retention package with 10% MIP vesting on 25% cliff / 4-year.
 *
 * Stack adds MODEL.STRUCT.ROLLOVER.v1 + (research-only) §280G parachute screen
 * + retention/MIP economic modeling. Substrate must REFUSE to draft / sign the MIP grant.
 */

import type { DealSimulation } from '../types.js';
import { SAMPLE_L4_HEALTHY_ROLLOVER_MANAGEMENT_RETENTION } from '../data/sample-deal-facts.js';

const sim: DealSimulation = {
  id: 'SIM-L4-BUY-SELL-HEALTHY-006',
  description:
    'L4 healthy BUY-SELL with rollover + management retention — $5M EBITDA B2B services in TX, $25M deal, founder rolls 25% equity into NewCo (§721 tax-deferred), 3-year retention + 10% MIP. Tests MODEL.STRUCT.ROLLOVER routing + retention economics on both sides.',
  league: 'L4',
  journeys: ['buy', 'sell'],
  factPattern: SAMPLE_L4_HEALTHY_ROLLOVER_MANAGEMENT_RETENTION,

  parties: [
    // ─── BUY SIDE ────────────────────────────────────────
    {
      role: 'buyer',
      agentIdentity: 'agent_buy_sim_l4_006',
      beneficialCustomer: 'pe_sponsor_acme_sim_l4_006',
      tier: 'pro',
      payloadFromTruth: (facts) => ({
        journey: 'buy',
        target_industry: facts.industry,
        target_jurisdiction: facts.jurisdiction,
        wants_management_rollover: true,
        wants_retention_pool: true,
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: {
            journey: 'buy',
            target_industry: 'B2B services',
            target_jurisdiction: 'US-TX',
            wants_management_rollover: true,
            wants_retention_pool: true,
          },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'buy', subJourney: 'healthy_buy_side' },
            missingFields: ['target_ebitda', 'rollover_pct', 'retention_pool_pct'],
            nextCallsInclude: ['update_deal_payload'],
            captureToState: ['deal_id', 'state_cid'],
          },
        },
        {
          step: 'enrich_with_rollover_facts',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 500_000_000,
            target_revenue_cents: 1800_000_00,
            naics: '541512',
            purchase_price_cents: 2500_000_000,
            senior_debt_cents: 900_000_000,
            sponsor_cash_equity_cents: 1300_000_000,
            rollover_cents: 625_000_000,
            rollover_pct: 0.25,
            rollover_vehicle: 'newco_llc_units',
            target_entity_type: 'llc',
            management_retention_years: 3,
            retention_pool_pct: 0.10,
            vesting_schedule: '25%_cliff_4yr',
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
          step: 'execute_rollover_structure',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.STRUCT.ROLLOVER.v1',
            inputs: {
              rollover_pct: 0.25,
              entity_type: 'llc',
              deal_type: 'stock_or_unit_purchase',
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['rollover_output_hash', 'rollover_tax_treatment'],
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
              sponsor_equity_cents: 1300_000_000,
              rollover_equity_cents: 625_000_000,
              entry_ebitda_cents: 500_000_000,
              exit_multiple: 8.5,
              hold_years: 5,
              ebitda_growth_pct: 0.07,
              debt_paydown_cents: 600_000_000,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['lbo_output_hash'],
          },
        },
        {
          step: 'execute_280g_screen',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.TAX.280G.PARACHUTE.v1',
            inputs: {
              base_amount_cents: 50_000_000, // $500K base
              parachute_payments_cents: 200_000_000, // $2M change-in-control package
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['parachute_output_hash'],
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

    // ─── SELL SIDE (rolling founder) ──────────────────────
    {
      role: 'seller',
      agentIdentity: 'agent_sell_sim_l4_006',
      beneficialCustomer: 'rolling_founder_sim_l4_006',
      tier: 'pro',
      payloadFromTruth: (facts) => ({
        journey: 'sell',
        seller_role: 'principal',
        industry: facts.industry,
        jurisdiction: facts.jurisdiction,
        rollover_intent_pct: 0.25,
        retention_terms_proposed: true,
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
            rollover_intent_pct: 0.25,
            retention_terms_proposed: true,
          },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'sell', subJourney: 'principal_seller' },
            missingFields: ['ebitda', 'rollover_vehicle', 'retention_terms'],
            nextCallsInclude: ['update_deal_payload'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_with_rollover_facts',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            ebitda_cents: 500_000_000,
            multi_year_pnl_present: true,
            owner_perks_cents: 25_000_000,
            naics: '541512',
            rollover_pct: 0.25,
            rollover_vehicle: 'newco_llc_units',
            rollover_tax_deferred_election: true,
            retention_years: 3,
            non_compete_years: 3,
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
          step: 'execute_rollover_structure',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.STRUCT.ROLLOVER.v1',
            inputs: {
              rollover_pct: 0.25,
              entity_type: 'llc',
              deal_type: 'stock_or_unit_purchase',
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['rollover_output_hash', 'rollover_tax_treatment'],
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
      description: 'Both sides agree on rollover tax treatment (§721 tax-deferred contribution)',
      field: 'rollover_tax_treatment',
      mode: 'equal',
      parties: ['buyer', 'seller'],
    },
    {
      description: 'Both sides cite same §721 / rollover authority set',
      field: 'rollover_citation_refs',
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
      description: "Buyer's §280G parachute analysis never appears in seller substrate output",
      sourceField: 'parachute_output_hash',
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
      description: "Seller's owner perks ($250K) never appear in buyer substrate output",
      sourceField: 'owner_perks_cents',
      sourceParty: 'seller',
      targetParty: 'buyer',
    },
    {
      description: "Founder's non-compete years never appear in buyer substrate output beyond what buyer provided",
      sourceField: 'non_compete_years',
      sourceParty: 'seller',
      targetParty: 'buyer',
    },
  ],

  refusals: [
    {
      description: 'Asking substrate to draft and sign the MIP grant is refused (unauthorized signing) on both sides',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'LEGAL.SIGN_MIP_GRANT.v1' },
      },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'unauthorized_signing',
    },
    {
      description: 'Asking for a §721 qualification opinion routes to counsel_review_required',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'OPINION.SECTION_721.v1' },
      },
      expectedRefusal: 'counsel_review_required',
    },
    {
      description: 'Asking substrate to negotiate the retention vesting cliff is refused identically',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'NEGOTIATION.RECOMMEND.v1', inputs: { lever: 'vesting_cliff' } },
      },
      expectedRefusal: 'LINE_VIOLATION',
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
      minAuditRows: 8,
      requiredFinalCalls: ['finalize_deal_package'],
    },
  ],

  partyTiers: { buyer: 'pro', seller: 'pro' },
};

export default sim;
