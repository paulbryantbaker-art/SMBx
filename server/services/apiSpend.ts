/**
 * THE API KILL SWITCH — one place that decides whether a path is allowed to
 * spend money on a model call.
 *
 * WHY THIS EXISTS (2026-08-09, Paul: "Ok we need to kill these bc they eat up
 * API. ALL of them." → "Let's kill all for now.")
 *
 * A saved research campaign fired unattended on the metered org key and
 * emailed the result. The immediate fix — scheduler off by default, every
 * campaign row disarmed (migration 122) — closed the one path that ran on a
 * timer. It did not close the other nine, and that was the real complaint:
 * spend was scattered across a dozen services with no single answer to "what
 * in this app can call a model?"
 *
 * So the answer lives here, and every expensive path asks it. The inventory
 * behind the lane map is a grep of every `messages.create` / `messages.stream`
 * / `generativelanguage` call site in server/ — not a guess about which
 * services look expensive.
 *
 * THE LANES map onto the routing table in `house/where.ts`, which is why the
 * defaults are what they are:
 *
 *   research  OFF — web research runs and master synthesis, and nothing else.
 *                   THE ONLY PATH IN THIS APP THAT CAN SPEND DOLLARS ON ONE
 *                   PRESS: at `deep` it is 40 searches billed at $10/1k plus 25
 *                   fetches re-entering context across up to 12 pause_turn
 *                   rounds, ~$18 a click, and it is the only one that ever ran
 *                   unattended on a schedule. Lives in Cowork.
 *   studio    ON  — corp-dev documents, collateral composition, deck design,
 *                   artwork, and Yulia's read of a LinkedIn import. Cheap,
 *                   bounded, single-turn work that happens to have lived in the
 *                   same folder as research.
 *   sourcing  ON  — the 5-stage sourcing engine and the portfolio jobs. Haiku
 *                   per candidate, on a Places key that is free under 5k
 *                   lookups a month. It was never the expensive thing.
 *   chat      ON  — Yulia, the agentic loop, deliverables, document/field
 *                   extraction, gate summaries, briefings. This IS the app;
 *                   killing it leaves a brick. CLAUDE.md: "The operational
 *                   core is NOT gated beyond team auth."
 *   marketing ON  — the practice intake engine and report Q&A. Both are
 *                   lead-facing and both already fail SOFT, so a kill here
 *                   silently breaks the funnel rather than Paul's work —
 *                   which is the one failure mode CLAUDE.md calls out by name.
 *
 * WHY `research` WAS SPLIT OUT OF `studio` (2026-08-14, Paul: "corp-dev
 * documents, deal memo / diligence plan / term framework, collateral is in app
 * too… research and research aggregation, deep search, data wrangling are
 * cowork. Everything about the deal and CRM needs to be in app.")
 *
 * One lane cannot express that. `studio` bundled the ~$18-a-press research
 * agent together with document composition and deck design, which cost cents,
 * so switching collateral on ALSO armed the research agent — the exact thing
 * this file was written to stop. The bundle was never a judgement that those
 * paths were alike; it was that they happened to be reachable from the same
 * screen. Splitting on COST rather than on screen is what makes the routing
 * table enforceable.
 *
 * The `research` lane is therefore deliberately narrow: two services, both
 * expensive, both with a Cowork equivalent. Everything else that used to be
 * "studio" is now on by default, because the app is the one place.
 *
 * "Kill all for now" still holds where it mattered: the one path that can
 * spend real money unattended is off, and `API_LANES=none` kills literally
 * everything including chat — deliberately a single word.
 *
 * ONE ENV VAR, THREE BEHAVIOURS:
 *   API_LANES unset            → chat,marketing,studio,sourcing   (the default)
 *   API_LANES=all              → every lane, RESEARCH INCLUDED
 *   API_LANES=none  (or "")    → no lane at all
 *   API_LANES=chat,research    → exactly those, everything else off
 *
 * It is read on every call rather than cached at import, so a Railway variable
 * change takes effect on the next request instead of the next deploy — and so
 * the tests can drive it.
 */

export type SpendLane = 'chat' | 'marketing' | 'studio' | 'sourcing' | 'research';

export const SPEND_LANES: readonly SpendLane[] =
  ['chat', 'marketing', 'studio', 'sourcing', 'research'] as const;

