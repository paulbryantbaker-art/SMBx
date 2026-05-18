import { sql } from '../db.js';
import { GATE_MAP, getGateV19Requirements } from '../../shared/gateRegistry.js';
import { hasDealAccess } from './dealAccessService.js';
import { validateCitationTags, type CitationValidation } from './citationValidator.js';
import { getPitchBook, type PitchBookRecord } from './pitchBookStudio.js';

export type V19ReadinessSeverity = 'blocker' | 'warning';

export interface V19ReadinessIssue {
  code: string;
  severity: V19ReadinessSeverity;
  label: string;
  detail: string;
  resourceUri?: string;
}

export interface V19ModelReadiness {
  modelId: string;
  status: 'missing' | 'needs_inputs' | 'stale' | 'complete';
  executionId?: number;
  outputHash?: string;
  missingInputs: string[];
  createdAt?: string;
}

export interface V19DealReadiness {
  dealId: number;
  journey: string;
  gateId: string;
  gateName: string;
  requiredModels: string[];
  requiredCitations: string[];
  alwaysHaltTriggers: string[];
  models: V19ModelReadiness[];
  citationValidation: CitationValidation;
  issues: V19ReadinessIssue[];
  readyForModelBackedClaims: boolean;
  resourceUris: string[];
  checkedAt: string;
}

export interface V19StudioReadiness {
  bookId: number;
  title: string;
  format: string;
  dealReadiness?: V19DealReadiness | null;
  slideGaps: number;
  sourceGaps: number;
  modelGaps: number;
  uncheckedClaims: number;
  citationValidation: CitationValidation;
  issues: V19ReadinessIssue[];
  readyForInternalDraft: boolean;
  readyForExternalDelivery: boolean;
  resourceUris: string[];
  checkedAt: string;
}

export async function readDealV19Readiness(userId: number, dealId: number): Promise<V19DealReadiness> {
  const access = await hasDealAccess(dealId, userId);
  if (!access) throw new Error('Deal not found');

  const [deal] = await sql`
    SELECT id, journey_type, current_gate, league, deal_type, updated_at
    FROM deals
    WHERE id = ${dealId}
    LIMIT 1
  `;
  if (!deal) throw new Error('Deal not found');

  const gateId = String(deal.current_gate || '');
  const gate = GATE_MAP[gateId];
  const requirements = gate ? getGateV19Requirements(gate.id) : {
    requiredModels: [],
    requiredCitations: [],
    alwaysHaltTriggers: [],
  };
  const models = await readLatestModelStatus(
    dealId,
    requirements.requiredModels,
    deal.updated_at ? new Date(deal.updated_at) : null,
  );
  const citationValidation = await validateCitationTags(requirements.requiredCitations);
  const issues: V19ReadinessIssue[] = [
    ...models
      .filter(model => model.status !== 'complete')
      .map(model => modelIssue(model)),
    ...citationValidation.missing.map(tag => ({
      code: 'citation_validation_required',
      severity: 'blocker' as const,
      label: 'Required citation is not active',
      detail: tag,
      resourceUri: `gate://${gate?.journey || String(deal.journey_type || 'buy')}/${gateId}`,
    })),
  ];

  const journey = gate?.journey || String(deal.journey_type || 'buy');
  return {
    dealId,
    journey,
    gateId,
    gateName: gate?.name || gateId || 'Unknown gate',
    requiredModels: requirements.requiredModels,
    requiredCitations: requirements.requiredCitations,
    alwaysHaltTriggers: requirements.alwaysHaltTriggers,
    models,
    citationValidation,
    issues,
    readyForModelBackedClaims: issues.filter(issue => issue.severity === 'blocker').length === 0,
    resourceUris: [
      `deal://${dealId}/state`,
      gate ? `gate://${gate.journey}/${gate.id}` : null,
      ...models.filter(model => model.executionId).map(model => `model://execution/${model.executionId}`),
    ].filter(Boolean) as string[],
    checkedAt: new Date().toISOString(),
  };
}

export async function readStudioBookV19Readiness(userId: number, bookId: number): Promise<V19StudioReadiness> {
  const book = await getPitchBook(userId, bookId);
  if (!book) throw new Error('Pitch book not found');
  return buildStudioReadiness(userId, book);
}

