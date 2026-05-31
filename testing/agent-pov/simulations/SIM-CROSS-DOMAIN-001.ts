/**
 * SIM-CROSS-DOMAIN-001 — L6 BUY with G28 distressed + G29 capital-structure (LME)
 *                         + G30 real-estate overlays applied simultaneously.
 *
 * Underlying truth: SAMPLE_CROSS_DOMAIN_L6_DISTRESS_CAP_RE.
 * Buy side: Sponsor pursuing OpCo/PropCo separation via 363/RSA path while
 *           navigating LME (uptier + double-dip exposure) on existing capital
 *           structure. Foreign seller adds FIRPTA on PropCo side; §1031 potential
 *           reserved; §382 NOL preservation in scope.
 * Sell side: Distressed corporate seller (going-concern hospitality OpCo)
 *            represented by restructuring banker and counsel.
 *
 * Cross-domain substrate features tested:
 *  - G28 (distressed): M148 three-prong solvency, M151 363 sale mechanics,
 *    M152 plan feasibility, M158 DIP sizing, M164 RSA economics
 *  - G29 (capital structure / LME): M161 uptier research, M163 double-dip
 *    research, M160 exchange offer, M150 CODI + §382
 *  - G30 (real estate): M169 FIRPTA, M170 §1031 timing, M171 sale-leaseback,
 *    OpCo/PropCo separation via MODEL.RE.OPCO_PROPCO.SEPARATION.v1
 *  - Route map must compose stack including all three overlays simultaneously
 */

import type { DealSimulation } from '../types.js';
import { SAMPLE_CROSS_DOMAIN_L6_DISTRESS_CAP_RE } from '../data/sample-deal-facts.js';

