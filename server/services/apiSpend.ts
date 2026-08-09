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
 * THE LANES map onto THE SPLIT (see WHERE_THE_WORK_HAPPENS.md), which is why
 * the defaults are what they are:
 *
 *   studio    OFF — research runs, master synthesis, corp-dev documents,
 *                   collateral, deck design, artwork, LinkedIn analysis.
 *                   ALL of this moved to a Cowork session against
 *                   ~/Documents/smbx-studio, and Studio is already out of the
 *                   app chrome (STUDIO_IN_APP = false). Gating it takes away
 *                   nothing a user can currently reach.
 *   sourcing  OFF — the 5-stage sourcing engine and the portfolio refresh /
 *                   expansion jobs. Ported to house/screen.ts +
 *                   scripts/studio/screen.mts on Paul's own instruction
 *                   ("this whole search and rank function needs to be built
 *                   locally so that Cowork can do it"), so it has a local
 *                   equivalent too.
 *   chat      ON  — Yulia, the agentic loop, deliverables, document/field
 *                   extraction, gate summaries, briefings. This IS the app;
 *                   killing it leaves a brick. CLAUDE.md: "The operational
 *                   core is NOT gated beyond team auth."
 *   marketing ON  — the practice intake engine and report Q&A. Both are
 *                   lead-facing and both already fail SOFT, so a kill here
 *                   silently breaks the funnel rather than Paul's work —
 *                   which is the one failure mode CLAUDE.md calls out by name.
 *
 * "Kill all for now" is therefore implemented as: everything that has a Cowork
 * equivalent is off, and the two things that would break the product if they
 * went dark are one env var away from off as well. `API_LANES=none` kills
 * literally everything, including chat — it is deliberately a single word.
 *
 * ONE ENV VAR, THREE BEHAVIOURS:
 *   API_LANES unset          → chat,marketing        (the default posture)
 *   API_LANES=all            → every lane
 *   API_LANES=none  (or "")  → no lane at all
 *   API_LANES=chat,studio    → exactly those, everything else off
 *
 * It is read on every call rather than cached at import, so a Railway variable
 * change takes effect on the next request instead of the next deploy — and so
 * the tests can drive it.
 */

export type SpendLane = 'chat' | 'marketing' | 'studio' | 'sourcing';

export const SPEND_LANES: readonly SpendLane[] = ['chat', 'marketing', 'studio', 'sourcing'] as const;

/** The posture as of 2026-08-09. See the header for why these two and not others. */
export const DEFAULT_LANES: readonly SpendLane[] = ['chat', 'marketing'] as const;

/** What a blocked lane should say, in the practitioner's own vocabulary. */
const LANE_HELP: Record<SpendLane, string> = {
  studio:
    'Studio work happens in a Cowork session against ~/Documents/smbx-studio — research, masters, corp-dev documents and collateral all have local builders that cost nothing.',
  sourcing:
    'Target screening happens locally — `npx tsx scripts/studio/screen.mts` against the market workspace.',
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

/** Throw unless `lane` is on. `what` names the work, e.g. "Research runs". */
export function assertSpendAllowed(lane: SpendLane, what: string): void {
  if (!spendAllowed(lane)) throw new SpendDisabledError(lane, what);
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
}
