/**
 * THE POST QUEUE — the app half of the content loop.
 *
 * `content/studio/POST_QUEUE.md` is the source of record; `post-queue.json` is
 * its generated form (`queue-export.mjs`, zero deps, `--check` exits 1 rather
 * than emitting a half-valid queue). This imports the JSON and holds state.
 *
 * THE OWNERSHIP RULE, which is the whole design:
 *
 *   the MARKDOWN owns CONTENT   angle, format, evidence grade, may_state_figure
 *   the APP owns STATE          slot, scheduled_for, posted_at, analytics
 *
 * They never write the same field, so there is no round-trip sync. An import
 * overwrites content and is FORBIDDEN from touching state — enforced by the
 * column list in the upsert below, not by a comment. Get that wrong and a
 * re-import silently un-posts a week of work.
 *
 * `status` is the one field that looks shared and is not. It moves
 * `next → drafted` in the markdown (the weekly run writes it) and
 * `drafted → posted` in the app (a human clicks it). So the import treats the
 * markdown's status as a FLOOR: it may advance a row to `drafted`, and may
 * never pull one backwards out of `posted`. That asymmetry is deliberate and is
 * the only reason two writers can share one field safely.
 *
 * NOTHING HERE FIRES ANYTHING. Migration 122 disarmed the research scheduler
 * after a saved campaign spent unattended on the metered key. A posting
 * calendar is rows with dates; it needs no dispatcher. This file calls no
 * model, reads no API key, and must never be invoked on a timer.
 */
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { sql } from '../db.js';

const QUEUE_JSON = path.resolve(process.cwd(), 'content/studio/post-queue.json');

export interface QueueRow {
  queue_id: string;
  tier: string | null;
  lead: string | null;
  angle: string;
  format: string | null;
  carries: string | null;
  evidence_grade: string | null;
  source_disclosure: string | null;
  status: string | null;
  may_state_figure: boolean;
}

const STATUSES = new Set(['next', 'drafted', 'posted', 'parked', 'recurring']);

/** Rank for the floor rule — a row may move up this ladder on import, never down. */
const RANK: Record<string, number> = { parked: 0, recurring: 0, next: 1, drafted: 2, posted: 3 };

export interface ImportResult {
  inserted: number;
  updated: number;
  skipped: string[];
  /** Rows whose markdown status was BELOW the row's current state and therefore
   *  not applied. Reported rather than silent: it is how you find out the
   *  markdown has drifted behind reality. */
  heldAtHigherState: string[];
}

/**
 * Validate a parsed queue. Returns the problems; empty means importable.
 *
 * Deliberately strict about `may_state_figure`: it is the field that decides
 * whether a post may put a number in front of a reader, and a missing one must
 * be an error rather than a falsy default in either direction. `queue-export`
 * already refuses to emit a queue without it — this is the second gate, because
 * the JSON can also arrive hand-edited.
 */
export function validateQueue(rows: unknown): string[] {
  const problems: string[] = [];
  if (!Array.isArray(rows)) return ['post-queue.json has no `rows` array'];
  if (!rows.length) return ['post-queue.json contains no rows'];

  const seen = new Set<string>();
  for (const [i, raw] of rows.entries()) {
    const r = raw as Partial<QueueRow>;
    const at = r.queue_id || `row ${i + 1}`;
    if (!r.queue_id) problems.push(`${at}: missing queue_id`);
    else if (seen.has(r.queue_id)) problems.push(`${at}: duplicate queue_id`);
    if (r.queue_id) seen.add(r.queue_id);
    if (!r.angle) problems.push(`${at}: missing angle`);
    if (typeof r.may_state_figure !== 'boolean') {
      problems.push(`${at}: may_state_figure must be true or false — it decides whether this post may state a number, and a missing value is not a default`);
    }
    if (r.status && !STATUSES.has(r.status)) problems.push(`${at}: unknown status "${r.status}"`);
  }
  return problems;
}

