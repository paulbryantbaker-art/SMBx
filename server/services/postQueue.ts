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
import { templateById, templateForKind } from '../../shared/templates.js';
import { sendReadiness, sendState, outgoingCopy } from '../../shared/studioSend.js';
import { copyDraftState, pagesDraftState, pagesEqual } from '../../shared/draft.js';
import { isPillarId } from '../../shared/pillars.js';

const QUEUE_JSON = path.resolve(process.cwd(), 'content/studio/post-queue.json');

/** One page of a document slot's carousel copy, as the plan wrote it. */
export interface QueuePage { n: number; label: string | null; text: string; note: string | null }

/** Where a document slot's rendered deck lives, and what the app can serve of it. */
export interface QueueDocument {
  slug: string;
  spec: string;                 // studio/markets/<m>/specs/<slug>.deck.mts
  filed_at: string;             // studio/markets/<m>/collateral/<slug>/<date>/
  pdf: string | null;           // /collateral/<slug>/<date>/<slug>.pdf — null until the file exists in the build
  cover: string | null;
  thumbs: string[];
  pages: number | null;
  bytes: number | null;
  deck_caption_matches: boolean;
}

/**
 * The plan for a slot BEFORE its draft exists (migration 139).
 *
 * The 30-day "How I" hook sequence gives each day its hook and rehook verbatim
 * and its beats as the drafting brief; the copy is written later by the Sunday
 * staging run. A brief is therefore not a degraded body and must never be shown
 * as one — it is what the slot IS until the draft lands, and the screen says so.
 *
 * It is CONTENT (the plan owns it, every import overwrites it) and so has
 * nothing to do with the DRAFT columns of migration 138, which are Paul's own
 * decisions and are never touched by the importer.
 */
export interface QueueBrief {
  hook: string | null;
  rehook: string | null;
  beats: string[];
  /** The plan's "Source in-post" line — publisher plus its commercial interest. */
  source: string | null;
  /** What has to happen before this can be drafted (a receipt interview, an anonymisation rule). */
  extraction: string | null;
  /** A caution to read before drafting — a contested count, a vintage, a protocol conflict. */
  note: string | null;
}

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
  /* ── the copy (migration 136) — all content, all overwritten on import ── */
  title?: string | null;
  /** The MEDIUM. text|image|video ship as a post; document ships a deck too;
   *  null is a Mandate edition or a blackout, which carry no copy of their own. */
  kind?: 'text' | 'image' | 'video' | 'document' | null;
  body?: string | null;         // paste-ready: the post, or a document slot's caption
  body_alt?: string | null;     // the understudy, where a slot has one
  body_deck?: string | null;    // the deck's caption, only where it differs from the plan's
  gate?: string | null;         // why the body cannot ship as-is
  copy_note?: string | null;    // how body_deck differs
  law_check?: string | null;
  pages?: QueuePage[] | null;
  document?: QueueDocument | null;
  /* ── the plan, where the draft does not exist yet (migration 139) ── */
  brief?: QueueBrief | null;
}

