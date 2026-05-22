import { createHash } from 'node:crypto';
import {
  DEFINITIVE_METHODOLOGY_URI,
  DEFINITIVE_METHODOLOGY_VERSION,
  DEFINITIVE_SPEC_URI,
  DEFINITIVE_SPEC_VERSION,
} from '../constants/definitive.js';
import { classifyV19LeagueFromCents, type League } from '../constants/v19Leagues.js';
import {
  evaluateDefinitiveStackOverlays,
  normalizeDefinitiveStackSignals,
  type DefinitiveStackOverlay,
  type DefinitiveStackSignals,
} from './definitiveStackOverlays.js';

export const DEFINITIVE_DEAL_STATE_PROTOCOL = 'DEFINITIVE.deal-state.v0.1';

type Confidence = 'explicit' | 'inferred' | 'missing';
type Journey = 'sell' | 'buy' | 'raise' | 'pmi' | 'unknown';
type DealReadinessLevel =
  | 'DRL0_UNCLASSIFIED'
  | 'DRL1_CLASSIFIED'
  | 'DRL2_INDICATION_READY'
  | 'DRL3_LOI_ARCHITECTURE_READY'
  | 'DRL4_DILIGENCE_READY';

export interface DefinitiveClassificationKey {
  journey: Journey;
  subJourney: string;
  league: League | 'unknown';
  jurisdiction: string;
  distressPosture: 'healthy_or_unknown' | 'stressed_or_liability_management' | 'distressed';
  assetClass: 'operating_business_or_unknown' | 'real_estate' | 'digital_assets' | 'infrastructure';
  industry: string;
  taxClassification: string;
  triggeredOverlayGates: Array<'G28' | 'G29' | 'G30'>;
  confidence: Record<
    'journey' | 'subJourney' | 'league' | 'jurisdiction' | 'distressPosture' | 'assetClass' | 'industry' | 'taxClassification',
    Confidence
  >;
}

export interface DefinitiveMissingInputItem {
  field: string;
  label: string;
  reason: string;
  unlocks: string[];
  priority: 'P0' | 'P1' | 'P2';
  surface: 'chat' | 'files' | 'pipeline' | 'studio' | 'models';
}

export interface DefinitiveMissingInputContract {
  status: 'missing_inputs' | 'sufficient_for_next_step';
  items: DefinitiveMissingInputItem[];
  minimalNextInputSet: string[];
  yuliaPrompt: string;
  lineNote: string;
}

export interface DefinitiveCompletenessReport {
  definitionOfDoneVersion: 'DEFINITIVE.definition-of-done.v0.1';
  level: DealReadinessLevel;
  score: number;
  satisfied: string[];
  missing: DefinitiveMissingInputItem[];
  blockers: string[];
  nextGate: string;
  canProceedWithPartialState: boolean;
  theLineInvariant: string;
}

export interface DefinitiveDealState {
  protocol: typeof DEFINITIVE_DEAL_STATE_PROTOCOL;
  stateId: string;
  cid: string;
  stateHash: string;
  revision: number;
  parentCids: string[];
  idempotencyKey: string | null;
  payload: Record<string, any>;
  classificationKey: DefinitiveClassificationKey;
  overlays: DefinitiveStackOverlay[];
  signals: DefinitiveStackSignals | null;
  missingInputContract: DefinitiveMissingInputContract;
  completenessReport: DefinitiveCompletenessReport;
  sourceIndex: Array<Record<string, any>>;
  methodologyVersion: typeof DEFINITIVE_METHODOLOGY_VERSION;
  methodologyUri: typeof DEFINITIVE_METHODOLOGY_URI;
  specVersion: typeof DEFINITIVE_SPEC_VERSION;
  specUri: typeof DEFINITIVE_SPEC_URI;
}

export interface DefinitiveMcpCallHint {
  toolName: string;
  priority: 'P0' | 'P1' | 'P2';
  reason: string;
  inputHint: Record<string, any>;
}

const LINE_INVARIANT =
  'DEFINITIVE computes, organizes, cites, and routes deal work. The user, counsel, advisor, or court makes legal, tax, fairness, feasibility, solvency, negotiation, and closing determinations.';

const DEFINITION_OF_DONE = {
  version: 'DEFINITIVE.definition-of-done.v0.1' as const,
  levels: [
    {
      level: 'DRL0_UNCLASSIFIED',
      doneWhen: ['The payload exists but lacks enough facts to classify the deal journey.'],
      nextAction: 'Ask for the intended journey, target/deal subject, industry, jurisdiction, and one economic scale fact.',
    },
    {
      level: 'DRL1_CLASSIFIED',
      doneWhen: ['Journey is known and either deal subject, industry, jurisdiction, or size is present.'],
      nextAction: 'Build or update the DealState and ask only for the missing facts that unlock IOI work.',
    },
    {
      level: 'DRL2_INDICATION_READY',
      doneWhen: ['Deal subject, journey, economic scale, jurisdiction, and at least one source/document reference are present.'],
      nextAction: 'Compose the model stack and produce IOI/readiness artifacts with caveats for missing sources.',
    },
    {
      level: 'DRL3_LOI_ARCHITECTURE_READY',
      doneWhen: ['Structure, key terms, economic scale, and material risk/overlay gates are known.'],
      nextAction: 'Prepare LOI/economic-term architecture and route legal/tax clause conclusions to counsel.',
    },
    {
      level: 'DRL4_DILIGENCE_READY',
      doneWhen: ['Core documents, data room index, model outputs, and specialist/pass-through blockers are tracked.'],
      nextAction: 'Run iterative diligence, model updates, negotiation prep, Studio outputs, and data-room maintenance.',
    },
  ],
  lifecycle:
    'Get information, form the IOI, learn more, structure the LOI, run diligence, model, negotiate, close, and continue into PMI as a recursive DealState loop.',
  lineInvariant: LINE_INVARIANT,
};

export function executeDefinitiveDealStateTool(toolName: string, input: Record<string, any>) {
  switch (toolName) {
    case 'ingest_deal_payload':
      return ingestDefinitiveDealPayload(input);
    case 'update_deal_payload':
      return updateDefinitiveDealPayload(input);
    case 'check_completeness':
      return checkDefinitiveCompleteness(input);
    case 'get_definition_of_done':
      return getDefinitiveDefinitionOfDone(input);
    case 'compose_deal_plan':
      return composeDefinitiveDealPlan(input);
    case 'diff_deal_state':
      return diffDefinitiveDealState(input);
    case 'compose_deal_package':
      return composeDefinitiveDealPackage(input);
    case 'resume_deal':
      return resumeDefinitiveDeal(input);
    case 'compose_lifecycle_trace':
      return composeDefinitiveLifecycleTrace(input);
    case 'prepare_ioi_packet':
      return prepareDefinitiveIoiPacket(input);
    case 'prepare_loi_packet':
      return prepareDefinitiveLoiPacket(input);
    case 'compose_data_room_index':
      return composeDefinitiveDataRoomIndex(input);
    case 'prepare_diligence_request':
      return prepareDefinitiveDiligenceRequest(input);
    case 'disclose_subset':
      return discloseDefinitiveSubset(input);
    case 'compose_document_draft':
      return composeDefinitiveDocumentDraft(input);
    case 'prepare_negotiation_brief':
      return prepareDefinitiveNegotiationBrief(input);
    default:
      return {
        ok: false,
        error: 'unsupported_deal_state_tool',
        supportedTools: [
          'ingest_deal_payload',
          'update_deal_payload',
          'check_completeness',
          'get_definition_of_done',
          'compose_deal_plan',
          'diff_deal_state',
          'compose_deal_package',
          'resume_deal',
          'compose_lifecycle_trace',
          'prepare_ioi_packet',
          'prepare_loi_packet',
          'compose_data_room_index',
          'prepare_diligence_request',
          'disclose_subset',
          'compose_document_draft',
          'prepare_negotiation_brief',
        ],
      };
  }
}

export function isDefinitiveDealStateTool(toolName: string): boolean {
  return [
    'ingest_deal_payload',
    'update_deal_payload',
    'check_completeness',
    'get_definition_of_done',
    'compose_deal_plan',
    'diff_deal_state',
    'compose_deal_package',
    'resume_deal',
    'compose_lifecycle_trace',
    'prepare_ioi_packet',
    'prepare_loi_packet',
    'compose_data_room_index',
    'prepare_diligence_request',
    'disclose_subset',
    'compose_document_draft',
    'prepare_negotiation_brief',
  ].includes(toolName);
}

export function ingestDefinitiveDealPayload(input: Record<string, any>) {
  const payload = normalizePayload(input.payload ?? input.dealPayload ?? input);
  const state = buildDealState({
    payload,
    revision: 1,
    idempotencyKey: nullableString(input.idempotencyKey),
    parentCids: [],
  });
  return buildDealStateResult('ingest_deal_payload', state, null);
}

export function updateDefinitiveDealPayload(input: Record<string, any>) {
  const prior = normalizePriorState(input.dealState ?? input.state);
  const basePayload = prior?.payload && typeof prior.payload === 'object' ? prior.payload : normalizePayload(input.payload ?? {});
  const patch = normalizePayload(input.patch ?? input.dealPayloadPatch ?? {});
  const payload = deepMerge(basePayload, patch);
  const state = buildDealState({
    payload,
    revision: (prior?.revision || 0) + 1,
    idempotencyKey: nullableString(input.idempotencyKey) || prior?.idempotencyKey || null,
    parentCids: prior?.cid ? [prior.cid, ...(prior.parentCids || [])] : [],
  });
  return buildDealStateResult('update_deal_payload', state, prior?.completenessReport?.score ?? null);
}

export function checkDefinitiveCompleteness(input: Record<string, any>) {
  const prior = normalizePriorState(input.dealState ?? input.state);
  const state =
    prior ||
    buildDealState({
      payload: normalizePayload(input.payload ?? input.dealPayload ?? input),
      revision: 1,
      idempotencyKey: nullableString(input.idempotencyKey),
      parentCids: [],
    });

  return {
    ok: true,
    action: 'check_completeness',
    result: {
      objective: nullableString(input.objective) || 'next_deal_step',
      definitionOfDone: DEFINITION_OF_DONE,
      dealState: state,
      classificationKey: state.classificationKey,
      completenessReport: state.completenessReport,
      missingInputContract: state.missingInputContract,
      next_suggested_calls: buildNextCallHints(state),
    },
    state_hash_after: state.stateHash,
    completeness_contribution_delta: 0,
    methodology_version: DEFINITIVE_METHODOLOGY_VERSION,
    the_line_invariant: LINE_INVARIANT,
  };
}

export function getDefinitiveDefinitionOfDone(input: Record<string, any> = {}) {
  return {
    ok: true,
    action: 'get_definition_of_done',
    result: {
      objective: nullableString(input.objective) || 'whole_deal_lifecycle',
      definitionOfDone: DEFINITION_OF_DONE,
      iterativeDealLoop: [
        'ingest_deal_payload',
        'update_deal_payload',
        'check_completeness',
        'compose_model_stack',
        'execute_model',
        'create or update Studio/data-room artifacts',
        'return DealStateDiff and next_suggested_calls to the calling agent',
      ],
      noRejectionContract:
        'A partial payload is accepted, classified where possible, scored for completeness, and returned with a MissingInputContract instead of rejected.',
    },
    state_hash_after: null,
    completeness_contribution_delta: 0,
    methodology_version: DEFINITIVE_METHODOLOGY_VERSION,
    the_line_invariant: LINE_INVARIANT,
  };
}

export function composeDefinitiveDealPlan(input: Record<string, any>) {
  const state = stateFromInput(input);
  const dealPlan = buildDealPlan(state);
  return {
    ok: true,
    action: 'compose_deal_plan',
    result: {
      dealState: state,
      dealPlan,
      classificationKey: state.classificationKey,
      completenessReport: state.completenessReport,
      next_suggested_calls: buildNextCallHints(state),
      portableTakeBackArtifacts: ['DealPlan', 'DealState', 'CompletenessReport', 'MCPCallHint[]'],
    },
    state_hash_after: state.stateHash,
    completeness_contribution_delta: 0,
    methodology_version: DEFINITIVE_METHODOLOGY_VERSION,
    the_line_invariant: LINE_INVARIANT,
  };
}

export function diffDefinitiveDealState(input: Record<string, any>) {
  const previous = stateFromInput({
    dealState: input.previousDealState ?? input.beforeState,
    payload: input.previousPayload ?? input.beforePayload ?? {},
    idempotencyKey: input.previousIdempotencyKey,
  });
  const next = stateFromInput({
    dealState: input.nextDealState ?? input.afterState ?? input.dealState,
    payload: input.nextPayload ?? input.afterPayload ?? input.payload ?? {},
    idempotencyKey: input.nextIdempotencyKey,
  });
  const changedPaths = diffObjects(previous.payload, next.payload);
  const previousMissing = new Set(previous.missingInputContract.items.map(item => item.field));
  const nextMissing = new Set(next.missingInputContract.items.map(item => item.field));
  const previousGates = new Set(previous.classificationKey.triggeredOverlayGates);
  const nextGates = new Set(next.classificationKey.triggeredOverlayGates);
  return {
    ok: true,
    action: 'diff_deal_state',
    result: {
      dealStateDiff: {
        previousCid: previous.cid,
        nextCid: next.cid,
        previousHash: previous.stateHash,
        nextHash: next.stateHash,
        changedPaths,
        completenessScoreDelta: next.completenessReport.score - previous.completenessReport.score,
        resolvedMissingInputs: [...previousMissing].filter(field => !nextMissing.has(field)),
        newMissingInputs: [...nextMissing].filter(field => !previousMissing.has(field)),
        addedOverlayGates: [...nextGates].filter(gate => !previousGates.has(gate)),
        removedOverlayGates: [...previousGates].filter(gate => !nextGates.has(gate)),
        previousLevel: previous.completenessReport.level,
        nextLevel: next.completenessReport.level,
      },
      nextDealState: next,
      next_suggested_calls: buildNextCallHints(next),
      portableTakeBackArtifacts: ['DealStateDiff', 'DealState', 'MCPCallHint[]'],
    },
    state_hash_after: next.stateHash,
    completeness_contribution_delta: next.completenessReport.score - previous.completenessReport.score,
    methodology_version: DEFINITIVE_METHODOLOGY_VERSION,
    the_line_invariant: LINE_INVARIANT,
  };
}

