/**
 * SIM-RAISE-SEED-PRICED-001 — Seed priced round.
 *
 * Underlying truth: SAMPLE_RAISE_SEED_PRICED.
 * Issuer side: SaaS founder raising $4M priced ($16M pre / $20M post),
 *              1x non-participating preferred, 20% pre-money option pool.
 * Investor side: Lead seed fund + 3 co-investors.
 *
 * Substrate features:
 *  - MODEL.CAPTABLE.DILUTION.v1 — full priced-round waterfall including pre-money
 *    pool top-up dilution applied to founders
 *  - Both sides should converge on identical post-close cap-table percentages
 */

import type { DealSimulation } from '../types.js';
import { SAMPLE_RAISE_SEED_PRICED } from '../data/sample-deal-facts.js';

const sim: DealSimulation = {
  id: 'SIM-RAISE-SEED-PRICED-001',
  description: 'RAISE seed priced — $4M on $16M pre / $20M post, 1x non-participating, 20% pre-money pool. Tests M146 cap-table substrate symmetry + isolation.',
  league: 'L2',
  journeys: ['raise'],
  factPattern: SAMPLE_RAISE_SEED_PRICED,

  parties: [
    {
      role: 'issuer',
      agentIdentity: 'agent_issuer_sim_priced_001',
      beneficialCustomer: 'founder_issuer_002',
      tier: 'pro',
      payloadFromTruth: (facts) => ({
        journey: 'raise',
        raise_role: 'issuer',
        industry: facts.industry,
        jurisdiction: facts.jurisdiction,
        instrument: 'series_seed_preferred',
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: { journey: 'raise', raise_role: 'issuer', industry: 'SaaS', jurisdiction: 'US-DE', instrument: 'series_seed_preferred' },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'raise', subJourney: 'early_stage_raise' },
            missingFields: ['raise_amount', 'pre_money', 'liquidation_preference', 'option_pool'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_priced',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            raise_amount_cents: 400_000_000,
            pre_money_cents: 1600_000_000,
            post_money_cents: 2000_000_000,
            liquidation_preference: '1x_non_participating',
            option_pool_top_up_pct: 0.20,
            option_pool_placement: 'pre_money',
            target_revenue_cents: 80_000_000,
            founder_floor_pct: 0.55, // ISSUER-ONLY: walk-away
          }),
          expect: { responseType: 'classification_with_work', classification: { league: 'L2' } },
        },
        {
          step: 'compose_stack',
          tool: 'compose_model_stack',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: { responseType: 'classification_with_work', captureToState: ['applicable_models'] },
        },
        {
          step: 'execute_cap_table',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.CAPTABLE.DILUTION.v1',
            inputs: {
              raise_amount_cents: 400_000_000,
              pre_money_cents: 1600_000_000,
              option_pool_top_up_pct: 0.20,
              option_pool_placement: 'pre_money',
              liquidation_preference: '1x_non_participating',
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['cap_table_hash', 'founder_pct_post', 'investor_pct_post'] },
        },
        {
          step: 'execute_waterfall',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.STRUCT.EARNOUT.MC.v1',
            inputs: {
              waterfall_test: true,
              liquidation_preference: '1x_non_participating',
              investment_cents: 400_000_000,
              exit_scenarios_cents: [200_000_000, 1000_000_000, 5000_000_000, 20000_000_000],
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['waterfall_hash'] },
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
      role: 'investor',
      agentIdentity: 'agent_investor_sim_priced_001',
      beneficialCustomer: 'lead_seed_fund_001',
      tier: 'pro',
      payloadFromTruth: (facts) => ({
        journey: 'raise',
        raise_role: 'investor',
        industry: facts.industry,
        jurisdiction: facts.jurisdiction,
        instrument: 'series_seed_preferred',
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: { journey: 'raise', raise_role: 'investor', industry: 'SaaS', jurisdiction: 'US-DE', instrument: 'series_seed_preferred' },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'raise', subJourney: 'early_stage_raise' },
            missingFields: ['check_size', 'pre_money', 'liquidation_preference'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_priced',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            check_size_cents: 250_000_000, // $2.5M lead check
            pre_money_cents: 1600_000_000,
            post_money_cents: 2000_000_000,
            liquidation_preference: '1x_non_participating',
            option_pool_top_up_pct: 0.20,
            option_pool_placement: 'pre_money',
            target_revenue_cents: 80_000_000,
            investor_target_ownership_pct: 0.15, // INVESTOR-ONLY
          }),
          expect: { responseType: 'classification_with_work' },
        },
        {
          step: 'compose_stack',
          tool: 'compose_model_stack',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: { responseType: 'classification_with_work', captureToState: ['applicable_models'] },
        },
        {
          step: 'execute_cap_table',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.CAPTABLE.DILUTION.v1',
            inputs: {
              raise_amount_cents: 400_000_000,
              pre_money_cents: 1600_000_000,
              option_pool_top_up_pct: 0.20,
              option_pool_placement: 'pre_money',
              liquidation_preference: '1x_non_participating',
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['cap_table_hash', 'founder_pct_post', 'investor_pct_post'] },
        },
        {
          step: 'execute_waterfall',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.STRUCT.EARNOUT.MC.v1',
            inputs: {
              waterfall_test: true,
              liquidation_preference: '1x_non_participating',
              investment_cents: 400_000_000,
              exit_scenarios_cents: [200_000_000, 1000_000_000, 5000_000_000, 20000_000_000],
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['waterfall_hash'] },
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
    { description: 'Cap-table math (post-money pct) matches', field: 'cap_table_hash', mode: 'equal', parties: ['issuer', 'investor'] },
    { description: 'Founder post-close pct matches', field: 'founder_pct_post', mode: 'equal', parties: ['issuer', 'investor'] },
    { description: 'Investor post-close pct matches', field: 'investor_pct_post', mode: 'equal', parties: ['issuer', 'investor'] },
    { description: 'Liquidation waterfall identical across scenarios', field: 'waterfall_hash', mode: 'equal', parties: ['issuer', 'investor'] },
    { description: 'Both sides return same methodology + spec version pins', field: 'methodology_version', mode: 'equal' },
  ],

  isolation: [
    { description: "Issuer's founder_floor_pct (walk-away) never appears in investor substrate output", sourceField: 'founder_floor_pct', sourceParty: 'issuer', targetParty: 'investor' },
    { description: "Investor's target ownership pct never appears in issuer substrate output", sourceField: 'investor_target_ownership_pct', sourceParty: 'investor', targetParty: 'issuer' },
  ],

  refusals: [
    {
      description: 'Asking substrate to negotiate pre-money is refused',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'NEGOTIATION.RECOMMEND.v1', inputs: { pre_money_cents: 1400_000_000 } } },
      expectedRefusal: 'LINE_VIOLATION',
    },
    {
      description: 'Asking for a fairness opinion routes to counsel_review_required',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'OPINION.FAIRNESS.v1' } },
      expectedRefusal: 'counsel_review_required',
    },
    {
      description: 'Asking for paid investor matching is refused (LINE_VIOLATION paid_matching)',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'INTRO.INVESTOR.PAID.v1' } },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'paid_matching',
    },
  ],

  completion: [
    { party: 'issuer', endpoint: 'Reaches finalize_deal_package with cap-table + waterfall', minAuditRows: 6, requiredFinalCalls: ['finalize_deal_package'] },
    { party: 'investor', endpoint: 'Reaches finalize_deal_package with cap-table + waterfall', minAuditRows: 6, requiredFinalCalls: ['finalize_deal_package'] },
  ],

  partyTiers: { issuer: 'pro', investor: 'pro' },
};

export default sim;
