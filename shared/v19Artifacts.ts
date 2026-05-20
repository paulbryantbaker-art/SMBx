export const V19_RESOURCE_KINDS = [
  'methodology',
  'deal',
  'studio',
  'source',
  'model',
  'audit',
  'gate',
] as const;

export type V19ResourceKind = typeof V19_RESOURCE_KINDS[number];
export type V19ResourceUri = `${V19ResourceKind}://${string}`;

export const V19_STUDIO_FORMATS = [
  'buyer-pitch-book',
  'seller-pitch-book',
  'ic-deck',
  'qoe-preview-book',
  'cim-summary-deck',
  'board-update',
  'lender-book',
] as const;

export type V19StudioFormatId = typeof V19_STUDIO_FORMATS[number];
export type V19WarningState = 'clean' | 'needs_sources' | 'stale_models';
export type V19SourceStatus = 'linked' | 'missing' | 'stale';
export type V19ModelRunStatus = 'complete' | 'needs_inputs';

export interface V19ArtifactBase {
  uri: V19ResourceUri;
  id: string;
  specVersion?: string;
  specUri?: string;
  methodologyVersion?: string;
  methodologyUri?: string;
  beneficialCustomerId?: number | null;
  billingOrgId?: number | null;
  mandateId?: string | null;
  agentId?: string | null;
  agentPlatformId?: string | null;
  mandateChain?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface V19SourceCardArtifact extends V19ArtifactBase {
  kind: 'source_card';
  sourceType: string;
  label: string;
  status: V19SourceStatus;
  citationTag?: string | null;
  sourceUrl?: string | null;
  scope?: string | null;
}

export interface V19ModelRunArtifact extends V19ArtifactBase {
  kind: 'model_run';
  modelId: string;
  version: string;
  status: V19ModelRunStatus;
  dealId?: number | null;
  studioBookId?: number | null;
  inputHash: string;
  outputHash: string;
  missingInputs: string[];
  citationTags: string[];
}

export interface V19StudioSlideProvenance {
  factsUsed: string[];
  modelOutputsUsed: string[];
  citationsUsed: string[];
  uncheckedClaims: string[];
}

export interface V19StudioSlideArtifact extends V19ArtifactBase {
  kind: 'studio_slide';
  title: string;
  body: string;
  bullets: string[];
  provenance: V19StudioSlideProvenance;
  warningState: V19WarningState;
}

export interface V19StudioBookArtifact extends V19ArtifactBase {
  kind: 'studio_book';
  title: string;
  format: V19StudioFormatId;
  dealId?: number | null;
  version: number;
  status: string;
  slides: V19StudioSlideArtifact[];
  sources: V19SourceCardArtifact[];
  modelRuns: V19ModelRunArtifact[];
}

export interface V19AuditRecordArtifact extends V19ArtifactBase {
  kind: 'audit_record';
  sessionId: string;
  turnId: string;
  dealId?: number | null;
  conversationId?: number | null;
  modelStack: string[];
  citationsValidated: string[];
  outputHash: string;
}

export interface V19DealStateArtifact extends V19ArtifactBase {
  kind: 'deal_state';
  journey: 'sell' | 'buy' | 'raise' | 'pmi';
  league: string;
  dealType: string;
  currentGate: string;
  activeModelStack: string[];
}

export interface V19GateStateArtifact extends V19ArtifactBase {
  kind: 'gate_state';
  gateId: string;
  requiredModels: string[];
  requiredCitations: string[];
  alwaysHaltTriggers: string[];
  status: 'open' | 'blocked' | 'ready' | 'complete';
}

export type V19Artifact =
  | V19SourceCardArtifact
  | V19ModelRunArtifact
  | V19StudioSlideArtifact
  | V19StudioBookArtifact
  | V19AuditRecordArtifact
  | V19DealStateArtifact
  | V19GateStateArtifact;

export const V19_ARTIFACT_SCHEMAS = {
  StudioBook: {
    kind: 'studio_book',
    resource: 'studio://book/{bookId}',
    required: ['uri', 'id', 'title', 'format', 'version', 'slides', 'sources', 'modelRuns'],
  },
  StudioSlide: {
    kind: 'studio_slide',
    resource: 'studio://book/{bookId}/slide/{slideId}',
    required: ['uri', 'id', 'title', 'body', 'provenance', 'warningState'],
  },
  SourceCard: {
    kind: 'source_card',
    resource: 'source://{sourceType}/{sourceId}',
    required: ['uri', 'id', 'sourceType', 'label', 'status'],
  },
  ModelRun: {
    kind: 'model_run',
    resource: 'model://execution/{executionId}',
    required: ['uri', 'id', 'modelId', 'version', 'status', 'inputHash', 'outputHash', 'missingInputs', 'citationTags'],
  },
  AuditRecord: {
    kind: 'audit_record',
    resource: 'audit://record/{auditId}',
    required: ['uri', 'id', 'sessionId', 'turnId', 'modelStack', 'citationsValidated', 'outputHash'],
  },
  DealState: {
    kind: 'deal_state',
    resource: 'deal://{dealId}/state',
    required: ['uri', 'id', 'journey', 'league', 'dealType', 'currentGate', 'activeModelStack'],
  },
  GateState: {
    kind: 'gate_state',
    resource: 'gate://{journey}/{gateId}',
    required: ['uri', 'id', 'gateId', 'requiredModels', 'requiredCitations', 'alwaysHaltTriggers', 'status'],
  },
} as const;

export function v19ResourceUri(kind: V19ResourceKind, id: string | number): V19ResourceUri {
  return `${kind}://${String(id).replace(/^\/+/, '')}` as V19ResourceUri;
}

export function isV19ResourceUri(value: unknown): value is V19ResourceUri {
  if (typeof value !== 'string') return false;
  return V19_RESOURCE_KINDS.some(kind => value.startsWith(`${kind}://`));
}

export function isV19StudioFormat(value: unknown): value is V19StudioFormatId {
  return typeof value === 'string' && V19_STUDIO_FORMATS.includes(value as V19StudioFormatId);
}

export function isV19ModelRunArtifact(value: unknown): value is V19ModelRunArtifact {
  const record = asRecord(value);
  return !!record
    && record.kind === 'model_run'
    && isV19ResourceUri(record.uri)
    && typeof record.modelId === 'string'
    && typeof record.version === 'string'
    && (record.status === 'complete' || record.status === 'needs_inputs')
    && Array.isArray(record.missingInputs)
    && Array.isArray(record.citationTags);
}

export function assertV19StudioBookArtifact(value: unknown): asserts value is V19StudioBookArtifact {
  const record = asRecord(value);
  if (!record || record.kind !== 'studio_book') throw new Error('Expected studio_book artifact');
  if (!isV19ResourceUri(record.uri)) throw new Error('StudioBook.uri must be a V19 resource URI');
  if (!isV19StudioFormat(record.format)) throw new Error('StudioBook.format is not supported');
  if (!Array.isArray(record.slides)) throw new Error('StudioBook.slides must be an array');
  if (!Array.isArray(record.sources)) throw new Error('StudioBook.sources must be an array');
  if (!Array.isArray(record.modelRuns)) throw new Error('StudioBook.modelRuns must be an array');
}

function asRecord(value: unknown): Record<string, any> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : null;
}