export async function buildStudioReadiness(userId: number, book: PitchBookRecord): Promise<V19StudioReadiness> {
  const citationTags = collectBookCitationTags(book);
  const citationValidation = await validateCitationTags(citationTags);
  const dealReadiness = book.dealId ? await readDealV19Readiness(userId, book.dealId).catch(() => null) : null;

  const slideIssues = book.slides
    .filter(slide => slide.warningState !== 'clean')
    .map(slide => ({
      code: slide.warningState === 'stale_models' ? 'model_refresh_required' : 'source_grounding_required',
      severity: 'blocker' as const,
      label: slide.warningState === 'stale_models' ? 'Slide has stale or missing model output' : 'Slide needs source grounding',
      detail: slide.title,
      resourceUri: `studio://book/${book.id}/slide/${slide.id}`,
    }));
  const uncheckedIssues = book.slides
    .filter(slide => slide.provenance.uncheckedClaims.length > 0)
    .map(slide => ({
      code: 'unchecked_claims_present',
      severity: 'warning' as const,
      label: 'Slide has unchecked claims',
      detail: `${slide.title}: ${slide.provenance.uncheckedClaims.slice(0, 2).join(' ')}`,
      resourceUri: `studio://book/${book.id}/slide/${slide.id}`,
    }));
  const sourceIssues = book.sources
    .filter(source => source.status !== 'linked')
    .map(source => ({
      code: source.status === 'stale' ? 'source_refresh_required' : 'source_grounding_required',
      severity: 'blocker' as const,
      label: source.status === 'stale' ? 'Source is stale' : 'Source is missing',
      detail: source.label,
      resourceUri: source.id ? `source://studio_source/${source.id}` : `studio://book/${book.id}`,
    }));
  const modelIssues = book.modelOutputs
    .filter(output => output.status !== 'complete' || safeStringArray(output.missingInputs).length > 0)
    .map(output => ({
      code: 'model_refresh_required',
      severity: 'blocker' as const,
      label: 'Linked model output is not current',
      detail: `${output.modelId || 'MODEL.UNKNOWN.v1'}${safeStringArray(output.missingInputs).length ? ` needs ${safeStringArray(output.missingInputs).join(', ')}` : ''}`,
      resourceUri: output.executionId ? `model://execution/${output.executionId}` : `studio://book/${book.id}`,
    }));
  const referenceIssues = validateStudioSlideReferences(book);
  const citationIssues = citationValidation.missing.map(tag => ({
    code: 'citation_validation_required',
    severity: 'blocker' as const,
    label: 'Citation is missing or inactive',
    detail: tag,
    resourceUri: `studio://book/${book.id}`,
  }));
  const dealIssues = (dealReadiness?.issues || []).map(issue => ({
    ...issue,
    detail: `Gate ${dealReadiness?.gateId}: ${issue.detail}`,
  }));
  const issues = [...slideIssues, ...sourceIssues, ...modelIssues, ...referenceIssues, ...citationIssues, ...dealIssues, ...uncheckedIssues];
  const blockerCount = issues.filter(issue => issue.severity === 'blocker').length;

  return {
    bookId: book.id,
    title: book.title,
    format: book.format,
    dealReadiness,
    slideGaps: slideIssues.length,
    sourceGaps: sourceIssues.length,
    modelGaps: modelIssues.length + (dealReadiness?.models.filter(model => model.status !== 'complete').length || 0),
    uncheckedClaims: book.slides.reduce((sum, slide) => sum + slide.provenance.uncheckedClaims.length, 0),
    citationValidation,
    issues,
    readyForInternalDraft: true,
    readyForExternalDelivery: blockerCount === 0,
    resourceUris: [
      `studio://book/${book.id}`,
      ...book.sources.filter(source => source.id).map(source => `source://studio_source/${source.id}`),
      ...book.modelOutputs.filter(output => output.executionId).map(output => `model://execution/${output.executionId}`),
      ...(dealReadiness?.resourceUris || []),
    ],
    checkedAt: new Date().toISOString(),
  };
}

function modelIssue(model: V19ModelReadiness): V19ReadinessIssue {
  if (model.status === 'missing') {
    return {
      code: 'model_execution_required',
      severity: 'blocker',
      label: 'Required model has not run',
      detail: model.modelId,
    };
  }
  if (model.status === 'stale') {
    return {
      code: 'model_refresh_required',
      severity: 'blocker',
      label: 'Required model is older than the deal state',
      detail: model.modelId,
      resourceUri: model.executionId ? `model://execution/${model.executionId}` : undefined,
    };
  }
  return {
    code: 'model_inputs_required',
    severity: 'blocker',
    label: 'Required model needs inputs',
    detail: `${model.modelId}: ${model.missingInputs.join(', ')}`,
    resourceUri: model.executionId ? `model://execution/${model.executionId}` : undefined,
  };
}