/** The mediums a row may claim. Anything else is NULL — never coerced to text. */
const KINDS = new Set(['text', 'image', 'video', 'document']);

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
    if (now === 'parked' && incoming !== 'parked') {
      // Reported, not silent: a parked row the file wants to move is exactly the
      // case that used to disappear without a word.
      result.heldAtHigherState.push(`${r.queue_id}: you parked it — the plan says ${incoming}; kept parked (press Unpark to take it back)`);
    } else if (now && (RANK[now] ?? 0) > (RANK[incoming] ?? 0)) {
      result.heldAtHigherState.push(`${r.queue_id}: markdown says ${incoming}, row is ${now} — kept ${now}`);
    }

    // The rank ladder, in SQL, so the comparison happens where the data is.
    const rank = (col: any) => sql`CASE ${col}
        WHEN 'posted' THEN 3 WHEN 'drafted' THEN 2 WHEN 'next' THEN 1 ELSE 0 END`;

    // The copy (migration 136). Content like everything else in this list —
    // the file decides, every import overwrites, a row without copy reads NULL
    // rather than keeping a stale body from an earlier file. JSON columns take
    // the parsed value or NULL; a malformed shape is the exporter's problem
    // and `--check` catches it before it gets here.
    // text · image · video · document. The MEDIUM, because a video day needs a
    // camera booked and a row that reads "Text" hides that; NULL for a Mandate
    // edition or a blackout, which carry no copy of their own.
    const kind = typeof r.kind === 'string' && KINDS.has(r.kind) ? r.kind : null;
    // THE DOUBLE-ENCODE (2026-08-19, Paul: "any time i try to view or edit a
    // post, i get an error: c.map is not a function"). These two were
    // JSON.stringify'd here and then passed as `${x}::jsonb`. postgres-js
    // sends an unprepared query's params untyped, lets Postgres DESCRIBE them,
    // learns from the cast that the param is jsonb (3802), and then runs its
    // jsonb serializer — JSON.stringify — on the value AGAIN. The column ended
    // up holding a JSON *string* whose content was JSON; the read parsed it
    // back to a JS string; `row.pages.map` threw in the one screen that reads
    // it. The local mock skipped Postgres and could never show it; tools.ts
    // carries seven `typeof x === 'string' ? JSON.parse(x)` guards that are
    // this same bug met earlier and patched at the read. Pass the OBJECT and
    // let the driver serialize exactly once. `sql.json()` makes the intent
    // explicit and survives a future switch to prepared statements.
    // (the `as any` is postgres-js's JSONValue type refusing an interface with
    // `string | null` fields; the runtime shape is plain JSON either way)
    const pages = Array.isArray(r.pages) && r.pages.length ? sql.json(r.pages as any) : null;
    const document = r.document && typeof r.document === 'object' ? sql.json(r.document as any) : null;
    // A brief with nothing in it is NULL, not an empty shell: the screen decides
    // what to show by whether a brief EXISTS, and an object of six nulls would
    // render an empty panel that reads as a rendering bug. `sql.json` for the
    // same reason as the two above — pass the object, serialize exactly once.
    const brief = r.brief && typeof r.brief === 'object' &&
      (r.brief.hook || r.brief.rehook || r.brief.source || r.brief.extraction || r.brief.note ||
       (Array.isArray(r.brief.beats) && r.brief.beats.length))
      ? sql.json(r.brief as any) : null;

    const [row] = await sql<{ inserted: boolean }[]>`
      INSERT INTO post_queue (
        user_id, queue_id, tier, lead, angle, format, carries,
        evidence_grade, source_disclosure, may_state_figure, status, campaign,
        title, kind, body, body_alt, body_deck, gate, copy_note, law_check, pages, document, brief
      ) VALUES (
        ${userId}, ${r.queue_id}, ${r.tier ?? null}, ${r.lead ?? null}, ${r.angle},
        ${r.format ?? null}, ${r.carries ?? null}, ${r.evidence_grade ?? null},
        ${r.source_disclosure ?? null}, ${r.may_state_figure}, ${incoming}, ${campaign},
        ${r.title ?? null}, ${kind}, ${r.body ?? null}, ${r.body_alt ?? null}, ${r.body_deck ?? null},
        ${r.gate ?? null}, ${r.copy_note ?? null}, ${r.law_check ?? null}, ${pages}, ${document}, ${brief}
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
        title             = EXCLUDED.title,
        kind              = EXCLUDED.kind,
        body              = EXCLUDED.body,
        body_alt          = EXCLUDED.body_alt,
        body_deck         = EXCLUDED.body_deck,
        gate              = EXCLUDED.gate,
        copy_note         = EXCLUDED.copy_note,
        law_check         = EXCLUDED.law_check,
        pages             = EXCLUDED.pages,
        document          = EXCLUDED.document,
        brief             = EXCLUDED.brief,
        -- PARKED IS A HUMAN DECISION AND OUTRANKS THE FILE (2026-08-18 review).
        -- The rank ladder scores parked as 0, so a re-import of a file whose row
        -- says next (rank 1) read as a step FORWARD and silently un-parked a slot
        -- Paul had parked — on a screen where Park and Re-import sit next to each
        -- other, under a button whose tooltip says state-preserving. A park is
        -- undone by pressing Unpark, never by re-reading the plan.
        -- (No backticks in here: this is inside a JS template literal, and the
        --  first one ends the string. That was a compile error for one minute.)
        status            = CASE WHEN post_queue.status = 'parked' THEN post_queue.status
                                 WHEN ${rank(sql`post_queue.status`)} > ${rank(sql`EXCLUDED.status`)}
                                 THEN post_queue.status ELSE EXCLUDED.status END,
        -- a campaign stamps; the standing queue (null) never un-stamps
        campaign          = COALESCE(EXCLUDED.campaign, post_queue.campaign),
        updated_at        = NOW()
      RETURNING (xmax = 0) AS inserted`;
    if (row?.inserted) result.inserted++; else result.updated++;
  }
  return result;
}

/**
 * A jsonb column that holds a JSON *string* (the double-encode described at the
 * import) comes back as a JS string. Every row already in production was
 * written that way before the fix, and "re-import to repair" is a step that
 * does not get taken at 8pm from a phone. So the read unwraps it: a string
 * that parses to the expected shape is returned as that shape. Idempotent on
 * correctly-stored rows; a string that is not JSON is left alone.
 */
function unwrapJson<T>(v: unknown, ok: (x: unknown) => x is T): T | null {
  if (v == null) return null;
  if (ok(v)) return v;
  if (typeof v === 'string') {
    try { const p = JSON.parse(v); return ok(p) ? p : null; } catch { return null; }
  }
  return null;
}
const isPages = (x: unknown): x is QueuePage[] => Array.isArray(x);
const isDoc = (x: unknown): x is QueueDocument => !!x && typeof x === 'object' && !Array.isArray(x);
const isBrief = (x: unknown): x is QueueBrief => !!x && typeof x === 'object' && !Array.isArray(x);

