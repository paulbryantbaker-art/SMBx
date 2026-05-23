import { createHash } from 'crypto';
import { sql } from '../db.js';
import {
  DEFINITIVE_METHODOLOGY_URI,
  DEFINITIVE_METHODOLOGY_VERSION,
  DEFINITIVE_SPEC_URI,
  DEFINITIVE_SPEC_VERSION,
  definitiveVersionPayload,
} from '../constants/definitive.js';
import { hasDealAccess } from './dealAccessService.js';
import { createDefinitiveHash } from './definitiveAuditPacket.js';
import { validateCitationTags } from './citationValidator.js';
import { resolveDefinitiveMandateContext } from './definitiveMandateService.js';
import { executeV19Model, persistV19ModelExecution, type V19ModelExecution } from './v19ModelRuntime.js';
import type { V19StudioReadiness } from './v19ReadinessService.js';

export type PitchBookFormat =
  | 'buyer-pitch-book'
  | 'seller-pitch-book'
  | 'ic-deck'
  | 'qoe-preview-book'
  | 'cim-summary-deck'
  | 'board-update'
  | 'lender-book';

export interface StudioSlide {
  id: string;
  title: string;
  subtitle?: string;
  body: string;
  bullets: string[];
  speakerNotes: string;
  provenance: {
    factsUsed: string[];
    modelOutputsUsed: string[];
    citationsUsed: string[];
    uncheckedClaims: string[];
  };
  warningState: 'clean' | 'needs_sources' | 'stale_models';
}

export interface StudioSource {
  id?: number;
  sourceType: string;
  sourceId?: string | null;
  label: string;
  citationTag?: string | null;
  sourceUrl?: string | null;
  status: 'linked' | 'missing' | 'stale';
  metadata?: Record<string, any>;
}

export interface PitchBookRecord {
  id: number;
  dealId: number | null;
  title: string;
  format: PitchBookFormat;
  status: string;
  brief: string | null;
  versionId: number | null;
  version: number;
  outline: string[];
  slides: StudioSlide[];
  assumptions: Array<Record<string, any>>;
  modelOutputs: Array<Record<string, any>>;
  provenance: Record<string, any>;
  audit: Record<string, any>;
  sources: StudioSource[];
  updatedAt: string;
  createdAt: string;
}

interface CreatePitchBookInput {
  userId: number;
  dealId?: number | null;
  format?: string | null;
  title?: string | null;
  brief?: string | null;
}

interface RevisePitchBookInput {
  userId: number;
  bookId: number;
  instruction: string;
}

interface AddSectionInput {
  userId: number;
  bookId: number;
  title: string;
  body?: string | null;
  bullets?: string[];
}

const FORMAT_LABELS: Record<PitchBookFormat, string> = {
  'buyer-pitch-book': 'Buyer Pitch Book',
  'seller-pitch-book': 'Seller Pitch Book',
  'ic-deck': 'IC Deck',
  'qoe-preview-book': 'QoE Preview Book',
  'cim-summary-deck': 'CIM Summary Deck',
  'board-update': 'Board Update',
  'lender-book': 'Lender Book',
};

const FORMAT_OUTLINES: Record<PitchBookFormat, string[]> = {
  'buyer-pitch-book': ['Mandate', 'Target read', 'Market map', 'Valuation frame', 'Risks', 'Next actions'],
  'seller-pitch-book': ['Positioning', 'Business overview', 'Financial profile', 'Buyer universe', 'Process plan', 'Next actions'],
  'ic-deck': ['Decision ask', 'Thesis', 'Financial profile', 'Returns frame', 'Risks', 'Approval path'],
  'qoe-preview-book': ['QoE read', 'Normalized earnings', 'Add-back defense', 'Working capital', 'Red flags', 'Diligence asks'],
  'cim-summary-deck': ['Investment highlights', 'Company profile', 'Market position', 'Financial summary', 'Growth levers', 'Process'],
  'board-update': ['Portfolio read', 'Deals in motion', 'Key changes', 'Decisions needed', 'Risks', 'Next week'],
  'lender-book': ['Borrower profile', 'Sources and uses', 'Cash flow support', 'Collateral and guarantees', 'Risks', 'Credit ask'],
};

const FORMAT_MODELS: Record<PitchBookFormat, string[]> = {
  'buyer-pitch-book': ['MODEL.VAL.TRIANGULATION.v1', 'MODEL.DSCR.STRESS.v1', 'MODEL.SOURCES.USES.v1'],
  'seller-pitch-book': ['MODEL.VAL.TRIANGULATION.v1', 'MODEL.STRUCT.NWC.PEG.v1'],
  'ic-deck': ['MODEL.VAL.TRIANGULATION.v1', 'MODEL.LBO.LMM.v1', 'MODEL.SOURCES.USES.v1'],
  'qoe-preview-book': ['MODEL.QOE.LITE.v1', 'MODEL.VAL.EBITDA.v1', 'MODEL.STRUCT.NWC.PEG.v1', 'MODEL.DSCR.STRESS.v1'],
  'cim-summary-deck': ['MODEL.VAL.TRIANGULATION.v1', 'MODEL.STRUCT.NWC.PEG.v1'],
  'board-update': ['MODEL.DEALKILL.PROB.v1', 'MODEL.TIMELINE.MC.v1'],
  'lender-book': ['MODEL.LBO.SBA.v1', 'MODEL.DSCR.STRESS.v1', 'MODEL.SOURCES.USES.v1'],
};

export function normalizePitchBookFormat(value?: string | null): PitchBookFormat {
  const normalized = String(value || '').trim().toLowerCase().replace(/[\s_]+/g, '-');
  if (normalized in FORMAT_LABELS) return normalized as PitchBookFormat;
  if (normalized === 'qoe' || normalized === 'qoe-preview') return 'qoe-preview-book';
  if (normalized === 'pitch-book') return 'buyer-pitch-book';
  if (normalized === 'deck') return 'ic-deck';
  return 'buyer-pitch-book';
}

