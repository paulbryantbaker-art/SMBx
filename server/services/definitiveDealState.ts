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
  return normalizeDefinitiveStackSignals({
    ...(payload.signals && typeof payload.signals === 'object' ? payload.signals : {}),
    cashRunwayDays: payload.cashRunwayDays,
    fccr: payload.fccr,
    securedDebtTradingPriceCents: payload.securedDebtTradingPriceCents,
    maintenanceCovenantBreachWithinQuarters: payload.maintenanceCovenantBreachWithinQuarters,
    realEstatePercentOfEv: payload.realEstatePercentOfEv,
    digitalAssetsPercentOfEv: payload.digitalAssetsPercentOfEv,
    solvencyProngFailed: payload.solvencyProngFailed,
    bankruptcyFilingPending: payload.bankruptcyFilingPending,
    rsaInMarket: payload.rsaInMarket,
    forbearanceExecuted: payload.forbearanceExecuted,
    capitalStructureAction: payload.capitalStructureAction,
    liabilityManagementExercise: payload.liabilityManagementExercise,
    recapitalization: payload.recapitalization,
    exchangeOffer: payload.exchangeOffer,
    covenantAmendment: payload.covenantAmendment,
  });
}

function normalizeSourceIndex(payload: Record<string, any>): Array<Record<string, any>> {
  const sources = payload.sourceIndex ?? payload.sources ?? payload.documents ?? payload.files ?? [];
  const list = Array.isArray(sources) ? sources : [sources];
  return list
    .filter(item => item && typeof item === 'object')
    .map((item, index) => ({
      id: (item as Record<string, any>).id || (item as Record<string, any>).name || `source_${index + 1}`,
      type: (item as Record<string, any>).type || (item as Record<string, any>).kind || 'source',
      hash: (item as Record<string, any>).hash || null,
      citationReady: Boolean((item as Record<string, any>).hash || (item as Record<string, any>).citation || (item as Record<string, any>).sourceUri),
    }));
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
