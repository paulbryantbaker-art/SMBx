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
import { readFile } from 'node:fs/promises';
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
export async function importQueue(userId: number, rows?: QueueRow[]): Promise<ImportResult> {
  const queue = rows ?? (await readQueueFile());
  const result: ImportResult = { inserted: 0, updated: 0, skipped: [], heldAtHigherState: [] };

  const existing = await sql<{ queue_id: string; status: string }[]>`
    SELECT queue_id, status FROM post_queue WHERE user_id = ${userId}`;
  const current = new Map(existing.map(r => [r.queue_id, r.status]));

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
        evidence_grade, source_disclosure, may_state_figure, status
      ) VALUES (
        ${userId}, ${r.queue_id}, ${r.tier ?? null}, ${r.lead ?? null}, ${r.angle},
        ${r.format ?? null}, ${r.carries ?? null}, ${r.evidence_grade ?? null},
        ${r.source_disclosure ?? null}, ${r.may_state_figure}, ${incoming}
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

/**
 * Import a CAMPAIGN file (content/studio/campaign-*.json) — the same
 * state-preserving upsert as the queue import, plus a schedule map that fills
 * dates ONLY where the row has none. A re-import proposes the plan's calendar
 * once; it never moves a date a human set, for the same reason it never
 * un-posts anything.
 *
 * (2026-08-16, Paul: "i have no way of managing the campaign schedule or what
 * gets made and ready to post when" — the Aug 17 campaign is the first file.)
 */
export async function importCampaign(
  userId: number,
  file = path.resolve(process.cwd(), 'content/studio/campaign-2026-08-17.json'),
): Promise<ImportResult & { scheduled: number; campaign: string | null }> {
  let parsed: any;
  try {
    parsed = JSON.parse(await readFile(file, 'utf8'));
  } catch (err: any) {
    throw new Error(`Could not read ${path.relative(process.cwd(), file)}: ${err?.message}`);
  }
  const problems = validateQueue(parsed?.rows);
  if (problems.length) {
    throw new Error(`campaign file is malformed — nothing imported:\n  ${problems.join('\n  ')}`);
  }

  const result = await importQueue(userId, parsed.rows as QueueRow[]);

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

  return { ...result, scheduled, campaign: typeof parsed?.campaign === 'string' ? parsed.campaign : null };
}
