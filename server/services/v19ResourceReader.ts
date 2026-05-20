import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { sql } from '../db.js';
import { definitiveVersionPayload } from '../constants/definitive.js';
import { hasDealAccess } from './dealAccessService.js';
import { getPitchBook } from './pitchBookStudio.js';
import { listV19ResourceContract } from './v19ResourceContract.js';
import { GATE_MAP, getGateV19Requirements } from '../../shared/gateRegistry.js';
import {
  assertV19StudioBookArtifact,
  isV19ResourceUri,
  v19ResourceUri,
  type V19Artifact,
  type V19AuditRecordArtifact,
  type V19DealStateArtifact,
  type V19GateStateArtifact,
  type V19ModelRunArtifact,
  type V19SourceCardArtifact,
  type V19StudioBookArtifact,
  type V19StudioSlideArtifact,
} from '../../shared/v19Artifacts.js';

export interface V19ResourceReadResult {
  uri: string;
  artifact: V19Artifact | Record<string, any>;
}

export async function readV19Resource(userId: number, uri: string): Promise<V19ResourceReadResult> {
  if (!isV19ResourceUri(uri)) throw new Error('Invalid V19 resource URI');
  const parsed = parseResourceUri(uri);

  if (parsed.kind === 'methodology') {
    return { uri, artifact: await readMethodologyResource(parsed.path) };
  }
  if (parsed.kind === 'studio') {
    return { uri, artifact: await readStudioResource(userId, parsed.path) };
  }
  if (parsed.kind === 'model') {
    return { uri, artifact: await readModelResource(userId, parsed.path) };
  }
  if (parsed.kind === 'audit') {
    return { uri, artifact: await readAuditResource(userId, parsed.path) };
  }
  if (parsed.kind === 'deal') {
    return { uri, artifact: await readDealResource(userId, parsed.path) };
  }
  if (parsed.kind === 'gate') {
    return { uri, artifact: readGateResource(parsed.path) };
  }
  if (parsed.kind === 'source') {
    return { uri, artifact: await readSourceResource(userId, parsed.path) };
  }

  throw new Error(`Unsupported V19 resource kind: ${parsed.kind}`);
}

async function readMethodologyResource(path: string): Promise<Record<string, any>> {
  if (path === 'yulia-prompts/v4') {
    const promptPath = resolve(process.cwd(), 'server/prompts/YULIA_PROMPTS_V4.md');
    const prompt = await readFile(promptPath, 'utf8').catch(() => '');
    return {
      kind: 'methodology',
      uri: 'methodology://yulia-prompts/v4',
      id: 'yulia-prompts-v4',
      title: 'Yulia V4 prompt governance',
      prompt,
    };
  }
  if (path !== 'v19') throw new Error('Unknown methodology resource');
  const planPath = resolve(process.cwd(), 'methodology/V19_BUILD_PLAN.md');
  const plan = await readFile(planPath, 'utf8').catch(() => '');
  return {
    kind: 'methodology',
    uri: 'methodology://v19',
    id: 'v19',
    title: 'V19 methodology and build plan',
    contract: listV19ResourceContract(),
    buildPlanExcerpt: plan.split('\n').slice(0, 90).join('\n'),
  };
}

async function readStudioResource(userId: number, path: string): Promise<V19StudioBookArtifact> {
  const match = path.match(/^book\/(\d+)$/);
  if (!match) throw new Error('Studio resource must be studio://book/{bookId}');
  const bookId = Number(match[1]);
  const book = await getPitchBook(userId, bookId);
  if (!book) throw new Error('Studio book not found');
  const pins = versionPinsFromRecord(book.audit);

  const artifact: V19StudioBookArtifact = {
    kind: 'studio_book',
    uri: `studio://book/${book.id}`,
    id: String(book.id),
    ...pins,
    title: book.title,
    format: book.format,
    dealId: book.dealId,
    version: book.version,
    status: book.status,
    createdAt: book.createdAt,
    updatedAt: book.updatedAt,
    slides: book.slides.map(slide => ({
      kind: 'studio_slide',
      uri: `studio://book/${book.id}/slide/${slide.id}`,
      id: String(slide.id),
      ...pins,
      title: slide.title,
      body: slide.body,
      bullets: slide.bullets,
      provenance: slide.provenance,
      warningState: slide.warningState,
    } satisfies V19StudioSlideArtifact)),
    sources: book.sources.map(source => ({
      kind: 'source_card',
      uri: `source://studio_source/${source.id ?? source.sourceId ?? source.label}`,
      id: String(source.id ?? source.sourceId ?? source.label),
      ...pins,
      sourceType: source.sourceType,
      label: source.label,
      status: source.status,
      citationTag: source.citationTag ?? null,
      sourceUrl: source.sourceUrl ?? null,
    } satisfies V19SourceCardArtifact)),
    modelRuns: book.modelOutputs.map(output => ({
      kind: 'model_run',
      uri: output.executionId ? `model://execution/${output.executionId}` : v19ResourceUri('model', `book/${book.id}/${output.modelId}`),
      id: String(output.executionId ?? `${book.id}:${output.modelId}`),
      ...versionPinsFromRecord(output.auditPayload || pins),
      modelId: String(output.modelId),
      version: String(output.version || 'v1'),
      status: output.status === 'complete' ? 'complete' : 'needs_inputs',
      dealId: book.dealId,
      studioBookId: book.id,
      inputHash: String(output.auditPayload?.inputHash || ''),
      outputHash: String(output.outputHash || ''),
      missingInputs: Array.isArray(output.missingInputs) ? output.missingInputs.map(String) : [],
      citationTags: Array.isArray(output.citationTags) ? output.citationTags.map(String) : [],
    } satisfies V19ModelRunArtifact)),
  };
  assertV19StudioBookArtifact(artifact);
  return artifact;
}

