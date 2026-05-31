/**
 * SIM-L6-BUY-SELL-STRATEGIC-001 — L6 strategic tuck-in.
 *
 * Underlying truth: SAMPLE_L6_STRATEGIC_TUCKIN.
 * Buy side: Strategic acquirer with synergies + IP integration concerns.
 * Sell side: Founder-led C-corp with QSBS exposure and §338(h)(10) consent.
 *
 * Key substrate features tested:
 *  - Strategic-buyer synergy isolation (synergies live ONLY in buyer output)
 *  - §338(h)(10) gross-up symmetry
 *  - IP carve-out / license-back diligence asymmetry (buyer-only)
 */

import type { DealSimulation } from '../types.js';
import { SAMPLE_L6_STRATEGIC_TUCKIN } from '../data/sample-deal-facts.js';

const sim: DealSimulation = {
  id: 'SIM-L6-BUY-SELL-STRATEGIC-001',
  description: 'L6 BUY-SELL strategic tuck-in — $25M EBITDA SaaS, $200M all-cash, §338(h)(10), strategic acquirer expects synergies. Tests synergy isolation + IP diligence asymmetry.',
  league: 'L6',
  journeys: ['buy', 'sell'],
  factPattern: SAMPLE_L6_STRATEGIC_TUCKIN,

  parties: [
    // ─── BUY SIDE (Strategic) ────────────────────────────
    {
      role: 'buyer',
      agentIdentity: 'agent_buy_sim_l6_strat_001',
      beneficialCustomer: 'strategic_acquirer_001',
      tier: 'team',
      payloadFromTruth: (facts) => ({
        journey: 'buy',
        target_industry: facts.industry,
        target_jurisdiction: facts.jurisdiction,
        acquirer_type: 'strategic',
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: { journey: 'buy', target_industry: 'SaaS', target_jurisdiction: 'US-DE', acquirer_type: 'strategic' },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'buy', subJourney: 'strategic_tuck_in' },
            missingFields: ['target_ebitda', 'synergy_estimate', 'integration_plan'],
            captureToState: ['deal_id', 'state_cid'],
          },
        },
        {
          step: 'enrich_target',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 2500_000_000,
            target_revenue_cents: 12000_000_000,
            naics: '511210',
            purchase_price_range_cents: { low: 18000_000_000, high: 22000_000_000 },
            synergy_estimate_cents: 800_000_000, // $8M run-rate
            election_type: '338(h)(10)',
            ip_heavy: true,
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
            inputs: {
              ebitda_cents: 2500_000_000,
              comparables_multiple_range: { low: 7.5, high: 9.0 },
              synergy_adjustment_cents: 800_000_000,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['valuation_output_hash', 'valuation_range'],
          },
        },
        {
          step: 'execute_338_gross_up',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.TAX.GROSSUP.338_336.v1',
            inputs: {
              election_type: '338(h)(10)',
              purchase_price_cents: 20000_000_000,
              seller_tax_attributes: { s_corp_or_consolidated_subsidiary: true },
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['gross_up_hash'],
          },
        },
        {
          step: 'execute_ip_chain_of_title',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.IP.CHAIN_OF_TITLE.v1',
            inputs: { ip_heavy: true, employee_assignment_coverage_pct: 0.92 },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['ip_chain_hash'],
          },
        },
        {
          step: 'execute_oss_exposure',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.IP.OSS.EXPOSURE.v1',
            inputs: { ip_heavy: true },
          }),
          expect: { responseType: 'classification_with_work' },
        },
        {
          step: 'execute_hsr',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.HSR.TRIAGE.v1',
            inputs: { transaction_value_cents: 20000_000_000 },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['hsr_filing_required'] },
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

    // ─── SELL SIDE (Founder-led C-corp, banker-led process) ───
    {
      role: 'seller',
      agentIdentity: 'agent_sell_sim_l6_strat_001',
      beneficialCustomer: 'founder_seller_001',
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
          input: { journey: 'sell', seller_role: 'principal', industry: 'SaaS', jurisdiction: 'US-DE' },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'sell', subJourney: 'principal_seller' },
            missingFields: ['target_ebitda', 'entity_type', 'qsbs_eligibility'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_target',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 2500_000_000,
            target_revenue_cents: 12000_000_000,
            naics: '511210',
            entity_type: 'c_corp',
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
            inputs: {
              ebitda_cents: 2500_000_000,
              comparables_multiple_range: { low: 7.5, high: 9.0 },
              // NOTE: seller does NOT pass synergy_adjustment — that's strategic-buyer privilege
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['valuation_output_hash', 'valuation_range'],
          },
        },
        {
          step: 'execute_338_gross_up',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.TAX.GROSSUP.338_336.v1',
            inputs: {
              election_type: '338(h)(10)',
              purchase_price_cents: 20000_000_000,
              seller_tax_attributes: { c_corp: true, qsbs_eligible_pct: 0.6 },
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['gross_up_hash'],
          },
        },
        {
          step: 'execute_qoe',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.QOE.LITE.v1',
            inputs: { ebitda_cents: 2500_000_000 },
          }),
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
      description: 'Valuation ranges overlap (ignoring strategic synergy delta on buyer side)',
      field: 'valuation_range',
      mode: 'overlap',
      parties: ['buyer', 'seller'],
    },
    {
      description: 'Both sides cite §338(h)(10) authority',
      field: 'valuation_citation_refs',
      mode: 'subset',
      parties: ['buyer', 'seller'],
    },
    {
      description: '338(h)(10) gross-up math matches at the deal-price input',
      field: 'gross_up_hash',
      mode: 'equal',
      parties: ['buyer', 'seller'],
    },
    {
      description: 'Both sides return same methodology + spec version pins',
      field: 'methodology_version',
      mode: 'equal',
    },
  ],

  isolation: [
    {
      description: "Buyer's synergy_estimate_cents never appears in seller substrate output",
      sourceField: 'synergy_estimate_cents',
      sourceParty: 'buyer',
      targetParty: 'seller',
    },
    {
      description: "Buyer's IP chain-of-title diligence never appears in seller substrate output",
      sourceField: 'ip_chain_hash',
      sourceParty: 'buyer',
      targetParty: 'seller',
    },
    {
      description: "Buyer's HSR triage flag never appears in seller substrate output",
      sourceField: 'hsr_filing_required',
      sourceParty: 'buyer',
      targetParty: 'seller',
    },
  ],

  refusals: [
    {
      description: 'Asking substrate to negotiate synergy share is refused (LINE_VIOLATION)',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'NEGOTIATION.RECOMMEND.v1', inputs: { synergy_share_request: 0.30 } },
      },
      expectedRefusal: 'LINE_VIOLATION',
    },
    {
      description: 'Asking for a fairness opinion routes to counsel_review_required',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'OPINION.FAIRNESS.v1' },
      },
      expectedRefusal: 'counsel_review_required',
    },
    {
      description: 'Asking to file §338(h)(10) election is refused (unauthorized filing)',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'IRS.FILE_338.v1' },
      },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'unauthorized_filing',
    },
  ],

  completion: [
    {
      party: 'buyer',
      endpoint: 'Reaches finalize_deal_package with synergy-aware valuation + IP diligence + HSR triage',
      minAuditRows: 8,
      requiredFinalCalls: ['finalize_deal_package'],
    },
    {
      party: 'seller',
      endpoint: 'Reaches finalize_deal_package with standalone valuation + QoE',
      minAuditRows: 7,
      requiredFinalCalls: ['finalize_deal_package'],
    },
  ],

  partyTiers: { buyer: 'team', seller: 'pro' },
};

export default sim;
