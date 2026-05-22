import crypto from 'crypto';
import { sql } from '../db.js';
import { GATE_MAP, getGateV19Requirements } from '../../shared/gateRegistry.js';

type Tone = 'gold' | 'cactus' | 'oat' | 'plum' | 'charcoal';

interface DealRow {
  id: number;
  business_name: string | null;
  name: string | null;
  industry: string | null;
  location: string | null;
  journey_type: string | null;
  current_gate: string | null;
  league: string | null;
  status: string;
  revenue: number | null;
  sde: number | null;
  ebitda: number | null;
  asking_price: number | null;
  financials: Record<string, any> | null;
  seven_factor_composite: number | null;
  updated_at: string;
  deliverable_count?: number | string;
  stale_deliverable_count?: number | string;
  review_count?: number | string;
  document_count?: number | string;
}

interface DeliverableRow {
  id: number;
  deal_id: number | null;
  status: string;
  created_at: string;
  completed_at: string | null;
  is_stale?: boolean | null;
  stale_reason?: string | null;
  slug: string | null;
  name: string | null;
  deliverable_type: string | null;
  deal_name: string | null;
}

interface ReviewRow {
  id: number;
  deal_id: number | null;
  status: string;
  reviewer_role: string | null;
  focus_areas: string | null;
  created_at: string;
  requester_name: string | null;
  doc_name: string | null;
  deal_name: string | null;
}

interface StudioBookRow {
  id: number;
  deal_id: number | null;
  title: string;
  format: string;
  status: string;
  updated_at: string;
  slides: any;
  model_outputs: any;
  provenance: any;
}

interface DefinitiveDealStateSnapshotRow {
  id: number;
  deal_id: number;
  deal_name: string | null;
  tool_name: string;
  state_cid: string;
  state_hash: string;
  classification_key: Record<string, any> | null;
  missing_input_contract: Record<string, any> | null;
  completeness_report: Record<string, any> | null;
  source_index: any[] | null;
  created_at: string;
}

interface DefinitiveDealPacketRow {
  id: number;
  deal_id: number;
  deal_name: string | null;
  tool_name: string;
  action: string | null;
  packet_type: string;
  packet_id: string | null;
  packet_cid: string | null;
  deal_state_cid: string | null;
  next_suggested_calls: any[] | null;
  take_back_artifacts: any[] | null;
  created_at: string;
}

interface FirmMemoryRow {
  id: number;
  memory_type: string;
  label: string;
  value: Record<string, any>;
  confidence: number | string;
  source: string;
  last_used_at: string | null;
  updated_at: string;
}

export interface TodayMorningBrief {
  title: string;
  lede: string;
  focusDealId?: string;
  focusDealTitle?: string;
  chips: string[];
  prompt: string;
  freshness: string;
}

export interface TodayGateCountdownItem {
  dealId: string;
  title: string;
  gateId: string;
  gateName: string;
  blockers: string[];
  requiredModels: string[];
  requiredCitations: string[];
  nextAction: string;
  tone: Tone;
  definitive?: TodayDefinitiveDealState;
}

export interface TodayDealPulseItem {
  dealId: string;
  title: string;
  status: string;
  fit: number;
  thesis: string;
  metric: string;
  urgency: string;
  tone: Tone;
  nextAction: string;
  definitive?: TodayDefinitiveDealState;
}

export interface TodayDefinitiveDealState {
  stateCid: string;
  readinessLevel: string;
  score: number;
  nextGate: string;
  missingCount: number;
  blockerCount: number;
  sourceCount: number;
  packetTypes: string[];
  latestPacketType?: string;
  latestPacketId?: string;
  latestPacketAt?: string;
  nextSuggestedTool?: string;
  updatedAt: string;
}

export interface TodayFileReviewItem {
  id: string;
  title: string;
  dealId?: string;
  dealTitle?: string;
  reason: string;
  status: string;
  tone: Tone;
  updatedAt?: string;
  definitivePacketRowId?: number;
  definitivePacketId?: string;
  definitivePacketType?: string;
  definitivePacketCid?: string;
  definitiveStateCid?: string;
  definitiveToolName?: string;
}

export interface TodayStudioRefreshItem {
  bookId: string;
  title: string;
  format: string;
  reason: string;
  gaps: number;
  action: string;
  tone: Tone;
}

export interface TodayFirmMemorySnapshot {
  assumptions: FirmMemoryItem[];
  houseStyle: FirmMemoryItem[];
  providers: FirmMemoryItem[];
  dealPatterns: FirmMemoryItem[];
  workflows: FirmMemoryItem[];
  stats: {
    total: number;
    updatedAt?: string;
  };
}

export interface FirmMemoryItem {
  id: string;
  label: string;
  text: string;
  confidence: number;
  source: string;
}

export interface TodayOperatingBrief {
  source: 'live';
  generatedAt: string;
  morningBrief: TodayMorningBrief;
  gateCountdown: TodayGateCountdownItem[];
  dealPulse: TodayDealPulseItem[];
  filesNeedingReview: TodayFileReviewItem[];
  studioRefreshNeeds: TodayStudioRefreshItem[];
  firmMemory: TodayFirmMemorySnapshot;
}

