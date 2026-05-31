/**
 * SIM-L4-BUY-SELL-HEALTHY-001 — worked example simulation.
 *
 * Anchors the simulation fixture format. Other simulations should mirror this
 * structure: derive both-side payloads from a canonical fact pattern, define
 * symmetry / isolation / refusal / completion assertions, NEVER hard-code
 * values that should come from substrate output.
 *
 * Underlying truth: SAMPLE_L4_HEALTHY_B2B_SERVICES.
 * Buy side: LMM PE sponsor with SBA + senior bank financing.
 * Sell side: Principal seller, LLC pass-through, multi-year P&L available.
 */

import type { DealSimulation } from '../types.js';
import { SAMPLE_L4_HEALTHY_B2B_SERVICES } from '../data/sample-deal-facts.js';

const sim: DealSimulation = {
  id: 'SIM-L4-BUY-SELL-HEALTHY-001',
  description: 'L4 healthy BUY-SELL — $5M SDE B2B services in TX, $25M deal, SBA + senior bank financing. Worked example for both-sides substrate symmetry + isolation.',
  league: 'L4',
  journeys: ['buy', 'sell'],
  factPattern: SAMPLE_L4_HEALTHY_B2B_SERVICES,

  parties: [
    // ─── BUY SIDE ────────────────────────────────────────
    {
      role: 'buyer',
      agentIdentity: 'agent_buy_sim001',
      beneficialCustomer: 'pe_sponsor_acme_sim001',
      tier: 'pro',
      payloadFromTruth: (facts) => ({
        journey: 'buy',
        target_industry: facts.industry,
        target_jurisdiction: facts.jurisdiction,
        // Sparse start — buyer doesn't disclose target financials initially
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: { journey: 'buy', target_industry: 'B2B services', target_jurisdiction: 'US-TX' },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'buy', subJourney: 'healthy_buy_side' },
            missingFields: ['target_revenue', 'target_ebitda', 'purchase_price_range'],
            nextCallsInclude: ['update_deal_payload'],
            persistsDealState: true,
            versionPins: true,
            captureToState: ['deal_id', 'state_cid'],
          },
        },
        {
          step: 'enrich_with_financials',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_sde_cents: 500_000_000,
            target_revenue_cents: 1800_000_00,
            naics: '541512',
            purchase_price_range_cents: { low: 2000_000_000, high: 2800_000_000 },
          }),
          expect: {
            responseType: 'classification_with_work',
            classification: { league: 'L4' },
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
            nextCallsInclude: ['execute_model'],
            captureToState: ['applicable_models'],
          },
        },
        {
          step: 'execute_valuation',
          tool: 'execute_model',
          input: (state) => ({
            deal_id: state.deal_id,
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
          step: 'execute_lbo',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.LBO.LMM.v1',
            inputs: {
              purchase_price_cents: 2500_000_000,
              debt_cents: 900_000_000,
              sponsor_equity_cents: 1600_000_000,
              entry_ebitda_cents: 500_000_000,
              exit_multiple: 8.5,
              hold_years: 5,
              ebitda_growth_pct: 0.05,
              debt_paydown_cents: 600_000_000,
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

    // ─── SELL SIDE ───────────────────────────────────────
    {
      role: 'seller',
      agentIdentity: 'agent_sell_sim001',
      beneficialCustomer: 'seller_owner_sim001',
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
          input: { journey: 'sell', seller_role: 'principal', industry: 'B2B services', jurisdiction: 'US-TX' },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'sell', subJourney: 'principal_seller' },
            missingFields: ['sde', 'multi_year_pnl_present', 'owner_perks'],
            nextCallsInclude: ['update_deal_payload'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_with_sde',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            sde_cents: 500_000_000,
            multi_year_pnl_present: true,
            owner_perks_cents: 25_000_000,
            naics: '541512',
          }),
          expect: { responseType: 'classification_with_work', classification: { league: 'L4' } },
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
            model_id: 'MODEL.VAL.SDE.v1',
            inputs: {
              sde_cents: 500_000_000,
              comparables_multiple_range: { low: 4.0, high: 5.6 },
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['valuation_output_hash', 'valuation_range'],
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

  // ─── Symmetry: buy and sell should reach similar conclusions ────
  symmetry: [
    {
      description: 'Valuation ranges overlap',
      field: 'valuation_range',
      mode: 'overlap',
      parties: ['buyer', 'seller'],
    },
    {
      description: 'Both sides cite same valuation methodology authority',
      field: 'valuation_citation_refs',
      mode: 'subset',
      parties: ['buyer', 'seller'],
    },
    {
      description: 'Both sides return same methodology_version pin',
      field: 'methodology_version',
      mode: 'equal',
    },
  ],

  // ─── Isolation: no info leaks across parties ────────────────────
  isolation: [
    {
      description: "Buyer's specific purchase price ($25M) never appears in seller substrate output",
      sourceField: 'purchase_price_cents',
      sourceParty: 'buyer',
      targetParty: 'seller',
    },
    {
      description: "Buyer's LBO assumptions never appear in seller substrate output",
      sourceField: 'lbo_output_hash',
      sourceParty: 'buyer',
      targetParty: 'seller',
    },
    {
      description: "Seller's owner perks never appear in buyer substrate output",
      sourceField: 'owner_perks_cents',
      sourceParty: 'seller',
      targetParty: 'buyer',
    },
  ],

  // ─── Refusals: same prohibited request, same refusal envelope, regardless of side
  refusals: [
    {
      description: 'Asking substrate to negotiate is refused identically on both sides',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'NEGOTIATION.RECOMMEND.v1', inputs: { my_position: 'accept_25m' } },
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

  // ─── Completion: each side must reach a defined endpoint ────────
  completion: [
    {
      party: 'buyer',
      endpoint: 'Reaches finalize_deal_package with package_id + merkle_root',
      minAuditRows: 7,
      requiredFinalCalls: ['finalize_deal_package'],
    },
    {
      party: 'seller',
      endpoint: 'Reaches finalize_deal_package with package_id + merkle_root',
      minAuditRows: 7,
      requiredFinalCalls: ['finalize_deal_package'],
    },
  ],

  partyTiers: { buyer: 'pro', seller: 'pro' },
};

export default sim;