/** Read + validate the generated queue. Throws with every problem named. */
export async function readQueueFile(file = QUEUE_JSON): Promise<QueueRow[]> {
  let parsed: any;
  try {
    parsed = JSON.parse(await readFile(file, 'utf8'));
  } catch (err: any) {
    throw new Error(`Could not read ${path.relative(process.cwd(), file)}: ${err?.message}`);
  }
  const rows = parsed?.rows;
  const problems = validateQueue(rows);
  if (problems.length) {
    // Refuse the whole import. A half-imported queue is worse than none: the
    // missing rows are invisible, and the rule that decides whether a number
    // can be published is exactly what goes missing first.
    throw new Error(`post-queue.json is malformed — nothing imported:\n  ${problems.join('\n  ')}`);
  }
  return rows as QueueRow[];
}

/**
 * Upsert the queue for one user.
 *
 * THE COLUMN LIST IS THE CONTRACT. `DO UPDATE SET` names content columns only.
 * posted_at, post_url, slot, scheduled_for, drafted_at, collateral_path,
 * retired_check and notes are absent BY DESIGN — adding one to that list would
 * let a routine re-import erase a posted date, and nothing in a diff would look
 * wrong.
 */
export async function importQueue(
  userId: number,
  rows?: QueueRow[],
  /** The campaign a row belongs to (`2026-08-18` for campaign-2026-08-18.json);
   *  null = the standing queue (POST_QUEUE.md). Content, stamped by the import. */
  campaign: string | null = null,
): Promise<ImportResult> {
  const queue = rows ?? (await readQueueFile());
  const result: ImportResult = { inserted: 0, updated: 0, skipped: [], heldAtHigherState: [] };

  const existing = await sql<{ queue_id: string; status: string; campaign: string | null }[]>`
    SELECT queue_id, status, campaign FROM post_queue WHERE user_id = ${userId}`;
  const current = new Map(existing.map(r => [r.queue_id, r.status]));

  // ONE ID, ONE CAMPAIGN, FOREVER (migration 135). Analytics join by queue_id,
  // so an id reused across campaigns folds two posts' numbers into one line.
  // A row already stamped with a DIFFERENT campaign is a collision: refuse the
  // whole import and name every offender — the fix is a new id in the new
  // file, never an overwrite. A NULL stamp (rows imported before the column
  // existed) may be adopted once, and the standing queue (campaign=null) never
  // un-stamps a campaign row.
  if (campaign) {
    const stamped = new Map(existing.map(r => [r.queue_id, r.campaign]));
    const collisions = queue
      .filter(r => { const c = stamped.get(r.queue_id); return c != null && c !== campaign; })
      .map(r => `${r.queue_id} already belongs to campaign ${stamped.get(r.queue_id)}`);
    if (collisions.length) {
      throw new Error(`campaign ${campaign} reuses queue ids from another campaign — nothing imported:\n  ${collisions.join('\n  ')}\n  Give the new posts new ids; an id is one post forever, because that is what its analytics are joined on.`);
    }
  }

  for (const r of queue) {
    // The floor rule. The markdown may push a row forward (next → drafted); it
    // may never pull one back, because `posted` was set by a human and the
    // markdown has no way to know that happened.
    //
    // IT IS APPLIED IN THE `DO UPDATE`, NOT IN THE INSERT, and that is not a
    // style choice. Postgres evaluates a table CHECK against the proposed
    // INSERT tuple BEFORE the unique violation is detected and ON CONFLICT
    // takes over — so computing the elevated status in JS and inserting it
    // meant offering a row with status='posted' and a null posted_at, which
    // `post_queue_posted_has_time` rejected outright. The upsert failed on the
    // constraint that exists to make "never inferred" checkable, on the exact
    // path that was honouring it. Caught by the test, not by reading.
    //
    // So: the INSERT always carries the markdown's own status, and the database
    // decides the floor against the row it already has.
    const now = current.get(r.queue_id);
    const incoming = r.status && STATUSES.has(r.status) ? r.status : 'next';
    if (now && (RANK[now] ?? 0) > (RANK[incoming] ?? 0)) {
      result.heldAtHigherState.push(`${r.queue_id}: markdown says ${incoming}, row is ${now} — kept ${now}`);
    }

    // The rank ladder, in SQL, so the comparison happens where the data is.
    const rank = (col: any) => sql`CASE ${col}
        WHEN 'posted' THEN 3 WHEN 'drafted' THEN 2 WHEN 'next' THEN 1 ELSE 0 END`;

    const [row] = await sql<{ inserted: boolean }[]>`
      INSERT INTO post_queue (
        user_id, queue_id, tier, lead, angle, format, carries,
        evidence_grade, source_disclosure, may_state_figure, status, campaign
      ) VALUES (
        ${userId}, ${r.queue_id}, ${r.tier ?? null}, ${r.lead ?? null}, ${r.angle},
        ${r.format ?? null}, ${r.carries ?? null}, ${r.evidence_grade ?? null},
        ${r.source_disclosure ?? null}, ${r.may_state_figure}, ${incoming}, ${campaign}
      )
      ON CONFLICT (user_id, queue_id) DO UPDATE SET
        tier              = EXCLUDED.tier,
        lead              = EXCLUDED.lead,
        angle             = EXCLUDED.angle,
        format            = EXCLUDED.format,
        carries           = EXCLUDED.carries,
        evidence_grade    = EXCLUDED.evidence_grade,
        source_disclosure = EXCLUDED.source_disclosure,
        may_state_figure  = EXCLUDED.may_state_figure,
        status            = CASE WHEN ${rank(sql`post_queue.status`)} > ${rank(sql`EXCLUDED.status`)}
                                 THEN post_queue.status ELSE EXCLUDED.status END,
        -- a campaign stamps; the standing queue (null) never un-stamps
        campaign          = COALESCE(EXCLUDED.campaign, post_queue.campaign),
        updated_at        = NOW()
      RETURNING (xmax = 0) AS inserted`;
    if (row?.inserted) result.inserted++; else result.updated++;
  }
  return result;
}