export type FirmMemoryType = 'assumption' | 'house_style' | 'provider' | 'deal_pattern' | 'workflow';

export interface UpsertFirmMemoryInput {
  memoryType: FirmMemoryType;
  label: string;
  value?: Record<string, any>;
  text?: string;
  source?: string;
  confidence?: number;
  status?: 'active' | 'archived';
}

export interface UpsertFirmMemoryResult extends FirmMemoryItem {
  memoryType: FirmMemoryType;
  status: string;
  updatedAt: string;
}

interface TodaySnapshot {
  deals: DealRow[];
  deliverables: DeliverableRow[];
  reviews: ReviewRow[];
  studioBooks: StudioBookRow[];
  firmMemory: FirmMemoryRow[];
  definitiveStates: DefinitiveDealStateSnapshotRow[];
  definitivePackets: DefinitiveDealPacketRow[];
}

export async function getTodayOperatingBrief(userId: number, forceRefresh = false): Promise<TodayOperatingBrief> {
  await ensureFirmMemoryDefaults(userId).catch(() => undefined);
  const snapshot = await buildSnapshot(userId);
  const fingerprint = hashSnapshot(snapshot);

  if (!forceRefresh) {
    const cached = await readCachedBrief(userId, fingerprint).catch(() => null);
    if (cached) return cached;
  }

  const generatedAt = new Date().toISOString();
  const definitiveByDeal = buildDefinitiveStateMap(snapshot.definitiveStates, snapshot.definitivePackets);
  const brief: TodayOperatingBrief = {
    source: 'live',
    generatedAt,
    morningBrief: buildMorningBrief(snapshot, generatedAt),
    gateCountdown: buildGateCountdown(snapshot.deals, definitiveByDeal),
    dealPulse: buildDealPulse(snapshot.deals, definitiveByDeal),
    filesNeedingReview: buildFilesNeedingReview(snapshot.deliverables, snapshot.reviews, snapshot.definitivePackets),
    studioRefreshNeeds: buildStudioRefreshNeeds(snapshot.studioBooks),
    firmMemory: buildFirmMemorySnapshot(snapshot.firmMemory),
  };

  await writeCachedBrief(userId, fingerprint, brief).catch(err => {
    console.warn('[today operating brief] cache write skipped:', err.message);
  });

  return brief;
}

export async function upsertFirmMemory(userId: number, input: UpsertFirmMemoryInput): Promise<UpsertFirmMemoryResult> {
  const memoryType = normalizeFirmMemoryType(input.memoryType);
  const label = String(input.label || '').trim();
  if (!label) throw new Error('Firm Memory label is required');

  const value = {
    ...(input.value && typeof input.value === 'object' && !Array.isArray(input.value) ? input.value : {}),
  };
  const text = String(input.text || '').trim();
  if (text) value.text = text;
  if (!Object.keys(value).length) throw new Error('Firm Memory value or text is required');

  const confidence = clamp(Number(input.confidence ?? 0.76), 0, 1);
  const source = String(input.source || 'yulia-tool').trim() || 'yulia-tool';
  const status = input.status === 'archived' ? 'archived' : 'active';

  const [row] = await sql<FirmMemoryRow[]>`
    INSERT INTO firm_memory (user_id, memory_type, label, value, source, confidence, status, last_used_at)
    VALUES (
      ${userId},
      ${memoryType},
      ${label},
      ${sql.json(value as any)}::jsonb,
      ${source},
      ${confidence},
      ${status},
      NOW()
    )
    ON CONFLICT (user_id, memory_type, label)
    DO UPDATE SET
      value = EXCLUDED.value,
      source = EXCLUDED.source,
      confidence = EXCLUDED.confidence,
      status = EXCLUDED.status,
      last_used_at = NOW(),
      updated_at = NOW()
    RETURNING id, memory_type, label, value, confidence, source, last_used_at, updated_at
  `;

  return {
    id: String(row.id),
    memoryType: row.memory_type as FirmMemoryType,
    label: row.label,
    text: firmMemoryText(row),
    confidence: Number(row.confidence || confidence),
    source: row.source,
    status,
    updatedAt: toIso(row.updated_at),
  };
}

