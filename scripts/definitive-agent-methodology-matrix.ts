#!/usr/bin/env npx tsx
/**
 * Agent methodology matrix smoke.
 *
 * This intentionally avoids OAuth and Stripe. It tests the substrate contract
 * an external agent needs: any level of deal information in, methodologically
 * correct DealState/control artifacts out.
 */
import {
  executeDefinitiveDealStateTool,
  type DefinitiveDealState,
} from '../server/services/definitiveDealState.js';
import {
  composeDefinitiveApplicableMechanics,
  summarizeDefinitiveApplicableMechanics,
  type DefinitiveJourney,
} from '../server/services/definitiveDealRouteMap.js';
import {
  buildMarketMultiplePacketFromSources,
  inferMarketMultipleNaicsCode,
  resolveModelMarketMultipleInputs,
  resolveMarketMultipleAssumptions,
} from '../server/services/marketMultipleResolver.js';
import { executeV19Model } from '../server/services/v19ModelRuntime.js';

type Scenario = {
  id: string;
  label: string;
  payload: Record<string, any>;
  expectedJourney: 'sell' | 'buy' | 'raise' | 'pmi' | 'unknown';
  expectedSubJourney?: string;
  expectedOverlays?: Array<'G28' | 'G29' | 'G30'>;
  minScore: number;
  expectedNextCalls: string[];
  expectedMissing?: string[];
  draftType?: string;
};

const scenarios: Scenario[] = [
  {
    id: 'empty',
    label: 'No deal facts yet',
    payload: {},
    expectedJourney: 'unknown',
    minScore: 0,
    expectedNextCalls: ['update_deal_payload', 'check_completeness'],
    expectedMissing: ['journey', 'deal_subject', 'economic_scale'],
  },
  {
    id: 'one_line_buy_intent',
    label: 'Natural-language buy intent only',
    payload: {
      intent: 'I want to buy an HVAC company in the Southeast.',
    },
    expectedJourney: 'buy',
    expectedSubJourney: 'healthy_buy_side',
    minScore: 10,
    expectedNextCalls: ['update_deal_payload', 'check_completeness', 'compose_model_stack'],
    expectedMissing: ['deal_subject', 'economic_scale'],
  },
  {
    id: 'buy_with_economics_and_source',
    label: 'Buy-side target with economics and one source',
    payload: {
      journey: 'buy',
      targetName: 'Demo Services Co.',
      industry: 'HVAC services',
      jurisdiction: 'US-TX',
      revenueCents: 4_200_000_00,
      ebitdaCents: 800_000_00,
      purchasePriceCents: 5_000_000_00,
      documents: [{ id: 'pl', name: 'Seller P&L', type: 'financials', hash: 'sha256:pl' }],
    },
    expectedJourney: 'buy',
    expectedSubJourney: 'healthy_buy_side',
    minScore: 70,
    expectedNextCalls: ['update_deal_payload', 'check_completeness', 'compose_model_stack'],
    expectedMissing: ['deal_structure'],
    draftType: 'ioi',
  },
  {
    id: 'sell_side_package',
    label: 'Sell-side sale package request',
    payload: {
      intent: 'I want to sell my commercial landscaping company.',
      targetName: 'GreenCo Landscaping',
      industry: 'landscaping',
      jurisdiction: 'US-GA',
      revenueCents: 2_400_000_00,
      sdeCents: 520_000_00,
      documents: [{ id: 'pl', name: 'TTM P&L', type: 'financials', hash: 'sha256:sell-pl' }],
    },
    expectedJourney: 'sell',
    expectedSubJourney: 'healthy_sell_side',
    minScore: 60,
    expectedNextCalls: ['update_deal_payload', 'check_completeness', 'compose_model_stack'],
    draftType: 'deal_brief',
  },
  {
    id: 'raise_side_growth',
    label: 'Raise-side growth company',
    payload: {
      journey: 'raise',
      targetName: 'Workflow SaaS Co.',
      industry: 'SaaS',
      jurisdiction: 'US-CA',
      revenueCents: 1_800_000_00,
      burnCents: 50_000_00,
      useOfFunds: 'sales hiring and implementation capacity',
      documents: [{ id: 'deck', name: 'Investor deck', type: 'deck', hash: 'sha256:deck' }],
    },
    expectedJourney: 'raise',
    expectedSubJourney: 'capital_raise',
    minScore: 65,
    expectedNextCalls: ['update_deal_payload', 'check_completeness', 'compose_model_stack'],
    draftType: 'ic_memo',
  },
  {
    id: 'pmi_post_close',
    label: 'PMI post-close handoff',
    payload: {
      journey: 'pmi',
      targetName: 'Acquired Distribution Co.',
      industry: 'distribution',
      jurisdiction: 'US-IL',
      closeDate: '2026-05-01',
      documents: [{ id: 'ops', name: 'Operations handoff', type: 'operations', hash: 'sha256:ops' }],
    },
    expectedJourney: 'pmi',
    expectedSubJourney: 'post_close_pmi',
    minScore: 55,
    expectedNextCalls: ['update_deal_payload', 'check_completeness', 'compose_model_stack'],
    expectedMissing: ['economic_scale'],
    draftType: 'pmi_plan',
  },
  {
    id: 'distressed_g28',
    label: 'Distressed/restructuring overlay',
    payload: {
      journey: 'buy',
      targetName: 'Stressed Manufacturing Co.',
      industry: 'manufacturing',
      jurisdiction: 'US-DE',
      ebitdaCents: 1_000_000_00,
      dealType: '363 sale bankruptcy acquisition',
      signals: { cashRunwayDays: 20, bankruptcyFilingPending: true },
    },
    expectedJourney: 'buy',
    expectedSubJourney: 'distressed_363_sale',
    expectedOverlays: ['G28'],
    minScore: 60,
    expectedNextCalls: ['update_deal_payload', 'check_completeness', 'compose_model_stack', 'get_definition_of_done'],
    expectedMissing: ['source_or_document_reference', 'deal_structure'],
    draftType: 'diligence_request',
  },
  {
    id: 'capital_structure_g29',
    label: 'Capital-structure / liability-management overlay',
    payload: {
      journey: 'buy',
      targetName: 'Levered Industrial Co.',
      industry: 'industrial',
      jurisdiction: 'US-NY',
      enterpriseValueCents: 15_000_000_00,
      dealType: 'uptier exchange offer recapitalization',
      signals: { capitalStructureAction: 'uptier', covenantAmendment: true },
    },
    expectedJourney: 'buy',
    expectedSubJourney: 'capital_structure_or_liability_management',
    expectedOverlays: ['G29'],
    minScore: 60,
    expectedNextCalls: ['update_deal_payload', 'check_completeness', 'compose_model_stack', 'get_definition_of_done'],
    expectedMissing: ['source_or_document_reference', 'deal_structure'],
    draftType: 'negotiation_brief',
  },
  {
    id: 'real_estate_g30',
    label: 'Real-estate / asset-class overlay',
    payload: {
      journey: 'buy',
      targetName: 'Self Storage Portfolio',
      industry: 'self storage real estate',
      jurisdiction: 'US-FL',
      enterpriseValueCents: 8_000_000_00,
      dealType: 'real estate sale leaseback with title survey rent roll',
      signals: { realEstatePercentOfEv: 70 },
    },
    expectedJourney: 'buy',
    expectedSubJourney: 'real_estate_overlay',
    expectedOverlays: ['G30'],
    minScore: 60,
    expectedNextCalls: ['update_deal_payload', 'check_completeness', 'compose_model_stack', 'get_definition_of_done'],
    expectedMissing: ['source_or_document_reference', 'deal_structure'],
    draftType: 'data_room_index',
  },
];