export function composeDefinitiveDealPackage(input: Record<string, any>) {
  const state = stateFromInput(input);
  const dealPlan = buildDealPlan(state);
  const nextSuggestedCalls = buildNextCallHints(state);
  const dealPackage = {
    packageId: `dealpkg_${state.stateHash.slice(0, 16)}`,
    packageCid: `definitive:deal-package:sha256:${sha256(stableStringify({
      stateHash: state.stateHash,
      dealPlanId: dealPlan.planId,
      schema: 'DealPackage.v0.1',
    }))}`,
    schema: 'DealPackage.v0.1',
    dealStateCid: state.cid,
    dealStateHash: state.stateHash,
    readinessLevel: state.completenessReport.level,
    classificationKey: state.classificationKey,
    completenessReport: state.completenessReport,
    missingInputContract: state.missingInputContract,
    dealPlan,
    sourceIndex: state.sourceIndex,
    next_suggested_calls: nextSuggestedCalls,
    takeBackArtifacts: [
      'DealPackage',
      'DealState',
      'DealPlan',
      'ClassificationKey',
      'CompletenessReport',
      'MissingInputContract',
      'MCPCallHint[]',
    ],
    excludedOrDeferred: buildPackageDeferrals(state),
    lineInvariant: LINE_INVARIANT,
  };

  return {
    ok: true,
    action: 'compose_deal_package',
    result: {
      dealPackage,
      dealState: state,
      next_suggested_calls: nextSuggestedCalls,
      portableTakeBackArtifacts: dealPackage.takeBackArtifacts,
    },
    state_hash_after: state.stateHash,
    completeness_contribution_delta: 0,
    methodology_version: DEFINITIVE_METHODOLOGY_VERSION,
    the_line_invariant: LINE_INVARIANT,
  };
}

export function resumeDefinitiveDeal(input: Record<string, any>) {
  const state = stateFromInput(input);
  const packageResult = composeDefinitiveDealPackage({ dealState: state });
  const dealPackage = packageResult.result.dealPackage;
  return {
    ok: true,
    action: 'resume_deal',
    result: {
      dealState: state,
      currentStage: dealPackage.dealPlan.currentStage,
      dealPlan: dealPackage.dealPlan,
      completenessReport: state.completenessReport,
      missingInputContract: state.missingInputContract,
      next_suggested_calls: dealPackage.next_suggested_calls,
      dealPackage,
      resumeContract: {
        acceptedInputs: ['DealState', 'DealPayload', 'DealPackage plus companion DealState'],
        noRejectionContract:
          'If the agent cannot supply complete facts, resume_deal returns current DealState, missing inputs, current stage, and next_suggested_calls.',
        recursiveLoop:
          'resume -> update_deal_payload -> compose_model_stack/execute_model -> check_completeness -> compose_deal_package -> repeat',
        humanAndAgentSurfaces: ['today', 'pipeline', 'files', 'data_room', 'studio', 'models', 'audit_package'],
      },
      portableTakeBackArtifacts: [
        'DealState',
        'DealPlan',
        'DealPackage',
        'CompletenessReport',
        'MissingInputContract',
        'MCPCallHint[]',
      ],
    },
    state_hash_after: state.stateHash,
    completeness_contribution_delta: 0,
    methodology_version: DEFINITIVE_METHODOLOGY_VERSION,
    the_line_invariant: LINE_INVARIANT,
  };
}

export function composeDefinitiveLifecycleTrace(input: Record<string, any>) {
  const state = stateFromInput(input);
  const dealPlan = buildDealPlan(state);
  const rawEvents = normalizeLifecycleEvents(state.payload);
  const events = rawEvents.length ? rawEvents : synthesizeLifecycleEvents(state, dealPlan);
  const artifactRefs = buildLifecycleArtifactRefs(state);
  const currentStage = dealPlan.currentStage;
  const traceHash = sha256(stableStringify({
    dealStateHash: state.stateHash,
    currentStage,
    events,
    artifactRefs,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
  }));
  const lifecycleTrace = {
    traceId: `lifetrace_${traceHash.slice(0, 16)}`,
    schema: 'LifecycleTrace.v0.1',
    dealStateCid: state.cid,
    dealStateHash: state.stateHash,
    currentStage,
    readinessLevel: state.completenessReport.level,
    lifecycle: dealPlan.lifecycle,
    stageTrace: dealPlan.stages.map(stage => ({
      id: stage.id,
      label: stage.label,
      status: stage.status,
      missing: stage.missing,
      suggestedTools: stage.suggestedTools,
    })),
    events,
    artifactRefs,
    blockers: state.completenessReport.blockers,
    loopContract: {
      recursiveLoop:
        'compose_lifecycle_trace -> update_deal_payload with new event/source/model output -> check_completeness -> compose_deal_package -> repeat',
      noRejectionContract:
        'Incomplete deal history is acceptable. The trace returns synthesized current-state events and next_suggested_calls instead of rejecting the agent.',
      humanAndAgentSurfaces: ['today', 'pipeline', 'files', 'data_room', 'studio', 'models', 'audit_package'],
    },
    next_suggested_calls: [
      {
        toolName: 'update_deal_payload',
        priority: events.length ? 'P2' as const : 'P1' as const,
        reason: 'Append the next deal event, source, model output, or artifact reference after the next iterative work pass.',
        inputHint: {
          dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision },
          patch: {
            dealEvents: [
              {
                eventType: '<ioi|loi|diligence|model|negotiation|close|pmi>',
                label: '<what happened>',
                stage: currentStage,
                sourceRefs: [],
                artifactRefs: [],
              },
            ],
          },
        },
      },
      {
        toolName: 'compose_deal_package',
        priority: 'P1' as const,
        reason: 'Package the lifecycle trace with the current DealState and next-call hints for agent take-back.',
        inputHint: { dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision } },
      },
      ...nextLifecycleTraceCalls(state, currentStage),
    ],
    takeBackArtifacts: ['LifecycleTrace', 'DealState', 'DealPlan', 'MCPCallHint[]'],
    lineInvariant: LINE_INVARIANT,
  };

  return {
    ok: true,
    action: 'compose_lifecycle_trace',
    result: {
      lifecycleTrace,
      dealState: state,
      dealPlan,
      missingInputContract: state.missingInputContract,
      next_suggested_calls: lifecycleTrace.next_suggested_calls,
      portableTakeBackArtifacts: lifecycleTrace.takeBackArtifacts,
    },
    state_hash_after: state.stateHash,
    completeness_contribution_delta: 0,
    methodology_version: DEFINITIVE_METHODOLOGY_VERSION,
    the_line_invariant: LINE_INVARIANT,
  };
}

export function prepareDefinitiveIoiPacket(input: Record<string, any>) {
  const state = stateFromInput(input);
  const objective = textValue(input.objective) || 'indication_of_interest';
  const audience = textValue(input.audience) || 'internal_deal_team';
  const sourceRefs = sourceRefsForCategories(state, ['financials', 'commercial']);
  const sourceGaps = ['financials', 'commercial']
    .filter(category => !sourceRefs.some(source => source.category === category))
    .map(category => ({
      category,
      reason: `IOI packet needs ${category} source support before external use.`,
      suggestedTool: 'compose_data_room_index',
    }));
  const knownFacts = buildIoiKnownFacts(state);
  const preliminaryEconomics = buildIoiPreliminaryEconomics(state);
  const missingInputs = state.missingInputContract.items
    .filter(item => item.priority !== 'P2')
    .map(item => ({
      field: item.field,
      label: item.label,
      priority: item.priority,
      reason: item.reason,
      surface: item.surface,
    }));
  const needsModelState = !state.completenessReport.satisfied.includes('model_state_present');
  const packetHash = sha256(stableStringify({
    dealStateHash: state.stateHash,
    objective,
    audience,
    knownFacts,
    preliminaryEconomics,
    sourceGaps,
    missingInputs,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
  }));
  const ioiPacket = {
    packetId: `ioi_${packetHash.slice(0, 16)}`,
    schema: 'IOIPacket.v0.1',
    dealStateCid: state.cid,
    dealStateHash: state.stateHash,
    objective,
    audience,
    stage: currentStageForState(state),
    readinessLevel: state.completenessReport.level,
    knownFacts,
    preliminaryEconomics,
    sourceRefs,
    sourceGaps,
    missingInputs,
    modelDependencies: {
      required: needsModelState,
      status: needsModelState ? 'missing_model_state' : 'not_blocked',
      suggestedTool: needsModelState ? 'compose_model_stack' : null,
    },
    indicationBoundary: {
      composedOnly: true,
      noOfferAuthority: true,
      noValuationOpinion: true,
      noExternalTransmission: true,
      userDecides: 'The user decides whether an IOI should be sent, what economics to indicate, and what conditions to include.',
    },
    next_suggested_calls: [
      ...(sourceGaps.length
        ? [{
            toolName: 'compose_data_room_index',
            priority: 'P1' as const,
            reason: `Fill IOI source gaps: ${sourceGaps.map(gap => gap.category).join(', ')}.`,
            inputHint: { dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision } },
          }]
        : []),
      ...(needsModelState
        ? [{
            toolName: 'compose_model_stack',
            priority: 'P1' as const,
            reason: 'Tie IOI economics to deterministic model outputs before export or counterparty use.',
            inputHint: {
              journey: state.classificationKey.journey,
              league: state.classificationKey.league === 'unknown' ? undefined : state.classificationKey.league,
              dealType: state.payload.dealType || state.payload.structure || state.classificationKey.subJourney,
              signals: state.signals || undefined,
            },
          }]
        : []),
      {
        toolName: 'compose_document_draft',
        priority: sourceGaps.length || needsModelState ? 'P2' as const : 'P1' as const,
        reason: 'Render the IOI packet into a source-aware Studio IOI scaffold.',
        inputHint: {
          dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision },
          documentType: 'ioi',
          audience,
        },
      },
      {
        toolName: 'prepare_diligence_request',
        priority: 'P2' as const,
        reason: 'Prepare the next diligence ask list for the learn-more loop after IOI.',
        inputHint: { dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision } },
      },
    ],
    takeBackArtifacts: ['IOIPacket', 'DealState', 'DocumentDraft', 'MCPCallHint[]'],
    lineInvariant: LINE_INVARIANT,
  };

  return {
    ok: true,
    action: 'prepare_ioi_packet',
    result: {
      ioiPacket,
      dealState: state,
      missingInputContract: state.missingInputContract,
      next_suggested_calls: ioiPacket.next_suggested_calls,
      portableTakeBackArtifacts: ioiPacket.takeBackArtifacts,
    },
    state_hash_after: state.stateHash,
    completeness_contribution_delta: 0,
    methodology_version: DEFINITIVE_METHODOLOGY_VERSION,
    the_line_invariant: LINE_INVARIANT,
  };
}

export function prepareDefinitiveLoiPacket(input: Record<string, any>) {
  const state = stateFromInput(input);
  const objective = textValue(input.objective) || 'loi_architecture';
  const audience = textValue(input.audience) || 'internal_deal_team_and_counsel';
  const sourceRefs = sourceRefsForCategories(state, ['financials', 'legal', 'tax', 'commercial']);
  const sourceGaps = ['financials', 'legal', 'tax', 'commercial']
    .filter(category => !sourceRefs.some(source => source.category === category))
    .map(category => ({
      category,
      reason: `LOI packet needs ${category} source support before counsel review or external use.`,
      suggestedTool: 'compose_data_room_index',
    }));
  const dealArchitecture = buildLoiDealArchitecture(state);
  const economicTerms = buildLoiEconomicTerms(state);
  const closingConditions = buildLoiClosingConditions(state);
  const handoffs = buildLoiHandoffs(state);
  const missingInputs = state.missingInputContract.items
    .filter(item => item.priority !== 'P2')
    .map(item => ({
      field: item.field,
      label: item.label,
      priority: item.priority,
      reason: item.reason,
      surface: item.surface,
    }));
  const needsModelState = !state.completenessReport.satisfied.includes('model_state_present');
  const packetHash = sha256(stableStringify({
    dealStateHash: state.stateHash,
    objective,
    audience,
    dealArchitecture,
    economicTerms,
    closingConditions,
    handoffs,
    sourceGaps,
    missingInputs,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
  }));
  const loiPacket = {
    packetId: `loi_${packetHash.slice(0, 16)}`,
    schema: 'LOIPacket.v0.1',
    dealStateCid: state.cid,
    dealStateHash: state.stateHash,
    objective,
    audience,
    stage: currentStageForState(state),
    readinessLevel: state.completenessReport.level,
    dealArchitecture,
    economicTerms,
    closingConditions,
    sourceRefs,
    sourceGaps,
    missingInputs,
    handoffs,
    modelDependencies: {
      required: needsModelState,
      status: needsModelState ? 'missing_model_state' : 'not_blocked',
      suggestedTool: needsModelState ? 'compose_model_stack' : null,
    },
    loiBoundary: {
      composedOnly: true,
      noBindingOffer: true,
      noClauseDrafting: true,
      noLegalOpinion: true,
      noTaxOpinion: true,
      noNegotiationAuthority: true,
      noExternalTransmission: true,
      userAndCounselDecide:
        'The user and counsel decide whether to send an LOI, which terms to include, clause language, enforceability, signature authority, and counterparty communications.',
    },
    next_suggested_calls: [
      ...(sourceGaps.length
        ? [{
            toolName: 'compose_data_room_index',
            priority: 'P1' as const,
            reason: `Fill LOI source gaps: ${sourceGaps.map(gap => gap.category).join(', ')}.`,
            inputHint: { dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision } },
          }]
        : []),
      ...(needsModelState
        ? [{
            toolName: 'compose_model_stack',
            priority: 'P1' as const,
            reason: 'Tie LOI economics and agreement mechanics to deterministic model outputs before export or counterparty use.',
            inputHint: {
              journey: state.classificationKey.journey,
              league: state.classificationKey.league === 'unknown' ? undefined : state.classificationKey.league,
              dealType: state.payload.dealType || state.payload.structure || state.classificationKey.subJourney,
              signals: state.signals || undefined,
            },
          }]
        : []),
      {
        toolName: 'compose_document_draft',
        priority: sourceGaps.length || needsModelState ? 'P2' as const : 'P1' as const,
        reason: 'Render the LOI packet into a source-aware Studio LOI outline scaffold.',
        inputHint: {
          dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision },
          documentType: 'loi_outline',
          audience,
        },
      },
      {
        toolName: 'prepare_diligence_request',
        priority: 'P2' as const,
        reason: 'Prepare the diligence request list that follows the LOI architecture pass.',
        inputHint: { dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision } },
      },
      {
        toolName: 'prepare_negotiation_brief',
        priority: 'P2' as const,
        reason: 'Track open terms and model-backed range status without negotiating or recommending concessions.',
        inputHint: { dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision } },
      },
    ],
    takeBackArtifacts: ['LOIPacket', 'DealState', 'DocumentDraft', 'DiligenceRequest', 'MCPCallHint[]'],
    lineInvariant: LINE_INVARIANT,
  };

  return {
    ok: true,
    action: 'prepare_loi_packet',
    result: {
      loiPacket,
      dealState: state,
      missingInputContract: state.missingInputContract,
      next_suggested_calls: loiPacket.next_suggested_calls,
      portableTakeBackArtifacts: loiPacket.takeBackArtifacts,
    },
    state_hash_after: state.stateHash,
    completeness_contribution_delta: 0,
    methodology_version: DEFINITIVE_METHODOLOGY_VERSION,
    the_line_invariant: LINE_INVARIANT,
  };
}