export function listPitchBookFormats() {
  return Object.entries(FORMAT_LABELS).map(([id, label]) => ({
    id,
    label,
    outline: FORMAT_OUTLINES[id as PitchBookFormat],
    models: FORMAT_MODELS[id as PitchBookFormat],
  }));
}

export function getPitchBookModelIds(book: Pick<PitchBookRecord, 'format' | 'modelOutputs'>): string[] {
  return [...new Set([
    ...FORMAT_MODELS[book.format],
    ...book.modelOutputs.map(output => String(output.modelId || '')).filter(Boolean),
  ])];
}

export async function listPitchBooks(userId: number): Promise<PitchBookRecord[]> {
  const rows = await sql`
    SELECT b.id, b.deal_id, b.title, b.format, b.status, b.brief,
           b.created_at, b.updated_at, v.id as version_id, v.version,
           v.outline, v.slides, v.assumptions, v.model_outputs, v.provenance, v.audit
    FROM studio_books b
    LEFT JOIN studio_book_versions v ON v.id = b.current_version_id
    WHERE b.user_id = ${userId}
    ORDER BY b.updated_at DESC
    LIMIT 50
  `;
  const out: PitchBookRecord[] = [];
  for (const row of rows as any[]) {
    out.push(await hydratePitchBookRow(row));
  }
  return out;
}

export async function getPitchBook(userId: number, bookId: number): Promise<PitchBookRecord | null> {
  const [row] = await sql`
    SELECT b.id, b.deal_id, b.title, b.format, b.status, b.brief,
           b.created_at, b.updated_at, v.id as version_id, v.version,
           v.outline, v.slides, v.assumptions, v.model_outputs, v.provenance, v.audit
    FROM studio_books b
    LEFT JOIN studio_book_versions v ON v.id = b.current_version_id
    WHERE b.id = ${bookId} AND b.user_id = ${userId}
    LIMIT 1
  `;
  return row ? hydratePitchBookRow(row) : null;
}

export async function createPitchBook(input: CreatePitchBookInput): Promise<PitchBookRecord> {
  const format = normalizePitchBookFormat(input.format);
  const deal = input.dealId ? await readAccessibleDeal(input.userId, input.dealId) : null;
  const title = cleanTitle(input.title)
    || `${deal?.business_name || FORMAT_LABELS[format]} - ${FORMAT_LABELS[format]}`;
  const brief = input.brief?.trim() || defaultBrief(format, deal);
  const sources = await buildSources(format, deal?.id ?? null);
  const slides = buildSlides(format, deal, brief, sources);
  const assumptions = buildAssumptions(format, deal);
  const modelOutputs = FORMAT_MODELS[format].map(modelId => ({
    modelId,
    status: 'not_run',
    reason: 'Server-side V19 execution is queued for the next runtime run.',
  }));
  const audit = buildAudit({ format, slides, assumptions, modelOutputs, sources, action: 'create_pitch_book' });

  const [book] = await sql`
    INSERT INTO studio_books (user_id, deal_id, title, format, brief, status)
    VALUES (${input.userId}, ${deal?.id ?? null}, ${title}, ${format}, ${brief}, 'draft')
    RETURNING *
  `;
  const version = await insertVersion(Number(book.id), title, FORMAT_OUTLINES[format], slides, assumptions, modelOutputs, audit, 'yulia');
  await insertSources(Number(book.id), version.id, sources);
  await sql`
    UPDATE studio_books
    SET current_version_id = ${version.id}, updated_at = NOW()
    WHERE id = ${book.id}
  `;

  const created = await getPitchBook(input.userId, Number(book.id));
  if (!created) throw new Error('Pitch book was created but could not be read back');
  return created;
}

export async function revisePitchBook(input: RevisePitchBookInput): Promise<PitchBookRecord> {
  const current = await getPitchBook(input.userId, input.bookId);
  if (!current) throw new Error('Pitch book not found');
  const instruction = input.instruction.trim();
  if (!instruction) throw new Error('Revision instruction is required');

  const slides: StudioSlide[] = current.slides.map((slide, index) => index === 0
    ? {
        ...slide,
        speakerNotes: `${slide.speakerNotes}\nRevision brief: ${instruction}`,
        provenance: {
          ...slide.provenance,
          uncheckedClaims: [...slide.provenance.uncheckedClaims, 'Revision narrative requires human/source review.'],
        },
        warningState: slide.warningState === 'stale_models' ? 'stale_models' as const : 'needs_sources' as const,
      }
    : slide
  );
  const audit = buildAudit({
    format: current.format,
    slides,
    assumptions: current.assumptions,
    modelOutputs: current.modelOutputs,
    sources: current.sources,
    action: 'revise_pitch_book',
    instruction,
  });
  const version = await insertVersion(
    current.id,
    current.title,
    current.outline,
    slides,
    current.assumptions,
    current.modelOutputs,
    audit,
    'yulia',
  );
  await cloneSources(current.id, current.versionId, version.id);
  await sql`UPDATE studio_books SET current_version_id = ${version.id}, updated_at = NOW() WHERE id = ${current.id}`;
  const revised = await getPitchBook(input.userId, current.id);
  if (!revised) throw new Error('Pitch book revision could not be read back');
  return revised;
}