let passed = 0;
let failed = 0;

console.log('\nsmbX DEFINITIVE agent methodology matrix');
console.log('Mode: substrate-only, no OAuth, no Stripe\n');

const states = new Map<string, DefinitiveDealState>();

for (const scenario of scenarios) {
  await test(`${scenario.id}: accepts ${scenario.label}`, () => {
    const response = executeDefinitiveDealStateTool('ingest_deal_payload', {
      idempotencyKey: `methodology-matrix-${scenario.id}`,
      payload: scenario.payload,
    }) as any;

    assertEqual(response.ok, true, 'ingest ok');
    assertEqual(response.action, 'ingest_deal_payload', 'ingest action');

    const result = response.result;
    const state = result.dealState as DefinitiveDealState;
    states.set(scenario.id, state);

    assert(state, 'DealState returned');
    assertEqual(state.protocol, 'DEFINITIVE.deal-state.v0.1', 'DealState protocol');
    assert(state.cid.startsWith('definitive:deal-state:sha256:'), 'DealState CID');
    assert(/^[a-f0-9]{64}$/.test(state.stateHash), 'DealState hash');
    assertEqual(state.classificationKey.journey, scenario.expectedJourney, 'journey classification');
    if (scenario.expectedSubJourney) {
      assertEqual(state.classificationKey.subJourney, scenario.expectedSubJourney, 'subJourney classification');
    }
    for (const gate of scenario.expectedOverlays || []) {
      assert(state.classificationKey.triggeredOverlayGates.includes(gate), `${gate} overlay triggered`);
    }
    assert(state.completenessReport.score >= scenario.minScore, 'completeness minimum');
    assert(state.missingInputContract, 'MissingInputContract returned');
    assert(Array.isArray(state.missingInputContract.minimalNextInputSet), 'minimal next inputs array');
    for (const field of scenario.expectedMissing || []) {
      assert(state.missingInputContract.minimalNextInputSet.includes(field), `missing input includes ${field}`);
    }
    assert(Array.isArray(result.next_suggested_calls), 'next_suggested_calls returned');
    for (const toolName of scenario.expectedNextCalls) {
      assert(result.next_suggested_calls.some((call: any) => call.toolName === toolName), `next calls include ${toolName}`);
    }
    assert(result.portableTakeBackArtifacts.includes('DealState'), 'DealState take-back artifact');
    assert(result.portableTakeBackArtifacts.includes('MissingInputContract'), 'MissingInputContract take-back artifact');
    assert(result.portableTakeBackArtifacts.includes('CompletenessReport'), 'CompletenessReport take-back artifact');
    assert(state.completenessReport.theLineInvariant.includes('DEFINITIVE computes'), 'THE LINE invariant present');
  });

  await test(`${scenario.id}: returns control-plane artifacts`, () => {
    const state = requireState(scenario.id);

    const completeness = executeDefinitiveDealStateTool('check_completeness', { dealState: state }) as any;
    assertEqual(completeness.ok, true, 'check_completeness ok');
    assertEqual(completeness.result.completenessReport.score, state.completenessReport.score, 'completeness score stable');
    assert(completeness.result.missingInputContract, 'completeness returns MissingInputContract');

    const plan = executeDefinitiveDealStateTool('compose_deal_plan', { dealState: state }) as any;
    assertEqual(plan.ok, true, 'compose_deal_plan ok');
    assert(plan.result.dealPlan.lifecycle.includes('IOI'), 'deal plan lifecycle');
    assert(plan.result.portableTakeBackArtifacts.includes('DealPlan'), 'DealPlan portable');

    const resume = executeDefinitiveDealStateTool('resume_deal', { dealState: state }) as any;
    assertEqual(resume.ok, true, 'resume_deal ok');
    assert(resume.result.currentStage, 'resume current stage');
    assert(resume.result.resumeContract.recursiveLoop.includes('update_deal_payload'), 'resume recursive loop');
    assert(resume.result.next_suggested_calls.length > 0, 'resume next calls');
  });

  if (scenario.expectedJourney !== 'unknown') {
    await test(`${scenario.id}: routes methodology/model stack`, () => {
      const state = requireState(scenario.id);
      const mechanics = composeDefinitiveApplicableMechanics({
        journey: state.classificationKey.journey as DefinitiveJourney,
        league: state.classificationKey.league === 'unknown' ? undefined : state.classificationKey.league,
        dealType: String(state.payload.dealType || state.payload.structure || state.classificationKey.subJourney || ''),
        industry: state.classificationKey.industry === 'unknown' ? undefined : state.classificationKey.industry,
        jurisdiction: state.classificationKey.jurisdiction === 'unknown' ? undefined : state.classificationKey.jurisdiction,
        triggeredGates: state.classificationKey.triggeredOverlayGates,
      });
      const summary = summarizeDefinitiveApplicableMechanics(mechanics);
      assert(summary.total > 0, 'applicable mechanics returned');
      assert(mechanics.some(route => route.toolSurfaces.includes('mcp')), 'mechanics include MCP surface');
      for (const gate of scenario.expectedOverlays || []) {
        assert(mechanics.some(route => route.gates.includes(gate)), `${gate} mechanics routed`);
      }
    });
  }

  if (scenario.draftType && scenario.expectedJourney !== 'unknown') {
    await test(`${scenario.id}: delivers portable work-product scaffolds`, () => {
      const state = requireState(scenario.id);

      const draft = executeDefinitiveDealStateTool('compose_document_draft', {
        dealState: state,
        documentType: scenario.draftType,
      }) as any;
      assertEqual(draft.ok, true, 'compose_document_draft ok');
      assert(draft.result.documentDraft, 'DocumentDraft returned');
      assert(draft.result.documentDraft.sections.length > 0, 'DocumentDraft has sections');
      assert(draft.result.portableTakeBackArtifacts.includes('DocumentDraft'), 'DocumentDraft portable');

      const packet = executeDefinitiveDealStateTool('compose_deal_package', { dealState: state }) as any;
      assertEqual(packet.ok, true, 'compose_deal_package ok');
      assert(packet.result.dealPackage.packageCid.startsWith('definitive:deal-package:sha256:'), 'DealPackage CID');
      assert(packet.result.dealPackage.takeBackArtifacts.includes('DealPackage'), 'DealPackage portable');
      assert(packet.result.dealPackage.takeBackArtifacts.includes('MissingInputContract'), 'package includes missing input contract');
    });
  }
}

