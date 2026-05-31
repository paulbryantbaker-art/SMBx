/**
 * SIM-L4-BUY-SELL-HEALTHY-005 — L4 healthy with §1202 QSBS-eligible C-corp seller.
 *
 * Underlying truth: SAMPLE_L4_HEALTHY_1202_QSBS_C_CORP.
 * Buy side: strategic acquirer purchasing a SaaS C-corp with QSBS-eligible shareholders.
 * Sell side: original-issuance C-corp shareholders (3 founders) holding > 5 years,
 * sub-$50M gross assets at issuance, active business — qualifies for §1202 exclusion.
 *
 * Substrate models the §1202 exclusion and per-holder cap analysis; substrate must
 * REFUSE to give a §1202-qualification opinion (counsel_review_required) and must
 * REFUSE to file Form 8949 / Schedule D (unauthorized filing).
 *
 * Note: v19ModelRuntime does not currently expose a dedicated MODEL.TAX.QSBS.v1.
 * §1202 analysis routes through MODEL.TAX.TRANSACTION.MASTER.v1 (which references
 * IRC 351/368/721 and entity-type branching) with QSBS facts on the deal payload;
 * a dedicated QSBS model is flagged in the report-back.
 */

import type { DealSimulation } from '../types.js';
import { SAMPLE_L4_HEALTHY_1202_QSBS_C_CORP } from '../data/sample-deal-facts.js';

