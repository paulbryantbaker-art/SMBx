import { createHash } from 'node:crypto';
import {
  DEFINITIVE_METHODOLOGY_URI,
  DEFINITIVE_METHODOLOGY_VERSION,
  DEFINITIVE_SPEC_URI,
  DEFINITIVE_SPEC_VERSION,
} from '../constants/definitive.js';
import {
  classifyV19LeagueFromCents,
  classifyV19LeagueFromEnterpriseValueCents,
  type League,
} from '../constants/v19Leagues.js';
import {
  evaluateDefinitiveStackOverlays,
  normalizeDefinitiveStackSignals,
  type DefinitiveStackOverlay,
  type DefinitiveStackSignals,
} from './definitiveStackOverlays.js';

export const DEFINITIVE_DEAL_STATE_PROTOCOL = 'DEFINITIVE.deal-state.v0.1';

type Confidence = 'explicit' | 'inferred' | 'missing';
type Journey = 'sell' | 'buy' | 'raise' | 'pmi' | 'unknown';
type RepresentationSide = 'sell_side' | 'buy_side' | 'raise_side' | 'pmi' | 'unknown';
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
  distressPosture: 'healthy' | 'healthy_or_unknown' | 'stressed_or_liability_management' | 'distressed';
  assetClass: 'operating_business_or_unknown' | 'real_estate' | 'digital_assets' | 'infrastructure';
  industry: string;
  taxClassification: string;
  triggeredOverlayGates: Array<'G28' | 'G29' | 'G30'>;
  conflicts?: ClassificationConflict[];
  confidence: Record<
    'journey' | 'subJourney' | 'league' | 'jurisdiction' | 'distressPosture' | 'assetClass' | 'industry' | 'taxClassification',
    Confidence
  >;
}

export interface ClassificationConflict {
  axis: 'journey' | 'league' | 'distressPosture' | 'taxClassification' | 'assetClass' | 'jurisdiction';
  /** Short machine code for the conflict (e.g. `journey_buy_with_seller_role`). */
  code: string;
  /** Human-readable explanation for Yulia / agent. */
  reason: string;
  /** Field names the agent should resolve. */
  fields: string[];
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
  /**
   * Which methodology gate/stage this call moves the deal toward, so an agent
   * iterating the loop sees not just WHAT to call next but WHICH gate it clears.
   * `null` for meta/re-score calls that don't advance a gate.
   */
  advancesGate?: string | null;
}

export interface DefinitiveRepresentationContext {
  side: RepresentationSide;
  actorRole:
    | 'owner'
    | 'owner_representative'
    | 'sell_side_advisor'
    | 'buyer'
    | 'buyer_representative'
    | 'capital_raiser'
    | 'operator'
    | 'agent_or_principal'
    | 'unknown';
  purpose:
    | 'prepare_for_sale_process'
    | 'prepare_for_incoming_loi'
    | 'prepare_for_due_diligence'
    | 'prepare_for_closing'
    | 'evaluate_acquisition'
    | 'raise_capital'
    | 'operate_post_close'
    | 'unknown';
  authorityBoundary: string;
  sellSidePreparationPath?: string[];
}

const LINE_INVARIANT =
  'DEFINITIVE computes, organizes, cites, and routes deal work. The user, counsel, advisor, or court makes legal, tax, fairness, feasibility, solvency, negotiation, and closing determinations.';

const DEAL_READINESS_LEVELS = [
  {
    id: 'DRL0_UNCLASSIFIED',
    label: 'Unclassified',
    description: 'The payload exists but lacks enough facts to classify the deal journey.',
    minimumScore: 0,
    canProceedWithPartialState: true,
    doneWhen: ['The payload exists and can be held as a DealState, even if the journey is unknown.'],
    nextRecommendedTools: ['ingest_deal_payload', 'introspect_capabilities'],
  },
  {
    id: 'DRL1_CLASSIFIED',
    label: 'Classified',
    description: 'Journey is known and either deal subject, industry, jurisdiction, or size is present.',
    minimumScore: 20,
    canProceedWithPartialState: true,
    doneWhen: ['Journey is known.', 'At least one subject, industry, jurisdiction, or size fact is present.'],
    nextRecommendedTools: ['check_completeness', 'compose_deal_plan'],
  },
  {
    id: 'DRL2_INDICATION_READY',
    label: 'Indication ready',
    description: 'Enough deal facts exist to create an IOI/readiness artifact with explicit caveats.',
    minimumScore: 55,
    canProceedWithPartialState: true,
    doneWhen: ['Deal subject and journey are known.', 'Economic scale and jurisdiction are present.', 'At least one source/document reference is present.'],
    nextRecommendedTools: ['compose_model_stack', 'prepare_ioi_packet'],
  },
  {
    id: 'DRL3_LOI_ARCHITECTURE_READY',
    label: 'LOI architecture ready',
    description: 'Structure, key terms, economic scale, and material risk or overlay gates are known.',
    minimumScore: 75,
    canProceedWithPartialState: true,
    doneWhen: ['Deal structure or key terms are present.', 'Known risk/overlay gates are classified.', 'Economic terms can be organized without drafting clauses.'],
    nextRecommendedTools: ['prepare_loi_packet', 'compose_document_draft', 'prepare_negotiation_brief'],
  },
  {
    id: 'DRL4_DILIGENCE_READY',
    label: 'Diligence ready',
    description: 'Core documents, data room index, model outputs, and specialist/pass-through blockers are tracked.',
    minimumScore: 90,
    canProceedWithPartialState: false,
    doneWhen: ['Core document categories are indexed.', 'Model outputs and unresolved source gaps are tracked.', 'Specialist/pass-through blockers are explicit.'],
    nextRecommendedTools: ['compose_data_room_index', 'prepare_diligence_request', 'compose_close_readiness'],
  },
];

const COMPLETENESS_SPEC = {
  version: 'DEFINITIVE.completeness-spec.v0.1' as const,
  definitionOfDoneVersion: 'DEFINITIVE.definition-of-done.v0.1' as const,
  levels: DEAL_READINESS_LEVELS,
  checks: [
    {
      id: 'journey_classified',
      label: 'Journey classified',
      requiredForLevel: 'DRL1_CLASSIFIED',
      surfaces: ['today', 'pipeline'],
    },
    {
      id: 'economic_scale_present',
      label: 'Economic scale present',
      requiredForLevel: 'DRL2_INDICATION_READY',
      modelSlots: ['M101-M223'],
      surfaces: ['models', 'studio'],
    },
    {
      id: 'source_trail_present',
      label: 'Source trail present',
      requiredForLevel: 'DRL2_INDICATION_READY',
      sourceCategories: ['financials', 'commercial', 'legal', 'tax', 'ip', 'real_estate'],
      surfaces: ['files', 'data_room'],
    },
    {
      id: 'term_architecture_present',
      label: 'Term architecture present',
      requiredForLevel: 'DRL3_LOI_ARCHITECTURE_READY',
      surfaces: ['pipeline', 'studio'],
    },
    {
      id: 'data_room_indexed',
      label: 'Data room indexed',
      requiredForLevel: 'DRL4_DILIGENCE_READY',
      sourceCategories: ['financials', 'legal', 'tax', 'commercial'],
      surfaces: ['files', 'data_room'],
    },
    {
      id: 'model_state_present',
      label: 'Model state present',
      requiredForLevel: 'DRL4_DILIGENCE_READY',
      modelSlots: ['M101-M223'],
      surfaces: ['models'],
    },
  ],
  noRejectionContract:
    'A partial payload is accepted, classified where possible, scored for completeness, and returned with MissingInputContract plus next_suggested_calls instead of rejected.',
  lineInvariant: LINE_INVARIANT,
};