await test('recursive update improves a sparse agent entry and preserves lineage', () => {
  const initial = executeDefinitiveDealStateTool('ingest_deal_payload', {
    idempotencyKey: 'methodology-matrix-recursive-initial',
    payload: { intent: 'I want to buy a services business.' },
  }) as any;
  const prior = initial.result.dealState as DefinitiveDealState;

  const updated = executeDefinitiveDealStateTool('update_deal_payload', {
    dealState: prior,
    idempotencyKey: 'methodology-matrix-recursive-update',
    patch: {
      targetName: 'Recurring Services Co.',
      industry: 'B2B services',
      jurisdiction: 'US-TN',
      revenueCents: 3_000_000_00,
      ebitdaCents: 600_000_00,
      dealStructure: 'asset purchase with seller note',
      documents: [{ id: 'ttm', name: 'TTM financials', type: 'financials', hash: 'sha256:ttm' }],
    },
  }) as any;

  const next = updated.result.dealState as DefinitiveDealState;
  assertEqual(updated.ok, true, 'update ok');
  assert(next.parentCids.includes(prior.cid), 'updated state links to prior CID');
  assert(next.completenessReport.score > prior.completenessReport.score, 'score improves');
  assertEqual(next.classificationKey.journey, 'buy', 'journey preserved');
  assert(updated.completeness_contribution_delta > 0, 'positive completeness delta');
});

