/**
 * THE BUY-SIDE LEAD MODEL — pure, no db, no API.
 *
 * The register (`smbxbuysideregister.csv`) is a list of ACQUIRERS the practice
 * could serve. This file turns it into a ranked pipeline. It lives in `house/`
 * for the same reason `audit.ts` and `screen.ts` do: the app and a local Cowork
 * session must produce the IDENTICAL ranking, so the logic cannot sit behind a
 * Postgres import.
 *
 * ── WHAT THE COLUMNS ARE FOR ─────────────────────────────────────────────
 * All 16 register columns are kept. Nothing is dropped, because the three
 * groups that don't score are the ones that make the score usable:
 *
 *   RANKS (5)   buyer_moment · dfw · trades · key_person(+title) · segment
 *   ROUTES (2)  product_fit (which service to pitch) · sponsor (who owns them)
 *   PROVES (3)  grade · evidence · source_url
 *   IDENTIFIES  firm · website · hq_city · hq_state · notes
 *
 * `notes` is never dropped — it carries the sharpest human judgement in the
 * file ("MOST EXPLICITLY DFW-ACTIVE SPONSOR IN THE SCAN", "WEAKEST ENTRY") and
 * discarding a person's own analysis on import is the `toCsv` lesson again.
 *
 * ── THE ONE SIGNAL THAT DRIVES EVERYTHING ────────────────────────────────
 * `buyer_moment` is the buy signal, and the register's own notes say so:
 * MRE Capital is "BEST-FIT NAME ON THE LIST" because "add-on cadence not yet
 * established, which is exactly the flow gap"; Huron is "STRONG CONVICTION-
 * PRODUCT FIT" because "add-on flow is the binding constraint"; FSP is "a
 * genuine flow-constrained buyer, which is the fit signal". A buyer that has
 * declared a thesis and cannot fill it is what origination sells to. So
 * `thesis_no_flow` carries the largest single weight, and `has_both` — a buyer
 * with thesis AND flow, i.e. one who already has the function in-house — is
 * the hardest sale, not the best lead.
 *
 * ── EVIDENCE QUALITY GATES, IT DOES NOT WEIGHT ───────────────────────────
 * Same lesson `screen.ts` learned the expensive way. `grade` says WHERE the
 * evidence came from (own site / trade press / directory only). A directory-only
 * firm with a perfect profile is a RESEARCH TASK, not a hot lead, so grade
 * applies a visible discount rather than floating a thinly-evidenced row up the
 * list. Scored as a bonus it would do the opposite.
 *
 * ── THE KNOWN LIMIT (read this before trusting a top-of-list score) ──────
 * The model ranks FIT, not whether the buyer is real. No register column
 * records whether a firm has ever closed a deal, so a well-written website with
 * zero completed acquisitions scores like an active buyer — Homestead Service
 * Partners is the live example ("No completed acquisition and no portfolio
 * company named anywhere on the site"). `lastDealOn` exists to close that hole
 * as it gets verified; while it is absent every row takes the same honest
 * neutral-low activity score rather than full marks. Until then the notes are
 * load-bearing and a human reads them.
 */
import { parseCsv } from './screen.js';

/* ── the register row, verbatim ───────────────────────────────────────── */

/** One row of the buy-side register, as the CSV carries it. */
export interface LeadRow {
  firm?: string;
  segment?: string;
  website?: string;
  hq_city?: string;
  hq_state?: string;
  trades?: string;
  dfw?: string;
  grade?: string;
  buyer_moment?: string;
  product_fit?: string;
  key_person?: string;
  key_person_title?: string;
  sponsor?: string;
  evidence?: string;
  source_url?: string;
  notes?: string;
  /** Optional, not in the original register — see "the known limit" above.
   *  ISO date (YYYY-MM-DD) of the most recent acquisition we have EVIDENCE for. */
  last_deal_on?: string;
  /** Set by a human. A strategic that competes with us rather than buys from
   *  us (the register marks APi Group "Not a client; competitive context") is
   *  excluded here, never inferred from prose. */
  disqualified?: string;
  /** A Sheet can carry any extra column and they must survive a round trip.
   *  `number` is admitted so `RankedLead` can intersect a numeric `score` onto
   *  this shape — a `string`-only signature makes that assignment illegal. */
  [k: string]: string | number | undefined;
}

