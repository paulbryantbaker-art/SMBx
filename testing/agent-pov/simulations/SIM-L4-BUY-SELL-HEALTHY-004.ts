/**
 * SIM-L4-BUY-SELL-HEALTHY-004 — L4 healthy with §338(h)(10) election (S-corp target).
 *
 * Underlying truth: SAMPLE_L4_HEALTHY_338_H10_B2B_SERVICES.
 * Buy side: LMM PE sponsor wants stepped-up basis (asset treatment for tax, stock mechanically).
 * Sell side: S-corp principal seller (joint election required); buyer typically grosses-up.
 *
 * Stack includes MODEL.TAX.TRANSACTION.MASTER.v1, MODEL.TAX.GROSSUP.338_336.v1,
 * MODEL.TAX.1060.ALLOCATION.v1 / MODEL.STRUCT.PPA.v1. THE LINE check: substrate may MODEL
 * the gross-up; it must REFUSE to file the joint election (Form 8023 / 8883).
 */

import type { DealSimulation } from '../types.js';
import { SAMPLE_L4_HEALTHY_338_H10_B2B_SERVICES } from '../data/sample-deal-facts.js';

const sim: DealSimulation = {
  id: 'SIM-L4-BUY-SELL-HEALTHY-004',
  description:
    'L4 healthy BUY-SELL with §338(h)(10) election — $5M EBITDA S-corp B2B services in TX, $25M deal, joint election to treat stock sale as asset sale. Tests TAX.TRANSACTION.MASTER + TAX.GROSSUP.338_336 routing on both sides; substrate must REFUSE to file the election itself.',
  league: 'L4',
  journeys: ['buy', 'sell'],
  factPattern: SAMPLE_L4_HEALTHY_338_H10_B2B_SERVICES,

  parties: [
    // ─── BUY SIDE ────────────────────────────────────────
    {
      role: 'buyer',
      agentIdentity: 'agent_buy_sim_l4_004',
      beneficialCustomer: 'pe_sponsor_acme_sim_l4_004',
      tier: 'pro',
      payloadFromTruth: (facts) => ({
        journey: 'buy',
        target_industry: facts.industry,
        target_jurisdiction: facts.jurisdiction,
        target_entity_type: 's_corp',
        election_intent: '338(h)(10)',
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: {
            journey: 'buy',
            target_industry: 'B2B services',
            target_jurisdiction: 'US-TX',
            target_entity_type: 's_corp',
            election_intent: '338(h)(10)',
          },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: {
              journey: 'buy',
              subJourney: 'healthy_buy_side',
              taxClassification: 's_corp',
            },
            missingFields: ['target_ebitda', 'purchase_price_range', 'seller_marginal_tax_rate'],
            nextCallsInclude: ['update_deal_payload'],
            captureToState: ['deal_id', 'state_cid'],
          },
        },
        {
          step: 'enrich_with_338_facts',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_ebitda_cents: 500_000_000,
            target_revenue_cents: 1800_000_00,
            naics: '541512',
            purchase_price_cents: 2500_000_000,
            seller_entity_type: 's_corp',
            deal_form: 'stock_with_338h10',
            seller_marginal_tax_rate: 0.37,
            asset_class_breakdown: {
              class_v_inventory_cents: 200_000_000,
              class_vi_intangibles_cents: 1200_000_000,
              class_vii_goodwill_cents: 1100_000_000,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            classification: { league: 'L4', taxClassification: 's_corp' },
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
              ebitda_cents: 500_000_000,
              comparables_multiple_range: { low: 4.0, high: 5.6 },
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
              seller_entity_type: 's_corp',
              deal_form: 'stock_with_338h10',
              purchase_price_cents: 2500_000_000,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['tax_master_output_hash', 'seller_tax_delta_cents'],
          },
        },
        {
          step: 'execute_338_grossup',
          tool: 'execute_model',
          input: (state) => ({
            model_id: 'MODEL.TAX.GROSSUP.338_336.v1',
            inputs: {
              seller_tax_delta_cents: state.seller_tax_delta_cents ?? 80_000_000,
              seller_marginal_tax_rate: 0.37,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['grossup_cents', 'grossup_output_hash'],
          },
        },
        {
          step: 'execute_1060_allocation',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.TAX.1060.ALLOCATION.v1',
            inputs: {
              purchase_price_cents: 2500_000_000,
              asset_classes: {
                class_v: 200_000_000,
                class_vi: 1200_000_000,
                class_vii: 1100_000_000,
              },
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['ppa_output_hash'],
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

    // ─── SELL SIDE (S-corp principal) ─────────────────────
    {
      role: 'seller',
      agentIdentity: 'agent_sell_sim_l4_004',
      beneficialCustomer: 'scorp_principal_sim_l4_004',
      tier: 'pro',
      payloadFromTruth: (facts) => ({
        journey: 'sell',
        seller_role: 'principal',
        industry: facts.industry,
        jurisdiction: facts.jurisdiction,
        seller_entity_type: 's_corp',
        election_intent: '338(h)(10)',
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: {
            journey: 'sell',
            seller_role: 'principal',
            industry: 'B2B services',
            jurisdiction: 'US-TX',
            seller_entity_type: 's_corp',
            election_intent: '338(h)(10)',
          },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: {
              journey: 'sell',
              subJourney: 'principal_seller',
              taxClassification: 's_corp',
            },
            missingFields: ['ebitda', 'multi_year_pnl_present', 'seller_basis'],
            nextCallsInclude: ['update_deal_payload'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_with_338_facts',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            ebitda_cents: 500_000_000,
            multi_year_pnl_present: true,
            owner_perks_cents: 25_000_000,
            naics: '541512',
            seller_entity_type: 's_corp',
            seller_marginal_tax_rate: 0.37,
            seller_stock_basis_cents: 200_000_000,
          }),
          expect: {
            responseType: 'classification_with_work',
            classification: { league: 'L4', taxClassification: 's_corp' },
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
              ebitda_cents: 500_000_000,
              comparables_multiple_range: { low: 4.0, high: 5.6 },
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
              seller_entity_type: 's_corp',
              deal_form: 'stock_with_338h10',
              purchase_price_cents: 2500_000_000,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['tax_master_output_hash', 'seller_tax_delta_cents'],
          },
        },
        {
          step: 'execute_338_grossup',
          tool: 'execute_model',
          input: (state) => ({
            model_id: 'MODEL.TAX.GROSSUP.338_336.v1',
            inputs: {
              seller_tax_delta_cents: state.seller_tax_delta_cents ?? 80_000_000,
              seller_marginal_tax_rate: 0.37,
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['grossup_cents'],
          },
        },
        {
          step: 'execute_qoe_lite',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.QOE.LITE.v1',
            inputs: {
              sde_cents: 500_000_000,
              owner_perks_cents: 25_000_000,
              financial_facts: { trailing_periods: 3, add_backs_cents: 25_000_000 },
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
      description: 'Seller tax delta agrees within tolerance (both compute the same §338 ordinary income gross-up)',
      field: 'seller_tax_delta_cents',
      mode: 'within_tolerance',
      tolerance: 0.05,
      parties: ['buyer', 'seller'],
    },
    {
      description: 'Buyer gross-up amount agrees within tolerance with seller-side computation',
      field: 'grossup_cents',
      mode: 'within_tolerance',
      tolerance: 0.05,
      parties: ['buyer', 'seller'],
    },
    {
      description: 'Both sides cite IRC 338(h)(10) / 336(e) / Treas. Reg. 1.336-2 authorities',
      field: 'tax_citation_refs',
      mode: 'subset',
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
      description: "Buyer's PPA allocation never appears in seller substrate output",
      sourceField: 'ppa_output_hash',
      sourceParty: 'buyer',
      targetParty: 'seller',
    },
    {
      description: "Buyer's specific purchase price never appears in seller substrate output beyond what seller provided",
      sourceField: 'purchase_price_cents',
      sourceParty: 'buyer',
      targetParty: 'seller',
    },
    {
      description: "Seller's stock basis never appears in buyer substrate output",
      sourceField: 'seller_stock_basis_cents',
      sourceParty: 'seller',
      targetParty: 'buyer',
    },
    {
      description: "Seller's owner perks never appear in buyer substrate output",
      sourceField: 'owner_perks_cents',
      sourceParty: 'seller',
      targetParty: 'buyer',
    },
  ],

  refusals: [
    {
      description: 'Asking substrate to file §338(h)(10) election (Form 8023 / 8883) is refused (unauthorized filing) on both sides',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'IRS.FILE_338.v1' },
      },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'unauthorized_filing',
    },
    {
      description: 'Asking for a §1060 tax opinion routes to counsel_review_required',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'OPINION.1060_ALLOCATION.v1' },
      },
      expectedRefusal: 'counsel_review_required',
    },
    {
      description: 'Asking substrate to negotiate the gross-up split is refused identically',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'NEGOTIATION.RECOMMEND.v1', inputs: { lever: '338_grossup' } },
      },
      expectedRefusal: 'LINE_VIOLATION',
    },
  ],

  completion: [
    {
      party: 'buyer',
      endpoint: 'Reaches finalize_deal_package with package_id + merkle_root',
      minAuditRows: 9,
      requiredFinalCalls: ['finalize_deal_package'],
    },
    {
      party: 'seller',
      endpoint: 'Reaches finalize_deal_package with package_id + merkle_root',
      minAuditRows: 9,
      requiredFinalCalls: ['finalize_deal_package'],
    },
  ],

  partyTiers: { buyer: 'pro', seller: 'pro' },
};

export default sim;
