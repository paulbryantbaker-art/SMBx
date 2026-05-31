/**
 * SIM-L6-BUY-SELL-CARVE-OUT-001 — L6 carve-out from a public parent.
 *
 * Underlying truth: SAMPLE_L6_CARVE_OUT_WITH_TSA.
 * Buy side: LMM/MM sponsor acquiring a non-core industrial-tech division.
 * Sell side: Corporate development team at the public parent (banker-led).
 *
 * Distinguishing substrate features:
 *  - M144 carve-out stranded-cost + TSA scoping
 *  - 336(e) election path (not 338(h)(10) — single seller, asset treatment)
 *  - Both sides must produce a TSA scope artifact and reconcile stranded costs
 */

import type { DealSimulation } from '../types.js';
import { SAMPLE_L6_CARVE_OUT_WITH_TSA } from '../data/sample-deal-facts.js';

const sim: DealSimulation = {
  id: 'SIM-L6-BUY-SELL-CARVE-OUT-001',
  description: 'L6 BUY-SELL carve-out — $18M EBITDA non-core div from public parent, $150M deal, 12-month TSA, §336(e) election path. Tests carve-out stranded-cost + TSA substrate symmetry.',
  league: 'L6',
  journeys: ['buy', 'sell'],
  factPattern: SAMPLE_L6_CARVE_OUT_WITH_TSA,

  parties: [
    // ─── BUY SIDE (LMM/MM sponsor) ───────────────────────
    {
      role: 'buyer',
      agentIdentity: 'agent_buy_sim_l6_carve_001',
      beneficialCustomer: 'pe_sponsor_carve_001',
      tier: 'pro',
      payloadFromTruth: (facts) => ({
        journey: 'buy',
        target_industry: facts.industry,
        target_jurisdiction: facts.jurisdiction,
        deal_type: 'carve_out',
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: { journey: 'buy', target_industry: 'industrial technology', target_jurisdiction: 'US-DE', deal_type: 'carve_out' },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'buy', subJourney: 'healthy_buy_side' },
            missingFields: ['target_ebitda', 'parent_type', 'tsa_scope'],
            nextCallsInclude: ['update_deal_payload'],
            persistsDealState: true,
            versionPins: true,
            captureToState: ['deal_id', 'state_cid'],
          },
        },
        {
          step: 'enrich_carve_out',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 1800_000_000,
            target_revenue_cents: 9000_000_000,
            naics: '334513',
            purchase_price_range_cents: { low: 14000_000_000, high: 16000_000_000 },
            parent_type: 'public',
            tsa_active: true,
            tsa_scope: ['it', 'payroll', 'shared_procurement'],
            stranded_costs_estimate_cents: 400_000_000,
            election_type: '336(e)',
          }),
          expect: {
            responseType: 'classification_with_work',
            classification: { league: 'L6' },
            nextCallsInclude: ['compose_model_stack'],
            captureToState: ['parent_cid'],
          },
        },
        {
          step: 'compose_stack',
          tool: 'compose_model_stack',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['applicable_models'],
          },
        },
        {
          step: 'execute_valuation',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.VAL.EBITDA.v1',
            inputs: {
              ebitda_cents: 1800_000_000,
              comparables_multiple_range: { low: 7.5, high: 9.5 },
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['valuation_output_hash', 'valuation_range'],
          },
        },
        {
          step: 'execute_carve_out_tsa',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.STRUCT.ANALYSIS.v1',
            inputs: {
              carve_out: true,
              tsa_scope: ['it', 'payroll', 'shared_procurement'],
              tsa_duration_months: 12,
              stranded_costs_cents: 400_000_000,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['tsa_scope_hash', 'stranded_cost_recovery_plan'],
          },
        },
        {
          step: 'execute_336e_path',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.TAX.GROSSUP.338_336.v1',
            inputs: {
              election_type: '336(e)',
              purchase_price_cents: 15000_000_000,
              seller_tax_attributes: { c_corp: true, public_parent: true },
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['tax_gross_up_hash'],
          },
        },
        {
          step: 'execute_lbo',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.LBO.LMM.v1',
            inputs: {
              purchase_price_cents: 15000_000_000,
              debt_cents: 9000_000_000,
              sponsor_equity_cents: 6000_000_000,
              entry_ebitda_cents: 1800_000_000,
              exit_multiple: 10.0,
              hold_years: 5,
              ebitda_growth_pct: 0.07,
              debt_paydown_cents: 4500_000_000,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['lbo_output_hash'],
          },
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

    // ─── SELL SIDE (Public-parent corp dev, banker-led) ───
    {
      role: 'seller',
      agentIdentity: 'agent_sell_sim_l6_carve_001',
      beneficialCustomer: 'public_parent_corp_dev_001',
      tier: 'team',
      payloadFromTruth: (facts) => ({
        journey: 'sell',
        seller_role: 'banker',
        industry: facts.industry,
        jurisdiction: facts.jurisdiction,
        deal_type: 'carve_out',
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: { journey: 'sell', seller_role: 'banker', industry: 'industrial technology', jurisdiction: 'US-DE', deal_type: 'carve_out' },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'sell', subJourney: 'banker_led' },
            missingFields: ['target_ebitda', 'tsa_scope', 'retained_liabilities'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_carve_out',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 1800_000_000,
            target_revenue_cents: 9000_000_000,
            naics: '334513',
            tsa_scope: ['it', 'payroll', 'shared_procurement'],
            tsa_duration_months: 12,
            stranded_costs_estimate_cents: 400_000_000,
            retained_liabilities: ['historical_environmental', 'pre_close_tax'],
            election_type: '336(e)',
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
              ebitda_cents: 1800_000_000,
              comparables_multiple_range: { low: 7.5, high: 9.5 },
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['valuation_output_hash', 'valuation_range'],
          },
        },
        {
          step: 'execute_qoe',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.QOE.LITE.v1',
            inputs: {
              ebitda_cents: 1800_000_000,
              parent_allocations_cents: 400_000_000, // overhead being reversed
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['normalized_ebitda_cents'],
          },
        },
        {
          step: 'execute_tsa_scope',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.STRUCT.ANALYSIS.v1',
            inputs: {
              carve_out: true,
              tsa_scope: ['it', 'payroll', 'shared_procurement'],
              tsa_duration_months: 12,
              stranded_costs_cents: 400_000_000,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['tsa_scope_hash'],
          },
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
      description: 'Valuation ranges overlap',
      field: 'valuation_range',
      mode: 'overlap',
      parties: ['buyer', 'seller'],
    },
    {
      description: 'TSA scope set is identical on both sides',
      field: 'tsa_scope_hash',
      mode: 'equal',
      parties: ['buyer', 'seller'],
    },
    {
      description: 'Both sides cite §336(e) authority',
      field: 'valuation_citation_refs',
      mode: 'subset',
      parties: ['buyer', 'seller'],
    },
    {
      description: 'Both sides return same methodology_version pin',
      field: 'methodology_version',
      mode: 'equal',
    },
    {
      description: 'Both sides return same spec_version pin',
      field: 'spec_version',
      mode: 'equal',
    },
  ],

  isolation: [
    {
      description: "Buyer's LBO assumptions never appear in seller substrate output",
      sourceField: 'lbo_output_hash',
      sourceParty: 'buyer',
      targetParty: 'seller',
    },
    {
      description: "Buyer's bid range never appears in seller substrate output",
      sourceField: 'purchase_price_range_cents',
      sourceParty: 'buyer',
      targetParty: 'seller',
    },
    {
      description: "Seller's retained-liability list never appears in buyer substrate output",
      sourceField: 'retained_liabilities',
      sourceParty: 'seller',
      targetParty: 'buyer',
    },
    {
      description: "Buyer's tax gross-up hash never appears in seller substrate output",
      sourceField: 'tax_gross_up_hash',
      sourceParty: 'buyer',
      targetParty: 'seller',
    },
  ],

  refusals: [
    {
      description: 'Asking substrate to negotiate TSA cost is refused (LINE_VIOLATION)',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'NEGOTIATION.RECOMMEND.v1', inputs: { my_position: 'tsa_cost_cap' } },
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
      description: 'Asking to file §336(e) election directly is refused (unauthorized filing)',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'IRS.FILE_336E.v1' },
      },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'unauthorized_filing',
    },
  ],

  completion: [
    {
      party: 'buyer',
      endpoint: 'Reaches finalize_deal_package with TSA scope + 336(e) gross-up + LBO',
      minAuditRows: 8,
      requiredFinalCalls: ['finalize_deal_package'],
    },
    {
      party: 'seller',
      endpoint: 'Reaches finalize_deal_package with TSA scope + retained-liability schedule',
      minAuditRows: 8,
      requiredFinalCalls: ['finalize_deal_package'],
    },
  ],

  partyTiers: { buyer: 'pro', seller: 'team' },
};

export default sim;
