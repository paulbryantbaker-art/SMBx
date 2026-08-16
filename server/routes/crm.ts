/**
 * CRM — the client pipeline (migration 113).
 *
 * The acquirers the practice serves, as distinct from the targets it
 * underwrites. See WHERE_THE_WORK_HAPPENS.md §5 for why this had no home.
 *
 * SCORING LIVES IN `house/leads.ts`, not here. That file is pure — no db, no
 * API — so the app and a local Cowork session (`scripts/studio/leads.mts`) rank
 * the same register identically. This router imports it, materialises the result
 * onto the row so the board can sort in SQL, and stamps `scored_at`. Anything
 * that changes a scoring input re-scores that row on the spot.
 *
 * THE LINE: this TRACKS a relationship. It never contacts anyone, never quotes a
 * fee, and never records compensation — the engagement letter is a human
 * artefact and stays outside the app.
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import {
  parseLeadCsv, rankLeads, scoreLead, picture, LEAD_COLUMNS,
  type LeadRow, type LeadBox, type RankedLead,
} from '../../house/leads.js';
import { toCsv } from '../../house/screen.js';

export const crmRouter = Router();
crmRouter.use(requireAuth);

/** Pipeline stages for a CLIENT relationship — deliberately not deal gates.
 *  A deal gate describes a target; this describes whether we have a mandate.
 *  The spec set (CRM_WORKFLOW_SPEC.md, adopted 2026-08-16); migration 131
 *  mapped the old six. Mirrors CRM_STAGES in client/src/lib/crm.ts. */
export const CRM_STAGES = [
  'lead', 'contacted', 'conversation', 'qualified', 'proposal', 'negotiation',
  'won', 'nurture', 'lost',
] as const;

/** Target origination stages (deal funnel, pre-IoI). Mirrors lib/crm.ts. */
export const TARGET_STAGES = [
  'sourced', 'in_wave', 'contacted', 'conversation', 'nda', 'financials_in', 'ioi_decision',
] as const;

const ACTIVITY_KINDS = ['note', 'email', 'call', 'meeting', 'intro', 'stage_change'];

/** Why a pursuit died (CRM_WORKFLOW_SPEC.md). Required when stage → passed.
 *  The histogram of these is the P4-hypothesis evidence — in particular
 *  whether "internal BD owns origination" is the pattern that beats us. */
export const LOSS_REASONS = [
  'no_budget', 'internal_bd_owns_origination', 'timing',
  'lost_to_competitor', 'trigger_evaporated', 'unresponsive',
] as const;

/**
 * What kind of organisation a row is (migration 115). ONE address book, because
 * Paul's framing is "whatever, as long as I have their email" — a CPA has to be
 * mailable from a campaign AND assignable from a deal, and two registers would
 * mean two answers to "who do we know".
 *
 * `acquirer` is the only kind house/leads.ts ranks: a law firm is in the book to
 * be reachable, not to be scored. The Clients board therefore defaults to
 * acquirers so it does not fill up with counsel.
 */
export const ACCOUNT_KINDS = ['acquirer', 'service_provider', 'target', 'other'] as const;

/** Markets we hold a verified master for. Drives the lane score; overridable
 *  per request so the board can be re-cut when a new master lands. */
const DEFAULT_TRADES = ['fire and life safety', 'hvac', 'plumbing'];

const today = () => new Date().toISOString().slice(0, 10);

function boxFrom(body: any): LeadBox {
  const t = Array.isArray(body?.trades)
    ? body.trades.map((s: unknown) => String(s).trim().toLowerCase()).filter(Boolean)
    : DEFAULT_TRADES;
  return { trades: t, metro: 'Dallas', asOf: today() };
}

/** Host only — no scheme, no www, no path. The dedupe key. */
function normDomain(s: string | undefined | null): string | null {
  const v = (s || '').trim().toLowerCase();
  if (!v) return null;
  const m = v.replace(/^[a-z]+:\/\//, '').replace(/^www\./, '').split(/[/?#]/)[0];
  return m || null;
}

/** A DB row back into the shape `house/leads.ts` scores. Kept in one place so
 *  the scorer can never be handed a differently-shaped object by two callers. */
function toLeadRow(r: any): LeadRow {
  return {
    firm: r.firm ?? '',
    segment: r.segment ?? '',
    website: r.website ?? '',
    hq_city: r.hq_city ?? '',
    hq_state: r.hq_state ?? '',
    trades: r.trades ?? '',
    dfw: r.dfw ?? '',
    grade: r.grade ?? '',
    buyer_moment: r.buyer_moment ?? '',
    product_fit: r.product_fit ?? '',
    key_person: r.key_person ?? '',
    key_person_title: r.key_person_title ?? '',
    sponsor: r.sponsor ?? '',
    evidence: r.evidence ?? '',
    source_url: r.source_url ?? '',
    notes: r.notes ?? '',
    last_deal_on: r.last_deal_on ? String(r.last_deal_on).slice(0, 10) : '',
    disqualified: r.disqualified ?? '',
  };
}

/** ISO date or null — a blank cell must not become 1970. */
function dateOrNull(v: unknown): string | null {
  const s = String(v ?? '').trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s)) ? s : null;
}