await test('agent looking for an LOI gets packet, draft, and THE LINE boundaries', () => {
  const payload = {
    intent: 'External agent wants an LOI scaffold for an HVAC acquisition.',
    journey: 'buy',
    targetName: 'LOI Ready HVAC Co.',
    industry: 'HVAC services',
    jurisdiction: 'US-TX',
    revenueCents: 24_000_000_00,
    ebitdaCents: 5_000_000_00,
    purchasePriceCents: 40_000_000_00,
    enterpriseValueCents: 40_000_000_00,
    dealStructure:
      'asset purchase with senior debt, sponsor equity, seller note, and customary confirmatory diligence',
    keyTerms: {
      purchasePriceCents: 40_000_000_00,
      considerationMix: '60% senior debt / 40% sponsor equity, no binding financing commitment yet',
      exclusivity: '45-day no-shop requested, subject to counsel review',
      diligenceCondition: 'confirmatory QoE, legal, tax, commercial, and financing diligence',
      closingTimeline:
        'target signing in 30 days and closing 45-60 days after signing, subject to diligence and approvals',
    },
    workingCapitalPegCents: 1_800_000_00,
    sellerNoteCents: 4_000_000_00,
    escrowCents: 2_000_000_00,
    diligenceCondition: 'QoE, customer concentration, permits, contracts, tax, and benefits diligence',
    financingCondition: 'debt financing subject to lender diligence and credit approval',
    exclusivity: '45 days, counsel to draft and user decides whether to send',
    timeline: 'sign LOI after internal approval; close only after confirmatory diligence',
    modelOutputs: [{ modelId: 'MODEL.LBO.LMM.v1', outputHash: 'sha256:lbo-demo', status: 'complete' }],
    documents: [
      { id: 'ttm-financials', name: 'TTM P&L and Balance Sheet', type: 'financials', hash: 'sha256:ttm' },
      { id: 'tax-returns', name: 'Federal and state tax returns', type: 'tax', hash: 'sha256:tax' },
      { id: 'legal-contracts', name: 'Material contracts and corporate docs', type: 'legal', hash: 'sha256:legal' },
      {
        id: 'customer-analysis',
        name: 'Customer concentration and sales pipeline',
        type: 'commercial',
        hash: 'sha256:commercial',
      },
    ],
  };

  const ingest = executeDefinitiveDealStateTool('ingest_deal_payload', {
    idempotencyKey: 'methodology-matrix-loi-agent',
    payload,
  }) as any;
  assertEqual(ingest.ok, true, 'LOI ingest ok');

  const state = ingest.result.dealState as DefinitiveDealState;
  assertEqual(state.classificationKey.journey, 'buy', 'LOI journey is buy-side');
  assert(state.completenessReport.satisfied.includes('term_architecture_present'), 'term architecture present');
  assert(state.completenessReport.satisfied.includes('model_state_present'), 'model state present');
  assertEqual(state.completenessReport.level, 'DRL4_DILIGENCE_READY', 'LOI state is diligence-ready');

  const packetResponse = executeDefinitiveDealStateTool('prepare_loi_packet', {
    dealState: state,
    objective: 'prepare internal LOI architecture for counsel review',
    audience: 'internal_deal_team_and_counsel',
  }) as any;
  assertEqual(packetResponse.ok, true, 'prepare_loi_packet ok');

  const loiPacket = packetResponse.result.loiPacket;
  assertEqual(loiPacket.schema, 'LOIPacket.v0.1', 'LOI packet schema');
  assertEqual(loiPacket.loiBoundary.noBindingOffer, true, 'LOI is not a binding offer');
  assertEqual(loiPacket.loiBoundary.noClauseDrafting, true, 'LOI does not draft clauses');
  assertEqual(loiPacket.loiBoundary.noExternalTransmission, true, 'LOI does not transmit externally');
  assertEqual(loiPacket.modelDependencies.status, 'not_blocked', 'LOI model dependency satisfied');
  assertEqual(loiPacket.sourceGaps.length, 0, 'LOI source categories are covered');
  assert(loiPacket.takeBackArtifacts.includes('LOIPacket'), 'LOIPacket take-back artifact');

  const purchasePrice = loiPacket.economicTerms.find((term: any) => term.id === 'purchase_price');
  assert(purchasePrice, 'purchase price term returned');
  assertEqual(purchasePrice.status, 'payload_fact_present', 'purchase price is payload fact');
  const ebitda = loiPacket.economicTerms.find((term: any) => term.id === 'ebitda');
  assert(ebitda, 'EBITDA term returned');
  assertEqual(ebitda.status, 'payload_fact_present', 'EBITDA is payload fact');
  const diligenceCondition = loiPacket.closingConditions.find((term: any) => term.id === 'diligence_condition');
  assert(diligenceCondition, 'diligence condition returned');
  assertEqual(diligenceCondition.status, 'payload_fact_present', 'diligence condition is payload fact');
  const exclusivity = loiPacket.closingConditions.find((term: any) => term.id === 'exclusivity');
  assert(exclusivity, 'exclusivity term returned');
  assertEqual(exclusivity.status, 'payload_fact_present', 'exclusivity is payload fact');

  for (const toolName of ['compose_document_draft', 'prepare_diligence_request', 'prepare_negotiation_brief']) {
    assert(
      packetResponse.result.next_suggested_calls.some((call: any) => call.toolName === toolName),
      `LOI next calls include ${toolName}`,
    );
  }

  const draftResponse = executeDefinitiveDealStateTool('compose_document_draft', {
    dealState: state,
    documentType: 'loi_outline',
    audience: 'internal_deal_team_and_counsel',
  }) as any;
  assertEqual(draftResponse.ok, true, 'compose LOI draft ok');

  const documentDraft = draftResponse.result.documentDraft;
  assertEqual(documentDraft.schema, 'DocumentDraft.v0.1', 'LOI draft schema');
  assertEqual(documentDraft.documentType, 'loi_outline', 'LOI draft type');
  assert(documentDraft.sections.length > 0, 'LOI draft has sections');
  assertEqual(documentDraft.sourcePolicy.unsourcedClaimsAllowed, false, 'LOI draft forbids unsourced claims');
  assertEqual(documentDraft.exportBoundary.noExternalTransmission, true, 'LOI draft blocks external transmission');
  assertEqual(documentDraft.modelDependencies.status, 'not_blocked', 'LOI draft model dependency satisfied');
  assert(documentDraft.takeBackArtifacts.includes('DocumentDraft'), 'DocumentDraft take-back artifact');
});