export function composeDefinitiveDataRoomIndex(input: Record<string, any>) {
  const state = stateFromInput(input);
  const requiredCategories = requiredDataRoomCategories(state);
  const categories = buildDataRoomCategories(state.sourceIndex, requiredCategories);
  const missingCategories = categories.filter(category => category.status === 'missing').map(category => category.id);
  const dataRoomIndex = {
    indexId: `dataroom_${state.stateHash.slice(0, 16)}`,
    schema: 'DataRoomIndex.v0.1',
    dealStateCid: state.cid,
    dealStateHash: state.stateHash,
    classificationKey: state.classificationKey,
    totalSources: state.sourceIndex.length,
    citationReadyCount: state.sourceIndex.filter(source => source.citationReady).length,
    categories,
    sourceGaps: missingCategories.map(category => ({
      category,
      reason: `No source indexed for required ${category} diligence bucket.`,
      suggestedTool: 'update_deal_payload',
    })),
    next_suggested_calls: [
      ...missingCategories.slice(0, 4).map(category => ({
        toolName: 'update_deal_payload',
        priority: 'P0',
        reason: `Add source files or indexed references for ${category}.`,
        inputHint: {
          dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision },
          patch: { documents: [{ type: category, hash: '<sha256_or_source_ref>' }] },
        },
      })),
      {
        toolName: 'check_completeness',
        priority: missingCategories.length ? 'P1' : 'P2',
        reason: 'Re-score the deal after data-room coverage changes.',
        inputHint: { dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision } },
      },
    ],
    takeBackArtifacts: ['DataRoomIndex', 'SourceIndex', 'MissingInputContract', 'MCPCallHint[]'],
    lineInvariant: LINE_INVARIANT,
  };

  return {
    ok: true,
    action: 'compose_data_room_index',
    result: {
      dataRoomIndex,
      dealState: state,
      missingInputContract: state.missingInputContract,
      next_suggested_calls: dataRoomIndex.next_suggested_calls,
      portableTakeBackArtifacts: dataRoomIndex.takeBackArtifacts,
    },
    state_hash_after: state.stateHash,
    completeness_contribution_delta: 0,
    methodology_version: DEFINITIVE_METHODOLOGY_VERSION,
    the_line_invariant: LINE_INVARIANT,
  };
}

export function prepareDefinitiveDiligenceRequest(input: Record<string, any>) {
  const state = stateFromInput(input);
  const objective = textValue(input.objective) || 'iterative_due_diligence';
  const audience = textValue(input.audience) || 'deal_team_and_counterparty';
  const requestedCategories = uniqueStrings([
    ...normalizeStringList(input.categories),
    ...requiredDataRoomCategories(state),
  ]);
  const requestGroups = buildDiligenceRequestGroups(state, requestedCategories);
  const sourceGaps = requestGroups
    .filter(group => group.status !== 'source_ready')
    .map(group => ({
      category: group.id,
      label: group.label,
      reason: group.missingSourceCategories.length
        ? `Missing source support for ${group.missingSourceCategories.join(', ')}.`
        : 'Category needs review-ready source support.',
      suggestedTool: 'compose_data_room_index',
    }));
  const missingInputs = state.missingInputContract.items.map(item => ({
    field: item.field,
    label: item.label,
    priority: item.priority,
    surface: item.surface,
    unlocks: item.unlocks,
  }));
  const needsModelState = !state.completenessReport.satisfied.includes('model_state_present');
  const handoffs = buildDiligenceHandoffs(state);
  const requestHash = sha256(stableStringify({
    dealStateHash: state.stateHash,
    objective,
    audience,
    requestedCategories,
    requestGroups: requestGroups.map(group => ({
      id: group.id,
      status: group.status,
      missingSourceCategories: group.missingSourceCategories,
      requestIds: group.requests.map(request => request.id),
    })),
    missingInputs,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
  }));
  const diligenceRequest = {
    requestId: `diligence_${requestHash.slice(0, 16)}`,
    schema: 'DiligenceRequest.v0.1',
    dealStateCid: state.cid,
    dealStateHash: state.stateHash,
    objective,
    audience,
    stage: currentStageForState(state),
    readinessLevel: state.completenessReport.level,
    requestedCategories,
    requestGroups,
    sourceGaps,
    missingInputs,
    modelDependencies: {
      required: needsModelState,
      status: needsModelState ? 'missing_model_state' : 'not_blocked',
      suggestedTool: needsModelState ? 'compose_model_stack' : null,
    },
    handoffs,
    requestBoundary: {
      composedOnly: true,
      noExternalTransmission: true,
      noLegalDemand: true,
      noNegotiationAuthority: true,
      externalSendRequires: 'A5_EXTERNAL_DISCLOSURE approval through a separate share/send action.',
      userDecides: 'The user and advisors decide what to send, to whom, and whether a request is appropriate.',
    },
    next_suggested_calls: [
      ...(sourceGaps.length
        ? [{
            toolName: 'compose_data_room_index',
            priority: 'P1' as const,
            reason: `Refresh the data-room index and fill diligence source gaps: ${sourceGaps.map(gap => gap.category).join(', ')}.`,
            inputHint: { dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision } },
          }]
        : []),
      ...(needsModelState
        ? [{
            toolName: 'compose_model_stack',
            priority: 'P1' as const,
            reason: 'Tie diligence asks to the deterministic model stack before relying on model-dependent requests.',
            inputHint: {
              journey: state.classificationKey.journey,
              league: state.classificationKey.league === 'unknown' ? undefined : state.classificationKey.league,
              dealType: state.payload.dealType || state.payload.structure || state.classificationKey.subJourney,
              signals: state.signals || undefined,
            },
          }]
        : []),
      {
        toolName: 'compose_document_draft',
        priority: sourceGaps.length || needsModelState ? 'P2' as const : 'P1' as const,
        reason: 'Render the diligence request packet into a Studio diligence request scaffold when ready.',
        inputHint: {
          dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision },
          documentType: 'diligence_request',
          audience,
        },
      },
    ],
    takeBackArtifacts: ['DiligenceRequest', 'DataRoomIndex', 'MissingInputContract', 'MCPCallHint[]'],
    lineInvariant: LINE_INVARIANT,
  };

  return {
    ok: true,
    action: 'prepare_diligence_request',
    result: {
      diligenceRequest,
      dealState: state,
      missingInputContract: state.missingInputContract,
      next_suggested_calls: diligenceRequest.next_suggested_calls,
      portableTakeBackArtifacts: diligenceRequest.takeBackArtifacts,
    },
    state_hash_after: state.stateHash,
    completeness_contribution_delta: 0,
    methodology_version: DEFINITIVE_METHODOLOGY_VERSION,
    the_line_invariant: LINE_INVARIANT,
  };
}

export function discloseDefinitiveSubset(input: Record<string, any>) {
  const state = stateFromInput(input);
  const explicitCategories = normalizeStringList(
    input.categories ?? input.disclosureCategories ?? input.scope?.categories,
  ).map(category => category.toLowerCase());
  const selectedSourceIds = new Set(normalizeStringList(input.sourceIds ?? input.selectedSourceIds).map(String));
  const objective = textValue(input.objective) || textValue(input.stage) || textValue(input.purpose) || state.completenessReport.nextGate;
  const categories = explicitCategories.length ? explicitCategories : disclosureCategoriesForObjective(objective, state);
  const maxSources = Math.max(1, Math.min(50, Number(input.maxSources ?? 20) || 20));
  type CategorizedSource = Record<string, any> & { category: string };
  const categorizedSources: CategorizedSource[] = state.sourceIndex.map(source => ({
    ...source,
    category: inferDataRoomCategory(source),
  }));
  const categorySet = new Set(categories);
  let selectedSources: CategorizedSource[] = categorizedSources.filter(source => (
    (categorySet.size === 0 || categorySet.has(source.category)) ||
    selectedSourceIds.has(String(source.id))
  ));

  if (!selectedSources.length && selectedSourceIds.size > 0) {
    selectedSources = categorizedSources.filter(source => selectedSourceIds.has(String(source.id)));
  }
  if (!selectedSources.length && categorySet.size === 0) {
    selectedSources = categorizedSources;
  }
  selectedSources = selectedSources.slice(0, maxSources).map(source => ({
    id: source.id,
    name: source.name ?? source.id,
    type: source.type,
    category: source.category,
    hash: source.hash,
    sourceUri: source.sourceUri ?? null,
    citationReady: source.citationReady,
  }));

  const selectedIds = new Set(selectedSources.map(source => String(source.id)));
  const excludedSources = categorizedSources
    .filter(source => !selectedIds.has(String(source.id)))
    .map(source => ({
      id: source.id,
      category: source.category,
      reason: selectedSourceIds.size > 0 || categorySet.size > 0 ? 'outside_requested_subset_scope' : 'above_max_sources_limit',
    }));
  const sourceGaps = categories
    .filter(category => !selectedSources.some(source => source.category === category))
    .map(category => ({
      category,
      reason: `No indexed source in requested ${category} disclosure scope.`,
      suggestedTool: 'compose_data_room_index',
    }));
  const proofHash = sha256(stableStringify({
    dealStateHash: state.stateHash,
    objective,
    categories,
    selectedSources: selectedSources.map(source => ({
      id: source.id,
      hash: source.hash,
      category: source.category,
    })),
    specVersion: DEFINITIVE_SPEC_VERSION,
  }));
  const disclosureSubset = {
    subsetId: `subset_${proofHash.slice(0, 16)}`,
    schema: 'DisclosureSubset.v0.1',
    dealStateCid: state.cid,
    dealStateHash: state.stateHash,
    objective,
    audience: textValue(input.audience) || textValue(input.recipientRole) || 'agent_or_principal',
    categories,
    sources: selectedSources,
    excludedSources,
    sourceGaps,
    selectiveDisclosureProof: {
      proofType: 'sha256:selected-source-manifest',
      proofHash,
      includesOnlySelectedSources: true,
      sourceCount: selectedSources.length,
      excludedSourceCount: excludedSources.length,
    },
    disclosureBoundary: {
      composedOnly: true,
      noExternalTransmission: true,
      externalShareRequires: 'A5_EXTERNAL_DISCLOSURE approval through a separate share/export action.',
    },
    next_suggested_calls: [
      ...(sourceGaps.length
        ? [{
            toolName: 'compose_data_room_index',
            priority: 'P1' as const,
            reason: 'Refresh the data-room index and fill missing requested disclosure categories.',
            inputHint: { dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision } },
          }]
        : []),
      {
        toolName: 'compose_deal_package',
        priority: sourceGaps.length ? 'P2' as const : 'P1' as const,
        reason: 'Attach the disclosure subset to the portable deal package when the receiving system needs a full take-back packet.',
        inputHint: { dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision } },
      },
    ],
    takeBackArtifacts: ['DisclosureSubset', 'SourceIndex', 'SelectiveDisclosureProof', 'MCPCallHint[]'],
    lineInvariant: LINE_INVARIANT,
  };

  return {
    ok: true,
    action: 'disclose_subset',
    result: {
      disclosureSubset,
      dealState: state,
      missingInputContract: state.missingInputContract,
      next_suggested_calls: disclosureSubset.next_suggested_calls,
      portableTakeBackArtifacts: disclosureSubset.takeBackArtifacts,
    },
    state_hash_after: state.stateHash,
    completeness_contribution_delta: 0,
    methodology_version: DEFINITIVE_METHODOLOGY_VERSION,
    the_line_invariant: LINE_INVARIANT,
  };
}

export function composeDefinitiveDocumentDraft(input: Record<string, any>) {
  const state = stateFromInput(input);
  const documentType = normalizeDocumentType(input.documentType ?? input.kind ?? input.objective);
  const audience = textValue(input.audience) || audienceForDocumentType(documentType);
  const sections = buildDocumentDraftSections(documentType, state);
  const missingSourceCategories = uniqueStrings(sections.flatMap(section => section.missingSourceCategories));
  const needsModelState = ['ic_memo', 'loi_outline', 'negotiation_brief'].includes(documentType) && !state.completenessReport.satisfied.includes('model_state_present');
  const draftInput = {
    dealStateHash: state.stateHash,
    documentType,
    audience,
    sections: sections.map(section => ({
      id: section.id,
      status: section.status,
      sourceRefs: section.sourceRefs.map(source => ({ id: source.id, hash: source.hash })),
    })),
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
  };
  const draftHash = sha256(stableStringify(draftInput));
  const documentDraft = {
    draftId: `draft_${draftHash.slice(0, 16)}`,
    schema: 'DocumentDraft.v0.1',
    dealStateCid: state.cid,
    dealStateHash: state.stateHash,
    documentType,
    stage: currentStageForState(state),
    audience,
    title: documentDraftTitle(documentType, state),
    sections,
    sourcePolicy: {
      unsourcedClaimsAllowed: false,
      uncheckedClaimsFlag: '[unverified]',
      sourceRefsRequiredBeforeExternalExport: true,
    },
    modelDependencies: {
      required: needsModelState,
      status: needsModelState ? 'missing_model_state' : 'not_blocked',
      suggestedTool: needsModelState ? 'compose_model_stack' : null,
    },
    exportBoundary: {
      composedOnly: true,
      noExternalTransmission: true,
      externalExportRequires: 'A5_EXTERNAL_DISCLOSURE approval through a separate export/share action.',
    },
    next_suggested_calls: [
      ...(missingSourceCategories.length
        ? [{
            toolName: 'compose_data_room_index',
            priority: 'P1' as const,
            reason: `Fill source gaps for draft sections: ${missingSourceCategories.join(', ')}.`,
            inputHint: { dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision } },
          }]
        : []),
      ...(needsModelState
        ? [{
            toolName: 'compose_model_stack',
            priority: 'P1' as const,
            reason: `${documentDraftTitle(documentType, state)} should be tied to deterministic model outputs before export.`,
            inputHint: { payload: state.payload },
          }]
        : []),
      {
        toolName: 'compose_deal_package',
        priority: missingSourceCategories.length || needsModelState ? 'P2' as const : 'P1' as const,
        reason: 'Package the draft with DealState, source refs, model dependencies, and next calls for agent take-back.',
        inputHint: { dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision } },
      },
    ],
    takeBackArtifacts: ['DocumentDraft', 'SourceIndex', 'MissingInputContract', 'MCPCallHint[]'],
    lineInvariant: LINE_INVARIANT,
  };

  return {
    ok: true,
    action: 'compose_document_draft',
    result: {
      documentDraft,
      dealState: state,
      missingInputContract: state.missingInputContract,
      next_suggested_calls: documentDraft.next_suggested_calls,
      portableTakeBackArtifacts: documentDraft.takeBackArtifacts,
    },
    state_hash_after: state.stateHash,
    completeness_contribution_delta: 0,
    methodology_version: DEFINITIVE_METHODOLOGY_VERSION,
    the_line_invariant: LINE_INVARIANT,
  };
}