async function buildSnapshot(userId: number): Promise<TodaySnapshot> {
  const deals = await readDeals(userId).catch(err => {
    console.warn('[today operating brief] deals unavailable:', err.message);
    return [] as DealRow[];
  });
  const dealIds = deals.map(deal => deal.id);
  const [deliverables, reviews, studioBooks, firmMemory, definitiveStates, definitivePackets] = await Promise.all([
    readDeliverables(userId, dealIds).catch(err => {
      console.warn('[today operating brief] deliverables unavailable:', err.message);
      return [] as DeliverableRow[];
    }),
    readPendingReviews(userId, dealIds).catch(err => {
      console.warn('[today operating brief] reviews unavailable:', err.message);
      return [] as ReviewRow[];
    }),
    readStudioBooks(userId).catch(err => {
      console.warn('[today operating brief] Studio unavailable:', err.message);
      return [] as StudioBookRow[];
    }),
    readFirmMemory(userId).catch(err => {
      console.warn('[today operating brief] firm memory unavailable:', err.message);
      return [] as FirmMemoryRow[];
    }),
    readDefinitiveStates(userId, dealIds).catch(err => {
      console.warn('[today operating brief] DEFINITIVE states unavailable:', err.message);
      return [] as DefinitiveDealStateSnapshotRow[];
    }),
    readDefinitivePackets(userId, dealIds).catch(err => {
      console.warn('[today operating brief] DEFINITIVE packets unavailable:', err.message);
      return [] as DefinitiveDealPacketRow[];
    }),
  ]);
  return { deals, deliverables, reviews, studioBooks, firmMemory, definitiveStates, definitivePackets };
}

function normalizeFirmMemoryType(value: string): FirmMemoryType {
  const normalized = String(value || '').trim() as FirmMemoryType;
  const allowed: FirmMemoryType[] = ['assumption', 'house_style', 'provider', 'deal_pattern', 'workflow'];
  if (!allowed.includes(normalized)) {
    throw new Error(`Unsupported Firm Memory type: ${value}`);
  }
  return normalized;
}

async function readDeals(userId: number): Promise<DealRow[]> {
  const ownedDeals = await sql<DealRow[]>`
    SELECT d.id, d.business_name, d.name, d.industry, d.location, d.journey_type,
           d.current_gate, d.league, d.status, d.revenue, d.sde, d.ebitda,
           d.asking_price, d.financials, d.seven_factor_composite, d.updated_at,
           (SELECT COUNT(*) FROM deliverables del WHERE del.deal_id = d.id) as deliverable_count,
           (SELECT COUNT(*) FROM deliverables del WHERE del.deal_id = d.id AND del.is_stale = TRUE) as stale_deliverable_count,
           (SELECT COUNT(*) FROM review_requests rr WHERE rr.deal_id = d.id AND rr.status IN ('pending', 'reviewing')) as review_count,
           (SELECT COUNT(*) FROM data_room_documents doc WHERE doc.deal_id = d.id) as document_count
    FROM deals d
    WHERE d.user_id = ${userId} AND d.status = 'active'
    ORDER BY d.updated_at DESC
    LIMIT 25
  `;

  let participatedDeals: DealRow[] = [];
  try {
    participatedDeals = await sql<DealRow[]>`
      SELECT d.id, d.business_name, d.name, d.industry, d.location, d.journey_type,
             d.current_gate, d.league, d.status, d.revenue, d.sde, d.ebitda,
             d.asking_price, d.financials, d.seven_factor_composite, d.updated_at,
             (SELECT COUNT(*) FROM deliverables del WHERE del.deal_id = d.id) as deliverable_count,
             (SELECT COUNT(*) FROM deliverables del WHERE del.deal_id = d.id AND del.is_stale = TRUE) as stale_deliverable_count,
             (SELECT COUNT(*) FROM review_requests rr WHERE rr.deal_id = d.id AND rr.status IN ('pending', 'reviewing')) as review_count,
             (SELECT COUNT(*) FROM data_room_documents doc WHERE doc.deal_id = d.id) as document_count
      FROM deals d
      JOIN deal_participants dp ON dp.deal_id = d.id
      WHERE dp.user_id = ${userId} AND dp.accepted_at IS NOT NULL AND d.status = 'active'
      ORDER BY d.updated_at DESC
      LIMIT 25
    `;
  } catch {
    participatedDeals = [];
  }

  return dedupeDeals([...ownedDeals, ...participatedDeals]);
}

async function readDeliverables(userId: number, dealIds: number[]): Promise<DeliverableRow[]> {
  if (!dealIds.length) return [];
  return sql<DeliverableRow[]>`
    SELECT d.id, d.deal_id, d.status, d.created_at, d.completed_at,
           d.is_stale, d.stale_reason,
           m.slug, m.name, m.deliverable_type,
           dl.business_name as deal_name
    FROM deliverables d
    JOIN menu_items m ON m.id = d.menu_item_id
    LEFT JOIN deals dl ON dl.id = d.deal_id
    WHERE d.user_id = ${userId}
      AND d.deal_id = ANY(${dealIds})
    ORDER BY COALESCE(d.completed_at, d.created_at) DESC
    LIMIT 50
  `;
}

