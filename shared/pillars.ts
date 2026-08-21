/**
 * THE CONTENT PILLARS — the five things this practice argues on LinkedIn, and
 * the arithmetic that says whether the bet is working.
 *
 * (Paul, 2026-08-21: "here is the updated content pillars i want to track and
 * work against for tracking. I will just come up with the hooks and content
 * etc.. all i want to do is paste in the link to the post and track metrics
 * against each post.")
 *
 * The weights come from a discourse map of LinkedIn M&A in mid-2026. Its
 * finding, and the reason THE CAPTURE is the flagship at 30% rather than the
 * third pillar at 20%: post-close value capture in the middle market is the
 * one room with real demand and almost no supply. Nobody owns MM/LMM
 * integration content — it splits between a software brand not native to the
 * lower middle market, boutiques with no engagement, a people/culture niche,
 * and roll-up strategists who talk deal strategy rather than capture. The
 * "underwritten at IC vs. realized post-close" reconciliation is near-empty.
 * The Settlement and the Market Read are richer veins and already crowded by
 * lawyers, banks and deal-terms vendors. So this register over-indexes on the
 * defensible whitespace rather than the loud room. It is a STRATEGIC bet, not
 * a volume one, and it is meant to be settled by the rollup below rather than
 * by feel.
 *
 * TWO THINGS A LATER SESSION WILL BE TEMPTED TO "CORRECT". Both are decisions,
 * not oversights:
 *
 * 1. THE RANKING TERM INCLUDES REACTIONS, AND THE PLAN OF RECORD SAYS NOT TO.
 *    `content/studio/CAMPAIGN_2026-08-21.md:51` reads "Measurement:
 *    non-follower reach %, profile views from target firms, DMs and meeting
 *    asks, saves. Not likes." Paul was shown that line against this metric set
 *    on 2026-08-21 and chose this one anyway — reactions + comments + reposts
 *    per 1,000 impressions. Do not quietly swap the numerator back to reach.
 *    If it changes, it changes because he says so again.
 *
 * 2. THERE IS NO `profile_views`. LinkedIn attributes profile views to an
 *    ACCOUNT over a rolling window, never to a post — the deleted importer,
 *    checked against Paul's real July workbook, read `impressions`,
 *    `members reached` and `totalEngagements` and no such field exists in the
 *    export. Per-post it would be his own attribution guess wearing the same
 *    clothes as a number LinkedIn wrote, and summing it per pillar would
 *    fabricate a total out of real inputs. The honest form of that signal is
 *    the ENGAGERS list — the people who commented, saved to the CRM by name —
 *    which is what the plan means by "profile views you can put a name to".
 *
 * PURE by house doctrine: no fetch, no db, no env, no clock. The client
 * imports it as `@shared/pillars`; the server imports the same file, so the
 * app and a local session compute identical answers.
 */

export type PillarId =
  | 'the-kill-floor'
  | 'the-settlement'
  | 'the-capture'
  | 'the-consolidation'
  | 'the-standard';

export interface Pillar {
  id: PillarId;
  /** The name as it appears to Paul. */
  name: string;
  /** Share of posts this pillar should carry, once targets are live. Sums to 100. */
  targetPct: number;
  /** One line: what belongs here. */
  scope: string;
  /** The conversations it bundles, from the discourse map. */
  carries: string[];
}

export const PILLARS: readonly Pillar[] = [
  {
    id: 'the-kill-floor',
    name: 'The Kill Floor',
    targetPct: 25,
    scope: 'Diligence, QoE, screening — why deals die, and what to refuse before LOI.',
    carries: [
      'QoE and add-back disputes',
      'pre-LOI screening: what to even pursue',
      'owner dependency and customer concentration',
      'AI as an underwriting question (never as the headline)',
    ],
  },
  {
    id: 'the-settlement',
    name: 'The Settlement',
    targetPct: 25,
    scope: 'Deal structure as risk-pricing — earnouts, escrow, where risk actually migrates.',
    carries: [
      'earnout prevalence and size',
      'escrow and survival periods',
      'the BUY-SIDE read of structure, not seller protection',
      'all-cash share and what replaced it',
    ],
  },
  {
    id: 'the-capture',
    name: 'The Capture',
    targetPct: 30,
    scope: 'Post-close: what the IC model underwrote versus what integration actually captured.',
    carries: [
      'underwritten vs. realized reconciliation',
      'integration capacity as the binding constraint',
      'the first hundred days, honestly',
      'value that was modelled and did not arrive',
    ],
  },
  {
    id: 'the-consolidation',
    name: 'The Consolidation Playbook',
    targetPct: 10,
    scope: 'Roll-up craft in the trades — add-on integration, not sourcing, not sector cheerleading.',
    carries: [
      'add-on integration capacity',
      'HVAC, roofing, plumbing, electrical, MEP consolidation',
      'why platforms stall after the third add-on',
    ],
  },
  {
    id: 'the-standard',
    name: 'The Standard & Function',
    targetPct: 10,
    scope: 'How the practice itself works — operating cadence, evidence rules, the ask.',
    carries: [
      'the evidence rules the practice holds itself to',
      'operating cadence and firm-building',
      'the hand-raiser / the ask',
    ],
  },
];