async function readModelResource(userId: number, path: string): Promise<V19ModelRunArtifact> {
  const match = path.match(/^execution\/(\d+)$/);
  if (!match) throw new Error('Model resource must be model://execution/{executionId}');
  const [row] = await sql`
    SELECT id, model_id, version, status, deal_id, user_id, conversation_id, studio_book_id,
           input_hash, output_hash, missing_inputs, citation_tags,
           spec_version, spec_uri, methodology_version, methodology_uri, created_at
    FROM model_executions
    WHERE id = ${Number(match[1])}
    LIMIT 1
  `;
  if (!row) throw new Error('Model execution not found');
  await assertRowAccess(userId, row);
  return {
    kind: 'model_run',
    uri: `model://execution/${row.id}`,
    id: String(row.id),
    ...versionPinsFromRow(row),
    modelId: row.model_id,
    version: row.version,
    status: row.status === 'complete' ? 'complete' : 'needs_inputs',
    dealId: row.deal_id == null ? null : Number(row.deal_id),
    studioBookId: row.studio_book_id == null ? null : Number(row.studio_book_id),
    inputHash: row.input_hash,
    outputHash: row.output_hash,
    missingInputs: Array.isArray(row.missing_inputs) ? row.missing_inputs.map(String) : [],
    citationTags: Array.isArray(row.citation_tags) ? row.citation_tags.map(String) : [],
    createdAt: dateString(row.created_at),
  };
}

async function readAuditResource(userId: number, path: string): Promise<V19AuditRecordArtifact> {
  const match = path.match(/^record\/(\d+)$/);
  if (!match) throw new Error('Audit resource must be audit://record/{auditId}');
  const [row] = await sql`
    SELECT id, session_id, deal_id, user_id, conversation_id, turn_id, model_stack,
           citations_validated, output_hash, spec_version, spec_uri,
           methodology_version, methodology_uri, created_at
    FROM audit_trail
    WHERE id = ${Number(match[1])}
    LIMIT 1
  `;
  if (!row) throw new Error('Audit record not found');
  await assertRowAccess(userId, row);
  return {
    kind: 'audit_record',
    uri: `audit://record/${row.id}`,
    id: String(row.id),
    ...versionPinsFromRow(row),
    sessionId: row.session_id,
    turnId: row.turn_id,
    dealId: row.deal_id == null ? null : Number(row.deal_id),
    conversationId: row.conversation_id == null ? null : Number(row.conversation_id),
    modelStack: Array.isArray(row.model_stack) ? row.model_stack.map(String) : Object.keys(row.model_stack || {}),
    citationsValidated: Array.isArray(row.citations_validated)
      ? row.citations_validated.map(String)
      : Object.keys(row.citations_validated || {}),
    outputHash: row.output_hash || '',
    createdAt: dateString(row.created_at),
  };
}