export function prepareDefinitiveNegotiationBrief(input: Record<string, any>) {
  const state = stateFromInput(input);
  const objective = textValue(input.objective) || 'negotiation_preparation';
  const audience = textValue(input.audience) || 'internal_deal_team';
  const openTerms = buildNegotiationOpenTerms(state);
  const sourceGaps = uniqueStrings(openTerms.flatMap(term => term.missingSourceCategories)).map(category => ({
    category,
    reason: `Negotiation brief needs ${category} source support before external use.`,
    suggestedTool: 'compose_data_room_index',
  }));
  const modelBackedRanges = buildNegotiationModelRanges(state);
  const needsModelState = !state.completenessReport.satisfied.includes('model_state_present');
  const handoffs = buildNegotiationHandoffs(state);
  const briefHash = sha256(stableStringify({
    dealStateHash: state.stateHash,
    objective,
    audience,
    openTerms: openTerms.map(term => ({ id: term.id, status: term.status, missing: term.missingSourceCategories })),
    modelBackedRanges,
    handoffs,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
  }));
  const negotiationBrief = {
    briefId: `negbrief_${briefHash.slice(0, 16)}`,
    schema: 'NegotiationBrief.v0.1',
    dealStateCid: state.cid,
    dealStateHash: state.stateHash,
    objective,
    audience,
    stage: currentStageForState(state),
    readinessLevel: state.completenessReport.level,
    openTerms,
    modelBackedRanges,
    sourceGaps,
    handoffs,
    negotiationBoundary: {
      computedOnly: true,
      noRecommendation: true,
      noNegotiationAuthority: true,
      noExternalTransmission: true,
      userDecides: 'The user and their advisors decide positions, concessions, legal language, and whether to send anything externally.',
    },
    next_suggested_calls: [
      ...(sourceGaps.length
        ? [{
            toolName: 'compose_data_room_index',
            priority: 'P1' as const,
            reason: `Fill negotiation source gaps: ${sourceGaps.map(gap => gap.category).join(', ')}.`,
            inputHint: { dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision } },
          }]
        : []),
      ...(needsModelState
        ? [{
            toolName: 'compose_model_stack',
            priority: 'P1' as const,
            reason: 'Negotiation brief should be tied to deterministic model outputs before relying on ranges.',
            inputHint: { payload: state.payload },
          }]
        : []),
      {
        toolName: 'compose_document_draft',
        priority: sourceGaps.length || needsModelState ? 'P2' as const : 'P1' as const,
        reason: 'Render this control packet into a Studio negotiation brief scaffold when source/model readiness is acceptable.',
        inputHint: {
          dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision },
          documentType: 'negotiation_brief',
        },
      },
    ],
    takeBackArtifacts: ['NegotiationBrief', 'DealState', 'SourceGapList', 'MCPCallHint[]'],
    lineInvariant: LINE_INVARIANT,
  };

  return {
    ok: true,
    action: 'prepare_negotiation_brief',
    result: {
      negotiationBrief,
      dealState: state,
      missingInputContract: state.missingInputContract,
      next_suggested_calls: negotiationBrief.next_suggested_calls,
      portableTakeBackArtifacts: negotiationBrief.takeBackArtifacts,
    },
    state_hash_after: state.stateHash,
    completeness_contribution_delta: 0,
    methodology_version: DEFINITIVE_METHODOLOGY_VERSION,
    the_line_invariant: LINE_INVARIANT,
  };
}

function buildDealStateResult(action: 'ingest_deal_payload' | 'update_deal_payload', state: DefinitiveDealState, priorScore: number | null) {
  const scoreDelta = priorScore == null ? state.completenessReport.score : state.completenessReport.score - priorScore;
  return {
    ok: true,
    action,
    result: {
      dealState: state,
      classificationKey: state.classificationKey,
      missingInputContract: state.missingInputContract,
      completenessReport: state.completenessReport,
      next_suggested_calls: buildNextCallHints(state),
      portableTakeBackArtifacts: [
        'DealState',
        'ClassificationKey',
        'MissingInputContract',
        'CompletenessReport',
        'MCPCallHint[]',
      ],
    },
    state_hash_after: state.stateHash,
    completeness_contribution_delta: scoreDelta,
    methodology_version: DEFINITIVE_METHODOLOGY_VERSION,
    the_line_invariant: LINE_INVARIANT,
  };
}

function stateFromInput(input: Record<string, any>): DefinitiveDealState {
  const prior = normalizePriorState(input.dealState ?? input.state);
  if (prior) return prior;
  return buildDealState({
    payload: normalizePayload(input.payload ?? input.dealPayload ?? input),
    revision: 1,
    idempotencyKey: nullableString(input.idempotencyKey),
    parentCids: [],
  });
}

function buildDealState(input: {
  payload: Record<string, any>;
  revision: number;
  idempotencyKey: string | null;
  parentCids: string[];
}): DefinitiveDealState {
  const payload = normalizePayload(input.payload);
  const signals = normalizeSignals(payload);
  const overlays = evaluateDefinitiveStackOverlays({
    dealType: textValue(payload.dealType) || textValue(payload.structure) || textValue(payload.intent) || textValue(payload.notes),
    industry: textValue(payload.industry),
    jurisdiction: textValue(payload.jurisdiction),
    signals,
  });
  const classificationKey = classifyPayload(payload, overlays, signals);
  const sourceIndex = normalizeSourceIndex(payload);
  const missingInputContract = buildMissingInputContract(payload, classificationKey, sourceIndex);
  const completenessReport = buildCompletenessReport(payload, classificationKey, sourceIndex, missingInputContract);
  const hashInput = {
    payload,
    classificationKey,
    overlays: overlays.map(overlay => ({
      gateId: overlay.gateId,
      triggered: overlay.triggered,
      reasons: overlay.reasons,
      catalogModels: overlay.catalogModels,
    })),
    revision: input.revision,
    parentCids: input.parentCids,
    idempotencyKey: input.idempotencyKey,
    specVersion: DEFINITIVE_SPEC_VERSION,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
  };
  const stateHash = sha256(stableStringify(hashInput));
  return {
    protocol: DEFINITIVE_DEAL_STATE_PROTOCOL,
    stateId: `dealstate_${stateHash.slice(0, 16)}`,
    cid: `definitive:deal-state:sha256:${stateHash}`,
    stateHash,
    revision: input.revision,
    parentCids: input.parentCids,
    idempotencyKey: input.idempotencyKey,
    payload,
    classificationKey,
    overlays,
    signals,
    missingInputContract,
    completenessReport,
    sourceIndex,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
    methodologyUri: DEFINITIVE_METHODOLOGY_URI,
    specVersion: DEFINITIVE_SPEC_VERSION,
    specUri: DEFINITIVE_SPEC_URI,
  };
}

function buildDealPlan(state: DefinitiveDealState) {
  const currentStage = currentStageForState(state);
  const stages = [
    buildPlanStage(state, 'intake', 'Intake and classification', ['journey_classified', 'deal_subject_present'], currentStage),
    buildPlanStage(state, 'ioi', 'IOI and indication of interest', ['economic_scale_present', 'source_trail_present'], currentStage),
    buildPlanStage(state, 'loi', 'LOI and deal architecture', ['deal_structure_present', 'term_architecture_present'], currentStage),
    buildPlanStage(state, 'diligence', 'Due diligence and data room', ['file_universe_present'], currentStage),
    buildPlanStage(state, 'model', 'Model and deal mechanics', ['model_state_present'], currentStage),
    buildPlanStage(state, 'negotiation', 'Negotiation preparation', ['term_architecture_present', 'model_state_present'], currentStage),
    buildPlanStage(state, 'close_pmi', 'Close and PMI loop', ['file_universe_present', 'model_state_present'], currentStage),
  ];
  return {
    planId: `dealplan_${state.stateHash.slice(0, 16)}`,
    status: state.missingInputContract.status === 'missing_inputs' ? 'partial_but_actionable' : 'ready_for_next_step',
    currentStage,
    lifecycle:
      'information -> IOI -> LOI -> diligence -> model -> negotiation -> close -> PMI, with DealState updated after every recursive pass',
    routingKey: state.classificationKey,
    stages,
    overlayGates: state.classificationKey.triggeredOverlayGates,
    workSurfaces: ['today', 'pipeline', 'files', 'studio', 'models', 'data_room'],
    nextActions: state.missingInputContract.items.slice(0, 4).map(item => ({
      label: item.label,
      reason: item.reason,
      surface: item.surface,
      unlocks: item.unlocks,
    })),
    lineInvariant: LINE_INVARIANT,
  };
}

function normalizeLifecycleEvents(payload: Record<string, any>) {
  const source = payload.dealEvents
    ?? payload.lifecycleEvents
    ?? payload.events
    ?? payload.activityLog
    ?? payload.history
    ?? payload.milestones
    ?? payload.timeline
    ?? [];
  const list = Array.isArray(source)
    ? source
    : source && typeof source === 'object'
      ? Object.values(source as Record<string, unknown>)
      : [source];
  return list
    .filter(item => item != null && item !== '')
    .map((item, index) => normalizeLifecycleEvent(item, index))
    .filter((event): event is Record<string, any> => Boolean(event));
}

function normalizeLifecycleEvent(item: unknown, index: number): Record<string, any> | null {
  if (typeof item === 'string') {
    return {
      id: `event_${index + 1}`,
      eventType: stageFromLifecycleText(item),
      stage: stageFromLifecycleText(item),
      label: item,
      summary: item,
      sourceRefs: [],
      artifactRefs: [],
    };
  }
  if (!item || typeof item !== 'object') return null;
  const record = item as Record<string, any>;
  const label = textValue(record.label) || textValue(record.title) || textValue(record.summary) || textValue(record.eventType) || `Deal event ${index + 1}`;
  const stage = textValue(record.stage) || stageFromLifecycleText(compactText([label, record.eventType, record.kind, record.type]));
  return {
    id: textValue(record.id) || `event_${index + 1}`,
    occurredAt: textValue(record.occurredAt) || textValue(record.date) || null,
    eventType: textValue(record.eventType) || textValue(record.type) || stage,
    stage,
    label,
    summary: textValue(record.summary) || label,
    actor: textValue(record.actor) || textValue(record.owner) || null,
    sourceRefs: Array.isArray(record.sourceRefs) ? record.sourceRefs : [],
    artifactRefs: Array.isArray(record.artifactRefs) ? record.artifactRefs : [],
    lineBoundary: LINE_INVARIANT,
  };
}

function synthesizeLifecycleEvents(state: DefinitiveDealState, dealPlan: ReturnType<typeof buildDealPlan>) {
  return [{
    id: 'event_current_state',
    eventType: 'state_snapshot',
    stage: dealPlan.currentStage,
    label: `${dealPlan.currentStage} state observed`,
    summary: `DEFINITIVE synthesized this trace from the current DealState because no explicit dealEvents/history payload was supplied.`,
    sourceRefs: state.sourceIndex.slice(0, 8).map(source => ({ id: source.id, hash: source.hash })),
    artifactRefs: [],
    lineBoundary: LINE_INVARIANT,
  }];
}

function stageFromLifecycleText(value: string): string {
  const text = value.toLowerCase();
  if (matches(text, ['pmi', 'post close', 'post-close', 'integration', 'day 0'])) return 'close_pmi';
  if (matches(text, ['close', 'closing', 'signed', 'funded'])) return 'close_pmi';
  if (matches(text, ['negotiate', 'negotiation', 'markup', 'redline'])) return 'negotiation';
  if (matches(text, ['model', 'valuation', 'lbo', 'working capital', 'qoe'])) return 'model';
  if (matches(text, ['diligence', 'data room', 'files', 'request list'])) return 'diligence';
  if (matches(text, ['loi', 'letter of intent', 'term sheet'])) return 'loi';
  if (matches(text, ['ioi', 'indication'])) return 'ioi';
  return 'intake';
}

function buildLifecycleArtifactRefs(state: DefinitiveDealState) {
  const refs: Array<Record<string, any>> = [];
  if (state.sourceIndex.length) {
    refs.push({
      id: 'source_index',
      type: 'SourceIndex',
      count: state.sourceIndex.length,
      citationReadyCount: state.sourceIndex.filter(source => source.citationReady).length,
    });
  }
  for (const [key, type] of [
    ['ioi', 'IOI'],
    ['loi', 'LOI'],
    ['dataRoomIndex', 'DataRoomIndex'],
    ['modelOutputs', 'ModelOutput'],
    ['modelRuns', 'ModelOutput'],
    ['valuation', 'ModelOutput'],
    ['lbo', 'ModelOutput'],
    ['negotiationBrief', 'NegotiationBrief'],
    ['diligenceRequest', 'DiligenceRequest'],
  ] as const) {
    if (hasAnyValue(state.payload, [key])) {
      refs.push({
        id: key,
        type,
        hash: sha256(stableStringify(state.payload[key])),
      });
    }
  }
  return refs;
}

function sourceRefsForCategories(state: DefinitiveDealState, categories: string[]) {
  type CategorizedSource = Record<string, any> & { category: string };
  const categorySet = new Set(categories);
  const sourceIndex: CategorizedSource[] = state.sourceIndex.map(source => ({
    ...source,
    category: inferDataRoomCategory(source),
  }));
  return sourceIndex
    .filter(source => categorySet.has(source.category))
    .map(source => ({
      id: source.id,
      name: source.name ?? source.id,
      type: source.type,
      category: source.category,
      hash: source.hash,
      citationReady: source.citationReady,
    }));
}

function buildIoiKnownFacts(state: DefinitiveDealState) {
  const payload = state.payload;
  const facts = [
    ioiFact('deal_subject', 'Deal subject', firstPresentValue(payload, ['dealName', 'targetName', 'companyName', 'subject', 'thesis'])),
    ioiFact('journey', 'Journey', state.classificationKey.journey),
    ioiFact('industry', 'Industry', state.classificationKey.industry),
    ioiFact('jurisdiction', 'Jurisdiction', state.classificationKey.jurisdiction),
    ioiFact('league', 'V19 league', state.classificationKey.league),
    ioiFact('structure', 'Structure', firstPresentValue(payload, ['dealStructure', 'structure', 'transactionType', 'dealType'])),
  ];
  return facts.filter(fact => fact.status !== 'missing');
}

function buildIoiPreliminaryEconomics(state: DefinitiveDealState) {
  const payload = state.payload;
  return [
    ioiMoneyFact('revenueCents', 'Revenue', firstNumber(payload, ['revenueCents', 'ttmRevenueCents', 'salesCents'])),
    ioiMoneyFact('ebitdaCents', 'EBITDA', firstNumber(payload, ['ebitdaCents', 'adjustedEbitdaCents'])),
    ioiMoneyFact('sdeCents', 'SDE', firstNumber(payload, ['sdeCents', 'sellerDiscretionaryEarningsCents'])),
    ioiMoneyFact('enterpriseValueCents', 'Enterprise value', firstNumber(payload, ['enterpriseValueCents'])),
    ioiMoneyFact('purchasePriceCents', 'Purchase price', firstNumber(payload, ['purchasePriceCents'])),
  ].filter(fact => fact.status !== 'missing');
}

