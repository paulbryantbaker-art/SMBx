/**
 * Deal Memory Service — the "return to a deal after months" substrate.
 *
 * Deals take time. A user (or an agent) coming back to a deal six months
 * later — including a deal thought to be dead — must find everything the
 * platform ever learned about it, WITH DATES, plus an honest read on what
 * has gone stale in the meantime.
 *
 * One canonical dossier assembly, three consumers:
 *   - Yulia's get_deal_dossier chat tool (tools.ts) — works for ANY status,
 *     including completed/dormant deals invisible to active-only queries
 *   - the deal://{dealId}/dossier agent resource (v19ResourceReader.ts)
 *   - promptBuilder's re-entry layer (dormancy detection on the active deal)
 *
 * THE LINE: everything here is descriptive — dates, ages, and recorded
 * facts. Staleness is surfaced as "as of" dates for Yulia to narrate, never
 * as an instruction to transact.
 */
import { sql } from '../db.js';
import { hasDealAccess } from './dealAccessService.js';

export interface DealDossier {
  deal: {
    id: number;
    businessName: string | null;
    industry: string | null;
    journey: string | null;
    currentGate: string | null;
    league: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
    revenueCents: number | null;
    sdeCents: number | null;
    ebitdaCents: number | null;
    askingPriceCents: number | null;
    financialSnapshotAt: string | null;
  };
  /** Most recent user-visible touch — chat message (the CALLER's own
   *  threads only), activity-log event, gate event, or deliverable. */
  lastTouchedAt: string | null;
  dormantDays: number | null;
  gateTimeline: Array<{ date: string; what: string }>;
  /** chapters/openThreads contain ONLY the requesting user's conversation
   *  summaries. Yulia chats are per-user private — a deal participant
   *  (counterparty, lender, advisor) must never receive the owner's private
   *  strategy threads, and vice versa. */
  chapters: Array<{ title: string | null; summary: string; closedAt: string }>;
  openThreads: Array<{ title: string | null; summary: string; lastActiveAt: string }>;
  latestModelRuns: Array<{ modelId: string; at: string }>;
  deliverables: Array<{ type: string; status: string; at: string }>;
  /** Data-room document inventory — OWNER ONLY (participants get folder-
   *  scoped visibility elsewhere; the dossier must not widen it). */
  documents: Array<{ name: string; status: string; at: string }>;
  recentActivity: Array<{ date: string; what: string }>;
  conversationCount: number;
  messageCount: number;
}

function iso(d: unknown): string | null {
  if (!d) return null;
  const t = new Date(d as string);
  return Number.isFinite(+t) ? t.toISOString() : null;
}