const DEFINITION_OF_DONE = {
  version: 'DEFINITIVE.definition-of-done.v0.1' as const,
  completenessSpec: COMPLETENESS_SPEC,
  levels: DEAL_READINESS_LEVELS,
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
    case 'clone_deal_state':
      return cloneDefinitiveDealState(input);
    case 'compose_deal_package':
      return composeDefinitiveDealPackage(input);
    case 'verify_package':
      return verifyDefinitiveDealPackage(input);
    case 'finalize_deal_package':
      return finalizeDefinitiveDealPackage(input);
    case 'reopen_deal_package':
      return reopenDefinitiveDealPackage(input);
    case 'generate_permutations':
      return generateDefinitivePermutations(input);
    case 'score_permutation':
      return scoreDefinitivePermutation(input);
    case 'set_objective_preference':
      return setDefinitiveObjectivePreference(input);
    case 'compute_best_vehicle':
      return computeDefinitiveBestVehicle(input);
    case 'expand_permutations':
      return expandDefinitivePermutations(input);
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
    case 'compose_close_readiness':
      return composeDefinitiveCloseReadiness(input);
    case 'generate_funds_flow':
      return generateDefinitiveFundsFlow(input);
    case 'compose_pmi_plan':
      return composeDefinitivePmiPlan(input);
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
          'clone_deal_state',
          'compose_deal_package',
          'verify_package',
          'finalize_deal_package',
          'reopen_deal_package',
          'generate_permutations',
          'score_permutation',
          'set_objective_preference',
          'compute_best_vehicle',
          'expand_permutations',
          'resume_deal',
          'compose_lifecycle_trace',
          'prepare_ioi_packet',
          'prepare_loi_packet',
          'compose_data_room_index',
          'prepare_diligence_request',
          'disclose_subset',
          'compose_document_draft',
          'prepare_negotiation_brief',
          'compose_close_readiness',
          'generate_funds_flow',
          'compose_pmi_plan',
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
    'clone_deal_state',
    'compose_deal_package',
    'verify_package',
    'finalize_deal_package',
    'reopen_deal_package',
    'generate_permutations',
    'score_permutation',
    'set_objective_preference',
    'compute_best_vehicle',
    'expand_permutations',
    'resume_deal',
    'compose_lifecycle_trace',
    'prepare_ioi_packet',
    'prepare_loi_packet',
    'compose_data_room_index',
    'prepare_diligence_request',
    'disclose_subset',
    'compose_document_draft',
    'prepare_negotiation_brief',
    'compose_close_readiness',
    'generate_funds_flow',
    'compose_pmi_plan',
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
      completenessSpec: COMPLETENESS_SPEC,
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
  const representationContext = inferRepresentationContext(state);
  return {
    ok: true,
    action: 'compose_deal_plan',
    result: {
      dealState: state,
      dealPlan,
      classificationKey: state.classificationKey,
      representationContext,
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

export function cloneDefinitiveDealState(input: Record<string, any>) {
  const prior = normalizePriorState(input.dealState ?? input.state);
  const basePayload = prior?.payload && typeof prior.payload === 'object'
    ? prior.payload
    : normalizePayload(input.payload ?? input.dealPayload ?? {});
  const patch = normalizePayload(input.patch ?? input.clonePatch ?? {});
  const state = buildDealState({
    payload: deepMerge(basePayload, patch),
    revision: (prior?.revision || 0) + 1,
    idempotencyKey: nullableString(input.idempotencyKey),
    parentCids: prior?.cid ? [prior.cid, ...(prior.parentCids || [])] : [],
  });
  const base = buildDealStateResult('clone_deal_state', state, prior?.completenessReport?.score ?? null);
  return {
    ...base,
    result: {
      ...base.result,
      clone: {
        sourceCid: prior?.cid || nullableString(input.sourceCid) || null,
        clonedCid: state.cid,
        cloneReason: nullableString(input.cloneReason) || nullableString(input.reason) || 'scenario_or_parallel_agent_work',
        parentPreserved: Boolean(prior?.cid && state.parentCids.includes(prior.cid)),
      },
      portableTakeBackArtifacts: [
        ...base.result.portableTakeBackArtifacts,
        'DealStateDiff',
      ],
    },
  };
}

export function composeDefinitiveDealPackage(input: Record<string, any>) {
  const state = stateFromInput(input);
  const dealPlan = buildDealPlan(state);
  const nextSuggestedCalls = buildNextCallHints(state);
  const representationContext = inferRepresentationContext(state);
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
    representationContext,
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

export function verifyDefinitiveDealPackage(input: Record<string, any>) {
  const dealPackage = normalizePackage(input.dealPackage ?? input.package ?? input);
  const state = normalizePriorState(input.dealState ?? input.state ?? dealPackage.dealState);
  const checks = buildPackageVerificationChecks(dealPackage, state, input);
  const missing = checks
    .filter(check => check.status === 'fail')
    .map(check => check.id);
  const warnings = checks
    .filter(check => check.status === 'warn')
    .map(check => check.id);
  const packageCid = nullableString(dealPackage.packageCid) || null;
  const pkgGate = state?.completenessReport?.nextGate ?? null;
  const nextSuggestedCalls: DefinitiveMcpCallHint[] = [
    {
      toolName: 'disclose_subset',
      priority: 'P1',
      reason: 'Create selective disclosure proof when the package leaves the deal room or another agent only needs part of the record.',
      advancesGate: null,
      inputHint: { dealPackage: packageCid ? { packageCid } : undefined, dealState: state ? { cid: state.cid } : undefined },
    },
    {
      toolName: 'compose_close_readiness',
      priority: 'P1',
      reason: 'Check close-readiness before any human treats the package as a closing workstream record.',
      advancesGate: pkgGate,
      inputHint: { dealState: state ? { cid: state.cid } : undefined },
    },
    {
      toolName: 'resume_deal',
      priority: 'P2',
      reason: 'Resume the recursive Deal OS loop from this package after the receiving agent adds new facts or documents.',
      advancesGate: null,
      inputHint: { dealPackage: packageCid ? { packageCid } : undefined, dealState: state ? { cid: state.cid } : undefined },
    },
  ];
  const verification = {
    verificationId: `pkgverify_${sha256(stableStringify({ packageCid, checks })).slice(0, 16)}`,
    schema: 'PackageVerification.v0.1',
    packageId: nullableString(dealPackage.packageId) || null,
    packageCid,
    verified: missing.length === 0,
    checks,
    missing,
    warnings,
    expectedPackageCid: nullableString(input.expectedPackageCid) || null,
    expectedDealStateCid: nullableString(input.expectedDealStateCid) || nullableString(input.expectedStateCid) || null,
    next_suggested_calls: nextSuggestedCalls,
    takeBackArtifacts: ['PackageVerification', 'DealPackage', 'MCPCallHint[]'],
    lineInvariant: LINE_INVARIANT,
  };

  return {
    ok: true,
    action: 'verify_package',
    result: {
      packageVerification: verification,
      dealPackage,
      dealState: state || undefined,
      next_suggested_calls: nextSuggestedCalls,
      portableTakeBackArtifacts: verification.takeBackArtifacts,
    },
    state_hash_after: state?.stateHash || nullableString(dealPackage.dealStateHash) || null,
    completeness_contribution_delta: 0,
    methodology_version: DEFINITIVE_METHODOLOGY_VERSION,
    the_line_invariant: LINE_INVARIANT,
  };
}

export function finalizeDefinitiveDealPackage(input: Record<string, any>) {
  const dealPackage = normalizePackage(input.dealPackage ?? input.package ?? input);
  const state = normalizePriorState(input.dealState ?? input.state ?? dealPackage.dealState);
  const verificationResult = verifyDefinitiveDealPackage({
    dealPackage,
    dealState: state || undefined,
    expectedPackageCid: input.expectedPackageCid,
    expectedDealStateCid: input.expectedDealStateCid || input.expectedStateCid,
  });
  const packageVerification = verificationResult.result.packageVerification;
  const finalizedAt = nullableString(input.finalizedAt) || nullableString(input.signedAt) || new Date().toISOString();
  const packageHash = outputHashFor(dealPackage);
  const sourceHashes = buildPackageSourceHashes(dealPackage);
  const modelOutputHashes = buildPackageModelHashes(dealPackage);
  const auditHash = outputHashFor({
    packageCid: dealPackage.packageCid,
    dealStateHash: dealPackage.dealStateHash,
    packageHash,
    sourceHashes,
    modelOutputHashes,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
    lineInvariant: LINE_INVARIANT,
  });
  const auditPacket = {
    packetId: `audit_${auditHash.hash.slice(0, 16)}`,
    schema: 'AuditPacket.v0.1',
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
    sourceHashes,
    modelOutputHashes,
    auditHash,
    retentionYears: 7,
    lineInvariant: LINE_INVARIANT,
  };
  const merkleProof = buildPackageMerkleProof(dealPackage, auditPacket);
  const signedHash = outputHashFor({
    packageCid: dealPackage.packageCid,
    auditHash: auditHash.hash,
    rootHash: merkleProof.rootHash,
    signedAt: finalizedAt,
    lineInvariant: LINE_INVARIANT,
  });
  const signedManifest = {
    manifestId: `manifest_${signedHash.hash.slice(0, 16)}`,
    schema: 'SignedManifest.v0.1',
    signedHash,
    signer: nullableString(input.signer) || 'smbx.definitive.software',
    signedAt: finalizedAt,
    attestation: {
      schema: 'Attestation.v0.1',
      attestationType: 'software_package_manifest',
      statement:
        'This is a software manifest for a DEFINITIVE DealPackage. It verifies hashes, schema pins, and THE LINE boundary; it is not legal, tax, fairness, solvency, feasibility, negotiation, or closing advice.',
      evidenceRefs: [
        nullableString(dealPackage.packageCid),
        auditPacket.packetId,
        merkleProof.rootHash,
      ].filter(Boolean),
      lineBoundary: LINE_INVARIANT,
    },
  };
  const humanRender = buildPackageHumanRender(dealPackage, packageVerification, auditPacket, signedManifest, merkleProof);
  const finalizedPackage = {
    schema: 'FinalizedDealPackage.v0.1',
    packageCid: nullableString(dealPackage.packageCid) || null,
    packageId: nullableString(dealPackage.packageId) || null,
    status: packageVerification.verified ? 'finalized' : 'blocked_failed_verification',
    finalizedAt,
    packageVerification,
    auditPacket,
    signedManifest: packageVerification.verified ? signedManifest : null,
    merkleProof: packageVerification.verified ? merkleProof : null,
    humanRender,
    next_suggested_calls: [
      {
        toolName: 'verify_package',
        priority: 'P1',
        reason: 'Let the receiving agent independently verify the finalized package before relying on it.',
        inputHint: { dealPackage: { packageCid: nullableString(dealPackage.packageCid) || undefined } },
      },
      {
        toolName: 'disclose_subset',
        priority: 'P1',
        reason: 'Create a selective disclosure proof before sharing less than the full package.',
        inputHint: { dealPackage: { packageCid: nullableString(dealPackage.packageCid) || undefined } },
      },
      {
        toolName: 'compose_pmi_plan',
        priority: 'P2',
        reason: 'If the deal closes, carry the same DealState into the post-close operating loop.',
        inputHint: { dealState: state ? { cid: state.cid } : undefined },
      },
    ],
    takeBackArtifacts: ['DealPackage', 'PackageVerification', 'AuditPacket', 'SignedManifest', 'MerkleInclusionProof', 'HumanPackageRender'],
    lineInvariant: LINE_INVARIANT,
  };

  return {
    ok: true,
    action: 'finalize_deal_package',
    result: {
      finalizedPackage,
      packageVerification,
      auditPacket,
      signedManifest: finalizedPackage.signedManifest,
      merkleProof: finalizedPackage.merkleProof,
      humanRender,
      dealPackage,
      dealState: state || undefined,
      next_suggested_calls: finalizedPackage.next_suggested_calls,
      portableTakeBackArtifacts: finalizedPackage.takeBackArtifacts,
    },
    state_hash_after: state?.stateHash || nullableString(dealPackage.dealStateHash) || null,
    completeness_contribution_delta: 0,
    methodology_version: DEFINITIVE_METHODOLOGY_VERSION,
    the_line_invariant: LINE_INVARIANT,
  };
}

export function reopenDefinitiveDealPackage(input: Record<string, any>) {
  const dealPackage = normalizePackage(input.dealPackage ?? input.package ?? input);
  const prior = normalizePriorState(input.dealState ?? input.state ?? dealPackage.dealState);
  const patch = normalizePayload(input.patch ?? input.dealPayloadPatch ?? {});
  const basePayload = prior?.payload && typeof prior.payload === 'object'
    ? prior.payload
    : normalizePayload(input.payload ?? input.dealPayload ?? {});
  const reopenReason = nullableString(input.reopenReason) || nullableString(input.reason) || 'new_information_or_recursive_agent_update';
  const reopenedAt = nullableString(input.reopenedAt) || new Date().toISOString();
  const payload = deepMerge(basePayload, {
    ...patch,
    reopenedFromPackageCid: nullableString(dealPackage.packageCid) || null,
    reopenReason,
    reopenedAt,
  });
  const parentCids = [
    ...(prior?.cid ? [prior.cid] : []),
    ...(nullableString(dealPackage.packageCid) ? [String(dealPackage.packageCid)] : []),
    ...(prior?.parentCids || []),
  ];
  const state = buildDealState({
    payload,
    revision: (prior?.revision || 0) + 1,
    idempotencyKey: nullableString(input.idempotencyKey) || prior?.idempotencyKey || null,
    parentCids: [...new Set(parentCids)],
  });
  const nextSuggestedCalls = buildNextCallHints(state);
  const reopenRecord = {
    reopenId: `reopen_${sha256(stableStringify({
      packageCid: dealPackage.packageCid,
      stateCid: state.cid,
      patch,
      reopenReason,
    })).slice(0, 16)}`,
    schema: 'ReopenedDealPackage.v0.1',
    packageCid: nullableString(dealPackage.packageCid) || null,
    sourceDealStateCid: prior?.cid || nullableString(dealPackage.dealStateCid) || null,
    reopenedDealStateCid: state.cid,
    reopenedDealStateHash: state.stateHash,
    reopenReason,
    reopenedAt,
    changedPaths: diffObjects(basePayload, payload),
    next_suggested_calls: nextSuggestedCalls,
    takeBackArtifacts: ['DealState', 'DealStateDiff', 'ReopenedDealPackage', 'MCPCallHint[]'],
    lineInvariant: LINE_INVARIANT,
  };

  return {
    ok: true,
    action: 'reopen_deal_package',
    result: {
      reopenRecord,
      dealState: state,
      dealPackage,
      classificationKey: state.classificationKey,
      missingInputContract: state.missingInputContract,
      completenessReport: state.completenessReport,
      next_suggested_calls: nextSuggestedCalls,
      portableTakeBackArtifacts: reopenRecord.takeBackArtifacts,
    },
    state_hash_after: state.stateHash,
    completeness_contribution_delta: prior ? state.completenessReport.score - prior.completenessReport.score : state.completenessReport.score,
    methodology_version: DEFINITIVE_METHODOLOGY_VERSION,
    the_line_invariant: LINE_INVARIANT,
  };
}

export function generateDefinitivePermutations(input: Record<string, any>) {
  const state = stateFromInput(input);
  const objective = normalizeObjectivePreference(input);
  const permutations = buildStructurePermutations(state, objective, Boolean(input.includeExpanded));
  const paretoFrontier = buildParetoFrontier(permutations, objective);
  return {
    ok: true,
    action: 'generate_permutations',
    result: {
      dealState: state,
      objectivePreference: objective,
      permutations,
      paretoFrontier,
      next_suggested_calls: [
        {
          toolName: 'compute_best_vehicle',
          priority: 'P1',
          reason: 'Compute a best point only after the caller states objective preferences.',
          inputHint: { dealState: { cid: state.cid }, objectivePreference: objective.name },
        },
      ],
      portableTakeBackArtifacts: ['StructurePermutation', 'ParetoFrontier', 'MCPCallHint[]'],
    },
    state_hash_after: state.stateHash,
    completeness_contribution_delta: 0,
    methodology_version: DEFINITIVE_METHODOLOGY_VERSION,
    the_line_invariant: LINE_INVARIANT,
  };
}

export function scoreDefinitivePermutation(input: Record<string, any>) {
  const state = stateFromInput(input);
  const objective = normalizeObjectivePreference(input);
  const structure = nullableString(input.structure)
    || nullableString(input.permutation?.structure)
    || nullableString(input.permutation?.structureKey)
    || 'asset_purchase';
  const permutation = scoreStructurePermutation(state, structure, objective);
  return {
    ok: true,
    action: 'score_permutation',
    result: {
      dealState: state,
      objectivePreference: objective,
      permutation,
      next_suggested_calls: [
        {
          toolName: 'compute_best_vehicle',
          priority: 'P2',
          reason: 'Compare this scored point against the other non-dominated structures when preferences are ready.',
          inputHint: { dealState: { cid: state.cid }, objectivePreference: objective.name },
        },
      ],
      portableTakeBackArtifacts: ['StructurePermutation', 'ModelOutput', 'MCPCallHint[]'],
    },
    state_hash_after: state.stateHash,
    completeness_contribution_delta: 0,
    methodology_version: DEFINITIVE_METHODOLOGY_VERSION,
    the_line_invariant: LINE_INVARIANT,
  };
}

export function setDefinitiveObjectivePreference(input: Record<string, any>) {
  const state = stateFromInput(input);
  const objective = normalizeObjectivePreference(input);
  const permutations = buildStructurePermutations(state, objective, Boolean(input.includeExpanded));
  const paretoFrontier = buildParetoFrontier(permutations, objective);
  return {
    ok: true,
    action: 'set_objective_preference',
    result: {
      dealState: state,
      objectivePreference: objective,
      paretoFrontier,
      next_suggested_calls: [
        {
          toolName: 'compute_best_vehicle',
          priority: 'P1',
          reason: 'Use the stated preference vector to compute the highest-scoring point without recommending a transaction structure.',
          inputHint: { dealState: { cid: state.cid }, objectivePreference: objective.name },
        },
      ],
      portableTakeBackArtifacts: ['ParetoFrontier', 'StructurePermutation', 'MCPCallHint[]'],
    },
    state_hash_after: state.stateHash,
    completeness_contribution_delta: 0,
    methodology_version: DEFINITIVE_METHODOLOGY_VERSION,
    the_line_invariant: LINE_INVARIANT,
  };
}

export function computeDefinitiveBestVehicle(input: Record<string, any>) {
  const state = stateFromInput(input);
  const objective = normalizeObjectivePreference(input);
  const permutations = Array.isArray(input.permutations)
    ? input.permutations.map((permutation: any) => scoreStructurePermutation(state, nullableString(permutation.structure) || 'asset_purchase', objective))
    : buildStructurePermutations(state, objective, Boolean(input.includeExpanded));
  const paretoFrontier = buildParetoFrontier(permutations, objective);
  const selected = [...paretoFrontier.permutations].sort((a: any, b: any) => b.weightedScore - a.weightedScore)[0] || permutations[0];
  const bestVehicleBlock = {
    schema: 'BestVehicleBlock.v0.1',
    selectedPermutationId: selected?.permutationId || 'none',
    selectionBasis:
      `Computed highest weighted score under caller-stated objectivePreference=${objective.name}. This is not a recommendation; the user and advisors decide whether to rely on it.`,
    paretoFrontier,
    unresolvedHandoffs: buildPermutationHandoffs(state, selected?.structure || ''),
    lineBoundary: LINE_INVARIANT,
    takeBackArtifacts: ['BestVehicleBlock', 'ParetoFrontier', 'StructurePermutation', 'MCPCallHint[]'],
  };
  return {
    ok: true,
    action: 'compute_best_vehicle',
    result: {
      dealState: state,
      objectivePreference: objective,
      bestVehicleBlock,
      next_suggested_calls: [
        {
          toolName: 'compose_deal_package',
          priority: 'P1',
          reason: 'Package the computed structure comparison with the current DealState and source trail.',
          inputHint: { dealState: { cid: state.cid } },
        },
      ],
      portableTakeBackArtifacts: bestVehicleBlock.takeBackArtifacts,
    },
    state_hash_after: state.stateHash,
    completeness_contribution_delta: 0,
    methodology_version: DEFINITIVE_METHODOLOGY_VERSION,
    the_line_invariant: LINE_INVARIANT,
  };
}

export function expandDefinitivePermutations(input: Record<string, any>) {
  const state = stateFromInput(input);
  const objective = normalizeObjectivePreference(input);
  const permutations = buildStructurePermutations(state, objective, true);
  const paretoFrontier = buildParetoFrontier(permutations, objective);
  return {
    ok: true,
    action: 'expand_permutations',
    result: {
      dealState: state,
      objectivePreference: objective,
      permutations,
      paretoFrontier,
      next_suggested_calls: [
        {
          toolName: 'score_permutation',
          priority: 'P1',
          reason: 'Score any caller-selected expanded structure before using it in a package.',
          inputHint: { dealState: { cid: state.cid }, objectivePreference: objective.name },
        },
      ],
      portableTakeBackArtifacts: ['StructurePermutation', 'ParetoFrontier', 'MCPCallHint[]'],
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
        recursiveLoop: [
          'resume',
          'update_deal_payload',
          'compose_model_stack/execute_model',
          'check_completeness',
          'compose_deal_package',
          'repeat',
        ],
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
  const humanAndAgentSurfaces = ['today', 'pipeline', 'files', 'data_room', 'studio', 'models', 'audit_package'];
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
    humanAndAgentSurfaces,
    loopContract: {
      recursiveLoop: [
        'compose_lifecycle_trace',
        'update_deal_payload',
        'check_completeness',
        'compose_deal_package',
        'repeat',
      ],
      noRejectionContract:
        'Incomplete deal history is acceptable. The trace returns synthesized current-state events and next_suggested_calls instead of rejecting the agent.',
      humanAndAgentSurfaces,
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
  const representationContext = inferRepresentationContext(state);
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
    representationContext,
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
  const representationContext = inferRepresentationContext(state);
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
    representationContext,
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
  const representationContext = inferRepresentationContext(state);
  const requiredCategories = requiredDataRoomCategories(state);
  const categories = buildDataRoomCategories(state.sourceIndex, requiredCategories);
  const missingCategories = categories.filter(category => category.status === 'missing').map(category => category.id);
  const dataRoomIndex = {
    indexId: `dataroom_${state.stateHash.slice(0, 16)}`,
    schema: 'DataRoomIndex.v0.1',
    dealStateCid: state.cid,
    dealStateHash: state.stateHash,
    classificationKey: state.classificationKey,
    representationContext,
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
  const representationContext = inferRepresentationContext(state);
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
    representationContext,
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
  const representationContext = inferRepresentationContext(state);
  const sections = buildDocumentDraftSections(documentType, state);
  const missingSourceCategories = uniqueStrings(sections.flatMap(section => section.missingSourceCategories));
  const needsModelState = ['ic_memo', 'loi_outline', 'seller_loi_readiness', 'seller_diligence_readiness', 'negotiation_brief', 'funds_flow'].includes(documentType) && !state.completenessReport.satisfied.includes('model_state_present');
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
    representationContext,
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
  const representationContext = inferRepresentationContext(state);
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
    representationContext,
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

export function composeDefinitiveCloseReadiness(input: Record<string, any>) {
  const state = stateFromInput(input);
  const objective = textValue(input.objective) || 'closing_readiness';
  const audience = textValue(input.audience) || 'internal_deal_team_and_closing_advisors';
  const representationContext = inferRepresentationContext(state);
  const requiredSourceCategories = closeReadinessSourceCategories(state);
  const sourceRefs = sourceRefsForCategories(state, requiredSourceCategories);
  const sourceGaps = requiredSourceCategories
    .filter(category => !sourceRefs.some(source => source.category === category))
    .map(category => ({
      category,
      reason: `Close readiness needs ${category} source support before a human can approve closing movement.`,
      suggestedTool: 'compose_data_room_index',
    }));
  const checks = buildCloseReadinessChecks(state, requiredSourceCategories, sourceGaps);
  const nonApprovalBlockers = checks.filter(check => check.blocking);
  const closed = hasAnyValue(state.payload, ['closedDate', 'actualCloseDate']) || matches(compactText([state.payload.status, state.payload.stage]), ['closed', 'funded']);
  const readinessStatus = closed
    ? 'closed_pmi_ready'
    : nonApprovalBlockers.length
      ? 'blocked'
      : 'ready_to_stage_for_human_approval';
  const scoredChecks = checks.filter(check => check.scoreable);
  const readyChecks = scoredChecks.filter(check => check.status === 'ready' || check.status === 'not_applicable');
  const readinessScore = scoredChecks.length ? Math.round((readyChecks.length / scoredChecks.length) * 100) : 0;
  const approvalMatrix = buildCloseApprovalMatrix(state, readinessStatus, checks);
  const nextSuggestedCalls = buildCloseReadinessNextCalls(state, checks, readinessStatus);
  const readinessHash = sha256(stableStringify({
    dealStateHash: state.stateHash,
    objective,
    audience,
    readinessStatus,
    readinessScore,
    checks,
    sourceGaps,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
  }));
  const closeReadiness = {
    readinessId: `closeready_${readinessHash.slice(0, 16)}`,
    schema: 'CloseReadiness.v0.1',
    dealStateCid: state.cid,
    dealStateHash: state.stateHash,
    objective,
    audience,
    stage: currentStageForState(state),
    readinessLevel: state.completenessReport.level,
    representationContext,
    readinessStatus,
    readinessScore,
    checks,
    blockers: nonApprovalBlockers.map(check => ({
      id: check.id,
      label: check.label,
      status: check.status,
      severity: check.severity,
      reason: check.reason,
      suggestedTool: check.suggestedTool,
    })),
    sourceRefs,
    sourceGaps,
    approvalMatrix,
    closeReadinessBoundary: {
      composedOnly: true,
      noClosingAuthority: true,
      noMoneyMovement: true,
      noWireInstructions: true,
      noExternalTransmission: true,
      noLegalOrTaxOpinion: true,
      noEscrowAgentAuthority: true,
      closeDealRequiresSeparateA6Approval: true,
      userAndAdvisorsDecide:
        'The user, counsel, lender, escrow/closing agent, tax advisors, and other required professionals decide whether closing conditions are satisfied and whether the transaction may close.',
    },
    next_suggested_calls: nextSuggestedCalls,
    takeBackArtifacts: ['CloseReadiness', 'DealState', 'FundsFlow', 'PMIPlan', 'MCPCallHint[]'],
    lineInvariant: LINE_INVARIANT,
  };

  return {
    ok: true,
    action: 'compose_close_readiness',
    result: {
      closeReadiness,
      dealState: state,
      missingInputContract: state.missingInputContract,
      next_suggested_calls: closeReadiness.next_suggested_calls,
      portableTakeBackArtifacts: closeReadiness.takeBackArtifacts,
    },
    state_hash_after: state.stateHash,
    completeness_contribution_delta: 0,
    methodology_version: DEFINITIVE_METHODOLOGY_VERSION,
    the_line_invariant: LINE_INVARIANT,
  };
}

export function generateDefinitiveFundsFlow(input: Record<string, any>) {
  const state = stateFromInput(input);
  const objective = textValue(input.objective) || 'closing_funds_flow';
  const audience = textValue(input.audience) || 'internal_deal_team_and_closing_advisors';
  const representationContext = inferRepresentationContext(state);
  const sourceRefs = sourceRefsForCategories(state, ['financials', 'legal', 'tax', 'financing']);
  const sourceGaps = ['financials', 'legal', 'tax', 'financing']
    .filter(category => !sourceRefs.some(source => source.category === category))
    .map(category => ({
      category,
      reason: `Funds flow needs ${category} source support before closing use.`,
      suggestedTool: 'compose_data_room_index',
    }));
  const sourceRows = buildFundsFlowSources(state);
  const useRows = buildFundsFlowUses(state);
  const adjustments = buildFundsFlowAdjustments(state);
  const reconciliation = buildFundsFlowReconciliation(sourceRows, useRows);
  const handoffs = buildFundsFlowHandoffs(state);
  const needsModelState = !state.completenessReport.satisfied.includes('model_state_present');
  const flowHash = sha256(stableStringify({
    dealStateHash: state.stateHash,
    objective,
    audience,
    sourceRows,
    useRows,
    adjustments,
    reconciliation,
    sourceGaps,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
  }));
  const fundsFlow = {
    flowId: `fundsflow_${flowHash.slice(0, 16)}`,
    schema: 'FundsFlow.v0.1',
    dealStateCid: state.cid,
    dealStateHash: state.stateHash,
    objective,
    audience,
    stage: currentStageForState(state),
    readinessLevel: state.completenessReport.level,
    representationContext,
    sourceRows,
    useRows,
    adjustments,
    reconciliation,
    sourceRefs,
    sourceGaps,
    handoffs,
    modelDependencies: {
      required: needsModelState,
      status: needsModelState ? 'missing_model_state' : 'not_blocked',
      suggestedTool: needsModelState ? 'compose_model_stack' : null,
      preferredModels: ['sources_and_uses', 'M210', 'M208', 'M203', 'M204'],
    },
    fundsFlowBoundary: {
      composedOnly: true,
      noMoneyMovement: true,
      noWireInstructions: true,
      noEscrowAgentAuthority: true,
      noClosingAuthority: true,
      noLegalOrTaxOpinion: true,
      noExternalTransmission: true,
      userAndClosingTeamDecide:
        'The user, counsel, lender, escrow/closing agent, and tax advisors decide final disbursement instructions, wire details, closing authority, payoff letters, and tax withholding positions.',
    },
    next_suggested_calls: [
      ...(sourceGaps.length
        ? [{
            toolName: 'compose_data_room_index',
            priority: 'P1' as const,
            reason: `Fill funds-flow source gaps: ${sourceGaps.map(gap => gap.category).join(', ')}.`,
            inputHint: { dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision } },
          }]
        : []),
      ...(needsModelState
        ? [{
            toolName: 'compose_model_stack',
            priority: 'P1' as const,
            reason: 'Tie funds-flow rows to deterministic model outputs before closing reliance.',
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
        reason: 'Render the funds-flow packet into a source-aware Studio closing scaffold.',
        inputHint: {
          dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision },
          documentType: 'funds_flow',
          audience,
        },
      },
      {
        toolName: 'compose_deal_package',
        priority: reconciliation.status === 'balanced' ? 'P1' as const : 'P2' as const,
        reason: 'Package funds-flow rows with DealState, source refs, and THE LINE boundaries for agent take-back.',
        inputHint: { dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision } },
      },
    ],
    takeBackArtifacts: ['FundsFlow', 'DealState', 'DocumentDraft', 'MCPCallHint[]'],
    lineInvariant: LINE_INVARIANT,
  };

  return {
    ok: true,
    action: 'generate_funds_flow',
    result: {
      fundsFlow,
      dealState: state,
      missingInputContract: state.missingInputContract,
      next_suggested_calls: fundsFlow.next_suggested_calls,
      portableTakeBackArtifacts: fundsFlow.takeBackArtifacts,
    },
    state_hash_after: state.stateHash,
    completeness_contribution_delta: 0,
    methodology_version: DEFINITIVE_METHODOLOGY_VERSION,
    the_line_invariant: LINE_INVARIANT,
  };
}

export function composeDefinitivePmiPlan(input: Record<string, any>) {
  const state = stateFromInput(input);
  const objective = textValue(input.objective) || 'post_close_pmi';
  const audience = textValue(input.audience) || 'operators_and_integration_team';
  const sourceRefs = sourceRefsForCategories(state, ['operations', 'financials', 'commercial', 'hr', 'legal']);
  const sourceGaps = ['operations', 'financials', 'commercial', 'hr']
    .filter(category => !sourceRefs.some(source => source.category === category))
    .map(category => ({
      category,
      reason: `PMI plan needs ${category} source support before operating reliance.`,
      suggestedTool: 'compose_data_room_index',
    }));
  const workstreams = buildPmiWorkstreams(state);
  const milestones = buildPmiMilestones(state);
  const risks = buildPmiRiskRegister(state, sourceGaps.map(gap => gap.category));
  const needsModelState = !state.completenessReport.satisfied.includes('model_state_present');
  const planHash = sha256(stableStringify({
    dealStateHash: state.stateHash,
    objective,
    audience,
    workstreams: workstreams.map(workstream => ({
      id: workstream.id,
      status: workstream.status,
      missingSourceCategories: workstream.missingSourceCategories,
    })),
    milestones,
    risks,
    sourceGaps,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
  }));
  const pmiPlan = {
    planId: `pmi_${planHash.slice(0, 16)}`,
    schema: 'PMIPlan.v0.1',
    dealStateCid: state.cid,
    dealStateHash: state.stateHash,
    objective,
    audience,
    stage: currentStageForState(state),
    readinessLevel: state.completenessReport.level,
    workstreams,
    milestones,
    riskRegister: risks,
    sourceRefs,
    sourceGaps,
    modelDependencies: {
      required: needsModelState,
      status: needsModelState ? 'missing_model_state' : 'not_blocked',
      suggestedTool: needsModelState ? 'compose_model_stack' : null,
      preferredModel: 'MODEL.PMI.VALUE.CREATION.v1',
    },
    pmiBoundary: {
      composedOnly: true,
      noOperatingAuthority: true,
      noEmploymentAdvice: true,
      noLegalOrTaxOpinion: true,
      noExternalTransmission: true,
      userDecides:
        'The user and operating team decide operating changes, employee communications, legal notices, customer/vendor outreach, budgets, and execution timing.',
    },
    next_suggested_calls: [
      ...(sourceGaps.length
        ? [{
            toolName: 'compose_data_room_index',
            priority: 'P1' as const,
            reason: `Fill PMI source gaps: ${sourceGaps.map(gap => gap.category).join(', ')}.`,
            inputHint: { dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision } },
          }]
        : []),
      ...(needsModelState
        ? [{
            toolName: 'compose_model_stack',
            priority: 'P1' as const,
            reason: 'Tie PMI value-creation workstreams to deterministic model outputs before relying on impact estimates.',
            inputHint: {
              journey: 'pmi',
              league: state.classificationKey.league === 'unknown' ? undefined : state.classificationKey.league,
              dealType: state.payload.dealType || state.payload.structure || state.classificationKey.subJourney,
              signals: state.signals || undefined,
            },
          }]
        : []),
      {
        toolName: 'compose_document_draft',
        priority: sourceGaps.length || needsModelState ? 'P2' as const : 'P1' as const,
        reason: 'Render the PMI control packet into a source-aware Studio PMI plan scaffold.',
        inputHint: {
          dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision },
          documentType: 'pmi_plan',
          audience,
        },
      },
      {
        toolName: 'update_deal_payload',
        priority: 'P2' as const,
        reason: 'Append PMI events, completed actions, updated model outputs, and new source refs as the post-close loop progresses.',
        inputHint: {
          dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision },
          patch: {
            dealEvents: [
              {
                eventType: 'pmi',
                stage: 'close_pmi',
                label: '<PMI update or completed workstream>',
                sourceRefs: [],
                artifactRefs: [],
              },
            ],
          },
        },
      },
    ],
    takeBackArtifacts: ['PMIPlan', 'DealState', 'DocumentDraft', 'MCPCallHint[]'],
    lineInvariant: LINE_INVARIANT,
  };

  return {
    ok: true,
    action: 'compose_pmi_plan',
    result: {
      pmiPlan,
      dealState: state,
      missingInputContract: state.missingInputContract,
      next_suggested_calls: pmiPlan.next_suggested_calls,
      portableTakeBackArtifacts: pmiPlan.takeBackArtifacts,
    },
    state_hash_after: state.stateHash,
    completeness_contribution_delta: 0,
    methodology_version: DEFINITIVE_METHODOLOGY_VERSION,
    the_line_invariant: LINE_INVARIANT,
  };
}

function buildDealStateResult(action: 'ingest_deal_payload' | 'update_deal_payload' | 'clone_deal_state', state: DefinitiveDealState, priorScore: number | null) {
  const scoreDelta = priorScore == null ? state.completenessReport.score : state.completenessReport.score - priorScore;
  const representationContext = inferRepresentationContext(state);
  return {
    ok: true,
    action,
    result: {
      dealState: state,
      classificationKey: state.classificationKey,
      representationContext,
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
  const representationContext = inferRepresentationContext(state);
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
    representationContext,
    stages,
    overlayGates: state.classificationKey.triggeredOverlayGates,
    workSurfaces: ['today', 'pipeline', 'files', 'studio', 'models', 'data_room'],
    modelingLoop: {
      status: state.completenessReport.satisfied.includes('model_state_present')
        ? 'model_versions_present'
        : 'model_stack_needed',
      principle:
        'Modeling is iterative. Each updated EV, EBITDA, debt, working capital, tax, diligence, or term input should create a new versioned model run tied back to DealState.',
      loop: [
        'compose_model_stack from the current classification key',
        'execute the needed deterministic model(s)',
        'save the run as a versioned ModelState artifact',
        'update_deal_payload with the new model output hash and source refs',
        'check_completeness and decide whether IOI, LOI, diligence, negotiation, or PMI is now the right next step',
      ],
      portableArtifacts: ['ModelState', 'ModelVersion[]', 'ModelOutput', 'DealStateDiff'],
    },
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
  const nextGate = state.completenessReport.nextGate || null;
  return calls.map(call => ({ advancesGate: nextGate, ...call }));
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

type PackageVerificationStatus = 'pass' | 'warn' | 'fail';

function normalizePackage(value: unknown): Record<string, any> {
  if (isPlainObject(value)) return value as Record<string, any>;
  return {};
}

function buildPackageVerificationChecks(
  dealPackage: Record<string, any>,
  state: DefinitiveDealState | null,
  input: Record<string, any>,
): Array<{ id: string; label: string; status: PackageVerificationStatus; detail: string }> {
  const expectedPackageCid = nullableString(input.expectedPackageCid);
  const expectedDealStateCid = nullableString(input.expectedDealStateCid) || nullableString(input.expectedStateCid);
  const expectedCid = expectedPackageCid
    || (nullableString(dealPackage.dealStateHash) && nullableString(dealPackage.dealPlan?.planId)
      ? expectedDealPackageCid(dealPackage)
      : null);
  const artifacts = Array.isArray(dealPackage.takeBackArtifacts) ? dealPackage.takeBackArtifacts.map(String) : [];
  const nextCalls = Array.isArray(dealPackage.next_suggested_calls) ? dealPackage.next_suggested_calls : [];
  const checks = [
    packageCheck(
      'schema',
      'DealPackage schema',
      dealPackage.schema === 'DealPackage.v0.1',
      `schema=${nullableString(dealPackage.schema) || 'missing'}`,
    ),
    packageCheck(
      'package_cid',
      'Package content address',
      typeof dealPackage.packageCid === 'string' && dealPackage.packageCid.startsWith('definitive:deal-package:sha256:'),
      `packageCid=${nullableString(dealPackage.packageCid) || 'missing'}`,
    ),
    packageCheck(
      'package_cid_matches',
      'Package CID recomputes',
      Boolean(expectedCid && dealPackage.packageCid === expectedCid),
      expectedCid ? `expected=${expectedCid}` : 'missing dealStateHash or dealPlan.planId for recompute',
    ),
    packageCheck(
      'expected_package_cid',
      'Caller expected package CID',
      !expectedPackageCid || dealPackage.packageCid === expectedPackageCid,
      expectedPackageCid ? `expected=${expectedPackageCid}` : 'no caller expected package CID supplied',
      expectedPackageCid ? 'fail' : 'warn',
    ),
    packageCheck(
      'deal_state_reference',
      'DealState reference',
      Boolean(dealPackage.dealStateCid && dealPackage.dealStateHash),
      `dealStateCid=${nullableString(dealPackage.dealStateCid) || 'missing'}`,
    ),
    packageCheck(
      'expected_deal_state_cid',
      'Caller expected DealState CID',
      !expectedDealStateCid || dealPackage.dealStateCid === expectedDealStateCid,
      expectedDealStateCid ? `expected=${expectedDealStateCid}` : 'no caller expected DealState CID supplied',
      expectedDealStateCid ? 'fail' : 'warn',
    ),
    packageCheck(
      'companion_state_matches',
      'Companion DealState matches package',
      !state || (dealPackage.dealStateCid === state.cid && dealPackage.dealStateHash === state.stateHash),
      state ? `state=${state.cid}` : 'no companion DealState supplied',
      state ? 'fail' : 'warn',
    ),
    packageCheck(
      'classification_key',
      'Classification key present',
      isPlainObject(dealPackage.classificationKey),
      'package should carry the eight-axis routing key',
    ),
    packageCheck(
      'completeness_report',
      'Completeness report present',
      isPlainObject(dealPackage.completenessReport),
      'package should carry readiness and missing-input state',
    ),
    packageCheck(
      'deal_plan',
      'DealPlan present',
      isPlainObject(dealPackage.dealPlan) && Boolean(dealPackage.dealPlan.planId),
      `planId=${nullableString(dealPackage.dealPlan?.planId) || 'missing'}`,
    ),
    packageCheck(
      'next_calls',
      'Recursive next calls present',
      nextCalls.length > 0,
      `next_suggested_calls=${nextCalls.length}`,
    ),
    packageCheck(
      'take_back_artifacts',
      'Portable take-back artifacts present',
      artifacts.includes('DealPackage') && artifacts.includes('DealState') && artifacts.includes('MissingInputContract'),
      `takeBackArtifacts=${artifacts.join(',') || 'missing'}`,
    ),
    packageCheck(
      'line_invariant',
      'THE LINE invariant present',
      nullableString(dealPackage.lineInvariant) === LINE_INVARIANT,
      'package must preserve compute-not-advise boundary',
    ),
  ];
  return checks;
}

function expectedDealPackageCid(dealPackage: Record<string, any>): string | null {
  const stateHash = nullableString(dealPackage.dealStateHash);
  const planId = nullableString(dealPackage.dealPlan?.planId);
  if (!stateHash || !planId) return null;
  return `definitive:deal-package:sha256:${sha256(stableStringify({
    stateHash,
    dealPlanId: planId,
    schema: 'DealPackage.v0.1',
  }))}`;
}

function packageCheck(
  id: string,
  label: string,
  passes: boolean,
  detail: string,
  missingOptionalStatus: PackageVerificationStatus = 'fail',
) {
  return {
    id,
    label,
    status: passes ? 'pass' as const : missingOptionalStatus,
    detail,
  };
}

function outputHashFor(value: unknown) {
  return {
    algorithm: 'sha256',
    hash: sha256(stableStringify(value)),
    canonicalization: 'stable-json-v0.1',
  };
}

function buildPackageSourceHashes(dealPackage: Record<string, any>) {
  const sourceIndex = Array.isArray(dealPackage.sourceIndex) ? dealPackage.sourceIndex : [];
  return sourceIndex.map((source: any, index: number) => {
    const providedHash = nullableString(source?.hash) || nullableString(source?.sourceHash);
    return {
      algorithm: 'sha256',
      hash: providedHash?.replace(/^sha256:/, '') || sha256(stableStringify(source)),
      canonicalization: providedHash ? 'provided-source-hash' : `source-index-item-${index}-stable-json-v0.1`,
    };
  });
}

function buildPackageModelHashes(dealPackage: Record<string, any>) {
  const modelRefs = [
    ...(Array.isArray(dealPackage.dealPlan?.modelStack) ? dealPackage.dealPlan.modelStack : []),
    ...(Array.isArray(dealPackage.modelOutputs) ? dealPackage.modelOutputs : []),
  ];
  return modelRefs.map((model: any, index: number) => ({
    algorithm: 'sha256',
    hash: nullableString(model?.outputHash)?.replace(/^sha256:/, '') || sha256(stableStringify(model)),
    canonicalization: `model-output-${index}-stable-json-v0.1`,
  }));
}

function buildPackageMerkleProof(dealPackage: Record<string, any>, auditPacket: Record<string, any>) {
  const leafHash = outputHashFor({
    packageCid: dealPackage.packageCid,
    dealStateHash: dealPackage.dealStateHash,
    packageId: dealPackage.packageId,
  }).hash;
  const siblings = [
    outputHashFor(auditPacket.auditHash).hash,
    outputHashFor(dealPackage.classificationKey || {}).hash,
    outputHashFor(dealPackage.completenessReport || {}).hash,
    outputHashFor(dealPackage.missingInputContract || {}).hash,
  ];
  return {
    schema: 'MerkleInclusionProof.v0.1',
    leafHash,
    rootHash: sha256(stableStringify([leafHash, ...siblings])),
    proof: siblings,
  };
}

function buildPackageHumanRender(
  dealPackage: Record<string, any>,
  packageVerification: Record<string, any>,
  auditPacket: Record<string, any>,
  signedManifest: Record<string, any>,
  merkleProof: Record<string, any>,
) {
  const title = nullableString(dealPackage.dealPlan?.title)
    || nullableString(dealPackage.classificationKey?.subJourney)
    || 'DEFINITIVE deal package';
  const markdown = [
    `# ${title}`,
    '',
    `- Package CID: ${nullableString(dealPackage.packageCid) || 'missing'}`,
    `- DealState CID: ${nullableString(dealPackage.dealStateCid) || 'missing'}`,
    `- Readiness: ${nullableString(dealPackage.readinessLevel) || 'unknown'}`,
    `- Verification: ${packageVerification.verified ? 'passed' : 'blocked'}`,
    `- Audit packet: ${nullableString(auditPacket.packetId) || 'missing'}`,
    `- Signed manifest: ${nullableString(signedManifest.manifestId) || 'not issued'}`,
    `- Merkle root: ${nullableString(merkleProof.rootHash) || 'not issued'}`,
    '',
    '## THE LINE',
    LINE_INVARIANT,
    '',
    '## Next Suggested Calls',
    ...(Array.isArray(dealPackage.next_suggested_calls) && dealPackage.next_suggested_calls.length > 0
      ? dealPackage.next_suggested_calls.map((call: any) => `- ${call.toolName}: ${call.reason}`)
      : ['- None supplied.']),
  ].join('\n');
  return {
    schema: 'HumanPackageRender.v0.1',
    format: 'markdown',
    title,
    packageCid: nullableString(dealPackage.packageCid) || null,
    renderHash: outputHashFor(markdown),
    markdown,
    lineInvariant: LINE_INVARIANT,
  };
}

function normalizeObjectivePreference(input: Record<string, any>) {
  const rawName = nullableString(input.objectivePreference)
    || nullableString(input.preference)
    || nullableString(input.objective)
    || 'balanced';
  const name = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const presetWeights: Record<string, Record<string, number>> = {
    balanced: { sellerAfterTax: 0.2, buyerBasis: 0.2, certainty: 0.25, speed: 0.15, simplicity: 0.2 },
    seller_cash: { sellerAfterTax: 0.4, buyerBasis: 0.1, certainty: 0.2, speed: 0.1, simplicity: 0.2 },
    buyer_basis: { sellerAfterTax: 0.1, buyerBasis: 0.4, certainty: 0.2, speed: 0.1, simplicity: 0.2 },
    certainty: { sellerAfterTax: 0.15, buyerBasis: 0.1, certainty: 0.45, speed: 0.15, simplicity: 0.15 },
    speed: { sellerAfterTax: 0.1, buyerBasis: 0.1, certainty: 0.2, speed: 0.45, simplicity: 0.15 },
    simplicity: { sellerAfterTax: 0.15, buyerBasis: 0.1, certainty: 0.2, speed: 0.15, simplicity: 0.4 },
  };
  const suppliedWeights = isPlainObject(input.weights) ? input.weights as Record<string, unknown> : {};
  const weights = {
    ...(presetWeights[name] || presetWeights.balanced),
    ...Object.fromEntries(Object.entries(suppliedWeights).map(([key, value]) => [key, clampScore(Number(value) * 100) / 100])),
  };
  return {
    schema: 'ObjectivePreference.v0.1',
    name: presetWeights[name] ? name : 'balanced',
    weights,
    lineBoundary: LINE_INVARIANT,
  };
}

function buildStructurePermutations(state: DefinitiveDealState, objective: Record<string, any>, expanded: boolean) {
  const structures = new Set<string>();
  const journey = state.classificationKey.journey;
  if (journey === 'raise') {
    ['senior_debt', 'unitranche', 'minority_growth_equity', 'preferred_equity'].forEach(item => structures.add(item));
  } else if (journey === 'pmi') {
    ['integration_base_case', 'value_creation_plan', 'add_on_acquisition', 'margin_expansion'].forEach(item => structures.add(item));
  } else {
    ['asset_purchase', 'stock_purchase', 'forward_merger', 'seller_note', 'earnout', 'rollover_equity'].forEach(item => structures.add(item));
  }
  if (state.classificationKey.triggeredOverlayGates.includes('G28')) {
    ['section_363_sale', 'out_of_court_exchange', 'article_9_foreclosure'].forEach(item => structures.add(item));
  }
  if (state.classificationKey.triggeredOverlayGates.includes('G29')) {
    ['debt_amendment', 'recapitalization', 'exchange_offer'].forEach(item => structures.add(item));
  }
  if (state.classificationKey.triggeredOverlayGates.includes('G30') || state.classificationKey.assetClass === 'real_estate') {
    ['real_estate_entity_purchase', 'opco_propco_split', 'sale_leaseback'].forEach(item => structures.add(item));
  }
  if (expanded) {
    ['asset_purchase_with_earnout', 'stock_purchase_with_338_election', 'rollover_plus_seller_note'].forEach(item => structures.add(item));
  }
  return [...structures].map(structure => scoreStructurePermutation(state, structure, objective));
}

function scoreStructurePermutation(state: DefinitiveDealState, structure: string, objective: Record<string, any>) {
  const metrics = scoreStructureMetrics(state, structure);
  const weightedScore = weightedPermutationScore(metrics, objective.weights || {});
  const modelOutput = {
    schema: 'ModelOutput.v0.1',
    modelId: modelForStructure(structure),
    modelName: 'DEFINITIVE structure permutation scorer',
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
    inputHash: outputHashFor({ stateHash: state.stateHash, structure, objective }),
    outputHash: outputHashFor({ metrics, weightedScore, structure }),
    inputs: {
      structure,
      objectivePreference: objective.name,
      stateHash: state.stateHash,
      classificationKey: state.classificationKey,
    },
    outputs: {
      ...metrics,
      weightedScore,
      scoreScale: '0-100',
    },
    assumptions: {
      schema: 'AssumptionLog.v0.1',
      assumptions: [
        { key: 'preference_vector', value: objective.name, source: 'caller_or_default' },
        { key: 'structure', value: structure, source: 'generated_permutation' },
      ],
    },
    citations: [],
    lineBoundary: LINE_INVARIANT,
  };
  return {
    permutationId: `perm_${sha256(stableStringify({ stateHash: state.stateHash, structure, objective })).slice(0, 16)}`,
    structure,
    modelOutputs: [modelOutput],
    constraints: buildPermutationConstraints(state, structure),
    handoffs: buildPermutationHandoffs(state, structure),
    metrics,
    weightedScore,
    lineBoundary: LINE_INVARIANT,
  };
}

function scoreStructureMetrics(state: DefinitiveDealState, structure: string) {
  const isAsset = structure.includes('asset');
  const isStock = structure.includes('stock');
  const isDebt = structure.includes('debt') || structure.includes('note') || structure.includes('unitranche');
  const isDistressed = structure.includes('363') || structure.includes('exchange') || structure.includes('foreclosure');
  const isRealEstate = structure.includes('real_estate') || structure.includes('propco') || structure.includes('leaseback');
  const hasG28 = state.classificationKey.triggeredOverlayGates.includes('G28');
  const hasG30 = state.classificationKey.triggeredOverlayGates.includes('G30');
  return {
    sellerAfterTax: clampScore(65 + (isStock ? 12 : 0) - (isAsset ? 8 : 0) - (isDistressed ? 10 : 0)),
    buyerBasis: clampScore(55 + (isAsset ? 18 : 0) + (structure.includes('338') ? 12 : 0) - (isStock ? 8 : 0)),
    certainty: clampScore(70 - (isDistressed ? 20 : 0) - (hasG28 ? 10 : 0) - (isRealEstate && hasG30 ? 6 : 0)),
    speed: clampScore(68 - (isDistressed ? 14 : 0) - (isRealEstate ? 8 : 0) + (isDebt ? 5 : 0)),
    simplicity: clampScore(72 - (structure.includes('earnout') ? 12 : 0) - (structure.includes('rollover') ? 8 : 0) - (isDistressed ? 16 : 0)),
  };
}

function weightedPermutationScore(metrics: Record<string, number>, weights: Record<string, number>) {
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + Number(weight || 0), 0) || 1;
  const score = Object.entries(weights).reduce((sum, [key, weight]) => {
    return sum + (metrics[key] || 0) * Number(weight || 0);
  }, 0) / totalWeight;
  return Math.round(score * 10) / 10;
}

function buildParetoFrontier(permutations: Array<Record<string, any>>, objective: Record<string, any>) {
  const dominatedPermutationIds = permutations
    .filter(candidate => permutations.some(other => dominatesPermutation(other.metrics, candidate.metrics)))
    .map(candidate => candidate.permutationId);
  return {
    schema: 'ParetoFrontier.v0.1',
    objectivePreference: objective.name,
    permutations: permutations
      .filter(permutation => !dominatedPermutationIds.includes(permutation.permutationId))
      .sort((a, b) => b.weightedScore - a.weightedScore),
    dominatedPermutationIds,
    lineBoundary: LINE_INVARIANT,
  };
}

function dominatesPermutation(a: Record<string, number>, b: Record<string, number>) {
  const keys = ['sellerAfterTax', 'buyerBasis', 'certainty', 'speed', 'simplicity'];
  return keys.every(key => (a[key] || 0) >= (b[key] || 0)) && keys.some(key => (a[key] || 0) > (b[key] || 0));
}

function buildPermutationConstraints(state: DefinitiveDealState, structure: string) {
  const constraints: string[] = [];
  if (structure.includes('338')) constraints.push('Requires §338(h)(10) or §336(e) eligibility and tax review.');
  if (structure.includes('363')) constraints.push('Requires bankruptcy court process; DEFINITIVE computes mechanics only.');
  if (structure.includes('exchange')) constraints.push('Requires securities/counsel review; DEFINITIVE computes participation and holdout math only.');
  if (structure.includes('real_estate') || structure.includes('propco') || structure.includes('leaseback')) constraints.push('Requires G30 real estate overlay inputs.');
  if (state.completenessReport.missing.length > 0) constraints.push('Missing inputs remain in the MissingInputContract.');
  return constraints;
}

function buildPermutationHandoffs(state: DefinitiveDealState, structure: string) {
  const handoffs: Array<Record<string, any>> = [];
  if (structure.includes('338') || structure.includes('asset') || structure.includes('stock')) {
    handoffs.push({ role: 'tax_counsel_or_cpa', reason: 'Tax position, election availability, and opinion remain outside THE LINE.' });
  }
  if (structure.includes('363') || structure.includes('exchange') || structure.includes('foreclosure')) {
    handoffs.push({ role: 'deal_counsel', reason: 'Court process, contract interpretation, and execution risk remain outside THE LINE.' });
  }
  if (state.classificationKey.triggeredOverlayGates.includes('G30')) {
    handoffs.push({ role: 'real_estate_specialist', reason: 'Appraisal, title, environmental, and zoning opinions are pass-through specialist work.' });
  }
  return handoffs;
}

function modelForStructure(structure: string) {
  if (structure.includes('363')) return 'M151';
  if (structure.includes('exchange')) return 'M160';
  if (structure.includes('real_estate') || structure.includes('propco') || structure.includes('leaseback')) return 'M187';
  if (structure.includes('338')) return 'M201';
  if (structure.includes('asset')) return 'M139';
  if (structure.includes('earnout')) return 'M213';
  if (structure.includes('debt') || structure.includes('note') || structure.includes('unitranche')) return 'M184';
  return 'M200';
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value * 10) / 10));
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
  if (matches(text, ['seller_loi_readiness', 'incoming_loi_review', 'owner_loi_readiness', 'sell_side_loi'])) return 'seller_loi_readiness';
  if (matches(text, ['seller_diligence_readiness', 'seller_dd_readiness', 'owner_dd_readiness', 'vendor_diligence', 'sell_side_diligence'])) return 'seller_diligence_readiness';
  if (matches(text, ['ioi', 'indication'])) return 'ioi';
  if (matches(text, ['loi', 'letter_of_intent', 'term_sheet'])) return 'loi_outline';
  if (matches(text, ['ic', 'investment_committee', 'memo'])) return 'ic_memo';
  if (matches(text, ['diligence', 'request'])) return 'diligence_request';
  if (matches(text, ['negotiation'])) return 'negotiation_brief';
  if (matches(text, ['close_readiness', 'closing_readiness', 'close readiness', 'closing readiness'])) return 'close_readiness';
  if (matches(text, ['funds_flow', 'funds flow', 'closing statement', 'settlement statement'])) return 'funds_flow';
  if (matches(text, ['pmi', 'integration', 'post_close'])) return 'pmi_plan';
  return 'deal_brief';
}

function audienceForDocumentType(documentType: string): string {
  switch (documentType) {
    case 'seller_loi_readiness':
    case 'seller_diligence_readiness':
      return 'owner_and_sell_side_advisors';
    case 'ioi':
    case 'loi_outline':
      return 'counterparty_and_internal_team';
    case 'ic_memo':
      return 'investment_committee';
    case 'diligence_request':
      return 'deal_team_and_counterparty';
    case 'negotiation_brief':
      return 'internal_deal_team';
    case 'close_readiness':
    case 'funds_flow':
      return 'internal_deal_team_and_closing_advisors';
    case 'pmi_plan':
      return 'operators_and_integration_team';
    default:
      return 'agent_or_principal';
  }
}

function documentDraftTitle(documentType: string, state: DefinitiveDealState): string {
  const subject = textValue(state.payload.dealName) || textValue(state.payload.targetName) || textValue(state.payload.companyName) || 'Deal';
  switch (documentType) {
    case 'seller_loi_readiness':
      return `${subject} seller LOI readiness scaffold`;
    case 'seller_diligence_readiness':
      return `${subject} seller diligence readiness scaffold`;
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
    case 'close_readiness':
      return `${subject} close readiness scaffold`;
    case 'funds_flow':
      return `${subject} funds flow scaffold`;
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
    case 'seller_loi_readiness':
      return [
        sectionPlan('seller_economics', 'Seller economics and valuation support', ['financials'], 'Tie asking price, purchase price, proceeds, SDE/EBITDA, working capital, escrow, seller note, earnout, and rollover facts to source-backed model outputs.', commonBoundary),
        sectionPlan('incoming_terms_review', 'Incoming LOI term review map', ['legal', 'tax'], 'Organize structure, tax, exclusivity, conditions, authority, and counsel handoffs for owner-side review without drafting clauses or accepting terms.', LINE_INVARIANT),
        sectionPlan('buyer_conditions_and_dd', 'Buyer conditions and diligence readiness', ['legal', 'commercial'], 'Identify conditions, consents, diligence topics, and data-room gaps that affect owner response readiness.', commonBoundary),
      ];
    case 'seller_diligence_readiness':
      return [
        sectionPlan('data_room_coverage', 'Data-room coverage', ['financials', 'legal', 'tax', 'commercial'], 'Show which core seller diligence categories are source-ready and which need owner/advisor follow-up.', commonBoundary),
        sectionPlan('buyer_request_response', 'Buyer request response plan', ['financials', 'commercial', 'operations'], 'Organize likely buyer diligence questions and owner-side response dependencies from indexed sources.', commonBoundary),
        sectionPlan('disclosure_controls', 'Disclosure controls and handoffs', ['legal', 'tax'], 'Separate private, selectively shareable, and counsel-reviewed materials before any external data-room release.', LINE_INVARIANT),
      ];
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
    case 'close_readiness':
      return [
        sectionPlan('readiness_checks', 'Readiness checks', ['financials', 'legal', 'tax'], 'Show close-readiness checks, blockers, source gaps, and model dependencies.', LINE_INVARIANT),
        sectionPlan('funds_flow_and_conditions', 'Funds flow and conditions', ['financials', 'financing', 'legal'], 'Track funds-flow reconciliation, payoff/escrow status, closing conditions, approvals, and consents.', LINE_INVARIANT),
        sectionPlan('approval_handoffs', 'Approval handoffs', ['legal', 'tax', 'financing'], 'Separate computed readiness from human approval, wire instructions, escrow authority, counsel/tax clearance, and close authority.', LINE_INVARIANT),
      ];
    case 'funds_flow':
      return [
        sectionPlan('funding_sources', 'Funding sources', ['financials', 'financing'], 'List source rows from supplied equity, debt, seller note, and rollover facts.', commonBoundary),
        sectionPlan('uses_and_adjustments', 'Uses and adjustments', ['financials', 'legal', 'tax'], 'Track purchase price, payoff, escrow, working-capital adjustment, fees, and withholding rows.', LINE_INVARIANT),
        sectionPlan('closing_handoffs', 'Closing handoffs', ['legal', 'financing', 'tax'], 'Separate arithmetic from wire instructions, escrow authority, payoff letters, and tax positions.', LINE_INVARIANT),
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

function closeReadinessSourceCategories(state: DefinitiveDealState) {
  const categories = new Set(['financials', 'legal', 'tax', 'financing']);
  if (state.classificationKey.triggeredOverlayGates.includes('G28')) categories.add('restructuring');
  if (state.classificationKey.triggeredOverlayGates.includes('G29')) categories.add('financing');
  if (state.classificationKey.triggeredOverlayGates.includes('G30') || state.classificationKey.assetClass === 'real_estate') categories.add('real_estate');
  if (hasAnyValue(state.payload, ['regulatoryApprovals', 'approvals', 'hsr', 'cfius']) || matches(compactText([state.payload.dealType, state.payload.notes, state.classificationKey.industry]), ['regulated', 'healthcare', 'defense', 'bank', 'insurance', 'fcc', 'ferc'])) {
    categories.add('regulatory');
  }
  if (hasAnyValue(state.payload, ['pmiPlan', 'integrationPlan', 'dayZero'])) categories.add('operations');
  return [...categories];
}

function buildCloseReadinessChecks(
  state: DefinitiveDealState,
  requiredSourceCategories: string[],
  sourceGaps: Array<Record<string, any>>,
) {
  const payload = state.payload;
  const termsPresent = state.completenessReport.satisfied.includes('term_architecture_present')
    || hasAnyValue(payload, ['loi', 'keyTerms', 'terms', 'purchaseAgreement', 'definitiveAgreement']);
  const fileUniversePresent = state.completenessReport.satisfied.includes('file_universe_present');
  const modelStatePresent = state.completenessReport.satisfied.includes('model_state_present');
  const closingConditionsPresent = hasAnyValue(payload, [
    'closingConditions',
    'conditions',
    'consents',
    'thirdPartyConsents',
    'regulatoryApprovals',
    'approvals',
    'financingCondition',
    'diligenceCondition',
    'payoffLetters',
  ]);
  const professionalDeferrals = buildPackageDeferrals(state);
  const hasProfessionalClearance = hasAnyValue(payload, [
    'counselClearance',
    'taxClearance',
    'professionalClearance',
    'professionalClearances',
    'closingChecklist',
    'closingChecklistApproved',
  ]);
  const sourceRows = buildFundsFlowSources(state);
  const useRows = buildFundsFlowUses(state);
  const fundsFlowReconciliation = buildFundsFlowReconciliation(sourceRows, useRows);
  const fundsFlowReady = fundsFlowReconciliation.status === 'balanced';
  const pmiPlanPresent = hasAnyValue(payload, ['pmiPlan', 'integrationPlan', 'dayZeroPlan']);
  const closed = hasAnyValue(payload, ['closedDate', 'actualCloseDate']) || matches(compactText([payload.status, payload.stage]), ['closed', 'funded']);

  return [
    closeReadinessCheck({
      id: 'deal_state_completeness',
      label: 'DealState lifecycle readiness',
      status: state.completenessReport.score >= 80 && state.completenessReport.blockers.length === 0 ? 'ready' : 'blocked',
      severity: state.completenessReport.blockers.length ? 'P0' : 'P1',
      reason: state.completenessReport.score >= 80
        ? 'Core DealState facts are sufficient for late-stage work.'
        : `DealState score is ${state.completenessReport.score}; closing readiness needs DRL4-level context.`,
      suggestedTool: state.completenessReport.score >= 80 ? null : 'update_deal_payload',
      evidence: {
        readinessLevel: state.completenessReport.level,
        score: state.completenessReport.score,
        blockers: state.completenessReport.blockers,
      },
    }),
    closeReadinessCheck({
      id: 'source_universe',
      label: 'Source and data-room support',
      status: sourceGaps.length ? 'missing_source' : 'ready',
      severity: sourceGaps.length ? 'P1' : 'P2',
      reason: sourceGaps.length
        ? `Missing close-supporting source categories: ${sourceGaps.map(gap => gap.category).join(', ')}.`
        : 'Required close-supporting source categories are indexed.',
      suggestedTool: sourceGaps.length ? 'compose_data_room_index' : null,
      sourceCategories: requiredSourceCategories,
      missingSourceCategories: sourceGaps.map(gap => gap.category),
      evidence: {
        indexedSourceCount: state.sourceIndex.length,
        citationReadyCount: state.sourceIndex.filter(source => source.citationReady).length,
      },
    }),
    closeReadinessCheck({
      id: 'term_architecture',
      label: 'Agreement and term architecture',
      status: termsPresent ? 'ready' : 'blocked',
      severity: 'P1',
      reason: termsPresent
        ? 'Term architecture or agreement facts are present.'
        : 'Closing readiness needs LOI/definitive-agreement economics, conditions, or key terms tracked.',
      suggestedTool: termsPresent ? null : 'prepare_loi_packet',
      evidence: { termsPresent },
    }),
    closeReadinessCheck({
      id: 'diligence_file_universe',
      label: 'Diligence file universe',
      status: fileUniversePresent ? 'ready' : 'missing_source',
      severity: 'P1',
      reason: fileUniversePresent
        ? 'A file universe, data-room index, or document set is present.'
        : 'Close readiness needs the diligence file universe tracked so unresolved items do not disappear.',
      suggestedTool: fileUniversePresent ? null : 'compose_data_room_index',
      evidence: { fileUniversePresent },
    }),
    closeReadinessCheck({
      id: 'deterministic_model_state',
      label: 'Deterministic model state',
      status: modelStatePresent ? 'ready' : 'missing_model',
      severity: 'P1',
      reason: modelStatePresent
        ? 'Model outputs or runs are attached to the DealState.'
        : 'Closing readiness needs the current deterministic model stack attached or explicitly marked not needed.',
      suggestedTool: modelStatePresent ? null : 'compose_model_stack',
      evidence: { modelStatePresent },
    }),
    closeReadinessCheck({
      id: 'closing_conditions',
      label: 'Closing conditions and consents',
      status: closingConditionsPresent ? 'ready' : 'blocked',
      severity: 'P1',
      reason: closingConditionsPresent
        ? 'Closing-condition, consent, approval, financing, or payoff facts are present.'
        : 'Closing readiness needs conditions, consents, approvals, financing, and payoff facts tracked before approval staging.',
      suggestedTool: closingConditionsPresent ? null : 'prepare_loi_packet',
      evidence: { closingConditionsPresent },
    }),
    closeReadinessCheck({
      id: 'funds_flow_reconciliation',
      label: 'Funds-flow reconciliation',
      status: fundsFlowReady ? 'ready' : fundsFlowReconciliation.status,
      severity: fundsFlowReady ? 'P2' : 'P0',
      reason: fundsFlowReady
        ? 'Cash sources equal cash uses on supplied rows.'
        : 'Funds-flow arithmetic is not balanced or is missing critical rows.',
      suggestedTool: fundsFlowReady ? null : 'generate_funds_flow',
      evidence: fundsFlowReconciliation,
    }),
    closeReadinessCheck({
      id: 'professional_handoffs',
      label: 'Counsel, tax, lender, and specialist handoffs',
      status: !professionalDeferrals.length || hasProfessionalClearance ? 'ready' : 'professional_handoff_required',
      severity: professionalDeferrals.length && !hasProfessionalClearance ? 'P1' : 'P2',
      reason: professionalDeferrals.length && !hasProfessionalClearance
        ? 'Triggered tax, restructuring, capital-structure, or specialist handoffs need clearance before close approval.'
        : 'No unresolved professional handoff blockers are visible from current payload.',
      suggestedTool: professionalDeferrals.length && !hasProfessionalClearance ? 'defer_to_counsel' : null,
      evidence: {
        professionalDeferrals,
        hasProfessionalClearance,
      },
    }),
    closeReadinessCheck({
      id: 'pmi_transition',
      label: 'PMI transition plan',
      status: pmiPlanPresent || closed ? 'ready' : 'needs_pmi_plan',
      severity: 'P2',
      reason: pmiPlanPresent || closed
        ? 'PMI or close-to-PMI facts are present.'
        : 'PMI plan is not required to approve closing, but it should be staged before Day 0.',
      suggestedTool: pmiPlanPresent || closed ? null : 'compose_pmi_plan',
      blocking: false,
      evidence: { pmiPlanPresent, closed },
    }),
    closeReadinessCheck({
      id: 'human_close_approval',
      label: 'Explicit human close approval',
      status: closed ? 'ready' : 'approval_required',
      severity: 'P0',
      reason: closed
        ? 'Payload indicates the deal is already closed or funded.'
        : 'Irreversible close movement requires a separate A6 close_deal action with explicit human approval.',
      suggestedTool: closed ? null : 'close_deal',
      blocking: false,
      scoreable: false,
      evidence: {
        lineStatus: 'human_approval_required',
        refusalBehavior: 'stage_for_approval',
      },
    }),
  ];
}

function closeReadinessCheck(input: {
  id: string;
  label: string;
  status: string;
  severity: 'P0' | 'P1' | 'P2';
  reason: string;
  suggestedTool: string | null;
  sourceCategories?: string[];
  missingSourceCategories?: string[];
  blocking?: boolean;
  scoreable?: boolean;
  evidence?: Record<string, any>;
}) {
  const blockingStatuses = new Set(['blocked', 'missing_source', 'missing_model', 'missing_rows', 'variance_present', 'professional_handoff_required']);
  const blocking = input.blocking ?? blockingStatuses.has(input.status);
  return {
    id: input.id,
    label: input.label,
    status: input.status,
    severity: input.severity,
    blocking,
    scoreable: input.scoreable ?? true,
    reason: input.reason,
    suggestedTool: input.suggestedTool,
    sourceCategories: input.sourceCategories || [],
    missingSourceCategories: input.missingSourceCategories || [],
    evidence: input.evidence || {},
    boundary:
      'This is a readiness checkpoint, not a closing authorization. DEFINITIVE organizes blockers and evidence; users and required professionals decide whether the deal can close.',
  };
}

function buildCloseApprovalMatrix(
  state: DefinitiveDealState,
  readinessStatus: string,
  checks: Array<Record<string, any>>,
) {
  const blockers = checks.filter(check => check.blocking);
  return [
    {
      id: 'user_close_approval',
      label: 'User close approval',
      status: readinessStatus === 'ready_to_stage_for_human_approval' ? 'ready_to_request' : readinessStatus === 'closed_pmi_ready' ? 'already_closed' : 'blocked',
      requiredTool: 'close_deal',
      lineStatus: 'human_approval_required',
      refusalBehavior: 'stage_for_approval',
      blockerCount: blockers.length,
    },
    {
      id: 'counsel_and_tax_clearance',
      label: 'Counsel/tax/professional clearance',
      status: checks.some(check => check.id === 'professional_handoffs' && check.blocking) ? 'required_before_close' : 'not_blocked',
      requiredTool: 'defer_to_counsel',
      lineStatus: 'counsel_review_required_when_applicable',
      blockerCount: checks.filter(check => check.id === 'professional_handoffs' && check.blocking).length,
    },
    {
      id: 'closing_agent_or_escrow',
      label: 'Closing agent / escrow confirmation',
      status: checks.some(check => check.id === 'funds_flow_reconciliation' && check.status === 'ready') ? 'requires_external_confirmation' : 'blocked_until_funds_flow_ready',
      requiredTool: 'generate_funds_flow',
      lineStatus: 'external_professional_required',
      blockerCount: checks.filter(check => check.id === 'funds_flow_reconciliation' && check.blocking).length,
    },
    {
      id: 'agent_take_back',
      label: 'Agent take-back packet',
      status: 'available',
      requiredTool: 'compose_deal_package',
      lineStatus: 'ok',
      blockerCount: 0,
      packetHint: { dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision } },
    },
  ];
}

function buildCloseReadinessNextCalls(
  state: DefinitiveDealState,
  checks: Array<Record<string, any>>,
  readinessStatus: string,
): DefinitiveMcpCallHint[] {
  const hints: DefinitiveMcpCallHint[] = [];
  const byTool = new Map<string, DefinitiveMcpCallHint>();
  const addHint = (hint: DefinitiveMcpCallHint) => {
    const existing = byTool.get(hint.toolName);
    if (!existing || priorityRank(hint.priority) < priorityRank(existing.priority)) {
      byTool.set(hint.toolName, hint);
    }
  };

  for (const check of checks.filter(check => check.blocking && check.suggestedTool)) {
    addHint({
      toolName: check.suggestedTool,
      priority: check.severity === 'P0' ? 'P0' : 'P1',
      reason: `Resolve close-readiness blocker: ${check.label}. ${check.reason}`,
      inputHint: closeReadinessInputHintForTool(state, check.suggestedTool),
    });
  }

  if (checks.some(check => check.id === 'pmi_transition' && check.status === 'needs_pmi_plan')) {
    addHint({
      toolName: 'compose_pmi_plan',
      priority: 'P2',
      reason: 'Stage Day 0 and PMI work before closing so the deal has a post-close home.',
      inputHint: { dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision } },
    });
  }

  addHint({
    toolName: 'compose_document_draft',
    priority: readinessStatus === 'blocked' ? 'P2' : 'P1',
    reason: 'Render the close-readiness packet into a source-aware Studio scaffold.',
    inputHint: {
      dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision },
      documentType: 'close_readiness',
      audience: 'internal_deal_team_and_closing_advisors',
    },
  });

  if (readinessStatus === 'ready_to_stage_for_human_approval') {
    addHint({
      toolName: 'close_deal',
      priority: 'P1',
      reason: 'All visible close-readiness blockers are clear. Stage the separate A6 human approval action; do not auto-close.',
      inputHint: {
        dealId: state.payload.dealId ?? '<deal_id>',
        closedDate: state.payload.closingDate ?? '<confirmed_closing_date>',
        finalPrice: firstNumber(state.payload, ['purchasePriceCents', 'headlinePriceCents', 'enterpriseValueCents']) ?? '<final_price_cents>',
        confirmed: false,
        note: 'Set confirmed=true only after explicit human approval.',
      },
    });
  }

  addHint({
    toolName: 'compose_deal_package',
    priority: 'P1',
    reason: 'Package close-readiness blockers, current DealState, and next calls for agent take-back.',
    inputHint: { dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision } },
  });

  const nextGate = state.completenessReport.nextGate || null;
  return [...byTool.values()]
    .map(hint => ({ advancesGate: nextGate, ...hint }))
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
}

function closeReadinessInputHintForTool(state: DefinitiveDealState, toolName: string) {
  if (toolName === 'compose_model_stack') {
    return {
      journey: state.classificationKey.journey,
      league: state.classificationKey.league === 'unknown' ? undefined : state.classificationKey.league,
      dealType: state.payload.dealType || state.payload.structure || state.classificationKey.subJourney,
      signals: state.signals || undefined,
    };
  }
  if (toolName === 'defer_to_counsel') {
    return {
      category: 'closing_readiness',
      issue: 'Professional clearance required before human close approval.',
      jurisdiction: state.classificationKey.jurisdiction,
      dealId: state.payload.dealId,
    };
  }
  return { dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision } };
}

function priorityRank(priority: 'P0' | 'P1' | 'P2') {
  return priority === 'P0' ? 0 : priority === 'P1' ? 1 : 2;
}

function buildPmiWorkstreams(state: DefinitiveDealState) {
  return [
    pmiWorkstream(
      state,
      'PMI0',
      'Day 0 controls',
      ['operations', 'financials', 'legal', 'hr'],
      ['dayZero', 'day0', 'banking', 'payroll', 'insurance', 'accessControls'],
      [
        'Confirm operating access, cash controls, payroll continuity, insurance, permits, and source-of-truth reporting.',
        'Freeze unsupported changes until operating facts and responsible owners are tracked.',
      ],
    ),
    pmiWorkstream(
      state,
      'PMI1',
      'Stabilization',
      ['operations', 'financials', 'commercial', 'hr'],
      ['stabilization', 'operatingRhythm', 'customerComms', 'vendorPlan', 'retentionPlan'],
      [
        'Track weekly cash, customer/vendor continuity, employee retention risks, and management cadence.',
        'Attach new facts to DealState after each stabilization pass.',
      ],
    ),
    pmiWorkstream(
      state,
      'PMI2',
      'Assessment',
      ['financials', 'commercial', 'operations'],
      ['assessment', 'qualityOfEarnings', 'kpiBaseline', 'orgMap', 'systemsMap'],
      [
        'Compare post-close baseline to diligence assumptions, model outputs, and observed operating data.',
        'Separate verified findings from unsupported claims before updating value-creation work.',
      ],
    ),
    pmiWorkstream(
      state,
      'PMI3',
      'Optimization',
      ['financials', 'commercial', 'operations'],
      ['valueCreation', 'valueLevers', 'pricing', 'margin', 'workingCapital', 'growthPlan'],
      [
        'Organize value-creation levers and dependencies for deterministic model refresh.',
        'Keep execution decisions, budgets, and communications with the user and operating team.',
      ],
    ),
  ];
}

function buildFundsFlowSources(state: DefinitiveDealState) {
  const payload = state.payload;
  return [
    fundsFlowRow('equity_contribution', 'Equity contribution', 'source', firstNumber(payload, ['equityContributionCents', 'buyerEquityCents', 'sponsorEquityCents', 'cashEquityCents']), true, ['financials', 'financing'], 'Equity funding amount is organized from payload facts or model output; it is not a capital call or funding instruction.'),
    fundsFlowRow('senior_debt', 'Senior debt / loan proceeds', 'source', firstNumber(payload, ['seniorDebtCents', 'debtFinancingCents', 'loanProceedsCents', 'sbaLoanCents']), true, ['financing'], 'Debt proceeds require lender documents and closing-agent confirmation before use.'),
    fundsFlowRow('seller_note', 'Seller note', 'source', firstNumber(payload, ['sellerNoteCents', 'sellerFinancingCents']), false, ['legal', 'financing'], 'Seller note is tracked as consideration mechanics, not cash wired at closing unless closing advisors specify otherwise.'),
    fundsFlowRow('rollover_equity', 'Rollover equity', 'source', firstNumber(payload, ['rolloverCents']), false, ['legal', 'tax'], 'Rollover is non-cash consideration tracked for agreement and tax review.'),
  ].filter(row => row.status !== 'missing' || row.id === 'equity_contribution' || row.id === 'senior_debt');
}

function buildFundsFlowUses(state: DefinitiveDealState) {
  const payload = state.payload;
  return [
    fundsFlowRow('purchase_price', 'Purchase price / seller consideration', 'use', firstNumber(payload, ['purchasePriceCents', 'headlinePriceCents', 'enterpriseValueCents']), true, ['financials', 'legal'], 'Purchase price is a payload or model fact until confirmed by signed documents and closing advisors.'),
    fundsFlowRow('debt_payoff', 'Debt payoff', 'use', firstNumber(payload, ['debtPayoffCents', 'sellerDebtPayoffCents', 'payoffCents']), true, ['financing', 'legal'], 'Payoff requires signed payoff letters and closing-agent confirmation; DEFINITIVE does not issue payoff instructions.'),
    fundsFlowRow('working_capital_adjustment', 'Working capital adjustment', 'use', firstNumber(payload, ['workingCapitalAdjustmentCents', 'nwcAdjustmentCents', 'closingStatementAdjustmentCents']), true, ['financials'], 'Working-capital adjustment must reconcile to closing statement mechanics and accounting review.'),
    fundsFlowRow('escrow_holdback', 'Escrow / holdback funding', 'use', firstNumber(payload, ['escrowCents', 'holdbackCents']), true, ['legal', 'financials'], 'Escrow/holdback row is a draft allocation; escrow agreement and counsel control final terms.'),
    fundsFlowRow('transaction_expenses', 'Transaction expenses and fees', 'use', firstNumber(payload, ['transactionExpensesCents', 'feesCents', 'closingCostsCents']), true, ['financials', 'tax'], 'Expense treatment and payment instructions require advisor/counsel review.'),
    fundsFlowRow('tax_withholding', 'Tax withholding', 'use', firstNumber(payload, ['withholdingCents', 'taxWithholdingCents', 'firptaWithholdingCents']), true, ['tax'], 'Tax withholding is computed/organized only; tax advisors decide withholding positions and forms.'),
  ].filter(row => row.status !== 'missing' || row.id === 'purchase_price');
}

function buildFundsFlowAdjustments(state: DefinitiveDealState) {
  const payload = state.payload;
  return [
    fundsFlowAdjustment('cash_free_debt_free', 'Cash-free / debt-free adjustment', firstNumber(payload, ['cashFreeDebtFreeAdjustmentCents', 'netDebtAdjustmentCents']), ['financials', 'financing']),
    fundsFlowAdjustment('working_capital_true_up', 'Working capital true-up', firstNumber(payload, ['workingCapitalAdjustmentCents', 'nwcAdjustmentCents', 'closingStatementAdjustmentCents']), ['financials']),
    fundsFlowAdjustment('escrow_or_holdback', 'Escrow / holdback', firstNumber(payload, ['escrowCents', 'holdbackCents']), ['legal', 'financials']),
    fundsFlowAdjustment('seller_expenses', 'Seller expenses', firstNumber(payload, ['sellerExpensesCents', 'sellerTransactionExpensesCents']), ['financials', 'tax']),
    fundsFlowAdjustment('contingent_consideration', 'Contingent consideration / earnout', firstNumber(payload, ['earnoutCents', 'contingentConsiderationCents']), ['financials', 'legal', 'tax']),
  ].filter(adjustment => adjustment.status !== 'missing');
}

function buildFundsFlowReconciliation(sourceRows: Array<Record<string, any>>, useRows: Array<Record<string, any>>) {
  const cashSourcesCents = sumFundsFlowRows(sourceRows, true);
  const cashUsesCents = sumFundsFlowRows(useRows, true);
  const varianceCents = cashSourcesCents - cashUsesCents;
  const missingCriticalRows = [
    ...sourceRows.filter(row => row.status === 'missing' && row.cashFlowingAtClose).map(row => row.id),
    ...useRows.filter(row => row.status === 'missing' && row.cashFlowingAtClose).map(row => row.id),
  ];
  return {
    cashSourcesCents,
    cashUsesCents,
    varianceCents,
    status: missingCriticalRows.length
      ? 'missing_rows'
      : varianceCents === 0
        ? 'balanced'
        : 'variance_present',
    missingCriticalRows,
    boundary:
      'Reconciliation is arithmetic over supplied rows. Closing advisors, lender, escrow agent, and counsel confirm final settlement statement and disbursement flow.',
  };
}

function buildFundsFlowHandoffs(state: DefinitiveDealState) {
  const handoffs: Array<Record<string, any>> = buildPackageDeferrals(state).map(deferral => ({
    ...deferral,
    lineStatus: 'requires_professional_or_user_determination',
  }));
  handoffs.push({
    category: 'closing_agent_or_escrow',
    reason: 'Wire details, escrow ledger, payoff instructions, and final disbursement authority remain with the closing agent or escrow holder.',
    suggestedTool: 'defer_to_counsel',
    lineStatus: 'external_professional_required',
  });
  handoffs.push({
    category: 'lender_and_payoff_letters',
    reason: 'Debt proceeds and payoff rows require lender-approved closing documents and payoff letters.',
    suggestedTool: 'compose_data_room_index',
    lineStatus: 'source_required',
  });
  if (state.classificationKey.taxClassification !== 'unknown') {
    handoffs.push({
      category: 'tax_withholding_review',
      reason: 'Withholding, allocation, and transaction-cost treatment require tax review before closing use.',
      suggestedTool: 'defer_to_counsel',
      lineStatus: 'tax_review_required',
    });
  }
  return handoffs;
}

function fundsFlowRow(
  id: string,
  label: string,
  direction: 'source' | 'use',
  amountCents: number | null,
  cashFlowingAtClose: boolean,
  sourceCategories: string[],
  boundary: string,
) {
  return {
    id,
    label,
    direction,
    status: amountCents == null ? 'missing' : 'payload_fact_present',
    amountCents,
    currency: 'USD',
    cashFlowingAtClose,
    sourceCategories,
    boundary,
  };
}

function fundsFlowAdjustment(id: string, label: string, amountCents: number | null, sourceCategories: string[]) {
  return {
    id,
    label,
    status: amountCents == null ? 'missing' : 'payload_fact_present',
    amountCents,
    currency: 'USD',
    sourceCategories,
    boundary:
      'Adjustment is organized as closing arithmetic. The user, counsel, accountant, and closing agent decide final settlement treatment.',
  };
}

function sumFundsFlowRows(rows: Array<Record<string, any>>, cashOnly: boolean) {
  return rows
    .filter(row => !cashOnly || row.cashFlowingAtClose)
    .reduce((total, row) => total + (typeof row.amountCents === 'number' ? row.amountCents : 0), 0);
}

function pmiWorkstream(
  state: DefinitiveDealState,
  id: string,
  label: string,
  sourceCategories: string[],
  payloadKeys: string[],
  tasks: string[],
) {
  const explicitFacts = payloadKeys.filter(key => hasAnyValue(state.payload, [key]));
  const sourceRefs = refsForCategories(state, sourceCategories);
  const missingSourceCategories = sourceCategories.filter(category => !sourceRefs.some(source => source.category === category));
  return {
    id,
    label,
    status: explicitFacts.length && !missingSourceCategories.length
      ? 'source_ready'
      : explicitFacts.length
        ? 'facts_present_source_gap'
        : 'needs_fact_and_source',
    explicitFacts,
    sourceCategories,
    sourceRefs,
    missingSourceCategories,
    tasks,
    boundary:
      'DEFINITIVE organizes PMI workstreams and evidence dependencies. The user and operating team choose actions, owners, communications, and timing.',
  };
}

function buildPmiMilestones(state: DefinitiveDealState) {
  const closeDate = textValue(firstPresentValue(state.payload, ['closedDate', 'closingDate', 'effectiveDate']));
  return [
    pmiMilestone('pre_day_0', 'Before Day 0', closeDate, -7, 'Confirm access, cash controls, transition contacts, and minimum source set.'),
    pmiMilestone('day_0', 'Day 0', closeDate, 0, 'Stabilize banking, payroll, customers, vendors, insurance, and operating cadence.'),
    pmiMilestone('day_30', 'Day 30', closeDate, 30, 'Refresh baseline model, risks, KPIs, and first stabilization findings.'),
    pmiMilestone('day_100', 'Day 100', closeDate, 100, 'Package value-creation priorities, owner map, and next-quarter model updates.'),
  ];
}

function pmiMilestone(id: string, label: string, closeDate: string | null, dayOffset: number, purpose: string) {
  return {
    id,
    label,
    closeDate,
    dayOffsetFromClose: dayOffset,
    targetDate: closeDate ? addIsoDays(closeDate, dayOffset) : null,
    purpose,
    boundary: 'Milestone is planning scaffolding. The user and operators set actual deadlines, owners, and commitments.',
  };
}

function buildPmiRiskRegister(state: DefinitiveDealState, missingSourceCategories: string[]) {
  const risks: Array<Record<string, any>> = [];
  if (missingSourceCategories.includes('operations')) {
    risks.push(pmiRisk('operations_visibility', 'Operations source gap', 'No operations source is indexed for PMI planning.', 'compose_data_room_index'));
  }
  if (missingSourceCategories.includes('financials')) {
    risks.push(pmiRisk('financial_reporting', 'Financial reporting source gap', 'No financial source is indexed for post-close reporting and model refresh.', 'compose_data_room_index'));
  }
  if (missingSourceCategories.includes('hr')) {
    risks.push(pmiRisk('people_continuity', 'People continuity source gap', 'No HR or people source is indexed for retention and payroll continuity tracking.', 'compose_data_room_index'));
  }
  if (state.classificationKey.triggeredOverlayGates.includes('G30')) {
    risks.push(pmiRisk('asset_class_overlay', 'Asset-class overlay', 'G30 overlay suggests real-estate, infrastructure, digital-asset, or secondaries inputs may affect PMI.', 'compose_data_room_index'));
  }
  if (!state.completenessReport.satisfied.includes('model_state_present')) {
    risks.push(pmiRisk('model_refresh_missing', 'Model refresh missing', 'No deterministic model output is attached yet for value-creation or covenant tracking.', 'compose_model_stack'));
  }
  if (!risks.length) {
    risks.push(pmiRisk('watchlist', 'PMI watchlist', 'No blocking PMI risk was detected from current DealState, but the plan should be refreshed as new facts arrive.', 'update_deal_payload'));
  }
  return risks;
}

function pmiRisk(id: string, label: string, reason: string, suggestedTool: string) {
  return {
    id,
    label,
    reason,
    suggestedTool,
    lineStatus: 'track_and_route_only',
    boundary:
      'Risk item is a tracking prompt, not an employment, legal, tax, or operating directive. The user and qualified advisors decide actions.',
  };
}

function addIsoDays(isoDate: string, days: number): string | null {
  const parsed = new Date(`${isoDate}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
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
      return ['compose_close_readiness', 'generate_funds_flow', 'compose_pmi_plan', 'close_deal'];
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
  const explicitLeague = normalizeLeague(payload.league);
  const inferredLeague = inferLeague(payload);
  const league = explicitLeague || inferredLeague;
  const triggeredOverlayGates = overlays.filter(overlay => overlay.triggered).map(overlay => overlay.gateId);
  const conflicts = detectClassificationConflicts({
    payload,
    explicitJourney,
    inferredJourney: inferJourney(text),
    explicitLeague,
    inferredLeague,
    overlays,
    signals,
  });
  const jurisdiction = textValue(payload.jurisdiction) || textValue(payload.state) || textValue(payload.country) || 'unknown';
  const industry = textValue(payload.industry) || 'unknown';
  const assetClass = inferAssetClass(payload, triggeredOverlayGates, signals, text);
  // distressPosture: distinguish "actively healthy" (positive signals) from
  // "unknown" (no signals either way). Previously these were collapsed into
  // healthy_or_unknown, which is honest but breaks downstream routing that
  // needs to know whether to apply healthy-deal model stacks or to wait for
  // more info before composing them.
  const distressPosture = triggeredOverlayGates.includes('G28')
    ? 'distressed'
    : triggeredOverlayGates.includes('G29')
      ? 'stressed_or_liability_management'
      : hasPositiveHealthSignals(payload, signals)
        ? 'healthy'
        : 'healthy_or_unknown';
  const subJourney = inferSubJourney(journey, triggeredOverlayGates, assetClass, text, payload);
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
    // Conflicts surface contradictory signals (e.g. journey=buy with seller_role
    // populated, healthy financials with bankruptcy_pending, explicit league
    // mismatching inferred). When present, the missing-input contract should
    // add an `explicit_*_confirmation` item.
    conflicts,
    confidence: {
      journey: explicitJourney ? 'explicit' : journey === 'unknown' ? 'missing' : 'inferred',
      subJourney: subJourney === 'unknown' ? 'missing' : 'inferred',
      league: normalizeLeague(payload.league) ? 'explicit' : league === 'unknown' ? 'missing' : 'inferred',
      jurisdiction: jurisdiction === 'unknown' ? 'missing' : 'explicit',
      distressPosture: triggeredOverlayGates.length || distressPosture === 'healthy' ? 'inferred' : 'missing',
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

  // Conflicts → explicit confirmation items. The substrate never silently
  // picks a side when signals contradict; instead it forces the agent to
  // confirm explicitly. (Test plan §3.2 PC-CONTRADICTORY: substrate must
  // surface the conflict, never silently pick.)
  if (classification.conflicts && classification.conflicts.length > 0) {
    for (const conflict of classification.conflicts) {
      missing.push({
        field: `explicit_${conflict.axis}_confirmation`,
        label: `Confirm ${conflict.axis} explicitly`,
        reason: conflict.reason,
        unlocks: ['classification_resolution', 'model_stack_routing', 'gate_advancement'],
        priority: 'P0',
        surface: 'chat',
      });
    }
  }

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
  // The gate this iteration is working toward — attached to each call so the
  // agent sees which gate a given next-step advances, closing the loop between
  // "what do I call" and "where does it move the deal".
  const nextGate = state.completenessReport.nextGate || null;
  if (state.missingInputContract.items.length > 0) {
    hints.push({
      toolName: 'update_deal_payload',
      priority: 'P0',
      reason: `Collect the minimal next input set: ${state.missingInputContract.minimalNextInputSet.join(', ') || 'any missing source fact'}.`,
      advancesGate: nextGate,
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
    advancesGate: null,
    inputHint: { dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision } },
  });
  if (state.classificationKey.journey !== 'unknown') {
    hints.push({
      toolName: 'compose_model_stack',
      priority: state.completenessReport.score >= 45 ? 'P0' : 'P1',
      reason: 'Translate the classification key and overlay gates into the applicable M101-M223 model stack. Treat modeling as iterative: each revised EV, EBITDA, debt, NWC, tax, diligence, or term input should produce a new versioned model run.',
      advancesGate: nextGate,
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
      advancesGate: state.classificationKey.triggeredOverlayGates.join('+'),
      inputHint: { objective: state.classificationKey.triggeredOverlayGates.join(',') },
    });
  }
  // Loop closure. When the required-input loop for the current gate is satisfied
  // (no P0 fact-collection left), the agent should know the loop has a terminal:
  // take back a portable package, or continue iterating to the next gate. Without
  // this, a "complete enough" state would only ever suggest re-scoring — the agent
  // could never tell it had reached done.
  if (state.missingInputContract.items.length === 0) {
    hints.push({
      toolName: 'compose_deal_package',
      priority: 'P1',
      reason: `Required inputs for ${nextGate || 'the current gate'} are satisfied. Take back a portable DealPackage, or keep iterating toward ${nextGate || 'the next gate'}.`,
      advancesGate: nextGate,
      inputHint: { dealState: { cid: state.cid, stateHash: state.stateHash, revision: state.revision } },
    });
  }
  return hints;
}

function inferRepresentationContext(state: DefinitiveDealState): DefinitiveRepresentationContext {
  const payload = state.payload;
  const text = compactText([
    payload.actorRole,
    payload.agentRole,
    payload.role,
    payload.representing,
    payload.representedParty,
    payload.intent,
    payload.objective,
    payload.stage,
    payload.notes,
    payload.dealType,
    payload.journey,
  ]);

  const side = inferRepresentationSide(state.classificationKey.journey, text);
  const actorRole = inferActorRole(side, text);
  const purpose = inferRepresentationPurpose(state.classificationKey.journey, text);
  const context: DefinitiveRepresentationContext = {
    side,
    actorRole,
    purpose,
    authorityBoundary:
      'DEFINITIVE may organize, compute, cite, and route the work. The represented principal, counsel, tax advisor, banker/broker, lender, closing agent, or other authorized professional decides positions, communications, legal language, external sharing, and closing authority.',
  };

  if (side === 'sell_side') {
    context.sellSidePreparationPath = [
      'classify owner/owner-rep mandate and sale-process stage',
      'normalize SDE/EBITDA, add-backs, working capital, valuation, and market support',
      'index data-room sources and identify seller-side source gaps',
      'prepare for incoming IOIs/LOIs without drafting clauses, accepting terms, or sending externally',
      'prepare diligence-response packets, disclosure subsets, and advisor/counsel handoffs',
      'stage close-readiness and funds-flow arithmetic without closing authority or wire instructions',
    ];
  }

  return context;
}

function inferRepresentationSide(journey: Journey, text: string): RepresentationSide {
  if (journey === 'sell') return 'sell_side';
  if (journey === 'buy') return 'buy_side';
  if (journey === 'raise') return 'raise_side';
  if (journey === 'pmi') return 'pmi';
  if (matches(text, ['owner rep', 'owner representative', 'founder', 'shareholder', 'seller', 'sell-side', 'sell side', 'vendor diligence'])) return 'sell_side';
  if (matches(text, ['buyer', 'buy-side', 'buy side', 'acquirer'])) return 'buy_side';
  return 'unknown';
}

function inferActorRole(side: RepresentationSide, text: string): DefinitiveRepresentationContext['actorRole'] {
  if (matches(text, ['owner rep', 'owner representative', 'represent the owner', 'representing the owner'])) return 'owner_representative';
  if (matches(text, ['buyer rep', 'buyer representative', 'buy-side advisor', 'buy side advisor'])) return 'buyer_representative';
  if (side === 'buy_side') return 'buyer';
  if (matches(text, ['broker', 'investment banker', 'm&a advisor', 'sell-side advisor', 'sell side advisor'])) return 'sell_side_advisor';
  if (matches(text, ['owner', 'founder', 'shareholder', 'seller'])) return 'owner';
  if (side === 'raise_side') return 'capital_raiser';
  if (side === 'pmi') return 'operator';
  if (side === 'sell_side') return 'owner_representative';
  return 'unknown';
}

function inferRepresentationPurpose(journey: Journey, text: string): DefinitiveRepresentationContext['purpose'] {
  if (matches(text, ['close', 'closing', 'funds flow', 'settlement'])) return 'prepare_for_closing';
  if (matches(text, ['diligence', 'due diligence', 'dd readiness', 'dd prep', 'for dd', 'loi/dd', 'data room', 'qoe', 'vendor diligence'])) return 'prepare_for_due_diligence';
  if (matches(text, ['incoming loi', 'buyer loi', 'loi', 'letter of intent', 'term sheet', 'offer'])) return journey === 'buy' ? 'evaluate_acquisition' : 'prepare_for_incoming_loi';
  if (journey === 'sell') return 'prepare_for_sale_process';
  if (journey === 'buy') return 'evaluate_acquisition';
  if (journey === 'raise') return 'raise_capital';
  if (journey === 'pmi') return 'operate_post_close';
  return 'unknown';
}

function inferJourney(text: string): Journey {
  if (matches(text, ['pmi', 'post close', 'post-close', 'integration', 'day 0', 'day one'])) return 'pmi';
  if (matches(text, ['raise', 'capital raise', 'fundraise', 'debt capital', 'equity capital'])) return 'raise';
  if (matches(text, ['sell', 'seller', 'exit', 'go to market', 'go-to-market', 'sale process', 'owner rep', 'owner representative', 'represent the owner', 'representing the owner', 'founder exit', 'incoming loi', 'buyer loi', 'vendor diligence', 'seller readiness'])) return 'sell';
  if (
    matches(text, ['owner', 'founder', 'shareholder', 'management team', 'target company']) &&
    matches(text, ['loi', 'letter of intent', 'due diligence', 'dd readiness', 'dd prep', 'for dd', 'loi/dd', 'data room', 'buyer', 'sale', 'exit', 'process'])
  ) return 'sell';
  if (matches(text, ['buy', 'buyer', 'acquire', 'acquisition', 'target', 'search thesis'])) return 'buy';
  return 'unknown';
}

/**
 * Build a set of key-name variants for a given canonical financial signal.
 *
 * Real-world agents send financial values under many naming conventions:
 *   - camelCase: ebitdaCents, ebitda
 *   - snake_case: ebitda_cents, ebitda
 *   - POV-prefixed: target_ebitda_cents, seller_ebitda, buyer_ebitda_cents
 *
 * The substrate must accept all of these. Otherwise an agent saying
 * "target EBITDA is $5M" via target_ebitda_cents would classify as league=unknown,
 * which breaks methodology routing — the load-bearing substrate promise.
 *
 * Returns key variants in priority order (camelCase canonical first, then snake_case,
 * then POV-prefixed). The first one that resolves to a value wins.
 */
/**
 * Returns true when the payload signals an actively-healthy deal — positive
 * EBITDA/SDE/revenue, no distress triggers, no liability-management signals.
 * Used to distinguish `distressPosture: 'healthy'` (we see positive signals
 * and no distress) from `distressPosture: 'healthy_or_unknown'` (no signals
 * either way). Methodology routing benefits from the distinction.
 */
function hasPositiveHealthSignals(
  payload: Record<string, any>,
  signals: DefinitiveStackSignals | null,
): boolean {
  if (!signals) {
    // No signals object but payload may still contain positive financials —
    // fall through to the financial-signals check below.
  } else {
    // Active distress signals would have already triggered G28/G29
    if (signals.cashRunwayDays != null && signals.cashRunwayDays < 90) return false;
    if (signals.fccr != null && signals.fccr < 1.0) return false;
    if (signals.securedDebtTradingPriceCents != null && signals.securedDebtTradingPriceCents < 60) return false;
    if (signals.maintenanceCovenantBreachWithinQuarters != null && signals.maintenanceCovenantBreachWithinQuarters >= 4) return false;
    if (signals.solvencyProngFailed) return false;
    if (signals.bankruptcyFilingPending) return false;
    if (signals.liabilityManagementExercise || signals.exchangeOffer || signals.covenantAmendment) return false;
  }
  // Positive EBITDA/SDE/revenue signal means we have economic info AND it's healthy
  const ebitdaVariants = moneyKeyVariants('ebitda');
  const sdeVariants = moneyKeyVariants('sde');
  const revVariants = moneyKeyVariants('revenue');
  const ebitda = firstMoneyCents(payload, ebitdaVariants.centsKeys, ebitdaVariants.dollarKeys);
  const sde = firstMoneyCents(payload, sdeVariants.centsKeys, sdeVariants.dollarKeys);
  const rev = firstMoneyCents(payload, revVariants.centsKeys, revVariants.dollarKeys);
  if (ebitda != null && ebitda > 0) return true;
  if (sde != null && sde > 0) return true;
  if (rev != null && rev > 0) return true;
  return false;
}

/**
 * Detect contradictions in a payload — fields that suggest different classifications.
 *
 * The substrate must NEVER silently pick a side when signals conflict; instead it
 * surfaces the conflict so the agent / user can resolve it explicitly. This is
 * the "no-rejection contract" applied to ambiguity: provide useful classification
 * for everything that's clear, and a `explicit_*_confirmation` missing-input
 * item for everything that's contradictory.
 */
function detectClassificationConflicts(args: {
  payload: Record<string, any>;
  explicitJourney: Journey | null;
  inferredJourney: Journey;
  explicitLeague: League | null;
  inferredLeague: League | 'unknown';
  overlays: DefinitiveStackOverlay[];
  signals: DefinitiveStackSignals | null;
}): ClassificationConflict[] {
  const conflicts: ClassificationConflict[] = [];
  const { payload, explicitJourney, explicitLeague, inferredLeague, overlays, signals } = args;

  // Journey conflict: journey=buy but seller-side role fields populated (or vice versa)
  const sellerSignals = ['seller_role', 'sellerRole', 'seller_representation', 'sellerRepresentation', 'broker_engagement_type'];
  const buyerSignals = ['acquirer_role', 'acquirerRole', 'buyer_strategy', 'buyerStrategy', 'sponsor_type', 'sponsorType'];
  const hasSellerSignal = sellerSignals.some(k => payload[k] !== undefined && payload[k] !== null && payload[k] !== '');
  const hasBuyerSignal = buyerSignals.some(k => payload[k] !== undefined && payload[k] !== null && payload[k] !== '');
  if (explicitJourney === 'buy' && hasSellerSignal) {
    conflicts.push({
      axis: 'journey',
      code: 'journey_buy_with_seller_role',
      reason: 'Payload sets journey=buy but also includes sell-side role fields. The substrate cannot determine which side the agent represents.',
      fields: ['journey', ...sellerSignals.filter(k => payload[k] !== undefined && payload[k] !== null && payload[k] !== '')],
    });
  }
  if (explicitJourney === 'sell' && hasBuyerSignal) {
    conflicts.push({
      axis: 'journey',
      code: 'journey_sell_with_buyer_role',
      reason: 'Payload sets journey=sell but also includes buy-side role fields.',
      fields: ['journey', ...buyerSignals.filter(k => payload[k] !== undefined && payload[k] !== null && payload[k] !== '')],
    });
  }

  // League conflict: explicit league disagrees with financial-inferred league
  if (explicitLeague && inferredLeague !== 'unknown' && explicitLeague !== inferredLeague) {
    conflicts.push({
      axis: 'league',
      code: 'league_explicit_vs_inferred_mismatch',
      reason: `Payload sets league=${explicitLeague} but financial signals (EBITDA/SDE/revenue/EV) imply ${inferredLeague}.`,
      fields: ['league', 'ebitda', 'sde', 'revenue', 'purchase_price'],
    });
  }

  // Distress conflict: healthy financials but distress signal flagged
  const hasPositiveFinancials = hasPositiveHealthSignals(payload, signals);
  const hasDistressTrigger = overlays.some(o => o.triggered && (o.gateId === 'G28' || o.gateId === 'G29'));
  const hasExplicitDistressFlag = signals?.bankruptcyFilingPending || signals?.solvencyProngFailed || signals?.rsaInMarket || signals?.forbearanceExecuted;
  if (hasPositiveFinancials && (hasDistressTrigger || hasExplicitDistressFlag)) {
    conflicts.push({
      axis: 'distressPosture',
      code: 'healthy_financials_with_distress_signal',
      reason: 'Payload shows healthy financial signals (positive EBITDA/SDE/revenue, no covenant breach, no liquidity stress) but also flags an active distress signal. Substrate cannot determine whether to apply healthy-deal or distressed-deal model stacks.',
      fields: ['signals.bankruptcyFilingPending', 'signals.solvencyProngFailed', 'signals.cashRunwayDays', 'signals.fccr', 'ebitda', 'sde', 'revenue'],
    });
  }

  // Tax-classification conflict: LLC pass-through but C-corp election fields
  const llcSignals = payload.taxClassification === 'llc_partnership' || payload.taxClassification === 's_corp' || payload.taxClassification === 'pass_through';
  const cCorpElections = ['338_h_10_election', '338(h)(10)', 'section_338_election', 'electionType'];
  const hasCorpElection = cCorpElections.some(k => {
    const v = payload[k] ?? payload.electionType;
    return v && typeof v === 'string' && /338|c[_ ]?corp/i.test(v);
  });
  if (llcSignals && hasCorpElection) {
    conflicts.push({
      axis: 'taxClassification',
      code: 'pass_through_with_c_corp_election',
      reason: 'Payload sets a pass-through tax classification (LLC/S-corp/partnership) but also references a C-corp-only election (e.g. §338(h)(10)). These cannot both be true; counsel/tax review required.',
      fields: ['taxClassification', 'electionType'],
    });
  }

  return conflicts;
}

function moneyKeyVariants(canonicalBase: string): { centsKeys: string[]; dollarKeys: string[] } {
  // canonicalBase is camelCase (e.g. 'ebitda', 'sde', 'revenue', 'purchasePrice')
  // Produce a list of camelCase + snake_case + prefixed variants for both `*Cents` and bare.
  const snakeBase = canonicalBase.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
  const prefixes = ['', 'target_', 'seller_', 'buyer_', 'company_'];
  const centsKeys: string[] = [`${canonicalBase}Cents`];
  const dollarKeys: string[] = [canonicalBase];
  for (const prefix of prefixes) {
    if (prefix) {
      // Snake-case prefixed
      centsKeys.push(`${prefix}${snakeBase}_cents`);
      dollarKeys.push(`${prefix}${snakeBase}`);
      // CamelCase prefixed (e.g. targetEbitdaCents)
      const camelPrefix = prefix.replace(/_$/, '');
      const upperBase = canonicalBase.charAt(0).toUpperCase() + canonicalBase.slice(1);
      centsKeys.push(`${camelPrefix}${upperBase}Cents`);
      dollarKeys.push(`${camelPrefix}${upperBase}`);
    } else {
      // Bare snake_case
      centsKeys.push(`${snakeBase}_cents`);
      if (snakeBase !== canonicalBase) dollarKeys.push(snakeBase);
    }
  }
  return { centsKeys, dollarKeys };
}

function inferLeague(payload: Record<string, any>): League | 'unknown' {
  // EBITDA (most common scale signal for buy/sell deals)
  const ebitdaVariants = moneyKeyVariants('ebitda');
  ebitdaVariants.centsKeys.push('adjustedEbitdaCents', 'normalizedEbitdaCents');
  ebitdaVariants.dollarKeys.push('adjustedEbitda', 'normalizedEbitda');
  const ebitdaCents = firstMoneyCents(payload, ebitdaVariants.centsKeys, ebitdaVariants.dollarKeys);

  // SDE (seller-discretionary earnings, lower-LMM)
  const sdeVariants = moneyKeyVariants('sde');
  sdeVariants.centsKeys.push('sellerDiscretionaryEarningsCents');
  sdeVariants.dollarKeys.push('sellerDiscretionaryEarnings');
  const sdeCents = firstMoneyCents(payload, sdeVariants.centsKeys, sdeVariants.dollarKeys);

  // Revenue
  const revVariants = moneyKeyVariants('revenue');
  revVariants.centsKeys.push('ttmRevenueCents', 'salesCents', 'arrCents');
  revVariants.dollarKeys.push('ttmRevenue', 'sales', 'arr');
  const revenueCents = firstMoneyCents(payload, revVariants.centsKeys, revVariants.dollarKeys);

  // Enterprise value / purchase price / asking price (fall-back signal)
  const purchasePriceVariants = moneyKeyVariants('purchasePrice');
  const enterpriseValueVariants = moneyKeyVariants('enterpriseValue');
  const evCentsKeys = [
    ...enterpriseValueVariants.centsKeys,
    ...purchasePriceVariants.centsKeys,
    'evCents', 'headlinePriceCents', 'transactionValueCents', 'dealValueCents',
    'askingPriceCents', 'valuationCents', 'raise_amount_cents', 'raiseAmountCents',
    // Debt facility signals — sized by commitment / facility amount
    'commitment_cents', 'commitmentCents', 'facility_amount_cents', 'facilityAmountCents',
    'tranche_size_cents', 'trancheSizeCents', 'principal_cents', 'principalCents',
  ];
  const evDollarKeys = [
    ...enterpriseValueVariants.dollarKeys,
    ...purchasePriceVariants.dollarKeys,
    'ev', 'headlinePrice', 'transactionValue', 'dealValue',
    'askingPrice', 'valuation', 'raise_amount', 'raiseAmount',
    'commitment', 'facility_amount', 'facilityAmount', 'tranche_size', 'trancheSize',
    'principal',
  ];
  const enterpriseValueCents = firstMoneyCents(payload, evCentsKeys, evDollarKeys);

  if (ebitdaCents == null && sdeCents == null && revenueCents == null && enterpriseValueCents == null) return 'unknown';
  if (ebitdaCents == null && sdeCents == null && revenueCents == null) {
    return classifyV19LeagueFromEnterpriseValueCents(enterpriseValueCents);
  }
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
  payload: Record<string, any> = {},
) {
  if (gates.includes('G28')) return matches(text, ['363', 'stalking horse']) ? 'distressed_363_sale' : 'distressed_restructuring';
  if (gates.includes('G29')) return 'capital_structure_or_liability_management';
  if (assetClass === 'real_estate') return 'real_estate_overlay';
  if (assetClass === 'digital_assets') return 'digital_asset_overlay';

  // Sell-side sub-journey distinguishes principal seller / owner-rep (broker) /
  // banker-led process. Without this, every sell-side deal classifies as
  // healthy_sell_side regardless of representation type, breaking sell-side
  // model-stack routing.
  if (journey === 'sell') {
    const sellerRole = textValue(payload.sellerRole) || textValue(payload.seller_role);
    const sellerRepresentation = textValue(payload.sellerRepresentation) || textValue(payload.seller_representation);
    const bankerProcess = payload.bankerProcess === true || payload.banker_process === true || textValue(payload.process) === 'banker_led';
    if (sellerRole === 'principal') return 'principal_seller';
    if (sellerRole === 'owner_rep' || sellerRepresentation === 'owner_rep') return 'owner_rep';
    if (bankerProcess || sellerRepresentation === 'banker') return 'banker_led';
    return 'healthy_sell_side';
  }

  // Buy-side sub-journey: distinguish strategic / IS / search / family-office /
  // ESOP buyers when the payload signals one.
  if (journey === 'buy') {
    const sponsorType = textValue(payload.sponsorType) || textValue(payload.sponsor_type) || textValue(payload.acquirerType) || textValue(payload.acquirer_type);
    if (sponsorType === 'strategic') return 'strategic_tuck_in';
    if (sponsorType === 'independent_sponsor' || sponsorType === 'is') return 'independent_sponsor';
    if (sponsorType === 'search_fund' || sponsorType === 'search') return 'search_fund';
    if (sponsorType === 'family_office' || sponsorType === 'fo') return 'family_office';
    if (sponsorType === 'esop' || payload.esopBuyer === true || payload.esop_buyer === true) return 'esop_buyer';
    return 'healthy_buy_side';
  }

  // Raise sub-journey: distinguish stage if signaled.
  if (journey === 'raise') {
    const stage = textValue(payload.stage) || textValue(payload.raiseStage);
    const instrument = textValue(payload.instrument);
    if (stage === 'seed' || stage === 'pre_seed') return 'early_stage_raise';
    if (stage === 'series_a' || stage === 'series_b' || stage === 'growth') return 'growth_raise';
    if (stage === 'debt' || instrument === 'abl' || instrument === 'mezz' || instrument === 'term_loan') return 'debt_raise';
    if (stage === 'secondary' || stage === 'continuation') return 'secondary_raise';
    return 'capital_raise';
  }

  // PMI sub-journey
  if (journey === 'pmi') {
    const pmiStage = textValue(payload.pmiStage) || textValue(payload.stage);
    if (pmiStage === 'day_0' || pmiStage === 'pmi0') return 'pmi_day_0';
    if (pmiStage === 'stabilization' || pmiStage === 'pmi1') return 'pmi_stabilization';
    if (pmiStage === 'assessment' || pmiStage === 'pmi2') return 'pmi_assessment';
    if (pmiStage === 'optimization' || pmiStage === 'pmi3') return 'pmi_optimization';
    return 'post_close_pmi';
  }

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

/**
 * Distress / capital-structure / real-estate signal aliases.
 *
 * The substrate's overlay engine expects camelCase field names (cashRunwayDays,
 * securedDebtTradingPriceCents, etc.), but external agents naturally send snake_case
 * and many use structured signal names (lme_signal, reit_compliance_breach). Without
 * alias coverage, perfectly clear distress signals get ignored and the substrate
 * misroutes a distressed deal to a healthy-buy-side model stack — a methodology-
 * routing failure with regulatory consequences.
 *
 * Each canonical key maps to a list of accepted aliases. First match wins; the
 * canonical key is preserved so the overlay engine sees what it expects.
 */
const SIGNAL_FIELD_ALIASES: Record<string, string[]> = {
  cashRunwayDays: ['cash_runway_days', 'runway_days', 'cashRunway', 'liquidity_runway_days'],
  fccr: ['fixed_charge_coverage_ratio', 'fixedChargeCoverageRatio', 'fcc_ratio'],
  securedDebtTradingPriceCents: [
    'secured_debt_trading_price_cents', 'securedDebtPriceCents', 'secured_debt_price_cents',
    'secured_debt_trading_price', 'debt_trading_price_cents', 'first_lien_trading_price_cents',
  ],
  maintenanceCovenantBreachWithinQuarters: [
    'maintenance_covenant_breach_within_quarters', 'covenant_breach_within_quarters',
    'covenant_breach_projected_within_quarters', 'maintenance_covenant_breach_quarters',
    'covenant_breach_quarters',
  ],
  realEstatePercentOfEv: [
    'real_estate_percent_of_ev', 'real_estate_pct_of_ev', 're_percent_of_ev', 're_pct_of_ev',
    'realEstatePctOfEv', 'realEstatePctEv',
  ],
  digitalAssetsPercentOfEv: [
    'digital_assets_percent_of_ev', 'digital_asset_percent_of_ev',
    'digital_assets_pct_of_ev', 'crypto_percent_of_ev', 'digitalAssetsPctOfEv',
  ],
  solvencyProngFailed: ['solvency_prong_failed', 'solvency_failure', 'three_prong_solvency_failed'],
  bankruptcyFilingPending: [
    'bankruptcy_filing_pending', 'bankruptcy_pending', 'chapter_11_pending', 'chapter_7_pending',
    'filing_pending',
  ],
  rsaInMarket: ['rsa_in_market', 'restructuring_support_agreement', 'rsa_announced'],
  forbearanceExecuted: ['forbearance_executed', 'forbearance_agreement_signed', 'forbearance_in_place'],
  capitalStructureAction: ['capital_structure_action', 'cap_structure_action', 'capital_action_announced'],
  liabilityManagementExercise: [
    'liability_management_exercise', 'lme', 'lme_signal', 'lme_announced',
    'liability_management_announced',
  ],
  recapitalization: ['recap_announced', 'recap_in_market', 'recapitalization_announced'],
  exchangeOffer: ['exchange_offer', 'exchange_offer_announced', 'distressed_debt_exchange'],
  covenantAmendment: [
    'covenant_amendment', 'covenant_amendment_announced', 'covenant_breach_signaled',
    'covenant_waiver',
  ],
};

/**
 * Some agents pass a single descriptive signal value that implies multiple substrate flags.
 * E.g. `lme_signal: "exchange_offer_announced"` should set both `liabilityManagementExercise: true`
 * AND `exchangeOffer: true`. Map structured values here.
 */
const STRUCTURED_SIGNAL_MAPPERS: Array<{
  fields: string[];
  match: (value: unknown) => Record<string, unknown> | null;
}> = [
  {
    fields: ['lme_signal', 'lmeSignal', 'liability_management_signal'],
    match: (value) => {
      if (typeof value !== 'string') return null;
      const v = value.toLowerCase();
      const out: Record<string, unknown> = { liabilityManagementExercise: true };
      if (v.includes('exchange')) out.exchangeOffer = true;
      if (v.includes('uptier') || v.includes('drop_down') || v.includes('dropdown') || v.includes('double_dip')) {
        out.capitalStructureAction = true;
      }
      return out;
    },
  },
  {
    fields: ['distress_signal', 'distressSignal'],
    match: (value) => {
      if (typeof value !== 'string') return null;
      const v = value.toLowerCase();
      if (v.includes('chapter_11') || v.includes('chapter_7') || v.includes('363')) {
        return { bankruptcyFilingPending: true };
      }
      if (v.includes('forbearance')) return { forbearanceExecuted: true };
      if (v.includes('rsa')) return { rsaInMarket: true };
      return null;
    },
  },
];

function normalizeSignals(payload: Record<string, any>): DefinitiveStackSignals | null {
  const source = payload.signals && typeof payload.signals === 'object'
    ? { ...(payload.signals as Record<string, unknown>) }
    : {};

  // 1. Pull top-level canonical keys onto the signals source (existing behavior).
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

  // 2. Apply alias normalization — pull snake_case / variant names onto canonical
  //    keys. Look at both the top-level payload AND the nested signals object.
  for (const [canonical, aliases] of Object.entries(SIGNAL_FIELD_ALIASES)) {
    if (source[canonical] != null && source[canonical] !== '') continue;
    for (const alias of aliases) {
      const fromTop = payload[alias];
      const fromNested = (payload.signals as Record<string, unknown> | undefined)?.[alias];
      const candidate = fromTop != null && fromTop !== '' ? fromTop : fromNested;
      if (candidate != null && candidate !== '') {
        source[canonical] = candidate;
        break;
      }
    }
  }

  // 3. Apply structured signal mappers (lme_signal → multiple flags).
  for (const mapper of STRUCTURED_SIGNAL_MAPPERS) {
    for (const field of mapper.fields) {
      const value = payload[field] ?? (payload.signals as Record<string, unknown> | undefined)?.[field];
      if (value == null) continue;
      const mapped = mapper.match(value);
      if (mapped) {
        for (const [k, v] of Object.entries(mapped)) {
          if (source[k] == null) source[k] = v;
        }
        break;
      }
    }
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

/**
 * Field aliases that external agents commonly use. Substrate normalizes these to
 * the canonical key so the classifier doesn't miss obvious signals.
 *
 * Pattern: realistic agent payloads (especially from buy-side / sell-side agents)
 * use POV-prefixed names like `target_industry`, `seller_jurisdiction`, etc.
 * The substrate's classifier only looks at canonical names (`industry`, `jurisdiction`),
 * so without alias normalization it would silently classify common payloads as `unknown`.
 *
 * The original keys are preserved on the payload too — only the canonical field
 * is added if missing. Auditors can still see exactly what the agent sent.
 */
const PAYLOAD_FIELD_ALIASES: Record<string, string[]> = {
  industry: ['target_industry', 'buyer_industry', 'seller_industry', 'targetIndustry', 'sectorIndustry'],
  jurisdiction: ['target_jurisdiction', 'buyer_jurisdiction', 'seller_jurisdiction', 'targetJurisdiction', 'state'],
  journey: ['transaction_type', 'transactionType', 'deal_type_journey'],
  naics: ['target_naics', 'targetNaics', 'naics_code'],
};

function normalizePayload(value: unknown): Record<string, any> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const payload = { ...(value as Record<string, any>) };
  delete payload.envelope;
  delete payload.idempotencyKey;
  // Apply alias normalization — add canonical key from first matching alias if canonical is absent
  for (const [canonical, aliases] of Object.entries(PAYLOAD_FIELD_ALIASES)) {
    if (payload[canonical] !== undefined && payload[canonical] !== null && payload[canonical] !== '') continue;
    for (const alias of aliases) {
      if (payload[alias] !== undefined && payload[alias] !== null && payload[alias] !== '') {
        payload[canonical] = payload[alias];
        break;
      }
    }
  }
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

function firstMoneyCents(payload: Record<string, any>, centsKeys: string[], dollarKeys: string[] = []): number | null {
  for (const key of centsKeys) {
    const cents = coerceMoneyToCents(payload[key], 'cents');
    if (cents != null) return cents;
  }
  for (const key of dollarKeys) {
    const cents = coerceMoneyToCents(payload[key], 'dollars');
    if (cents != null) return cents;
  }
  return null;
}

function coerceMoneyToCents(value: unknown, unit: 'cents' | 'dollars'): number | null {
  if (value == null || value === '') return null;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    return unit === 'cents' ? Math.round(value) : Math.round(value * 100);
  }
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase().replace(/[$,\s]/g, '');
  if (!normalized) return null;
  const match = normalized.match(/^-?\d+(?:\.\d+)?/);
  if (!match) return null;
  let dollars = Number(match[0]);
  if (!Number.isFinite(dollars)) return null;
  if (normalized.includes('bn') || normalized.endsWith('b')) dollars *= 1_000_000_000;
  else if (normalized.includes('mm') || normalized.endsWith('m')) dollars *= 1_000_000;
  else if (normalized.endsWith('k')) dollars *= 1_000;
  return unit === 'cents' && !/[a-z$]/.test(normalized)
    ? Math.round(dollars)
    : Math.round(dollars * 100);
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