function buildLoiDealArchitecture(state: DefinitiveDealState) {
  const payload = state.payload;
  return [
    loiFact(
      state,
      'structure',
      'Transaction structure',
      firstPresentValue(payload, ['dealStructure', 'structure', 'transactionType', 'dealType']) || state.classificationKey.subJourney,
      ['legal', 'tax'],
      ['M200', 'M201', 'M211'],
      'DEFINITIVE organizes structure facts and model dependencies. Counsel and tax advisors decide clause language, legal form, and tax positions.',
    ),
    loiFact(
      state,
      'consideration_mix',
      'Consideration mix',
      firstPresentValue(payload, ['considerationMix', 'cashConsiderationCents', 'sellerNoteCents', 'rolloverPercent', 'earnoutCents']),
      ['financials', 'legal', 'tax'],
      ['M200', 'M204', 'M213'],
      'DEFINITIVE organizes consideration mechanics. The user and advisors choose economics, offer authority, and binding terms.',
    ),
    loiFact(
      state,
      'tax_classification',
      'Tax classification',
      state.classificationKey.taxClassification,
      ['tax'],
      ['M200', 'M201', 'M202', 'M203', 'M204', 'M205'],
      'DEFINITIVE computes tax mechanics from supplied facts. Tax positions and opinions remain with qualified tax review.',
    ),
    loiFact(
      state,
      'jurisdiction',
      'Governing jurisdiction / deal jurisdiction',
      state.classificationKey.jurisdiction,
      ['legal'],
      ['M211', 'M212'],
      'DEFINITIVE tracks jurisdiction because it changes agreement mechanics and gates. Counsel decides governing law, enforceability, and filing posture.',
    ),
    loiFact(
      state,
      'overlay_gates',
      'Triggered overlay gates',
      state.classificationKey.triggeredOverlayGates.length ? state.classificationKey.triggeredOverlayGates : null,
      ['legal', 'tax', 'financials'],
      ['G28', 'G29', 'G30'],
      'Overlay gates route additional mechanics and specialist review; they are not legal, tax, solvency, feasibility, or court determinations.',
    ),
  ];
}

function buildLoiEconomicTerms(state: DefinitiveDealState) {
  const payload = state.payload;
  return [
    loiMoneyTerm(state, 'purchase_price', 'Purchase price', firstNumber(payload, ['purchasePriceCents', 'headlinePriceCents']), ['financials'], ['M206', 'M208']),
    loiMoneyTerm(state, 'enterprise_value', 'Enterprise value', firstNumber(payload, ['enterpriseValueCents', 'evCents']), ['financials'], ['M200']),
    loiMoneyTerm(state, 'revenue', 'Revenue', firstNumber(payload, ['revenueCents', 'ttmRevenueCents', 'salesCents']), ['financials'], ['M101-M223 routing']),
    loiMoneyTerm(state, 'ebitda', 'EBITDA', firstNumber(payload, ['ebitdaCents', 'adjustedEbitdaCents']), ['financials'], ['M101-M223 routing']),
    loiMoneyTerm(state, 'working_capital_peg', 'Working capital peg', firstNumber(payload, ['workingCapitalPegCents', 'nwcPegCents']), ['financials'], ['M109', 'M210']),
    loiMoneyTerm(state, 'escrow_holdback', 'Escrow or holdback', firstNumber(payload, ['escrowCents', 'holdbackCents']), ['legal', 'financials'], ['M206', 'M208']),
    loiMoneyTerm(state, 'seller_note', 'Seller note', firstNumber(payload, ['sellerNoteCents', 'sellerFinancingCents']), ['financials', 'legal', 'tax'], ['M204', 'M213']),
    loiMoneyTerm(state, 'earnout', 'Earnout', firstNumber(payload, ['earnoutCents']), ['financials', 'legal', 'tax'], ['M111-M115', 'M213']),
    {
      id: 'rollover',
      label: 'Rollover equity',
      status: hasAnyValue(payload, ['rolloverPercent', 'rolloverCents']) ? 'payload_fact_present' : 'missing',
      value: firstPresentValue(payload, ['rolloverPercent', 'rolloverCents']),
      sourceRefs: refsForCategories(state, ['legal', 'tax', 'financials']),
      missingSourceCategories: missingSourceCategoriesFor(state, ['legal', 'tax', 'financials']),
      modelRefs: ['M200', 'M201', 'M213'],
      boundary: 'Rollover mechanics are organized for modeling and counsel review; DEFINITIVE does not recommend economics or tax treatment.',
    },
  ];
}

function buildLoiClosingConditions(state: DefinitiveDealState) {
  const payload = state.payload;
  return [
    loiCondition(state, 'diligence_condition', 'Diligence condition', firstPresentValue(payload, ['diligenceCondition', 'dueDiligenceCondition', 'diligence']), ['legal', 'commercial'], ['M211']),
    loiCondition(state, 'financing_condition', 'Financing condition', firstPresentValue(payload, ['financingCondition', 'debtFinancing', 'financing']), ['legal', 'financials'], ['M211', 'M182', 'M183', 'M184']),
    loiCondition(state, 'regulatory_approvals', 'Regulatory approvals', firstPresentValue(payload, ['regulatoryApprovals', 'approvals', 'hsr', 'cfius']), ['legal'], ['M128', 'M211']),
    loiCondition(state, 'third_party_consents', 'Third-party consents', firstPresentValue(payload, ['consents', 'thirdPartyConsents', 'customerConsents', 'landlordConsents']), ['legal', 'commercial'], ['M211']),
    loiCondition(state, 'exclusivity', 'Exclusivity / no-shop', firstPresentValue(payload, ['exclusivity', 'noShop', 'goShop']), ['legal'], ['M212']),
    loiCondition(state, 'timing', 'Timing and signing/closing path', firstPresentValue(payload, ['timeline', 'closingTimeline', 'signingDate', 'closingDate']), ['legal', 'commercial'], ['M210', 'M211']),
  ];
}

function buildLoiHandoffs(state: DefinitiveDealState) {
  const handoffs: Array<Record<string, any>> = buildPackageDeferrals(state).map(deferral => ({
    ...deferral,
    lineStatus: 'requires_professional_or_user_determination',
  }));
  handoffs.push({
    category: 'clause_language_and_enforceability',
    reason: 'LOI clause drafting, binding/non-binding architecture, enforceability, and signature authority remain with counsel and the user.',
    suggestedTool: 'defer_to_counsel',
    lineStatus: 'counsel_review_required',
  });
  handoffs.push({
    category: 'external_transmission',
    reason: 'Sending an LOI externally requires a separate user-approved disclosure/export action.',
    suggestedTool: 'disclose_subset',
    lineStatus: 'external_approval_required',
  });
  if (state.classificationKey.triggeredOverlayGates.includes('G30')) {
    handoffs.push({
      category: 'asset_class_specialist',
      reason: 'Real-estate, infrastructure, digital-asset, or secondaries overlays may require pass-through specialist inputs before LOI reliance.',
      suggestedTool: 'compose_data_room_index',
      lineStatus: 'specialist_input_required',
    });
  }
  return handoffs;
}

function loiFact(
  state: DefinitiveDealState,
  id: string,
  label: string,
  value: unknown,
  sourceCategories: string[],
  modelRefs: string[],
  boundary: string,
) {
  const present = value != null && value !== '' && value !== 'unknown' && (!Array.isArray(value) || value.length > 0);
  return {
    id,
    label,
    status: present ? 'present' : 'missing',
    value: present ? value : null,
    sourceCategories,
    sourceRefs: refsForCategories(state, sourceCategories),
    missingSourceCategories: missingSourceCategoriesFor(state, sourceCategories),
    modelRefs,
    boundary,
  };
}

function loiMoneyTerm(
  state: DefinitiveDealState,
  id: string,
  label: string,
  valueCents: number | null,
  sourceCategories: string[],
  modelRefs: string[],
) {
  return {
    id,
    label,
    status: valueCents == null ? 'missing' : 'payload_fact_present',
    valueCents,
    currency: 'USD',
    sourceCategories,
    sourceRefs: refsForCategories(state, sourceCategories),
    missingSourceCategories: missingSourceCategoriesFor(state, sourceCategories),
    modelRefs,
    boundary:
      'Money values are payload facts in integer cents unless tied to deterministic model output. DEFINITIVE does not recommend, offer, or negotiate economics.',
  };
}

function loiCondition(
  state: DefinitiveDealState,
  id: string,
  label: string,
  value: unknown,
  sourceCategories: string[],
  modelRefs: string[],
) {
  const present = value != null && value !== '' && (!Array.isArray(value) || value.length > 0);
  return {
    id,
    label,
    status: present ? 'payload_fact_present' : 'missing',
    value: present ? value : null,
    sourceCategories,
    sourceRefs: refsForCategories(state, sourceCategories),
    missingSourceCategories: missingSourceCategoriesFor(state, sourceCategories),
    modelRefs,
    boundary:
      'Condition is organized as agreement architecture. Counsel and the user decide enforceability, binding effect, and counterparty communications.',
  };
}

function refsForCategories(state: DefinitiveDealState, categories: string[]) {
  return sourceRefsForCategories(state, categories);
}

function missingSourceCategoriesFor(state: DefinitiveDealState, categories: string[]) {
  const refs = refsForCategories(state, categories);
  return categories.filter(category => !refs.some(source => source.category === category));
}

function ioiFact(id: string, label: string, value: unknown) {
  const present = value != null && value !== '' && value !== 'unknown';
  return {
    id,
    label,
    status: present ? 'present' : 'missing',
    value: present ? value : null,
    boundary: 'Fact is organized from DealPayload or ClassificationKey; it is not an offer, recommendation, or professional opinion.',
  };
}

function ioiMoneyFact(id: string, label: string, valueCents: number | null) {
  return {
    id,
    label,
    status: valueCents == null ? 'missing' : 'payload_fact_present',
    valueCents,
    currency: 'USD',
    boundary: 'Money values are payload facts in integer cents unless later tied to deterministic model output.',
  };
}

function nextLifecycleTraceCalls(state: DefinitiveDealState, currentStage: string): DefinitiveMcpCallHint[] {
  const calls: DefinitiveMcpCallHint[] = [];
  if (['diligence', 'model'].includes(currentStage)) {
    calls.push({
      toolName: 'prepare_diligence_request',
      priority: 'P1',
      reason: 'Convert the current lifecycle position into source-backed diligence asks.',
      inputHint: { dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision } },
    });
  }
  if (currentStage === 'negotiation') {
    calls.push({
      toolName: 'prepare_negotiation_brief',
      priority: 'P1',
      reason: 'Convert the current lifecycle position into a source-aware negotiation brief.',
      inputHint: { dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision } },
    });
  }
  if (!state.completenessReport.satisfied.includes('model_state_present')) {
    calls.push({
      toolName: 'compose_model_stack',
      priority: 'P1',
      reason: 'Refresh the deterministic model stack before claiming model-backed lifecycle progress.',
      inputHint: {
        journey: state.classificationKey.journey,
        league: state.classificationKey.league === 'unknown' ? undefined : state.classificationKey.league,
        dealType: state.payload.dealType || state.payload.structure || state.classificationKey.subJourney,
        signals: state.signals || undefined,
      },
    });
  }
  return calls;
}

function buildPackageDeferrals(state: DefinitiveDealState) {
  const deferrals: Array<Record<string, any>> = [];
  if (state.classificationKey.triggeredOverlayGates.includes('G28')) {
    deferrals.push({
      category: 'distressed_or_restructuring',
      reason: 'Court, counsel, CRO, FA, or creditor determinations remain outside THE LINE.',
      suggestedTool: 'defer_to_counsel',
    });
  }
  if (state.classificationKey.triggeredOverlayGates.includes('G29')) {
    deferrals.push({
      category: 'capital_structure_or_lme',
      reason: 'Contract interpretation, execution risk, and negotiation strategy remain with counsel and the user.',
      suggestedTool: 'defer_to_counsel',
    });
  }
  if (state.classificationKey.taxClassification !== 'unknown') {
    deferrals.push({
      category: 'tax_review',
      reason: 'DEFINITIVE can compute tax mechanics, but tax positions and opinions require qualified review.',
      suggestedTool: 'defer_to_counsel',
    });
  }
  return deferrals;
}

function requiredDataRoomCategories(state: DefinitiveDealState): string[] {
  const required = new Set(['financials', 'legal', 'tax', 'commercial']);
  if (state.classificationKey.journey === 'pmi') required.add('operations');
  if (state.classificationKey.triggeredOverlayGates.includes('G28')) required.add('restructuring');
  if (state.classificationKey.triggeredOverlayGates.includes('G29')) required.add('financing');
  if (state.classificationKey.triggeredOverlayGates.includes('G30') || state.classificationKey.assetClass === 'real_estate') required.add('real_estate');
  if (matches(compactText([state.classificationKey.industry, state.payload.industry, state.payload.notes]), ['software', 'saas', 'ip', 'technology'])) {
    required.add('ip');
  }
  return [...required];
}

function buildDataRoomCategories(sourceIndex: Array<Record<string, any>>, requiredCategories: string[]) {
  const allCategories = [
    'financials',
    'tax',
    'legal',
    'commercial',
    'operations',
    'hr',
    'ip',
    'real_estate',
    'financing',
    'restructuring',
    'regulatory',
    'other',
  ];
  const categories = new Map(allCategories.map(id => [id, {
    id,
    label: dataRoomCategoryLabel(id),
    required: requiredCategories.includes(id),
    status: requiredCategories.includes(id) ? 'missing' : 'optional',
    itemCount: 0,
    citationReadyCount: 0,
    items: [] as Array<Record<string, any>>,
  }]));

  for (const source of sourceIndex) {
    const categoryId = inferDataRoomCategory(source);
    const category = categories.get(categoryId) || categories.get('other');
    if (!category) continue;
    category.items.push({
      id: source.id,
      type: source.type,
      hash: source.hash,
      citationReady: source.citationReady,
    });
    category.itemCount += 1;
    if (source.citationReady) category.citationReadyCount += 1;
    category.status = category.required ? 'present' : 'optional_present';
  }

  return [...categories.values()]
    .filter(category => category.required || category.itemCount > 0)
    .map(category => ({
      ...category,
      missingReason: category.status === 'missing' ? `Required ${category.label} sources are not indexed yet.` : null,
    }));
}