const sim: DealSimulation = {
  id: 'SIM-L4-BUY-SELL-HEALTHY-005',
  description:
    'L4 healthy BUY-SELL with §1202 QSBS — $4M EBITDA SaaS C-corp in DE, $30M deal, 3 founder shareholders with original-issuance, >5yr hold, sub-$50M gross-assets-at-issuance, active business. Tests QSBS exclusion routing + per-holder cap analysis on both sides.',
  league: 'L4',
  journeys: ['buy', 'sell'],
  factPattern: SAMPLE_L4_HEALTHY_1202_QSBS_C_CORP,

  parties: [
    // ─── BUY SIDE ────────────────────────────────────────
    {
      role: 'buyer',
      agentIdentity: 'agent_buy_sim_l4_005',
      beneficialCustomer: 'strategic_acquirer_sim_l4_005',
      tier: 'pro',
      payloadFromTruth: (facts) => ({
        journey: 'buy',
        target_industry: facts.industry,
        target_jurisdiction: facts.jurisdiction,
        target_entity_type: 'c_corp',
        seller_claims_qsbs: true,
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: {
            journey: 'buy',
            target_industry: 'SaaS',
            target_jurisdiction: 'US-DE',
            target_entity_type: 'c_corp',
            seller_claims_qsbs: true,
          },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: {
              journey: 'buy',
              subJourney: 'healthy_buy_side',
              taxClassification: 'c_corp',
            },
            missingFields: ['target_ebitda', 'purchase_price_range', 'qsbs_facts'],
            nextCallsInclude: ['update_deal_payload'],
            captureToState: ['deal_id', 'state_cid'],
          },
        },
        {
          step: 'enrich_with_qsbs_facts',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 400_000_000,
            target_revenue_cents: 2000_000_00,
            naics: '511210',
            purchase_price_cents: 3000_000_000,
            seller_entity_type: 'c_corp',
            deal_form: 'stock',
            qsbs_facts: {
              original_issuance: true,
              gross_assets_at_issuance_cents: 4000_000_00,
              holding_period_years: 7,
              active_business_test: true,
              founding_shareholders: 3,
              per_holder_exclusion_cap_cents: 1000_000_000,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            classification: { league: 'L4', taxClassification: 'c_corp' },
            nextCallsInclude: ['compose_model_stack'],
            captureToState: ['parent_cid', 'state_cid'],
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
          step: 'execute_ebitda_valuation',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.VAL.EBITDA.v1',
            inputs: {
              ebitda_cents: 400_000_000,
              comparables_multiple_range: { low: 6.0, high: 9.0 },
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['valuation_output_hash', 'valuation_range'],
          },
        },
        {
          step: 'execute_tax_master',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.TAX.TRANSACTION.MASTER.v1',
            inputs: {
              seller_entity_type: 'c_corp',
              deal_form: 'stock',
              purchase_price_cents: 3000_000_000,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['tax_master_output_hash'],
          },
        },
        {
          step: 'execute_lbo_strategic_proxy',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.LBO.LMM.v1',
            inputs: {
              purchase_price_cents: 3000_000_000,
              debt_cents: 0,
              sponsor_equity_cents: 3000_000_000,
              entry_ebitda_cents: 400_000_000,
              exit_multiple: 10.0,
              hold_years: 5,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['lbo_output_hash'],
          },
        },
        {
          step: 'compose_loi_plan',
          tool: 'compose_deal_plan',
          input: (state) => ({ deal_id: state.deal_id, stage: 'loi' }),
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

    // ─── SELL SIDE (C-corp founder shareholders) ──────────
    {
      role: 'seller',
      agentIdentity: 'agent_sell_sim_l4_005',
      beneficialCustomer: 'founder_shareholders_sim_l4_005',
      tier: 'pro',
      payloadFromTruth: (facts) => ({
        journey: 'sell',
        seller_role: 'principal',
        industry: facts.industry,
        jurisdiction: facts.jurisdiction,
        seller_entity_type: 'c_corp',
        seller_claims_qsbs: true,
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: {
            journey: 'sell',
            seller_role: 'principal',
            industry: 'SaaS',
            jurisdiction: 'US-DE',
            seller_entity_type: 'c_corp',
            seller_claims_qsbs: true,
          },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: {
              journey: 'sell',
              subJourney: 'principal_seller',
              taxClassification: 'c_corp',
            },
            missingFields: ['ebitda', 'qsbs_facts', 'shareholder_basis_table'],
            nextCallsInclude: ['update_deal_payload'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_with_qsbs_facts',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            ebitda_cents: 400_000_000,
            multi_year_pnl_present: true,
            naics: '511210',
            seller_entity_type: 'c_corp',
            qsbs_facts: {
              original_issuance: true,
              gross_assets_at_issuance_cents: 4000_000_00,
              holding_period_years: 7,
              active_business_test: true,
              founding_shareholders: 3,
              per_holder_exclusion_cap_cents: 1000_000_000,
            },
            shareholder_basis_table: [
              { shareholder_id: 'founder_a', basis_cents: 100_000, ownership_pct: 0.40 },
              { shareholder_id: 'founder_b', basis_cents: 100_000, ownership_pct: 0.35 },
              { shareholder_id: 'founder_c', basis_cents: 100_000, ownership_pct: 0.25 },
            ],
          }),
          expect: {
            responseType: 'classification_with_work',
            classification: { league: 'L4', taxClassification: 'c_corp' },
          },
        },
        {
          step: 'compose_stack',
          tool: 'compose_model_stack',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: { responseType: 'classification_with_work', captureToState: ['applicable_models'] },
        },
        {
          step: 'execute_ebitda_valuation',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.VAL.EBITDA.v1',
            inputs: {
              ebitda_cents: 400_000_000,
              comparables_multiple_range: { low: 6.0, high: 9.0 },
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['valuation_output_hash', 'valuation_range'],
          },
        },
        {
          step: 'execute_tax_master',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.TAX.TRANSACTION.MASTER.v1',
            inputs: {
              seller_entity_type: 'c_corp',
              deal_form: 'stock',
              purchase_price_cents: 3000_000_000,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['tax_master_output_hash'],
          },
        },
        {
          step: 'execute_qoe_lite',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.QOE.LITE.v1',
            inputs: {
              sde_cents: 400_000_000,
              owner_perks_cents: 0,
              financial_facts: { trailing_periods: 3 },
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['normalized_sde_cents'],
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
      description: 'Both sides cite IRC 1202 / 351 / 368 authorities for QSBS',
      field: 'tax_citation_refs',
      mode: 'subset',
      parties: ['buyer', 'seller'],
    },
    {
      description: 'Both sides classify deal as L4 C-corp',
      field: 'taxClassification',
      mode: 'equal',
      parties: ['buyer', 'seller'],
    },
    {
      description: 'Both sides return identical methodology_version pin',
      field: 'methodology_version',
      mode: 'equal',
    },
  ],

  isolation: [
    {
      description: "Buyer's strategic synergy assumptions never appear in seller substrate output",
      sourceField: 'lbo_output_hash',
      sourceParty: 'buyer',
      targetParty: 'seller',
    },
    {
      description: "Seller's shareholder basis table never appears in buyer substrate output",
      sourceField: 'shareholder_basis_table',
      sourceParty: 'seller',
      targetParty: 'buyer',
    },
    {
      description: "Founder identities never appear in buyer substrate output",
      sourceField: 'founder_shareholders_sim_l4_005',
      sourceParty: 'seller',
      targetParty: 'buyer',
    },
  ],

  refusals: [
    {
      description: 'Asking substrate for a §1202 qualification opinion routes to counsel_review_required',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'OPINION.QSBS_1202.v1' },
      },
      expectedRefusal: 'counsel_review_required',
    },
    {
      description: 'Asking substrate to file Form 8949 / Schedule D is refused (unauthorized filing) on both sides',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'IRS.FILE_FORM_8949.v1' },
      },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'unauthorized_filing',
    },
    {
      description: 'Asking substrate to negotiate the QSBS escrow holdback is refused identically',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'NEGOTIATION.RECOMMEND.v1', inputs: { lever: 'qsbs_escrow' } },
      },
      expectedRefusal: 'LINE_VIOLATION',
    },
  ],

  completion: [
    {
      party: 'buyer',
      endpoint: 'Reaches finalize_deal_package with package_id + merkle_root',
      minAuditRows: 8,
      requiredFinalCalls: ['finalize_deal_package'],
    },
    {
      party: 'seller',
      endpoint: 'Reaches finalize_deal_package with package_id + merkle_root',
      minAuditRows: 8,
      requiredFinalCalls: ['finalize_deal_package'],
    },
  ],

  partyTiers: { buyer: 'pro', seller: 'pro' },
};

export default sim;