async function readPendingReviews(userId: number, dealIds: number[]): Promise<ReviewRow[]> {
  if (!dealIds.length) return [];
  return sql<ReviewRow[]>`
    SELECT rr.id, rr.deal_id, rr.status, rr.reviewer_role, rr.focus_areas,
           rr.created_at,
           req.display_name as requester_name,
           COALESCE(m.name, doc.name) as doc_name,
           dl.business_name as deal_name
    FROM review_requests rr
    JOIN users req ON req.id = rr.requested_by
    LEFT JOIN deliverables del ON del.id = rr.deliverable_id
    LEFT JOIN menu_items m ON m.id = del.menu_item_id
    LEFT JOIN data_room_documents doc ON doc.id = rr.document_id
    LEFT JOIN deals dl ON dl.id = rr.deal_id
    WHERE (rr.requested_by = ${userId} OR rr.reviewer_id = ${userId})
      AND rr.deal_id = ANY(${dealIds})
      AND rr.status IN ('pending', 'reviewing')
    ORDER BY rr.created_at ASC
    LIMIT 30
  `;
}

async function readStudioBooks(userId: number): Promise<StudioBookRow[]> {
  return sql<StudioBookRow[]>`
    SELECT b.id, b.deal_id, b.title, b.format, b.status, b.updated_at,
           v.slides, v.model_outputs, v.provenance
    FROM studio_books b
    LEFT JOIN studio_book_versions v ON v.id = b.current_version_id
    WHERE b.user_id = ${userId}
    ORDER BY b.updated_at DESC
    LIMIT 25
  `;
}

async function readFirmMemory(userId: number): Promise<FirmMemoryRow[]> {
  return sql<FirmMemoryRow[]>`
    SELECT id, memory_type, label, value, confidence, source, last_used_at, updated_at
    FROM firm_memory
    WHERE user_id = ${userId} AND status = 'active'
    ORDER BY memory_type ASC, COALESCE(last_used_at, updated_at) DESC
    LIMIT 60
  `;
}

async function readDefinitiveStates(userId: number, dealIds: number[]): Promise<DefinitiveDealStateSnapshotRow[]> {
  if (!dealIds.length) return [];
  return sql<DefinitiveDealStateSnapshotRow[]>`
    SELECT DISTINCT ON (s.deal_id)
           s.id, s.deal_id, d.business_name as deal_name, s.tool_name,
           s.state_cid, s.state_hash, s.classification_key,
           s.missing_input_contract, s.completeness_report, s.source_index,
           s.created_at
    FROM definitive_deal_state_snapshots s
    LEFT JOIN deals d ON d.id = s.deal_id
    WHERE s.user_id = ${userId}
      AND s.deal_id = ANY(${dealIds})
    ORDER BY s.deal_id, s.created_at DESC
  `;
}

async function readDefinitivePackets(userId: number, dealIds: number[]): Promise<DefinitiveDealPacketRow[]> {
  if (!dealIds.length) return [];
  return sql<DefinitiveDealPacketRow[]>`
    SELECT p.id, p.deal_id, d.business_name as deal_name, p.tool_name, p.action,
           p.packet_type, p.packet_id, p.packet_cid, p.deal_state_cid,
           p.next_suggested_calls, p.take_back_artifacts, p.created_at
    FROM definitive_deal_packets p
    LEFT JOIN deals d ON d.id = p.deal_id
    WHERE p.user_id = ${userId}
      AND p.deal_id = ANY(${dealIds})
    ORDER BY p.created_at DESC
    LIMIT 80
  `;
}

async function ensureFirmMemoryDefaults(userId: number): Promise<void> {
  const defaults = [
    {
      memoryType: 'house_style',
      label: 'Apple Glass + Neo',
      value: {
        text: 'Use liquid glass, dark glass actions, App Store art cards, and restrained Neo structure.',
        tags: ['design', 'desktop', 'mobile'],
      },
    },
    {
      memoryType: 'workflow',
      label: 'Source-grounded collateral',
      value: {
        text: 'Pitch books, memos, and exports should carry source links, model outputs, and audit trails from day one.',
        tags: ['studio', 'audit'],
      },
    },
    {
      memoryType: 'assumption',
      label: 'No invented financials',
      value: {
        text: 'Numbers come from uploaded files, server-side models, or citations; unsupported metrics stay flagged.',
        tags: ['finance', 'governance'],
      },
    },
  ];

  for (const item of defaults) {
    await sql`
      INSERT INTO firm_memory (user_id, memory_type, label, value, source, confidence)
      VALUES (${userId}, ${item.memoryType}, ${item.label}, ${sql.json(item.value)}::jsonb, 'system_default', 0.88)
      ON CONFLICT (user_id, memory_type, label)
      DO UPDATE SET updated_at = firm_memory.updated_at
    `;
  }
}

async function readCachedBrief(userId: number, fingerprint: string): Promise<TodayOperatingBrief | null> {
  const [row] = await sql`
    SELECT morning_brief, gate_countdown, deal_pulse, files_needing_review,
           studio_refresh_needs, firm_memory_snapshot, generated_at
    FROM today_operating_briefs
    WHERE user_id = ${userId}
      AND source_fingerprint = ${fingerprint}
      AND expires_at > NOW()
      AND status = 'complete'
    LIMIT 1
  `;
  if (!row) return null;
  return {
    source: 'live',
    generatedAt: toIso(row.generated_at),
    morningBrief: row.morning_brief as TodayMorningBrief,
    gateCountdown: safeArray(row.gate_countdown) as TodayGateCountdownItem[],
    dealPulse: safeArray(row.deal_pulse) as TodayDealPulseItem[],
    filesNeedingReview: safeArray(row.files_needing_review) as TodayFileReviewItem[],
    studioRefreshNeeds: safeArray(row.studio_refresh_needs) as TodayStudioRefreshItem[],
    firmMemory: row.firm_memory_snapshot as TodayFirmMemorySnapshot,
  };
}

