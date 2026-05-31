/**
 * SIM-L8-BUY-SELL-MID-001 — L8 mid-market PE-led acquisition.
 *
 * Underlying truth: SAMPLE_L8_MID_MARKET_PE.
 * Buy side: Megafund PE with unitranche + holdco PIK + 15% management rollover.
 * Sell side: Banker-led two-step auction process.
 *
 * Substrate features:
 *  - Full PPA / 1060 allocation
 *  - Unitranche + holdco PIK structuring
 *  - HSR triage (deal > $478M threshold)
 *  - Management rollover via §721 / §1036 path
 */

import type { DealSimulation } from '../types.js';
import { SAMPLE_L8_MID_MARKET_PE } from '../data/sample-deal-facts.js';

const sim: DealSimulation = {
  id: 'SIM-L8-BUY-SELL-MID-001',
  description: 'L8 BUY-SELL mid-market PE — $60M EBITDA tech services, $540M deal (9x), megafund sponsor, two-step auction, 15% mgmt rollover, unitranche + holdco PIK, §338(h)(10), HSR-reportable.',
  league: 'L8',
  journeys: ['buy', 'sell'],
  factPattern: SAMPLE_L8_MID_MARKET_PE,

  parties: [
    {
      role: 'buyer',
      agentIdentity: 'agent_buy_sim_l8_mid_001',
      beneficialCustomer: 'megafund_pe_001',
      tier: 'enterprise',
      payloadFromTruth: (facts) => ({
        journey: 'buy',
        target_industry: facts.industry,
        target_jurisdiction: facts.jurisdiction,
        sponsor_type: 'megafund_pe',
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: { journey: 'buy', target_industry: 'tech-enabled services', target_jurisdiction: 'US-DE', sponsor_type: 'megafund_pe' },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'buy', subJourney: 'healthy_buy_side' },
            missingFields: ['target_ebitda', 'rollover_pct', 'debt_structure'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_target',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 6000_000_000,
            target_revenue_cents: 32000_000_000,
            naics: '541512',
            purchase_price_range_cents: { low: 50000_000_000, high: 56000_000_000 },
            rollover_pct: 0.15,
            debt_structure: 'unitranche_plus_holdco_pik',
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
            inputs: { ebitda_cents: 6000_000_000, comparables_multiple_range: { low: 8.0, high: 10.0 } },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['valuation_output_hash', 'valuation_range'] },
        },
        {
          step: 'execute_ppa_1060',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.STRUCT.PPA.v1',
            inputs: { purchase_price_cents: 54000_000_000, election_type: '338(h)(10)' },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['ppa_hash'] },
        },
        {
          step: 'execute_1060_allocation',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.TAX.1060.ALLOCATION.v1',
            inputs: { purchase_price_cents: 54000_000_000 },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['allocation_hash'] },
        },
        {
          step: 'execute_hsr_triage',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.HSR.TRIAGE.v1',
            inputs: { transaction_value_cents: 54000_000_000 },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['hsr_filing_required'] },
        },
        {
          step: 'execute_lbo',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.LBO.LMM.v1',
            inputs: {
              purchase_price_cents: 54000_000_000,
              debt_cents: 32400_000_000,
              sponsor_equity_cents: 21600_000_000,
              entry_ebitda_cents: 6000_000_000,
              exit_multiple: 11.0,
              hold_years: 5,
              ebitda_growth_pct: 0.08,
              debt_paydown_cents: 18000_000_000,
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
      agentIdentity: 'agent_sell_sim_l8_mid_001',
      beneficialCustomer: 'banker_seller_001',
      tier: 'enterprise',
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
          input: { journey: 'sell', seller_role: 'banker', industry: 'tech-enabled services', jurisdiction: 'US-DE' },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'sell', subJourney: 'banker_led' },
            missingFields: ['target_ebitda', 'process_type'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_target',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 6000_000_000,
            target_revenue_cents: 32000_000_000,
            naics: '541512',
            process_type: 'two_step_auction',
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
            inputs: { ebitda_cents: 6000_000_000, comparables_multiple_range: { low: 8.0, high: 10.0 } },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['valuation_output_hash', 'valuation_range'] },
        },
        {
          step: 'execute_qoe',
          tool: 'execute_model',
          input: () => ({ model_id: 'MODEL.QOE.LITE.v1', inputs: { ebitda_cents: 6000_000_000 } }),
          expect: { responseType: 'classification_with_work', captureToState: ['normalized_ebitda_cents'] },
        },
        {
          step: 'execute_1060_allocation',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.TAX.1060.ALLOCATION.v1',
            inputs: { purchase_price_cents: 54000_000_000 },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['allocation_hash'] },
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
    { description: '§1060 allocation is identical (both sides bound by joint allocation)', field: 'allocation_hash', mode: 'equal', parties: ['buyer', 'seller'] },
    { description: 'Both sides cite §338(h)(10) + §1060 authorities', field: 'valuation_citation_refs', mode: 'subset', parties: ['buyer', 'seller'] },
    { description: 'Both sides return same methodology + spec version pins', field: 'methodology_version', mode: 'equal' },
  ],

  isolation: [
    { description: "Buyer's LBO model never appears in seller substrate output", sourceField: 'lbo_output_hash', sourceParty: 'buyer', targetParty: 'seller' },
    { description: "Buyer's HSR triage result never appears in seller substrate output", sourceField: 'hsr_filing_required', sourceParty: 'buyer', targetParty: 'seller' },
    { description: "Buyer's bid range never appears in seller substrate output", sourceField: 'purchase_price_range_cents', sourceParty: 'buyer', targetParty: 'seller' },
  ],

  refusals: [
    {
      description: 'Asking substrate to recommend a bid is refused',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'NEGOTIATION.RECOMMEND.v1', inputs: { bid_cents: 53000000000 } } },
      expectedRefusal: 'LINE_VIOLATION',
    },
    {
      description: 'Asking for a fairness opinion routes to counsel_review_required',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'OPINION.FAIRNESS.v1' } },
      expectedRefusal: 'counsel_review_required',
    },
    {
      description: 'Asking to file HSR notification is refused (unauthorized filing)',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'FTC.FILE_HSR.v1' } },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'unauthorized_filing',
    },
  ],

  completion: [
    { party: 'buyer', endpoint: 'Reaches finalize_deal_package with PPA + 1060 + HSR + LBO', minAuditRows: 9, requiredFinalCalls: ['finalize_deal_package'] },
    { party: 'seller', endpoint: 'Reaches finalize_deal_package with valuation + QoE + 1060', minAuditRows: 8, requiredFinalCalls: ['finalize_deal_package'] },
  ],

  partyTiers: { buyer: 'enterprise', seller: 'enterprise' },
};

export default sim;