async function readLatestModelStatus(
  dealId: number,
  requiredModels: string[],
  dealUpdatedAt: Date | null,
): Promise<V19ModelReadiness[]> {
  if (!requiredModels.length) return [];
  const rows = await sql`
    SELECT DISTINCT ON (model_id) id, model_id, status, output_hash, missing_inputs, created_at
    FROM model_executions
    WHERE deal_id = ${dealId}
      AND model_id IN ${sql(requiredModels)}
    ORDER BY model_id, created_at DESC
  `;
  const byModel = new Map((rows as any[]).map(row => [String(row.model_id), row]));
  return requiredModels.map(modelId => {
    const row = byModel.get(modelId);
    if (!row) {
      return { modelId, status: 'missing', missingInputs: [] };
    }
    const createdAt = row.created_at instanceof Date ? row.created_at : new Date(row.created_at);
    const stale = dealUpdatedAt && Number.isFinite(createdAt.getTime()) && createdAt < dealUpdatedAt;
    return {
      modelId,
      status: stale ? 'stale' : row.status === 'complete' ? 'complete' : 'needs_inputs',
      executionId: Number(row.id),
      outputHash: row.output_hash || undefined,
      missingInputs: safeStringArray(row.missing_inputs),
      createdAt: Number.isFinite(createdAt.getTime()) ? createdAt.toISOString() : String(row.created_at),
    };
  });
}

function collectBookCitationTags(book: PitchBookRecord): string[] {
  return [...new Set([
    ...book.sources.map(source => source.citationTag).filter(Boolean),
    ...book.slides.flatMap(slide => slide.provenance.citationsUsed),
    ...book.modelOutputs.flatMap(output => Array.isArray(output.citationTags) ? output.citationTags : []),
  ])] as string[];
}

function validateStudioSlideReferences(book: PitchBookRecord): V19ReadinessIssue[] {
  const linkedSources = book.sources.filter(source => source.status === 'linked');
  const hasDealRecord = linkedSources.some(source => source.sourceType === 'deal_record');
  const hasDataRoomDocument = linkedSources.some(source => source.sourceType === 'data_room_document');
  const linkedCitationTags = new Set(book.sources.map(source => source.citationTag).filter(Boolean).map(String));
  const modelById = new Map(book.modelOutputs.map(output => [String(output.modelId || ''), output]));
  const issues: V19ReadinessIssue[] = [];

  for (const slide of book.slides) {
    const provenance = slide.provenance || { factsUsed: [], modelOutputsUsed: [], citationsUsed: [], uncheckedClaims: [] };
    const modelRefs = safeStringArray(provenance.modelOutputsUsed);
    for (const modelId of modelRefs) {
      const output = modelById.get(modelId);
      if (!output) {
        issues.push({
          code: 'model_reference_missing',
          severity: 'blocker',
          label: 'Slide references a model output that is not attached',
          detail: `${slide.title}: ${modelId}`,
          resourceUri: `studio://book/${book.id}/slide/${slide.id}`,
        });
      }
    }

    const citationRefs = safeStringArray(provenance.citationsUsed);
    for (const citeTag of citationRefs) {
      if (!linkedCitationTags.has(citeTag)) {
        issues.push({
          code: 'citation_reference_missing',
          severity: 'blocker',
          label: 'Slide references a citation without a source card',
          detail: `${slide.title}: ${citeTag}`,
          resourceUri: `studio://book/${book.id}/slide/${slide.id}`,
        });
      }
    }

    const factRefs = safeStringArray(provenance.factsUsed);
    if (factRefs.length && !hasDealRecord && !hasDataRoomDocument) {
      issues.push({
        code: 'fact_source_missing',
        severity: 'blocker',
        label: 'Slide facts need a deal record or source file',
        detail: `${slide.title}: ${factRefs.slice(0, 2).join('; ')}`,
        resourceUri: `studio://book/${book.id}/slide/${slide.id}`,
      });
    }

    if (containsMetricLanguage(slide) && !factRefs.length && !modelRefs.length && !citationRefs.length) {
      issues.push({
        code: 'unsupported_metric_present',
        severity: 'blocker',
        label: 'Slide has a metric claim without facts, models, or citations',
        detail: slide.title,
        resourceUri: `studio://book/${book.id}/slide/${slide.id}`,
      });
    }
  }

  return issues;
}

function containsMetricLanguage(slide: Pick<PitchBookRecord['slides'][number], 'title' | 'body' | 'bullets' | 'speakerNotes'>): boolean {
  const text = [
    slide.title,
    slide.body,
    ...(Array.isArray(slide.bullets) ? slide.bullets : []),
    slide.speakerNotes,
  ].join(' ');
  return /\$|%|\b(revenue|sde|ebitda|earnings|valuation|multiple|dscr|nwc|working capital|purchase price|enterprise value|moic|irr|debt service|add-back|addback)\b/i.test(text);
}

function safeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}