export async function listQueue(userId: number): Promise<any[]> {
  return sql`
    SELECT * FROM post_queue WHERE user_id = ${userId}
    ORDER BY
      CASE status WHEN 'drafted' THEN 0 WHEN 'next' THEN 1 WHEN 'recurring' THEN 2
                  WHEN 'posted' THEN 3 ELSE 4 END,
      scheduled_for NULLS LAST,
      queue_id`;
}

/**
 * Update the STATE of one row. Content fields are not settable here — they come
 * from the markdown, and an app-side edit would be overwritten by the next
 * import without warning, which is worse than refusing it.
 *
 * MARKING SOMETHING POSTED IS A HUMAN ACTION and this is the only path to it.
 * `posted_at` is stamped here rather than accepted from the caller so that the
 * timestamp always records when the person actually clicked.
 */
export async function updateQueueState(
  userId: number,
  queueId: string,
  patch: {
    status?: string; slot?: string | null; scheduledFor?: string | null;
    postUrl?: string | null; draftPath?: string | null; collateralPath?: string | null;
    retiredCheck?: string | null; notes?: string | null;
  },
): Promise<any | null> {
  if (patch.status && !STATUSES.has(patch.status)) throw new Error(`Unknown status "${patch.status}"`);

  // THE FIGURE GATE, at the last possible moment. A row that may not state a
  // figure is not a soft warning to render differently — it is a rule about
  // what the post may contain, and the check that it was honoured has to happen
  // before the row is called posted. `retired_check` must have RUN; "not_run"
  // is not a pass.
  if (patch.status === 'posted') {
    const [row] = await sql<{ may_state_figure: boolean; retired_check: string }[]>`
      SELECT may_state_figure, retired_check FROM post_queue
      WHERE user_id = ${userId} AND queue_id = ${queueId}`;
    if (!row) return null;
    if (row.retired_check === 'not_run' && patch.retiredCheck == null) {
      throw new Error(
        `${queueId}: retired-check has not been run on this draft. A caption is the most exposed artifact this practice produces — run it before marking the post published.`,
      );
    }
    if ((patch.retiredCheck ?? row.retired_check) === 'flagged') {
      throw new Error(`${queueId}: retired-check flagged this draft. Clear the finding before marking it posted.`);
    }
  }

  const [row] = await sql`
    UPDATE post_queue SET
      status          = COALESCE(${patch.status ?? null}, status),
      slot            = COALESCE(${patch.slot ?? null}, slot),
      scheduled_for   = COALESCE(${patch.scheduledFor ?? null}::date, scheduled_for),
      post_url        = COALESCE(${patch.postUrl ?? null}, post_url),
      draft_path      = COALESCE(${patch.draftPath ?? null}, draft_path),
      collateral_path = COALESCE(${patch.collateralPath ?? null}, collateral_path),
      retired_check   = COALESCE(${patch.retiredCheck ?? null}, retired_check),
      notes           = COALESCE(${patch.notes ?? null}, notes),
      drafted_at      = CASE WHEN ${patch.status ?? null} = 'drafted' AND drafted_at IS NULL
                             THEN NOW() ELSE drafted_at END,
      -- Stamped here, never accepted from the caller, and only ever on the
      -- transition INTO posted. Publication is a decision; this is its record.
      posted_at       = CASE WHEN ${patch.status ?? null} = 'posted' AND posted_at IS NULL
                             THEN NOW() ELSE posted_at END,
      updated_at      = NOW()
    WHERE user_id = ${userId} AND queue_id = ${queueId}
    RETURNING *`;
  return row ?? null;
}

