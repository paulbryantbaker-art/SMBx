/**
 * SIM-L6-BUY-SELL-FAMILY-OFFICE-001 — L6 family-office direct investment.
 *
 * Underlying truth: SAMPLE_L6_FAMILY_OFFICE_DIRECT.
 * Buy side: Family office acquiring 70% control with founder rollover.
 * Sell side: Founder/principal with retained 30% rollover.
 *
 * Substrate features:
 *  - LLC rollover via §721 (no §338 election — pass-through target)
 *  - Long-horizon (15-year) hold IRR is materially below sponsor-PE; LBO model
 *    should still produce reasonable returns
 *  - No fund manager / no fund-level fees; isolation on FO's hold-horizon
 */

import type { DealSimulation } from '../types.js';
import { SAMPLE_L6_FAMILY_OFFICE_DIRECT } from '../data/sample-deal-facts.js';

const sim: DealSimulation = {
  id: 'SIM-L6-BUY-SELL-FAMILY-OFFICE-001',
  description: 'L6 BUY-SELL family-office direct — $20M EBITDA specialty mfg, $160M deal, 70/30 with founder rollover, 15-yr hold, no sponsor. Tests rollover §721 substrate and long-horizon LBO.',
  league: 'L6',
  journeys: ['buy', 'sell'],
  factPattern: SAMPLE_L6_FAMILY_OFFICE_DIRECT,

  parties: [
    // ─── BUY SIDE (Family office) ────────────────────────
    {
      role: 'buyer',
      agentIdentity: 'agent_buy_sim_l6_fo_001',
      beneficialCustomer: 'family_office_001',
      tier: 'team',
      payloadFromTruth: (facts) => ({
        journey: 'buy',
        target_industry: facts.industry,
        target_jurisdiction: facts.jurisdiction,
        acquirer_type: 'family_office',
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: { journey: 'buy', target_industry: 'specialty manufacturing', target_jurisdiction: 'US-OH', acquirer_type: 'family_office' },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'buy', subJourney: 'healthy_buy_side' },
            missingFields: ['target_ebitda', 'rollover_pct', 'hold_horizon_years'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_target',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 2000_000_000,
            target_revenue_cents: 13000_000_000,
            naics: '332710',
            purchase_price_range_cents: { low: 15000_000_000, high: 17000_000_000 },
            rollover_pct: 0.30,
            hold_horizon_years: 15,
            no_fund_manager: true,
          }),
          expect: {
            responseType: 'classification_with_work',
            classification: { league: 'L6' },
            captureToState: ['parent_cid'],
          },
        },
        {
          step: 'compose_stack',
          tool: 'compose_model_stack',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: { responseType: 'classification_with_work', captureToState: ['applicable_models'] },
        },
        {
          step: 'execute_valuation',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.VAL.EBITDA.v1',
            inputs: { ebitda_cents: 2000_000_000, comparables_multiple_range: { low: 7.0, high: 8.5 } },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['valuation_output_hash', 'valuation_range'] },
        },
        {
          step: 'execute_rollover_721',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.STRUCT.ROLLOVER.v1',
            inputs: {
              rollover_cents: 4800_000_000,
              rollover_pct: 0.30,
              vehicle: 'newco_llc_units',
              tax_deferred_path: '721_contribution',
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['rollover_hash'] },
        },
        {
          step: 'execute_long_horizon_lbo',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.LBO.LMM.v1',
            inputs: {
              purchase_price_cents: 16000_000_000,
              debt_cents: 0,
              sponsor_equity_cents: 11200_000_000,
              entry_ebitda_cents: 2000_000_000,
              exit_multiple: 9.0,
              hold_years: 15,
              ebitda_growth_pct: 0.04,
              debt_paydown_cents: 0,
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['lbo_output_hash', 'fo_hold_irr'] },
        },
        {
          step: 'finalize_package',
          tool: 'finalize_deal_package',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: { responseType: 'classification_with_work', captureToState: ['package_id', 'merkle_root'] },
        },
      ],
    },

    // ─── SELL SIDE (Founder principal, rolling 30%) ──────
    {
      role: 'seller',
      agentIdentity: 'agent_sell_sim_l6_fo_001',
      beneficialCustomer: 'founder_seller_002',
      tier: 'pro',
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
          input: { journey: 'sell', seller_role: 'principal', industry: 'specialty manufacturing', jurisdiction: 'US-OH' },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'sell', subJourney: 'principal_seller' },
            missingFields: ['target_ebitda', 'entity_type', 'rollover_intention'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_target',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 2000_000_000,
            target_revenue_cents: 13000_000_000,
            naics: '332710',
            entity_type: 'llc_partnership',
            rollover_intention_pct: 0.30,
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
          step: 'execute_valuation',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.VAL.EBITDA.v1',
            inputs: { ebitda_cents: 2000_000_000, comparables_multiple_range: { low: 7.0, high: 8.5 } },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['valuation_output_hash', 'valuation_range'] },
        },
        {
          step: 'execute_rollover_721',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.STRUCT.ROLLOVER.v1',
            inputs: {
              rollover_cents: 4800_000_000,
              rollover_pct: 0.30,
              vehicle: 'newco_llc_units',
              tax_deferred_path: '721_contribution',
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['rollover_hash'] },
        },
        {
          step: 'execute_qoe',
          tool: 'execute_model',
          input: () => ({ model_id: 'MODEL.QOE.LITE.v1', inputs: { ebitda_cents: 2000_000_000 } }),
          expect: { responseType: 'classification_with_work', captureToState: ['normalized_ebitda_cents'] },
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
          expect: { responseType: 'classification_with_work', captureToState: ['package_id', 'merkle_root'] },
        },
      ],
    },
  ],

  symmetry: [
    { description: 'Valuation ranges overlap', field: 'valuation_range', mode: 'overlap', parties: ['buyer', 'seller'] },
    { description: 'Both sides cite §721 rollover authority', field: 'valuation_citation_refs', mode: 'subset', parties: ['buyer', 'seller'] },
    { description: 'Rollover math (30% units, $48M value) matches', field: 'rollover_hash', mode: 'equal', parties: ['buyer', 'seller'] },
    { description: 'Both sides return same methodology + spec version pins', field: 'methodology_version', mode: 'equal' },
  ],

  isolation: [
    { description: "Buyer's 15-year hold IRR never appears in seller substrate output", sourceField: 'fo_hold_irr', sourceParty: 'buyer', targetParty: 'seller' },
    { description: "Buyer's bid range never appears in seller substrate output", sourceField: 'purchase_price_range_cents', sourceParty: 'buyer', targetParty: 'seller' },
    { description: "Buyer's LBO assumptions never appear in seller substrate output", sourceField: 'lbo_output_hash', sourceParty: 'buyer', targetParty: 'seller' },
  ],

  refusals: [
    {
      description: 'Asking substrate to negotiate rollover percentage is refused',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'NEGOTIATION.RECOMMEND.v1', inputs: { rollover_pct: 0.35 } } },
      expectedRefusal: 'LINE_VIOLATION',
    },
    {
      description: 'Asking for a fairness opinion routes to counsel_review_required',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'OPINION.FAIRNESS.v1' } },
      expectedRefusal: 'counsel_review_required',
    },
  ],

  completion: [
    { party: 'buyer', endpoint: 'Reaches finalize_deal_package with rollover + long-horizon LBO', minAuditRows: 7, requiredFinalCalls: ['finalize_deal_package'] },
    { party: 'seller', endpoint: 'Reaches finalize_deal_package with rollover + QoE', minAuditRows: 7, requiredFinalCalls: ['finalize_deal_package'] },
  ],

  partyTiers: { buyer: 'team', seller: 'pro' },
};

export default sim;