function fmtDate(isoStr: string | null): string {
  if (!isoStr) return 'unknown date';
  return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function humanizeAge(isoStr: string | null): string {
  if (!isoStr) return 'no recorded date';
  const days = Math.floor((Date.now() - new Date(isoStr).getTime()) / 86_400_000);
  if (days < 1) return 'today';
  if (days < 31) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30.44);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

function fmtMoney(cents: number | null): string | null {
  if (cents == null) return null;
  const dollars = cents / 100;
  if (Math.abs(dollars) >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (Math.abs(dollars) >= 1_000) return `$${Math.round(dollars / 1_000)}K`;
  return `$${Math.round(dollars)}`;
}

/** Resolve a deal by numeric id or name fragment — ANY status, across BOTH
 *  owned and accepted-participant deals (advisors/brokers return to deals
 *  they advise on too). ID is tried first; a numeric business name like
 *  "365 Logistics" still resolves via the name fallback in the caller. */
export async function findDealByIdOrName(userId: number, query: string | number): Promise<{ id: number } | null> {
  const asNum = Number(query);
  if (Number.isInteger(asNum) && asNum > 0) {
    const [byId] = await sql`SELECT id FROM deals WHERE id = ${asNum} AND user_id = ${userId} LIMIT 1`;
    if (byId) return { id: byId.id };
    const [byIdPart] = await sql`
      SELECT d.id FROM deals d JOIN deal_participants dp ON dp.deal_id = d.id
      WHERE d.id = ${asNum} AND dp.user_id = ${userId} AND dp.accepted_at IS NOT NULL LIMIT 1
    `;
    if (byIdPart) return { id: byIdPart.id };
  }
  const q = String(query).trim();
  if (!q) return null;
  const [byName] = await sql`
    SELECT id, updated_at FROM (
      SELECT id, updated_at FROM deals
      WHERE user_id = ${userId} AND business_name ILIKE ${'%' + q + '%'}
      UNION
      SELECT d.id, d.updated_at FROM deals d JOIN deal_participants dp ON dp.deal_id = d.id
      WHERE dp.user_id = ${userId} AND dp.accepted_at IS NOT NULL AND d.business_name ILIKE ${'%' + q + '%'}
    ) matches ORDER BY updated_at DESC LIMIT 1
  `;
  return byName ? { id: byName.id } : null;
}

/** Most recent user-visible touch on a deal. The messages term reads only
 *  the CALLER's own conversations (per-user privacy — see DealDossier).
 *
 *  excludeLatestMessage: pass true ONLY from the live-chat path, where the
 *  user's return message was already saved before the prompt builds — there
 *  the newest message is "now" and must be skipped or dormancy never
 *  detects. Dossier reads (tool mid-conversation about another deal, agent
 *  resource) have no just-sent message in the TARGET deal, so they read the
 *  genuinely-newest one. */
export async function computePreviousTouch(
  dealId: number,
  userId: number,
  opts?: { excludeLatestMessage?: boolean },
): Promise<string | null> {
  const offset = opts?.excludeLatestMessage ? 1 : 0;
  const [row] = await sql`
    SELECT GREATEST(
      (SELECT m.created_at FROM messages m JOIN conversations c ON c.id = m.conversation_id
       WHERE c.deal_id = ${dealId} AND c.user_id = ${userId}
       ORDER BY m.created_at DESC, m.id DESC OFFSET ${offset} LIMIT 1),
      (SELECT MAX(created_at) FROM deal_activity_log WHERE deal_id = ${dealId}),
      (SELECT MAX(created_at) FROM gate_events WHERE deal_id = ${dealId}),
      (SELECT MAX(created_at) FROM deliverables WHERE deal_id = ${dealId})
    ) AS last_touched
  `;
  return iso(row?.last_touched);
}

export async function buildDealDossier(userId: number, dealId: number): Promise<DealDossier | null> {
  // Shared owner-or-accepted-participant predicate — no status filter, so
  // dormant/completed deals stay reachable. The ROLE matters below: owners
  // get the data-room inventory; conversation summaries are always scoped
  // to the requesting user's own threads.
  const access = await hasDealAccess(dealId, userId);
  if (!access) return null;
  const isOwner = access.role === 'owner';
  const [deal] = await sql`
    SELECT id, business_name, industry, journey_type, current_gate, league, status,
           created_at, updated_at, revenue, sde, ebitda, asking_price, financial_snapshot_at
    FROM deals WHERE id = ${dealId} LIMIT 1
  `;
  if (!deal) return null;

  const [gateEvents, completedConvos, activeConvos, modelRuns, deliverableRows, documentRows, activity, counts, lastTouchedAt] = await Promise.all([
    sql`
      SELECT from_gate, to_gate, event_type, created_at FROM gate_events
      WHERE deal_id = ${dealId} ORDER BY created_at DESC LIMIT 20
    `,
    // Chapters chronologically — separate query from open threads so a busy
    // deal's active threads can never evict the "what was established"
    // record. user_id scope: Yulia chats are per-user private.
    sql`
      SELECT title, summary, updated_at FROM conversations
      WHERE deal_id = ${dealId} AND user_id = ${userId}
        AND gate_status = 'completed' AND summary IS NOT NULL
      ORDER BY updated_at ASC LIMIT 10
    `,
    sql`
      SELECT title, summary, updated_at FROM conversations
      WHERE deal_id = ${dealId} AND user_id = ${userId}
        AND gate_status != 'completed' AND summary IS NOT NULL
      ORDER BY updated_at DESC LIMIT 4
    `,
    sql`
      SELECT DISTINCT ON (model_id) model_id, created_at FROM model_executions
      WHERE deal_id = ${dealId} ORDER BY model_id, created_at DESC
    `,
    sql`
      SELECT type, status, created_at FROM deliverables
      WHERE deal_id = ${dealId} ORDER BY created_at DESC LIMIT 10
    `,
    // Data-room inventory is owner-only: participants are folder-scoped
    // elsewhere and the dossier must not widen what they can see.
    isOwner
      ? sql`
          SELECT name, status, created_at FROM data_room_documents
          WHERE deal_id = ${dealId} ORDER BY created_at DESC LIMIT 15
        `
      : Promise.resolve([] as any[]),
    sql`
      SELECT INITCAP(action) || COALESCE(' (' || target_type || ')', '') AS what, created_at
      FROM deal_activity_log WHERE deal_id = ${dealId}
      ORDER BY created_at DESC LIMIT 10
    `,
    sql`
      SELECT
        (SELECT COUNT(*) FROM conversations WHERE deal_id = ${dealId} AND user_id = ${userId}) AS convo_count,
        (SELECT COUNT(*) FROM messages m JOIN conversations c ON c.id = m.conversation_id
         WHERE c.deal_id = ${dealId} AND c.user_id = ${userId}) AS msg_count
    `,
    computePreviousTouch(dealId, userId),
  ]);

  const dormantDays = lastTouchedAt
    ? Math.floor((Date.now() - new Date(lastTouchedAt).getTime()) / 86_400_000)
    : null;

  return {
    deal: {
      id: deal.id,
      businessName: deal.business_name,
      industry: deal.industry,
      journey: deal.journey_type,
      currentGate: deal.current_gate,
      league: deal.league,
      status: deal.status,
      createdAt: iso(deal.created_at)!,
      updatedAt: iso(deal.updated_at)!,
      revenueCents: deal.revenue != null ? Number(deal.revenue) : null,
      sdeCents: deal.sde != null ? Number(deal.sde) : null,
      ebitdaCents: deal.ebitda != null ? Number(deal.ebitda) : null,
      askingPriceCents: deal.asking_price != null ? Number(deal.asking_price) : null,
      financialSnapshotAt: iso(deal.financial_snapshot_at),
    },
    lastTouchedAt,
    dormantDays,
    gateTimeline: gateEvents.map((g: any) => ({
      date: iso(g.created_at)!,
      what: `Gate ${g.from_gate} → ${g.to_gate}${g.event_type === 'auto_advance' ? '' : ` (${g.event_type})`}`,
    })),
    chapters: completedConvos.map((c: any) => ({
      title: c.title, summary: c.summary, closedAt: iso(c.updated_at)!,
    })),
    openThreads: activeConvos.map((c: any) => ({
      title: c.title, summary: c.summary, lastActiveAt: iso(c.updated_at)!,
    })),
    latestModelRuns: modelRuns.map((m: any) => ({ modelId: m.model_id, at: iso(m.created_at)! })),
    deliverables: deliverableRows.map((d: any) => ({ type: d.type, status: d.status, at: iso(d.created_at)! })),
    documents: documentRows.map((doc: any) => ({ name: doc.name, status: doc.status, at: iso(doc.created_at)! })),
    recentActivity: activity.map((a: any) => ({ date: iso(a.created_at)!, what: a.what })),
    conversationCount: Number(counts[0]?.convo_count ?? 0),
    messageCount: Number(counts[0]?.msg_count ?? 0),
  };
}

/** Render the dossier as the prompt/tool text block — every line dated. */
export function formatDealDossierForPrompt(d: DealDossier): string {
  const lines: string[] = [];
  const name = d.deal.businessName || `Deal ${d.deal.id}`;
  lines.push(`## DEAL DOSSIER — ${name} (ID ${d.deal.id}, ${(d.deal.journey || 'journey?').toUpperCase()} @ ${d.deal.currentGate || '?'}, status: ${d.deal.status})`);
  lines.push(`Created ${fmtDate(d.deal.createdAt)} · last touched ${d.lastTouchedAt ? `${fmtDate(d.lastTouchedAt)} (${humanizeAge(d.lastTouchedAt)})` : 'no recorded activity'} · ${d.conversationCount} conversations, ${d.messageCount} messages on record.`);

  const fin: string[] = [];
  const rev = fmtMoney(d.deal.revenueCents); if (rev) fin.push(`revenue ${rev}`);
  const sde = fmtMoney(d.deal.sdeCents); if (sde) fin.push(`SDE ${sde}`);
  const ebitda = fmtMoney(d.deal.ebitdaCents); if (ebitda) fin.push(`EBITDA ${ebitda}`);
  const ask = fmtMoney(d.deal.askingPriceCents); if (ask) fin.push(`asking ${ask}`);
  if (fin.length > 0) {
    const asOf = d.deal.financialSnapshotAt ?? d.deal.updatedAt;
    lines.push(`Financials on record: ${fin.join(', ')} — as of ${fmtDate(asOf)} (${humanizeAge(asOf)}). State this age when citing them; offer a refresh if they are months old.`);
  }

  if (d.gateTimeline.length > 0) {
    lines.push(`\nGate timeline:`);
    for (const g of [...d.gateTimeline].reverse()) lines.push(`- ${fmtDate(g.date)} — ${g.what}`);
  }
  if (d.chapters.length > 0) {
    lines.push(`\nCompleted chapters (what was established):`);
    for (const c of d.chapters) lines.push(`- **${c.title || 'Untitled'}** (closed ${fmtDate(c.closedAt)}): ${c.summary}`);
  }
  if (d.openThreads.length > 0) {
    lines.push(`\nOpen threads:`);
    for (const t of d.openThreads) lines.push(`- **${t.title || 'Untitled'}** (last active ${fmtDate(t.lastActiveAt)}): ${t.summary}`);
  }
  if (d.latestModelRuns.length > 0) {
    lines.push(`\nLatest model runs (one per model):`);
    for (const m of d.latestModelRuns) lines.push(`- ${m.modelId} — ${fmtDate(m.at)} (${humanizeAge(m.at)})`);
  }
  if (d.deliverables.length > 0) {
    lines.push(`\nDeliverables:`);
    for (const dv of d.deliverables) lines.push(`- ${dv.type} (${dv.status}) — ${fmtDate(dv.at)}`);
  }
  if (d.documents.length > 0) {
    lines.push(`\nData-room documents:`);
    for (const doc of d.documents) lines.push(`- ${doc.name} (${doc.status}) — ${fmtDate(doc.at)}`);
  }
  if (d.recentActivity.length > 0) {
    lines.push(`\nMost recent recorded activity:`);
    for (const a of d.recentActivity) lines.push(`- ${fmtDate(a.date)} — ${a.what}`);
  }
  return lines.join('\n');
}

/**
 * Re-entry layer for the active deal in chat. Fires when the deal has been
 * untouched for 30+ days: tells Yulia time has passed, with dates, and to
 * open with an orientation instead of pretending continuity.
 */
export async function buildReentryLayer(userId: number, dealId: number): Promise<string | null> {
  try {
    // excludeLatestMessage: the user's return message was already saved
    // before the prompt builds — without the exclusion, dormancy never fires.
    const prev = await computePreviousTouch(dealId, userId, { excludeLatestMessage: true });
    if (!prev) return null;
    const days = Math.floor((Date.now() - new Date(prev).getTime()) / 86_400_000);
    if (days < 30) return null;
    const [deal] = await sql`SELECT financial_snapshot_at, updated_at FROM deals WHERE id = ${dealId} LIMIT 1`;
    const finAsOf = iso(deal?.financial_snapshot_at) ?? iso(deal?.updated_at);
    const [lastRun] = await sql`SELECT MAX(created_at) AS at FROM model_executions WHERE deal_id = ${dealId}`;
    const runAsOf = iso(lastRun?.at);
    return `\n## RETURNING TO THIS DEAL AFTER TIME AWAY
The previous recorded activity on this deal was ${fmtDate(prev)} — ${humanizeAge(prev)}. The user is coming back to it; do not pretend seamless continuity.
- Open with a short re-entry orientation: what was established (the chapter and thread summaries above), where the deal stands (gate, timeline), and what happened last.
- Data ages to state plainly: financials as of ${fmtDate(finAsOf)} (${humanizeAge(finAsOf)})${runAsOf ? `; latest model run ${fmtDate(runAsOf)} (${humanizeAge(runAsOf)})` : '; no model runs on record'}. Months-old figures, market conditions, and rate assumptions may no longer hold — say so and offer to refresh the data or re-run the models before relying on them.
- If the user thought this deal was dead, confirm whether they want to revive, update, or close it out.`;
  } catch {
    return null;
  }
}