/* ── the board ────────────────────────────────────────────────────────── */

/**
 * GET /api/crm/accounts
 *   ?archived=1  the archive instead of the working set
 *   ?tier=A      &stage=prospect  &dfw=yes  &moment=thesis_no_flow
 *   ?due=1       only rows with next_action_on today or earlier
 *   ?q=          substring over firm / notes / trades
 * Ordered by score, because the point of the board is what to do next.
 */
crmRouter.get('/crm/accounts', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const q = String(req.query.q ?? '').trim();
    const archived = req.query.archived === '1' || req.query.archived === 'true';
    // Default to acquirers: the ranked client pipeline. `?kind=all` opens the
    // whole address book (counsel, CPAs, targets), `?kind=service_provider`
    // narrows to the professionals.
    const kindParam = String(req.query.kind ?? 'acquirer');
    const kindFilter = kindParam === 'all' ? null
      : (ACCOUNT_KINDS as readonly string[]).includes(kindParam) ? kindParam : 'acquirer';

    const rows = await sql`
      SELECT a.*,
             -- ::int MATTERS (2026-08-16). postgres-js returns a bare COUNT(*)
             -- (int8) as a STRING to protect precision, and "0" is truthy — so
             -- Clients.tsx's !a.contact_count "no contact" flag had NEVER
             -- fired, on desktop or mobile, since the board shipped. The
             -- summary endpoint below always cast; these two were missed.
             (SELECT COUNT(*)::int FROM crm_contacts c WHERE c.account_id = a.id) AS contact_count,
             (SELECT COUNT(*)::int FROM crm_activity v WHERE v.account_id = a.id) AS activity_count,
             (SELECT MAX(v.occurred_at) FROM crm_activity v WHERE v.account_id = a.id) AS last_touch_at
      FROM crm_accounts a
      WHERE a.user_id = ${userId}
        AND a.archived = ${archived}
        ${kindFilter ? sql`AND COALESCE(a.kind, 'acquirer') = ${kindFilter}` : sql``}
        ${req.query.tier ? sql`AND a.tier = ${String(req.query.tier)}` : sql``}
        ${req.query.stage ? sql`AND a.stage = ${String(req.query.stage)}` : sql``}
        ${req.query.dfw ? sql`AND a.dfw = ${String(req.query.dfw)}` : sql``}
        ${req.query.moment ? sql`AND a.buyer_moment = ${String(req.query.moment)}` : sql``}
        ${req.query.due ? sql`AND a.next_action_on IS NOT NULL AND a.next_action_on <= CURRENT_DATE` : sql``}
        ${q ? sql`AND (a.firm ILIKE ${'%' + q + '%'} OR a.notes ILIKE ${'%' + q + '%'} OR a.trades ILIKE ${'%' + q + '%'})` : sql``}
      ORDER BY (a.tier IS NULL), a.tier ASC, a.score DESC NULLS LAST, a.firm ASC
    `;
    return res.json(rows);
  } catch (err: any) {
    console.error('CRM list error:', err.message);
    return res.status(500).json({ error: 'Failed to list accounts' });
  }
});

/** GET /api/crm/summary — the picture, counted from the rows themselves. */
crmRouter.get('/crm/summary', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const rows = await sql`
      SELECT * FROM crm_accounts WHERE user_id = ${userId} AND archived = FALSE
    `;
    const ranked = rows.map(r => ({
      ...toLeadRow(r), score: r.score ?? 0, tier: r.tier ?? 'D',
      score_detail: r.score_detail ?? '', pitch: r.pitch ?? 'unknown',
    })) as RankedLead[];

    const [due] = await sql`
      SELECT COUNT(*)::int AS n FROM crm_accounts
      WHERE user_id = ${userId} AND archived = FALSE
        AND next_action_on IS NOT NULL AND next_action_on <= CURRENT_DATE
    `;
    const stages = await sql`
      SELECT stage, COUNT(*)::int AS n FROM crm_accounts
      WHERE user_id = ${userId} AND archived = FALSE GROUP BY stage
    `;
    return res.json({
      ...picture(ranked),
      byStage: Object.fromEntries(stages.map(s => [s.stage, s.n])),
      dueNow: due?.n ?? 0,
    });
  } catch (err: any) {
    console.error('CRM summary error:', err.message);
    return res.status(500).json({ error: 'Failed to summarise' });
  }
});