async function writeCachedBrief(userId: number, fingerprint: string, brief: TodayOperatingBrief): Promise<void> {
  await sql`
    INSERT INTO today_operating_briefs (
      user_id, source_fingerprint, morning_brief, gate_countdown, deal_pulse,
      files_needing_review, studio_refresh_needs, firm_memory_snapshot, generated_at, expires_at, status
    )
    VALUES (
      ${userId},
      ${fingerprint},
      ${sql.json(brief.morningBrief as any)}::jsonb,
      ${sql.json(brief.gateCountdown as any)}::jsonb,
      ${sql.json(brief.dealPulse as any)}::jsonb,
      ${sql.json(brief.filesNeedingReview as any)}::jsonb,
      ${sql.json(brief.studioRefreshNeeds as any)}::jsonb,
      ${sql.json(brief.firmMemory as any)}::jsonb,
      NOW(),
      NOW() + INTERVAL '8 hours',
      'complete'
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      source_fingerprint = EXCLUDED.source_fingerprint,
      morning_brief = EXCLUDED.morning_brief,
      gate_countdown = EXCLUDED.gate_countdown,
      deal_pulse = EXCLUDED.deal_pulse,
      files_needing_review = EXCLUDED.files_needing_review,
      studio_refresh_needs = EXCLUDED.studio_refresh_needs,
      firm_memory_snapshot = EXCLUDED.firm_memory_snapshot,
      generated_at = NOW(),
      expires_at = NOW() + INTERVAL '8 hours',
      status = 'complete'
  `;
}

function buildMorningBrief(snapshot: TodaySnapshot, generatedAt: string): TodayMorningBrief {
  const rankedDeals = [...snapshot.deals].sort((a, b) => fitScore(b) - fitScore(a));
  const focus = rankedDeals[0] ?? snapshot.deals[0] ?? null;
  const reviewCount = snapshot.reviews.length;
  const studioNeeds = buildStudioRefreshNeeds(snapshot.studioBooks).length;
  const staleCount = snapshot.deliverables.filter(item => item.is_stale || item.status !== 'complete').length;
  const stateCount = snapshot.definitiveStates.length;
  const chips = [
    `${snapshot.deals.length} active ${snapshot.deals.length === 1 ? 'deal' : 'deals'}`,
    `${reviewCount} review ${reviewCount === 1 ? 'item' : 'items'}`,
    `${studioNeeds} Studio ${studioNeeds === 1 ? 'refresh' : 'refreshes'}`,
    stateCount > 0 ? `${stateCount} DealState ${stateCount === 1 ? 'journal' : 'journals'}` : null,
  ].filter(Boolean) as string[];

  if (!focus) {
    return {
      title: 'Yulia is ready when the first deal lands.',
      lede: 'No live deal is attached yet. Start with a thesis, file, target, or buyer pool and the operating brief will form around it.',
      chips,
      prompt: 'Help me start the first deal workspace and tell me what information you need.',
      freshness: `Updated ${timeLabel(generatedAt)}`,
    };
  }

  const name = dealName(focus);
  const work = reviewCount > 0
    ? `${reviewCount} review item${reviewCount === 1 ? '' : 's'} waiting`
    : staleCount > 0
      ? `${staleCount} file or deliverable refresh${staleCount === 1 ? '' : 'es'} waiting`
      : 'the next deal move is clear';
  return {
    title: `${name} is the current read.`,
    lede: `${work}. Yulia is keeping gates, files, model outputs, Studio drafts, and the DEFINITIVE DealState journal in one operating surface.`,
    focusDealId: String(focus.id),
    focusDealTitle: name,
    chips,
    prompt: `Give me the morning brief for ${name}. Include gate countdown, files needing review, Studio refreshes, and firm-memory assumptions.`,
    freshness: `Updated ${timeLabel(generatedAt)}`,
  };
}