function dataRoomCategoryLabel(id: string): string {
  return id
    .split('_')
    .map(part => part.toUpperCase() === 'IP' ? 'IP' : part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function inferDataRoomCategory(source: Record<string, any>): string {
  const text = compactText([source.type, source.id, source.name, source.kind]).toLowerCase();
  if (matches(text, ['qoe', 'financial', 'p&l', 'pnl', 'balance sheet', 'cash flow', 'trial balance', 'quality of earnings'])) return 'financials';
  if (matches(text, ['tax', 'return', 'irs', 'state tax', 'salt', '1060', '338'])) return 'tax';
  if (matches(text, ['legal', 'loi', 'purchase agreement', 'spa', 'apa', 'contract', 'litigation', 'corporate'])) return 'legal';
  if (matches(text, ['customer', 'market', 'commercial', 'sales', 'pipeline', 'churn'])) return 'commercial';
  if (matches(text, ['operations', 'ops', 'vendor', 'supply', 'inventory'])) return 'operations';
  if (matches(text, ['employee', 'hr', 'benefit', 'payroll', 'compensation'])) return 'hr';
  if (matches(text, ['ip', 'patent', 'trademark', 'copyright', 'software', 'source code', 'oss', 'license'])) return 'ip';
  if (matches(text, ['real estate', 'lease', 'rent roll', 'title', 'survey', 'environmental', 'pca', 'property'])) return 'real_estate';
  if (matches(text, ['debt', 'credit', 'loan', 'lender', 'financing', 'covenant', 'capital structure'])) return 'financing';
  if (matches(text, ['chapter 11', '363', 'dip', 'rsa', 'forbearance', 'restructuring', 'claims'])) return 'restructuring';
  if (matches(text, ['regulatory', 'hsr', 'cfius', 'permit', 'license', 'filing'])) return 'regulatory';
  return 'other';
}

function buildDiligenceRequestGroups(state: DefinitiveDealState, requestedCategories: string[]) {
  type CategorizedSource = Record<string, any> & { category: string };
  const sourceIndex: CategorizedSource[] = state.sourceIndex.map(source => ({
    ...source,
    category: inferDataRoomCategory(source),
  }));
  return requestedCategories.map(category => {
    const sourceRefs = sourceIndex
      .filter(source => source.category === category)
      .map(source => ({
        id: source.id,
        name: source.name ?? source.id,
        type: source.type,
        category: source.category,
        hash: source.hash,
        citationReady: source.citationReady,
      }));
    const requests = diligenceRequestsForCategory(category, state);
    return {
      id: category,
      label: dataRoomCategoryLabel(category),
      required: true,
      status: sourceRefs.length ? 'source_ready' : 'needs_source',
      sourceRefs,
      missingSourceCategories: sourceRefs.length ? [] : [category],
      requests,
      lineBoundary: diligenceLineBoundaryForCategory(category),
    };
  });
}

function diligenceRequestsForCategory(category: string, state: DefinitiveDealState) {
  const base: Record<string, string[]> = {
    financials: [
      'Monthly P&L, balance sheet, and cash-flow support for the trailing 24-36 months.',
      'QoE adjustments, add-backs, revenue bridge, gross margin bridge, and working-capital detail.',
      'Customer revenue by month, revenue recognition policy, and AR aging support.',
    ],
    tax: [
      'Federal, state, and local tax returns plus entity classification and ownership history.',
      'Transaction-structure facts for asset, stock, §338/§336(e), rollover, NOL, and SALT analysis.',
      'Open audits, tax notices, tax-sharing agreements, and transfer-tax or withholding facts.',
    ],
    legal: [
      'Organizational documents, capitalization, ownership records, board/manager approvals, and authority evidence.',
      'Material contracts, change-of-control consent list, litigation docket, compliance matters, and draft LOI/SPA terms.',
      'Indemnity, survival, escrow, RWI, closing-condition, and termination-fee economics for counsel review.',
    ],
    commercial: [
      'Customer list, revenue concentration, churn, pipeline, backlog, pricing, and win/loss support.',
      'Market thesis support, competitor set, channel partners, and supplier/customer dependency detail.',
    ],
    operations: [
      'Operating KPIs, vendor list, inventory detail, fulfillment/service workflow, and capex/deferred-maintenance schedule.',
      'Day 0 operating dependencies, TSA needs, systems map, and integration or PMI blockers.',
    ],
    hr: [
      'Employee census, compensation, benefits, contractor list, equity/incentive plans, and retention risks.',
      'Employment agreements, restrictive covenants, pending claims, and payroll/benefits compliance support.',
    ],
    ip: [
      'Registered IP schedule, chain-of-title evidence, assignment agreements, and lien/encumbrance searches.',
      'Inbound/outbound license map, OSS/SCA scan results, source-code escrow status, and domain/trademark transfer list.',
    ],
    real_estate: [
      'Rent roll, lease abstracts, title commitment, survey, environmental/PCA reports, and property-level capex reserve.',
      'NOI support, cap-rate source, transfer/CITT tax facts, FIRPTA status, ground-lease terms, and OpCo/PropCo facts.',
    ],
    financing: [
      'Debt schedule, credit agreement, covenant calculations, liens, collateral, intercreditor terms, and lender consents.',
      'ABL borrowing-base support, make-whole/call schedule, exchange-offer terms, and capital-structure change history.',
    ],
    restructuring: [
      '13-week cash forecast, liquidity runway, forbearance/RSA status, creditor classes, claims schedule, and DIP/exit financing facts.',
      '§363 sale process materials, stalking-horse APA, bid procedures, cure schedule, and plan/recovery support when applicable.',
    ],
    regulatory: [
      'Required approvals, permits, HSR/CFIUS/FCC/FERC/Form A/healthcare/defense filings, and timing constraints.',
      'Compliance policies, sanctions/cyber/privacy support, notices, and regulator correspondence.',
    ],
    other: [
      'Any deal-specific files that do not fit a standard bucket, with source owner, date, and citation-ready hash.',
    ],
  };
  const requests = base[category] || base.other;
  return requests.map((requestText, index) => ({
    id: `${category}_${index + 1}`,
    requestText,
    status: 'open',
    sourceCategory: category,
    surface: category === 'financials' || category === 'financing' ? 'models' : 'files',
    lineBoundary: diligenceLineBoundaryForCategory(category),
    modelOrGateContext: diligenceContextForCategory(category, state),
  }));
}

function diligenceContextForCategory(category: string, state: DefinitiveDealState) {
  const contexts: string[] = [];
  if (category === 'financials') contexts.push('working-capital, QoE, valuation, DSCR, LBO, and deal-score models');
  if (category === 'tax') contexts.push('M101-M105, M139-M140, M145, M150, M170, M185-M186, M200-M205 tax mechanics');
  if (category === 'legal') contexts.push('M206-M213 agreement economics and THE LINE counsel handoffs');
  if (category === 'ip') contexts.push('M214-M223 IP, OSS, source-code escrow, and transfer mechanics');
  if (category === 'real_estate') contexts.push('G30 and M169-M199 real-estate/asset-class mechanics');
  if (category === 'financing') contexts.push('G29 and M158-M160, M180-M184 capital-structure mechanics');
  if (category === 'restructuring') contexts.push('G28 and M151-M168 distressed/restructuring mechanics');
  if (state.classificationKey.triggeredOverlayGates.length) contexts.push(`triggered overlays: ${state.classificationKey.triggeredOverlayGates.join(', ')}`);
  return contexts.length ? contexts.join('; ') : 'standard Deal OS diligence loop';
}

function diligenceLineBoundaryForCategory(category: string): string {
  if (['legal', 'tax', 'regulatory', 'restructuring', 'financing'].includes(category)) {
    return 'DEFINITIVE organizes required facts, sources, and deterministic computations only; counsel, advisors, counterparties, or courts make determinations.';
  }
  return 'DEFINITIVE organizes source-backed diligence asks and model dependencies; the user decides what to request or share externally.';
}

function buildDiligenceHandoffs(state: DefinitiveDealState) {
  const handoffs: Array<Record<string, any>> = buildPackageDeferrals(state).map(deferral => ({
    ...deferral,
    lineStatus: 'requires_professional_or_user_determination',
  }));
  if (state.classificationKey.triggeredOverlayGates.includes('G30')) {
    handoffs.push({
      category: 'pass_through_specialist_inputs',
      reason: 'Real-estate, environmental, title, appraisal, SCA, or other specialist/data API inputs may be needed before source-backed reliance.',
      suggestedTool: 'compose_data_room_index',
      lineStatus: 'specialist_input_required',
    });
  }
  handoffs.push({
    category: 'external_request_transmission',
    reason: 'Sending diligence requests to a counterparty or service provider is a separate user-approved action.',
    suggestedTool: 'disclose_subset',
    lineStatus: 'external_disclosure_approval_required',
  });
  return handoffs;
}

function disclosureCategoriesForObjective(objective: string | null, state: DefinitiveDealState): string[] {
  const text = compactText([objective]);
  if (matches(text, ['ioi', 'indication'])) return ['financials', 'commercial'];
  if (matches(text, ['loi', 'term sheet', 'deal architecture'])) return ['financials', 'legal', 'tax'];
  if (matches(text, ['model', 'valuation', 'lbo', 'working capital', 'qoe'])) return ['financials', 'tax', 'financing'];
  if (matches(text, ['negotiation', 'purchase agreement', 'indemnity', 'escrow'])) return ['legal', 'financials', 'tax'];
  if (matches(text, ['pmi', 'post close', 'integration'])) return ['operations', 'financials', 'commercial', 'hr'];
  if (matches(text, ['data room', 'diligence', 'due diligence'])) return requiredDataRoomCategories(state);
  return requiredDataRoomCategories(state).slice(0, 5);
}

function normalizeDocumentType(value: unknown): string {
  const text = textValue(value)?.toLowerCase().replace(/[\s-]+/g, '_') || 'deal_brief';
  if (matches(text, ['ioi', 'indication'])) return 'ioi';
  if (matches(text, ['loi', 'letter_of_intent', 'term_sheet'])) return 'loi_outline';
  if (matches(text, ['ic', 'investment_committee', 'memo'])) return 'ic_memo';
  if (matches(text, ['diligence', 'request'])) return 'diligence_request';
  if (matches(text, ['negotiation'])) return 'negotiation_brief';
  if (matches(text, ['pmi', 'integration', 'post_close'])) return 'pmi_plan';
  return 'deal_brief';
}

function audienceForDocumentType(documentType: string): string {
  switch (documentType) {
    case 'ioi':
    case 'loi_outline':
      return 'counterparty_and_internal_team';
    case 'ic_memo':
      return 'investment_committee';
    case 'diligence_request':
      return 'deal_team_and_counterparty';
    case 'negotiation_brief':
      return 'internal_deal_team';
    case 'pmi_plan':
      return 'operators_and_integration_team';
    default:
      return 'agent_or_principal';
  }
}

function documentDraftTitle(documentType: string, state: DefinitiveDealState): string {
  const subject = textValue(state.payload.dealName) || textValue(state.payload.targetName) || textValue(state.payload.companyName) || 'Deal';
  switch (documentType) {
    case 'ioi':
      return `${subject} IOI scaffold`;
    case 'loi_outline':
      return `${subject} LOI architecture scaffold`;
    case 'ic_memo':
      return `${subject} IC memo scaffold`;
    case 'diligence_request':
      return `${subject} diligence request list scaffold`;
    case 'negotiation_brief':
      return `${subject} negotiation brief scaffold`;
    case 'pmi_plan':
      return `${subject} PMI plan scaffold`;
    default:
      return `${subject} deal brief scaffold`;
  }
}

function buildDocumentDraftSections(documentType: string, state: DefinitiveDealState) {
  const categoryPlan = documentSectionCategoryPlan(documentType);
  type CategorizedSource = Record<string, any> & { category: string };
  const sourceIndex: CategorizedSource[] = state.sourceIndex.map(source => ({ ...source, category: inferDataRoomCategory(source) }));
  return categoryPlan.map(section => {
    const sourceRefs = sourceIndex
      .filter(source => section.sourceCategories.includes(source.category))
      .map(source => ({
        id: source.id,
        name: source.name ?? source.id,
        type: source.type,
        category: source.category,
        hash: source.hash,
        citationReady: source.citationReady,
      }));
    const missingSourceCategories = section.sourceCategories.filter(category => !sourceRefs.some(source => source.category === category));
    return {
      id: section.id,
      title: section.title,
      purpose: section.purpose,
      status: missingSourceCategories.length ? 'needs_source' : 'source_ready',
      sourceCategories: section.sourceCategories,
      sourceRefs,
      missingSourceCategories,
      draftInstruction: section.draftInstruction,
      lineBoundary: section.lineBoundary || LINE_INVARIANT,
    };
  });
}

function documentSectionCategoryPlan(documentType: string) {
  const commonBoundary = 'Use only source-backed facts and deterministic model outputs; flag unsupported claims as [unverified].';
  switch (documentType) {
    case 'ioi':
      return [
        sectionPlan('deal_snapshot', 'Deal snapshot', ['financials', 'commercial'], 'Frame the target/thesis, scale, and why-now from sourced facts.', commonBoundary),
        sectionPlan('preliminary_economics', 'Preliminary economics', ['financials'], 'Summarize valuation range or economics only when model output exists or source facts support it.', commonBoundary),
        sectionPlan('next_diligence', 'Next diligence asks', ['legal', 'tax'], 'List missing sources that must be collected before LOI or diligence movement.', commonBoundary),
      ];
    case 'loi_outline':
      return [
        sectionPlan('economic_terms', 'Economic terms', ['financials'], 'Structure price, consideration, working capital, escrow, and earnout placeholders from model-backed facts.', commonBoundary),
        sectionPlan('structure_tax', 'Structure and tax mechanics', ['tax', 'legal'], 'Surface structure choices and tax/legal handoffs without drafting clauses or giving opinions.', LINE_INVARIANT),
        sectionPlan('conditions_diligence', 'Conditions and diligence', ['legal', 'commercial'], 'Track conditions, consents, and diligence asks that must be verified before signing.', commonBoundary),
      ];
    case 'ic_memo':
      return [
        sectionPlan('thesis', 'Thesis and deal fit', ['commercial'], 'Explain thesis and fit from market and source facts.', commonBoundary),
        sectionPlan('financial_model', 'Financial model summary', ['financials'], 'Tie economics to deterministic model outputs and cite source inputs.', commonBoundary),
        sectionPlan('risk_boundary', 'Risks, gates, and handoffs', ['legal', 'tax'], 'State risks, overlay gates, and THE LINE handoffs for counsel/advisor/court determinations.', LINE_INVARIANT),
      ];
    case 'diligence_request':
      return [
        sectionPlan('financial_requests', 'Financial requests', ['financials'], 'Request missing financial, QoE, working-capital, and model-source files.', commonBoundary),
        sectionPlan('legal_tax_requests', 'Legal and tax requests', ['legal', 'tax'], 'Request legal, tax, structure, consent, and authority-supporting files.', LINE_INVARIANT),
        sectionPlan('commercial_operational_requests', 'Commercial and operational requests', ['commercial', 'operations'], 'Request customers, pipeline, vendors, operations, and PMI-relevant files.', commonBoundary),
      ];
    case 'negotiation_brief':
      return [
        sectionPlan('open_terms', 'Open terms', ['legal', 'financials'], 'Organize unresolved economics and source-backed positions.', commonBoundary),
        sectionPlan('model_backed_ranges', 'Model-backed ranges', ['financials', 'tax'], 'Show deterministic model dependencies and source gaps behind each economic range.', commonBoundary),
        sectionPlan('handoffs', 'Counsel and advisor handoffs', ['legal', 'tax'], 'Separate computed facts from legal, tax, fairness, solvency, feasibility, and negotiation determinations.', LINE_INVARIANT),
      ];
    case 'pmi_plan':
      return [
        sectionPlan('day_zero', 'Day 0 controls', ['operations', 'financials'], 'Track Day 0 operational and reporting actions from sourced facts.', commonBoundary),
        sectionPlan('value_creation', 'Value creation workstreams', ['commercial', 'operations'], 'Tie PMI levers to model-backed or sourced assumptions.', commonBoundary),
        sectionPlan('risk_tracking', 'Risk tracking', ['legal', 'hr'], 'Track people, legal, and transition risks without making professional determinations.', LINE_INVARIANT),
      ];
    default:
      return [
        sectionPlan('summary', 'Summary', ['financials', 'commercial'], 'Summarize current sourced deal facts.', commonBoundary),
        sectionPlan('current_stage', 'Current stage and next actions', ['legal', 'tax'], 'Explain what the current DealState unlocks and what remains missing.', LINE_INVARIANT),
      ];
  }
}

function sectionPlan(id: string, title: string, sourceCategories: string[], draftInstruction: string, lineBoundary: string) {
  return {
    id,
    title,
    sourceCategories,
    purpose: draftInstruction,
    draftInstruction,
    lineBoundary,
  };
}

function buildNegotiationOpenTerms(state: DefinitiveDealState) {
  type CategorizedSource = Record<string, any> & { category: string };
  const plans = [
    negotiationTermPlan('purchase_price', 'Purchase price and valuation frame', ['financials'], ['purchasePriceCents', 'valuationRangeCents', 'enterpriseValueCents', 'ebitdaCents']),
    negotiationTermPlan('structure_tax', 'Structure and tax allocation', ['legal', 'tax'], ['dealStructure', 'structure', 'taxClassification', 'considerationMix']),
    negotiationTermPlan('working_capital', 'Working capital peg and true-up', ['financials'], ['workingCapitalPegCents', 'nwcPegCents', 'closingStatement', 'trueUp']),
    negotiationTermPlan('indemnity_escrow', 'Indemnity, escrow, and RWI stack', ['legal', 'financials'], ['escrowCents', 'escrowPercent', 'indemnityCapPercent', 'rwiLimitCents']),
    negotiationTermPlan('earnout_seller_financing', 'Earnout, seller note, rollover, or contingent value', ['financials', 'legal'], ['earnout', 'earnoutCents', 'sellerNoteCents', 'rolloverPercent']),
    negotiationTermPlan('conditions_timing', 'Conditions, approvals, and timing', ['legal', 'commercial'], ['closingConditions', 'approvals', 'consents', 'timeline']),
  ];
  const sourceIndex: CategorizedSource[] = state.sourceIndex.map(source => ({ ...source, category: inferDataRoomCategory(source) }));
  return plans.map(plan => {
    const explicitFacts = plan.payloadKeys.filter(key => hasAnyValue(state.payload, [key]));
    const sourceRefs = sourceIndex
      .filter(source => plan.sourceCategories.includes(source.category))
      .map(source => ({
        id: source.id,
        name: source.name ?? source.id,
        type: source.type,
        category: source.category,
        hash: source.hash,
        citationReady: source.citationReady,
      }));
    const missingSourceCategories = plan.sourceCategories.filter(category => !sourceRefs.some(source => source.category === category));
    return {
      id: plan.id,
      label: plan.label,
      status: explicitFacts.length && !missingSourceCategories.length
        ? 'source_ready'
        : explicitFacts.length
          ? 'facts_present_source_gap'
          : 'needs_fact_and_source',
      explicitFacts,
      sourceCategories: plan.sourceCategories,
      sourceRefs,
      missingSourceCategories,
      positionBoundary:
        'DEFINITIVE organizes the issue, facts, sources, and computed ranges. The user and advisors choose negotiation positions, concessions, and legal language.',
    };
  });
}

function negotiationTermPlan(id: string, label: string, sourceCategories: string[], payloadKeys: string[]) {
  return { id, label, sourceCategories, payloadKeys };
}

function buildNegotiationModelRanges(state: DefinitiveDealState) {
  const modelState = firstPresentValue(state.payload, ['modelOutputs', 'modelRuns', 'valuation', 'lbo', 'workingCapital', 'earnoutModel']);
  const ranges: Array<Record<string, any>> = [];
  if (modelState) {
    ranges.push({
      id: 'current_model_state',
      status: 'present',
      source: 'DealPayload.modelOutputs/modelRuns/valuation/lbo',
      hash: sha256(stableStringify(modelState)),
      note: 'Model state is present in the DealPayload. Downstream renderer should cite individual model outputs when available.',
    });
  } else {
    ranges.push({
      id: 'current_model_state',
      status: 'missing',
      suggestedTool: 'compose_model_stack',
      note: 'No deterministic model output is attached yet, so negotiation ranges must remain placeholders.',
    });
  }

  for (const key of ['purchasePriceCents', 'enterpriseValueCents', 'workingCapitalPegCents', 'escrowCents', 'sellerNoteCents', 'earnoutCents']) {
    const value = firstNumber(state.payload, [key]);
    if (value != null) {
      ranges.push({
        id: key,
        status: 'payload_fact_present',
        valueCents: value,
        source: 'DealPayload',
      });
    }
  }
  return ranges;
}

function buildNegotiationHandoffs(state: DefinitiveDealState) {
  const handoffs: Array<Record<string, any>> = buildPackageDeferrals(state).map(deferral => ({
    ...deferral,
    lineStatus: 'requires_professional_or_user_determination',
  }));
  handoffs.push({
    category: 'negotiation_strategy',
    reason: 'Concessions, bargaining positions, and communications are user/advisor decisions, not DEFINITIVE outputs.',
    suggestedTool: 'compose_document_draft',
    lineStatus: 'user_determination_required',
  });
  if (state.classificationKey.triggeredOverlayGates.includes('G30')) {
    handoffs.push({
      category: 'asset_class_specialist',
      reason: 'Real-estate, infrastructure, digital-asset, or secondaries specialist inputs may be required before relying on the brief.',
      suggestedTool: 'compose_data_room_index',
      lineStatus: 'specialist_input_required',
    });
  }
  return handoffs;
}

function buildPlanStage(
  state: DefinitiveDealState,
  id: string,
  label: string,
  requiredSatisfied: string[],
  currentStage: string,
) {
  const satisfied = new Set(state.completenessReport.satisfied);
  const completed = requiredSatisfied.every(item => satisfied.has(item));
  const status = completed ? 'completed' : id === currentStage ? 'current' : stageIsBefore(id, currentStage) ? 'blocked' : 'future';
  return {
    id,
    label,
    status,
    requiredSatisfied,
    missing: requiredSatisfied.filter(item => !satisfied.has(item)),
    suggestedTools: suggestedToolsForStage(id),
  };
}

function currentStageForState(state: DefinitiveDealState) {
  switch (state.completenessReport.level) {
    case 'DRL0_UNCLASSIFIED':
      return 'intake';
    case 'DRL1_CLASSIFIED':
      return 'ioi';
    case 'DRL2_INDICATION_READY':
      return 'loi';
    case 'DRL3_LOI_ARCHITECTURE_READY':
      return 'diligence';
    case 'DRL4_DILIGENCE_READY':
    default:
      return state.completenessReport.satisfied.includes('model_state_present') ? 'negotiation' : 'model';
  }
}

function stageIsBefore(stage: string, currentStage: string) {
  const order = ['intake', 'ioi', 'loi', 'diligence', 'model', 'negotiation', 'close_pmi'];
  return order.indexOf(stage) < order.indexOf(currentStage);
}

function suggestedToolsForStage(stage: string) {
  switch (stage) {
    case 'intake':
      return ['ingest_deal_payload', 'update_deal_payload', 'check_completeness'];
    case 'ioi':
      return ['compose_model_stack', 'execute_model', 'check_completeness'];
    case 'loi':
      return ['compose_model_stack', 'defer_to_counsel', 'check_completeness'];
    case 'diligence':
      return ['update_deal_payload', 'lookup_citation', 'compose_model_stack'];
    case 'model':
      return ['compose_model_stack', 'execute_model', 'check_completeness'];
    case 'negotiation':
      return ['defer_to_counsel', 'compose_model_stack', 'update_deal_payload'];
    case 'close_pmi':
      return ['close_deal', 'update_deal_payload', 'check_completeness'];
    default:
      return ['check_completeness'];
  }
}

function classifyPayload(
  payload: Record<string, any>,
  overlays: DefinitiveStackOverlay[],
  signals: DefinitiveStackSignals | null,
): DefinitiveClassificationKey {
  const text = compactText([
    payload.journey,
    payload.intent,
    payload.dealType,
    payload.structure,
    payload.stage,
    payload.notes,
    payload.industry,
  ]);
  const explicitJourney = normalizeJourney(payload.journey);
  const journey = explicitJourney || inferJourney(text);
  const league = normalizeLeague(payload.league) || inferLeague(payload);
  const triggeredOverlayGates = overlays.filter(overlay => overlay.triggered).map(overlay => overlay.gateId);
  const jurisdiction = textValue(payload.jurisdiction) || textValue(payload.state) || textValue(payload.country) || 'unknown';
  const industry = textValue(payload.industry) || 'unknown';
  const assetClass = inferAssetClass(payload, triggeredOverlayGates, signals, text);
  const distressPosture = triggeredOverlayGates.includes('G28')
    ? 'distressed'
    : triggeredOverlayGates.includes('G29')
      ? 'stressed_or_liability_management'
      : 'healthy_or_unknown';
  const subJourney = inferSubJourney(journey, triggeredOverlayGates, assetClass, text);
  const taxClassification = textValue(payload.taxClassification) || inferTaxClassification(text);

  return {
    journey,
    subJourney,
    league,
    jurisdiction,
    distressPosture,
    assetClass,
    industry,
    taxClassification,
    triggeredOverlayGates,
    confidence: {
      journey: explicitJourney ? 'explicit' : journey === 'unknown' ? 'missing' : 'inferred',
      subJourney: subJourney === 'unknown' ? 'missing' : 'inferred',
      league: normalizeLeague(payload.league) ? 'explicit' : league === 'unknown' ? 'missing' : 'inferred',
      jurisdiction: jurisdiction === 'unknown' ? 'missing' : 'explicit',
      distressPosture: triggeredOverlayGates.length ? 'inferred' : 'missing',
      assetClass: assetClass === 'operating_business_or_unknown' ? 'missing' : 'inferred',
      industry: industry === 'unknown' ? 'missing' : 'explicit',
      taxClassification: taxClassification === 'unknown' ? 'missing' : textValue(payload.taxClassification) ? 'explicit' : 'inferred',
    },
  };
}

function buildMissingInputContract(
  payload: Record<string, any>,
  classification: DefinitiveClassificationKey,
  sourceIndex: Array<Record<string, any>>,
): DefinitiveMissingInputContract {
  const missing: DefinitiveMissingInputItem[] = [];
  addIfMissing(missing, classification.journey === 'unknown', {
    field: 'journey',
    label: 'Deal journey',
    reason: 'Yulia needs to know whether the work is buy, sell, raise, or PMI before routing gates.',
    unlocks: ['ClassificationKey', 'DealPlan', 'next gate routing'],
    priority: 'P0',
    surface: 'chat',
  });
  addIfMissing(missing, !hasAnyValue(payload, ['dealName', 'targetName', 'companyName', 'subject', 'thesis']), {
    field: 'deal_subject',
    label: 'Deal subject or thesis',
    reason: 'A target, seller, portfolio company, or thesis anchors the iterative DealState.',
    unlocks: ['IOI work', 'Pipeline tracking', 'Studio artifacts'],
    priority: 'P0',
    surface: 'chat',
  });
  addIfMissing(missing, classification.industry === 'unknown', {
    field: 'industry',
    label: 'Industry',
    reason: 'Industry drives comps, QoE focus, diligence checklist, and model stack selection.',
    unlocks: ['M101-M223 route map', 'market lane selection'],
    priority: 'P1',
    surface: 'chat',
  });
  addIfMissing(missing, classification.jurisdiction === 'unknown', {
    field: 'jurisdiction',
    label: 'Jurisdiction',
    reason: 'Jurisdiction is required for tax, legal, regulatory, and pass-through boundary checks.',
    unlocks: ['THE LINE deferrals', 'tax/legal overlays', 'authority validation'],
    priority: 'P1',
    surface: 'chat',
  });
  addIfMissing(missing, classification.league === 'unknown', {
    field: 'economic_scale',
    label: 'Revenue, SDE, EBITDA, or enterprise value',
    reason: 'At least one scale metric is needed to classify league and select model depth.',
    unlocks: ['V19 league', 'model stack', 'pricing/credit forecast'],
    priority: 'P0',
    surface: 'models',
  });
  addIfMissing(missing, sourceIndex.length === 0, {
    field: 'source_or_document_reference',
    label: 'Source or document reference',
    reason: 'DEFINITIVE can work from partial facts, but sourced work product requires at least one source trail.',
    unlocks: ['citation validator', 'Studio provenance', 'data-room checklist'],
    priority: 'P1',
    surface: 'files',
  });
  addIfMissing(missing, !hasAnyValue(payload, ['dealStructure', 'structure', 'considerationMix', 'transactionType']), {
    field: 'deal_structure',
    label: 'Deal structure',
    reason: 'Structure unlocks LOI architecture, tax engine, agreement mechanics, and diligence sequencing.',
    unlocks: ['LOI architecture', 'M200 tax master engine', 'M206-M213 agreement mechanics'],
    priority: 'P2',
    surface: 'pipeline',
  });
  addIfMissing(missing, !hasAnyValue(payload, ['dataRoomIndex', 'documents', 'files']) && isPastEarlyStage(payload), {
    field: 'data_room_index',
    label: 'Data room or files index',
    reason: 'Diligence, modeling, negotiation, and Studio exports need a tracked file universe.',
    unlocks: ['Files surface', 'diligence tracker', 'take-back DataRoomIndex'],
    priority: 'P1',
    surface: 'files',
  });

  const minimal = missing
    .filter(item => item.priority === 'P0')
    .slice(0, 3)
    .map(item => item.field);

  return {
    status: missing.some(item => item.priority === 'P0') ? 'missing_inputs' : 'sufficient_for_next_step',
    items: missing,
    minimalNextInputSet: minimal.length ? minimal : missing.slice(0, 3).map(item => item.field),
    yuliaPrompt: buildYuliaPrompt(missing),
    lineNote: LINE_INVARIANT,
  };
}

function buildCompletenessReport(
  payload: Record<string, any>,
  classification: DefinitiveClassificationKey,
  sourceIndex: Array<Record<string, any>>,
  missingInputContract: DefinitiveMissingInputContract,
): DefinitiveCompletenessReport {
  const satisfied: string[] = [];
  if (classification.journey !== 'unknown') satisfied.push('journey_classified');
  if (hasAnyValue(payload, ['dealName', 'targetName', 'companyName', 'subject', 'thesis'])) satisfied.push('deal_subject_present');
  if (classification.industry !== 'unknown') satisfied.push('industry_present');
  if (classification.jurisdiction !== 'unknown') satisfied.push('jurisdiction_present');
  if (classification.league !== 'unknown') satisfied.push('economic_scale_present');
  if (sourceIndex.length > 0) satisfied.push('source_trail_present');
  if (hasAnyValue(payload, ['dealStructure', 'structure', 'considerationMix', 'transactionType'])) satisfied.push('deal_structure_present');
  if (hasAnyValue(payload, ['keyTerms', 'terms', 'ioi', 'loi'])) satisfied.push('term_architecture_present');
  if (hasAnyValue(payload, ['dataRoomIndex', 'documents', 'files'])) satisfied.push('file_universe_present');
  if (hasAnyValue(payload, ['modelOutputs', 'modelRuns', 'valuation', 'lbo'])) satisfied.push('model_state_present');

  let score = 0;
  if (classification.journey !== 'unknown') score += 15;
  if (hasAnyValue(payload, ['dealName', 'targetName', 'companyName', 'subject', 'thesis'])) score += 15;
  if (classification.industry !== 'unknown') score += 10;
  if (classification.jurisdiction !== 'unknown') score += 10;
  if (classification.league !== 'unknown') score += 15;
  if (sourceIndex.length > 0) score += 10;
  if (hasAnyValue(payload, ['dealStructure', 'structure', 'considerationMix', 'transactionType'])) score += 10;
  if (hasAnyValue(payload, ['keyTerms', 'terms', 'ioi', 'loi'])) score += 10;
  if (hasAnyValue(payload, ['dataRoomIndex', 'documents', 'files'])) score += 5;
  score = Math.max(0, Math.min(100, score));

  const level = score >= 80
    ? 'DRL4_DILIGENCE_READY'
    : score >= 65
      ? 'DRL3_LOI_ARCHITECTURE_READY'
      : score >= 45
        ? 'DRL2_INDICATION_READY'
        : score >= 25
          ? 'DRL1_CLASSIFIED'
          : 'DRL0_UNCLASSIFIED';

  return {
    definitionOfDoneVersion: DEFINITION_OF_DONE.version,
    level,
    score,
    satisfied,
    missing: missingInputContract.items,
    blockers: missingInputContract.items.filter(item => item.priority === 'P0').map(item => item.field),
    nextGate: nextGateForLevel(level, classification),
    canProceedWithPartialState: true,
    theLineInvariant: LINE_INVARIANT,
  };
}

function buildNextCallHints(state: DefinitiveDealState): DefinitiveMcpCallHint[] {
  const hints: DefinitiveMcpCallHint[] = [];
  if (state.missingInputContract.items.length > 0) {
    hints.push({
      toolName: 'update_deal_payload',
      priority: 'P0',
      reason: `Collect the minimal next input set: ${state.missingInputContract.minimalNextInputSet.join(', ') || 'any missing source fact'}.`,
      inputHint: {
        dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision },
        patch: Object.fromEntries(state.missingInputContract.minimalNextInputSet.map(field => [field, '<user_or_agent_supplied_value>'])),
      },
    });
  }
  hints.push({
    toolName: 'check_completeness',
    priority: 'P1',
    reason: 'Re-score the current DealState before creating or updating artifacts.',
    inputHint: { dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision } },
  });
  if (state.classificationKey.journey !== 'unknown') {
    hints.push({
      toolName: 'compose_model_stack',
      priority: state.completenessReport.score >= 45 ? 'P0' : 'P1',
      reason: 'Translate the classification key and overlay gates into the applicable M101-M223 model stack.',
      inputHint: {
        journey: state.classificationKey.journey,
        league: state.classificationKey.league === 'unknown' ? undefined : state.classificationKey.league,
        dealType: state.payload.dealType || state.payload.structure || state.classificationKey.subJourney,
        signals: state.signals || undefined,
      },
    });
  }
  if (state.classificationKey.triggeredOverlayGates.length > 0) {
    hints.push({
      toolName: 'get_definition_of_done',
      priority: 'P2',
      reason: `Explain what done means for triggered overlays ${state.classificationKey.triggeredOverlayGates.join(', ')} without crossing THE LINE.`,
      inputHint: { objective: state.classificationKey.triggeredOverlayGates.join(',') },
    });
  }
  return hints;
}