/**
 * GET /api/crm/picker — the id+name list a deal's "run for" selector needs.
 * Deliberately tiny (no evidence, no notes, no score detail): a picker that
 * shipped the whole board would move ~80 rows of prose to render a dropdown.
 * Archived clients are excluded — you do not assign new work to a retired one.
 */
crmRouter.get('/crm/picker', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const rows = await sql`
      SELECT id, firm, stage, tier FROM crm_accounts
      WHERE user_id = ${userId} AND archived = FALSE
      ORDER BY firm ASC
    `;
    return res.json(rows);
  } catch (err: any) {
    console.error('CRM picker error:', err.message);
    return res.status(500).json({ error: 'Failed to list clients' });
  }
});

/**
 * GET /api/crm/contacts — the flat address book, for assignee pickers.
 *   ?role=cpa      narrow to a profession
 *   ?mailable=1    only rows with an email and no unsubscribe
 *
 * Flat and cross-account on purpose: the CPA a deal needs an action from works
 * at a different firm than the client, so a picker scoped to one account would
 * never find them.
 */
crmRouter.get('/crm/contacts', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const role = String(req.query.role ?? '').trim();
    const mailable = req.query.mailable === '1' || req.query.mailable === 'true';
    const rows = await sql`
      SELECT c.id, c.name, c.title, c.role, c.email, c.is_primary,
             c.unsubscribed_at, a.id AS account_id, a.firm,
             COALESCE(a.kind, 'acquirer') AS account_kind,
             -- Per-PERSON last touch (People directory). Distinct from the
             -- account-level MAX the accounts list carries: a firm touched
             -- yesterday through a colleague still shows THIS person untouched.
             (SELECT MAX(v.occurred_at) FROM crm_activity v WHERE v.contact_id = c.id) AS last_touch_at
      FROM crm_contacts c
      JOIN crm_accounts a ON a.id = c.account_id
      WHERE a.user_id = ${userId} AND a.archived = FALSE
        ${role ? sql`AND c.role = ${role}` : sql``}
        ${mailable ? sql`AND c.email IS NOT NULL AND c.email <> '' AND c.unsubscribed_at IS NULL` : sql``}
      ORDER BY a.firm ASC, c.is_primary DESC, c.name ASC
      LIMIT 2000
    `;
    return res.json(rows);
  } catch (err: any) {
    console.error('CRM contacts error:', err.message);
    return res.status(500).json({ error: 'Failed to list contacts' });
  }
});

/** GET /api/crm/accounts/:id — the account with its people, history and the
 *  deals being run for it (migration 114's join, read from this side). */
crmRouter.get('/crm/accounts/:id', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Bad id' });

    const [account] = await sql`
      SELECT * FROM crm_accounts WHERE id = ${id} AND user_id = ${userId}
    `;
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const contacts = await sql`
      SELECT * FROM crm_contacts WHERE account_id = ${id}
      ORDER BY is_primary DESC, name ASC
    `;
    const activity = await sql`
      SELECT * FROM crm_activity WHERE account_id = ${id}
      ORDER BY occurred_at DESC LIMIT 200
    `;
    // Best-effort: before migration 114 the column does not exist, and a client
    // that cannot list its deals is far better than a detail pane that 500s.
    let deals: any[] = [];
    try {
      deals = await sql`
        SELECT id, business_name, name, current_gate, status, next_action, next_action_on
        FROM deals
        WHERE crm_account_id = ${id} AND user_id = ${userId} AND archived = FALSE
        ORDER BY updated_at DESC
      `;
    } catch (e: any) {
      console.warn('[crm] deals-for-client unavailable (migration 114?):', e?.message);
    }

    // The searches running for this client (migration 116). This is the top of
    // the chain that already existed: thesis → portfolio → candidates → deal.
    // Same best-effort guard, same reason.
    let searches: any[] = [];
    try {
      searches = await sql`
        SELECT t.id, t.name, t.industry, t.geography, t.is_active,
               (SELECT COUNT(*) FROM sourcing_candidates c WHERE c.thesis_id = t.id) AS candidate_count
        FROM buyer_theses t
        WHERE t.crm_account_id = ${id} AND t.user_id = ${userId}
        ORDER BY t.updated_at DESC
      `;
    } catch (e: any) {
      console.warn('[crm] searches-for-client unavailable (migration 116?):', e?.message);
    }
    return res.json({ account, contacts, activity, deals, searches });
  } catch (err: any) {
    console.error('CRM read error:', err.message);
    return res.status(500).json({ error: 'Failed to read account' });
  }
});