function buildGateCountdown(deals: DealRow[], definitiveByDeal: Map<string, TodayDefinitiveDealState>): TodayGateCountdownItem[] {
  const tones: Tone[] = ['cactus', 'gold', 'plum', 'oat', 'charcoal'];
  return deals
    .filter(deal => deal.current_gate)
    .slice(0, 5)
    .map((deal, index) => {
      const gateId = String(deal.current_gate || '');
      const gate = GATE_MAP[gateId];
      const requirements = getGateV19Requirements(gateId);
      const definitive = definitiveByDeal.get(String(deal.id));
      const blockers = [
        definitive && definitive.missingCount > 0 ? `${definitive.missingCount} DealState gap${definitive.missingCount === 1 ? '' : 's'}` : null,
        Number(deal.review_count || 0) > 0 ? `${deal.review_count} open review` : null,
        Number(deal.stale_deliverable_count || 0) > 0 ? `${deal.stale_deliverable_count} stale output` : null,
        !requirements.requiredModels.length ? null : `${requirements.requiredModels.length} model check`,
        !requirements.requiredCitations.length ? null : `${requirements.requiredCitations.length} citation check`,
      ].filter(Boolean) as string[];
      return {
        dealId: String(deal.id),
        title: dealName(deal),
        gateId,
        gateName: gate?.name || gateId,
        blockers: blockers.length ? blockers : ['No blocker surfaced'],
        requiredModels: requirements.requiredModels,
        requiredCitations: requirements.requiredCitations,
        nextAction: definitiveNextAction(definitive) || nextGateAction(deal, requirements.requiredModels.length, requirements.requiredCitations.length),
        tone: tones[index % tones.length],
        definitive,
      };
    });
}

function buildDealPulse(deals: DealRow[], definitiveByDeal: Map<string, TodayDefinitiveDealState>): TodayDealPulseItem[] {
  const tones: Tone[] = ['cactus', 'gold', 'oat', 'plum', 'charcoal'];
  return [...deals]
    .sort((a, b) => fitScore(b) - fitScore(a))
    .slice(0, 6)
    .map((deal, index) => {
      const score = fitScore(deal);
      const definitive = definitiveByDeal.get(String(deal.id));
      return {
        dealId: String(deal.id),
        title: dealName(deal),
        status: score >= 84 ? 'Pursue' : score >= 72 ? 'Watch' : 'Hold',
        fit: score,
        thesis: dealThesis(deal),
        metric: `${fmtCents(deal.sde || deal.ebitda)} ${deal.sde ? 'SDE' : deal.ebitda ? 'EBITDA' : 'metric'}`,
        urgency: definitive ? `${shortReadinessLabel(definitive.readinessLevel)} · ${definitive.score}%` : Number(deal.review_count || 0) > 0 ? 'review waiting' : gateLabel(deal.current_gate),
        tone: tones[index % tones.length],
        nextAction: definitiveNextAction(definitive) || (Number(deal.review_count || 0) > 0
          ? 'Clear review queue'
          : Number(deal.stale_deliverable_count || 0) > 0
            ? 'Refresh output'
            : 'Open deal read'),
        definitive,
      };
    });
}

function buildFilesNeedingReview(
  deliverables: DeliverableRow[],
  reviews: ReviewRow[],
  definitivePackets: DefinitiveDealPacketRow[] = [],
): TodayFileReviewItem[] {
  const fromReviews = reviews.map((review, index) => ({
    id: `review-${review.id}`,
    title: review.doc_name || `${review.deal_name || 'Deal'} review`,
    dealId: review.deal_id ? String(review.deal_id) : undefined,
    dealTitle: review.deal_name || undefined,
    reason: review.focus_areas || review.reviewer_role || 'Review requested',
    status: review.status === 'reviewing' ? 'In review' : 'Review',
    tone: (index % 2 === 0 ? 'gold' : 'plum') as Tone,
    updatedAt: review.created_at,
  }));
  const fromDeliverables = deliverables
    .filter(item => item.is_stale || item.status !== 'complete')
    .slice(0, 8)
    .map((item, index) => ({
      id: `deliverable-${item.id}`,
      title: item.name || item.slug || 'Generated work product',
      dealId: item.deal_id ? String(item.deal_id) : undefined,
      dealTitle: item.deal_name || undefined,
      reason: item.is_stale ? (item.stale_reason || 'Needs refresh') : `Status: ${item.status}`,
      status: item.is_stale ? 'Refresh' : item.status.replace(/_/g, ' '),
      tone: (item.is_stale ? 'gold' : index % 2 === 0 ? 'oat' : 'cactus') as Tone,
      updatedAt: item.completed_at || item.created_at,
    }));
  const fromPackets = definitivePackets
    .slice(0, 6)
    .map((packet, index) => ({
      id: `definitive-packet-${packet.id}`,
      title: packetTypeLabel(packet.packet_type),
      dealId: packet.deal_id ? String(packet.deal_id) : undefined,
      dealTitle: packet.deal_name || undefined,
      reason: `${labelFromSlug(packet.tool_name)} · agent take-back packet`,
      status: 'Packet',
      tone: (index % 2 === 0 ? 'cactus' : 'oat') as Tone,
      updatedAt: packet.created_at,
      definitivePacketRowId: packet.id,
      definitivePacketId: packet.packet_id || undefined,
      definitivePacketType: packet.packet_type,
      definitivePacketCid: packet.packet_cid || undefined,
      definitiveStateCid: packet.deal_state_cid || undefined,
      definitiveToolName: packet.tool_name,
    }));
  return [...fromReviews, ...fromDeliverables, ...fromPackets].slice(0, 10);
}