await test('sell-side owner and owner-rep agents can enter at every sale-process stage', () => {
  const coreDocuments = [
    { id: 'sell-ttm-financials', name: 'Seller TTM P&L and balance sheet', type: 'financials', hash: 'sha256:sell-ttm' },
    { id: 'sell-tax-returns', name: 'Seller federal and state tax returns', type: 'tax', hash: 'sha256:sell-tax' },
    { id: 'sell-legal', name: 'Corporate records and material contracts', type: 'legal', hash: 'sha256:sell-legal' },
    { id: 'sell-commercial', name: 'Customer concentration and sales pipeline', type: 'commercial', hash: 'sha256:sell-commercial' },
  ];
  const closingDocuments = [
    ...coreDocuments,
    { id: 'sell-financing', name: 'Buyer financing commitment and payoff letters', type: 'financing', hash: 'sha256:sell-financing' },
  ];
  const baseSellerPayload = {
    companyName: 'OwnerCo Field Services',
    industry: 'HVAC services',
    jurisdiction: 'US-TX',
    revenueCents: 18_000_000_00,
    sdeCents: 3_200_000_00,
    ebitdaCents: 2_800_000_00,
    askingPriceCents: 22_000_000_00,
    actorRole: 'owner_representative',
    representedParty: 'owner',
  };

  const intake = executeDefinitiveDealStateTool('ingest_deal_payload', {
    idempotencyKey: 'methodology-matrix-sell-rep-s0',
    payload: {
      intent: 'I represent the owner and need to prepare the company for LOI/DD readiness.',
      companyName: 'OwnerCo Field Services',
      industry: 'HVAC services',
      jurisdiction: 'US-TX',
      actorRole: 'owner_representative',
      representedParty: 'owner',
    },
  }) as any;
  assertEqual(intake.ok, true, 'sell-side intake ingest ok');
  assertEqual(intake.result.classificationKey.journey, 'sell', 'owner-rep LOI/DD posture infers sell journey');
  assertEqual(intake.result.representationContext.side, 'sell_side', 'sell-side intake representation side');
  assertEqual(intake.result.representationContext.actorRole, 'owner_representative', 'owner rep actor role');
  assert(intake.result.representationContext.sellSidePreparationPath.length >= 5, 'sell-side preparation path returned');
  assert(intake.result.missingInputContract.minimalNextInputSet.includes('economic_scale'), 'intake asks for economic scale');

  const financials = executeDefinitiveDealStateTool('ingest_deal_payload', {
    idempotencyKey: 'methodology-matrix-sell-rep-s1',
    payload: {
      ...baseSellerPayload,
      journey: 'sell',
      actorRole: 'owner',
      intent: 'Owner preparing financials before going to market.',
      documents: [coreDocuments[0]],
    },
  }) as any;
  assertEqual(financials.ok, true, 'sell-side financials ingest ok');
  assertEqual(financials.result.representationContext.side, 'sell_side', 'sell-side financials representation side');
  assertEqual(financials.result.representationContext.actorRole, 'owner', 'owner actor role');

  const ioiPacket = executeDefinitiveDealStateTool('prepare_ioi_packet', {
    dealState: financials.result.dealState,
    objective: 'seller pre-IOI readiness',
    audience: 'owner_and_sell_side_advisors',
  }) as any;
  assertEqual(ioiPacket.ok, true, 'seller IOI readiness ok');
  assertEqual(ioiPacket.result.ioiPacket.representationContext.side, 'sell_side', 'IOI packet carries sell-side context');
  assertEqual(ioiPacket.result.ioiPacket.indicationBoundary.noExternalTransmission, true, 'seller IOI packet blocks external send');

  const dataRoomReady = executeDefinitiveDealStateTool('ingest_deal_payload', {
    idempotencyKey: 'methodology-matrix-sell-rep-s3',
    payload: {
      ...baseSellerPayload,
      journey: 'sell',
      intent: 'Owner representative preparing the seller data room and buyer diligence response plan.',
      dataRoomIndex: { status: 'drafted' },
      modelOutputs: [{ modelId: 'MODEL.VAL.TRIANGULATION.v1', outputHash: 'sha256:sell-valuation', status: 'complete' }],
      documents: coreDocuments,
    },
  }) as any;
  assertEqual(dataRoomReady.ok, true, 'sell-side data room ingest ok');
  assert(dataRoomReady.result.completenessReport.satisfied.includes('file_universe_present'), 'seller file universe present');
  assert(dataRoomReady.result.completenessReport.satisfied.includes('model_state_present'), 'seller model state present');

  const dataRoom = executeDefinitiveDealStateTool('compose_data_room_index', {
    dealState: dataRoomReady.result.dealState,
  }) as any;
  assertEqual(dataRoom.ok, true, 'seller data room index ok');
  assertEqual(dataRoom.result.dataRoomIndex.representationContext.side, 'sell_side', 'data room carries sell-side context');
  assertEqual(dataRoom.result.dataRoomIndex.sourceGaps.length, 0, 'core seller data room has no core source gaps');

  const diligence = executeDefinitiveDealStateTool('prepare_diligence_request', {
    dealState: dataRoomReady.result.dealState,
    objective: 'seller diligence readiness and buyer request response plan',
    audience: 'owner_and_sell_side_advisors',
  }) as any;
  assertEqual(diligence.ok, true, 'seller diligence readiness ok');
  assertEqual(diligence.result.diligenceRequest.representationContext.side, 'sell_side', 'diligence carries sell-side context');
  assertEqual(diligence.result.diligenceRequest.representationContext.purpose, 'prepare_for_due_diligence', 'diligence purpose is seller DD readiness');
  assertEqual(diligence.result.diligenceRequest.requestBoundary.noExternalTransmission, true, 'diligence does not send externally');

  const sellerDiligenceDraft = executeDefinitiveDealStateTool('compose_document_draft', {
    dealState: dataRoomReady.result.dealState,
    documentType: 'seller_diligence_readiness',
    audience: 'owner_and_sell_side_advisors',
  }) as any;
  assertEqual(sellerDiligenceDraft.ok, true, 'seller diligence readiness draft ok');
  assertEqual(sellerDiligenceDraft.result.documentDraft.documentType, 'seller_diligence_readiness', 'seller diligence draft type');
  assertEqual(sellerDiligenceDraft.result.documentDraft.representationContext.side, 'sell_side', 'seller diligence draft carries context');
  assertEqual(sellerDiligenceDraft.result.documentDraft.sourcePolicy.unsourcedClaimsAllowed, false, 'seller diligence draft source policy');

  const incomingLoi = executeDefinitiveDealStateTool('ingest_deal_payload', {
    idempotencyKey: 'methodology-matrix-sell-rep-s4',
    payload: {
      ...baseSellerPayload,
      journey: 'sell',
      intent: 'Owner representative reviewing an incoming buyer LOI.',
      stage: 'S4 incoming buyer LOI',
      purchasePriceCents: 24_000_000_00,
      enterpriseValueCents: 24_000_000_00,
      dealStructure: 'buyer-proposed asset purchase with seller note, escrow, and exclusivity',
      keyTerms: {
        buyerName: 'Strategic Buyer LLC',
        purchasePriceCents: 24_000_000_00,
        exclusivity: '60-day no-shop requested by buyer',
        diligenceCondition: 'confirmatory financial, legal, tax, customer, and operational diligence',
      },
      loi: {
        status: 'received_from_buyer',
        buyerName: 'Strategic Buyer LLC',
      },
      exclusivity: '60-day buyer no-shop request for owner/advisor review',
      diligenceCondition: 'confirmatory financial, legal, tax, customer, and operational diligence',
      financingCondition: 'buyer financing condition remains open',
      sellerNoteCents: 2_000_000_00,
      escrowCents: 1_500_000_00,
      workingCapitalPegCents: 1_200_000_00,
      modelOutputs: [{ modelId: 'MODEL.VAL.TRIANGULATION.v1', outputHash: 'sha256:sell-loi-model', status: 'complete' }],
      documents: coreDocuments,
    },
  }) as any;
  assertEqual(incomingLoi.ok, true, 'incoming seller LOI ingest ok');
  assertEqual(incomingLoi.result.representationContext.purpose, 'prepare_for_incoming_loi', 'incoming LOI purpose');

  const loiPacket = executeDefinitiveDealStateTool('prepare_loi_packet', {
    dealState: incomingLoi.result.dealState,
    objective: 'seller incoming LOI review and readiness',
    audience: 'owner_and_sell_side_advisors',
  }) as any;
  assertEqual(loiPacket.ok, true, 'seller LOI packet ok');
  assertEqual(loiPacket.result.loiPacket.representationContext.side, 'sell_side', 'seller LOI packet carries context');
  assertEqual(loiPacket.result.loiPacket.loiBoundary.noBindingOffer, true, 'seller LOI packet is not binding acceptance');
  assertEqual(loiPacket.result.loiPacket.loiBoundary.noClauseDrafting, true, 'seller LOI packet does not draft clauses');
  assertEqual(loiPacket.result.loiPacket.loiBoundary.noNegotiationAuthority, true, 'seller LOI packet does not negotiate');

  const negotiation = executeDefinitiveDealStateTool('prepare_negotiation_brief', {
    dealState: incomingLoi.result.dealState,
    objective: 'seller incoming LOI open-term review',
    audience: 'owner_and_sell_side_advisors',
  }) as any;
  assertEqual(negotiation.ok, true, 'seller negotiation brief ok');
  assertEqual(negotiation.result.negotiationBrief.representationContext.side, 'sell_side', 'negotiation brief carries context');
  assertEqual(negotiation.result.negotiationBrief.negotiationBoundary.noNegotiationAuthority, true, 'negotiation brief has no authority');

  const sellerLoiDraft = executeDefinitiveDealStateTool('compose_document_draft', {
    dealState: incomingLoi.result.dealState,
    documentType: 'seller_loi_readiness',
    audience: 'owner_and_sell_side_advisors',
  }) as any;
  assertEqual(sellerLoiDraft.ok, true, 'seller LOI readiness draft ok');
  assertEqual(sellerLoiDraft.result.documentDraft.documentType, 'seller_loi_readiness', 'seller LOI draft type');
  assertEqual(sellerLoiDraft.result.documentDraft.exportBoundary.noExternalTransmission, true, 'seller LOI draft blocks external send');

  const closingPrep = executeDefinitiveDealStateTool('ingest_deal_payload', {
    idempotencyKey: 'methodology-matrix-sell-rep-s5',
    payload: {
      ...incomingLoi.result.dealState.payload,
      intent: 'Owner representative preparing seller closing readiness and funds flow.',
      stage: 'S5 seller closing prep',
      closingConditions: ['financing approval', 'customer consents', 'tax review', 'counsel approval'],
      consents: ['top customer consent', 'landlord consent'],
      regulatoryApprovals: 'none identified by counsel yet',
      equityContributionCents: 23_500_000_00,
      seniorDebtCents: 20_000_000_00,
      debtPayoffCents: 1_000_000_00,
      closingCostsCents: 500_000_00,
      documents: closingDocuments,
      professionalClearance: { counsel: 'pending', tax: 'pending' },
    },
  }) as any;
  assertEqual(closingPrep.ok, true, 'seller closing prep ingest ok');
  assertEqual(closingPrep.result.representationContext.purpose, 'prepare_for_closing', 'closing purpose');

  const closeReadiness = executeDefinitiveDealStateTool('compose_close_readiness', {
    dealState: closingPrep.result.dealState,
    objective: 'seller closing readiness',
    audience: 'owner_and_sell_side_advisors',
  }) as any;
  assertEqual(closeReadiness.ok, true, 'seller close readiness ok');
  assertEqual(closeReadiness.result.closeReadiness.representationContext.side, 'sell_side', 'close readiness carries context');
  assertEqual(closeReadiness.result.closeReadiness.closeReadinessBoundary.noClosingAuthority, true, 'seller close readiness has no close authority');
  assertEqual(closeReadiness.result.closeReadiness.closeReadinessBoundary.noMoneyMovement, true, 'seller close readiness has no money movement');

  const fundsFlow = executeDefinitiveDealStateTool('generate_funds_flow', {
    dealState: closingPrep.result.dealState,
    objective: 'seller closing funds-flow arithmetic',
    audience: 'owner_and_sell_side_advisors',
  }) as any;
  assertEqual(fundsFlow.ok, true, 'seller funds flow ok');
  assertEqual(fundsFlow.result.fundsFlow.representationContext.side, 'sell_side', 'funds flow carries context');
  assertEqual(fundsFlow.result.fundsFlow.fundsFlowBoundary.noWireInstructions, true, 'funds flow has no wire instructions');
  assert(!('wireInstructions' in fundsFlow.result.fundsFlow), 'seller funds flow returns no wire instructions');
});