/* ── import ───────────────────────────────────────────────────────────── */

/** Columns the importer will write. Anything else in the CSV is IGNORED rather
 *  than silently coerced — and reported back, so a renamed column in the Sheet
 *  surfaces instead of quietly going missing. */
const IMPORTABLE = new Set([
  'firm', 'segment', 'website', 'hq_city', 'hq_state', 'trades', 'dfw', 'grade',
  'buyer_moment', 'product_fit', 'key_person', 'key_person_title', 'sponsor',
  'evidence', 'source_url', 'notes', 'last_deal_on', 'disqualified',
]);

/**
 * POST /api/crm/accounts/import   { csv: "...", trades?: string[] }
 *
 * Upsert by (user_id, lower(firm)). An existing row is UPDATED, so re-importing
 * the Sheet after a research pass refreshes evidence without duplicating firms —
 * and the PIPELINE FIELDS a human set in the app (stage, owner, next action) are
 * never touched by an import. That asymmetry is the whole point: the Sheet owns
 * the research, the app owns the pipeline.
 *
 * `key_person` becomes the primary contact. Existing contacts are left alone.
 */
crmRouter.post('/crm/accounts/import', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const csv = typeof req.body?.csv === 'string' ? req.body.csv : '';
    if (!csv.trim()) return res.status(400).json({ error: 'csv (string) is required' });

    const rows = parseLeadCsv(csv);
    if (!rows.length) {
      return res.status(400).json({ error: 'No rows with a firm name — is that the right file?' });
    }

    const box = boxFrom(req.body);
    const ranked = rankLeads(rows, box);

    // Report unknown columns instead of dropping them in silence.
    const seen = new Set<string>();
    rows.forEach(r => Object.keys(r).forEach(k => seen.add(k)));
    const ignored = [...seen].filter(k => !IMPORTABLE.has(k) && !['score', 'tier', 'pitch', 'score_detail'].includes(k));

    let created = 0, updated = 0, contactsAdded = 0;

    for (const r of ranked) {
      const firm = (r.firm || '').trim();
      if (!firm) continue;

      const vals = {
        user_id: userId,
        firm,
        website: r.website || null,
        domain: normDomain(r.website),
        hq_city: r.hq_city || null,
        hq_state: r.hq_state || null,
        segment: r.segment || null,
        buyer_moment: r.buyer_moment || null,
        dfw: r.dfw || null,
        trades: r.trades || null,
        product_fit: r.product_fit || null,
        sponsor: r.sponsor || null,
        grade: r.grade || null,
        evidence: r.evidence || null,
        source_url: r.source_url || null,
        notes: r.notes || null,
        last_deal_on: dateOrNull(r.last_deal_on),
        disqualified: r.disqualified || null,
        score: r.score,
        tier: r.tier,
        pitch: r.pitch,
        score_detail: r.score_detail,
        scored_at: new Date(),
      };

      // ON CONFLICT on the case-insensitive unique index. `stage`, `owner_email`,
      // `next_action*` and `archived` are deliberately absent from the UPDATE
      // set — an import must never reset work done in the app.
      const [row] = await sql`
        INSERT INTO crm_accounts ${sql(vals)}
        ON CONFLICT (user_id, lower(firm)) DO UPDATE SET
          website = EXCLUDED.website, domain = EXCLUDED.domain,
          hq_city = EXCLUDED.hq_city, hq_state = EXCLUDED.hq_state,
          segment = EXCLUDED.segment, buyer_moment = EXCLUDED.buyer_moment,
          dfw = EXCLUDED.dfw, trades = EXCLUDED.trades,
          product_fit = EXCLUDED.product_fit, sponsor = EXCLUDED.sponsor,
          grade = EXCLUDED.grade, evidence = EXCLUDED.evidence,
          source_url = EXCLUDED.source_url, notes = EXCLUDED.notes,
          last_deal_on = EXCLUDED.last_deal_on, disqualified = EXCLUDED.disqualified,
          score = EXCLUDED.score, tier = EXCLUDED.tier, pitch = EXCLUDED.pitch,
          score_detail = EXCLUDED.score_detail, scored_at = EXCLUDED.scored_at,
          updated_at = NOW()
        RETURNING id, (created_at = updated_at) AS is_new
      `;
      if (row?.is_new) created++; else updated++;

      const person = (r.key_person || '').trim();
      if (person && row?.id) {
        const [c] = await sql`
          INSERT INTO crm_contacts (account_id, name, title, is_primary, source_url)
          VALUES (${row.id}, ${person}, ${r.key_person_title || null}, TRUE, ${r.source_url || null})
          ON CONFLICT (account_id, lower(name)) DO NOTHING
          RETURNING id
        `;
        if (c) contactsAdded++;
      }
    }

    return res.json({
      imported: ranked.length, created, updated, contactsAdded,
      ignoredColumns: ignored,
      trades: box.trades,
      picture: picture(ranked),
    });
  } catch (err: any) {
    console.error('CRM import error:', err.message);
    return res.status(500).json({ error: `Import failed: ${err.message}` });
  }
});