export async function addPitchBookSection(input: AddSectionInput): Promise<PitchBookRecord> {
  const current = await getPitchBook(input.userId, input.bookId);
  if (!current) throw new Error('Pitch book not found');
  const title = cleanTitle(input.title);
  if (!title) throw new Error('Section title is required');

  const slide: StudioSlide = {
    id: `slide-${Date.now().toString(36)}`,
    title,
    body: input.body?.trim() || 'New section added from Studio. Replace with source-grounded copy before export.',
    bullets: (input.bullets || []).filter(Boolean).slice(0, 5),
    speakerNotes: 'Added by Yulia. Needs source review before external use.',
    provenance: {
      factsUsed: [],
      modelOutputsUsed: [],
      citationsUsed: [],
      uncheckedClaims: ['New section has not been source-grounded yet.'],
    },
    warningState: 'needs_sources',
  };
  const slides = [...current.slides, slide];
  const outline = [...current.outline, title];
  const audit = buildAudit({
    format: current.format,
    slides,
    assumptions: current.assumptions,
    modelOutputs: current.modelOutputs,
    sources: current.sources,
    action: 'add_pitch_book_section',
  });
  const version = await insertVersion(current.id, current.title, outline, slides, current.assumptions, current.modelOutputs, audit, 'user');
  await cloneSources(current.id, current.versionId, version.id);
  await sql`UPDATE studio_books SET current_version_id = ${version.id}, updated_at = NOW() WHERE id = ${current.id}`;
  const updated = await getPitchBook(input.userId, current.id);
  if (!updated) throw new Error('Pitch book section update could not be read back');
  return updated;
}

export async function refreshPitchBookFromModels(userId: number, bookId: number): Promise<PitchBookRecord> {
  const current = await getPitchBook(userId, bookId);
  if (!current) throw new Error('Pitch book not found');
  const deal = current.dealId ? await readAccessibleDeal(userId, current.dealId) : null;
  const modelIds = getPitchBookModelIds(current);
  const executions: V19ModelExecution[] = [];
  const modelOutputs: Array<Record<string, any>> = [];
  for (const modelId of modelIds) {
    const execution = await executeV19Model({
      modelId,
      dealId: current.dealId,
      userId,
      input: buildModelInput(modelId, current, deal),
    });
    const executionRecord = await persistV19ModelExecution(execution, {
      studioBookId: current.id,
      toolName: 'refresh_pitch_book_from_models',
    });
    executions.push(execution);
    modelOutputs.push({
      executionId: executionRecord.id,
      modelId: execution.modelId,
      version: execution.version,
      status: execution.status,
      outputs: execution.outputs,
      missingInputs: execution.missingInputs,
      citationTags: execution.citationTags,
      outputHash: execution.outputHash,
      auditPayload: execution.auditPayload,
      refreshedAt: execution.auditPayload.executedAt,
    });
  }
  const executionByModel = new Map(modelOutputs.map(output => [output.modelId, output]));
  const slides = current.slides.map(slide => {
    const linked = slide.provenance.modelOutputsUsed
      .map(modelId => executionByModel.get(modelId))
      .filter(Boolean) as typeof modelOutputs;
    const missingInputs = linked.flatMap(output => output.missingInputs || []);
    const staleMessages = missingInputs.length
      ? [`Missing model inputs: ${[...new Set(missingInputs)].join(', ')}.`]
      : [];
    const uncheckedClaims = [
      ...slide.provenance.uncheckedClaims.filter(claim => !/Linked model output needs V19 runtime execution|Missing model inputs:/i.test(claim)),
      ...staleMessages,
    ];
    return {
      ...slide,
      warningState: missingInputs.length
        ? 'stale_models' as const
        : (slide.provenance.factsUsed.length ? 'clean' as const : 'needs_sources' as const),
      provenance: {
        ...slide.provenance,
        citationsUsed: [...new Set([
          ...slide.provenance.citationsUsed,
          ...linked.flatMap(output => output.citationTags || []),
        ])],
        uncheckedClaims,
      },
    };
  });
  const audit = buildAudit({
    format: current.format,
    slides,
    assumptions: current.assumptions,
    modelOutputs,
    sources: current.sources,
    action: 'refresh_pitch_book_from_models',
    modelExecutionHashes: executions.map(execution => execution.outputHash),
  });
  const version = await insertVersion(current.id, current.title, current.outline, slides, current.assumptions, modelOutputs, audit, 'yulia');
  await cloneSources(current.id, current.versionId, version.id);
  await sql`UPDATE studio_books SET current_version_id = ${version.id}, updated_at = NOW() WHERE id = ${current.id}`;
  await writeStudioAuditTrail({
    userId,
    book: current,
    versionId: version.id,
    action: 'refresh_pitch_book_from_models',
    modelOutputs,
    outputHash: audit.inputHash,
  });
  const refreshed = await getPitchBook(userId, current.id);
  if (!refreshed) throw new Error('Pitch book refresh could not be read back');
  return refreshed;
}

export async function recordPitchBookExport(
  userId: number,
  bookId: number,
  format: 'pptx' | 'pdf',
  buffer: Buffer,
  options: {
    strict?: boolean;
    readiness?: V19StudioReadiness | null;
  } = {},
): Promise<{ exportId: number; outputHash: string; auditPacketHash: string }> {
  const book = await getPitchBook(userId, bookId);
  if (!book) throw new Error('Pitch book not found');
  const outputHash = createHash('sha256').update(buffer).digest('hex');
  const citationValidation = await validateCitationTags(collectBookCitationTags(book));
  const warnings = buildExportWarnings(book, citationValidation, options.readiness || null);
  const auditPacket = buildStudioExportAuditPacket({
    book,
    format,
    outputHash,
    citationValidation,
    warnings,
    strict: Boolean(options.strict),
    readiness: options.readiness || null,
  });
  const [row] = await sql`
    INSERT INTO studio_exports (
      book_id, version_id, format, status, output_hash, metadata,
      spec_version, spec_uri, methodology_version, methodology_uri
    )
    VALUES (
      ${book.id},
      ${book.versionId},
      ${format},
      ${warnings.length ? 'ready_with_warnings' : 'ready'},
      ${outputHash},
      ${sql.json({
        title: book.title,
        slideCount: book.slides.length,
        exportedAt: new Date().toISOString(),
        citationValidation,
        warnings,
        auditPacket,
        ...definitiveVersionPayload(),
      } as any)}::jsonb
      ,
      ${DEFINITIVE_SPEC_VERSION},
      ${DEFINITIVE_SPEC_URI},
      ${DEFINITIVE_METHODOLOGY_VERSION},
      ${DEFINITIVE_METHODOLOGY_URI}
    )
    RETURNING id
  `;
  await writeStudioAuditTrail({
    userId,
    book,
    versionId: book.versionId,
    action: `export_pitch_book:${format}`,
    modelOutputs: book.modelOutputs,
    outputHash,
    citationsValidated: citationValidation,
    warnings,
  });
  return {
    exportId: Number(row.id),
    outputHash,
    auditPacketHash: String(auditPacket.auditPacketHash || ''),
  };
}