await test('closing and funds-flow outputs stay inside THE LINE', () => {
  const payload = {
    journey: 'buy',
    targetName: 'Closing Target',
    industry: 'software',
    jurisdiction: 'US-DE',
    purchasePriceCents: 10_000_000_00,
    ebitdaCents: 2_000_000_00,
    dealStructure: 'asset purchase with seller note',
    documents: [{ id: 'qoe', name: 'QoE report', type: 'qoe', hash: 'sha256:qoe' }],
  };

  const funds = executeDefinitiveDealStateTool('generate_funds_flow', {
    payload,
    objective: 'tell the parties where to wire the money',
  }) as any;
  assertEqual(funds.ok, true, 'generate_funds_flow ok');
  assertEqual(funds.result.fundsFlow.schema, 'FundsFlow.v0.1', 'FundsFlow schema');
  assert(funds.result.fundsFlow.reconciliation.boundary.includes('Closing advisors'), 'funds-flow boundary names closing advisors');
  assert(!('wireInstructions' in funds.result.fundsFlow), 'no wire instructions returned');

  const closeReadiness = executeDefinitiveDealStateTool('compose_close_readiness', { payload }) as any;
  assertEqual(closeReadiness.ok, true, 'compose_close_readiness ok');
  assertEqual(closeReadiness.result.closeReadiness.schema, 'CloseReadiness.v0.1', 'CloseReadiness schema');
  assert(closeReadiness.result.closeReadiness.readinessStatus !== 'approved_to_close', 'not a closing approval');
  assert(closeReadiness.result.closeReadiness.approvalMatrix.some((item: any) => item.requiredTool === 'close_deal'), 'close_deal is staged in the approval matrix');
  assert(!closeReadiness.result.closeReadiness.next_suggested_calls.some((call: any) => call.toolName === 'close_deal'), 'blocked close is not suggested for execution');
});