/** Per-angle performance: the queue joined to what LinkedIn actually reported. */
export async function queuePerformance(userId: number): Promise<any[]> {
  return sql`
    SELECT q.queue_id, q.lead, q.format, q.evidence_grade, q.status, q.posted_at,
           a.id AS analytics_id, a.period_start, a.period_end, a.data
    FROM post_queue q
    LEFT JOIN studio_analytics a ON a.queue_id = q.queue_id AND a.user_id = q.user_id
    WHERE q.user_id = ${userId} AND q.status = 'posted'
    ORDER BY q.posted_at DESC NULLS LAST`;
}

/* ── campaigns ─────────────────────────────────────────────────────────── */

const CAMPAIGN_DIR = path.resolve(process.cwd(), 'content/studio');
const CAMPAIGN_FILE = /^campaign-(\d{4}-\d{2}-\d{2})\.json$/;

export interface CampaignMeta {
  /** The date part of the filename — `2026-08-18`. This is the row stamp. */
  name: string;
  file: string;
  title: string | null;
  note: string | null;
  rows: number;
  /** Week labels the calendar renders, keyed by tier — `{ W1: "Week 1 · Aug 18–20 · …" }`.
   *  Owned by the campaign file, so a new calendar never inherits the old one's dates. */
  weeks: Record<string, string>;
  /** First and last scheduled dates, from the schedule map. */
  first: string | null;
  last: string | null;
  supersedes: string | null;
}