export async function getPitchBookExportAuditPacket(
  userId: number,
  bookId: number,
  exportId?: number | null,
): Promise<Record<string, any> | null> {
  const rows = exportId
    ? await sql`
        SELECT e.id, e.book_id, e.version_id, e.format, e.status, e.output_hash, e.metadata,
               e.spec_version, e.spec_uri, e.methodology_version, e.methodology_uri, e.created_at
        FROM studio_exports e
        JOIN studio_books b ON b.id = e.book_id
        WHERE b.user_id = ${userId}
          AND e.book_id = ${bookId}
          AND e.id = ${exportId}
        LIMIT 1
      `
    : await sql`
        SELECT e.id, e.book_id, e.version_id, e.format, e.status, e.output_hash, e.metadata,
               e.spec_version, e.spec_uri, e.methodology_version, e.methodology_uri, e.created_at
        FROM studio_exports e
        JOIN studio_books b ON b.id = e.book_id
        WHERE b.user_id = ${userId}
          AND e.book_id = ${bookId}
        ORDER BY e.created_at DESC
        LIMIT 1
      `;
  const row = (rows as any[])[0];
  if (!row) return null;
  const metadata = safeRecord(row.metadata);
  return {
    exportId: Number(row.id),
    bookId: Number(row.book_id),
    versionId: row.version_id == null ? null : Number(row.version_id),
    format: row.format,
    status: row.status,
    outputHash: row.output_hash,
    specVersion: row.spec_version,
    specUri: row.spec_uri,
    methodologyVersion: row.methodology_version,
    methodologyUri: row.methodology_uri,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    auditPacket: metadata.auditPacket || null,
  };
}

export function buildStudioExportAuditPacket(input: {
  book: PitchBookRecord;
  format: 'pptx' | 'pdf';
  outputHash: string;
  citationValidation: Record<string, any>;
  warnings: string[];
  strict?: boolean;
  readiness?: V19StudioReadiness | null;
}): Record<string, any> {
  const sourceManifest = input.book.sources.map(source => ({
    id: source.id ?? null,
    sourceType: source.sourceType,
    sourceId: source.sourceId ?? null,
    label: source.label,
    citationTag: source.citationTag ?? null,
    status: source.status,
    sourceUrl: source.sourceUrl ?? null,
    metadataHash: createDefinitiveHash(safeRecord(source.metadata)),
  }));

  const modelManifest = input.book.modelOutputs.map(output => ({
    executionId: output.executionId ?? null,
    modelId: output.modelId ?? null,
    version: output.version ?? null,
    status: output.status ?? null,
    citationTags: safeArray(output.citationTags),
    missingInputs: safeArray(output.missingInputs),
    outputHash: output.outputHash ?? null,
    auditPayloadHash: output.auditPayload ? createDefinitiveHash(output.auditPayload) : null,
  }));

  const slideProvenance = input.book.slides.map((slide, index) => ({
    slideId: slide.id,
    slideNumber: index + 1,
    title: slide.title,
    warningState: slide.warningState,
    factsUsed: slide.provenance.factsUsed,
    modelOutputsUsed: slide.provenance.modelOutputsUsed,
    citationsUsed: slide.provenance.citationsUsed,
    uncheckedClaims: slide.provenance.uncheckedClaims,
    speakerNotesHash: createDefinitiveHash({ speakerNotes: slide.speakerNotes }),
  }));

  const inputManifest = {
    ...definitiveVersionPayload(),
    bookId: input.book.id,
    versionId: input.book.versionId,
    version: input.book.version,
    title: input.book.title,
    bookFormat: input.book.format,
    exportFormat: input.format,
    outline: input.book.outline,
    slides: input.book.slides.map(slide => ({
      id: slide.id,
      title: slide.title,
      subtitle: slide.subtitle ?? null,
      body: slide.body,
      bullets: slide.bullets,
      provenance: slide.provenance,
      warningState: slide.warningState,
    })),
    assumptions: input.book.assumptions,
    sourceManifest,
    modelManifest,
  };
  const inputHash = createDefinitiveHash(inputManifest);
  const status = input.warnings.length ? 'ready_with_warnings' : 'ready';
  const readiness = formatStudioReadinessForAudit(input.readiness || null);
  const packetCore = {
    schemaVersion: 'studio-export-audit-v1',
    ...definitiveVersionPayload(),
    line: 'compute_only',
    exportBoundary: {
      strictMode: Boolean(input.strict),
      noCounterpartyTransmission: true,
      noLegalOrTaxOpinion: true,
      noRecommendationOrNegotiation: true,
      userControlledDelivery: true,
      invariant: 'Studio export is software work product. The user controls external use; counsel, advisors, specialists, boards, LPs, or courts make professional determinations.',
    },
    book: {
      id: input.book.id,
      dealId: input.book.dealId,
      versionId: input.book.versionId,
      version: input.book.version,
      title: input.book.title,
      format: input.book.format,
      status: input.book.status,
    },
    export: {
      format: input.format,
      status,
      outputHash: input.outputHash,
      inputHash,
    },
    readiness,
    counts: {
      slides: input.book.slides.length,
      sources: input.book.sources.length,
      assumptions: input.book.assumptions.length,
      modelOutputs: input.book.modelOutputs.length,
      warnings: input.warnings.length,
    },
    slideProvenance,
    sourceManifest,
    modelManifest,
    citationValidation: input.citationValidation,
    warnings: input.warnings,
  };

  return {
    ...packetCore,
    auditPacketHash: createDefinitiveHash(packetCore),
    generatedAt: new Date().toISOString(),
  };
}

