/**
 * SIM-L2-BUY-SELL-SBA-003 — L2 SBA acquisition with owner-rep representation on sell side.
 *
 * Underlying truth: SAMPLE_L2_SBA_RESTAURANT_OWNER_REP.
 * Buy side: first-time buyer, principal SBA financing.
 * Sell side: business broker / owner-rep represents the seller (NOT the principal).
 *
 * Important: when the sell-side role is owner_rep, the substrate must:
 *  - classify subJourney as 'owner_rep' (not 'principal_seller')
 *  - keep the principal's identity isolated from buy-side output (one extra isolation layer)
 *  - apply broker-compensation LINE checks (no success-fee plumbing from substrate; broker fee is the broker's contract, not the substrate's price)
 */

import type { DealSimulation } from '../types.js';
import { SAMPLE_L2_SBA_RESTAURANT_OWNER_REP } from '../data/sample-deal-facts.js';

const sim: DealSimulation = {
  id: 'SIM-L2-BUY-SELL-SBA-003',
  description:
    'L2 micro-LMM SBA acquisition with owner-rep on sell side — $1M SDE restaurant in TX, $4M SBA-financed, buy-side principal vs. sell-side broker. Tests owner_rep subJourney routing and three-party identity isolation (buyer / broker / principal).',
  league: 'L2',
  journeys: ['buy', 'sell'],
  factPattern: SAMPLE_L2_SBA_RESTAURANT_OWNER_REP,

  parties: [
    // ─── BUY SIDE ────────────────────────────────────────
    {
      role: 'buyer',
      agentIdentity: 'agent_buy_sim_l2_003',
      beneficialCustomer: 'first_time_buyer_sim_l2_003',
      tier: 'solo',
      payloadFromTruth: (facts) => ({
        journey: 'buy',
        target_industry: facts.industry,
        target_jurisdiction: facts.jurisdiction,
        sba_eligible_intent: true,
        counterparty_representation: 'broker_listing',
      }),
      callSequence: [
        {
          step: 'cold_intake',
          tool: 'ingest_deal_payload',
          input: {
            journey: 'buy',
            target_industry: 'restaurant',
            target_jurisdiction: 'US-TX',
            sba_eligible_intent: true,
            counterparty_representation: 'broker_listing',
          },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'buy', subJourney: 'healthy_buy_side' },
            missingFields: ['target_sde', 'purchase_price_range', 'broker_disclosure'],
            nextCallsInclude: ['update_deal_payload'],
            captureToState: ['deal_id', 'state_cid'],
          },
        },
        {
          step: 'enrich_with_financials',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            target_sde_cents: 100_000_000,
            target_revenue_cents: 350_000_000,
            naics: '722511',
            purchase_price_range_cents: { low: 350_000_000, high: 450_000_000 },
            buyer_equity_cents: 50_000_000,
            counterparty_broker_engaged: true,
          }),
          expect: {
            responseType: 'classification_with_work',
            classification: { league: 'L2' },
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
          step: 'execute_sde_valuation',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.VAL.SDE.v1',
            inputs: {
              seller_discretionary_earnings_cents: 100_000_000,
              comparables_multiple_range: { low: 3.0, high: 4.5 },
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['valuation_output_hash', 'valuation_range'],
          },
        },
        {
          step: 'execute_lbo_sba',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.LBO.SBA.v1',
            inputs: {
              purchase_price_cents: 400_000_000,
              cash_flow_cents: 100_000_000,
              buyer_equity_cents: 50_000_000,
              annual_debt_service_cents: 42_000_000,
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

    // ─── SELL SIDE (owner-rep) ────────────────────────────
    {
      role: 'owner_rep',
      agentIdentity: 'agent_owner_rep_sim_l2_003',
      beneficialCustomer: 'broker_listing_sim_l2_003',
      tier: 'pro',
      payloadFromTruth: (facts) => ({
        journey: 'sell',
        seller_role: 'owner_rep',
        industry: facts.industry,
        jurisdiction: facts.jurisdiction,
        engagement_type: 'success_only_listing',
        principal_identity_disclosed_to_substrate: false,
      }),
      callSequence: [
        {
          step: 'cold_intake_as_owner_rep',
          tool: 'ingest_deal_payload',
          input: {
            journey: 'sell',
            seller_role: 'owner_rep',
            industry: 'restaurant',
            jurisdiction: 'US-TX',
            engagement_type: 'success_only_listing',
          },
          expect: {
            responseType: 'classification_with_missing_inputs',
            classification: { journey: 'sell', subJourney: 'owner_rep' },
            missingFields: ['sde', 'multi_year_pnl_present', 'broker_engagement_terms'],
            nextCallsInclude: ['update_deal_payload'],
            captureToState: ['deal_id'],
          },
        },
        {
          step: 'enrich_with_sde',
          tool: 'update_deal_payload',
          input: (state) => ({
            deal_id: state.deal_id,
            sde_cents: 100_000_000,
            multi_year_pnl_present: true,
            owner_perks_cents: 8_000_000,
            naics: '722511',
            sba_eligible: true,
            principal_pseudonym: 'PRINCIPAL_ALPHA', // identity withheld
          }),
          expect: {
            responseType: 'classification_with_work',
            classification: { league: 'L2', subJourney: 'owner_rep' },
          },
        },
        {
          step: 'compose_stack',
          tool: 'compose_model_stack',
          input: (state) => ({ deal_id: state.deal_id }),
          expect: { responseType: 'classification_with_work', captureToState: ['applicable_models'] },
        },
        {
          step: 'execute_sde_valuation',
          tool: 'execute_model',
          input: () => ({
            model_id: 'MODEL.VAL.SDE.v1',
            inputs: {
              seller_discretionary_earnings_cents: 100_000_000,
              comparables_multiple_range: { low: 3.0, high: 4.5 },
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
              sde_cents: 100_000_000,
              owner_perks_cents: 8_000_000,
              financial_facts: { trailing_periods: 3, add_backs_cents: 8_000_000 },
            },
          }),
          expect: {
            responseType: 'classification_with_work',
            captureToState: ['normalized_sde_cents'],
          },
        },
        {
          step: 'compose_listing_package',
          tool: 'compose_data_room_index',
          input: (state) => ({ deal_id: state.deal_id, purpose: 'broker_listing_packet' }),
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
      description: 'Valuation ranges overlap across buyer and owner-rep outputs',
      field: 'valuation_range',
      mode: 'overlap',
      parties: ['buyer', 'owner_rep'],
    },
    {
      description: 'Both sides cite the same SDE valuation authority',
      field: 'valuation_citation_refs',
      mode: 'subset',
      parties: ['buyer', 'owner_rep'],
    },
    {
      description: 'Both sides return identical methodology_version pin',
      field: 'methodology_version',
      mode: 'equal',
    },
  ],

  isolation: [
    {
      description: "Buyer's equity-down ($500K) never appears in owner-rep substrate output",
      sourceField: 'buyer_equity_cents',
      sourceParty: 'buyer',
      targetParty: 'owner_rep',
    },
    {
      description: "Buyer's LBO assumptions never appear in owner-rep substrate output",
      sourceField: 'lbo_output_hash',
      sourceParty: 'buyer',
      targetParty: 'owner_rep',
    },
    {
      description: "Owner-rep's principal pseudonym never appears in buyer substrate output",
      sourceField: 'principal_pseudonym',
      sourceParty: 'owner_rep',
      targetParty: 'buyer',
    },
    {
      description: "Owner-rep's broker engagement terms never appear in buyer substrate output",
      sourceField: 'broker_engagement_terms',
      sourceParty: 'owner_rep',
      targetParty: 'buyer',
    },
  ],

  refusals: [
    {
      description: 'Asking substrate to negotiate is refused identically on both sides',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'NEGOTIATION.RECOMMEND.v1', inputs: { my_position: 'asking_4m' } },
      },
      expectedRefusal: 'LINE_VIOLATION',
    },
    {
      description: 'Asking substrate to charge a success fee on close is refused (THE LINE)',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'BILLING.SUCCESS_FEE.v1', inputs: { pct_of_close: 0.10 } },
      },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'success_fee',
    },
    {
      description: 'Asking substrate to broker an introduction for a referral fee is refused',
      prohibitedRequest: {
        tool: 'execute_model',
        input: { model_id: 'MATCHING.PAID_REFERRAL.v1' },
      },
      expectedRefusal: 'LINE_VIOLATION',
      lineViolationType: 'referral_fee',
    },
  ],

  completion: [
    {
      party: 'buyer',
      endpoint: 'Reaches finalize_deal_package with package_id + merkle_root',
      minAuditRows: 7,
      requiredFinalCalls: ['finalize_deal_package'],
    },
    {
      party: 'owner_rep',
      endpoint: 'Reaches finalize_deal_package with package_id + merkle_root',
      minAuditRows: 7,
      requiredFinalCalls: ['finalize_deal_package'],
    },
  ],

  partyTiers: { buyer: 'solo', owner_rep: 'pro' },
};

export default sim;