/**
 * The rooms this practice does not enter, and why. Carried here rather than in
 * prose because the pillar picker is where the temptation appears — a post
 * that would be great engagement and wrong positioning still has to find a
 * pillar, and it should fail to.
 */
export const AVOID: readonly { topic: string; why: string }[] = [
  { topic: 'Fee wars and broker-bashing', why: 'Advisors and brokers are the sourcing channel. Never engage.' },
  { topic: '"Old way vs. new way" disruption framing', why: 'It implicitly bashes advisors — the same relationship, one step removed.' },
  { topic: 'ETA hype, "no money down", silver-tsunami cheerleading', why: 'Wrong stratum, and the "small business" framing miscategorises the practice.' },
  { topic: 'AI as the headline', why: 'AI is an underwriting question inside The Kill Floor. It is never the hook.' },
  { topic: 'Sell-side content', why: 'Buy-side only. Exit planning and "how to sell your business" are off-limits.' },
];

/**
 * TARGETS APPLY WHEREVER PAUL IS ACTUALLY WORKING — WHICH IS NOW THE STANDING
 * QUEUE, NOT A CALENDAR.
 *
 * (Paul, 2026-08-21: "the live plan can go.. i will create every post based on
 * the pillar from scratch — i only want post tracking and i'll give you the URL
 * for it.")
 *
 * The one place targets must NOT apply is a campaign authored before this
 * register existed. The Aug 21 → Sep 19 calendar was written on 2026-08-20
 * against its OWN seven pillars, deliberately running one of them (Dead Deal
 * Economics) at ~60%; scoring it against a register whose largest target is 30%
 * prints five rows that are all correct and all meaningless.
 *
 * So the rule is an EXEMPTION for the retired calendars rather than a
 * permission for new work. `campaign` is the plan file's date stamp (migration
 * 135) and is NULL for the standing queue — which is where a post created from
 * a pillar lands, and where the weights are the whole point.
 *
 * THE EARLIER VERSION OF THIS FUNCTION RETURNED FALSE FOR NULL, on the
 * reasoning that the standing queue is not a planned window. That was right
 * while the calendar was the working surface and became wrong the moment it
 * stopped being one — with the plan retired, every new post carries a NULL
 * stamp, so the old rule would have silently hidden the target column forever
 * and the register would have had no visible effect at all.
 */
export const TARGETS_BEGIN_AFTER = '2026-08-21';

/** A dated calendar stamp — `2026-08-21`. `library-…` stamps are not calendars. */
const DATED_CAMPAIGN = /^\d{4}-\d{2}-\d{2}$/;

export function targetsApply(campaign: string | null | undefined): boolean {
  if (!campaign) return true;                        // the standing queue — where the work is now
  /* A post started from a library hook carries `library-<name>`, which is not a
     planned window and never had its own weights. Tested explicitly rather than
     left to fall through the comparison below, where it only passed because
     'l' sorts after '2' — true today, and true for the wrong reason. */
  if (!DATED_CAMPAIGN.test(campaign)) return true;
  return campaign > TARGETS_BEGIN_AFTER;             // a retired calendar keeps its exemption
}

export function pillarById(id: string | null | undefined): Pillar | undefined {
  return PILLARS.find(p => p.id === id);
}

export function isPillarId(id: unknown): id is PillarId {
  return typeof id === 'string' && PILLARS.some(p => p.id === id);
}

/* ── the arithmetic ───────────────────────────────────────────────────── */

/** One typing-in of what LinkedIn showed, on one day. Never overwritten — see migration 142. */
export interface Reading {
  queueId: string;
  /** The day Paul read the numbers off LinkedIn, YYYY-MM-DD. */
  readOn: string;
  /** Days between the post going up and this reading. Null when posted_at is unknown. */
  daysAfterPost: number | null;
  impressions: number | null;
  membersReached: number | null;
  reactions: number | null;
  comments: number | null;
  reposts: number | null;
}

export interface PostRow {
  queueId: string;
  pillar: PillarId | null;
  /** post_queue.status — only `posted` rows can carry a reading worth counting. */
  status: string;
  campaign: string | null;
}

/**
 * The ranking term, spelled out rather than named.
 *
 * NOT called "engagement rate", deliberately. LinkedIn's own `engagements` is
 * a composite that includes clicks and follows, so a rate built from
 * reactions + comments + reposts is a strict subset of it and would never
 * reconcile with the number on his screen. Printing it as "engagement rate"
 * would be an uncited figure by this practice's own standard. It is
 * reactions + comments + reposts per 1,000 IMPRESSIONS, and every surface
 * that shows it says so in those words.
 *
 * Returns null rather than 0 when there is nothing to divide by — a post with
 * no reading is UNKNOWN, not a zero, and a zero would drag its pillar down
 * while looking like a measurement.
 */