export function pitchBookToExportContent(book: PitchBookRecord): Record<string, any> {
  return {
    company_name: book.title,
    subtitle: FORMAT_LABELS[book.format],
    contact_email: 'Prepared with smbx.ai',
    slides: book.slides.map(slide => ({
      title: slide.title,
      subtitle: slide.subtitle,
      body: slide.body,
      bullets: slide.bullets,
      speaker_notes: slide.speakerNotes,
      provenance: slide.provenance,
      warningState: slide.warningState,
    })),
    sections: [
      ...book.slides.map(slide => ({
        title: slide.title,
        body: slide.body,
        bullets: slide.bullets,
        notes: slide.speakerNotes,
      })),
      {
        title: 'Source appendix',
        table: book.sources.map(source => ({
          Source: source.label,
          Type: source.sourceType,
          Citation: source.citationTag || '-',
          Status: source.status,
        })),
      },
      {
        title: 'Audit appendix',
        body: `Version ${book.version}. Output hash is generated at export. Model outputs are tracked per slide and should be refreshed before external delivery.`,
        bullets: [
          `${book.slides.length} slides`,
          `${book.sources.length} linked sources`,
          `${book.modelOutputs.length} model slots`,
        ],
      },
    ],
  };
}

async function readAccessibleDeal(userId: number, dealId: number): Promise<Record<string, any>> {
  const access = await hasDealAccess(dealId, userId);
  if (!access) throw new Error('Deal not found');
  const [deal] = await sql`SELECT * FROM deals WHERE id = ${dealId} LIMIT 1`;
  if (!deal) throw new Error('Deal not found');
  return deal as Record<string, any>;
}

async function hydratePitchBookRow(row: any): Promise<PitchBookRecord> {
  const sources = await sql`
    SELECT id, source_type, source_id, label, citation_tag, source_url, status, metadata
    FROM studio_sources
    WHERE book_id = ${row.id}
      AND (${row.version_id}::bigint IS NULL OR version_id = ${row.version_id})
    ORDER BY id ASC
  `;
  return {
    id: Number(row.id),
    dealId: row.deal_id == null ? null : Number(row.deal_id),
    title: row.title,
    format: normalizePitchBookFormat(row.format),
    status: row.status,
    brief: row.brief,
    versionId: row.version_id == null ? null : Number(row.version_id),
    version: Number(row.version || 1),
    outline: safeArray(row.outline),
    slides: safeArray(row.slides) as StudioSlide[],
    assumptions: safeArray(row.assumptions),
    modelOutputs: safeArray(row.model_outputs),
    provenance: safeRecord(row.provenance),
    audit: safeRecord(row.audit),
    sources: (sources as any[]).map(source => ({
      id: Number(source.id),
      sourceType: source.source_type,
      sourceId: source.source_id,
      label: source.label,
      citationTag: source.citation_tag,
      sourceUrl: source.source_url,
      status: source.status,
      metadata: safeRecord(source.metadata),
    })),
    updatedAt: row.updated_at?.toISOString?.() || String(row.updated_at),
    createdAt: row.created_at?.toISOString?.() || String(row.created_at),
  };
}

async function insertVersion(
  bookId: number,
  title: string,
  outline: string[],
  slides: StudioSlide[],
  assumptions: Array<Record<string, any>>,
  modelOutputs: Array<Record<string, any>>,
  audit: Record<string, any>,
  createdBy: string,
): Promise<{ id: number; version: number }> {
  const [next] = await sql<{ version: number }[]>`
    SELECT (COALESCE(MAX(version), 0) + 1)::int as version
    FROM studio_book_versions
    WHERE book_id = ${bookId}
  `;
  const version = Number(next?.version || 1);
  const [row] = await sql`
    INSERT INTO studio_book_versions (
      book_id, version, title, outline, slides, assumptions, model_outputs, provenance,
      audit, speaker_notes, created_by, spec_version, spec_uri, methodology_version, methodology_uri
    )
    VALUES (
      ${bookId},
      ${version},
      ${title},
      ${sql.json(outline)}::jsonb,
      ${sql.json(slides as any)}::jsonb,
      ${sql.json(assumptions)}::jsonb,
      ${sql.json(modelOutputs)}::jsonb,
      ${sql.json(buildProvenance(slides))}::jsonb,
      ${sql.json({ ...audit, ...definitiveVersionPayload() })}::jsonb,
      ${sql.json(slides.map(slide => ({ slideId: slide.id, notes: slide.speakerNotes })))}::jsonb,
      ${createdBy},
      ${DEFINITIVE_SPEC_VERSION},
      ${DEFINITIVE_SPEC_URI},
      ${DEFINITIVE_METHODOLOGY_VERSION},
      ${DEFINITIVE_METHODOLOGY_URI}
    )
    RETURNING id, version
  `;
  return { id: Number(row.id), version: Number(row.version) };
}