/**
 * POST /api/crm/seed-outreach — seed the board from the 2026-08-05 outreach
 * plan shipped at content/crm-seed/ (91 contacts · 81 orgs · waves · research
 * queue). Idempotent: accounts upsert by firm with pipeline fields untouched
 * on update, contacts/activities skip when present — safe to run twice.
 * Mapping laws + what is deliberately deferred: crmOutreachSeed.ts header.
 */
crmRouter.post('/crm/seed-outreach', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { seedOutreachBoard } = await import('../services/crmOutreachSeed.js');
    const report = await seedOutreachBoard(userId);
    return res.json(report);
  } catch (err: any) {
    console.error('CRM outreach seed error:', err.message);
    return res.status(500).json({ error: `Seed failed: ${err.message}` });
  }
});

/**
 * POST /api/crm/import-bundle   { files: { "<name>.csv": "<csv text>", … } }
 *
 * THE COWORK BRIDGE (2026-08-07, Paul: "I need a smart importer that does
 * what you're doing and just puts the data where it needs to go… do all of
 * this in Cowork… without burning API"). The smart half — reading a messy
 * sheet, mapping columns, splitting the layers — happens in a Cowork session
 * on the subscription. It writes the seven-table bundle and POSTs it here
 * (scripts/studio/push-crm.mts is the one-command client). This endpoint is
 * the dumb half on purpose: pure code, zero model calls, the SAME idempotent
 * loader the shipped plan uses, the same honest report. Files are matched by
 * number prefix or name; missing tables load as empty; unrecognized names
 * are RETURNED, never silently dropped.
 */
crmRouter.post('/crm/import-bundle', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const files = req.body?.files;
    if (!files || typeof files !== 'object' || Array.isArray(files)) {
      return res.status(400).json({ error: 'files (object of name → csv text) is required' });
    }
    const { parseCsv, seedOutreachFromTables } = await import('../services/crmOutreachSeed.js');
    const tables: Record<string, Record<string, string>[]> = {
      contacts: [], orgs: [], waves: [], steps: [], templates: [], events: [], queue: [],
    };
    const slotFor = (name: string): string | null => {
      const n = name.toLowerCase();
      if (/^0?1[_\-.]|contact/.test(n) && !/queue|research/.test(n)) return 'contacts';
      if (/^0?2[_\-.]|organi[sz]|^orgs?\b/.test(n)) return 'orgs';
      if (/^0?3[_\-.]|wave/.test(n)) return 'waves';
      if (/^0?4[_\-.]|step|sequence/.test(n)) return 'steps';
      if (/^0?5[_\-.]|template|message/.test(n)) return 'templates';
      if (/^0?6[_\-.]|event/.test(n)) return 'events';
      if (/^0?7[_\-.]|research|queue/.test(n)) return 'queue';
      return null;
    };
    const ignored: string[] = [];
    for (const [name, text] of Object.entries(files)) {
      if (typeof text !== 'string') { ignored.push(`${name} (not text)`); continue; }
      const slot = slotFor(name);
      if (!slot) { ignored.push(name); continue; }
      tables[slot] = tables[slot].concat(parseCsv(text));
    }
    if (!tables.contacts.length && !tables.orgs.length) {
      return res.status(400).json({ error: 'No contacts or organizations recognized — check the file names (01_contacts.csv / 02_organizations.csv or names containing "contact"/"organization").' });
    }
    const report = await seedOutreachFromTables(userId, tables as any);
    return res.json({ ...report, ignoredFiles: ignored });
  } catch (err: any) {
    console.error('CRM bundle import error:', err.message);
    return res.status(500).json({ error: `Bundle import failed: ${err.message}` });
  }
});