export function per1k(r: Reading | null | undefined): number | null {
  if (!r) return null;
  if (r.impressions == null || r.impressions <= 0) return null;
  const acts = (r.reactions ?? 0) + (r.comments ?? 0) + (r.reposts ?? 0);
  if (r.reactions == null && r.comments == null && r.reposts == null) return null;
  return (acts / r.impressions) * 1000;
}

/** The most recent reading for each post. LinkedIn revises upward for days, so the last one is the fullest. */
export function latestByPost(readings: readonly Reading[]): Map<string, Reading> {
  const out = new Map<string, Reading>();
  for (const r of readings) {
    const prev = out.get(r.queueId);
    if (!prev || r.readOn > prev.readOn) out.set(r.queueId, r);
  }
  return out;
}

function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/**
 * SMALL-N: WHAT THE ROLLUP REFUSES TO SAY.
 *
 * A 30-day window at these weights lands the two 10% pillars on ~3 posts. A
 * median over 3, or a share percentage over 13 rows, is noise with a decimal
 * point on it — and Paul's own benchmark is "~12-15 posts" before the Capture
 * bet is judged. So:
 *
 *   counts        always shown — they are observations
 *   share %       only once the window has MIN_TAGGED_FOR_SHARE posts tagged
 *   median rate   only once a pillar has MIN_READINGS_FOR_RATE readings
 *
 * and there is NO signed "drift" number anywhere. Target and actual sit side
 * by side and the eye does the subtraction; a drift figure invites correcting
 * a plan against sampling noise.
 */
export const MIN_TAGGED_FOR_SHARE = 12;
export const MIN_READINGS_FOR_RATE = 3;

export interface PillarLine {
  id: PillarId;
  name: string;
  targetPct: number;
  /** Posts tagged to this pillar in the window. An observation. */
  posts: number;
  /** Of those, how many are actually posted. */
  posted: number;
  /** Of those posted, how many carry at least one reading. */
  withMetrics: number;
  /** Share of tagged posts. NULL until the window is big enough to mean anything. */
  sharePct: number | null;
  /** Median reactions+comments+reposts per 1,000 impressions. NULL below the floor. */
  medianPer1k: number | null;
  /** The age spread of the readings behind medianPer1k, so comparability is visible. */
  ageDays: { min: number; max: number } | null;
}

export interface Rollup {
  /** False for a window planned before this register existed — see TARGETS_BEGIN_AFTER. */
  showTargets: boolean;
  /** Posts carrying a pillar. */
  tagged: number;
  /** Posts carrying none. Printed, never hidden — a share computed over a partly-tagged window is a lie by omission. */
  untagged: number;
  /** True once `tagged` clears MIN_TAGGED_FOR_SHARE. */
  shareIsMeaningful: boolean;
  lines: PillarLine[];
}

/**
 * Fold a window's posts and readings into the per-pillar picture.
 *
 * REFUSES RATHER THAN DEFAULTS, the same posture `wacc()` takes in
 * house/capital.ts: every number that cannot be honestly computed comes back
 * NULL and the caller must render it as missing. Nothing here ever returns a
 * zero standing in for an absence.
 */
export function pillarRollup(
  posts: readonly PostRow[],
  readings: readonly Reading[],
  opts: { campaign?: string | null } = {},
): Rollup {
  const latest = latestByPost(readings);
  const tagged = posts.filter(p => p.pillar != null).length;
  const untagged = posts.length - tagged;
  const shareIsMeaningful = tagged >= MIN_TAGGED_FOR_SHARE;

  const lines: PillarLine[] = PILLARS.map(pil => {
    const mine = posts.filter(p => p.pillar === pil.id);
    const posted = mine.filter(p => p.status === 'posted');
    const rates: number[] = [];
    const ages: number[] = [];
    for (const p of posted) {
      const r = latest.get(p.queueId);
      const v = per1k(r);
      if (v != null) {
        rates.push(v);
        if (r?.daysAfterPost != null) ages.push(r.daysAfterPost);
      }
    }
    return {
      id: pil.id,
      name: pil.name,
      targetPct: pil.targetPct,
      posts: mine.length,
      posted: posted.length,
      withMetrics: rates.length,
      sharePct: shareIsMeaningful && tagged > 0 ? (mine.length / tagged) * 100 : null,
      medianPer1k: rates.length >= MIN_READINGS_FOR_RATE ? median(rates) : null,
      ageDays: ages.length ? { min: Math.min(...ages), max: Math.max(...ages) } : null,
    };
  });

  return {
    showTargets: targetsApply(opts.campaign),
    tagged,
    untagged,
    shareIsMeaningful,
    lines,
  };
}