async function insertSources(bookId: number, versionId: number, sources: StudioSource[]): Promise<void> {
  for (const source of sources) {
    await sql`
      INSERT INTO studio_sources (
        book_id, version_id, source_type, source_id, label, citation_tag, source_url, status, metadata
      )
      VALUES (
        ${bookId},
        ${versionId},
        ${source.sourceType},
        ${source.sourceId ?? null},
        ${source.label},
        ${source.citationTag ?? null},
        ${source.sourceUrl ?? null},
        ${source.status},
        ${sql.json(source.metadata || {})}::jsonb
      )
    `;
  }
}

async function cloneSources(bookId: number, fromVersionId: number | null, toVersionId: number): Promise<void> {
  if (!fromVersionId) return;
  await sql`
    INSERT INTO studio_sources (
      book_id, version_id, source_type, source_id, label, citation_tag, source_url, status, metadata
    )
    SELECT book_id, ${toVersionId}, source_type, source_id, label, citation_tag, source_url, status, metadata
    FROM studio_sources
    WHERE book_id = ${bookId} AND version_id = ${fromVersionId}
  `;
}

async function buildSources(format: PitchBookFormat, dealId: number | null): Promise<StudioSource[]> {
  const sources: StudioSource[] = [
    {
      sourceType: 'methodology',
      label: `V19 ${FORMAT_LABELS[format]} template`,
      citationTag: null,
      status: 'linked',
      metadata: { format, models: FORMAT_MODELS[format] },
    },
  ];

  if (dealId) {
    sources.push({
      sourceType: 'deal_record',
      sourceId: String(dealId),
      label: 'Deal record',
      status: 'linked',
      metadata: { dealId },
    });

    const docs = await sql`
      SELECT id, name, file_type, status, updated_at
      FROM data_room_documents
      WHERE deal_id = ${dealId}
      ORDER BY updated_at DESC
      LIMIT 8
    `.catch(() => []);

    for (const doc of docs as any[]) {
      sources.push({
        sourceType: 'data_room_document',
        sourceId: String(doc.id),
        label: doc.name,
        status: doc.status === 'locked' || doc.status === 'approved' ? 'linked' : 'missing',
        metadata: { fileType: doc.file_type, documentStatus: doc.status },
      });
    }
  }

  for (const citeTag of citationTagsForFormat(format)) {
    sources.push({
      sourceType: 'citation',
      label: citeTag.replace(/^\[|\]$/g, ''),
      citationTag: citeTag,
      status: 'linked',
    });
  }

  return sources;
}

function buildSlides(format: PitchBookFormat, deal: Record<string, any> | null, brief: string, sources: StudioSource[] = []): StudioSlide[] {
  const facts = [...dealFacts(deal), ...sourceFacts(sources)];
  return FORMAT_OUTLINES[format].map((title, index) => {
    const citations = index === 0 ? citationTagsForFormat(format).slice(0, 2) : [];
    const factsUsed = factsForSlide(title, facts, index);
    return {
      id: `slide-${index + 1}`,
      title,
      subtitle: index === 0 ? FORMAT_LABELS[format] : undefined,
      body: bodyForSlide(format, title, facts, brief),
      bullets: bulletsForSlide(format, title, facts),
      speakerNotes: `Use this slide to make the ${title.toLowerCase()} decision-ready. Confirm unsupported claims before external delivery.`,
      provenance: {
        factsUsed,
        modelOutputsUsed: FORMAT_MODELS[format].slice(0, index < 3 ? 2 : 1),
        citationsUsed: citations,
        uncheckedClaims: factsUsed.length ? [] : ['Needs deal facts or uploaded source files.'],
      },
      warningState: factsUsed.length ? 'clean' : 'needs_sources',
    };
  });
}

function bodyForSlide(format: PitchBookFormat, title: string, facts: string[], brief: string): string {
  if (format === 'qoe-preview-book') {
    if (/add-back/i.test(title)) return 'Separate defended add-backs from management adjustments that still need source support.';
    if (/working capital/i.test(title)) return 'Frame the NWC peg and flag the months, seasonality, and closing-balance proof still needed.';
    if (/red flags/i.test(title)) return 'Show only observable diligence risks. Do not infer fraud or legal conclusions.';
  }
  if (/decision|ask|next/i.test(title)) return 'Give Yulia a clean decision, the open diligence asks, and the next action owner.';
  if (/financial|valuation|cash flow|returns/i.test(title)) return 'Use model-backed values only. Refresh linked V19 models before external export.';
  return brief || facts[0] || 'Source-grounded pitch book section. Add deal files, model outputs, or citations before external use.';
}

function bulletsForSlide(format: PitchBookFormat, title: string, facts: string[]): string[] {
  const base = facts.length ? facts.slice(0, 3) : ['Add source files', 'Run V19 models', 'Validate citations'];
  if (format === 'qoe-preview-book' && /diligence/i.test(title)) {
    return ['Request monthly P&L support', 'Tie add-backs to documents', 'Refresh NWC and DSCR models'];
  }
  return base;
}

function buildAssumptions(format: PitchBookFormat, deal: Record<string, any> | null): Array<Record<string, any>> {
  return [
    { key: 'format', label: 'Book format', value: FORMAT_LABELS[format], source: 'studio_template' },
    { key: 'league', label: 'League', value: deal?.league || 'unclassified', source: deal ? 'deal_record' : 'missing' },
    { key: 'journey', label: 'Journey', value: deal?.journey_type || 'unknown', source: deal ? 'deal_record' : 'missing' },
    { key: 'currency', label: 'Currency', value: 'USD cents in database', source: 'system' },
  ];
}