/* ── normalisation ────────────────────────────────────────────────────── */

export type Segment =
  | 'independent_sponsor' | 'family_office' | 'permanent_capital'
  | 'holdco' | 'pe_fund' | 'platform' | 'strategic' | 'unknown';

export type BuyerMoment = 'thesis_no_flow' | 'capital_no_thesis' | 'has_both' | 'unknown';
export type Dfw = 'yes' | 'adjacent' | 'no' | 'unknown';
export type Grade = 'primary' | 'trade' | 'directory' | 'unknown';
export type ProductFit = 'origination' | 'conviction' | 'unknown';

const slug = (s: string | undefined) =>
  (s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

export function normSegment(s: string | undefined): Segment {
  const v = slug(s);
  if (!v) return 'unknown';
  if (v.includes('independent')) return 'independent_sponsor';
  if (v.includes('family')) return 'family_office';
  if (v.includes('permanent')) return 'permanent_capital';
  if (v.includes('holdco') || v.includes('holding')) return 'holdco';
  // "PE fund" — check before the bare "fund" so a family-office fund doesn't
  // fall through to here.
  if (v.includes('pe_fund') || v === 'pe' || v.includes('private_equity')) return 'pe_fund';
  if (v.includes('platform')) return 'platform';
  if (v.includes('strategic')) return 'strategic';
  return 'unknown';
}

export function normMoment(s: string | undefined): BuyerMoment {
  const v = slug(s);
  if (v === 'thesis_no_flow' || v === 'has_both' || v === 'capital_no_thesis') return v;
  return 'unknown';
}

export function normDfw(s: string | undefined): Dfw {
  const v = slug(s);
  if (v === 'yes' || v === 'adjacent' || v === 'no') return v;
  return 'unknown';
}

export function normGrade(s: string | undefined): Grade {
  const v = slug(s);
  if (v === 'primary' || v === 'trade' || v === 'directory') return v;
  return 'unknown';
}

export function normProductFit(s: string | undefined): ProductFit {
  const v = slug(s);
  if (v === 'origination' || v === 'conviction') return v;
  return 'unknown';
}

/** Split a `trades` cell ("HVAC, Plumbing") into comparable tokens. A
 *  parenthetical qualifier is dropped — "Fire & life safety (stated)" is the
 *  same trade as "Fire & life safety", and the qualifier is what `grade` and
 *  `evidence` are for. "(none in scope)" yields nothing, which is correct:
 *  Permanent Equity's trades cell is deliberately empty. */
export function normTrades(s: string | undefined): string[] {
  return (s || '')
    .split(/[,;/]/)
    .map(t => t.replace(/\([^)]*\)/g, '').trim().toLowerCase())
    .filter(t => t && t !== 'none in scope' && t !== 'none')
    .map(t => t.replace(/\s*&\s*/g, ' and ').replace(/\s+/g, ' '));
}

/** True when the row touches any trade we are actually working. Substring in
 *  both directions, so "Fire & life safety" matches a target of "fire and life
 *  safety" and a target of "hvac" matches "HVAC (commercial)". */
export function touchesTrade(rowTrades: string[], targets: string[]): boolean {
  const t = targets.map(x => x.toLowerCase().replace(/\s*&\s*/g, ' and ').trim()).filter(Boolean);
  if (!t.length) return false;
  return rowTrades.some(r => t.some(x => r.includes(x) || x.includes(r)));
}

/* ── the buy box for CLIENTS (not targets) ────────────────────────────── */

/**
 * What we are hunting for in an ACQUIRER. Mirrors `screen.ts`'s `Screen`, one
 * level up the chain: that one describes the company to buy, this one describes
 * the buyer to serve.
 */
export interface LeadBox {
  /** Trades we have a verified master for — the markets we can actually speak to. */
  trades: string[];
  /** Home metro, matched against `dfw`. Present for documentation; the `dfw`
   *  column is already the resolved answer, so nothing here is re-derived. */
  metro?: string;
  /** ISO date the scoring runs "as of" — passed in, never `Date.now()`, so a
   *  score is reproducible and a test can pin it. */
  asOf: string;
}

export interface LeadScore {
  score: number;
  tier: 'A' | 'B' | 'C' | 'D';
  /** Every scale, in words. Printed next to the row so a ranking can be argued
   *  with instead of taken on faith. */
  detail: string;
  /** The service to lead with, straight off `product_fit`. */
  pitch: ProductFit;
}