await test('market multiple resolver requires sourced or supplied LBO exit multiple', () => {
  const resolution = resolveMarketMultipleAssumptions({
    calculation: 'lbo',
    payload: {
      journey: 'buy',
      targetName: 'No Multiple Target',
      industry: 'HVAC services',
      jurisdiction: 'US-TX',
      ebitdaCents: 5_000_000_00,
      purchasePriceCents: 40_000_000_00,
    },
  });

  assertEqual(resolution.schema, 'MarketMultipleResolution.v0.1', 'market multiple schema');
  assertEqual(resolution.status, 'needs_market_intelligence', 'needs market intelligence status');
  assert(resolution.requiredInputs.includes('exit_multiple'), 'exit multiple required');
  assert(resolution.next_suggested_calls.some(call => call.toolName === 'fetch_market_data'), 'fetch market data suggested');
  assert(resolution.sourceGaps.some(gap => /Market multiple support/.test(gap.label)), 'market multiple source gap present');
});

await test('market multiple resolver accepts agent-supplied multiples with provenance', () => {
  const resolution = resolveMarketMultipleAssumptions({
    calculation: 'lbo',
    payload: {
      industry: 'B2B services',
      jurisdiction: 'US',
      ebitdaCents: 5_000_000_00,
      exit_multiple: 8.5,
    },
  });

  assertEqual(resolution.status, 'resolved', 'agent multiple resolved');
  assertEqual(resolution.assumptions[0].key, 'exit_multiple', 'exit multiple key');
  assertEqual(resolution.assumptions[0].sourceType, 'agent_supplied', 'agent supplied provenance');
  assert(resolution.assumptions[0].warning?.includes('caller assumption'), 'caller assumption warning');
});

await test('market multiple resolver accepts cited market packet for valuation range', () => {
  const resolution = resolveMarketMultipleAssumptions({
    calculation: 'valuation',
    payload: {
      industry: 'HVAC services',
      jurisdiction: 'US-TX',
      ebitdaCents: 1_200_000_00,
    },
    marketPacket: {
      title: 'HVAC services market multiple packet',
      metric: 'EBITDA',
      lowMultiple: 5.5,
      highMultiple: 7.25,
      citations: ['MARKET:HVAC_TX_2026', 'CLOSED_DEALS:HVAC_L3'],
      asOfDate: '2026-05-26',
      confidence: 'medium',
    },
  });

  assertEqual(resolution.status, 'resolved', 'market packet valuation resolved');
  assertEqual(resolution.assumptions.length, 2, 'low and high multiples returned');
  assert(resolution.assumptions.every(item => item.sourceType === 'market_packet'), 'market packet provenance');
  assert(resolution.assumptions.every(item => item.citations.includes('MARKET:HVAC_TX_2026')), 'citations carried');
  assertEqual(resolution.sourceGaps.length, 0, 'no source gaps for cited packet');
});