/** POST /api/crm/accounts/rescore  { trades?: string[] }
 *  Re-runs house/leads.ts over every row. Needed whenever a new market master
 *  lands (the lane scale changes) or a `last_deal_on` gets verified. */
crmRouter.post('/crm/accounts/rescore', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const box = boxFrom(req.body);
    const rows = await sql`SELECT * FROM crm_accounts WHERE user_id = ${userId}`;
    let n = 0;
    for (const r of rows) {
      const s = scoreLead(toLeadRow(r), box);
      await sql`
        UPDATE crm_accounts SET
          score = ${s.score}, tier = ${s.tier}, pitch = ${s.pitch},
          score_detail = ${s.detail}, scored_at = NOW()
        WHERE id = ${r.id} AND user_id = ${userId}
      `;
      n++;
    }
    return res.json({ rescored: n, trades: box.trades });
  } catch (err: any) {
    console.error('CRM rescore error:', err.message);
    return res.status(500).json({ error: 'Rescore failed' });
  }
});

/* ── edits ────────────────────────────────────────────────────────────── */

/**
 * PATCH /api/crm/accounts/:id
 * Pipeline fields plus the two research fields a human resolves inside the app
 * (`last_deal_on`, `disqualified`). Both are scoring inputs, so the row
 * re-scores in the same request rather than drifting until the next import.
 */
crmRouter.patch('/crm/accounts/:id', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Bad id' });

    const [owned] = await sql`SELECT * FROM crm_accounts WHERE id = ${id} AND user_id = ${userId}`;
    if (!owned) return res.status(404).json({ error: 'Account not found' });

    const b = req.body ?? {};
    const updates: Record<string, unknown> = {};

    if (typeof b.stage === 'string') {
      if (!CRM_STAGES.includes(b.stage as any)) {
        return res.status(400).json({ error: `Invalid stage (${CRM_STAGES.join(' | ')})` });
      }
      if (b.stage !== owned.stage) {
        // Aging law (CRM_WORKFLOW_SPEC.md): days-in-stage runs from the move,
        // not from the last edit — updated_at moves on every save and would
        // reset the clock a note should never reset.
        updates.stage_entered_at = new Date();
        // A lost pursuit must say why — the loss-reason histogram is the
        // P4-hypothesis evidence, and "unresponsive" typed in a hurry still
        // teaches more than a silent archive.
        if (b.stage === 'lost') {
          const reason = typeof b.loss_reason === 'string' ? b.loss_reason.trim() : '';
          if (!LOSS_REASONS.includes(reason as any)) {
            return res.status(400).json({
              error: `Marking a pursuit lost needs a loss_reason (${LOSS_REASONS.join(' | ')})`,
            });
          }
          updates.loss_reason = reason;
        } else if (owned.stage === 'lost') {
          // Reopening a passed pursuit clears the verdict that no longer holds.
          updates.loss_reason = null;
        }
      }
      updates.stage = b.stage;
    }
    if (typeof b.owner_email === 'string') updates.owner_email = b.owner_email.trim() || null;
    if (typeof b.next_action === 'string') updates.next_action = b.next_action.trim().slice(0, 400) || null;
    if ('next_action_on' in b) updates.next_action_on = dateOrNull(b.next_action_on);
    if (typeof b.notes === 'string') updates.notes = b.notes;
    if (typeof b.archived === 'boolean') updates.archived = b.archived;
    if (typeof b.kind === 'string') {
      if (!(ACCOUNT_KINDS as readonly string[]).includes(b.kind)) {
        return res.status(400).json({ error: `Invalid kind (${ACCOUNT_KINDS.join(' | ')})` });
      }
      updates.kind = b.kind;
    }
    // Scoring inputs.
    if ('last_deal_on' in b) updates.last_deal_on = dateOrNull(b.last_deal_on);
    if ('disqualified' in b) updates.disqualified = String(b.disqualified ?? '').trim() || null;
    /* buyer_moment IS WRITABLE NOW (2026-08-16). It is 35 of the ~100 points
       in house/leads.ts's scorer and, until this branch, NOTHING in the app
       could write it — no default, not seeded, not importable except by CSV —
       so every firm sat pinned on the unknown floor of 8 and the board's
       ranking was decided by the other 65 points. Validated against the
       scorer's own vocabulary, same shape as `stage` and `kind` above. */
    if (typeof b.buyer_moment === 'string') {
      const MOMENTS = ['thesis_no_flow', 'capital_no_thesis', 'has_both', 'unknown'];
      if (!MOMENTS.includes(b.buyer_moment)) {
        return res.status(400).json({ error: `Invalid buyer_moment (${MOMENTS.join(' | ')})` });
      }
      updates.buyer_moment = b.buyer_moment;
    }
    if (typeof b.dfw === 'string') {
      /* The scorer's own vocabulary (house/leads.ts normDfw) — 'adjacent',
         not 'partial'. The first cut of this enum invented 'partial', which
         normDfw would have silently collapsed to 'unknown': a validated write
         that scores as unwritten. Checked against the source, not memory. */
      const DFW = ['yes', 'adjacent', 'no', 'unknown'];
      if (!DFW.includes(b.dfw)) {
        return res.status(400).json({ error: `Invalid dfw (${DFW.join(' | ')})` });
      }
      updates.dfw = b.dfw;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updatable fields' });
    }
    updates.updated_at = new Date();

    // Re-score off the MERGED row, so a changed input takes effect immediately.
    const merged = { ...owned, ...updates };
    const s = scoreLead(toLeadRow(merged), boxFrom(b));
    updates.score = s.score;
    updates.tier = s.tier;
    updates.pitch = s.pitch;
    updates.score_detail = s.detail;
    updates.scored_at = new Date();

    const [row] = await sql`
      UPDATE crm_accounts SET ${sql(updates)}
      WHERE id = ${id} AND user_id = ${userId} RETURNING *
    `;

    // A stage move is history worth keeping — it is the one edit you want to be
    // able to read back as a date later.
    if (updates.stage && updates.stage !== owned.stage) {
      await sql`
        INSERT INTO crm_activity (account_id, user_id, kind, subject, body)
        VALUES (${id}, ${userId}, 'stage_change', ${`${owned.stage} → ${updates.stage}`},
                ${typeof b.note === 'string' ? b.note : null})
      `;
    }
    return res.json(row);
  } catch (err: any) {
    console.error('CRM patch error:', err.message);
    return res.status(500).json({ error: 'Failed to update account' });
  }
});