/** Pure: read one campaign file's shape into meta. Exported for the tests. */
export function campaignMeta(name: string, file: string, parsed: any): CampaignMeta {
  const rows = Array.isArray(parsed?.rows) ? parsed.rows : [];
  const dates = Object.values<any>(parsed?.schedule ?? {})
    .map(s => String(s?.on ?? '').slice(0, 10))
    .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort();
  const weeks: Record<string, string> = {};
  if (parsed?.weeks && typeof parsed.weeks === 'object') {
    for (const [k, v] of Object.entries(parsed.weeks)) if (typeof v === 'string') weeks[k] = v;
  }
  return {
    name, file,
    title: typeof parsed?.campaign === 'string' ? parsed.campaign : null,
    note: typeof parsed?.note === 'string' ? parsed.note : null,
    rows: rows.length,
    weeks,
    first: dates[0] ?? null,
    last: dates[dates.length - 1] ?? null,
    // The file may name its predecessor by filename or by name; the meta
    // always speaks in NAMES (`2026-08-17`), which is what rows are stamped with.
    supersedes: /(\d{4}-\d{2}-\d{2})/.exec(String(parsed?.supersedes?.campaign ?? ''))?.[1] ?? null,
  };
}

/** Every campaign file the app ships, NEWEST FIRST — the first entry is what
 *  "Import campaign" loads when no name is given. */
export async function listCampaigns(dir = CAMPAIGN_DIR): Promise<CampaignMeta[]> {
  const names = (await readdir(dir)).filter(f => CAMPAIGN_FILE.test(f)).sort().reverse();
  const out: CampaignMeta[] = [];
  for (const f of names) {
    const name = CAMPAIGN_FILE.exec(f)![1];
    let parsed: any = null;
    try { parsed = JSON.parse(await readFile(path.join(dir, f), 'utf8')); } catch { /* reported as 0 rows */ }
    out.push(campaignMeta(name, path.join('content/studio', f), parsed));
  }
  return out;
}

export interface CampaignImportResult extends ImportResult {
  campaign: string;
  title: string | null;
  scheduled: number;
  /** Rows of the superseded campaign(s) parked by this press. Never a posted row. */
  parkedSuperseded: number;
  /** Standing-queue rows parked / advanced by the file's `queue_bookkeeping`. */
  parkedBookkeeping: number;
  draftedBookkeeping: number;
  /** Superseded or bookkept rows that were left alone because a human had already posted them. */
  keptPosted: string[];
}

/**
 * Import a CAMPAIGN file — `content/studio/campaign-<name>.json`, newest by
 * name when none is given — with the same state-preserving upsert as the queue
 * import, plus THREE presses that are the human's decision recorded once:
 *
 *   1. the schedule map fills dates ONLY where a row has none (a re-import
 *      proposes the plan's calendar once; it never moves a date a human set);
 *   2. `supersedes.rows` are PARKED — the retired calendar's slots step aside
 *      — unless a row is already `posted`, which is left exactly as it is and
 *      reported in `keptPosted` (the floor rule: nothing pulls a posted row);
 *   3. `queue_bookkeeping` (park / drafted) is applied to the standing queue
 *      with the same floor.
 *
 * All three are idempotent: press it twice and the second press parks nothing,
 * schedules nothing, and reports `updated` for every row.
 *
 * (2026-08-16, Paul: "i have no way of managing the campaign schedule or what
 * gets made and ready to post when" — the Aug 17 campaign was the first file.
 * 2026-08-18: the plan was remade the same day — Tue/Wed/Thu spine, P-1…P-8 +
 * five Mandate editions — and the app was still showing the calendar it
 * retired. A named import and the supersede press are what let the second
 * plan land without hand-editing rows.)
 */
