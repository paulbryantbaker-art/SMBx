/**
 * SIM-L6-BUY-SELL-ESOP-001 — L6 trustee-led leveraged ESOP.
 *
 * Underlying truth: SAMPLE_L6_ESOP_TRUSTEE_LED.
 * Buy side: Institutional ESOP trustee acting as fiduciary for plan participants.
 *           Mandate is to ensure adequate consideration under ERISA / DOL guidance.
 * Sell side: Selling shareholders pursuing §1042 deferral via QRP reinvestment.
 *
 * Substrate features:
 *  - M102 (ESOP §1042 deferral) + M118 (leveraged ESOP cash flow)
 *  - Trustee is owner_rep equivalent (fiduciary, not principal investor)
 *  - "Adequate consideration" is research_only / handoff — substrate cannot
 *    produce a fairness opinion; refusal expected
 *  - Warrant participation (35%) modeled in cap-table
 */

import type { DealSimulation } from '../types.js';
import { SAMPLE_L6_ESOP_TRUSTEE_LED } from '../data/sample-deal-facts.js';

const sim: DealSimulation = {
  id: 'SIM-L6-BUY-SELL-ESOP-001',
  description: 'L6 BUY-SELL leveraged ESOP — $15M EBITDA pro services, $105M EV, trustee-led, §1042 deferral, senior+mezz+warrants. Tests M118 cash flow, M102 §1042, and trustee-as-fiduciary refusal envelope.',
  league: 'L6',
  journeys: ['buy', 'sell'],
  factPattern: SAMPLE_L6_ESOP_TRUSTEE_LED,

  parties: [
    // ─── BUY SIDE (Institutional ESOP trustee) ───────────
    {
      role: 'buyer',
      agentIdentity: 'agent_buy_sim_l6_esop_001',
      beneficialCustomer: 'esop_trustee_001',
      tier: 'team',
      payloadFromTruth: (facts) => ({
        journey: 'buy',
        target_industry: facts.industry,
        target_jurisdiction: facts.jurisdiction,
        transaction_type: 'esop',
        trustee_role: 'institutional_trustee',
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: { journey: 'buy', target_industry: 'professional services', target_jurisdiction: 'US-IL', transaction_type: 'esop' },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'buy', subJourney: 'healthy_buy_side' },
            missingFields: ['target_ebitda', 'entity_type', 'warrant_pct', 'repurchase_obligation_years'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_target',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 1500_000_000,
            target_revenue_cents: 8500_000_000,
            naics: '541611',
            purchase_price_range_cents: { low: 9500_000_000, high: 11000_000_000 },
            entity_type: 'c_corp',
            warrant_pct: 0.35,
            repurchase_obligation_years: 10,
            section_1042_election_pursued: true,
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
            inputs: { ebitda_cents: 1500_000_000, comparables_multiple_range: { low: 6.5, high: 7.5 } },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['valuation_output_hash', 'valuation_range'] },
        },
        {
          step: 'execute_esop_cashflow',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.DSCR.STRESS.v1',
            inputs: {
              senior_debt_cents: 6300_000_000,
              sub_debt_cents: 4200_000_000,
              entry_ebitda_cents: 1500_000_000,
              repurchase_obligation_years: 10,
              esop_specific: true,
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['esop_cashflow_hash'] },
        },
        {
          step: 'execute_warrant_dilution',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.CAPTABLE.DILUTION.v1',
            inputs: { warrants_pct: 0.35, esop_fully_diluted: true },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['warrant_dilution_hash'] },
        },
        {
          step: 'finalize_package',
          tool: 'finalize_deal_package',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: { responseType: 'classification_with_work', captureToState: ['package_id', 'merkle_root'] },
        },
      ],
    },

    // ─── SELL SIDE (Selling shareholders pursuing §1042) ──
    {
      role: 'seller',
      agentIdentity: 'agent_sell_sim_l6_esop_001',
      beneficialCustomer: 'selling_shareholders_esop_001',
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
          input: { journey: 'sell', seller_role: 'principal', industry: 'professional services', jurisdiction: 'US-IL' },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'sell', subJourney: 'principal_seller' },
            missingFields: ['target_ebitda', 'entity_type', 'transaction_intent'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_target',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 1500_000_000,
            target_revenue_cents: 8500_000_000,
            naics: '541611',
            entity_type: 'c_corp',
            transaction_intent: 'esop_1042',
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
            inputs: { ebitda_cents: 1500_000_000, comparables_multiple_range: { low: 6.5, high: 7.5 } },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['valuation_output_hash', 'valuation_range'] },
        },
        {
          step: 'execute_1042_deferral',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.TAX.TRANSACTION.MASTER.v1',
            inputs: {
              transaction_type: 'esop',
              section_1042_election: true,
              qrp_required: true,
              post_sale_ownership_pct: 0,
              c_corp_required: true,
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['sec_1042_hash'] },
        },
        {
          step: 'execute_qoe',
          tool: 'execute_model',
          input: () => ({ model_id: 'MODEL.QOE.LITE.v1', inputs: { ebitda_cents: 1500_000_000 } }),
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
    { description: 'Both sides cite §1042 / DOL ESOP authorities as appropriate', field: 'valuation_citation_refs', mode: 'subset', parties: ['buyer', 'seller'] },
    { description: 'Both sides return same methodology + spec version pins', field: 'methodology_version', mode: 'equal' },
  ],

  isolation: [
    { description: "Trustee's ESOP cash-flow / DSCR model never appears in seller substrate output", sourceField: 'esop_cashflow_hash', sourceParty: 'buyer', targetParty: 'seller' },
    { description: "Trustee's warrant dilution never appears in seller substrate output", sourceField: 'warrant_dilution_hash', sourceParty: 'buyer', targetParty: 'seller' },
    { description: "Seller's §1042 personal-tax election never appears in trustee substrate output", sourceField: 'sec_1042_hash', sourceParty: 'seller', targetParty: 'buyer' },
  ],

  refusals: [
    {
      description: 'Asking substrate for an adequate-consideration / fairness opinion routes to counsel_review_required',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'OPINION.FAIRNESS.v1' } },
      expectedRefusal: 'counsel_review_required',
    },
    {
      description: 'Asking substrate to negotiate on behalf of trustee or sellers is refused',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'NEGOTIATION.RECOMMEND.v1', inputs: { adequate_consideration: 1050000000 } } },
      expectedRefusal: 'LINE_VIOLATION',
    },
    {
      description: 'Asking to file §1042 election directly is refused (unauthorized filing)',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'IRS.FILE_1042.v1' } },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'unauthorized_filing',
    },
  ],

  completion: [
    { party: 'buyer', endpoint: 'Reaches finalize_deal_package with ESOP cash-flow + warrant dilution', minAuditRows: 7, requiredFinalCalls: ['finalize_deal_package'] },
    { party: 'seller', endpoint: 'Reaches finalize_deal_package with §1042 deferral schedule + QoE', minAuditRows: 7, requiredFinalCalls: ['finalize_deal_package'] },
  ],

  partyTiers: { buyer: 'team', seller: 'pro' },
};

export default sim;
