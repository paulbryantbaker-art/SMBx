/**
 * SIM-L6-BUY-SELL-IS-001 — L6 independent sponsor syndicating capital.
 *
 * Underlying truth: SAMPLE_L6_INDEPENDENT_SPONSOR.
 * Buy side: Independent sponsor with LOI in hand, syndicating equity from
 *           family-office and fund-less-sponsor LPs. Tiered promote 10/20/30.
 * Sell side: Founder-led HVAC services platform with §338(h)(10) consent.
 *
 * Tests M116 tiered-promote substrate + IS fee architecture (closing fee
 * + ongoing management fee) plus the asymmetry where the LP-facing waterfall
 * is materially BUYER ONLY — sellers should never see promote/catchup terms.
 */

import type { DealSimulation } from '../types.js';
import { SAMPLE_L6_INDEPENDENT_SPONSOR } from '../data/sample-deal-facts.js';

const sim: DealSimulation = {
  id: 'SIM-L6-BUY-SELL-IS-001',
  description: 'L6 BUY-SELL independent sponsor — $12M EBITDA HVAC, $84M deal, IS syndicating equity from FOs with tiered promote 10/20/30 over 8/15/25% IRR hurdles. Tests M116 promote substrate + LP-side isolation.',
  league: 'L6',
  journeys: ['buy', 'sell'],
  factPattern: SAMPLE_L6_INDEPENDENT_SPONSOR,

  parties: [
    // ─── BUY SIDE (Independent sponsor) ──────────────────
    {
      role: 'buyer',
      agentIdentity: 'agent_buy_sim_l6_is_001',
      beneficialCustomer: 'independent_sponsor_001',
      tier: 'pro',
      payloadFromTruth: (facts) => ({
        journey: 'buy',
        target_industry: facts.industry,
        target_jurisdiction: facts.jurisdiction,
        sponsor_type: 'independent_sponsor',
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: { journey: 'buy', target_industry: 'HVAC services', target_jurisdiction: 'US-FL', sponsor_type: 'independent_sponsor' },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'buy', subJourney: 'healthy_buy_side' },
            missingFields: ['target_ebitda', 'promote_tiers', 'is_fees'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_target',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 1200_000_000,
            target_revenue_cents: 6500_000_000,
            naics: '238220',
            purchase_price_range_cents: { low: 7500_000_000, high: 9000_000_000 },
            election_type: '338(h)(10)',
            sponsor_type: 'independent_sponsor',
            is_closing_fee_cents: 84_000_000,
            is_management_fee_cents: 50_000_000,
            promote_tiers: [
              { hurdle_irr: 0.08, promote_pct: 0.10 },
              { hurdle_irr: 0.15, promote_pct: 0.20 },
              { hurdle_irr: 0.25, promote_pct: 0.30 },
            ],
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
            inputs: { ebitda_cents: 1200_000_000, comparables_multiple_range: { low: 6.5, high: 7.5 } },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['valuation_output_hash', 'valuation_range'] },
        },
        {
          step: 'execute_promote_waterfall',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.CAPTABLE.DILUTION.v1',
            inputs: {
              is_promote_structure: true,
              promote_tiers: [
                { hurdle_irr: 0.08, promote_pct: 0.10 },
                { hurdle_irr: 0.15, promote_pct: 0.20 },
                { hurdle_irr: 0.25, promote_pct: 0.30 },
              ],
              catch_up_pct: 1.0,
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['promote_waterfall_hash'] },
        },
        {
          step: 'execute_lbo',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.LBO.LMM.v1',
            inputs: {
              purchase_price_cents: 8400_000_000,
              debt_cents: 4800_000_000,
              sponsor_equity_cents: 3600_000_000,
              entry_ebitda_cents: 1200_000_000,
              exit_multiple: 8.5,
              hold_years: 5,
              ebitda_growth_pct: 0.07,
              debt_paydown_cents: 2400_000_000,
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

    // ─── SELL SIDE (Founder principal) ───────────────────
    {
      role: 'seller',
      agentIdentity: 'agent_sell_sim_l6_is_001',
      beneficialCustomer: 'founder_seller_003',
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
          input: { journey: 'sell', seller_role: 'principal', industry: 'HVAC services', jurisdiction: 'US-FL' },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'sell', subJourney: 'principal_seller' },
            missingFields: ['target_ebitda', 'entity_type'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_target',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 1200_000_000,
            target_revenue_cents: 6500_000_000,
            naics: '238220',
            entity_type: 'llc_partnership',
            election_type: '338(h)(10)',
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
            inputs: { ebitda_cents: 1200_000_000, comparables_multiple_range: { low: 6.5, high: 7.5 } },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['valuation_output_hash', 'valuation_range'] },
        },
        {
          step: 'execute_qoe',
          tool: 'execute_model',
          input: () => ({ model_id: 'MODEL.QOE.LITE.v1', inputs: { ebitda_cents: 1200_000_000 } }),
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
    { description: 'Both sides cite §338(h)(10) authority', field: 'valuation_citation_refs', mode: 'subset', parties: ['buyer', 'seller'] },
    { description: 'Both sides return same methodology + spec version pins', field: 'methodology_version', mode: 'equal' },
  ],

  isolation: [
    { description: "Buyer's promote-waterfall (LP-facing) never appears in seller substrate output", sourceField: 'promote_waterfall_hash', sourceParty: 'buyer', targetParty: 'seller' },
    { description: "Buyer's IS closing fee never appears in seller substrate output", sourceField: 'is_closing_fee_cents', sourceParty: 'buyer', targetParty: 'seller' },
    { description: "Buyer's LBO assumptions never appear in seller substrate output", sourceField: 'lbo_output_hash', sourceParty: 'buyer', targetParty: 'seller' },
  ],

  refusals: [
    {
      description: 'Asking substrate to negotiate promote terms with LP investors is refused',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'NEGOTIATION.RECOMMEND.v1', inputs: { promote_pct: 0.25 } } },
      expectedRefusal: 'LINE_VIOLATION',
    },
    {
      description: 'Asking for a fairness opinion routes to counsel_review_required',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'OPINION.FAIRNESS.v1' } },
      expectedRefusal: 'counsel_review_required',
    },
    {
      description: 'Asking for paid LP matching is refused (LINE_VIOLATION paid_matching)',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'INTRO.LP.PAID.v1', inputs: { fee_pct: 0.02 } } },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'paid_matching',
      parties: ['buyer'],
    },
  ],

  completion: [
    { party: 'buyer', endpoint: 'Reaches finalize_deal_package with promote waterfall + LBO', minAuditRows: 7, requiredFinalCalls: ['finalize_deal_package'] },
    { party: 'seller', endpoint: 'Reaches finalize_deal_package with valuation + QoE', minAuditRows: 7, requiredFinalCalls: ['finalize_deal_package'] },
  ],

  partyTiers: { buyer: 'pro', seller: 'solo' },
};

export default sim;