function dealFacts(deal: Record<string, any> | null): string[] {
  if (!deal) return [];
  return [
    deal.business_name && `Company: ${deal.business_name}`,
    deal.industry && `Industry: ${deal.industry}`,
    deal.location && `Location: ${deal.location}`,
    deal.league && `League: ${deal.league}`,
    deal.revenue && `Revenue: ${formatCents(deal.revenue)}`,
    deal.sde && `SDE: ${formatCents(deal.sde)}`,
    deal.ebitda && `EBITDA: ${formatCents(deal.ebitda)}`,
    deal.asking_price && `Asking price: ${formatCents(deal.asking_price)}`,
  ].filter(Boolean) as string[];
}

function sourceFacts(sources: StudioSource[]): string[] {
  return sources
    .filter(source => source.status === 'linked' && source.sourceType !== 'methodology')
    .slice(0, 8)
    .map(source => `Source: ${source.label}`);
}

function factsForSlide(title: string, facts: string[], index: number): string[] {
  if (!facts.length) return [];
  const lower = title.toLowerCase();
  const weighted = facts.filter(fact => {
    const factLower = fact.toLowerCase();
    if (/financial|earnings|cash flow|qoe|valuation|returns|lender|sources|uses/i.test(lower)) {
      return /revenue|sde|ebitda|asking price|source|p&l|financial|tax|bank|lender/i.test(factLower);
    }
    if (/market|buyer|positioning|company|target/i.test(lower)) {
      return /company|industry|location|source|buyer|market|cim|profile/i.test(factLower);
    }
    if (/risk|red flag|diligence|approval|next/i.test(lower)) {
      return /source|legal|tax|nda|qoe|data room|diligence|league/i.test(factLower);
    }
    return true;
  });
  const picked = weighted.length ? weighted : facts;
  return [...new Set(picked)].slice(0, index < 2 ? 5 : 3);
}

function citationTagsForFormat(format: PitchBookFormat): string[] {
  if (format === 'qoe-preview-book') return ['[ABA 2025]', '[SRS 2025]'];
  if (format === 'lender-book') return ['[SBA SOP 50 10 8]', '[FRED:DPRIME]'];
  if (format === 'ic-deck' || format === 'buyer-pitch-book') return ['[Damodaran 2026]', '[Kroll 2024]'];
  return ['[Pepperdine PCAP 2025]'];
}

function buildAudit(input: {
  format: PitchBookFormat;
  slides: StudioSlide[];
  assumptions: Array<Record<string, any>>;
  modelOutputs: Array<Record<string, any>>;
  sources: StudioSource[];
  action: string;
  instruction?: string;
  modelExecutionHashes?: string[];
}): Record<string, any> {
  const payload = {
    schemaVersion: 'studio-audit-v1',
    ...definitiveVersionPayload(),
    action: input.action,
    format: input.format,
    slideCount: input.slides.length,
    assumptionCount: input.assumptions.length,
    modelOutputCount: input.modelOutputs.length,
    sourceCount: input.sources.length,
    instruction: input.instruction || null,
    modelExecutionHashes: input.modelExecutionHashes || [],
    generatedAt: new Date().toISOString(),
  };
  return {
    ...payload,
    inputHash: createHash('sha256').update(JSON.stringify(payload)).digest('hex'),
  };
}

async function writeStudioAuditTrail(input: {
  userId: number;
  book: PitchBookRecord;
  versionId: number | null;
  action: string;
  modelOutputs: Array<Record<string, any>>;
  outputHash: string;
  citationsValidated?: Record<string, any>;
  warnings?: string[];
}): Promise<void> {
  const mandateContext = await resolveDefinitiveMandateContext({
    userId: input.userId,
    sourceSurface: 'studio',
  });
  await sql`
    INSERT INTO audit_trail (
      session_id, deal_id, user_id, conversation_id, turn_id, journey, league, deal_type,
      model_stack, inputs_used, live_data_snapshots, citations_validated, mode_2_triggers, output_hash,
      spec_version, spec_uri, methodology_version, methodology_uri,
      beneficial_customer_id, billing_org_id, mandate_id, agent_id, agent_platform_id, mandate_chain
    )
    VALUES (
      ${`studio:${input.book.id}`},
      ${input.book.dealId},
      ${input.userId},
      ${null},
      ${`${input.action}:v${input.versionId || input.book.version}`},
      ${assumptionValue(input.book.assumptions, 'journey')},
      ${assumptionValue(input.book.assumptions, 'league')},
      ${input.book.format},
      ${sql.json(input.modelOutputs.map(output => output.modelId))}::jsonb,
      ${sql.json({ bookId: input.book.id, versionId: input.versionId, action: input.action })}::jsonb,
      ${sql.json({ studioSources: input.book.sources.length, warnings: input.warnings || [] })}::jsonb,
      ${sql.json(input.citationsValidated || {})}::jsonb,
      ${sql.json([])}::jsonb,
      ${input.outputHash},
      ${DEFINITIVE_SPEC_VERSION},
      ${DEFINITIVE_SPEC_URI},
      ${DEFINITIVE_METHODOLOGY_VERSION},
      ${DEFINITIVE_METHODOLOGY_URI},
      ${mandateContext.beneficialCustomerId},
      ${mandateContext.billingOrgId},
      ${mandateContext.mandateId},
      ${mandateContext.agentId},
      ${mandateContext.agentPlatformId},
      ${sql.json(mandateContext.mandateChain)}::jsonb
    )
  `;
}