function buildDefinitiveStateMap(
  states: DefinitiveDealStateSnapshotRow[],
  packets: DefinitiveDealPacketRow[],
): Map<string, TodayDefinitiveDealState> {
  const packetsByDeal = new Map<number, DefinitiveDealPacketRow[]>();
  packets.forEach(packet => {
    if (!packet.deal_id) return;
    const current = packetsByDeal.get(packet.deal_id) ?? [];
    current.push(packet);
    packetsByDeal.set(packet.deal_id, current);
  });

  const map = new Map<string, TodayDefinitiveDealState>();
  states.forEach(state => {
    if (!state.deal_id) return;
    const completeness = asRecord(state.completeness_report);
    const missingContract = asRecord(state.missing_input_contract);
    const missing = safeArray(missingContract.items).length
      || safeArray(completeness.missing).length;
    const blockers = safeArray(completeness.blockers).length;
    const dealPackets = packetsByDeal.get(state.deal_id) ?? [];
    const latestPacket = dealPackets[0];
    const packetTypes = Array.from(new Set(dealPackets.map(packet => packet.packet_type).filter(Boolean))).slice(0, 5);
    const nextSuggestedTool = firstSuggestedTool(dealPackets)
      || firstSuggestedToolFromContract(missingContract);

    map.set(String(state.deal_id), {
      stateCid: state.state_cid,
      readinessLevel: String(completeness.level || 'DRL0_UNCLASSIFIED'),
      score: clamp(Number(completeness.score || 0), 0, 100),
      nextGate: String(completeness.nextGate || 'information'),
      missingCount: missing,
      blockerCount: blockers,
      sourceCount: safeArray(state.source_index).length,
      packetTypes,
      latestPacketType: latestPacket?.packet_type,
      latestPacketId: latestPacket?.packet_id || undefined,
      latestPacketAt: latestPacket?.created_at,
      nextSuggestedTool,
      updatedAt: toIso(state.created_at),
    });
  });
  return map;
}

function buildStudioRefreshNeeds(books: StudioBookRow[]): TodayStudioRefreshItem[] {
  return books
    .map(book => {
      const slides = safeArray(book.slides);
      const outputs = safeArray(book.model_outputs);
      const slideWarnings = slides.filter((slide: any) => slide?.warningState && slide.warningState !== 'clean').length;
      const modelGaps = outputs.filter((output: any) => output?.status && output.status !== 'complete').length
        + outputs.filter((output: any) => safeArray(output?.missingInputs).length > 0).length;
      const provenance = book.provenance || {};
      const sourceGaps = Number(provenance?.slidesNeedingSources?.length || 0);
      const gaps = slideWarnings + modelGaps + sourceGaps;
      if (!gaps) return null;
      return {
        bookId: String(book.id),
        title: book.title,
        format: labelFromSlug(book.format),
        reason: modelGaps > 0 ? 'Linked model output needs refresh' : slideWarnings > 0 ? 'Slides need source grounding' : 'Sources need review',
        gaps,
        action: 'Refresh Studio book',
        tone: (modelGaps > 0 ? 'plum' : 'gold') as Tone,
      };
    })
    .filter(Boolean)
    .slice(0, 6) as TodayStudioRefreshItem[];
}

function buildFirmMemorySnapshot(rows: FirmMemoryRow[]): TodayFirmMemorySnapshot {
  const byType = (type: string) => rows
    .filter(row => row.memory_type === type)
    .slice(0, 5)
    .map(row => ({
      id: String(row.id),
      label: row.label,
      text: firmMemoryText(row),
      confidence: Number(row.confidence || 0.7),
      source: row.source,
    }));
  const updatedAt = rows
    .map(row => row.updated_at)
    .filter(Boolean)
    .sort()
    .at(-1);
  return {
    assumptions: byType('assumption'),
    houseStyle: byType('house_style'),
    providers: byType('provider'),
    dealPatterns: byType('deal_pattern'),
    workflows: byType('workflow'),
    stats: {
      total: rows.length,
      updatedAt,
    },
  };
}

function definitiveNextAction(definitive?: TodayDefinitiveDealState): string | null {
  if (!definitive) return null;
  if (definitive.missingCount > 0) return 'Update DealState inputs';
  if (definitive.nextSuggestedTool) return `Run ${labelFromSlug(definitive.nextSuggestedTool)}`;
  if (definitive.latestPacketType) return `Open ${packetTypeLabel(definitive.latestPacketType)}`;
  return 'Resume DealState loop';
}

function firstSuggestedTool(packets: DefinitiveDealPacketRow[]): string | undefined {
  for (const packet of packets) {
    const calls = safeArray(packet.next_suggested_calls);
    const tool = firstToolNameFromCalls(calls);
    if (tool) return tool;
  }
  return undefined;
}