const sim: DealSimulation = {
  id: 'SIM-CROSS-DOMAIN-001',
  description: 'L6 BUY cross-domain — $14M EBITDA hospitality OpCo, distressed (cash runway 95d) + LME exposure (uptier/double-dip) + RE-heavy (12 owned sites, FIRPTA, §1031, §382 NOL) — all overlays triggered simultaneously. Stress test for compose_model_stack across G28+G29+G30.',
  league: 'L6',
  journeys: ['buy', 'sell'],
  factPattern: SAMPLE_CROSS_DOMAIN_L6_DISTRESS_CAP_RE,

  parties: [
    // ─── BUY SIDE (Sponsor, cross-domain) ────────────────
    {
      role: 'buyer',
      agentIdentity: 'agent_buy_sim_xdomain_001',
      beneficialCustomer: 'distressed_sponsor_001',
      tier: 'enterprise',
      payloadFromTruth: (facts) => ({
        journey: 'buy',
        target_industry: facts.industry,
        target_jurisdiction: facts.jurisdiction,
        distress_posture: 'partial_distress',
        asset_class: 'mixed',
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: {
            journey: 'buy',
            target_industry: 'hospitality',
            target_jurisdiction: 'US-NV',
            distress_posture: 'partial_distress',
            asset_class: 'mixed',
            foreign_seller: true,
          },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'buy', subJourney: 'distressed_buy_side', distressPosture: 'partial_distress', assetClass: 'mixed' },
            missingFields: ['target_ebitda', 'cash_runway_days', 'cap_structure', 'real_estate_footprint'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_cross_domain',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 1400_000_000,
            target_revenue_cents: 9500_000_000,
            naics: '721110',
            purchase_price_range_cents: { low: 6000_000_000, high: 8000_000_000 },
            cash_runway_days: 95,
            fccr: 0.92,
            secured_debt_price_cents: 62,
            rsa_contemplated: true,
            sec_363_path: true,
            cap_structure: {
              uptier_exposure: true,
              double_dip_exposure: true,
              drop_down_capacity: true,
              sacred_rights_class: 'required_lender_majority',
            },
            real_estate: {
              owned_sites: 12,
              opco_propco_separation: true,
              firpta: true,
              sec_1031_potential: true,
            },
            nol_balance_cents: 8500_000_000,
            sec_382_in_scope: true,
            election_type: '336(e)',
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
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['applicable_models', 'gates_triggered'],
          },
        },
        // ─── G28 distressed lane ──────────────────────────
        {
          step: 'execute_solvency_three_prong',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.RESTRUCTURING.SOLVENCY.THREE_PRONG.v1',
            inputs: {
              ebitda_cents: 1400_000_000,
              total_debt_cents: 6500_000_000,
              fair_value_assets_cents: 8200_000_000,
              capital_adequacy_cushion_pct: 0.10,
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['solvency_hash'] },
        },
        {
          step: 'execute_363_mechanics',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.RESTRUCTURING.363_SALE.v1',
            inputs: { stalking_horse: true, bid_protection_pct: 0.03, transaction_value_cents: 7000_000_000 },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['sec_363_hash'] },
        },
        {
          step: 'execute_dip_sizing',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.RESTRUCTURING.DIP_SIZING.v1',
            inputs: { cash_runway_days: 95, weekly_burn_cents: 50_000_000, minimum_liquidity_cents: 200_000_000 },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['dip_hash'] },
        },
        {
          step: 'execute_rsa_economics',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.RESTRUCTURING.RSA_ECONOMICS.v1',
            inputs: { required_lender_pct: 0.6675, fiduciary_out: true, toggle_milestones: ['ds_60d', 'plan_120d'] },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['rsa_hash'] },
        },
        // ─── G29 LME / cap structure lane ────────────────
        {
          step: 'execute_uptier_research',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.LME.UPTIER.RESEARCH.v1',
            inputs: { required_lender_pct: 0.6675, open_market_purchase_language: true },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['uptier_hash'] },
        },
        {
          step: 'execute_double_dip_research',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.LME.DOUBLEDIP.RESEARCH.v1',
            inputs: { structural_seniority_path: true, pari_plus: true },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['double_dip_hash'] },
        },
        {
          step: 'execute_codi_382',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.TAX.382.NOL_LIMIT.v1',
            inputs: { nol_balance_cents: 8500_000_000, ownership_change: true, ltv_pct_change: 0.51, equity_value_cents: 6000_000_000 },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['sec_382_hash'] },
        },
        // ─── G30 real-estate lane ─────────────────────────
        {
          step: 'execute_opco_propco_separation',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.RE.OPCO_PROPCO.SEPARATION.v1',
            inputs: {
              owned_sites: 12,
              cap_rate_range: { low: 0.075, high: 0.095 },
              foreign_seller: true,
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['opco_propco_hash'] },
        },
        {
          step: 'execute_firpta',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.RE.FIRPTA.WITHHOLDING.v1',
            inputs: { amount_realized_cents: 3500_000_000, foreign_seller: true, exemption_path: 'none' },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['firpta_hash'] },
        },
        {
          step: 'execute_1031_timing',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.RE.1031.TIMING.v1',
            inputs: { identification_window_days: 45, exchange_window_days: 180, boot_potential_cents: 0 },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['sec_1031_hash'] },
        },
        {
          step: 'finalize_package',
          tool: 'finalize_deal_package',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: { responseType: 'classification_with_work', captureToState: ['package_id', 'merkle_root'] },
        },
      ],
    },

    // ─── SELL SIDE (Distressed corp seller, banker + counsel) ───
    {
      role: 'seller',
      agentIdentity: 'agent_sell_sim_xdomain_001',
      beneficialCustomer: 'distressed_corp_seller_001',
      tier: 'enterprise',
      payloadFromTruth: (facts) => ({
        journey: 'sell',
        seller_role: 'banker',
        industry: facts.industry,
        jurisdiction: facts.jurisdiction,
        distress_posture: 'partial_distress',
        asset_class: 'mixed',
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: {
            journey: 'sell',
            seller_role: 'banker',
            industry: 'hospitality',
            jurisdiction: 'US-NV',
            distress_posture: 'partial_distress',
            asset_class: 'mixed',
          },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'sell', distressPosture: 'partial_distress' },
            missingFields: ['target_ebitda', 'cap_structure', 'real_estate_footprint'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_cross_domain',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 1400_000_000,
            target_revenue_cents: 9500_000_000,
            naics: '721110',
            cash_runway_days: 95,
            fccr: 0.92,
            secured_debt_price_cents: 62,
            rsa_contemplated: true,
            sec_363_path: true,
            cap_structure: {
              uptier_exposure: true,
              double_dip_exposure: true,
            },
            real_estate: { owned_sites: 12, firpta: true },
            foreign_seller: true,
            seller_jurisdiction: 'KY',
          }),
          expect: { responseType: 'classification_with_work', classification: { league: 'L6' } },
        },
        {
          step: 'compose_stack',
          tool: 'compose_model_stack',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['applicable_models', 'gates_triggered'],
          },
        },
        {
          step: 'execute_solvency_three_prong',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.RESTRUCTURING.SOLVENCY.THREE_PRONG.v1',
            inputs: {
              ebitda_cents: 1400_000_000,
              total_debt_cents: 6500_000_000,
              fair_value_assets_cents: 8200_000_000,
              capital_adequacy_cushion_pct: 0.10,
            },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['solvency_hash'] },
        },
        {
          step: 'execute_plan_feasibility',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.RESTRUCTURING.PLAN_FEASIBILITY.v1',
            inputs: { ebitda_cents: 1400_000_000, debt_service_cents: 950_000_000, sensitivity_low_pct: -0.20 },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['plan_feasibility_hash'] },
        },
        {
          step: 'execute_uptier_research',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.LME.UPTIER.RESEARCH.v1',
            inputs: { required_lender_pct: 0.6675, open_market_purchase_language: true },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['uptier_hash'] },
        },
        {
          step: 'execute_firpta',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.RE.FIRPTA.WITHHOLDING.v1',
            inputs: { amount_realized_cents: 3500_000_000, foreign_seller: true, exemption_path: 'none' },
          }),
          expect: { responseType: 'classification_with_work', captureToState: ['firpta_hash'] },
        },
        {
          step: 'execute_qoe',
          tool: 'execute_model',
          input: () => ({ model_id: 'MODEL.QOE.LITE.v1', inputs: { ebitda_cents: 1400_000_000 } }),
          expect: { responseType: 'classification_with_work', captureToState: ['normalized_ebitda_cents'] },
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
    { description: 'Both sides trigger G28 + G29 + G30 gates in compose_model_stack', field: 'gates_triggered', mode: 'subset', parties: ['buyer', 'seller'] },
    { description: 'Three-prong solvency math identical', field: 'solvency_hash', mode: 'equal', parties: ['buyer', 'seller'] },
    { description: 'Uptier LME research output identical', field: 'uptier_hash', mode: 'equal', parties: ['buyer', 'seller'] },
    { description: 'FIRPTA withholding amount identical', field: 'firpta_hash', mode: 'equal', parties: ['buyer', 'seller'] },
    { description: 'Both sides cite §548/UVTA, §§363/365/364, §382, §1445, §1031 authorities', field: 'valuation_citation_refs', mode: 'subset', parties: ['buyer', 'seller'] },
    { description: 'Both sides return same methodology + spec version pins', field: 'methodology_version', mode: 'equal' },
  ],

  isolation: [
    { description: "Buyer's DIP sizing never appears in seller substrate output", sourceField: 'dip_hash', sourceParty: 'buyer', targetParty: 'seller' },
    { description: "Buyer's OpCo/PropCo separation plan never appears in seller substrate output", sourceField: 'opco_propco_hash', sourceParty: 'buyer', targetParty: 'seller' },
    { description: "Buyer's §1031 timing plan never appears in seller substrate output", sourceField: 'sec_1031_hash', sourceParty: 'buyer', targetParty: 'seller' },
    { description: "Buyer's §382 NOL preservation math never appears in seller substrate output", sourceField: 'sec_382_hash', sourceParty: 'buyer', targetParty: 'seller' },
    { description: "Buyer's RSA economics analysis never appears in seller substrate output", sourceField: 'rsa_hash', sourceParty: 'buyer', targetParty: 'seller' },
    { description: "Buyer's double-dip research never appears in seller substrate output", sourceField: 'double_dip_hash', sourceParty: 'buyer', targetParty: 'seller' },
    { description: "Buyer's bid range never appears in seller substrate output", sourceField: 'purchase_price_range_cents', sourceParty: 'buyer', targetParty: 'seller' },
  ],

  refusals: [
    {
      description: 'Asking substrate to negotiate uptier consent / required-lender threshold is refused',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'NEGOTIATION.RECOMMEND.v1', inputs: { uptier_consent: 'majority' } } },
      expectedRefusal: 'LINE_VIOLATION',
    },
    {
      description: 'Asking for a fairness opinion routes to counsel_review_required',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'OPINION.FAIRNESS.v1' } },
      expectedRefusal: 'counsel_review_required',
    },
    {
      description: 'Asking to file 363 motion / DIP order is refused (unauthorized filing)',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'COURT.FILE_363_MOTION.v1' } },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'unauthorized_filing',
    },
    {
      description: 'Asking to file FIRPTA withholding (Form 8288) is refused (unauthorized filing)',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'IRS.FILE_FORM_8288.v1' } },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'unauthorized_filing',
    },
    {
      description: 'Asking to contact secured lenders directly is refused (counterparty contact)',
      prohibitedRequest: { tool: 'execute_model', input: { model_id: 'LENDER.OUTREACH.v1' } },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'counterparty_contact',
    },
  ],

  completion: [
    { party: 'buyer', endpoint: 'Reaches finalize_deal_package after G28+G29+G30 lanes execute', minAuditRows: 12, requiredFinalCalls: ['finalize_deal_package'] },
    { party: 'seller', endpoint: 'Reaches finalize_deal_package after solvency + plan feasibility + uptier + FIRPTA + QoE', minAuditRows: 9, requiredFinalCalls: ['finalize_deal_package'] },
  ],

  partyTiers: { buyer: 'enterprise', seller: 'enterprise' },
};

export default sim;
