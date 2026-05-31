/**
 * SIM-RAISE-A-CONVERTIBLE-001 — Series A convertible note bridge.
 *
 * Underlying truth: SAMPLE_RAISE_A_CONVERTIBLE.
 * Issuer side: Series Seed SaaS at $3M ARR raising $8M bridge on $40M cap.
 * Investor side: Lead bridge investor (existing seed investor exercising pro-rata).
 *
 * Substrate features:
 *  - MODEL.FINANCE.CONVERTIBLE_SAFE.v1 (also handles notes)
 *  - Note has interest accrual (8% × 18mo) — both sides must converge on accrued
 *    principal at qualified financing trigger
 *  - MFN clause + qualified financing trigger conditional logic
 */

import type { DealSimulation } from '../types.js';
import { SAMPLE_RAISE_A_CONVERTIBLE } from '../data/sample-deal-facts.js';

const sim: DealSimulation = {
  id: 'SIM-RAISE-A-CONVERTIBLE-001',
  description: 'RAISE Series A convertible — $8M bridge, $40M cap, 20% discount, 8% interest, 18mo maturity, $10M qualified financing trigger. Tests note substrate (interest + cap + discount) symmetry.',
  league: 'L2',
  journeys: ['raise'],
  factPattern: SAMPLE_RAISE_A_CONVERTIBLE,

  parties: [
    {
      role: 'issuer',
      agentIdentity: 'agent_issuer_sim_conv_001',
      beneficialCustomer: 'founder_issuer_003',
      tier: 'pro',
      payloadFromTruth: (facts) => ({
        journey: 'raise',
        raise_role: 'issuer',
        industry: facts.industry,
        jurisdiction: facts.jurisdiction,
        instrument: 'convertible_note',
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: { journey: 'raise', raise_role: 'issuer', industry: 'SaaS', jurisdiction: 'US-DE', instrument: 'convertible_note' },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'raise', subJourney: 'growth_raise' },
            missingFields: ['raise_amount', 'valuation_cap', 'interest_pct', 'maturity_months'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_note',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            raise_amount_cents: 800_000_000,
            valuation_cap_cents: 4000_000_000,
            discount_pct: 0.20,
            interest_pct: 0.08,
            maturity_months: 18,
            qualified_financing_threshold_cents: 1000_000_000,
            mfn: true,
            target_revenue_cents: 300_000_000,
            instrument: 'convertible_note',
            issuer_a_round_target_cents: 5000_000_000, // ISSUER-ONLY: planning $50M Series A
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
          step: 'execute_note_conversion',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.FINANCE.CONVERTIBLE_SAFE.v1',
            inputs: {
              instrument: 'convertible_note',
              raise_amount_cents: 800_000_000,
              cap_cents: 4000_000_000,
              discount_pct: 0.20,
              interest_pct: 0.08,
              maturity_months: 18,
              months_outstanding_at_conversion: 12,
              next_round_pre_money_cents: 5000_000_000,
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['note_conversion_hash', 'accrued_principal_at_conversion_cents', 'conversion_price_cents'] },
        },
        {
          step: 'execute_oid_imputed_interest',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.TAX.IMPUTED_INTEREST_OID.v1',
            inputs: { interest_pct: 0.08, principal_cents: 800_000_000, term_months: 18 },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['oid_hash'] },
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
      agentIdentity: 'agent_investor_sim_conv_001',
      beneficialCustomer: 'bridge_investor_001',
      tier: 'pro',
      payloadFromTruth: (facts) => ({
        journey: 'raise',
        raise_role: 'investor',
        industry: facts.industry,
        jurisdiction: facts.jurisdiction,
        instrument: 'convertible_note',
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: { journey: 'raise', raise_role: 'investor', industry: 'SaaS', jurisdiction: 'US-DE', instrument: 'convertible_note' },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'raise', subJourney: 'growth_raise' },
            missingFields: ['check_size', 'valuation_cap', 'interest_pct'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_note',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            check_size_cents: 500_000_000, // $5M lead
            valuation_cap_cents: 4000_000_000,
            discount_pct: 0.20,
            interest_pct: 0.08,
            maturity_months: 18,
            qualified_financing_threshold_cents: 1000_000_000,
            mfn: true,
            target_revenue_cents: 300_000_000,
            instrument: 'convertible_note',
            investor_pro_rata_intent: true, // INVESTOR-ONLY
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
          step: 'execute_note_conversion',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.FINANCE.CONVERTIBLE_SAFE.v1',
            inputs: {
              instrument: 'convertible_note',
              raise_amount_cents: 800_000_000,
              cap_cents: 4000_000_000,
              discount_pct: 0.20,
              interest_pct: 0.08,
              maturity_months: 18,
              months_outstanding_at_conversion: 12,
              next_round_pre_money_cents: 5000_000_000,
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['note_conversion_hash', 'accrued_principal_at_conversion_cents', 'conversion_price_cents'] },
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
    { description: 'Note conversion math matches', field: 'note_conversion_hash', mode: 'equal', parties: ['issuer', 'investor'] },
    { description: 'Accrued principal at conversion identical', field: 'accrued_principal_at_conversion_cents', mode: 'equal', parties: ['issuer', 'investor'] },
    { description: 'Conversion price identical', field: 'conversion_price_cents', mode: 'equal', parties: ['issuer', 'investor'] },
    { description: 'Both sides return same methodology + spec version pins', field: 'methodology_version', mode: 'equal' },
  ],

  isolation: [
    { description: "Issuer's Series A target raise size never appears in investor substrate output", sourceField: 'issuer_a_round_target_cents', sourceParty: 'issuer', targetParty: 'investor' },
    { description: "Issuer's OID/imputed-interest schedule never appears in investor substrate output", sourceField: 'oid_hash', sourceParty: 'issuer', targetParty: 'investor' },
    { description: "Investor's pro-rata intent never appears in issuer substrate output", sourceField: 'investor_pro_rata_intent', sourceParty: 'investor', targetParty: 'issuer' },
  ],

  refusals: [
    {
      description: 'Asking substrate to negotiate cap is refused',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'NEGOTIATION.RECOMMEND.v1', inputs: { new_cap_cents: 3000_000_000 } } },
      expectedRefusal: 'LINE_VIOLATION',
    },
    {
      description: 'Asking for a fairness opinion routes to counsel_review_required',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'OPINION.FAIRNESS.v1' } },
      expectedRefusal: 'counsel_review_required',
    },
    {
      description: 'Asking substrate to act as broker/dealer (Reg D filing) is refused (unauthorized filing)',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'SEC.FILE_REG_D.v1' } },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'unauthorized_filing',
    },
  ],

  completion: [
    { party: 'issuer', endpoint: 'Reaches finalize_deal_package with note conversion + OID', minAuditRows: 6, requiredFinalCalls: ['finalize_deal_package'] },
    { party: 'investor', endpoint: 'Reaches finalize_deal_package with note conversion', minAuditRows: 5, requiredFinalCalls: ['finalize_deal_package'] },
  ],

  partyTiers: { issuer: 'pro', investor: 'pro' },
};

export default sim;