const NEED: Record<BuyerMoment, number> = {
  // Declared a thesis, cannot fill it. This is the sale.
  thesis_no_flow: 35,
  // Capital looking for a thesis — real work, longer cycle.
  capital_no_thesis: 24,
  // Thesis AND flow: they already have the function. Hardest sale on the list.
  has_both: 10,
  unknown: 8,
};

const DFW_PTS: Record<Dfw, number> = { yes: 15, adjacent: 9, unknown: 3, no: 0 };

/** Does this buyer have an in-house corp-dev bench? The less they have, the
 *  more the practice is worth to them. */
const STRUCTURE: Record<Segment, number> = {
  independent_sponsor: 10, // deal-by-deal, no analyst bench — the core market
  family_office: 10,
  permanent_capital: 8,
  holdco: 7,
  platform: 5,             // usually carries a corp-dev lead
  pe_fund: 3,              // has a team
  strategic: 1,            // large in-house M&A; often a competitor for assets
  unknown: 4,
};

const CONFIDENCE: Record<Grade, { mult: number; why: string }> = {
  primary: { mult: 1.0, why: '' },
  trade: { mult: 0.92, why: '×0.92 trade press, not their own disclosure' },
  directory: { mult: 0.8, why: '×0.80 directory only — verify before acting' },
  unknown: { mult: 0.8, why: '×0.80 evidence source unrecorded' },
};