await test('market multiple packet builds sourced range from benchmarks and comps', () => {
  const packet = buildMarketMultiplePacketFromSources({
    calculation: 'lbo',
    industry: 'HVAC services',
    naicsCode: inferMarketMultipleNaicsCode('HVAC services'),
    geography: 'US-TX',
    league: 'L4',
    metric: 'ebitda',
    asOfDate: '2026-05-26',
  }, {
    benchmark: {
      naicsCode: '238220',
      naicsLabel: 'HVAC',
      ebitdaMultipleLow: 4,
      ebitdaMultipleMid: 5.5,
      ebitdaMultipleHigh: 7,
      dataYear: 2024,
      source: 'Pepperdine/BizBuySell/IBBA',
      dataSources: ['Pepperdine PCM 2024', 'BizBuySell Insight 2024'],
    },
    closedDeals: {
      dealCount: 12,
      lowEbitdaMultiple: 5.25,
      medianEbitdaMultiple: 6.1,
      highEbitdaMultiple: 7.4,
      latestClosedYear: 2026,
      league: 'L4',
    },
  });

  assertEqual(packet.schema, 'MarketMultiplePacket.v0.1', 'market packet schema');
  assertEqual(packet.status, 'resolved', 'market packet resolved');
  assertEqual(packet.metric, 'ebitda', 'EBITDA metric');
  assertEqual(packet.midMultiple, 6.1, 'closed deal median selected as current midpoint');
  assert(packet.citations.includes('NAICS_BENCHMARK:238220'), 'benchmark citation');
  assert(packet.citations.includes('CLOSED_DEALS:238220:L4'), 'closed-deal citation');
  assertEqual(packet.confidence, 'high', 'dual-source confidence');
});

await test('market multiple packet feeds LBO exit multiple as market-supported assumption', () => {
  const packet = buildMarketMultiplePacketFromSources({
    calculation: 'lbo',
    industry: 'HVAC services',
    naicsCode: '238220',
    metric: 'ebitda',
  }, {
    benchmark: {
      naicsCode: '238220',
      naicsLabel: 'HVAC',
      ebitdaMultipleLow: 4,
      ebitdaMultipleMid: 5.5,
      ebitdaMultipleHigh: 7,
      dataYear: 2024,
      source: 'Pepperdine/BizBuySell/IBBA',
    },
  });

  const resolution = resolveMarketMultipleAssumptions({
    calculation: 'lbo',
    payload: { industry: 'HVAC services', jurisdiction: 'US-TX', ebitdaCents: 5_000_000_00 },
    marketPacket: packet as unknown as Record<string, any>,
  });

  assertEqual(resolution.status, 'resolved', 'LBO resolved from market packet');
  assertEqual(resolution.assumptions[0].sourceType, 'market_packet', 'market packet provenance');
  assert(resolution.assumptions[0].citations.includes('NAICS_BENCHMARK:238220'), 'market citation carried into assumption');
});

await test('model preflight injects market-supported multiples before LBO execution', () => {
  const packet = buildMarketMultiplePacketFromSources({
    calculation: 'lbo',
    industry: 'HVAC services',
    naicsCode: '238220',
    metric: 'ebitda',
  }, {
    benchmark: {
      naicsCode: '238220',
      naicsLabel: 'HVAC',
      ebitdaMultipleLow: 4,
      ebitdaMultipleMid: 5.5,
      ebitdaMultipleHigh: 7,
      dataYear: 2024,
    },
  });

  const preflight = resolveModelMarketMultipleInputs({
    modelId: 'MODEL.LBO.LMM.v1',
    input: {
      purchase_price_cents: 40_000_000_00,
      debt_cents: 24_000_000_00,
      sponsor_equity_cents: 16_000_000_00,
      entry_ebitda_cents: 5_000_000_00,
    },
    payload: { industry: 'HVAC services', jurisdiction: 'US-TX' },
    marketPacket: packet as unknown as Record<string, any>,
  });

  assertEqual(preflight.status, 'ready', 'preflight ready');
  assertEqual(preflight.input.exit_multiple, 5.5, 'exit multiple injected from market packet');
  assertEqual(preflight.marketMultipleResolution?.assumptions[0].sourceType, 'market_packet', 'preflight provenance');
});

await test('model preflight blocks valuation-sensitive execution without multiples', () => {
  const preflight = resolveModelMarketMultipleInputs({
    modelId: 'MODEL.LBO.LMM.v1',
    input: {
      purchase_price_cents: 40_000_000_00,
      debt_cents: 24_000_000_00,
      sponsor_equity_cents: 16_000_000_00,
      entry_ebitda_cents: 5_000_000_00,
    },
    payload: { industry: 'HVAC services', jurisdiction: 'US-TX' },
  });

  assertEqual(preflight.status, 'needs_market_intelligence', 'preflight blocks missing market multiple');
  assert(preflight.marketMultipleResolution?.requiredInputs.includes('exit_multiple'), 'exit multiple required by preflight');
});

await test('deterministic LBO runtime refuses missing exit multiple', async () => {
  const run = await executeV19Model({
    modelId: 'MODEL.LBO.LMM.v1',
    input: {
      purchase_price_cents: 40_000_000_00,
      debt_cents: 24_000_000_00,
      sponsor_equity_cents: 16_000_000_00,
      entry_ebitda_cents: 5_000_000_00,
      hold_years: 5,
      ebitda_growth_pct: 0.05,
    },
  });

  assertEqual(run.status, 'needs_inputs', 'LBO needs inputs');
  assert(run.missingInputs.includes('exit_multiple'), 'LBO missing exit multiple');
  assertEqual(Object.keys(run.outputs).length, 0, 'no LBO outputs without exit multiple');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

function requireState(id: string) {
  const state = states.get(id);
  assert(state, `${id} state should exist`);
  return state;
}

async function test(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err: any) {
    console.log(`  ✗ ${name} - ${err.message}`);
    failed++;
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