function inferJourney(text: string): Journey {
  if (matches(text, ['pmi', 'post close', 'post-close', 'integration', 'day 0', 'day one'])) return 'pmi';
  if (matches(text, ['raise', 'capital raise', 'fundraise', 'debt capital', 'equity capital'])) return 'raise';
  if (matches(text, ['sell', 'seller', 'exit', 'go to market', 'sale process'])) return 'sell';
  if (matches(text, ['buy', 'buyer', 'acquire', 'acquisition', 'target', 'search thesis'])) return 'buy';
  return 'unknown';
}

function inferLeague(payload: Record<string, any>): League | 'unknown' {
  const ebitdaCents = firstNumber(payload, ['ebitdaCents', 'adjustedEbitdaCents']);
  const sdeCents = firstNumber(payload, ['sdeCents', 'sellerDiscretionaryEarningsCents']);
  const revenueCents = firstNumber(payload, ['revenueCents', 'ttmRevenueCents', 'salesCents']);
  if (ebitdaCents == null && sdeCents == null && revenueCents == null) return 'unknown';
  return classifyV19LeagueFromCents({ ebitdaCents, sdeCents, revenueCents });
}

function inferAssetClass(
  payload: Record<string, any>,
  gates: Array<'G28' | 'G29' | 'G30'>,
  signals: DefinitiveStackSignals | null,
  text: string,
): DefinitiveClassificationKey['assetClass'] {
  if (signals?.digitalAssetsPercentOfEv != null && signals.digitalAssetsPercentOfEv >= 10) return 'digital_assets';
  if (matches(text, ['crypto', 'digital asset', 'stablecoin', 'token'])) return 'digital_assets';
  if (matches(text, ['infrastructure', 'project finance', 'concession'])) return 'infrastructure';
  if (signals?.realEstatePercentOfEv != null && signals.realEstatePercentOfEv >= 25) return 'real_estate';
  if (gates.includes('G30') && matches(text, ['real estate', 'reit', 'propco', 'lease', 'rent roll', 'noi', 'cap rate', 'title'])) return 'real_estate';
  return 'operating_business_or_unknown';
}

