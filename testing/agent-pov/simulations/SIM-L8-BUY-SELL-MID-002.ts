/**
 * SIM-L8-BUY-SELL-MID-002 — L8 with full RWI stack (no escrow, walk-away).
 *
 * Underlying truth: SAMPLE_L8_WITH_RWI.
 * Buy side: PE sponsor with buyer-side RWI primary + excess, 0.5% retention.
 * Sell side: Founder/banker-led with full walk-away indemnity (ex-fundamentals).
 *
 * Substrate features:
 *  - M108 RWI primary architecture (professional_handoff)
 *  - M148 / fundamentals survival schedule
 *  - Indemnity ladder + escrow = 0 carve-out
 *  - Asymmetry: RWI premium cost-bearing is BUYER-only (or shared) — must not
 *    leak into seller substrate
 */

import type { DealSimulation } from '../types.js';
import { SAMPLE_L8_WITH_RWI } from '../data/sample-deal-facts.js';

const sim: DealSimulation = {
  id: 'SIM-L8-BUY-SELL-MID-002',
  description: 'L8 BUY-SELL with RWI stack — $45M EBITDA SaaS, $405M (9x), RWI primary $40M + excess $20M, 0.5% retention, no escrow, walk-away indemnity. Tests RWI substrate symmetry + cost-bearing isolation.',
  league: 'L8',
  journeys: ['buy', 'sell'],
  factPattern: SAMPLE_L8_WITH_RWI,

  parties: [
    {
      role: 'buyer',
      agentIdentity: 'agent_buy_sim_l8_rwi_001',
      beneficialCustomer: 'pe_sponsor_rwi_001',
      tier: 'enterprise',
      payloadFromTruth: (facts) => ({
        journey: 'buy',
        target_industry: facts.industry,
        target_jurisdiction: facts.jurisdiction,
        sponsor_type: 'megafund_pe',
        rwi_intent: true,
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: { journey: 'buy', target_industry: 'SaaS', target_jurisdiction: 'US-DE', rwi_intent: true },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'buy', subJourney: 'healthy_buy_side' },
            missingFields: ['target_ebitda', 'rwi_limit', 'rwi_retention'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_target',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 4500_000_000,
            target_revenue_cents: 18000_000_000,
            naics: '511210',
            purchase_price_range_cents: { low: 38000_000_000, high: 42000_000_000 },
            rwi_present: true,
            rwi_primary_limit_cents: 4000_000_000,
            rwi_excess_limit_cents: 2000_000_000,
            rwi_retention_pct: 0.005,
            indemnity_structure: 'walk_away_ex_fundamentals',
            election_type: '338(h)(10)',
          }),
          expect: { responseType: 'classification_with_work', classification: { league: 'L8' }, captureToState: ['parent_cid'] },
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
            inputs: { ebitda_cents: 4500_000_000, comparables_multiple_range: { low: 8.0, high: 10.0 } },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['valuation_output_hash', 'valuation_range'] },
        },
        {
          step: 'execute_rwi_stack',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.LEGAL.RWI_STACK.v1',
            inputs: {
              primary_limit_cents: 4000_000_000,
              excess_limit_cents: 2000_000_000,
              retention_pct: 0.005,
              premium_pct: 0.0265,
              transaction_value_cents: 40500_000_000,
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['rwi_stack_hash', 'rwi_premium_cents'] },
        },
        {
          step: 'execute_indemnity_ladder',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.LEGAL.INDEMNITY.LADDER.v1',
            inputs: { indemnity_structure: 'walk_away_ex_fundamentals', escrow_cents: 0 },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['indemnity_hash'] },
        },
        {
          step: 'execute_survival',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.LEGAL.SURVIVAL.PERIODS.v1',
            inputs: { rwi_present: true, fundamental_survival_months: 84 },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['survival_hash'] },
        },
        {
          step: 'execute_lbo',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.LBO.LMM.v1',
            inputs: {
              purchase_price_cents: 40500_000_000,
              debt_cents: 20250_000_000,
              sponsor_equity_cents: 16200_000_000,
              entry_ebitda_cents: 4500_000_000,
              exit_multiple: 11.0,
              hold_years: 5,
              ebitda_growth_pct: 0.10,
              debt_paydown_cents: 12000_000_000,
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['lbo_output_hash'] },
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
      role: 'seller',
      agentIdentity: 'agent_sell_sim_l8_rwi_001',
      beneficialCustomer: 'banker_seller_002',
      tier: 'team',
      payloadFromTruth: (facts) => ({
        journey: 'sell',
        seller_role: 'banker',
        industry: facts.industry,
        jurisdiction: facts.jurisdiction,
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: { journey: 'sell', seller_role: 'banker', industry: 'SaaS', jurisdiction: 'US-DE' },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'sell', subJourney: 'banker_led' },
            missingFields: ['target_ebitda', 'rwi_acceptance'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_target',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 4500_000_000,
            target_revenue_cents: 18000_000_000,
            naics: '511210',
            rwi_acceptance: true,
            indemnity_structure: 'walk_away_ex_fundamentals',
            election_type: '338(h)(10)',
          }),
          expect: { responseType: 'classification_with_work', classification: { league: 'L8' } },
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
            inputs: { ebitda_cents: 4500_000_000, comparables_multiple_range: { low: 8.0, high: 10.0 } },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['valuation_output_hash', 'valuation_range'] },
        },
        {
          step: 'execute_rwi_stack',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.LEGAL.RWI_STACK.v1',
            inputs: {
              primary_limit_cents: 4000_000_000,
              excess_limit_cents: 2000_000_000,
              retention_pct: 0.005,
              premium_pct: 0.0265,
              transaction_value_cents: 40500_000_000,
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['rwi_stack_hash'] },
        },
        {
          step: 'execute_indemnity_ladder',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.LEGAL.INDEMNITY.LADDER.v1',
            inputs: { indemnity_structure: 'walk_away_ex_fundamentals', escrow_cents: 0 },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['indemnity_hash'] },
        },
        {
          step: 'execute_survival',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.LEGAL.SURVIVAL.PERIODS.v1',
            inputs: { rwi_present: true, fundamental_survival_months: 84 },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['survival_hash'] },
        },
        {
          step: 'execute_qoe',
          tool: 'execute_model',
          input: () => ({ model_id: 'MODEL.QOE.LITE.v1', inputs: { ebitda_cents: 4500_000_000 } }),
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
    { description: 'RWI stack architecture (limits, retention) matches', field: 'rwi_stack_hash', mode: 'equal', parties: ['buyer', 'seller'] },
    { description: 'Indemnity ladder matches', field: 'indemnity_hash', mode: 'equal', parties: ['buyer', 'seller'] },
    { description: 'Survival periods match', field: 'survival_hash', mode: 'equal', parties: ['buyer', 'seller'] },
    { description: 'Both sides return same methodology + spec version pins', field: 'methodology_version', mode: 'equal' },
  ],

  isolation: [
    { description: "Buyer's LBO model never appears in seller substrate output", sourceField: 'lbo_output_hash', sourceParty: 'buyer', targetParty: 'seller' },
    { description: "Buyer's RWI premium dollar value (cost-bearing) never appears in seller substrate output", sourceField: 'rwi_premium_cents', sourceParty: 'buyer', targetParty: 'seller' },
    { description: "Buyer's bid range never appears in seller substrate output", sourceField: 'purchase_price_range_cents', sourceParty: 'buyer', targetParty: 'seller' },
  ],

  refusals: [
    {
      description: 'Asking substrate to negotiate RWI premium split is refused',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'NEGOTIATION.RECOMMEND.v1', inputs: { rwi_premium_split: 'buyer_pays_all' } } },
      expectedRefusal: 'LINE_VIOLATION',
    },
    {
      description: 'Asking for a fairness opinion routes to counsel_review_required',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'OPINION.FAIRNESS.v1' } },
      expectedRefusal: 'counsel_review_required',
    },
    {
      description: 'Asking substrate to bind RWI coverage with a broker is refused (unauthorized contact)',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'RWI.BIND_WITH_BROKER.v1' } },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'counterparty_contact',
    },
  ],

  completion: [
    { party: 'buyer', endpoint: 'Reaches finalize_deal_package with RWI stack + indemnity + LBO', minAuditRows: 8, requiredFinalCalls: ['finalize_deal_package'] },
    { party: 'seller', endpoint: 'Reaches finalize_deal_package with RWI stack + indemnity + QoE', minAuditRows: 8, requiredFinalCalls: ['finalize_deal_package'] },
  ],

  partyTiers: { buyer: 'enterprise', seller: 'team' },
};

export default sim;