/**
 * The posture as of 2026-08-14: everything except research.
 *
 * Widened from `chat,marketing` when the routing table settled on "the app is
 * the one place, Cowork is the input layer". The narrow default was correct
 * while Studio was out of the chrome and sourcing had just been ported out; it
 * became wrong the moment the deal, the documents and the collateral all came
 * back. Research stays off because it is the only lane that can spend dollars.
 */
export const DEFAULT_LANES: readonly SpendLane[] =
  ['chat', 'marketing', 'studio', 'sourcing'] as const;

/** What a blocked lane should say, in the practitioner's own vocabulary. */
const LANE_HELP: Record<SpendLane, string> = {
  research:
    'Web research and master synthesis happen in a Cowork session against ~/Documents/smbx-studio — this is the one path that can spend dollars on a single press (~$18 at `deep`), which is why it is off by default. See RESEARCH.md in the workspace.',
  studio:
    'Corp-dev documents, collateral and deck design are switched off at the API level. They are cheap and on by default, so this means API_LANES was set narrower than the default.',
  sourcing:
    'The sourcing engine is switched off at the API level. Target screening also runs locally — `npx tsx scripts/studio/screen.mts` against the market workspace.',
  chat: 'Yulia and the deal tools are switched off at the API level.',
  marketing: 'The public intake engine and report Q&A are switched off at the API level.',
};

function parseLanes(raw: string | undefined): Set<SpendLane> {
  if (raw === undefined) return new Set(DEFAULT_LANES);
  const v = raw.trim().toLowerCase();
  if (v === '' || v === 'none' || v === 'off' || v === 'false') return new Set();
  if (v === 'all') return new Set(SPEND_LANES);
  const out = new Set<SpendLane>();
  for (const part of v.split(',')) {
    const name = part.trim() as SpendLane;
    if (!name) continue;
    // An unknown name is DROPPED, never treated as "all" — a typo must fail
    // closed. It is warned about at boot so the typo is findable.
    if ((SPEND_LANES as readonly string[]).includes(name)) out.add(name);
  }
  return out;
}

/** The lanes currently switched on. */
export function enabledLanes(): Set<SpendLane> {
  return parseLanes(process.env.API_LANES);
}

/** Names in API_LANES that match no lane — surfaced at boot so a typo is visible. */
export function unknownLaneNames(): string[] {
  const raw = process.env.API_LANES;
  if (raw === undefined) return [];
  const v = raw.trim().toLowerCase();
  if (v === '' || v === 'none' || v === 'off' || v === 'false' || v === 'all') return [];
  return v
    .split(',')
    .map(s => s.trim())
    .filter(s => s && !(SPEND_LANES as readonly string[]).includes(s));
}

export function spendAllowed(lane: SpendLane): boolean {
  return enabledLanes().has(lane);
}

/**
 * Thrown by a blocked path. Carries `status = 503` so a route that maps it can
 * answer "temporarily unavailable" rather than "server error" — but the
 * MESSAGE is the part that matters, because most routes surface err.message
 * straight to the UI and that is where Paul will read it.
 */
export class SpendDisabledError extends Error {
  readonly lane: SpendLane;
  readonly status = 503;
  constructor(lane: SpendLane, what: string) {
    super(
      `${what} is switched off in the app (lane "${lane}"). ${LANE_HELP[lane]} ` +
        `To turn it back on set API_LANES=${[...new Set([...enabledLanes(), lane])].join(',')} and redeploy.`,
    );
    this.name = 'SpendDisabledError';
    this.lane = lane;
  }
}

/**
 * Thrown when the month's global ceiling is reached. Same shape as
 * SpendDisabledError — status 503, and the MESSAGE is what reaches the UI — so
 * every route that already maps the one maps the other without changes.
 *
 * The message states the number rather than saying "limit reached", because the
 * only useful next action is deciding whether that number was right.
 */
export class SpendCeilingError extends Error {
  readonly status = 503;
  readonly spentCents: number;
  readonly capCents: number;
  constructor(what: string, spentCents: number, capCents: number) {
    super(
      `${what} is paused: model spend has reached $${(spentCents / 100).toFixed(2)} of the ` +
        `$${(capCents / 100).toFixed(2)} monthly ceiling. Raise it with API_MONTHLY_CAP_CENTS ` +
        `(cents, e.g. 50000 for $500) or set API_MONTHLY_CAP_CENTS=none to remove it. ` +
        `Spend resets on the 1st, UTC.`,
    );
    this.name = 'SpendCeilingError';
    this.spentCents = spentCents;
    this.capCents = capCents;
  }
}