export async function importCampaign(
  userId: number,
  name?: string | null,
  dir = CAMPAIGN_DIR,
): Promise<CampaignImportResult> {
  const campaigns = await listCampaigns(dir);
  if (!campaigns.length) throw new Error(`No campaign files in ${path.relative(process.cwd(), dir) || 'content/studio'}`);
  const meta = name ? campaigns.find(c => c.name === name) : campaigns[0];
  if (!meta) {
    throw new Error(`No campaign named ${name}. Available: ${campaigns.map(c => c.name).join(', ')}`);
  }
  // A SUPERSEDED campaign is read, never re-imported. Its rows were parked by
  // the newer file's press; the floor rule (which is right for the standing
  // queue) would read that file's `next` as a step FORWARD from `parked` and
  // quietly un-park the retired calendar. Refuse, and name the file to load.
  const successor = campaigns.find(c => c.supersedes === meta.name);
  if (successor) {
    throw new Error(`campaign ${meta.name} is superseded by ${successor.name} — nothing imported. Load ${successor.name}; the ${meta.name} rows stay readable (parked) under their own chip.`);
  }

  let parsed: any;
  try {
    parsed = JSON.parse(await readFile(path.join(dir, path.basename(meta.file)), 'utf8'));
  } catch (err: any) {
    throw new Error(`Could not read ${meta.file}: ${err?.message}`);
  }
  const problems = validateQueue(parsed?.rows);
  if (problems.length) {
    throw new Error(`campaign file is malformed — nothing imported:\n  ${problems.join('\n  ')}`);
  }

  const result = await importQueue(userId, parsed.rows as QueueRow[], meta.name);

  // 1. dates, only where none
  let scheduled = 0;
  const schedule = parsed?.schedule ?? {};
  for (const [qid, s] of Object.entries<any>(schedule)) {
    const on = String(s?.on ?? '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(on)) continue;
    const rows = await sql`
      UPDATE post_queue
      SET scheduled_for = ${on}, slot = ${typeof s?.slot === 'string' ? s.slot : null}, updated_at = NOW()
      WHERE user_id = ${userId} AND queue_id = ${qid} AND scheduled_for IS NULL
      RETURNING id`;
    scheduled += rows.length;
  }

  // 2 + 3. the state presses. `park` never touches a posted row; `drafted`
  // only ever moves a row UP the ladder (next/recurring/parked → drafted).
  const keptPosted: string[] = [];
  /* `stamp`: the campaign the parked rows belong to, applied only where the row
     has none — rows imported before migration 135 carry no stamp, and without
     it the superseded calendar would sit under "standing queue" on screen. */
  const park = async (ids: string[], stamp: string | null = null): Promise<number> => {
    if (!ids.length) return 0;
    const posted = await sql<{ queue_id: string }[]>`
      SELECT queue_id FROM post_queue
      WHERE user_id = ${userId} AND queue_id = ANY(${ids}) AND status = 'posted'`;
    keptPosted.push(...posted.map(r => r.queue_id));
    // stamp first (posted rows included — the stamp is content, not state)…
    if (stamp) {
      await sql`
        UPDATE post_queue SET campaign = ${stamp}, updated_at = NOW()
        WHERE user_id = ${userId} AND queue_id = ANY(${ids}) AND campaign IS NULL`;
    }
    // …then park what is not posted and not already parked.
    const rows = await sql`
      UPDATE post_queue SET status = 'parked', updated_at = NOW()
      WHERE user_id = ${userId} AND queue_id = ANY(${ids})
        AND status NOT IN ('posted', 'parked')
      RETURNING id`;
    return rows.length;
  };
  const draft = async (ids: string[]): Promise<number> => {
    if (!ids.length) return 0;
    const rows = await sql`
      UPDATE post_queue
      SET status = 'drafted', drafted_at = COALESCE(drafted_at, NOW()), updated_at = NOW()
      WHERE user_id = ${userId} AND queue_id = ANY(${ids})
        AND status IN ('next', 'recurring', 'parked')
      RETURNING id`;
    return rows.length;
  };
  const strList = (v: unknown): string[] => Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

  const parkedSuperseded = await park(strList(parsed?.supersedes?.rows), meta.supersedes);
  const parkedBookkeeping = await park(strList(parsed?.queue_bookkeeping?.park));
  const draftedBookkeeping = await draft(strList(parsed?.queue_bookkeeping?.drafted));

  return {
    ...result,
    campaign: meta.name,
    title: meta.title,
    scheduled,
    parkedSuperseded,
    parkedBookkeeping,
    draftedBookkeeping,
    keptPosted,
  };
}
