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

const DefinitionOfDone: JsonSchema = {
  $id: schemaId('DefinitionOfDone'),
  title: 'DefinitionOfDone',
  type: 'object',
  additionalProperties: true,
  required: ['version', 'levels', 'lifecycle', 'lineInvariant'],
  properties: {
    version: { type: 'string', const: 'DEFINITIVE.definition-of-done.v0.1' },
    levels: { type: 'array', items: { type: 'object', additionalProperties: true } },
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
  CompletenessReport,
  MCPCallHint,
  DealState,
  DealPlan,
  DealStateDiff,
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