/* ── lead → deal ──────────────────────────────────────────────────────── */

/**
 * POST /api/crm/accounts/:id/deals   { business_name, industry?, location? }
 *
 * Paul: "do we have a lead and then transfer that into a deal." This is the
 * transfer. It creates a `deals` row already linked back through
 * `crm_account_id` (migration 114), which is what makes the two pipelines one
 * practice rather than two lists.
 *
 * The TARGET name is required and comes from the caller: an acquirer client is
 * not itself a deal. "Amalgam Capital" is who we work for; the deal is the
 * company they are buying, and inventing that name from the client's would be a
 * fabricated record.
 *
 * Journey `buy` / gate `B0` (Thesis) is the only correct start for this
 * practice — buy-side only, THE LINE §perimeter — so it is not a parameter.
 */
crmRouter.post('/crm/accounts/:id/deals', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Bad id' });

    const [account] = await sql`
      SELECT id, firm, stage FROM crm_accounts WHERE id = ${id} AND user_id = ${userId}
    `;
    if (!account) return res.status(404).json({ error: 'Client not found' });

    const businessName = String(req.body?.business_name ?? '').trim();
    if (!businessName) {
      return res.status(400).json({
        error: 'business_name (the target company) is required — a client is not a deal',
      });
    }

    const [deal] = await sql`
      INSERT INTO deals
        (user_id, journey_type, current_gate, status, business_name, name,
         industry, location, crm_account_id)
      VALUES
        (${userId}, 'buy', 'B0', 'active', ${businessName.slice(0, 200)},
         ${businessName.slice(0, 200)},
         ${typeof req.body?.industry === 'string' ? req.body.industry.slice(0, 200) : null},
         ${typeof req.body?.location === 'string' ? req.body.location.slice(0, 200) : null},
         ${id})
      RETURNING id, business_name, current_gate, journey_type, crm_account_id
    `;

    // The client's history should show that a deal opened for them.
    try {
      await sql`
        INSERT INTO crm_activity (account_id, user_id, kind, subject, body)
        VALUES (${id}, ${userId}, 'note',
                ${`Deal opened — ${businessName}`.slice(0, 300)},
                ${`Target added to the pipeline for ${account.firm}.`})
      `;
    } catch (e: any) {
      // The deal exists. A missing log line is not a failed conversion.
      console.warn('[crm] convert activity log failed:', e?.message);
    }

    return res.json(deal);
  } catch (err: any) {
    console.error('CRM convert error:', err.message);
    return res.status(500).json({ error: `Failed to open a deal: ${err.message}` });
  }
});

