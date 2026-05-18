import { createHash } from 'crypto';
import { sql } from '../db.js';
import { hasDealAccess } from './dealAccessService.js';

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
  const slides = buildSlides(format, deal, brief);
  const sources = await buildSources(format, deal?.id ?? null);
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

  const slides = current.slides.map((slide, index) => index === 0
    ? {
        ...slide,
        speakerNotes: `${slide.speakerNotes}\nRevision brief: ${instruction}`,
        provenance: {
          ...slide.provenance,
          uncheckedClaims: [...slide.provenance.uncheckedClaims, 'Revision narrative requires human/source review.'],
        },
        warningState: slide.warningState === 'stale_models' ? 'stale_models' : 'needs_sources',
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
  const modelOutputs = current.modelOutputs.map(output => ({
    ...output,
    status: 'stale_until_runtime',
    refreshedAt: new Date().toISOString(),
  }));
  const slides = current.slides.map(slide => ({
    ...slide,
    warningState: 'stale_models' as const,
    provenance: {
      ...slide.provenance,
      uncheckedClaims: [...new Set([...slide.provenance.uncheckedClaims, 'Linked model output needs V19 runtime execution.'])],
    },
  }));
  const audit = buildAudit({
    format: current.format,
    slides,
    assumptions: current.assumptions,
    modelOutputs,
    sources: current.sources,
    action: 'refresh_pitch_book_from_models',
  });
  const version = await insertVersion(current.id, current.title, current.outline, slides, current.assumptions, modelOutputs, audit, 'yulia');
  await cloneSources(current.id, current.versionId, version.id);
  await sql`UPDATE studio_books SET current_version_id = ${version.id}, updated_at = NOW() WHERE id = ${current.id}`;
  const refreshed = await getPitchBook(userId, current.id);
  if (!refreshed) throw new Error('Pitch book refresh could not be read back');
  return refreshed;
}

export async function recordPitchBookExport(
  userId: number,
  bookId: number,
  format: 'pptx' | 'pdf',
  buffer: Buffer,
): Promise<{ exportId: number; outputHash: string }> {
  const book = await getPitchBook(userId, bookId);
  if (!book) throw new Error('Pitch book not found');
  const outputHash = createHash('sha256').update(buffer).digest('hex');
  const [row] = await sql`
    INSERT INTO studio_exports (book_id, version_id, format, status, output_hash, metadata)
    VALUES (
      ${book.id},
      ${book.versionId},
      ${format},
      'ready',
      ${outputHash},
      ${sql.json({ title: book.title, slideCount: book.slides.length, exportedAt: new Date().toISOString() })}::jsonb
    )
    RETURNING id
  `;
  return { exportId: Number(row.id), outputHash };
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
      book_id, version, title, outline, slides, assumptions, model_outputs, provenance, audit, speaker_notes, created_by
    )
    VALUES (
      ${bookId},
      ${version},
      ${title},
      ${sql.json(outline)}::jsonb,
      ${sql.json(slides)}::jsonb,
      ${sql.json(assumptions)}::jsonb,
      ${sql.json(modelOutputs)}::jsonb,
      ${sql.json(buildProvenance(slides))}::jsonb,
      ${sql.json(audit)}::jsonb,
      ${sql.json(slides.map(slide => ({ slideId: slide.id, notes: slide.speakerNotes })))}::jsonb,
      ${createdBy}
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

function buildSlides(format: PitchBookFormat, deal: Record<string, any> | null, brief: string): StudioSlide[] {
  const facts = dealFacts(deal);
  return FORMAT_OUTLINES[format].map((title, index) => {
    const citations = index === 0 ? citationTagsForFormat(format).slice(0, 2) : [];
    const factsUsed = facts.filter(Boolean).slice(0, index < 2 ? 5 : 3);
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
}): Record<string, any> {
  const payload = {
    schemaVersion: 'studio-audit-v1',
    action: input.action,
    format: input.format,
    slideCount: input.slides.length,
    assumptionCount: input.assumptions.length,
    modelOutputCount: input.modelOutputs.length,
    sourceCount: input.sources.length,
    instruction: input.instruction || null,
    generatedAt: new Date().toISOString(),
  };
  return {
    ...payload,
    inputHash: createHash('sha256').update(JSON.stringify(payload)).digest('hex'),
  };
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