async function readDealResource(userId: number, path: string): Promise<V19DealStateArtifact> {
  const match = path.match(/^(\d+)\/state$/);
  if (!match) throw new Error('Deal resource must be deal://{dealId}/state');
  const dealId = Number(match[1]);
  if (!(await hasDealAccess(dealId, userId))) throw new Error('Deal not found');
  const [deal] = await sql`
    SELECT id, journey_type, current_gate, league, deal_type, updated_at
    FROM deals
    WHERE id = ${dealId}
    LIMIT 1
  `;
  if (!deal) throw new Error('Deal not found');
  const [stack] = await sql`
    SELECT primary_models, supporting, tax_legal, sensitivity,
           spec_version, spec_uri, methodology_version, methodology_uri, composed_at
    FROM deal_model_stack
    WHERE deal_id = ${dealId}
    ORDER BY version DESC, composed_at DESC
    LIMIT 1
  `;
  const activeModelStack = [
    ...safeStringArray(stack?.primary_models),
    ...safeStringArray(stack?.supporting),
    ...safeStringArray(stack?.tax_legal),
    ...safeStringArray(stack?.sensitivity),
  ];
  return {
    kind: 'deal_state',
    uri: `deal://${dealId}/state`,
    id: String(dealId),
    ...versionPinsFromRow(stack || {}),
    journey: normalizeJourney(deal.journey_type),
    league: deal.league || 'L1',
    dealType: deal.deal_type || 'unknown',
    currentGate: deal.current_gate || '',
    activeModelStack: [...new Set(activeModelStack)],
    updatedAt: dateString(deal.updated_at),
  };
}

function readGateResource(path: string): V19GateStateArtifact {
  const match = path.match(/^([^/]+)\/([^/]+)$/);
  if (!match) throw new Error('Gate resource must be gate://{journey}/{gateId}');
  const gate = GATE_MAP[match[2]];
  if (!gate || gate.journey !== match[1]) throw new Error('Gate not found');
  const requirements = getGateV19Requirements(gate.id);
  return {
    kind: 'gate_state',
    uri: `gate://${gate.journey}/${gate.id}`,
    id: gate.id,
    ...definitiveVersionPayload(),
    gateId: gate.id,
    requiredModels: requirements.requiredModels,
    requiredCitations: requirements.requiredCitations,
    alwaysHaltTriggers: requirements.alwaysHaltTriggers,
    status: 'open',
  };
}

async function readSourceResource(userId: number, path: string): Promise<V19SourceCardArtifact> {
  const match = path.match(/^studio_source\/(\d+)$/);
  if (!match) throw new Error('Only source://studio_source/{sourceId} is currently readable');
  const [row] = await sql`
    SELECT ss.id, ss.book_id, ss.source_type, ss.source_id, ss.label, ss.citation_tag,
           ss.source_url, ss.status, sb.user_id, ss.created_at
    FROM studio_sources ss
    JOIN studio_books sb ON sb.id = ss.book_id
    WHERE ss.id = ${Number(match[1])}
    LIMIT 1
  `;
  if (!row || Number(row.user_id) !== userId) throw new Error('Source not found');
  return {
    kind: 'source_card',
    uri: `source://studio_source/${row.id}`,
    id: String(row.id),
    ...definitiveVersionPayload(),
    sourceType: row.source_type,
    label: row.label,
    status: row.status === 'linked' ? 'linked' : row.status === 'stale' ? 'stale' : 'missing',
    citationTag: row.citation_tag ?? null,
    sourceUrl: row.source_url ?? null,
    createdAt: dateString(row.created_at),
  };
}

async function assertRowAccess(userId: number, row: Record<string, any>) {
  if (row.user_id != null && Number(row.user_id) === userId) return;
  if (row.deal_id != null && await hasDealAccess(Number(row.deal_id), userId)) return;
  throw new Error('Resource not found');
}

function parseResourceUri(uri: string): { kind: string; path: string } {
  const index = uri.indexOf('://');
  return { kind: uri.slice(0, index), path: uri.slice(index + 3).replace(/^\/+/, '') };
}

function normalizeJourney(value: unknown): 'sell' | 'buy' | 'raise' | 'pmi' {
  const text = String(value || '').toLowerCase();
  return text === 'buy' || text === 'raise' || text === 'pmi' ? text : 'sell';
}

function safeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function dateString(value: unknown): string | undefined {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : String(value);
}

function versionPinsFromRow(row: Record<string, any>) {
  const defaults = definitiveVersionPayload();
  return {
    specVersion: row.spec_version || defaults.specVersion,
    specUri: row.spec_uri || defaults.specUri,
    methodologyVersion: row.methodology_version || defaults.methodologyVersion,
    methodologyUri: row.methodology_uri || defaults.methodologyUri,
  };
}

function versionPinsFromRecord(record: Record<string, any> | null | undefined) {
  const defaults = definitiveVersionPayload();
  return {
    specVersion: record?.specVersion || record?.spec_version || defaults.specVersion,
    specUri: record?.specUri || record?.spec_uri || defaults.specUri,
    methodologyVersion: record?.methodologyVersion || record?.methodology_version || defaults.methodologyVersion,
    methodologyUri: record?.methodologyUri || record?.methodology_uri || defaults.methodologyUri,
  };
}