function inferSubJourney(
  journey: Journey,
  gates: Array<'G28' | 'G29' | 'G30'>,
  assetClass: DefinitiveClassificationKey['assetClass'],
  text: string,
) {
  if (gates.includes('G28')) return matches(text, ['363', 'stalking horse']) ? 'distressed_363_sale' : 'distressed_restructuring';
  if (gates.includes('G29')) return 'capital_structure_or_liability_management';
  if (assetClass === 'real_estate') return 'real_estate_overlay';
  if (assetClass === 'digital_assets') return 'digital_asset_overlay';
  if (journey === 'buy') return 'healthy_buy_side';
  if (journey === 'sell') return 'healthy_sell_side';
  if (journey === 'raise') return 'capital_raise';
  if (journey === 'pmi') return 'post_close_pmi';
  return 'unknown';
}

function inferTaxClassification(text: string): string {
  if (matches(text, ['338', '336', 'stock deal', 'stock purchase'])) return 'stock_or_deemed_asset';
  if (matches(text, ['asset deal', '1060', 'asset purchase'])) return 'asset_purchase';
  if (matches(text, ['368', 'reorg', 'merger'])) return 'tax_free_reorg';
  if (matches(text, ['721', 'partnership', 'llc rollover', 'joint venture'])) return 'partnership_or_contribution';
  if (matches(text, ['1031', 'firpta', 'reit'])) return 'real_estate_tax';
  return 'unknown';
}

function nextGateForLevel(level: DealReadinessLevel, classification: DefinitiveClassificationKey): string {
  if (classification.triggeredOverlayGates.length) return classification.triggeredOverlayGates.join('+');
  switch (level) {
    case 'DRL0_UNCLASSIFIED':
      return 'intake_classification';
    case 'DRL1_CLASSIFIED':
      return 'ioi_readiness';
    case 'DRL2_INDICATION_READY':
      return 'loi_architecture';
    case 'DRL3_LOI_ARCHITECTURE_READY':
      return 'diligence_and_modeling';
    case 'DRL4_DILIGENCE_READY':
    default:
      return 'negotiation_close_pmi_loop';
  }
}

function normalizeSignals(payload: Record<string, any>): DefinitiveStackSignals | null {
  const source = payload.signals && typeof payload.signals === 'object'
    ? { ...(payload.signals as Record<string, unknown>) }
    : {};
  for (const key of [
    'cashRunwayDays',
    'fccr',
    'securedDebtTradingPriceCents',
    'maintenanceCovenantBreachWithinQuarters',
    'realEstatePercentOfEv',
    'digitalAssetsPercentOfEv',
    'solvencyProngFailed',
    'bankruptcyFilingPending',
    'rsaInMarket',
    'forbearanceExecuted',
    'capitalStructureAction',
    'liabilityManagementExercise',
    'recapitalization',
    'exchangeOffer',
    'covenantAmendment',
  ]) {
    if (payload[key] != null && payload[key] !== '') source[key] = payload[key];
  }
  return normalizeDefinitiveStackSignals(source);
}

function normalizeSourceIndex(payload: Record<string, any>): Array<Record<string, any>> {
  const sources = payload.sourceIndex ?? payload.sources ?? payload.documents ?? payload.files ?? [];
  const list = Array.isArray(sources) ? sources : [sources];
  return list
    .filter(item => item && typeof item === 'object')
    .map((item, index) => ({
      id: (item as Record<string, any>).id || (item as Record<string, any>).name || `source_${index + 1}`,
      name: (item as Record<string, any>).name || (item as Record<string, any>).title || null,
      type: (item as Record<string, any>).type || (item as Record<string, any>).kind || 'source',
      kind: (item as Record<string, any>).kind || null,
      hash: (item as Record<string, any>).hash || null,
      sourceUri: (item as Record<string, any>).sourceUri || (item as Record<string, any>).uri || null,
      citationReady: Boolean((item as Record<string, any>).hash || (item as Record<string, any>).citation || (item as Record<string, any>).sourceUri),
    }));
}

function normalizeStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map(item => textValue(item) || (item == null ? null : String(item).trim()))
      .filter((item): item is string => Boolean(item));
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }
  return [];
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function normalizePayload(value: unknown): Record<string, any> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const payload = { ...(value as Record<string, any>) };
  delete payload.envelope;
  delete payload.idempotencyKey;
  return payload;
}

function normalizePriorState(value: unknown): DefinitiveDealState | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const candidate = value as Partial<DefinitiveDealState>;
  if (!candidate.payload || typeof candidate.payload !== 'object') return null;
  return candidate as DefinitiveDealState;
}

function deepMerge(base: Record<string, any>, patch: Record<string, any>): Record<string, any> {
  const output: Record<string, any> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      output[key] &&
      typeof output[key] === 'object' &&
      !Array.isArray(output[key])
    ) {
      output[key] = deepMerge(output[key], value);
    } else {
      output[key] = value;
    }
  }
  return output;
}

function hasAnyValue(payload: Record<string, any>, keys: string[]): boolean {
  return keys.some(key => {
    const value = payload[key];
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === 'object') return Object.keys(value).length > 0;
    return value != null && value !== '';
  });
}

function firstPresentValue(payload: Record<string, any>, keys: string[]): unknown {
  for (const key of keys) {
    const value = payload[key];
    if (Array.isArray(value) && value.length > 0) return value;
    if (value && typeof value === 'object' && Object.keys(value).length > 0) return value;
    if (value != null && value !== '') return value;
  }
  return null;
}

function isPastEarlyStage(payload: Record<string, any>): boolean {
  const text = compactText([payload.stage, payload.intent, payload.notes]);
  return matches(text, ['loi', 'diligence', 'due diligence', 'model', 'negotiation', 'closing']);
}

function buildYuliaPrompt(missing: DefinitiveMissingInputItem[]) {
  if (!missing.length) {
    return 'We have enough to take the next methodology step. Yulia should proceed, keep caveats attached, and continue asking for source-backed improvements as the deal evolves.';
  }
  const top = missing.slice(0, 3).map(item => item.label.toLowerCase()).join(', ');
  return `Ask for ${top}. Keep working from the partial DealState and explain what each answer unlocks.`;
}

function addIfMissing(target: DefinitiveMissingInputItem[], condition: boolean, item: DefinitiveMissingInputItem) {
  if (condition) target.push(item);
}

function firstNumber(payload: Record<string, any>, keys: string[]): number | null {
  for (const key of keys) {
    const value = payload[key];
    if (value == null || value === '') continue;
    const numberValue = Number(value);
    if (Number.isFinite(numberValue)) return numberValue;
  }
  return null;
}

function normalizeJourney(value: unknown): Journey | null {
  const normalized = textValue(value)?.toLowerCase();
  if (['sell', 'buy', 'raise', 'pmi'].includes(normalized || '')) return normalized as Journey;
  return null;
}

function normalizeLeague(value: unknown): League | null {
  const normalized = textValue(value)?.toUpperCase();
  if (/^L([1-9]|10)$/.test(normalized || '')) return normalized as League;
  return null;
}

function textValue(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function nullableString(value: unknown): string | null {
  return textValue(value);
}

function compactText(values: unknown[]): string {
  return values
    .flatMap(value => {
      if (typeof value === 'string') return [value];
      if (Array.isArray(value)) return value.map(String);
      if (value && typeof value === 'object') return [JSON.stringify(value)];
      return [];
    })
    .join(' ')
    .toLowerCase();
}

function matches(text: string, needles: string[]): boolean {
  return needles.some(needle => text.includes(needle));
}

function stableStringify(value: unknown): string {
  if (value == null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entryValue]) => entryValue !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));
  return `{${entries.map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify(entryValue)}`).join(',')}}`;
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function diffObjects(before: unknown, after: unknown, prefix = ''): string[] {
  if (stableStringify(before) === stableStringify(after)) return [];
  if (!isPlainObject(before) || !isPlainObject(after)) return [prefix || '$'];
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const paths: string[] = [];
  for (const key of [...keys].sort()) {
    if (paths.length >= 50) break;
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    if (!(key in before) || !(key in after)) {
      paths.push(nextPrefix);
      continue;
    }
    paths.push(...diffObjects((before as Record<string, unknown>)[key], (after as Record<string, unknown>)[key], nextPrefix));
  }
  return paths.slice(0, 50);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}
