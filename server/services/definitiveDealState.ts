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
    case 'compose_data_room_index':
      return composeDefinitiveDataRoomIndex(input);
    case 'disclose_subset':
      return discloseDefinitiveSubset(input);
    case 'compose_document_draft':
      return composeDefinitiveDocumentDraft(input);
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
          'compose_data_room_index',
          'disclose_subset',
          'compose_document_draft',
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
    'compose_data_room_index',
    'disclose_subset',
    'compose_document_draft',
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
