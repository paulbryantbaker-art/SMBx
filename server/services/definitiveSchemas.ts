import {
  DEFINITIVE_METHODOLOGY_URI,
  DEFINITIVE_METHODOLOGY_VERSION,
  DEFINITIVE_SPEC_URI,
  DEFINITIVE_SPEC_VERSION,
} from '../constants/definitive.js';

export const DEFINITIVE_SCHEMA_REGISTRY_VERSION = 'DEFINITIVE.schemas.v0.1';
export const DEFINITIVE_SCHEMA_REGISTRY_URI = 'definitive://v1/schemas';

type JsonSchema = Record<string, any>;

const SCHEMA_BASE = 'definitive://schemas/';

function schemaId(name: string) {
  return `${SCHEMA_BASE}${name}`;
}

const MONEY_CENTS_SCHEMA: JsonSchema = {
  type: 'integer',
  description: 'Money value in cents. Never floating point.',
};

const DealPayload: JsonSchema = {
  $id: schemaId('DealPayload'),
  title: 'DealPayload',
  type: 'object',
  additionalProperties: true,
  description:
    'Partial or complete deal facts supplied by a human or external agent. Incomplete payloads are accepted and converted into DealState plus MissingInputContract.',
  properties: {
    journey: { type: 'string', enum: ['sell', 'buy', 'raise', 'pmi', 'unknown'] },
    intent: { type: 'string' },
    dealName: { type: 'string' },
    targetName: { type: 'string' },
    companyName: { type: 'string' },
    thesis: { type: 'string' },
    industry: { type: 'string' },
    jurisdiction: { type: 'string', description: 'Jurisdiction such as US-DE, US-TX, UK, EU, or unknown.' },
    league: { type: 'string', enum: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10'] },
    revenueCents: MONEY_CENTS_SCHEMA,
    ttmRevenueCents: MONEY_CENTS_SCHEMA,
    ebitdaCents: MONEY_CENTS_SCHEMA,
    adjustedEbitdaCents: MONEY_CENTS_SCHEMA,
    sdeCents: MONEY_CENTS_SCHEMA,
    enterpriseValueCents: MONEY_CENTS_SCHEMA,
    purchasePriceCents: MONEY_CENTS_SCHEMA,
    dealType: { type: 'string' },
    structure: { type: 'string' },
    dealStructure: { type: 'string' },
    taxClassification: { type: 'string' },
    stage: { type: 'string' },
    keyTerms: { type: 'object', additionalProperties: true },
    terms: { type: 'object', additionalProperties: true },
    documents: { type: 'array', items: { $ref: schemaId('SourceIndexItem') } },
    files: { type: 'array', items: { $ref: schemaId('SourceIndexItem') } },
    sourceIndex: { type: 'array', items: { $ref: schemaId('SourceIndexItem') } },
    dataRoomIndex: { type: 'array', items: { $ref: schemaId('SourceIndexItem') } },
    signals: { $ref: schemaId('OverlaySignals') },
  },
};

const OverlaySignals: JsonSchema = {
  $id: schemaId('OverlaySignals'),
  title: 'OverlaySignals',
  type: 'object',
  additionalProperties: true,
  description: 'Deterministic G28/G29/G30 routing signals for distress, capital-structure, and asset-class overlays.',
  properties: {
    cashRunwayDays: { type: 'number' },
    fccr: { type: 'number' },
    securedDebtTradingPriceCents: { type: 'number' },
    maintenanceCovenantBreachWithinQuarters: { type: 'number' },
    realEstatePercentOfEv: { type: 'number' },
    digitalAssetsPercentOfEv: { type: 'number' },
    solvencyProngFailed: { type: 'boolean' },
    bankruptcyFilingPending: { type: 'boolean' },
    rsaInMarket: { type: 'boolean' },
    forbearanceExecuted: { type: 'boolean' },
    capitalStructureAction: { type: 'boolean' },
    liabilityManagementExercise: { type: 'boolean' },
    recapitalization: { type: 'boolean' },
    exchangeOffer: { type: 'boolean' },
    covenantAmendment: { type: 'boolean' },
  },
};

const ClassificationKey: JsonSchema = {
  $id: schemaId('ClassificationKey'),
  title: 'ClassificationKey',
  type: 'object',
  additionalProperties: false,
  required: ['journey', 'subJourney', 'league', 'jurisdiction', 'distressPosture', 'assetClass', 'industry', 'taxClassification', 'triggeredOverlayGates'],
  properties: {
    journey: { type: 'string', enum: ['sell', 'buy', 'raise', 'pmi', 'unknown'] },
    subJourney: { type: 'string' },
    league: { type: 'string', enum: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10', 'unknown'] },
    jurisdiction: { type: 'string' },
    distressPosture: { type: 'string', enum: ['healthy_or_unknown', 'stressed_or_liability_management', 'distressed'] },
    assetClass: { type: 'string', enum: ['operating_business_or_unknown', 'real_estate', 'digital_assets', 'infrastructure'] },
    industry: { type: 'string' },
    taxClassification: { type: 'string' },
    triggeredOverlayGates: { type: 'array', items: { type: 'string', enum: ['G28', 'G29', 'G30'] } },
    confidence: { type: 'object', additionalProperties: { type: 'string', enum: ['explicit', 'inferred', 'missing'] } },
  },
};

const SourceIndexItem: JsonSchema = {
  $id: schemaId('SourceIndexItem'),
  title: 'SourceIndexItem',
  type: 'object',
  additionalProperties: true,
  required: ['id', 'type'],
  properties: {
    id: { type: 'string' },
    type: { type: 'string' },
    name: { type: 'string' },
    hash: { type: ['string', 'null'] },
    sourceUri: { type: 'string' },
    citationReady: { type: 'boolean' },
  },
};

const MissingInputItem: JsonSchema = {
  $id: schemaId('MissingInputItem'),
  title: 'MissingInputItem',
  type: 'object',
  additionalProperties: false,
  required: ['field', 'label', 'reason', 'unlocks', 'priority', 'surface'],
  properties: {
    field: { type: 'string' },
    label: { type: 'string' },
    reason: { type: 'string' },
    unlocks: { type: 'array', items: { type: 'string' } },
    priority: { type: 'string', enum: ['P0', 'P1', 'P2'] },
    surface: { type: 'string', enum: ['chat', 'files', 'pipeline', 'studio', 'models'] },
  },
};

const MissingInputContract: JsonSchema = {
  $id: schemaId('MissingInputContract'),
  title: 'MissingInputContract',
  type: 'object',
  additionalProperties: false,
  required: ['status', 'items', 'minimalNextInputSet', 'yuliaPrompt', 'lineNote'],
  properties: {
    status: { type: 'string', enum: ['missing_inputs', 'sufficient_for_next_step'] },
    items: { type: 'array', items: { $ref: schemaId('MissingInputItem') } },
    minimalNextInputSet: { type: 'array', items: { type: 'string' } },
    yuliaPrompt: { type: 'string' },
    lineNote: { type: 'string' },
  },
};

const DealReadinessLevel: JsonSchema = {
  $id: schemaId('DealReadinessLevel'),
  title: 'DealReadinessLevel',
  type: 'object',
  additionalProperties: false,
  required: ['id', 'label', 'minimumScore', 'canProceedWithPartialState', 'doneWhen'],
  description:
    'Definition-of-done level for recursive Deal OS work. It measures source/methodology readiness, not deal quality or professional judgment.',
  properties: {
    id: {
      type: 'string',
      enum: ['DRL0_UNCLASSIFIED', 'DRL1_CLASSIFIED', 'DRL2_INDICATION_READY', 'DRL3_LOI_ARCHITECTURE_READY', 'DRL4_DILIGENCE_READY'],
    },
    label: { type: 'string' },
    description: { type: 'string' },
    minimumScore: { type: 'number', minimum: 0, maximum: 100 },
    canProceedWithPartialState: { type: 'boolean' },
    doneWhen: { type: 'array', items: { type: 'string' } },
    nextRecommendedTools: { type: 'array', items: { type: 'string' } },
  },
};

const CompletenessSpec: JsonSchema = {
  $id: schemaId('CompletenessSpec'),
  title: 'CompletenessSpec',
  type: 'object',
  additionalProperties: true,
  required: ['version', 'levels', 'checks', 'lineInvariant'],
  description:
    'Portable spec for check_completeness. Agents use it to understand what is missing, what can proceed, and why the app returns next_suggested_calls instead of rejecting incomplete payloads.',
  properties: {
    version: { type: 'string', const: 'DEFINITIVE.completeness-spec.v0.1' },
    definitionOfDoneVersion: { type: 'string', const: 'DEFINITIVE.definition-of-done.v0.1' },
    levels: { type: 'array', items: { $ref: schemaId('DealReadinessLevel') } },
    checks: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: true,
        required: ['id', 'label', 'requiredForLevel'],
        properties: {
          id: { type: 'string' },
          label: { type: 'string' },
          requiredForLevel: { type: 'string' },
          sourceCategories: { type: 'array', items: { type: 'string' } },
          modelSlots: { type: 'array', items: { type: 'string' } },
          surfaces: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    noRejectionContract: { type: 'string' },
    lineInvariant: { type: 'string' },
  },
};

const CompletenessReport: JsonSchema = {
  $id: schemaId('CompletenessReport'),
  title: 'CompletenessReport',
  type: 'object',
  additionalProperties: false,
  required: ['definitionOfDoneVersion', 'level', 'score', 'satisfied', 'missing', 'blockers', 'nextGate', 'canProceedWithPartialState'],
  properties: {
    definitionOfDoneVersion: { type: 'string', const: 'DEFINITIVE.definition-of-done.v0.1' },
    level: {
      type: 'string',
      enum: ['DRL0_UNCLASSIFIED', 'DRL1_CLASSIFIED', 'DRL2_INDICATION_READY', 'DRL3_LOI_ARCHITECTURE_READY', 'DRL4_DILIGENCE_READY'],
    },
    score: { type: 'number', minimum: 0, maximum: 100 },
    satisfied: { type: 'array', items: { type: 'string' } },
    missing: { type: 'array', items: { $ref: schemaId('MissingInputItem') } },
    blockers: { type: 'array', items: { type: 'string' } },
    nextGate: { type: 'string' },
    canProceedWithPartialState: { type: 'boolean' },
    levelDefinition: { $ref: schemaId('DealReadinessLevel') },
    theLineInvariant: { type: 'string' },
  },
};

const MCPCallHint: JsonSchema = {
  $id: schemaId('MCPCallHint'),
  title: 'MCPCallHint',
  type: 'object',
  additionalProperties: false,
  required: ['toolName', 'priority', 'reason', 'inputHint'],
  properties: {
    toolName: { type: 'string' },
    priority: { type: 'string', enum: ['P0', 'P1', 'P2'] },
    reason: { type: 'string' },
    inputHint: { type: 'object', additionalProperties: true },
  },
};

const DealState: JsonSchema = {
  $id: schemaId('DealState'),
  title: 'DealState',
  type: 'object',
  additionalProperties: false,
  required: ['protocol', 'stateId', 'cid', 'stateHash', 'revision', 'payload', 'classificationKey', 'missingInputContract', 'completenessReport'],
  properties: {
    protocol: { type: 'string', const: 'DEFINITIVE.deal-state.v0.1' },
    stateId: { type: 'string' },
    cid: { type: 'string', pattern: '^definitive:deal-state:sha256:' },
    stateHash: { type: 'string' },
    revision: { type: 'integer', minimum: 1 },
    parentCids: { type: 'array', items: { type: 'string' } },
    idempotencyKey: { type: ['string', 'null'] },
    payload: { $ref: schemaId('DealPayload') },
    classificationKey: { $ref: schemaId('ClassificationKey') },
    overlays: { type: 'array', items: { type: 'object', additionalProperties: true } },
    signals: { anyOf: [{ $ref: schemaId('OverlaySignals') }, { type: 'null' }] },
    missingInputContract: { $ref: schemaId('MissingInputContract') },
    completenessReport: { $ref: schemaId('CompletenessReport') },
    sourceIndex: { type: 'array', items: { $ref: schemaId('SourceIndexItem') } },
    methodologyVersion: { type: 'string' },
    methodologyUri: { type: 'string' },
    specVersion: { type: 'string' },
    specUri: { type: 'string' },
  },
};

const DealPlan: JsonSchema = {
  $id: schemaId('DealPlan'),
  title: 'DealPlan',
  type: 'object',
  additionalProperties: true,
  required: ['planId', 'status', 'currentStage', 'lifecycle', 'routingKey', 'stages', 'workSurfaces'],
  properties: {
    planId: { type: 'string' },
    status: { type: 'string', enum: ['partial_but_actionable', 'ready_for_next_step'] },
    currentStage: { type: 'string' },
    lifecycle: { type: 'string' },
    routingKey: { $ref: schemaId('ClassificationKey') },
    stages: { type: 'array', items: { type: 'object', additionalProperties: true } },
    overlayGates: { type: 'array', items: { type: 'string', enum: ['G28', 'G29', 'G30'] } },
    workSurfaces: { type: 'array', items: { type: 'string' } },
    nextActions: { type: 'array', items: { type: 'object', additionalProperties: true } },
    lineInvariant: { type: 'string' },
  },
};

const GateState: JsonSchema = {
  $id: schemaId('GateState'),
  title: 'GateState',
  type: 'object',
  additionalProperties: true,
  required: ['gateId', 'status', 'methodologyVersion', 'sourceReadiness'],
  description: 'Pipeline gate state that an agent can take back after each iterative deal loop.',
  properties: {
    gateId: { type: 'string' },
    gateName: { type: 'string' },
    status: { type: 'string', enum: ['not_started', 'in_progress', 'blocked', 'ready', 'complete', 'deferred'] },
    stage: { type: 'string' },
    methodologyVersion: { type: 'string' },
    sourceReadiness: { type: 'string', enum: ['missing', 'partial', 'citation_ready'] },
    blockers: { type: 'array', items: { type: 'string' } },
    next_suggested_calls: { type: 'array', items: { $ref: schemaId('MCPCallHint') } },
  },
};

const PipelineStageDelta: JsonSchema = {
  $id: schemaId('PipelineStageDelta'),
  title: 'PipelineStageDelta',
  type: 'object',
  additionalProperties: true,
  required: ['previousStage', 'nextStage', 'changedAt', 'reason'],
  properties: {
    previousStage: { type: 'string' },
    nextStage: { type: 'string' },
    changedAt: { type: 'string' },
    reason: { type: 'string' },
    gateStates: { type: 'array', items: { $ref: schemaId('GateState') } },
    dealStateDiff: { $ref: schemaId('DealStateDiff') },
  },
};

const DealStateDiff: JsonSchema = {
  $id: schemaId('DealStateDiff'),
  title: 'DealStateDiff',
  type: 'object',
  additionalProperties: false,
  required: ['previousCid', 'nextCid', 'changedPaths', 'completenessScoreDelta', 'resolvedMissingInputs', 'newMissingInputs'],
  properties: {
    previousCid: { type: 'string' },
    nextCid: { type: 'string' },
    previousHash: { type: 'string' },
    nextHash: { type: 'string' },
    changedPaths: { type: 'array', items: { type: 'string' } },
    completenessScoreDelta: { type: 'number' },
    resolvedMissingInputs: { type: 'array', items: { type: 'string' } },
    newMissingInputs: { type: 'array', items: { type: 'string' } },
    addedOverlayGates: { type: 'array', items: { type: 'string', enum: ['G28', 'G29', 'G30'] } },
    removedOverlayGates: { type: 'array', items: { type: 'string', enum: ['G28', 'G29', 'G30'] } },
    previousLevel: { type: 'string' },
    nextLevel: { type: 'string' },
  },
};

const SourceIndex: JsonSchema = {
  $id: schemaId('SourceIndex'),
  title: 'SourceIndex',
  type: 'object',
  additionalProperties: true,
  required: ['schema', 'dealStateCid', 'sources', 'citationReadyCount'],
  description: 'Portable source inventory for Files/Data Room work. It preserves source hashes and citation readiness without exposing excluded documents.',
  properties: {
    schema: { type: 'string', const: 'SourceIndex.v0.1' },
    dealStateCid: { type: 'string' },
    dealStateHash: { type: 'string' },
    sources: { type: 'array', items: { $ref: schemaId('SourceIndexItem') } },
    citationReadyCount: { type: 'integer' },
    totalSources: { type: 'integer' },
    sourceGaps: { $ref: schemaId('SourceGapList') },
  },
};

const SourceGapList: JsonSchema = {
  $id: schemaId('SourceGapList'),
  title: 'SourceGapList',
  type: 'object',
  additionalProperties: true,
  required: ['schema', 'gaps', 'next_suggested_calls'],
  description: 'Normalized list of source categories or specific documents required before a packet becomes citation-ready.',
  properties: {
    schema: { type: 'string', const: 'SourceGapList.v0.1' },
    dealStateCid: { type: 'string' },
    dealStateHash: { type: 'string' },
    gaps: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: true,
        required: ['category', 'reason', 'priority'],
        properties: {
          category: { type: 'string' },
          reason: { type: 'string' },
          priority: { type: 'string', enum: ['P0', 'P1', 'P2'] },
          unlocks: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    next_suggested_calls: { type: 'array', items: { $ref: schemaId('MCPCallHint') } },
  },
};

const SelectiveDisclosureProof: JsonSchema = {
  $id: schemaId('SelectiveDisclosureProof'),
  title: 'SelectiveDisclosureProof',
  type: 'object',
  additionalProperties: false,
  required: ['proofType', 'proofHash', 'includesOnlySelectedSources', 'sourceCount', 'excludedSourceCount'],
  description: 'Hash-backed proof that a disclosure packet included only selected sources and excluded the rest.',
  properties: {
    proofType: { type: 'string' },
    proofHash: { type: 'string' },
    includesOnlySelectedSources: { type: 'boolean' },
    sourceCount: { type: 'integer' },
    excludedSourceCount: { type: 'integer' },
    manifestCid: { type: 'string' },
  },
};

const OutputHash: JsonSchema = {
  $id: schemaId('OutputHash'),
  title: 'OutputHash',
  type: 'object',
  additionalProperties: false,
  required: ['algorithm', 'hash'],
  properties: {
    algorithm: { type: 'string', enum: ['sha256'] },
    hash: { type: 'string' },
    canonicalization: { type: 'string' },
  },
};

const AssumptionLog: JsonSchema = {
  $id: schemaId('AssumptionLog'),
  title: 'AssumptionLog',
  type: 'object',
  additionalProperties: true,
  required: ['schema', 'assumptions'],
  description: 'Model assumption log for deterministic reruns and human/agent take-back.',
  properties: {
    schema: { type: 'string', const: 'AssumptionLog.v0.1' },
    assumptions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: true,
        required: ['name', 'value', 'sourceStatus'],
        properties: {
          name: { type: 'string' },
          value: {},
          unit: { type: 'string' },
          sourceStatus: { type: 'string', enum: ['explicit_source', 'user_supplied', 'default', 'missing'] },
          sourceRef: { type: 'string' },
        },
      },
    },
  },
};

const ModelOutput: JsonSchema = {
  $id: schemaId('ModelOutput'),
  title: 'ModelOutput',
  type: 'object',
  additionalProperties: true,
  required: ['schema', 'modelId', 'methodologyVersion', 'inputs', 'outputs', 'outputHash', 'lineBoundary'],
  description: 'Deterministic M101-M223 model result. The output is computation-only and never a professional opinion.',
  properties: {
    schema: { type: 'string', const: 'ModelOutput.v0.1' },
    modelId: { type: 'string', pattern: '^M[0-9]{3}$' },
    modelName: { type: 'string' },
    methodologyVersion: { type: 'string' },
    inputHash: { $ref: schemaId('OutputHash') },
    outputHash: { $ref: schemaId('OutputHash') },
    inputs: { type: 'object', additionalProperties: true },
    outputs: { type: 'object', additionalProperties: true },
    assumptions: { $ref: schemaId('AssumptionLog') },
    citations: { type: 'array', items: { type: 'object', additionalProperties: true } },
    lineBoundary: { type: 'string' },
    next_suggested_calls: { type: 'array', items: { $ref: schemaId('MCPCallHint') } },
  },
};

const StructurePermutation: JsonSchema = {
  $id: schemaId('StructurePermutation'),
  title: 'StructurePermutation',
  type: 'object',
  additionalProperties: true,
  required: ['permutationId', 'structure', 'modelOutputs', 'lineBoundary'],
  properties: {
    permutationId: { type: 'string' },
    structure: { type: 'string' },
    modelOutputs: { type: 'array', items: { $ref: schemaId('ModelOutput') } },
    constraints: { type: 'array', items: { type: 'string' } },
    handoffs: { type: 'array', items: { type: 'object', additionalProperties: true } },
    lineBoundary: { type: 'string' },
  },
};

const ParetoFrontier: JsonSchema = {
  $id: schemaId('ParetoFrontier'),
  title: 'ParetoFrontier',
  type: 'object',
  additionalProperties: true,
  required: ['schema', 'objectivePreference', 'permutations'],
  properties: {
    schema: { type: 'string', const: 'ParetoFrontier.v0.1' },
    objectivePreference: { type: 'string' },
    permutations: { type: 'array', items: { $ref: schemaId('StructurePermutation') } },
    dominatedPermutationIds: { type: 'array', items: { type: 'string' } },
  },
};

const BestVehicleBlock: JsonSchema = {
  $id: schemaId('BestVehicleBlock'),
  title: 'BestVehicleBlock',
  type: 'object',
  additionalProperties: true,
  required: ['schema', 'selectedPermutationId', 'selectionBasis', 'lineBoundary'],
  description: 'Computation-backed structure comparison block. The user or professional decides whether to rely on it.',
  properties: {
    schema: { type: 'string', const: 'BestVehicleBlock.v0.1' },
    selectedPermutationId: { type: 'string' },
    selectionBasis: { type: 'string' },
    paretoFrontier: { $ref: schemaId('ParetoFrontier') },
    unresolvedHandoffs: { type: 'array', items: { type: 'object', additionalProperties: true } },
    lineBoundary: { type: 'string' },
  },
};

const DealPackage: JsonSchema = {
  $id: schemaId('DealPackage'),
  title: 'DealPackage',
  type: 'object',
  additionalProperties: true,
  required: ['packageId', 'packageCid', 'schema', 'dealStateCid', 'dealStateHash', 'classificationKey', 'completenessReport', 'dealPlan', 'next_suggested_calls'],
  properties: {
    packageId: { type: 'string' },
    packageCid: { type: 'string', pattern: '^definitive:deal-package:sha256:' },
    schema: { type: 'string', const: 'DealPackage.v0.1' },
    dealStateCid: { type: 'string' },
    dealStateHash: { type: 'string' },
    readinessLevel: { type: 'string' },
    classificationKey: { $ref: schemaId('ClassificationKey') },
    completenessReport: { $ref: schemaId('CompletenessReport') },
    missingInputContract: { $ref: schemaId('MissingInputContract') },
    dealPlan: { $ref: schemaId('DealPlan') },
    sourceIndex: { type: 'array', items: { $ref: schemaId('SourceIndexItem') } },
    next_suggested_calls: { type: 'array', items: { $ref: schemaId('MCPCallHint') } },
    takeBackArtifacts: { type: 'array', items: { type: 'string' } },
    excludedOrDeferred: { type: 'array', items: { type: 'object', additionalProperties: true } },
    lineInvariant: { type: 'string' },
  },
};

const LifecycleTrace: JsonSchema = {
  $id: schemaId('LifecycleTrace'),
  title: 'LifecycleTrace',
  type: 'object',
  additionalProperties: true,
  required: ['traceId', 'schema', 'dealStateCid', 'dealStateHash', 'currentStage', 'stageTrace', 'events', 'loopContract', 'next_suggested_calls'],
  properties: {
    traceId: { type: 'string' },
    schema: { type: 'string', const: 'LifecycleTrace.v0.1' },
    dealStateCid: { type: 'string' },
    dealStateHash: { type: 'string' },
    currentStage: { type: 'string' },
    readinessLevel: { type: 'string' },
    lifecycle: { type: 'string' },
    stageTrace: { type: 'array', items: { type: 'object', additionalProperties: true } },
    events: { type: 'array', items: { type: 'object', additionalProperties: true } },
    artifactRefs: { type: 'array', items: { type: 'object', additionalProperties: true } },
    blockers: { type: 'array', items: { type: 'string' } },
    loopContract: { type: 'object', additionalProperties: true },
    next_suggested_calls: { type: 'array', items: { $ref: schemaId('MCPCallHint') } },
    takeBackArtifacts: { type: 'array', items: { type: 'string' } },
    lineInvariant: { type: 'string' },
  },
};

const IOIPacket: JsonSchema = {
  $id: schemaId('IOIPacket'),
  title: 'IOIPacket',
  type: 'object',
  additionalProperties: true,
  required: ['packetId', 'schema', 'dealStateCid', 'dealStateHash', 'knownFacts', 'preliminaryEconomics', 'indicationBoundary', 'next_suggested_calls'],
  properties: {
    packetId: { type: 'string' },
    schema: { type: 'string', const: 'IOIPacket.v0.1' },
    dealStateCid: { type: 'string' },
    dealStateHash: { type: 'string' },
    objective: { type: 'string' },
    audience: { type: 'string' },
    stage: { type: 'string' },
    readinessLevel: { type: 'string' },
    knownFacts: { type: 'array', items: { type: 'object', additionalProperties: true } },
    preliminaryEconomics: { type: 'array', items: { type: 'object', additionalProperties: true } },
    sourceRefs: { type: 'array', items: { type: 'object', additionalProperties: true } },
    sourceGaps: { type: 'array', items: { type: 'object', additionalProperties: true } },
    missingInputs: { type: 'array', items: { type: 'object', additionalProperties: true } },
    modelDependencies: { type: 'object', additionalProperties: true },
    indicationBoundary: { type: 'object', additionalProperties: true },
    next_suggested_calls: { type: 'array', items: { $ref: schemaId('MCPCallHint') } },
    takeBackArtifacts: { type: 'array', items: { type: 'string' } },
    lineInvariant: { type: 'string' },
  },
};

const LOIPacket: JsonSchema = {
  $id: schemaId('LOIPacket'),
  title: 'LOIPacket',
  type: 'object',
  additionalProperties: true,
  required: ['packetId', 'schema', 'dealStateCid', 'dealStateHash', 'dealArchitecture', 'economicTerms', 'closingConditions', 'loiBoundary', 'next_suggested_calls'],
  properties: {
    packetId: { type: 'string' },
    schema: { type: 'string', const: 'LOIPacket.v0.1' },
    dealStateCid: { type: 'string' },
    dealStateHash: { type: 'string' },
    objective: { type: 'string' },
    audience: { type: 'string' },
    stage: { type: 'string' },
    readinessLevel: { type: 'string' },
    dealArchitecture: { type: 'array', items: { type: 'object', additionalProperties: true } },
    economicTerms: { type: 'array', items: { type: 'object', additionalProperties: true } },
    closingConditions: { type: 'array', items: { type: 'object', additionalProperties: true } },
    sourceRefs: { type: 'array', items: { type: 'object', additionalProperties: true } },
    sourceGaps: { type: 'array', items: { type: 'object', additionalProperties: true } },
    missingInputs: { type: 'array', items: { type: 'object', additionalProperties: true } },
    handoffs: { type: 'array', items: { type: 'object', additionalProperties: true } },
    modelDependencies: { type: 'object', additionalProperties: true },
    loiBoundary: { type: 'object', additionalProperties: true },
    next_suggested_calls: { type: 'array', items: { $ref: schemaId('MCPCallHint') } },
    takeBackArtifacts: { type: 'array', items: { type: 'string' } },
    lineInvariant: { type: 'string' },
  },
};

const DataRoomIndex: JsonSchema = {
  $id: schemaId('DataRoomIndex'),
  title: 'DataRoomIndex',
  type: 'object',
  additionalProperties: true,
  required: ['indexId', 'schema', 'dealStateCid', 'dealStateHash', 'categories', 'sourceGaps', 'next_suggested_calls'],
  properties: {
    indexId: { type: 'string' },
    schema: { type: 'string', const: 'DataRoomIndex.v0.1' },
    dealStateCid: { type: 'string' },
    dealStateHash: { type: 'string' },
    classificationKey: { $ref: schemaId('ClassificationKey') },
    totalSources: { type: 'integer' },
    citationReadyCount: { type: 'integer' },
    categories: {
      type: 'array',
      items: { type: 'object', additionalProperties: true },
    },
    sourceGaps: {
      type: 'array',
      items: { type: 'object', additionalProperties: true },
    },
    next_suggested_calls: { type: 'array', items: { $ref: schemaId('MCPCallHint') } },
    takeBackArtifacts: { type: 'array', items: { type: 'string' } },
    lineInvariant: { type: 'string' },
  },
};

const DiligenceRequest: JsonSchema = {
  $id: schemaId('DiligenceRequest'),
  title: 'DiligenceRequest',
  type: 'object',
  additionalProperties: true,
  required: ['requestId', 'schema', 'dealStateCid', 'dealStateHash', 'requestGroups', 'requestBoundary', 'next_suggested_calls'],
  properties: {
    requestId: { type: 'string' },
    schema: { type: 'string', const: 'DiligenceRequest.v0.1' },
    dealStateCid: { type: 'string' },
    dealStateHash: { type: 'string' },
    objective: { type: 'string' },
    audience: { type: 'string' },
    stage: { type: 'string' },
    readinessLevel: { type: 'string' },
    requestedCategories: { type: 'array', items: { type: 'string' } },
    requestGroups: { type: 'array', items: { type: 'object', additionalProperties: true } },
    sourceGaps: { type: 'array', items: { type: 'object', additionalProperties: true } },
    missingInputs: { type: 'array', items: { type: 'object', additionalProperties: true } },
    modelDependencies: { type: 'object', additionalProperties: true },
    handoffs: { type: 'array', items: { type: 'object', additionalProperties: true } },
    requestBoundary: { type: 'object', additionalProperties: true },
    next_suggested_calls: { type: 'array', items: { $ref: schemaId('MCPCallHint') } },
    takeBackArtifacts: { type: 'array', items: { type: 'string' } },
    lineInvariant: { type: 'string' },
  },
};

const DisclosureSubset: JsonSchema = {
  $id: schemaId('DisclosureSubset'),
  title: 'DisclosureSubset',
  type: 'object',
  additionalProperties: true,
  required: ['subsetId', 'schema', 'dealStateCid', 'dealStateHash', 'sources', 'selectiveDisclosureProof', 'disclosureBoundary', 'next_suggested_calls'],
  properties: {
    subsetId: { type: 'string' },
    schema: { type: 'string', const: 'DisclosureSubset.v0.1' },
    dealStateCid: { type: 'string' },
    dealStateHash: { type: 'string' },
    objective: { type: 'string' },
    audience: { type: 'string' },
    categories: { type: 'array', items: { type: 'string' } },
    sources: { type: 'array', items: { type: 'object', additionalProperties: true } },
    excludedSources: { type: 'array', items: { type: 'object', additionalProperties: true } },
    sourceGaps: { type: 'array', items: { type: 'object', additionalProperties: true } },
    selectiveDisclosureProof: { type: 'object', additionalProperties: true },
    disclosureBoundary: { type: 'object', additionalProperties: true },
    next_suggested_calls: { type: 'array', items: { $ref: schemaId('MCPCallHint') } },
    takeBackArtifacts: { type: 'array', items: { type: 'string' } },
    lineInvariant: { type: 'string' },
  },
};

const DocumentDraft: JsonSchema = {
  $id: schemaId('DocumentDraft'),
  title: 'DocumentDraft',
  type: 'object',
  additionalProperties: true,
  required: ['draftId', 'schema', 'dealStateCid', 'dealStateHash', 'documentType', 'sections', 'sourcePolicy', 'next_suggested_calls'],
  properties: {
    draftId: { type: 'string' },
    schema: { type: 'string', const: 'DocumentDraft.v0.1' },
    dealStateCid: { type: 'string' },
    dealStateHash: { type: 'string' },
    documentType: { type: 'string' },
    stage: { type: 'string' },
    audience: { type: 'string' },
    title: { type: 'string' },
    sections: { type: 'array', items: { type: 'object', additionalProperties: true } },
    sourcePolicy: { type: 'object', additionalProperties: true },
    modelDependencies: { type: 'object', additionalProperties: true },
    exportBoundary: { type: 'object', additionalProperties: true },
    next_suggested_calls: { type: 'array', items: { $ref: schemaId('MCPCallHint') } },
    takeBackArtifacts: { type: 'array', items: { type: 'string' } },
    lineInvariant: { type: 'string' },
  },
};

const NegotiationBrief: JsonSchema = {
  $id: schemaId('NegotiationBrief'),
  title: 'NegotiationBrief',
  type: 'object',
  additionalProperties: true,
  required: ['briefId', 'schema', 'dealStateCid', 'dealStateHash', 'openTerms', 'modelBackedRanges', 'handoffs', 'negotiationBoundary', 'next_suggested_calls'],
  properties: {
    briefId: { type: 'string' },
    schema: { type: 'string', const: 'NegotiationBrief.v0.1' },
    dealStateCid: { type: 'string' },
    dealStateHash: { type: 'string' },
    objective: { type: 'string' },
    audience: { type: 'string' },
    stage: { type: 'string' },
    readinessLevel: { type: 'string' },
    openTerms: { type: 'array', items: { type: 'object', additionalProperties: true } },
    modelBackedRanges: { type: 'array', items: { type: 'object', additionalProperties: true } },
    sourceGaps: { type: 'array', items: { type: 'object', additionalProperties: true } },
    handoffs: { type: 'array', items: { type: 'object', additionalProperties: true } },
    negotiationBoundary: { type: 'object', additionalProperties: true },
    next_suggested_calls: { type: 'array', items: { $ref: schemaId('MCPCallHint') } },
    takeBackArtifacts: { type: 'array', items: { type: 'string' } },
    lineInvariant: { type: 'string' },
  },
};

const CloseReadiness: JsonSchema = {
  $id: schemaId('CloseReadiness'),
  title: 'CloseReadiness',
  type: 'object',
  additionalProperties: true,
  required: ['readinessId', 'schema', 'dealStateCid', 'dealStateHash', 'readinessStatus', 'checks', 'blockers', 'approvalMatrix', 'closeReadinessBoundary', 'next_suggested_calls'],
  properties: {
    readinessId: { type: 'string' },
    schema: { type: 'string', const: 'CloseReadiness.v0.1' },
    dealStateCid: { type: 'string' },
    dealStateHash: { type: 'string' },
    objective: { type: 'string' },
    audience: { type: 'string' },
    stage: { type: 'string' },
    readinessLevel: { type: 'string' },
    readinessStatus: { type: 'string' },
    readinessScore: { type: 'integer' },
    checks: { type: 'array', items: { type: 'object', additionalProperties: true } },
    blockers: { type: 'array', items: { type: 'object', additionalProperties: true } },
    sourceRefs: { type: 'array', items: { type: 'object', additionalProperties: true } },
    sourceGaps: { type: 'array', items: { type: 'object', additionalProperties: true } },
    approvalMatrix: { type: 'array', items: { type: 'object', additionalProperties: true } },
    closeReadinessBoundary: { type: 'object', additionalProperties: true },
    next_suggested_calls: { type: 'array', items: { $ref: schemaId('MCPCallHint') } },
    takeBackArtifacts: { type: 'array', items: { type: 'string' } },
    lineInvariant: { type: 'string' },
  },
};

const FundsFlow: JsonSchema = {
  $id: schemaId('FundsFlow'),
  title: 'FundsFlow',
  type: 'object',
  additionalProperties: true,
  required: ['flowId', 'schema', 'dealStateCid', 'dealStateHash', 'sourceRows', 'useRows', 'reconciliation', 'fundsFlowBoundary', 'next_suggested_calls'],
  properties: {
    flowId: { type: 'string' },
    schema: { type: 'string', const: 'FundsFlow.v0.1' },
    dealStateCid: { type: 'string' },
    dealStateHash: { type: 'string' },
    objective: { type: 'string' },
    audience: { type: 'string' },
    stage: { type: 'string' },
    readinessLevel: { type: 'string' },
    sourceRows: { type: 'array', items: { type: 'object', additionalProperties: true } },
    useRows: { type: 'array', items: { type: 'object', additionalProperties: true } },
    adjustments: { type: 'array', items: { type: 'object', additionalProperties: true } },
    reconciliation: { type: 'object', additionalProperties: true },
    sourceRefs: { type: 'array', items: { type: 'object', additionalProperties: true } },
    sourceGaps: { type: 'array', items: { type: 'object', additionalProperties: true } },
    handoffs: { type: 'array', items: { type: 'object', additionalProperties: true } },
    modelDependencies: { type: 'object', additionalProperties: true },
    fundsFlowBoundary: { type: 'object', additionalProperties: true },
    next_suggested_calls: { type: 'array', items: { $ref: schemaId('MCPCallHint') } },
    takeBackArtifacts: { type: 'array', items: { type: 'string' } },
    lineInvariant: { type: 'string' },
  },
};

const PMIPlan: JsonSchema = {
  $id: schemaId('PMIPlan'),
  title: 'PMIPlan',
  type: 'object',
  additionalProperties: true,
  required: ['planId', 'schema', 'dealStateCid', 'dealStateHash', 'workstreams', 'milestones', 'riskRegister', 'pmiBoundary', 'next_suggested_calls'],
  properties: {
    planId: { type: 'string' },
    schema: { type: 'string', const: 'PMIPlan.v0.1' },
    dealStateCid: { type: 'string' },
    dealStateHash: { type: 'string' },
    objective: { type: 'string' },
    audience: { type: 'string' },
    stage: { type: 'string' },
    readinessLevel: { type: 'string' },
    workstreams: { type: 'array', items: { type: 'object', additionalProperties: true } },
    milestones: { type: 'array', items: { type: 'object', additionalProperties: true } },
    riskRegister: { type: 'array', items: { type: 'object', additionalProperties: true } },
    sourceRefs: { type: 'array', items: { type: 'object', additionalProperties: true } },
    sourceGaps: { type: 'array', items: { type: 'object', additionalProperties: true } },
    modelDependencies: { type: 'object', additionalProperties: true },
    pmiBoundary: { type: 'object', additionalProperties: true },
    next_suggested_calls: { type: 'array', items: { $ref: schemaId('MCPCallHint') } },
    takeBackArtifacts: { type: 'array', items: { type: 'string' } },
    lineInvariant: { type: 'string' },
  },
};

const StudioBook: JsonSchema = {
  $id: schemaId('StudioBook'),
  title: 'StudioBook',
  type: 'object',
  additionalProperties: true,
  required: ['bookId', 'schema', 'dealStateCid', 'format', 'sections', 'sourcePolicy'],
  properties: {
    bookId: { type: 'string' },
    schema: { type: 'string', const: 'StudioBook.v0.1' },
    dealStateCid: { type: 'string' },
    format: { type: 'string' },
    sections: { type: 'array', items: { type: 'object', additionalProperties: true } },
    sourcePolicy: { type: 'object', additionalProperties: true },
    exportManifest: { $ref: schemaId('ExportManifest') },
  },
};

const ExportManifest: JsonSchema = {
  $id: schemaId('ExportManifest'),
  title: 'ExportManifest',
  type: 'object',
  additionalProperties: true,
  required: ['manifestId', 'schema', 'artifactType', 'sourceRefs', 'auditRefs'],
  properties: {
    manifestId: { type: 'string' },
    schema: { type: 'string', const: 'ExportManifest.v0.1' },
    artifactType: { type: 'string' },
    sourceRefs: { type: 'array', items: { type: 'object', additionalProperties: true } },
    auditRefs: { type: 'array', items: { type: 'string' } },
    outputHash: { $ref: schemaId('OutputHash') },
  },
};

const AuditPacket: JsonSchema = {
  $id: schemaId('AuditPacket'),
  title: 'AuditPacket',
  type: 'object',
  additionalProperties: true,
  required: ['packetId', 'schema', 'methodologyVersion', 'sourceHashes', 'modelOutputHashes', 'auditHash'],
  properties: {
    packetId: { type: 'string' },
    schema: { type: 'string', const: 'AuditPacket.v0.1' },
    methodologyVersion: { type: 'string' },
    sourceHashes: { type: 'array', items: { $ref: schemaId('OutputHash') } },
    modelOutputHashes: { type: 'array', items: { $ref: schemaId('OutputHash') } },
    auditHash: { $ref: schemaId('OutputHash') },
    retentionYears: { type: 'integer' },
  },
};

const SignedManifest: JsonSchema = {
  $id: schemaId('SignedManifest'),
  title: 'SignedManifest',
  type: 'object',
  additionalProperties: true,
  required: ['manifestId', 'schema', 'signedHash', 'signer', 'signedAt'],
  properties: {
    manifestId: { type: 'string' },
    schema: { type: 'string', const: 'SignedManifest.v0.1' },
    signedHash: { $ref: schemaId('OutputHash') },
    signer: { type: 'string' },
    signedAt: { type: 'string' },
    attestation: { $ref: schemaId('Attestation') },
  },
};

const Attestation: JsonSchema = {
  $id: schemaId('Attestation'),
  title: 'Attestation',
  type: 'object',
  additionalProperties: true,
  required: ['schema', 'attestationType', 'statement', 'lineBoundary'],
  properties: {
    schema: { type: 'string', const: 'Attestation.v0.1' },
    attestationType: { type: 'string' },
    statement: { type: 'string' },
    evidenceRefs: { type: 'array', items: { type: 'string' } },
    lineBoundary: { type: 'string' },
  },
};

const MerkleInclusionProof: JsonSchema = {
  $id: schemaId('MerkleInclusionProof'),
  title: 'MerkleInclusionProof',
  type: 'object',
  additionalProperties: true,
  required: ['schema', 'leafHash', 'rootHash', 'proof'],
  properties: {
    schema: { type: 'string', const: 'MerkleInclusionProof.v0.1' },
    leafHash: { type: 'string' },
    rootHash: { type: 'string' },
    proof: { type: 'array', items: { type: 'string' } },
  },
};

const Deliverable: JsonSchema = {
  $id: schemaId('Deliverable'),
  title: 'Deliverable',
  type: 'object',
  additionalProperties: true,
  required: ['deliverableId', 'schema', 'type', 'dealStateCid', 'sourcePolicy', 'auditPacket'],
  properties: {
    deliverableId: { type: 'string' },
    schema: { type: 'string', const: 'Deliverable.v0.1' },
    type: { type: 'string' },
    dealStateCid: { type: 'string' },
    studioBook: { $ref: schemaId('StudioBook') },
    documentDraft: { $ref: schemaId('DocumentDraft') },
    sourcePolicy: { type: 'object', additionalProperties: true },
    auditPacket: { $ref: schemaId('AuditPacket') },
  },
};

const CapabilityCatalog: JsonSchema = {
  $id: schemaId('CapabilityCatalog'),
  title: 'CapabilityCatalog',
  type: 'object',
  additionalProperties: true,
  required: ['schema', 'standard', 'methodologyVersion', 'lifecycleStages', 'workSurfaces', 'takeBackArtifacts', 'relevantMechanics', 'next_suggested_calls'],
  description: 'Contextual capability catalog for an external agent entering or resuming the Deal OS.',
  properties: {
    schema: { type: 'string', const: 'CapabilityCatalog.v0.1' },
    standard: { type: 'string' },
    methodologyVersion: { type: 'string' },
    methodologyUri: { type: 'string' },
    objective: { type: 'string' },
    scope: { type: 'object', additionalProperties: true },
    noRejectionContract: { type: 'string' },
    recursiveWorkLoop: { type: 'array', items: { type: 'string' } },
    lifecycleStages: { type: 'array', items: { type: 'object', additionalProperties: true } },
    workSurfaces: { type: 'array', items: { type: 'object', additionalProperties: true } },
    takeBackArtifacts: { type: 'array', items: { type: 'string' } },
    relevantMechanics: { type: 'array', items: { type: 'object', additionalProperties: true } },
    recommendedEntryTools: { type: 'array', items: { type: 'string' } },
    next_suggested_calls: { type: 'array', items: { $ref: schemaId('MCPCallHint') } },
    the_line_invariant: { type: 'string' },
  },
};

const MethodologyDescription: JsonSchema = {
  $id: schemaId('MethodologyDescription'),
  title: 'MethodologyDescription',
  type: 'object',
  additionalProperties: true,
  required: ['schema', 'standard', 'specVersion', 'methodologyVersion', 'doctrine', 'next_suggested_calls'],
  properties: {
    schema: { type: 'string', const: 'MethodologyDescription.v0.1' },
    section: { type: 'string' },
    standard: { type: 'object', additionalProperties: true },
    specVersion: { type: 'string' },
    specUri: { type: 'string' },
    methodologyVersion: { type: 'string' },
    methodologyUri: { type: 'string' },
    doctrine: { type: 'object', additionalProperties: true },
    lifecycleStages: { type: 'array', items: { type: 'object', additionalProperties: true } },
    workSurfaces: { type: 'array', items: { type: 'object', additionalProperties: true } },
    schemas: { type: 'object', additionalProperties: true },
    passThrough: { type: 'object', additionalProperties: true },
    conformance: { type: 'object', additionalProperties: true },
    next_suggested_calls: { type: 'array', items: { $ref: schemaId('MCPCallHint') } },
    the_line_invariant: { type: 'string' },
  },
};

const DealCostEstimate: JsonSchema = {
  $id: schemaId('DealCostEstimate'),
  title: 'DealCostEstimate',
  type: 'object',
  additionalProperties: true,
  required: ['schema', 'pricingDoctrine', 'recommendedPlan', 'plans', 'usageProfile', 'passThrough'],
  description: 'Outcome-independent pricing estimate. It never quotes success fees, deal-value fees, wallet balances, or human-service referral compensation.',
  properties: {
    schema: { type: 'string', const: 'DealCostEstimate.v0.1' },
    pricingDoctrine: { type: 'string' },
    recommendedPlan: { type: 'object', additionalProperties: true },
    plans: { type: 'array', items: { type: 'object', additionalProperties: true } },
    usageProfile: { type: 'object', additionalProperties: true },
    passThrough: { type: 'object', additionalProperties: true },
    next_suggested_calls: { type: 'array', items: { $ref: schemaId('MCPCallHint') } },
    the_line_invariant: { type: 'string' },
  },
};

const DefinitionOfDone: JsonSchema = {
  $id: schemaId('DefinitionOfDone'),
  title: 'DefinitionOfDone',
  type: 'object',
  additionalProperties: true,
  required: ['version', 'levels', 'lifecycle', 'lineInvariant'],
  properties: {
    version: { type: 'string', const: 'DEFINITIVE.definition-of-done.v0.1' },
    completenessSpec: { $ref: schemaId('CompletenessSpec') },
    levels: { type: 'array', items: { $ref: schemaId('DealReadinessLevel') } },
    lifecycle: { type: 'string' },
    lineInvariant: { type: 'string' },
  },
};

const DefinitiveToolEnvelope: JsonSchema = {
  $id: schemaId('DefinitiveToolEnvelope'),
  title: 'DefinitiveToolEnvelope',
  type: 'object',
  additionalProperties: true,
  required: ['ok', 'toolName', 'specVersion', 'methodologyVersion'],
  properties: {
    ok: { type: 'boolean' },
    toolName: { type: 'string' },
    protocol: { type: 'string' },
    result: { type: 'object', additionalProperties: true },
    mandateChain: { type: ['object', 'null'], additionalProperties: true },
    lineStatus: { type: 'string' },
    requiredScopes: { type: 'array', items: { type: 'string' } },
    specVersion: { type: 'string' },
    methodologyVersion: { type: 'string' },
  },
};

export const DEFINITIVE_SCHEMAS: Record<string, JsonSchema> = {
  DealPayload,
  OverlaySignals,
  ClassificationKey,
  SourceIndexItem,
  MissingInputItem,
  MissingInputContract,
  DealReadinessLevel,
  CompletenessSpec,
  CompletenessReport,
  MCPCallHint,
  DealState,
  DealPlan,
  GateState,
  PipelineStageDelta,
  DealStateDiff,
  SourceIndex,
  SourceGapList,
  SelectiveDisclosureProof,
  OutputHash,
  AssumptionLog,
  ModelOutput,
  StructurePermutation,
  ParetoFrontier,
  BestVehicleBlock,
  DealPackage,
  LifecycleTrace,
  IOIPacket,
  LOIPacket,
  DataRoomIndex,
  DiligenceRequest,
  DisclosureSubset,
  DocumentDraft,
  NegotiationBrief,
  CloseReadiness,
  FundsFlow,
  PMIPlan,
  StudioBook,
  ExportManifest,
  AuditPacket,
  SignedManifest,
  Attestation,
  MerkleInclusionProof,
  Deliverable,
  CapabilityCatalog,
  MethodologyDescription,
  DealCostEstimate,
  DefinitionOfDone,
  DefinitiveToolEnvelope,
};

const TOOL_SCHEMA_MAP: Record<string, { input: string[]; output: string[]; takeBack: string[] }> = {
  ingest_deal_payload: {
    input: ['DealPayload'],
    output: ['DealState', 'ClassificationKey', 'MissingInputContract', 'CompletenessReport', 'MCPCallHint'],
    takeBack: ['DealState', 'ClassificationKey', 'MissingInputContract', 'CompletenessReport'],
  },
  update_deal_payload: {
    input: ['DealState', 'DealPayload'],
    output: ['DealState', 'ClassificationKey', 'MissingInputContract', 'CompletenessReport', 'MCPCallHint'],
    takeBack: ['DealState', 'DealStateDiff'],
  },
  check_completeness: {
    input: ['DealState', 'DealPayload'],
    output: ['CompletenessReport', 'MissingInputContract', 'MCPCallHint'],
    takeBack: ['CompletenessReport'],
  },
  get_definition_of_done: {
    input: [],
    output: ['DefinitionOfDone'],
    takeBack: ['DefinitionOfDone'],
  },
  get_deal_state: {
    input: ['DealState'],
    output: ['DealState', 'ClassificationKey', 'MissingInputContract', 'CompletenessReport', 'MCPCallHint'],
    takeBack: ['DealState', 'ClassificationKey', 'MissingInputContract', 'CompletenessReport'],
  },
  introspect_capabilities: {
    input: [],
    output: ['CapabilityCatalog', 'MCPCallHint'],
    takeBack: ['CapabilityCatalog', 'MCPCallHint'],
  },
  describe_methodology: {
    input: [],
    output: ['MethodologyDescription', 'DefinitionOfDone'],
    takeBack: ['MethodologyDescription'],
  },
  estimate_deal_cost: {
    input: [],
    output: ['DealCostEstimate'],
    takeBack: ['DealCostEstimate'],
  },
  get_deal_runbook: {
    input: [],
    output: ['DealPlan', 'MCPCallHint'],
    takeBack: ['DealPlan', 'MCPCallHint'],
  },
  lookup_model_slot: {
    input: [],
    output: ['ModelOutput', 'DefinitionOfDone', 'MCPCallHint'],
    takeBack: ['ModelOutput', 'MCPCallHint'],
  },
  compose_deal_plan: {
    input: ['DealState', 'DealPayload'],
    output: ['DealPlan', 'MCPCallHint'],
    takeBack: ['DealPlan'],
  },
  diff_deal_state: {
    input: ['DealState', 'DealPayload'],
    output: ['DealStateDiff', 'MCPCallHint'],
    takeBack: ['DealStateDiff'],
  },
  clone_deal_state: {
    input: ['DealState', 'DealPayload'],
    output: ['DealState', 'ClassificationKey', 'MissingInputContract', 'CompletenessReport', 'MCPCallHint'],
    takeBack: ['DealState', 'DealStateDiff'],
  },
  compose_deal_package: {
    input: ['DealState', 'DealPayload'],
    output: ['DealPackage', 'DealState', 'DealPlan', 'CompletenessReport', 'MissingInputContract', 'MCPCallHint'],
    takeBack: ['DealPackage', 'DealState', 'DealPlan', 'CompletenessReport', 'MissingInputContract'],
  },
  resume_deal: {
    input: ['DealState', 'DealPayload', 'DealPackage'],
    output: ['DealState', 'DealPlan', 'DealPackage', 'CompletenessReport', 'MissingInputContract', 'MCPCallHint'],
    takeBack: ['DealState', 'DealPlan', 'DealPackage', 'CompletenessReport', 'MissingInputContract'],
  },
  compose_lifecycle_trace: {
    input: ['DealState', 'DealPayload'],
    output: ['LifecycleTrace', 'DealState', 'DealPlan', 'MissingInputContract', 'MCPCallHint'],
    takeBack: ['LifecycleTrace', 'DealState', 'DealPlan', 'MCPCallHint'],
  },
  prepare_ioi_packet: {
    input: ['DealState', 'DealPayload'],
    output: ['IOIPacket', 'DealState', 'MissingInputContract', 'MCPCallHint'],
    takeBack: ['IOIPacket', 'DealState', 'DocumentDraft', 'MCPCallHint'],
  },
  prepare_loi_packet: {
    input: ['DealState', 'DealPayload'],
    output: ['LOIPacket', 'DealState', 'MissingInputContract', 'MCPCallHint'],
    takeBack: ['LOIPacket', 'DealState', 'DocumentDraft', 'MCPCallHint'],
  },
  compose_data_room_index: {
    input: ['DealState', 'DealPayload'],
    output: ['DataRoomIndex', 'DealState', 'MissingInputContract', 'MCPCallHint'],
    takeBack: ['DataRoomIndex', 'SourceIndex', 'MissingInputContract'],
  },
  prepare_diligence_request: {
    input: ['DealState', 'DealPayload', 'DataRoomIndex'],
    output: ['DiligenceRequest', 'DealState', 'MissingInputContract', 'MCPCallHint'],
    takeBack: ['DiligenceRequest', 'DataRoomIndex', 'MissingInputContract', 'MCPCallHint'],
  },
  disclose_subset: {
    input: ['DealState', 'DealPayload', 'DataRoomIndex'],
    output: ['DisclosureSubset', 'DealState', 'MissingInputContract', 'MCPCallHint'],
    takeBack: ['DisclosureSubset', 'SourceIndex', 'SelectiveDisclosureProof'],
  },
  compose_document_draft: {
    input: ['DealState', 'DealPayload'],
    output: ['DocumentDraft', 'DealState', 'MissingInputContract', 'MCPCallHint'],
    takeBack: ['DocumentDraft', 'SourceIndex', 'MissingInputContract'],
  },
  prepare_negotiation_brief: {
    input: ['DealState', 'DealPayload'],
    output: ['NegotiationBrief', 'DealState', 'MissingInputContract', 'MCPCallHint'],
    takeBack: ['NegotiationBrief', 'SourceGapList', 'MCPCallHint'],
  },
  compose_close_readiness: {
    input: ['DealState', 'DealPayload'],
    output: ['CloseReadiness', 'DealState', 'MissingInputContract', 'MCPCallHint'],
    takeBack: ['CloseReadiness', 'DealState', 'FundsFlow', 'PMIPlan', 'MCPCallHint'],
  },
  generate_funds_flow: {
    input: ['DealState', 'DealPayload'],
    output: ['FundsFlow', 'DealState', 'MissingInputContract', 'MCPCallHint'],
    takeBack: ['FundsFlow', 'DealState', 'DocumentDraft', 'MCPCallHint'],
  },
  compose_pmi_plan: {
    input: ['DealState', 'DealPayload'],
    output: ['PMIPlan', 'DealState', 'MissingInputContract', 'MCPCallHint'],
    takeBack: ['PMIPlan', 'DealState', 'DocumentDraft', 'MCPCallHint'],
  },
};

export function buildDefinitiveSchemaRegistry() {
  return {
    name: 'DEFINITIVE Schema Registry',
    version: DEFINITIVE_SCHEMA_REGISTRY_VERSION,
    uri: DEFINITIVE_SCHEMA_REGISTRY_URI,
    specVersion: DEFINITIVE_SPEC_VERSION,
    specUri: DEFINITIVE_SPEC_URI,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
    methodologyUri: DEFINITIVE_METHODOLOGY_URI,
    schemaBase: SCHEMA_BASE,
    schemaCount: Object.keys(DEFINITIVE_SCHEMAS).length,
    schemaNames: Object.keys(DEFINITIVE_SCHEMAS),
    schemas: DEFINITIVE_SCHEMAS,
    toolSchemaMap: TOOL_SCHEMA_MAP,
    terminalSubstrateSchemas: [
      'DealPayload',
      'ClassificationKey',
      'MissingInputContract',
      'DealState',
      'CompletenessSpec',
      'CompletenessReport',
      'DealPackage',
    ],
    portableTakeBackSchemas: [
      'CapabilityCatalog',
      'DealPlan',
      'DealStateDiff',
      'GateState',
      'PipelineStageDelta',
      'SourceIndex',
      'SourceGapList',
      'DataRoomIndex',
      'DisclosureSubset',
      'SelectiveDisclosureProof',
      'DocumentDraft',
      'StudioBook',
      'ExportManifest',
      'ModelOutput',
      'AssumptionLog',
      'OutputHash',
      'AuditPacket',
      'MerkleInclusionProof',
    ],
    noRejectionContract:
      'DealPayload may be incomplete. The schema is permissive at intake, then DealState returns MissingInputContract and next_suggested_calls instead of rejecting the agent.',
    lineInvariant:
      'Schemas describe software/data contracts only. DEFINITIVE computes, cites, packages, and routes; users and qualified professionals make regulated determinations.',
  };
}

export function getDefinitiveSchema(name: string) {
  return DEFINITIVE_SCHEMAS[name] || null;
}

export function getDefinitiveToolSchemaMap() {
  return TOOL_SCHEMA_MAP;
}