function buildModelInput(modelId: string, book: PitchBookRecord, deal: Record<string, any> | null): Record<string, any> {
  const financials = safeRecord(deal?.financials);
  const normalizedEarnings = centsValue(deal?.ebitda) ?? centsValue(deal?.sde);
  const askingPrice = centsValue(deal?.asking_price);
  const annualDebtService = centsValue(financials.annual_debt_service_cents) || centsValue(financials.debt_service_cents);
  const common = {
    deal_id: book.dealId,
    format: book.format,
    financial_facts: [
      ...book.slides.flatMap(slide => slide.provenance.factsUsed),
      ...dealFacts(deal),
    ].filter(Boolean),
    adjustments: safeArray(financials.adjustments || financials.add_backs).map(item => typeof item === 'object' ? item : { value: item }),
    data_room_files: book.sources.filter(source => source.sourceType === 'data_room_document'),
    revenue_cents: centsValue(deal?.revenue),
    sde_cents: centsValue(deal?.sde),
    seller_discretionary_earnings_cents: centsValue(deal?.sde),
    ebitda_cents: centsValue(deal?.ebitda),
    normalized_earnings_cents: normalizedEarnings,
    adjusted_ebitda_cents: centsValue(deal?.ebitda),
    normalized_sde_cents: centsValue(deal?.sde),
    purchase_price_cents: askingPrice,
    enterprise_value_cents: askingPrice,
    cash_flow_cents: normalizedEarnings,
    annual_debt_service_cents: annualDebtService,
    buyer_equity_cents: centsValue(financials.buyer_equity_cents),
    add_backs_cents: centsValue(financials.add_backs_cents),
    owner_comp_cents: centsValue(financials.owner_comp_cents),
    adjustments_cents: centsValue(financials.adjustments_cents),
    monthly_nwc_cents: safeArray(financials.monthly_nwc_cents),
    sources_cents: financials.sources_cents,
    uses_cents: financials.uses_cents,
    low_multiple: numberValue(financials.low_multiple),
    high_multiple: numberValue(financials.high_multiple),
  };

  if (modelId === 'MODEL.SOURCES.USES.v1' && !common.sources_cents && askingPrice) {
    common.sources_cents = [centsValue(financials.senior_debt_cents), centsValue(financials.seller_note_cents), centsValue(financials.buyer_equity_cents)].filter(value => value != null);
    common.uses_cents = [askingPrice, centsValue(financials.fees_cents)].filter(value => value != null);
  }

  return common;
}

function collectBookCitationTags(book: PitchBookRecord): string[] {
  return [...new Set([
    ...book.sources.map(source => source.citationTag).filter(Boolean),
    ...book.slides.flatMap(slide => slide.provenance.citationsUsed),
    ...book.modelOutputs.flatMap(output => Array.isArray(output.citationTags) ? output.citationTags : []),
  ])] as string[];
}

function buildExportWarnings(
  book: PitchBookRecord,
  citationValidation: { missing: string[] },
  readiness: V19StudioReadiness | null,
): string[] {
  return [...new Set([
    ...book.slides
      .filter(slide => slide.warningState !== 'clean')
      .map(slide => `${slide.title}: ${slide.warningState}`),
    ...book.modelOutputs
      .filter(output => output.status !== 'complete')
      .map(output => `${output.modelId}: ${output.status}`),
    ...citationValidation.missing.map(tag => `Missing citation: ${tag}`),
    ...(readiness?.issues || []).map(issue => `${issue.code}: ${issue.detail}`),
  ])];
}

function formatStudioReadinessForAudit(readiness: V19StudioReadiness | null) {
  if (!readiness) {
    return {
      provided: false,
      readyForInternalDraft: null,
      readyForExternalDelivery: null,
      blockerCount: null,
      warningCount: null,
      checkedAt: null,
      issues: [],
      resourceUris: [],
    };
  }
  const issues = readiness.issues.map(issue => ({
    code: issue.code,
    severity: issue.severity,
    label: issue.label,
    detail: issue.detail,
    resourceUri: issue.resourceUri || null,
  }));
  return {
    provided: true,
    readyForInternalDraft: readiness.readyForInternalDraft,
    readyForExternalDelivery: readiness.readyForExternalDelivery,
    slideGaps: readiness.slideGaps,
    sourceGaps: readiness.sourceGaps,
    modelGaps: readiness.modelGaps,
    uncheckedClaims: readiness.uncheckedClaims,
    blockerCount: issues.filter(issue => issue.severity === 'blocker').length,
    warningCount: issues.filter(issue => issue.severity === 'warning').length,
    checkedAt: readiness.checkedAt,
    resourceUris: readiness.resourceUris,
    issues,
  };
}

function assumptionValue(assumptions: Array<Record<string, any>>, key: string): string | null {
  const hit = assumptions.find(item => item.key === key);
  return typeof hit?.value === 'string' ? hit.value : null;
}

function centsValue(value: unknown): number | null {
  const parsed = numberValue(value);
  return parsed == null ? null : Math.round(parsed);
}

function numberValue(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildProvenance(slides: StudioSlide[]): Record<string, any> {
  return {
    slideCount: slides.length,
    cleanSlides: slides.filter(slide => slide.warningState === 'clean').length,
    slidesNeedingSources: slides.filter(slide => slide.warningState !== 'clean').map(slide => slide.id),
    citationsUsed: [...new Set(slides.flatMap(slide => slide.provenance.citationsUsed))],
  };
}

function defaultBrief(format: PitchBookFormat, deal: Record<string, any> | null): string {
  const name = deal?.business_name || 'the deal';
  if (format === 'qoe-preview-book') return `Build a QoE preview book for ${name} that separates defended earnings from open diligence asks.`;
  return `Build a source-grounded ${FORMAT_LABELS[format]} for ${name}.`;
}

function formatCents(value: unknown): string {
  const cents = Number(value);
  if (!Number.isFinite(cents)) return '-';
  const dollars = cents / 100;
  if (Math.abs(dollars) >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2).replace(/\.00$/, '')}M`;
  if (Math.abs(dollars) >= 1_000) return `$${Math.round(dollars / 1_000).toLocaleString('en-US')}K`;
  return `$${Math.round(dollars).toLocaleString('en-US')}`;
}

function cleanTitle(value?: string | null): string {
  return typeof value === 'string' ? value.trim().slice(0, 140) : '';
}

function safeArray(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function safeRecord(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}
