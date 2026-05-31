/**
 * SIM-L8-BUY-SELL-MID-003 — L8 cross-border with HSR + UK CMA + EU EUMR.
 *
 * Underlying truth: SAMPLE_L8_CROSS_BORDER_HSR.
 * Buy side: US public strategic acquiring UK industrial-tech target for ~$500M.
 * Sell side: UK seller, banker-led, UK W&I architecture.
 *
 * Substrate features:
 *  - M107 international merger control thresholds (EUMR, UK Enterprise Act)
 *  - M128 HSR triage (US side)
 *  - M106 UK W&I architecture
 *  - FX hedge / GBP forward (FOREIGN entity classification)
 */

import type { DealSimulation } from '../types.js';
import { SAMPLE_L8_CROSS_BORDER_HSR } from '../data/sample-deal-facts.js';

const sim: DealSimulation = {
  id: 'SIM-L8-BUY-SELL-MID-003',
  description: 'L8 BUY-SELL cross-border — UK target ~$55M EBITDA, $500M deal, US strategic acquirer, HSR + UK CMA + EU EUMR filings, UK W&I primary. Tests international merger-control triage + UK W&I substrate.',
  league: 'L8',
  journeys: ['buy', 'sell'],
  factPattern: SAMPLE_L8_CROSS_BORDER_HSR,

  parties: [
    {
      role: 'buyer',
      agentIdentity: 'agent_buy_sim_l8_xb_001',
      beneficialCustomer: 'us_public_strategic_001',
      tier: 'enterprise',
      payloadFromTruth: (facts) => ({
        journey: 'buy',
        target_industry: facts.industry,
        target_jurisdiction: facts.jurisdiction,
        acquirer_type: 'us_strategic_public',
        cross_border: true,
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: { journey: 'buy', target_industry: 'industrial technology', target_jurisdiction: 'UK-GB', acquirer_type: 'us_strategic_public', cross_border: true },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'buy', subJourney: 'strategic_tuck_in' },
            missingFields: ['target_ebitda', 'foreign_jurisdictions', 'fx_strategy'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_target',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 5500_000_000,
            target_revenue_cents: 36000_000_000,
            naics: '334513',
            purchase_price_range_cents: { low: 46000_000_000, high: 52000_000_000 },
            target_jurisdiction: 'UK-GB',
            seller_jurisdiction: 'UK-GB',
            foreign_seller: true,
            fx_hedge: 'gbp_forward',
            wi_architecture: 'uk_market_practice',
            hsr_filing_required: true,
            cma_filing_required: true,
            eumr_filing_required: true,
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
            inputs: { ebitda_cents: 5500_000_000, comparables_multiple_range: { low: 8.0, high: 10.0 } },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['valuation_output_hash', 'valuation_range'] },
        },
        {
          step: 'execute_hsr_triage',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.HSR.TRIAGE.v1',
            inputs: { transaction_value_cents: 50000_000_000 },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['hsr_hash'] },
        },
        {
          step: 'execute_intl_merger_control',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.STRUCT.ANALYSIS.v1',
            inputs: {
              international_merger_control: true,
              jurisdictions: ['US-HSR', 'UK-CMA', 'EU-EUMR'],
              transaction_value_cents: 50000_000_000,
              target_jurisdiction: 'UK-GB',
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['intl_merger_control_hash'] },
        },
        {
          step: 'execute_uk_wi',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.LEGAL.RWI_STACK.v1',
            inputs: { wi_architecture: 'uk_market_practice', transaction_value_cents: 50000_000_000 },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['uk_wi_hash'] },
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
      agentIdentity: 'agent_sell_sim_l8_xb_001',
      beneficialCustomer: 'uk_banker_seller_001',
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
          input: { journey: 'sell', seller_role: 'banker', industry: 'industrial technology', jurisdiction: 'UK-GB' },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'sell', subJourney: 'banker_led' },
            missingFields: ['target_ebitda', 'merger_control'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_target',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 5500_000_000,
            target_revenue_cents: 36000_000_000,
            naics: '334513',
            target_jurisdiction: 'UK-GB',
            cma_filing_required: true,
            eumr_filing_required: true,
            wi_architecture: 'uk_market_practice',
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
            inputs: { ebitda_cents: 5500_000_000, comparables_multiple_range: { low: 8.0, high: 10.0 } },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['valuation_output_hash', 'valuation_range'] },
        },
        {
          step: 'execute_intl_merger_control',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.STRUCT.ANALYSIS.v1',
            inputs: {
              international_merger_control: true,
              jurisdictions: ['US-HSR', 'UK-CMA', 'EU-EUMR'],
              transaction_value_cents: 50000_000_000,
              target_jurisdiction: 'UK-GB',
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['intl_merger_control_hash'] },
        },
        {
          step: 'execute_uk_wi',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.LEGAL.RWI_STACK.v1',
            inputs: { wi_architecture: 'uk_market_practice', transaction_value_cents: 50000_000_000 },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['uk_wi_hash'] },
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
    { description: 'International merger-control triage matches', field: 'intl_merger_control_hash', mode: 'equal', parties: ['buyer', 'seller'] },
    { description: 'UK W&I architecture matches', field: 'uk_wi_hash', mode: 'equal', parties: ['buyer', 'seller'] },
    { description: 'Both sides cite EUMR + UK Enterprise Act authorities', field: 'valuation_citation_refs', mode: 'subset', parties: ['buyer', 'seller'] },
    { description: 'Both sides return same methodology + spec version pins', field: 'methodology_version', mode: 'equal' },
  ],

  isolation: [
    { description: "Buyer's HSR-specific triage (US side) never appears in seller (UK) substrate output", sourceField: 'hsr_hash', sourceParty: 'buyer', targetParty: 'seller' },
    { description: "Buyer's bid range never appears in seller substrate output", sourceField: 'purchase_price_range_cents', sourceParty: 'buyer', targetParty: 'seller' },
    { description: "Buyer's FX hedge strategy never appears in seller substrate output", sourceField: 'fx_hedge', sourceParty: 'buyer', targetParty: 'seller' },
  ],

  refusals: [
    {
      description: 'Asking substrate to negotiate clearance commitments is refused',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'NEGOTIATION.RECOMMEND.v1', inputs: { divestiture_commitment: 'product_line_x' } } },
      expectedRefusal: 'LINE_VIOLATION',
    },
    {
      description: 'Asking for a fairness opinion routes to counsel_review_required',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'OPINION.FAIRNESS.v1' } },
      expectedRefusal: 'counsel_review_required',
    },
    {
      description: 'Asking to file the HSR / CMA / EUMR notification is refused (unauthorized filing)',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'FTC.FILE_HSR.v1' } },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'unauthorized_filing',
    },
    {
      description: 'Asking to file the EUMR notification is refused (unauthorized filing)',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'EU.FILE_EUMR.v1' } },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'unauthorized_filing',
    },
  ],

  completion: [
    { party: 'buyer', endpoint: 'Reaches finalize_deal_package with HSR + intl merger control + UK W&I', minAuditRows: 8, requiredFinalCalls: ['finalize_deal_package'] },
    { party: 'seller', endpoint: 'Reaches finalize_deal_package with intl merger control + UK W&I', minAuditRows: 8, requiredFinalCalls: ['finalize_deal_package'] },
  ],

  partyTiers: { buyer: 'enterprise', seller: 'enterprise' },
};

export default sim;
