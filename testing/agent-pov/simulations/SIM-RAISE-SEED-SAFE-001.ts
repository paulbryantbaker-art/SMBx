/**
 * SIM-RAISE-SEED-SAFE-001 — Seed SAFE round.
 *
 * Underlying truth: SAMPLE_RAISE_SEED_SAFE.
 * Issuer side: SaaS founder raising $2M on $10M post-money cap, 20% discount, MFN.
 * Investor side: Seed fund evaluating the SAFE for its portfolio mandate.
 *
 * Substrate features:
 *  - MODEL.FINANCE.CONVERTIBLE_SAFE.v1 — SAFE conversion mechanics, MFN handling
 *  - MODEL.CAPTABLE.DILUTION.v1 — issuer-side dilution at next round
 *  - Symmetry: dilution math at conversion event matches between sides
 *  - Isolation: issuer's reservation valuation never reaches investor; investor's
 *    portfolio-fit / hurdle never reaches issuer
 */

import type { DealSimulation } from '../types.js';
import { SAMPLE_RAISE_SEED_SAFE } from '../data/sample-deal-facts.js';

const sim: DealSimulation = {
  id: 'SIM-RAISE-SEED-SAFE-001',
  description: 'RAISE seed SAFE — $2M on $10M post-money cap, 20% discount, MFN. Tests SAFE substrate symmetry (dilution math) + issuer/investor isolation.',
  league: 'L2',
  journeys: ['raise'],
  factPattern: SAMPLE_RAISE_SEED_SAFE,

  parties: [
    // ─── ISSUER SIDE ─────────────────────────────────────
    {
      role: 'issuer',
      agentIdentity: 'agent_issuer_sim_safe_001',
      beneficialCustomer: 'founder_issuer_001',
      tier: 'solo',
      payloadFromTruth: (facts) => ({
        journey: 'raise',
        raise_role: 'issuer',
        industry: facts.industry,
        jurisdiction: facts.jurisdiction,
        instrument: 'safe',
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: { journey: 'raise', raise_role: 'issuer', industry: 'SaaS', jurisdiction: 'US-DE', instrument: 'safe' },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'raise', subJourney: 'early_stage_raise' },
            missingFields: ['raise_amount', 'valuation_cap', 'discount'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_safe',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            raise_amount_cents: 200_000_000,
            post_money_cap_cents: 1000_000_000,
            discount_pct: 0.20,
            mfn: true,
            instrument: 'safe',
            target_revenue_cents: 30_000_000,
            reservation_valuation_cents: 1200_000_000, // ISSUER-ONLY: founder's actual reservation
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
          step: 'execute_safe_conversion',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.FINANCE.CONVERTIBLE_SAFE.v1',
            inputs: {
              raise_amount_cents: 200_000_000,
              cap_cents: 1000_000_000,
              discount_pct: 0.20,
              mfn: true,
              next_round_pre_money_cents: 1500_000_000,
              next_round_size_cents: 800_000_000,
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['safe_conversion_hash', 'dilution_pct'] },
        },
        {
          step: 'execute_cap_table',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.CAPTABLE.DILUTION.v1',
            inputs: {
              safe_raised_cents: 200_000_000,
              safe_cap_cents: 1000_000_000,
              founder_ownership_pre_pct: 0.85,
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['cap_table_hash'] },
        },
        {
          step: 'finalize_package',
          tool: 'finalize_deal_package',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: { responseType: 'classification_with_work', captureToState: ['package_id', 'merkle_root'] },
        },
      ],
    },

    // ─── INVESTOR SIDE ───────────────────────────────────
    {
      role: 'investor',
      agentIdentity: 'agent_investor_sim_safe_001',
      beneficialCustomer: 'seed_fund_001',
      tier: 'pro',
      payloadFromTruth: (facts) => ({
        journey: 'raise',
        raise_role: 'investor',
        industry: facts.industry,
        jurisdiction: facts.jurisdiction,
        instrument: 'safe',
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: { journey: 'raise', raise_role: 'investor', industry: 'SaaS', jurisdiction: 'US-DE', instrument: 'safe' },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'raise', subJourney: 'early_stage_raise' },
            missingFields: ['check_size', 'valuation_cap', 'mfn'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_safe',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            check_size_cents: 50_000_000, // $500K check
            offered_cap_cents: 1000_000_000,
            discount_pct: 0.20,
            mfn: true,
            instrument: 'safe',
            target_revenue_cents: 30_000_000,
            investor_hurdle_irr: 0.40, // INVESTOR-ONLY
            portfolio_fit_score: 0.85, // INVESTOR-ONLY
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
          step: 'execute_safe_conversion',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.FINANCE.CONVERTIBLE_SAFE.v1',
            inputs: {
              raise_amount_cents: 200_000_000,
              cap_cents: 1000_000_000,
              discount_pct: 0.20,
              mfn: true,
              next_round_pre_money_cents: 1500_000_000,
              next_round_size_cents: 800_000_000,
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['safe_conversion_hash', 'dilution_pct'] },
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
    { description: 'SAFE conversion math (dilution at next round) matches between issuer + investor', field: 'safe_conversion_hash', mode: 'equal', parties: ['issuer', 'investor'] },
    { description: 'Dilution pct identical', field: 'dilution_pct', mode: 'equal', parties: ['issuer', 'investor'] },
    { description: 'Both sides return same methodology + spec version pins', field: 'methodology_version', mode: 'equal' },
  ],

  isolation: [
    { description: "Issuer's reservation_valuation never appears in investor substrate output", sourceField: 'reservation_valuation_cents', sourceParty: 'issuer', targetParty: 'investor' },
    { description: "Issuer's founder cap-table never appears in investor substrate output", sourceField: 'cap_table_hash', sourceParty: 'issuer', targetParty: 'investor' },
    { description: "Investor's hurdle IRR never appears in issuer substrate output", sourceField: 'investor_hurdle_irr', sourceParty: 'investor', targetParty: 'issuer' },
    { description: "Investor's portfolio_fit_score never appears in issuer substrate output", sourceField: 'portfolio_fit_score', sourceParty: 'investor', targetParty: 'issuer' },
  ],

  refusals: [
    {
      description: 'Asking substrate to negotiate cap/discount is refused (LINE_VIOLATION)',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'NEGOTIATION.RECOMMEND.v1', inputs: { new_cap_cents: 800_000_000 } } },
      expectedRefusal: 'LINE_VIOLATION',
    },
    {
      description: 'Asking for a fairness opinion routes to counsel_review_required',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'OPINION.FAIRNESS.v1' } },
      expectedRefusal: 'counsel_review_required',
    },
    {
      description: 'Asking for paid investor matching is refused (LINE_VIOLATION paid_matching)',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'INTRO.INVESTOR.PAID.v1', inputs: { success_fee_pct: 0.05 } } },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'paid_matching',
    },
  ],

  completion: [
    { party: 'issuer', endpoint: 'Reaches finalize_deal_package with SAFE conversion + cap-table', minAuditRows: 6, requiredFinalCalls: ['finalize_deal_package'] },
    { party: 'investor', endpoint: 'Reaches finalize_deal_package with SAFE conversion math', minAuditRows: 5, requiredFinalCalls: ['finalize_deal_package'] },
  ],

  partyTiers: { issuer: 'solo', investor: 'pro' },
};

export default sim;