/**
 * Throw unless `lane` is on AND the month's global ceiling is unbroken.
 *
 * The ceiling is checked HERE, in the existing lane gate, rather than at the
 * model calls themselves. That is the whole reason it covers everything: there
 * are 79 `assertSpendAllowed` / `spendAllowed` call sites across 31 services and
 * exactly one of them would have been remembered if the ceiling had its own
 * separate guard. A path that is already asking "am I allowed to spend" is the
 * right place to answer "and is there budget left".
 */
export function assertSpendAllowed(lane: SpendLane, what: string): void {
  if (!spendAllowed(lane)) throw new SpendDisabledError(lane, what);
  if (ceilingBreached()) throw new SpendCeilingError(what, spentThisMonthCents(), monthlyCapCents());
}

// ─── THE GLOBAL CEILING ─────────────────────────────────────
//
// API_LANES answers "may this path spend?". It cannot answer "have we spent
// enough already?", and the outage that produced the kill switch was a spend
// event, not a permissions event. RESEARCH_MONTHLY_CAP_CENTS was the only
// ceiling in the tree and it guards the studio lane alone, which is the lane
// that is already switched off.
//
// CONSERVATIVE BY DEFAULT, and it fails CLOSED at the lane gate rather than
// mid-stream: a request that would start a turn is refused with a sentence that
// names the number and the env var, which is the same contract SpendDisabledError
// already has.
//
// THE CACHE IS THE COMPROMISE. `assertSpendAllowed` is synchronous at all 79
// call sites; making it async would touch every one of them. So the month's
// total is held in memory, primed at boot, refreshed on a timer, and incremented
// the instant a call is recorded (before the ledger INSERT resolves). The
// consequence is honest and bounded: concurrent in-flight turns can overshoot by
// roughly one refresh window's worth of spend, and a multi-instance deploy sees
// its own increments immediately but its siblings' only at the next refresh.
// This is a runaway stop, not an accounting control.

/** Ceiling in cents for the calendar month. 0 or unset = the default below. */
const DEFAULT_MONTHLY_CAP_CENTS = 25_000; // $250 — deliberately low; raise it deliberately.

export function monthlyCapCents(): number {
  const raw = process.env.API_MONTHLY_CAP_CENTS;
  if (raw === undefined) return DEFAULT_MONTHLY_CAP_CENTS;
  const v = raw.trim().toLowerCase();
  // An explicit opt-out has to be a WORD, never a number, so that a mistyped
  // "0" reads as "no budget" rather than silently as "no limit".
  if (v === 'none' || v === 'unlimited' || v === 'off') return Infinity;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : DEFAULT_MONTHLY_CAP_CENTS;
}