/** Whole months between two ISO dates, or null if either is unreadable. */
export function monthsBetween(fromIso: string | undefined, toIso: string): number | null {
  const a = Date.parse(`${(fromIso || '').slice(0, 10)}T00:00:00Z`);
  const b = Date.parse(`${toIso.slice(0, 10)}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.floor((b - a) / (1000 * 60 * 60 * 24 * 30.44));
}

/**
 * Rank a register row 0-100.
 *
 *   need 35 · lane 25 · reach 15 · structure 10 · activity 15
 *
 * then × a confidence multiplier from `grade`.
 *
 * A row a human has marked `disqualified` returns 0/D with the reason, the same
 * shape `screen.ts` uses for an already-owned business. It is never inferred
 * from the notes — parsing prose for intent is how a placeholder ends up ranked
 * first.
 */
export function scoreLead(row: LeadRow, box: LeadBox): LeadScore {
  const pitch = normProductFit(row.product_fit);

  if ((row.disqualified || '').trim() && slug(row.disqualified) !== 'no' && slug(row.disqualified) !== 'false') {
    return { score: 0, tier: 'D', detail: `disqualified — ${row.disqualified}`, pitch };
  }

  const parts: string[] = [];

  // Need (0-35) — the buy signal.
  const moment = normMoment(row.buyer_moment);
  const need = NEED[moment];
  parts.push(`need ${need} (${moment})`);

  // Lane (0-25) — geography we work × a trade we can actually speak to.
  const dfw = normDfw(row.dfw);
  const dfwPts = DFW_PTS[dfw];
  const rowTrades = normTrades(row.trades);
  // No configured trades means we cannot claim relevance either way, so the
  // scale sits mid rather than scoring every row zero.
  const tradePts = box.trades.length ? (touchesTrade(rowTrades, box.trades) ? 10 : 0) : 6;
  const lane = dfwPts + tradePts;
  parts.push(`lane ${lane} (dfw ${dfw}${box.trades.length ? `, trade ${tradePts ? 'match' : 'miss'}` : ', trades unset'})`);

  // Reach (0-15) — can a conversation start today?
  let reach = 0;
  if ((row.key_person || '').trim()) reach += 8;
  if ((row.key_person_title || '').trim()) reach += 2;
  if ((row.website || '').trim()) reach += 5;
  reach = Math.min(15, reach);
  parts.push(`reach ${reach}${(row.key_person || '').trim() ? '' : ' (no named contact)'}`);

  // Structure (0-10) — how much corp-dev bench they already have.
  const seg = normSegment(row.segment);
  const structure = STRUCTURE[seg];
  parts.push(`structure ${structure} (${seg})`);

  // Activity (0-15) — evidence of a live acquisition cadence. ABSENT IS NOT
  // ZERO and not full marks: every row takes the same neutral-low figure, so a
  // missing column shifts no row relative to another, and the label says so.
  const months = monthsBetween(row.last_deal_on, box.asOf);
  let activity: number;
  if (months == null) {
    activity = 5;
    parts.push('activity 5 (no dated deal evidence)');
  } else if (months < 0) {
    // A future date is bad data, not a hot lead.
    activity = 5;
    parts.push(`activity 5 (last_deal_on is in the future — check it)`);
  } else {
    activity = months <= 6 ? 15 : months <= 12 ? 12 : months <= 24 ? 8 : 3;
    parts.push(`activity ${activity} (${months}mo since last evidenced deal)`);
  }

  const raw = need + lane + reach + structure + activity;
  const conf = CONFIDENCE[normGrade(row.grade)];
  const total = Math.round(raw * conf.mult);
  if (conf.why) parts.push(conf.why);

  return {
    score: total,
    tier: total >= 75 ? 'A' : total >= 55 ? 'B' : total >= 35 ? 'C' : 'D',
    detail: parts.join(' · '),
    pitch,
  };
}

/* ── ranking a whole register ─────────────────────────────────────────── */

/** An intersection rather than an `interface … extends`: `LeadRow` carries a
 *  `string | undefined` index signature (a Sheet can add any column), and a
 *  declared numeric `score` would collide with it. */
export type RankedLead = LeadRow & {
  score: number;
  tier: 'A' | 'B' | 'C' | 'D';
  score_detail: string;
  pitch: ProductFit;
};

/** Score every row and sort best-first. Ties break on firm name so the order is
 *  stable across runs — a list that reshuffles on every re-rank cannot be
 *  worked through from the top. */
export function rankLeads(rows: LeadRow[], box: LeadBox): RankedLead[] {
  return rows
    .map(r => {
      const s = scoreLead(r, box);
      return { ...r, score: s.score, tier: s.tier, score_detail: s.detail, pitch: s.pitch };
    })
    .sort((a, b) => b.score - a.score || (a.firm || '').localeCompare(b.firm || ''));
}

/** Parse a register CSV. Reuses `screen.ts`'s RFC4180-ish reader — one CSV
 *  parser in the house, and this file's rows come out of the same Sheet. */
export function parseLeadCsv(text: string): LeadRow[] {
  return (parseCsv(text) as LeadRow[]).filter(r => (r.firm || '').trim() !== '');
}

/** Column order for an export, leading with the ranking so a Sheet opens on
 *  the answer. Extra columns a human added in the Sheet are preserved by
 *  `screen.ts`'s `toCsv`, which this list feeds. */
export const LEAD_COLUMNS = [
  'score', 'tier', 'pitch', 'firm', 'segment', 'buyer_moment', 'dfw', 'trades',
  'key_person', 'key_person_title', 'website', 'hq_city', 'hq_state', 'sponsor',
  'grade', 'last_deal_on', 'disqualified', 'evidence', 'source_url', 'notes',
  'score_detail',
];

/* ── the picture ──────────────────────────────────────────────────────── */

export interface LeadPicture {
  total: number;
  byTier: Record<string, number>;
  bySegment: Record<string, number>;
  byMoment: Record<string, number>;
  byPitch: Record<string, number>;
  /** Rows with no named contact — each one is a research task before outreach. */
  needContact: number;
  /** Rows whose only evidence is a directory listing. */
  directoryOnly: number;
  /** In the home metro (`dfw: yes`). */
  inMetro: number;
}

const tally = (xs: string[]) =>
  xs.reduce<Record<string, number>>((o, k) => ((o[k] = (o[k] || 0) + 1), o), {});

/** Counts only — every number here is derived from the rows in front of it, so
 *  the summary can never claim something the register does not say. */
export function picture(ranked: RankedLead[]): LeadPicture {
  return {
    total: ranked.length,
    byTier: tally(ranked.map(r => r.tier)),
    bySegment: tally(ranked.map(r => normSegment(r.segment))),
    byMoment: tally(ranked.map(r => normMoment(r.buyer_moment))),
    byPitch: tally(ranked.map(r => r.pitch)),
    needContact: ranked.filter(r => !(r.key_person || '').trim()).length,
    directoryOnly: ranked.filter(r => normGrade(r.grade) === 'directory').length,
    inMetro: ranked.filter(r => normDfw(r.dfw) === 'yes').length,
  };
}