/* ── contacts + activity ──────────────────────────────────────────────── */

async function ownsAccount(userId: number, accountId: number): Promise<boolean> {
  const [a] = await sql`SELECT id FROM crm_accounts WHERE id = ${accountId} AND user_id = ${userId}`;
  return !!a;
}

crmRouter.post('/crm/accounts/:id/contacts', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || !(await ownsAccount(userId, id))) {
      return res.status(404).json({ error: 'Account not found' });
    }
    const name = String(req.body?.name ?? '').trim();
    if (!name) return res.status(400).json({ error: 'name is required' });

    const [row] = await sql`
      INSERT INTO crm_contacts (account_id, name, title, role, email, phone, linkedin_url, is_primary, notes)
      VALUES (${id}, ${name}, ${req.body?.title || null}, ${req.body?.role || null},
              ${req.body?.email || null},
              ${req.body?.phone || null}, ${req.body?.linkedin_url || null},
              ${!!req.body?.is_primary}, ${req.body?.notes || null})
      ON CONFLICT (account_id, lower(name)) DO UPDATE SET
        title = COALESCE(EXCLUDED.title, crm_contacts.title),
        role = COALESCE(EXCLUDED.role, crm_contacts.role),
        email = COALESCE(EXCLUDED.email, crm_contacts.email),
        phone = COALESCE(EXCLUDED.phone, crm_contacts.phone),
        linkedin_url = COALESCE(EXCLUDED.linkedin_url, crm_contacts.linkedin_url),
        updated_at = NOW()
      RETURNING *
    `;
    return res.json(row);
  } catch (err: any) {
    console.error('CRM contact error:', err.message);
    return res.status(500).json({ error: 'Failed to save contact' });
  }
});

/** Log a touch. This RECORDS an interaction; it does not send anything. */
crmRouter.post('/crm/accounts/:id/activity', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || !(await ownsAccount(userId, id))) {
      return res.status(404).json({ error: 'Account not found' });
    }
    const kind = String(req.body?.kind ?? 'note');
    if (!ACTIVITY_KINDS.includes(kind)) {
      return res.status(400).json({ error: `Invalid kind (${ACTIVITY_KINDS.join(' | ')})` });
    }
    const contactId = Number(req.body?.contact_id);
    const [row] = await sql`
      INSERT INTO crm_activity (account_id, contact_id, user_id, kind, direction, subject, body, occurred_at)
      VALUES (${id}, ${Number.isInteger(contactId) ? contactId : null}, ${userId}, ${kind},
              ${req.body?.direction === 'in' || req.body?.direction === 'out' ? req.body.direction : null},
              ${req.body?.subject || null}, ${req.body?.body || null},
              ${dateOrNull(req.body?.occurred_at) ?? new Date()})
      RETURNING *
    `;
    return res.json(row);
  } catch (err: any) {
    console.error('CRM activity error:', err.message);
    return res.status(500).json({ error: 'Failed to log activity' });
  }
});

/* ── export ───────────────────────────────────────────────────────────── */

/** GET /api/crm/accounts.csv — back out to the Sheet, ranking first. */
crmRouter.get('/crm/accounts.csv', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const rows = await sql`
      SELECT * FROM crm_accounts WHERE user_id = ${userId} AND archived = FALSE
      ORDER BY score DESC NULLS LAST, firm ASC
    `;
    const out = rows.map(r => ({
      ...toLeadRow(r),
      score: String(r.score ?? ''), tier: r.tier ?? '', pitch: r.pitch ?? '',
      score_detail: r.score_detail ?? '',
      stage: r.stage ?? '', owner_email: r.owner_email ?? '',
      next_action: r.next_action ?? '',
      next_action_on: r.next_action_on ? String(r.next_action_on).slice(0, 10) : '',
    }));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="smbx-buyside-register.csv"');
    return res.send(toCsv(out as any, [...LEAD_COLUMNS, 'stage', 'owner_email', 'next_action', 'next_action_on']));
  } catch (err: any) {
    console.error('CRM export error:', err.message);
    return res.status(500).json({ error: 'Export failed' });
  }
});