function monthKey(d: Date = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

const REFRESH_MS = 60_000;
let cache = { month: monthKey(), cents: 0, loadedAt: 0 };
let refreshing: Promise<void> | null = null;

/** Month-to-date estimated spend, in cents, from the in-memory cache. */
export function spentThisMonthCents(): number {
  // A month rollover invalidates the cache rather than waiting for the timer —
  // otherwise the first request of a new month is judged against the old total.
  if (cache.month !== monthKey()) cache = { month: monthKey(), cents: 0, loadedAt: 0 };
  if (Date.now() - cache.loadedAt > REFRESH_MS) void refreshSpendCache();
  return cache.cents;
}

export function ceilingBreached(): boolean {
  const cap = monthlyCapCents();
  return cap !== Infinity && spentThisMonthCents() >= cap;
}

/** Re-read the month's total from the ledger. Safe to call concurrently. */
export async function refreshSpendCache(): Promise<void> {
  if (refreshing) return refreshing;
  // `server/db.ts` calls process.exit(1) at MODULE LOAD when there is no
  // connection string. Since the ceiling check runs inside assertSpendAllowed,
  // importing it unguarded means any script or test that merely asks "is this
  // lane on" kills its own process — silently, because the assert returns first
  // and the exit lands a tick later. Verified: `npm run test:api-lanes` passed
  // its 34 cases and then exited 1. Check the env var, do not catch the exit.
  if (!process.env.DATABASE_URL && !process.env.DATABASE_PUBLIC_URL) {
    cache = { month: monthKey(), cents: 0, loadedAt: Date.now() };
    return;
  }
  refreshing = (async () => {
    try {
      const { sql } = await import('../db.js');
      const [row] = await sql`
        SELECT COALESCE(SUM(cost_cents), 0)::int AS cents
        FROM api_spend_ledger
        WHERE created_at >= date_trunc('month', NOW() AT TIME ZONE 'UTC')
      `;
      cache = { month: monthKey(), cents: Number(row?.cents ?? 0), loadedAt: Date.now() };
    } catch {
      // A ledger read failure must never block a turn — mark the cache fresh so
      // we do not hammer a broken database on every request, and let the next
      // window try again. Failing OPEN here is deliberate: the ceiling is a
      // safety net, and a net that jams shut on a db hiccup takes the app down.
      cache.loadedAt = Date.now();
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

/** Published rates in cents per 1M tokens. Estimates — see migration 124. */
const RATES: Record<string, { in: number; out: number }> = {
  'claude-sonnet-4-6': { in: 300, out: 1500 },
  'claude-haiku-4-5-20251001': { in: 100, out: 500 },
  'claude-opus-4-6': { in: 1500, out: 7500 },
};
const FALLBACK_RATE = { in: 300, out: 1500 }; // price an unknown model as Sonnet, never as free.

export function estimateCostCents(model: string, inputTokens: number, outputTokens: number): number {
  const rate = RATES[model] ?? FALLBACK_RATE;
  return Math.round((inputTokens * rate.in + outputTokens * rate.out) / 1_000_000);
}

/**
 * Record one model call. Fire-and-forget by design — a ledger write must never
 * fail a turn the user has already been charged for, and the in-memory
 * increment happens first so a burst is counted even if the INSERT is slow.
 */
export function recordSpend(input: {
  lane: SpendLane;
  source: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  userId?: number | null;
}): void {
  const inTok = Math.max(0, Math.round(input.inputTokens ?? 0));
  const outTok = Math.max(0, Math.round(input.outputTokens ?? 0));
  const cents = estimateCostCents(input.model, inTok, outTok);

  if (cache.month !== monthKey()) cache = { month: monthKey(), cents: 0, loadedAt: Date.now() };
  cache.cents += cents;

  if (!process.env.DATABASE_URL && !process.env.DATABASE_PUBLIC_URL) return; // see refreshSpendCache
  void (async () => {
    try {
      const { sql } = await import('../db.js');
      await sql`
        INSERT INTO api_spend_ledger (lane, source, model, input_tokens, output_tokens, cost_cents, user_id)
        VALUES (${input.lane}, ${input.source}, ${input.model}, ${inTok}, ${outTok}, ${cents}, ${input.userId ?? null})
      `;
    } catch (err: any) {
      console.error('[api-spend] ledger write failed:', err?.message);
    }
  })();
}

/** One line at boot, so the running posture is in the logs and not inferred. */
export function logSpendLanes(): void {
  const on = enabledLanes();
  const off = SPEND_LANES.filter(l => !on.has(l));
  console.log(
    `[api-spend] model calls ON: ${on.size ? [...on].join(', ') : '(none)'}` +
      `${off.length ? ` · OFF: ${off.join(', ')}` : ''}` +
      ` · API_LANES=${process.env.API_LANES ?? '(unset → default)'}`,
  );
  const bad = unknownLaneNames();
  if (bad.length) {
    console.warn(
      `[api-spend] API_LANES contains ${bad.length} unrecognised name(s): ${bad.join(', ')} — ` +
        `ignored (fails closed). Valid lanes: ${SPEND_LANES.join(', ')}.`,
    );
  }
  // Prime the ceiling cache so the first request of a cold boot is judged
  // against the real month-to-date total rather than against zero.
  const cap = monthlyCapCents();
  void refreshSpendCache().then(() => {
    console.log(
      `[api-spend] monthly ceiling: ${cap === Infinity ? 'NONE (API_MONTHLY_CAP_CENTS=none)' : `$${(cap / 100).toFixed(2)}`}` +
        ` · month-to-date: $${(spentThisMonthCents() / 100).toFixed(2)}`,
    );
  });
}