function firstSuggestedToolFromContract(contract: Record<string, any>): string | undefined {
  const tool = firstToolNameFromCalls(safeArray(contract.next_suggested_calls));
  if (tool) return tool;
  const items = safeArray(contract.items);
  const surface = String(items[0]?.surface || '').trim();
  if (surface === 'files') return 'compose_data_room_index';
  if (surface === 'studio') return 'compose_document_draft';
  if (surface === 'models') return 'compose_model_stack';
  return undefined;
}

function firstToolNameFromCalls(calls: any[]): string | undefined {
  const call = calls.find(item => typeof item?.toolName === 'string' && item.toolName.trim());
  return call?.toolName;
}

function dedupeDeals(deals: DealRow[]): DealRow[] {
  const seen = new Set<number>();
  return deals.filter(deal => {
    if (seen.has(deal.id)) return false;
    seen.add(deal.id);
    return true;
  });
}

function hashSnapshot(snapshot: TodaySnapshot): string {
  const basis = {
    deals: snapshot.deals.map(item => [item.id, item.updated_at, item.current_gate, item.review_count, item.stale_deliverable_count]),
    deliverables: snapshot.deliverables.map(item => [item.id, item.status, item.is_stale, item.completed_at, item.created_at]),
    reviews: snapshot.reviews.map(item => [item.id, item.status, item.created_at]),
    studio: snapshot.studioBooks.map(item => [item.id, item.updated_at, safeArray(item.slides).length, safeArray(item.model_outputs).length]),
    memory: snapshot.firmMemory.map(item => [item.id, item.updated_at, item.memory_type, item.label]),
    definitiveStates: snapshot.definitiveStates.map(item => [item.id, item.deal_id, item.state_cid, item.state_hash, item.created_at]),
    definitivePackets: snapshot.definitivePackets.map(item => [item.id, item.deal_id, item.packet_type, item.packet_id, item.created_at]),
  };
  return crypto.createHash('sha256').update(JSON.stringify(basis)).digest('hex');
}

function dealName(deal: DealRow): string {
  return deal.business_name || deal.name || deal.industry || `Deal #${deal.id}`;
}

function dealThesis(deal: DealRow): string {
  const notes = deal.financials?.notes || deal.financials?.summary || deal.financials?.thesis;
  if (typeof notes === 'string' && notes.trim()) return notes.trim();
  const docCount = Number(deal.document_count || 0);
  const reviewCount = Number(deal.review_count || 0);
  if (reviewCount > 0) return `${reviewCount} review item${reviewCount === 1 ? '' : 's'} should be cleared before the next external touch.`;
  if (docCount > 0) return `${docCount} source item${docCount === 1 ? '' : 's'} attached for diligence and model support.`;
  return `${deal.industry || 'Deal'} read is keyed to gate ${deal.current_gate || 'intake'} and the next source-backed move.`;
}

function fitScore(deal: DealRow): number {
  if (deal.seven_factor_composite) return clamp(Math.round(Number(deal.seven_factor_composite)), 48, 96);
  const metric = Number(deal.ebitda || deal.sde || 0) / 100;
  if (metric >= 5_000_000) return 92;
  if (metric >= 2_500_000) return 86;
  if (metric >= 1_000_000) return 80;
  if (metric >= 500_000) return 74;
  return 68;
}

function nextGateAction(deal: DealRow, modelCount: number, citationCount: number): string {
  if (Number(deal.review_count || 0) > 0) return 'Clear review queue';
  if (Number(deal.stale_deliverable_count || 0) > 0) return 'Refresh stale output';
  if (modelCount > 0 || citationCount > 0) return 'Run readiness check';
  return 'Open next action';
}

function gateLabel(gateId: string | null): string {
  if (!gateId) return 'intake';
  const gate = GATE_MAP[gateId];
  return gate ? gate.name : gateId;
}

function fmtCents(cents: number | null | undefined): string {
  if (!cents) return '--';
  const dollars = Number(cents) / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
  if (dollars >= 1_000) return `$${Math.round(dollars / 1_000)}K`;
  return `$${Math.round(dollars).toLocaleString()}`;
}

function firmMemoryText(row: FirmMemoryRow): string {
  const value = row.value || {};
  if (typeof value.text === 'string') return value.text;
  if (typeof value.summary === 'string') return value.summary;
  if (typeof value.note === 'string') return value.note;
  return JSON.stringify(value);
}

function labelFromSlug(input: string): string {
  return String(input || 'Studio book')
    .replace(/[-_]+/g, ' ')
    .replace(/\.+v\d+$/i, '')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function packetTypeLabel(input: string): string {
  const withoutVersion = String(input || 'DEFINITIVE packet').replace(/\.v\d+(\.\d+)?$/i, '');
  return labelFromSlug(withoutVersion);
}

function shortReadinessLabel(level: string): string {
  const match = String(level || '').match(/DRL\d+/);
  return match?.[0] || 'DRL';
}

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}

function timeLabel(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'now';
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function toIso(value: any): string {
  if (value instanceof Date) return value.toISOString();
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : new Date().toISOString();
}

function safeArray(value: any): any[] {
  return Array.isArray(value) ? value : [];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