export function normalizeQueueRow<R extends Record<string, any>>(row: R): R {
  const pages = unwrapJson(row.pages, isPages);
  const pages_edit = unwrapJson(row.pages_edit, isPages);
  const pages_base = unwrapJson(row.pages_base, isPages);
  const document = unwrapJson(row.document, isDoc);
  const brief = unwrapJson(row.brief, isBrief);
  // `beats` is the one field the screen iterates, so it is the one that throws
  // if it arrives as anything else — the same shape of failure as `pages.map`.
  if (brief && !Array.isArray((brief as any).beats)) {
    (brief as any).beats = unwrapJson((brief as any).beats, (x): x is string[] => Array.isArray(x)) ?? [];
  }
  // a document whose thumbs were themselves stringified (nested double-encode) — same unwrap, one level down
  if (document && typeof (document as any).thumbs === 'string') {
    (document as any).thumbs = unwrapJson((document as any).thumbs, (x): x is string[] => Array.isArray(x)) ?? [];
  }
  if (document && !Array.isArray((document as any).thumbs)) (document as any).thumbs = [];
  return { ...row, pages, pages_edit, pages_base, document, brief };
}

export async function listQueue(userId: number): Promise<any[]> {
  const rows = await sql`
    SELECT * FROM post_queue WHERE user_id = ${userId}
    ORDER BY
      CASE status WHEN 'drafted' THEN 0 WHEN 'next' THEN 1 WHEN 'recurring' THEN 2
                  WHEN 'posted' THEN 3 ELSE 4 END,
      scheduled_for NULLS LAST,
      queue_id`;
  return rows.map(normalizeQueueRow);
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
    retiredCheck?: string | null; notes?: string | null; pillar?: string | null;
  },
): Promise<any | null> {
  if (patch.status && !STATUSES.has(patch.status)) throw new Error(`Unknown status "${patch.status}"`);
  /* The pillar vocabulary is owned by shared/pillars.ts and checked HERE rather
     than by a CHECK constraint, the same way crm_leads.status is — a CHECK makes
     a rename a migration. '' is the deliberate un-set (see the SET clause). */
  if (patch.pillar && !isPillarId(patch.pillar)) throw new Error(`Unknown pillar "${patch.pillar}"`);

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
      -- COALESCE cannot CLEAR a value, and a date you can set but never remove
      -- is a trap on a surface whose whole point is "schedule it when you are
      -- ready". An explicit empty string is the un-set; undefined still means
      -- leave it alone, so nothing that already works changes.
      scheduled_for   = CASE WHEN ${patch.scheduledFor === ''} THEN NULL
                             ELSE COALESCE(${patch.scheduledFor || null}::date, scheduled_for) END,
      post_url        = COALESCE(${patch.postUrl ?? null}, post_url),
      draft_path      = COALESCE(${patch.draftPath ?? null}, draft_path),
      collateral_path = COALESCE(${patch.collateralPath ?? null}, collateral_path),
      retired_check   = COALESCE(${patch.retiredCheck ?? null}, retired_check),
      notes           = COALESCE(${patch.notes ?? null}, notes),
      -- Same empty-string un-set as scheduled_for above: a pillar you can set
      -- but never clear would strand a mis-tagged post in a rollup forever.
      pillar          = CASE WHEN ${patch.pillar === ''} THEN NULL
                             ELSE COALESCE(${patch.pillar || null}, pillar) END,
      drafted_at      = CASE WHEN ${patch.status ?? null} = 'drafted' AND drafted_at IS NULL
                             THEN NOW() ELSE drafted_at END,
      -- Stamped here, never accepted from the caller, and only ever on the
      -- transition INTO posted. Publication is a decision; this is its record.
      posted_at       = CASE WHEN ${patch.status ?? null} = 'posted' AND posted_at IS NULL
                             THEN NOW() ELSE posted_at END,
      updated_at      = NOW()
    WHERE user_id = ${userId} AND queue_id = ${queueId}
    RETURNING *`;
  // The client swaps its row for this one — it must come back in the same
  // unwrapped shape as the list, or "edit" crashes on the row "view" just fixed.
  return row ? normalizeQueueRow(row) : null;
}

/* ── THE DRAFT — decisions made in the app before Cowork renders ──────────
 *
 * Paul, 2026-08-19: "i want to be able to choose the template and edit the
 * copy before anything is finally rendered in Cowork." Migration 138. These
 * are the human's call on the row — template pick, edited copy, edited page
 * copy — and they are STATE: the importer never writes them, so a re-import
 * cannot discard a decision. The studio reads them with
 * scripts/studio/pull-queue.mjs and renders from them.
 *
 * Validation is deliberately thin: the template must be a known id for the
 * slot's kind (shared/templates.ts — one register for the picker, this check,
 * and the pull script), pages_edit must be the plan's page shape, and an
 * empty edit CLEARS (null) rather than storing "". Nothing here can fire a
 * render; the app calls no builder. */
const isQueuePage = (x: any): x is QueuePage =>
  !!x && typeof x === 'object' && Number.isInteger(x.n) && typeof x.text === 'string'
  && (x.label == null || typeof x.label === 'string') && (x.note == null || typeof x.note === 'string');

export async function updateQueueDraft(
  userId: number,
  queueId: string,
  patch: { template?: string | null; copyEdit?: string | null; pagesEdit?: QueuePage[] | null },
): Promise<any | null> {
  const [curRaw] = await sql`SELECT queue_id, kind, body, pages FROM post_queue WHERE user_id = ${userId} AND queue_id = ${queueId}`;
  if (!curRaw) return null;
  const cur = normalizeQueueRow(curRaw);

  let template: string | null | undefined = patch.template;
  if (template !== undefined) {
    template = template && template.trim() ? template.trim() : null;
    if (template) {
      const t = templateById(template);
      if (!t) throw new Error(`Unknown template "${template}" — it is not in shared/templates.ts`);
      // Compare against the MEDIUM's renderer family, not the medium itself:
      // an `image` slot is rendered by the `text` templates (the single-image
      // post), and comparing kind to `for` directly refused on Save the exact
      // pick the app had just offered.
      const want = templateForKind(cur.kind);
      if (cur.kind && t.for !== want) {
        throw new Error(want
          ? `Template "${template}" renders a ${t.for} slot; this slot is ${cur.kind}`
          : `This slot is ${cur.kind} — nothing renders it, so it takes a video file rather than a template`);
      }
    }
  }
  // An edit equal to the plan (ignoring end whitespace) is no edit — store
  // null, so "edited" is never claimed for a no-op. Otherwise the edit is
  // stored WITH the plan text it was made against (copy_base), which is what
  // lets shared/draft.ts tell a live edit from one the plan has since moved
  // past.
  let copyEdit: string | null | undefined = patch.copyEdit;
  if (copyEdit !== undefined) copyEdit = copyEdit && copyEdit.trim() && copyEdit.trim() !== (cur.body ?? '').trim() ? copyEdit : null;
  let pagesEdit: QueuePage[] | null | undefined = patch.pagesEdit;
  if (pagesEdit !== undefined) {
    if (pagesEdit == null || (Array.isArray(pagesEdit) && pagesEdit.length === 0)) pagesEdit = null;
    else if (!Array.isArray(pagesEdit) || !pagesEdit.every(isQueuePage)) throw new Error('pages_edit must be [{n, label, text, note}]');
    else if (pagesEqual(pagesEdit, cur.pages)) pagesEdit = null;
  }

  const [row] = await sql`
    UPDATE post_queue SET
      template   = CASE WHEN ${template === undefined} THEN template   ELSE ${template ?? null} END,
      copy_edit  = CASE WHEN ${copyEdit === undefined} THEN copy_edit  ELSE ${copyEdit ?? null} END,
      copy_base  = CASE WHEN ${copyEdit === undefined} THEN copy_base  ELSE ${copyEdit ? (cur.body ?? null) : null} END,
      pages_edit = CASE WHEN ${pagesEdit === undefined} THEN pages_edit ELSE ${pagesEdit ? sql.json(pagesEdit as any) : null} END,
      pages_base = CASE WHEN ${pagesEdit === undefined} THEN pages_base ELSE ${pagesEdit && cur.pages ? sql.json(cur.pages as any) : null} END,
      draft_at   = NOW(),
      updated_at = NOW()
    WHERE user_id = ${userId} AND queue_id = ${queueId}
    RETURNING *`;
  return row ? normalizeQueueRow(row) : null;
}

/**
 * The drafts, as the studio pulls them: every row carrying a decision, with
 * the plan's own copy beside the edit so a session sees the DIFF and not just
 * the override, and the document's spec path so it knows which file to open.
 */
/**
 * SEND TO STUDIO (migration 140) — record that this slot is ready to be built.
 *
 * It records a request. It does not build: the app calls no builder, writes
 * nothing to the clone, and could not render if it wanted to — the renderer is
 * local Chromium against the workspace on Paul's Mac. `pull-queue.mjs --sent`
 * is what acts on this, and the round trip closes at `markQueueBuilt`.
 *
 * THE SERVER REFUSES, NOT THE BUTTON — the same posture as Mark posted. The
 * rule is `shared/studioSend.ts` so the button can grey itself out with the
 * same sentence, and the two can never drift into disagreeing about whether a
 * bracketed caption may be built.
 */
export async function sendQueueToStudio(userId: number, queueId: string): Promise<any | null> {
  const [cur] = await sql`
    SELECT kind, status, body, copy_edit, gate, template
    FROM post_queue WHERE user_id = ${userId} AND queue_id = ${queueId}`;
  if (!cur) return null;
  const verdict = sendReadiness(cur as any);
  if (!verdict.ok) throw new Error(`${queueId}: ${verdict.reason}`);

  // Re-sending CLEARS the previous build. The studio is being asked for a new
  // one, and leaving built_at behind would let the screen keep reporting a
  // render that answers the old decision — the same class of lie `copy_base`
  // was added to prevent one step earlier.
  const [row] = await sql`
    UPDATE post_queue
    SET sent_at = NOW(), built_at = NULL, updated_at = NOW()
    WHERE user_id = ${userId} AND queue_id = ${queueId}
    RETURNING *`;
  return row ? { ...normalizeQueueRow(row), asks: verdict.asks } : null;
}

/** Un-send: the request is withdrawn. Leaves every decision on the row alone. */
export async function unsendQueue(userId: number, queueId: string): Promise<any | null> {
  const [row] = await sql`
    UPDATE post_queue SET sent_at = NULL, updated_at = NOW()
    WHERE user_id = ${userId} AND queue_id = ${queueId}
    RETURNING *`;
  return row ? normalizeQueueRow(row) : null;
}

/**
 * The studio's answer: it built the slot and filed it here. Called by
 * `pull-queue.mjs --built`, never by a person in the app — the app has no way
 * to know a render happened, and a button that claimed one would be guessing.
 *
 * The path lands in `collateral_path` — the column migration 123 already added
 * for where the collateral went. It is required by the table's own CHECK, and
 * required here with a better error than the constraint's: a build with no
 * location is not a record of a build, it is a claim.
 */
export async function markQueueBuilt(userId: number, queueId: string, builtPath: string): Promise<any | null> {
  const where = String(builtPath ?? '').trim();
  if (!where) throw new Error(`${queueId}: a build has to say where it landed — pass the path Cowork filed it at.`);
  const [row] = await sql`
    UPDATE post_queue
    SET built_at = NOW(), collateral_path = ${where}, updated_at = NOW()
    WHERE user_id = ${userId} AND queue_id = ${queueId} AND sent_at IS NOT NULL
    RETURNING *`;
  // No row means either no such slot or one that was never sent. The second is
  // the interesting one and is reported rather than swallowed: a build nobody
  // asked for is a session working from a stale pull.
  return row ? normalizeQueueRow(row) : null;
}

export async function listQueueDrafts(userId: number, sentOnly = false): Promise<any[]> {
  const rows = await sql`
    SELECT queue_id, campaign, title, kind, status, scheduled_for,
           template, copy_edit, copy_base, pages_edit, pages_base, draft_at,
           sent_at, built_at, collateral_path,
           body, pages, document, gate, law_check
    FROM post_queue
    WHERE user_id = ${userId}
      AND (template IS NOT NULL OR copy_edit IS NOT NULL OR pages_edit IS NOT NULL
           OR sent_at IS NOT NULL)
      AND (${sentOnly} = false OR sent_at IS NOT NULL)
    ORDER BY scheduled_for NULLS LAST, queue_id`;
  return rows.map(normalizeQueueRow).map((r: any) => {
    const t = templateById(r.template);
    return {
      queue_id: r.queue_id, campaign: r.campaign, title: r.title, kind: r.kind, status: r.status,
      scheduled_for: r.scheduled_for, draft_at: r.draft_at,
      // The pick WITH its renderer and the flag to set — the pull script
      // promised this and the first cut sent only the id.
      template: t ? { id: t.id, label: t.label, renderer: t.renderer, hint: t.hint, status: t.status } : r.template ? { id: r.template, unknown: true } : null,
      copy: r.copy_edit != null ? { state: copyDraftState(r), edit: r.copy_edit, plan: r.body, base: r.copy_base } : null,
      pages: r.pages_edit != null ? { state: pagesDraftState(r), edit: r.pages_edit, plan: r.pages, base: r.pages_base } : null,
      spec: r.document?.spec ?? null,
      filed_at: r.document?.filed_at ?? null,
      /* the request (migration 140) — what the studio is being asked for */
      sent_at: r.sent_at ?? null,
      built_at: r.built_at ?? null,
      collateral_path: r.collateral_path ?? null,
      send: sendState(r),
      asks: sendReadiness(r).asks ?? null,
      /* the text to post, resolved once here so the pull script never has to
         choose between the edit and the plan — that rule lives in one place */
      caption: outgoingCopy(r),
      gate: r.gate ?? null,
      law_check: r.law_check ?? null,
    };
  });
}

export async function queuePerformance(userId: number): Promise<any[]> {
  return sql`
    SELECT q.queue_id, q.lead, q.format, q.evidence_grade, q.status, q.posted_at,
           a.id AS analytics_id, a.period_start, a.period_end, a.data
    FROM post_queue q
    LEFT JOIN studio_analytics a ON a.queue_id = q.queue_id AND a.user_id = q.user_id
    WHERE q.user_id = ${userId} AND q.status = 'posted'
    ORDER BY q.posted_at DESC NULLS LAST`;
}

/* ── LOG A POST THAT IS ALREADY UP ──────────────────────────────────────── */

/**
 * (Paul, 2026-08-21: "All of the app creation will be outside of the app… I
 * just need a place in the app to log once a post has been made so that we can
 * track metrics.")
 *
 * The queue was built as a PLAN — rows created ahead of time, drafted, sent to
 * the studio, then marked posted. That shape assumes the app holds the copy. It
 * no longer does: the argument is written in Gemini, formatted and published in
 * Typegrow, and any collateral is built in Cowork. By the time the app hears
 * about a post, it is already live on LinkedIn.
 *
 * So this is not `createQueueRow` followed by `updateQueueState`. It is one
 * insert producing a row born POSTED, because the three states in between never
 * happened — and a row that pretended they did would carry a `drafted_at` for a
 * draft nobody wrote here.
 *
 * WHY THIS DOES NOT RUN THE RETIRED-CHECK GATE, stated so it reads as a
 * decision rather than an omission. `updateQueueState` refuses to mark a row
 * posted until retired-check has run, and that gate is right: it stands between
 * a caption the app is holding and a retired figure going out. Here the post is
 * ALREADY OUT. Refusing the log protects nothing — it only means the post goes
 * untracked, which is strictly worse. `retired_check` records whatever Paul
 * says it was and defaults to `not_run`, which is this schema's honest value
 * for "we did not check": migration 123 made the column NOT NULL precisely so
 * that "we didn't check" could never look the same as "we checked and it was
 * fine". The gate on the planned path is untouched.
 */
export async function logPostedPost(
  userId: number,
  input: { title?: string; pillar?: string; url?: string; postedOn?: string; retiredCheck?: string; notes?: string },
): Promise<any> {
  const title = (input.title ?? '').trim();
  if (!title) throw new Error('Say what the post was — a few words is enough to recognise it later.');
  if (input.pillar && !isPillarId(input.pillar)) throw new Error(`Unknown pillar "${input.pillar}"`);

  const today = new Date().toISOString().slice(0, 10);
  const postedOn = input.postedOn && ISO_DAY.test(input.postedOn) ? input.postedOn : null;
  if (postedOn && postedOn > today) throw new Error('That date is in the future — log a post after it goes up.');

  const stamp = today.replace(/-/g, '');
  const taken = await sql<{ queue_id: string }[]>`
    SELECT queue_id FROM post_queue
    WHERE user_id = ${userId} AND queue_id LIKE ${'L-' + stamp + '-%'}`;
  let n = taken.length + 1;
  const used = new Set(taken.map(r => r.queue_id));
  while (used.has(`L-${stamp}-${n}`)) n++;
  /* `L-` rather than `N-`: a logged post and one composed in the app are
     different animals, and the id says which without anyone reading the row. */
  const queueId = `L-${stamp}-${n}`;

  const [row] = await sql`
    INSERT INTO post_queue (
      user_id, queue_id, angle, title, kind, status, campaign, pillar,
      may_state_figure, post_url, retired_check, notes, origin, posted_at
    ) VALUES (
      ${userId}, ${queueId}, ${title}, ${title}, 'text', 'posted', NULL, ${input.pillar || null},
      true, ${(input.url ?? '').trim() || null},
      ${input.retiredCheck === 'clean' || input.retiredCheck === 'flagged' ? input.retiredCheck : 'not_run'},
      ${(input.notes ?? '').trim() || null}, 'app',
      -- Logged today: the real moment. Backdated: NOON UTC, so no reader's
      -- timezone can slide it onto the wrong day in either direction — the trap
      -- the Posted line already carries a comment about. days_after_post reads
      -- posted_at::date, so noon is safe for the metrics too.
      CASE WHEN ${postedOn}::date IS NULL THEN NOW()
           ELSE (${postedOn}::date + TIME '12:00') AT TIME ZONE 'UTC' END
    )
    RETURNING *`;
  return normalizeQueueRow(row);
}

/* ── WHAT THE POST ACTUALLY DID — one reading, one day ───────────────────── */

/**
 * A reading is what LinkedIn showed on ONE day. Migration 142 carries the
 * reasoning for why these are rows rather than five columns; the short form is
 * that LinkedIn revises a post's figures upward for days, so an impression
 * count with no age is two numbers multiplied, and a per-pillar median built
 * from mixed-age readings answers "which pillar did I check later".
 *
 * NULL MEANS UNKNOWN AND NEVER ZERO. A blank box comes back null, not 0 — a
 * zero would be a measurement, and it would drag its pillar's median while
 * looking like one.
 */
export interface ReadingInput {
  readOn?: string | null;
  impressions?: unknown;
  membersReached?: unknown;
  reactions?: unknown;
  comments?: unknown;
  reposts?: unknown;
}

/** '' and null and undefined are all "not typed in". A real 0 survives. */
function count(v: unknown, field: string): number | null {
  if (v == null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[,\s]/g, ''));
  if (!Number.isFinite(n)) throw new Error(`${field} is not a number.`);
  if (n < 0) throw new Error(`${field} cannot be negative.`);
  return Math.round(n);
}

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Record (or correct) one day's reading.
 *
 * UPSERT ON THE DAY, not append: re-typing today's numbers fixes today's
 * reading rather than leaving a ghost that skews the median. A different day
 * is a different row, which is how the curve survives.
 *
 * `days_after_post` is derived from post_queue.posted_at in SQL rather than
 * accepted from the caller — it is the field that makes two posts comparable,
 * so it must not be typeable.
 */
export async function recordReading(userId: number, queueId: string, input: ReadingInput): Promise<any | null> {
  const [slot] = await sql<{ posted_at: string | null }[]>`
    SELECT posted_at FROM post_queue WHERE user_id = ${userId} AND queue_id = ${queueId}`;
  if (!slot) return null;

  const readOn = input.readOn && ISO_DAY.test(input.readOn) ? input.readOn : null;
  const nums = {
    impressions:     count(input.impressions, 'Impressions'),
    members_reached: count(input.membersReached, 'Members reached'),
    reactions:       count(input.reactions, 'Reactions'),
    comments:        count(input.comments, 'Comments'),
    reposts:         count(input.reposts, 'Reposts'),
  };
  if (Object.values(nums).every(v => v === null)) {
    throw new Error('Nothing to record — type at least one number from the post\u2019s analytics.');
  }
  /* A reading dated before the post is a typo, and it would land as a negative
     age that the CHECK rejects with a message nobody can act on. Say it here. */
  if (readOn && slot.posted_at && readOn < String(slot.posted_at).slice(0, 10)) {
    throw new Error(`${queueId}: that reading is dated before the post went up (${String(slot.posted_at).slice(0, 10)}).`);
  }

  const [row] = await sql`
    INSERT INTO post_metrics (user_id, queue_id, read_on, days_after_post,
                              impressions, members_reached, reactions, comments, reposts)
    VALUES (
      ${userId}, ${queueId},
      COALESCE(${readOn}::date, CURRENT_DATE),
      (SELECT COALESCE(${readOn}::date, CURRENT_DATE) - q.posted_at::date
         FROM post_queue q WHERE q.user_id = ${userId} AND q.queue_id = ${queueId}),
      ${nums.impressions}, ${nums.members_reached}, ${nums.reactions}, ${nums.comments}, ${nums.reposts}
    )
    ON CONFLICT (user_id, queue_id, read_on) DO UPDATE SET
      impressions     = EXCLUDED.impressions,
      members_reached = EXCLUDED.members_reached,
      reactions       = EXCLUDED.reactions,
      comments        = EXCLUDED.comments,
      reposts         = EXCLUDED.reposts,
      days_after_post = EXCLUDED.days_after_post,
      updated_at      = NOW()
    RETURNING *`;
  return row ?? null;
}

/** Every reading this user has recorded, oldest first. The rollup folds them. */
export async function listReadings(userId: number): Promise<any[]> {
  return sql`
    SELECT queue_id, read_on::text AS read_on, days_after_post,
           impressions, members_reached, reactions, comments, reposts
    FROM post_metrics WHERE user_id = ${userId}
    ORDER BY queue_id, read_on`;
}

/** Remove one day's reading — a mis-typed date is the only way to strand one. */
export async function deleteReading(userId: number, queueId: string, readOn: string): Promise<boolean> {
  if (!ISO_DAY.test(readOn)) throw new Error('A reading is removed by its date (YYYY-MM-DD).');
  const rows = await sql`
    DELETE FROM post_metrics
    WHERE user_id = ${userId} AND queue_id = ${queueId} AND read_on = ${readOn}::date
    RETURNING id`;
  return rows.length > 0;
}

/* ── the library — a guide, not a calendar ──────────────────────────────── */

/**
 * THE HOOK LIBRARY (2026-08-20, Paul: *"I'm going to go with more of a GUIDE and
 * less of a specific post per day prescription — every month will run a research
 * to see what topics are hot and right now these are hot. I will just come up
 * with the copy and paste that into the app and then hit send to Cowork."*).
 *
 * A CAMPAIGN IS A CALENDAR; A LIBRARY IS A REFERENCE. That is the whole
 * difference and it decides the data model: a campaign's rows ARE the posts,
 * one per day, and the file owns their content. A library's hooks are not
 * posts and never become rows — they are a menu Paul draws from, and one hook
 * may feed three posts or none. Nothing here is consumed by being used.
 *
 * So the library is READ, never imported. `post_queue` gains nothing from it;
 * a post made from a hook is an ordinary row that happens to have been seeded
 * with one, and it carries no link back — using a hook twice must not make the
 * second post look like a duplicate of the first.
 */
export interface LibraryHook { id: string; style: string; hook: string; direction: string }
export interface LibraryPillar { id: string; title: string; sub: string; goal: string; hooks: LibraryHook[] }
export interface Library { name: string; title: string; note: string; pillars: LibraryPillar[]; file: string }

const LIBRARY_FILE = /^library-([\w-]+)\.json$/;

/** Every library the build ships, NEWEST FIRST by name — a month is a file. */
export async function listLibraries(dir = CAMPAIGN_DIR): Promise<Library[]> {
  let names: string[];
  try { names = (await readdir(dir)).filter(f => LIBRARY_FILE.test(f)).sort().reverse(); } catch { return []; }
  const out: Library[] = [];
  for (const f of names) {
    try {
      const parsed = JSON.parse(await readFile(path.join(dir, f), 'utf8'));
      const pillars: LibraryPillar[] = Array.isArray(parsed?.pillars) ? parsed.pillars.filter((p: any) =>
        p && typeof p.id === 'string' && Array.isArray(p.hooks)) : [];
      if (!pillars.length) continue;   // a library with no hooks is not a library
      out.push({
        name: LIBRARY_FILE.exec(f)![1],
        title: typeof parsed.title === 'string' ? parsed.title : f,
        note: typeof parsed.note === 'string' ? parsed.note : '',
        pillars,
        file: path.join('content/studio', f),
      });
    } catch { /* a malformed library is skipped, never half-read */ }
  }
  return out;
}

/** One hook, by its id, across every shipped library. */
export async function findHook(hookId: string, dir = CAMPAIGN_DIR): Promise<{ hook: LibraryHook; pillar: LibraryPillar; library: Library } | null> {
  for (const library of await listLibraries(dir)) {
    for (const pillar of library.pillars) {
      const hook = pillar.hooks.find(h => h.id === hookId);
      if (hook) return { hook, pillar, library };
    }
  }
  return null;
}

/**
 * Make a post. Paul curates the idea in the app and only Cowork's half happens
 * elsewhere, so this is the one place a row is born without a file behind it.
 *
 * THAT IS SAFE BY CONSTRUCTION, not by promise: every importer iterates the
 * ids in a FILE, so an id no file contains can never be overwritten by one.
 * The row therefore owns its own content — which is exactly the opposite of a
 * campaign row, and the reason `origin` records which kind it is.
 *
 * THE ID IS DATED AND SEQUENTIAL WITHIN ITS DAY (`N-20260820-1`) because an id
 * is one post forever — analytics join on it — and a scheme that could ever
 * repeat would fold two posts' numbers into one line. The suffix counts the
 * ids already taken for that day rather than the rows created, so deleting one
 * cannot hand its id to the next post.
 */
export async function createQueuePost(
  userId: number,
  input: { hookId?: string | null; kind?: string | null; title?: string | null; angle?: string | null; scheduledFor?: string | null },
  dir = CAMPAIGN_DIR,
): Promise<any> {
  const found = input.hookId ? await findHook(input.hookId, dir) : null;
  if (input.hookId && !found) throw new Error(`No hook "${input.hookId}" in any library that ships with this build.`);

  const kind = typeof input.kind === 'string' && KINDS.has(input.kind) ? input.kind : 'text';
  const title = (input.title ?? '').trim() || (found ? `${found.pillar.title} — ${found.hook.style}` : 'Untitled post');
  // `angle` is required by validateQueue and is what the screen falls back to
  // when there is no title; the hook is the truest one-line answer to "what is
  // this post", so it is the angle when a hook seeded it.
  const angle = (input.angle ?? '').trim() || (found ? found.hook.hook : title);

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const taken = await sql<{ queue_id: string }[]>`
    SELECT queue_id FROM post_queue
    WHERE user_id = ${userId} AND queue_id LIKE ${'N-' + today + '-%'}`;
  let n = taken.length + 1;
  const used = new Set(taken.map(r => r.queue_id));
  while (used.has(`N-${today}-${n}`)) n++;
  const queueId = `N-${today}-${n}`;

  const brief = found ? {
    hook: found.hook.hook,
    rehook: null,
    beats: [],
    source: null,
    extraction: null,
    note: `${found.pillar.title}${found.pillar.sub ? ' · ' + found.pillar.sub : ''} — ${found.hook.style}. Direction: ${found.hook.direction}`,
  } : null;

  const [row] = await sql`
    INSERT INTO post_queue (
      user_id, queue_id, angle, title, kind, status, campaign, brief,
      may_state_figure, scheduled_for, origin
    ) VALUES (
      ${userId}, ${queueId}, ${angle}, ${title}, ${kind}, 'next', ${found ? `library-${found.library.name}` : null},
      ${brief ? sql.json(brief as any) : null},
      -- A post starts ALLOWED to state figures: the library's hooks are mostly
      -- data drops, and the retired-check before Mark posted is what actually
      -- guards the number. Defaulting to false would refuse most of the menu.
      true, ${input.scheduledFor ?? null}::date, 'app'
    )
    RETURNING *`;
  return normalizeQueueRow(row);
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
  /** Rows carrying paste-ready copy, and document slots whose PDF ships in this build (migration 136). */
  withCopy: number;
  documentsReady: number;
  /** Rows carrying a PLAN and no draft yet (migration 139). A campaign can be
   *  entirely briefs — the 30-day sequence is — and the load card must say that
   *  rather than reporting "0 with copy" as if the import had failed. */
  withBrief: number;
}

/** Pure: read one campaign file's shape into meta. Exported for the tests. */
export function campaignMeta(name: string, file: string, parsed: any): CampaignMeta {
  const rows: any[] = Array.isArray(parsed?.rows) ? parsed.rows : [];
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
    withCopy: rows.filter(r => typeof r?.body === 'string' && r.body.trim()).length,
    documentsReady: rows.filter(r => typeof r?.document?.pdf === 'string').length,
    withBrief: rows.filter(r => !(typeof r?.body === 'string' && r.body.trim()) && r?.brief && typeof r.brief === 'object').length,
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
