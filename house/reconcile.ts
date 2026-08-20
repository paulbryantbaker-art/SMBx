/**
 * Register reconcile — the pure half of `scripts/studio/reconcile.mts`.
 *
 * RECONCILE_SPEC.md (repo root, 2026-08-18) is the contract; the 2026-08-18
 * hand run (`studio/clients/reconcile/2026-08-18/RECONCILE_LOG.md`) is the
 * precedent this implements mechanically. Candidate rows + the existing
 * register in → merged register, a review queue, and a log of what it did out.
 *
 * Pure: no fs, no network, no DB, no model. The CLI does the fs, nothing else —
 * same shape as house/audit.ts + audit.mts, house/screen.ts + screen.mts. The
 * matcher itself is IMPORTED from house/screen.ts (`norm`, `wordMatch`,
 * `normDomain`), never copied: two entity-matchers that disagree is how a
 * coverage number starts depending on which reader you asked.
 *
 * THE LOAD-BEARING RULE (spec §5.1, proven by the hand run's three false
 * positives): a parenthetical is not one thing. A ticker strips; a rebrand
 * ("now Cherry Bekaert") is a LIVE alias — the current name; a mid-string
 * expansion is a live alias; a REDACTION ("name undisclosed") can never match;
 * and a trailing sponsor/parent parenthetical is DATA, never a matching alias —
 * treating "(Altas Partners)" as an alias is exactly how a sponsor merged into
 * the platform it owns, three times, on 2026-08-18.
 *
 * THE VERIFICATION BOUNDARY (COLUMNS.md row-universe law): the register is
 * VERIFIED-only (blank tolerated on the 75 legacy rows). A register row
 * carrying any other verification value is a REFUSAL, and a candidate row that
 * is not VERIFIED is computed but HELD — it stays in the funnel, named in the
 * log, and never touches the register. Promotion is the verification act.
 *
 * No pass on silence (studio/CLAUDE.md): the arithmetic must close
 * (in == matched + new + ambiguous + unmatchable) or the run refuses and
 * writes nothing; every held, skipped, defaulted or unmatchable row is named.
 */

import { norm, normDomain, wordMatch } from './screen.js';

/* ── rows and columns ────────────────────────────────────────────────── */

export type Row = Record<string, string | undefined>;

/** The register header as merged 2026-08-18 (COLUMNS.md). Used to RECOGNIZE
 *  candidate headers — the register's own column order always comes from the
 *  file itself, never from this list. */
export const REGISTER_COLUMNS = [
  'org_id', 'firm', 'firm_type', 'segment', 'bucket', 'tier', 'city', 'state', 'website',
  'aum_or_fund_size', 'check_size', 'ebitda_range', 'vertical_fit', 'internal_corpdev',
  'buyside_signal', 'signal_date', 'contact_count', 'contact_ids', 'confidence',
  'source_url', 'notes', 'account_type', 'sponsor_parent', 'verticals_active',
  'states_active', 'platform_count', 'texas_exposure', 'trigger_type', 'trigger_date',
  'verification', 'last_checked',
];

/** Funnel headers → register columns. The funnel (`clients/candidates.csv`)
 *  speaks the research master's dialect; the register speaks the bundle's. */
export const CANDIDATE_HEADER_ALIASES: Record<string, string> = {
  account_name: 'firm',
  hq_city: 'city',
  hq_state: 'state',
  website_domain: 'website',
  fund_or_aum: 'aum_or_fund_size',
  primary_source_url: 'source_url',
};

/** Funnel bookkeeping — recognized, deliberately NOT merged into the register.
 *  `source_key` feeds the provenance tag, `register_match` feeds T0; contacts
 *  are v1 scope (logged every run), the rest is funnel state. */
export const BOOKKEEPING_COLUMNS = [
  'source_key', 'register_match', 'stage', 'held_reason', 'promoted_on',
  'trigger_source_url', 'contact_name', 'contact_title', 'aliases',
];

/** Fact columns (spec §6 + the ten 2026-08-18 additions): new non-empty wins,
 *  a blank never erases. */
export const FACT_COLUMNS = [
  'firm_type', 'segment', 'bucket', 'city', 'state', 'website',
  'aum_or_fund_size', 'check_size', 'ebitda_range', 'vertical_fit', 'internal_corpdev',
  'buyside_signal', 'signal_date', 'confidence',
  'account_type', 'sponsor_parent', 'verticals_active', 'states_active',
  'platform_count', 'texas_exposure', 'trigger_type', 'trigger_date',
  'verification', 'last_checked',
];

/** Identity fields (spec §6): filled only where empty; both non-empty and
 *  different → the row merges but the field is HELD as a CONFLICT. `bucket`
 *  joins them deliberately, beyond the spec's list: silently flipping
 *  ECOSYSTEM_DO_NOT_PITCH to CLIENT is how a do-not-pitch firm gets pitched
 *  (CLAUDE.md names mis-bucketing as the expensive error), so a bucket
 *  disagreement is adjudicated, never refreshed. */
export const HELD_COLUMNS = ['firm', 'website', 'city', 'state', 'bucket'];

/* ── name keys: classify the parenthetical, never blind-strip it ─────── */

export type ParenMeaning = 'ticker' | 'rebrand' | 'redaction' | 'expansion' | 'sponsor-or-parent';
export interface Paren { text: string; meaning: ParenMeaning }

export interface NameKey {
  raw: string;
  /** Primary match key: parentheticals classified out, slash-primary, legal
   *  suffixes stripped, `norm`ed. Empty when redacted or nameless. */
  key: string;
  /** LIVE alias keys — slash parts, rebrand content, expansion variants, the
   *  `aliases` column, the alias map. Sponsor/parent parentheticals are NOT
   *  here, by design. */
  aliasKeys: string[];
  /** aliasKey → the display text it came from (for logs and proposals). */
  aliasSrc: Record<string, string>;
  /** aliasKey → where it came from. 'inline' (the expansion's whole-name
   *  variant) and 'extra' (the aliases column / map) are matching fuel only —
   *  never re-proposed. */
  aliasOrigin: Record<string, 'slash' | 'rebrand' | 'expansion' | 'inline' | 'extra'>;
  parens: Paren[];
  redacted: boolean;
}

const TICKER_RE = /^(nyse|nasdaq|amex|otcmkts|otc)[:\s]/i;
const REDACT_RE = /undisclosed|not\s+disclosed|redacted|confidential/i;
const REBRAND_RE = /^now\s+(.+)$/i;
/** Slash forms are two aliases for one entity (spec §5.1). */
const SPLIT_RE = /\s+\/\s+|\s+\|\s+|\s+d\/b\/a\s+|\s+dba\s+/i;
/** Trailing legal suffixes strip iteratively. `Holdings`, `Group`, `Partners`,
 *  `Capital`, `Management` do NOT strip — they distinguish real firms. */
const LEGAL_SUFFIX_RE = /[\s,]+(l\.l\.c\.?|llc|l\.l\.p\.?|llp|l\.p\.?|lp|inc\.?|corp(?:oration)?\.?|co\.?|ltd\.?|plc)\s*$/i;

export function stripLegal(s: string): string {
  let t = s.trim();
  for (;;) {
    const n = t.replace(LEGAL_SUFFIX_RE, '');
    if (n === t) return t;
    t = n;
  }
}

/** One name → one comparable key. The single fold every tier uses. */
export const nameKeyOf = (s: string): string => norm(stripLegal(s));

export function nameKey(raw: string, extraAliases: string[] = []): NameKey {
  const parens: Paren[] = [];
  type Origin = 'slash' | 'rebrand' | 'expansion' | 'inline' | 'extra';
  const aliasTexts: Array<[string, Origin]> = [];
  let redacted = false;

  const spans: Array<{ end: number; content: string }> = [];
  const re = /\(([^)]*)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) spans.push({ end: m.index + m[0].length, content: m[1].trim() });

  for (const s of spans) {
    const c = s.content;
    if (TICKER_RE.test(c)) { parens.push({ text: c, meaning: 'ticker' }); continue; }
    if (REDACT_RE.test(c)) { parens.push({ text: c, meaning: 'redaction' }); redacted = true; continue; }
    const rb = REBRAND_RE.exec(c);
    if (rb) {
      // "now …" means the parenthetical is the CURRENT name — a candidate
      // saying that name must MATCH this row, not create a new one.
      parens.push({ text: c, meaning: 'rebrand' });
      aliasTexts.push([rb[1], 'rebrand']);
      continue;
    }
    // Mid-string (text follows the closing paren) = expansion, a live alias.
    // Trailing = sponsor or parent — indistinguishable mechanically, so it is
    // DATA and a proposal, never a matching alias (the 2026-08-18 false
    // positives were exactly this treated as an alias).
    const after = raw.slice(s.end).replace(/\([^)]*\)/g, '').trim();
    if (after) {
      parens.push({ text: c, meaning: 'expansion' });
      aliasTexts.push([c, 'expansion']);
      aliasTexts.push([raw.replace(/[()]/g, ' '), 'inline']);  // whole-name variant
    } else {
      parens.push({ text: c, meaning: 'sponsor-or-parent' });
    }
  }
  if (!redacted && REDACT_RE.test(raw)) redacted = true;

  const base = raw.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  const parts = base.split(SPLIT_RE).map(s => s.trim()).filter(Boolean);
  const primary = parts[0] || '';
  for (const p of parts.slice(1)) aliasTexts.push([p, 'slash']);
  for (const a of extraAliases) aliasTexts.push([a, 'extra']);

  const key = redacted ? '' : nameKeyOf(primary);
  const aliasKeys: string[] = [];
  const aliasSrc: Record<string, string> = {};
  const aliasOrigin: NameKey['aliasOrigin'] = {};
  if (!redacted) {
    for (const [t, origin] of aliasTexts) {
      const k = nameKeyOf(t || '');
      if (k && k.length >= 3 && k !== key && !aliasKeys.includes(k)) {
        aliasKeys.push(k);
        aliasSrc[k] = (t || '').trim();
        aliasOrigin[k] = origin;
      }
    }
  }
  return { raw, key, aliasKeys, aliasSrc, aliasOrigin, parens, redacted };
}

/* ── the alias map: explicit identity knowledge, adjudicated once ────── */

/** "Reedy Industries" vs "PremiStar" is one company that changed its name.
 *  The map records that fact once (`alias,canonical` rows in
 *  `clients/reconcile/aliases.csv`); after that neither run can mint two
 *  entities for it. Both sides are folded to keys and joined symmetrically. */
export type AliasPair = [string, string];

function expandWithMap(keys: Set<string>, pairs: AliasPair[]): void {
  let grew = true;
  while (grew) {
    grew = false;
    for (const [a, b] of pairs) {
      const ka = nameKeyOf(a), kb = nameKeyOf(b);
      if (!ka || !kb) continue;
      if (keys.has(ka) && !keys.has(kb)) { keys.add(kb); grew = true; }
      if (keys.has(kb) && !keys.has(ka)) { keys.add(ka); grew = true; }
    }
  }
}

/* ── small tools ─────────────────────────────────────────────────────── */

export function levenshtein(a: string, b: string, cap = Infinity): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > cap) return cap + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** Incoming 1/2/3 maps 1→A · 2→B · 3→C on NEW rows (2026-08-18 decision).
 *  On a matched row the existing value wins, unchanged — that is the app's
 *  after a re-score. */
export function mapTier(v: string): { tier: string; note?: string } {
  const t = (v || '').trim().toUpperCase();
  if (!t) return { tier: '' };
  if (t === '1') return { tier: 'A' };
  if (t === '2') return { tier: 'B' };
  if (t === '3') return { tier: 'C' };
  if (t === 'A' || t === 'B' || t === 'C') return { tier: t };
  return { tier: '', note: `tier "${v}" is neither 1/2/3 nor A/B/C — left blank` };
}

/** Next free ORG-NNN, zero-padded to 3, continuing the existing sequence.
 *  max+1, never a gap-fill: a retired id must never be reused. */
export function nextOrgId(rows: Row[]): string {
  let max = 0;
  for (const r of rows) {
    const m = /^ORG-(\d+)$/.exec((r.org_id || '').trim());
    if (m) max = Math.max(max, Number(m[1]));
  }
  return 'ORG-' + String(max + 1).padStart(3, '0');
}

/** Serialize with EVERY field quoted — the register's and the funnel's own
 *  style. The merge is a diff Paul reads before it lands; a serializer that
 *  re-quotes the whole file buries the three changed cells in 150 changed
 *  lines. `eol` separates RECORDS only (the live register is CRLF between
 *  rows with bare LF inside multi-line notes cells — measured, not assumed);
 *  in-cell newlines are cell content and stay exactly as given. */
export function toQuotedCsv(cols: string[], rows: Row[], eol = '\n'): string {
  const q = (v: string | undefined) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const out = [cols.map(q).join(',')];
  for (const r of rows) out.push(cols.map(c => q(r[c])).join(','));
  return out.join(eol) + eol;
}

/* ── the review queue (spec §7) ──────────────────────────────────────── */

export const QUEUE_COLUMNS = [
  'queue_id', 'kind', 'reason', 'candidate_firm', 'candidate_domain', 'candidate_row_json',
  'register_org_id', 'register_firm', 'register_domain', 'match_tier', 'confidence_note',
  'decision', 'decided_by', 'decided_on',
];

export type QueueKind = 'AMBIGUOUS' | 'CONFLICT' | 'UNMATCHABLE' | 'ALIAS_PROPOSAL';
export type QueueRow = Record<string, string>;

/** decision is a fixed vocabulary — anything else is a refusal, by name. */
export const DECISION_RE = /^(merge:ORG-\d+|new|skip|disqualify|alias:.+)$/;

/* ── matching: the ladder (spec §5.2) ────────────────────────────────── */

export type Verdict = 'MATCHED' | 'NEW' | 'AMBIGUOUS' | 'UNMATCHABLE';

interface RegEntry {
  i: number;
  orgId: string;
  firm: string;
  key: string;
  aliasKeys: Set<string>;
  aliasSrc: Record<string, string>;
  domain: string;
  redacted: boolean;
  parens: Paren[];
}

function regEntry(row: Row, i: number, aliasPairs: AliasPair[]): RegEntry {
  const extra = (row.aliases || '').split('|').map(s => s.trim()).filter(Boolean);
  const nk = nameKey(row.firm || '', extra);
  const all = new Set<string>([nk.key, ...nk.aliasKeys].filter(Boolean));
  expandWithMap(all, aliasPairs);
  all.delete(nk.key);
  return {
    i, orgId: (row.org_id || '').trim(), firm: (row.firm || '').trim(),
    key: nk.key, aliasKeys: all, aliasSrc: nk.aliasSrc,
    domain: row.website ? normDomain(row.website) : '',
    redacted: nk.redacted, parens: nk.parens,
  };
}

export interface MatchOutcome {
  verdict: Verdict;
  tier: string;           // which tier fired — recorded on the row (spec §5.2)
  targets: number[];      // register row indexes
  reason: string;
  note: string;
}

function matchOne(
  cand: { nk: NameKey; domain: string; orgRef: string },
  entries: RegEntry[],
  aliasPairs: AliasPair[],
): MatchOutcome {
  // Redactions can never match, never auto-merge (spec §5.1).
  if (cand.nk.redacted) {
    return { verdict: 'UNMATCHABLE', tier: '', targets: [], reason: 'redaction', note: `"${cand.nk.raw}" is a redaction — not a name; can never match` };
  }
  const live = entries.filter(e => !e.redacted);

  // T0 — an explicit id (candidate org_id or the funnel's register_match).
  if (cand.orgRef) {
    const hits = entries.filter(e => e.orgId === cand.orgRef);
    if (hits.length === 1) {
      return { verdict: 'MATCHED', tier: 'source_key', targets: [hits[0].i], reason: '', note: `explicit id ${cand.orgRef}` };
    }
    return { verdict: 'AMBIGUOUS', tier: 'source_key', targets: [], reason: 'register-match-dangling', note: `register_match/org_id "${cand.orgRef}" names no register row` };
  }

  const candKeys = new Set<string>([cand.nk.key, ...cand.nk.aliasKeys].filter(Boolean));
  expandWithMap(candKeys, aliasPairs);
  const candAliases = new Set(candKeys); candAliases.delete(cand.nk.key);

  const dHits = cand.domain ? live.filter(e => e.domain && e.domain === cand.domain) : [];
  const kHits = cand.nk.key ? live.filter(e => e.key && e.key === cand.nk.key) : [];

  // T1 — domain equal AND stripped names equal.
  const t1 = dHits.filter(e => kHits.includes(e));
  if (t1.length === 1) return { verdict: 'MATCHED', tier: 'domain+name', targets: [t1[0].i], reason: '', note: `domain ${cand.domain} + name key both equal` };
  if (t1.length > 1) return { verdict: 'AMBIGUOUS', tier: 'domain+name', targets: t1.map(e => e.i), reason: 'multiple-rows', note: `domain+name equal on ${t1.length} register rows` };

  // T2 — domain equal, names differ: possible rebrand, the case the whole
  // system exists to catch.
  const t2 = dHits.filter(e => !kHits.includes(e));
  if (t2.length) return { verdict: 'AMBIGUOUS', tier: 'possible-rebrand', targets: t2.map(e => e.i), reason: 'possible-rebrand', note: `domain ${cand.domain} equal, name differs — never auto-merged` };

  // T3 — names equal, both domains present and differing.
  const t3 = kHits.filter(e => e.domain && cand.domain && e.domain !== cand.domain);
  if (t3.length) return { verdict: 'AMBIGUOUS', tier: 'same-name-two-domains', targets: t3.map(e => e.i), reason: 'same-name-two-domains', note: `name key equal but domains differ (${cand.domain} vs ${t3.map(e => e.domain).join(', ')})` };

  // T4 — names equal, one or both domains absent. Auto-merges DELIBERATELY:
  // 68% of the register carries no domain; refusing this tier would send every
  // row to review and get the tool switched off. Counted separately, not hidden.
  const t4 = kHits.filter(e => !(e.domain && cand.domain));
  if (t4.length === 1) {
    const side = t4[0].domain ? 'the candidate side' : cand.domain ? 'the register side' : 'both sides';
    return { verdict: 'MATCHED', tier: 'name-only', targets: [t4[0].i], reason: '', note: `name key "${cand.nk.key}" equal; domain absent on ${side}` };
  }
  if (t4.length > 1) return { verdict: 'AMBIGUOUS', tier: 'name-only', targets: t4.map(e => e.i), reason: 'multiple-rows', note: `name key equal on ${t4.length} register rows` };

  // T5 — any alias equals any alias (live aliases only: slash parts, rebrand,
  // expansion, aliases column, alias map — NEVER a sponsor parenthetical).
  const t5 = live.filter(e => {
    if (cand.nk.key && e.aliasKeys.has(cand.nk.key)) return true;
    for (const a of candAliases) if (a === e.key || e.aliasKeys.has(a)) return true;
    return false;
  });
  if (t5.length === 1) {
    const e = t5[0];
    const via = cand.nk.key && e.aliasKeys.has(cand.nk.key) ? `register alias ${JSON.stringify(e.aliasSrc[cand.nk.key] || cand.nk.key)}`
      : `candidate alias matching ${JSON.stringify(e.firm)}`;
    return { verdict: 'MATCHED', tier: 'alias', targets: [e.i], reason: '', note: `via ${via}` };
  }
  if (t5.length > 1) return { verdict: 'AMBIGUOUS', tier: 'alias', targets: t5.map(e => e.i), reason: 'multiple-rows', note: `alias hits on ${t5.length} register rows` };

  // T6 — word-boundary containment either direction, needle ≥ 5 chars
  // (screen.ts's short-token rule carried over). Can only ever send a row TO
  // review, never merge it.
  if (cand.nk.key) {
    const t6 = live.filter(e => e.key && e.key !== cand.nk.key && (
      (cand.nk.key.length >= 5 && wordMatch(e.key, cand.nk.key)) ||
      (e.key.length >= 5 && wordMatch(cand.nk.key, e.key))
    ));
    if (t6.length) return { verdict: 'AMBIGUOUS', tier: 'token-containment', targets: t6.map(e => e.i), reason: 'token-containment', note: `"${cand.nk.key}" ⊂/⊃ ${t6.map(e => `"${e.key}"`).join(', ')}` };

    // T7 — edit distance ≤ 2 on the stripped key. NEW → review only; never
    // review → merged (stated as an invariant in the tests).
    if (cand.nk.key.length >= 5) {
      const t7 = live.filter(e => e.key.length >= 5 && e.key !== cand.nk.key && levenshtein(cand.nk.key, e.key, 2) <= 2);
      if (t7.length) return { verdict: 'AMBIGUOUS', tier: 'near-miss', targets: t7.map(e => e.i), reason: 'near-miss', note: `edit distance ≤ 2 from ${t7.map(e => `"${e.key}"`).join(', ')}` };
    }
  }

  // T8 — nothing. A key too short to have used the fuzzy tiers is NAMED, not
  // silently admitted as NEW: "ARS" and "One" collide with ordinary words.
  if (!cand.nk.key) return { verdict: 'UNMATCHABLE', tier: '', targets: [], reason: 'no-name', note: 'no firm name after stripping' };
  if (cand.nk.key.length < 5) return { verdict: 'UNMATCHABLE', tier: '', targets: [], reason: 'short-key', note: `key "${cand.nk.key}" is under 5 characters — exact tiers only, and none matched; adjudicate by hand` };
  return { verdict: 'NEW', tier: '', targets: [], reason: '', note: '' };
}

/* ── merge policy (spec §6) — must not fight the loader ──────────────── */

export interface MergeOutcome {
  changed: string[];
  conflicts: Array<{ field: string; existing: string; incoming: string }>;
  tierKept: boolean;
}

function appendNote(target: Row, line: string): boolean {
  const cur = target.notes || '';
  const t = line.trim();
  if (!t) return false;
  if (cur.split('\n').some(l => l.trim() === t)) return false;  // idempotent — a re-run must not stutter
  target.notes = cur ? cur + '\n' + t : t;
  return true;
}

/** Append a provenance-tagged note, deduped on SOURCE + CONTENT rather than
 *  the whole line: the tag carries the run date, so an exact-line check lets a
 *  later-day re-run of the same file re-append the same text wearing a fresh
 *  stamp (caught driving the sandbox, 2026-08-19). Same label/record/text on
 *  any date is the same note. */
function appendTaggedNote(target: Row, tag: string, text: string): boolean {
  const body = (/^\[\d{4}-\d{2}-\d{2}(?: (.*))?\]$/.exec(tag) || [])[1] || '';
  const dup = (target.notes || '').split('\n').some(l => {
    const m = /^\[\d{4}-\d{2}-\d{2}(?: (.*?))?\]\s*(.*)$/.exec(l.trim());
    return !!m && (m[1] || '') === body && (m[2] || '') === text;
  });
  if (dup) return false;
  return appendNote(target, `${tag} ${text}`);
}

/** Merge a canonical candidate row into a register row, in place.
 *
 *  `adoptHeld` is the difference between the two callers: propose() runs with
 *  it OFF (identity disagreements are HELD as CONFLICT queue rows), and
 *  applyDecisions() runs an explicit human `merge:` with it ON — that decision
 *  IS the adjudication, so the held fields adopt the candidate's values.
 *  `firm` never adopts either way: the app's crm_accounts row is keyed
 *  `lower(firm)` (COLUMNS.md), so a rename via merge would strand its human
 *  state — record an `alias:` and change the string deliberately, by hand. */
export function mergeRow(target: Row, cand: Row, tag: string, runDate: string, adoptHeld = false): MergeOutcome {
  const changed: string[] = [];
  const conflicts: MergeOutcome['conflicts'] = [];
  const set = (col: string, v: string) => {
    if ((target[col] || '') !== v) { target[col] = v; changed.push(col); }
  };

  // Identity fields (+ bucket): fill-if-empty; a real disagreement is HELD.
  for (const col of HELD_COLUMNS) {
    const inc = (cand[col] || '').trim();
    if (!inc) continue;                                   // a blank never erases
    const cur = (target[col] || '').trim();
    if (!cur) { set(col, inc); continue; }
    const same =
      col === 'website' ? normDomain(cur) === normDomain(inc) :
      col === 'firm' ? nameKey(cur).key === nameKey(inc).key :
      cur.toLowerCase() === inc.toLowerCase();
    if (!same) {
      if (adoptHeld && col !== 'firm') set(col, inc);
      else conflicts.push({ field: col, existing: cur, incoming: inc });
    }
    // Otherwise the existing value survives: decoration differences
    // ("(NASDAQ: CSWC)") are data, and real conflicts wait for the queue.
  }

  // Fact columns: new non-empty wins; new empty keeps existing.
  for (const col of FACT_COLUMNS) {
    if (HELD_COLUMNS.includes(col)) continue;
    const inc = (cand[col] || '').trim();
    if (!inc) continue;
    if ((target[col] || '').trim() === inc) continue;
    set(col, inc);
  }

  // org_id: existing wins, ALWAYS — it is the key parseTargets resolves
  // against; moving it silently re-points every targeting expression.
  // (Nothing to do: we simply never read cand.org_id here.)

  // tier: existing wins — it is the app's after a re-score. Empty fills from
  // the candidate's scale, mapped 1→A · 2→B · 3→C.
  let tierKept = false;
  const incTier = mapTier(cand.tier || '').tier;
  if (incTier) {
    const cur = (target.tier || '').trim();
    if (!cur) set('tier', incTier);
    else if (cur !== incTier) tierKept = true;
  }

  // source_url: new wins; the old one is preserved as a dated notes line —
  // a changed source_url is evidence something moved.
  const incSrc = (cand.source_url || '').trim();
  if (incSrc) {
    const cur = (target.source_url || '').trim();
    if (!cur) set('source_url', incSrc);
    else if (cur !== incSrc) {
      appendNote(target, `prior source_url (${runDate}): ${cur}`);
      set('source_url', incSrc);
    }
  }

  // notes: APPEND, never replace — notes carry the sharpest judgement in the
  // file and replacing them destroys analyst work that exists nowhere else.
  const incNotes = (cand.notes || '').trim();
  if (incNotes && appendTaggedNote(target, tag, incNotes)) changed.push('notes');

  return { changed, conflicts, tierKept };
}

/** Build a register row for a NEW candidate (the ORG-088/ORG-140 shape). */
export function buildNewRow(
  cand: Row, registerCols: string[], orgId: string, tag: string,
): { row: Row; bucketDefaulted: boolean; tierNote?: string } {
  const row: Row = {};
  for (const c of registerCols) row[c] = '';
  row.org_id = orgId;
  row.firm = (cand.firm || '').trim();          // decorations kept — they are data
  for (const col of FACT_COLUMNS) {
    const v = (cand[col] || '').trim();
    if (v && registerCols.includes(col)) row[col] = v;
  }
  const t = mapTier(cand.tier || '');
  row.tier = t.tier;
  const src = (cand.source_url || '').trim();
  if (src) row.source_url = src;
  // The signal pair mirrors the trigger pair on new rows (the 2026-08-18
  // apply's shape); a NONE/absent trigger leaves the signal blank (ORG-140).
  const tt = (cand.trigger_type || '').trim();
  if (tt && tt.toUpperCase() !== 'NONE') {
    if (registerCols.includes('buyside_signal') && !row.buyside_signal) row.buyside_signal = tt;
    if (registerCols.includes('signal_date') && !row.signal_date) row.signal_date = (cand.trigger_date || '').trim();
  }
  if (registerCols.includes('contact_count') && !row.contact_count) row.contact_count = '0';
  // bucket: a blank bucket imports app-side as `acquirer` (COLUMNS.md), so a
  // blank is the one gap that is NOT safer than a default. The funnel is the
  // CLIENT funnel — default CLIENT, and NAME every defaulted row in the log.
  let bucketDefaulted = false;
  if (!row.bucket) { row.bucket = 'CLIENT'; bucketDefaulted = true; }
  const notes = (cand.notes || '').trim();
  row.notes = notes ? `${tag} ${notes}` : tag;
  return { row, bucketDefaulted, tierNote: t.note };
}

/* ── candidate header mapping ────────────────────────────────────────── */

export interface MappedCandidates {
  rows: Row[];              // canonical column names; bookkeeping kept as-is
  unknownHeaders: string[];
  bookkeepingHeaders: string[];
  hasFirm: boolean;
  hasVerification: boolean;
}

export function mapCandidates(cols: string[], rows: Row[]): MappedCandidates {
  const canonical = (h: string): string | null => {
    if (CANDIDATE_HEADER_ALIASES[h]) return CANDIDATE_HEADER_ALIASES[h];
    if (REGISTER_COLUMNS.includes(h) || h === 'org_id' || h === 'aliases') return h;
    if (BOOKKEEPING_COLUMNS.includes(h)) return h;
    return null;
  };
  const unknownHeaders = cols.filter(h => h && canonical(h) === null);
  const bookkeepingHeaders = cols.filter(h => BOOKKEEPING_COLUMNS.includes(h));
  const mapped = rows.map(r => {
    const o: Row = {};
    for (const h of cols) {
      const c = canonical(h);
      if (c) o[c] = (r[h] ?? '').trim();
    }
    return o;
  });
  return {
    rows: mapped,
    unknownHeaders,
    bookkeepingHeaders,
    hasFirm: cols.some(h => canonical(h) === 'firm'),
    hasVerification: cols.some(h => canonical(h) === 'verification'),
  };
}

/* ── propose ─────────────────────────────────────────────────────────── */

export interface ProposeArgs {
  register: Row[];
  registerCols: string[];
  registerLabel: string;
  /** null → run 0: no candidates, emit the alias backfill proposals (§10). */
  candidates: { cols: string[]; rows: Row[]; label: string } | null;
  aliasPairs?: AliasPair[];
  runDate: string;           // YYYY-MM-DD (the CLI's local day — pure code takes it as input)
}

export interface Counts {
  candidatesIn: number;
  matched: number;
  matchedBy: Record<string, number>;
  newTotal: number;
  appended: number;
  merged: number;
  ambiguous: number;
  conflicts: number;
  unmatchable: number;
  held: number;
  heldBy: Record<string, number>;
  dropped: 0;
  registerIn: number;
  registerOut: number;
}

export interface ProposeResult {
  ok: boolean;
  refusals: string[];
  exitCode: 0 | 1 | 2;
  register: Row[];
  registerCols: string[];
  queue: QueueRow[];
  log: string;
  warnings: string[];
  counts: Counts;
}

/** Register-side guards (spec §9 + the verification law). Shared by both verbs. */
function registerGuards(register: Row[], registerCols: string[], aliasPairs: AliasPair[]): { refusals: string[]; entries: RegEntry[] } {
  const refusals: string[] = [];
  if (!registerCols.includes('org_id') || !registerCols.includes('firm')) {
    refusals.push(`register is missing required column(s): ${['org_id', 'firm'].filter(c => !registerCols.includes(c)).join(', ')}`);
  }
  if (!register.length) refusals.push('register is empty — nothing to merge into');
  if (refusals.length) return { refusals, entries: [] };

  const seenId = new Map<string, string>();
  const seenKey = new Map<string, string>();
  const entries: RegEntry[] = [];
  register.forEach((r, i) => {
    const id = (r.org_id || '').trim();
    const firm = (r.firm || '').trim();
    if (!id || !firm) { refusals.push(`register row ${i + 2} is missing ${!id ? 'org_id' : 'firm'} — file unparseable as a register`); return; }
    if (seenId.has(id)) refusals.push(`duplicate org_id ${id} ("${seenId.get(id)}" and "${firm}") — the join key is already broken`);
    seenId.set(id, firm);
    const e = regEntry(r, i, aliasPairs);
    entries.push(e);
    if (e.key && !e.redacted) {
      if (seenKey.has(e.key)) refusals.push(`duplicate stripped-name key "${e.key}" (${seenKey.get(e.key)} and ${id}) — the register already has the disease; fix before merging into it`);
      else seenKey.set(e.key, id);
    }
    // The register is VERIFIED-only; blank is tolerated on the 75 legacy rows
    // (they carry `confidence` instead). Anything else means the funnel/register
    // boundary has already been crossed — refuse rather than merge into it.
    const ver = (r.verification || '').trim();
    if (ver && ver.toUpperCase() !== 'VERIFIED') {
      refusals.push(`register row ${id} ("${firm}") carries verification "${ver}" — the register is VERIFIED-only (blank tolerated on legacy rows); move the row to the funnel or verify it`);
    }
  });
  return { refusals, entries };
}

const pad = (n: number) => String(n).padStart(5);
const pct = (a: number, b: number) => b ? Math.round((a / b) * 100) : 0;

/** `candidates_in == matched + new + ambiguous + unmatchable` — the single
 *  line this tool exists for (spec §8). Exported so the tests can pin it. */
export const arithmeticCloses = (c: Counts): boolean =>
  c.matched + c.newTotal + c.ambiguous + c.unmatchable === c.candidatesIn;

export function propose(args: ProposeArgs): ProposeResult {
  const aliasPairs = args.aliasPairs ?? [];
  const registerCols = [...args.registerCols];
  const register = args.register.map(r => ({ ...r }));
  const warnings: string[] = [];
  const queue: QueueRow[] = [];
  let qn = 0;
  const qrow = (kind: QueueKind, reason: string, cand: Partial<QueueRow>, reg: RegEntry | null, tier: string, note: string): QueueRow => {
    qn += 1;
    return {
      queue_id: 'RQ-' + String(qn).padStart(3, '0'),
      kind, reason,
      candidate_firm: cand.candidate_firm || '',
      candidate_domain: cand.candidate_domain || '',
      candidate_row_json: cand.candidate_row_json || '',
      register_org_id: reg ? reg.orgId : '',
      register_firm: reg ? reg.firm : '',
      register_domain: reg ? reg.domain : '',
      match_tier: tier,
      confidence_note: note,
      decision: '', decided_by: '', decided_on: '',
    };
  };

  const counts: Counts = {
    candidatesIn: 0, matched: 0, matchedBy: {}, newTotal: 0, appended: 0, merged: 0,
    ambiguous: 0, conflicts: 0, unmatchable: 0, held: 0, heldBy: {}, dropped: 0,
    registerIn: register.length, registerOut: register.length,
  };
  const refuse = (refusals: string[]): ProposeResult => ({
    ok: false, refusals, exitCode: 2,
    register: args.register, registerCols: args.registerCols,
    queue: [], warnings,
    log: `## ${args.runDate} · REFUSED\n\n` + refusals.map(r => `- ${r}`).join('\n') + '\n\nNothing was written.\n',
    counts,
  });

  const { refusals, entries } = registerGuards(register, registerCols, aliasPairs);
  if (refusals.length) return refuse(refusals);

  const regCoverage = entries.filter(e => e.domain).length;
  const redactedRegister = entries.filter(e => e.redacted);
  const lines: string[] = [];

  /* ── run 0: the alias backfill (spec §10) ── */
  if (!args.candidates) {
    for (const e of entries) {
      const decorated: Array<{ text: string; meaning: string; suggest: string }> = [];
      for (const p of e.parens) {
        const suggest =
          p.meaning === 'ticker' ? 'skip (a ticker is never a name)' :
          p.meaning === 'redaction' ? 'skip (excluded from matching every run)' :
          p.meaning === 'rebrand' ? `alias:${(REBRAND_RE.exec(p.text) || [])[1] || p.text} (this is the CURRENT name)` :
          p.meaning === 'expansion' ? `alias:${p.text}` :
          `alias:${p.text} ONLY if it is a parent/former name — for a SPONSOR, skip: the 2026-08-18 run's three false positives were sponsor parentheticals treated as aliases`;
        decorated.push({ text: p.text, meaning: p.meaning, suggest });
      }
      const nk = nameKey((register[e.i].firm || ''));
      for (const k of nk.aliasKeys) {
        if (nk.aliasOrigin[k] !== 'slash') continue;   // paren forms are handled above; inline/extra are matching fuel only
        decorated.push({ text: nk.aliasSrc[k], meaning: 'slash-form', suggest: `alias:${nk.aliasSrc[k]}` });
      }
      for (const d of decorated) {
        const already = (register[e.i].aliases || '').split('|').map(s => s.trim()).filter(Boolean);
        if (already.some(a => nameKeyOf(a) === nameKeyOf(d.text))) continue;
        queue.push(qrow('ALIAS_PROPOSAL', d.meaning, {
          candidate_row_json: JSON.stringify({ alias: d.text, meaning: d.meaning, from: 'register' }),
        }, e, '', `"${e.firm}" carries ${d.meaning} "(${d.text})" — ${d.suggest}`));
      }
    }
    counts.ambiguous = 0;
    lines.push(`## ${args.runDate} · run 0 — alias backfill → ${args.registerLabel}`, '');
    lines.push('```');
    lines.push(`candidates in       0   (run 0 reads the register only)`);
    lines.push(`register in    ${pad(counts.registerIn)}   register out ${pad(counts.registerOut)}   (register never written on run 0)`);
    lines.push(`ALIAS_PROPOSAL ${pad(queue.length)}   ← adjudicate once; after that the decorated names stop being landmines`);
    lines.push(`DROPPED             0`);
    lines.push('');
    lines.push(`register coverage   ${regCoverage}/${entries.length} carry a domain — ${100 - pct(regCoverage, entries.length)}% can only be matched on the name string`);
    lines.push(`contacts: not reconciled (v1 scope)`);
    lines.push('```', '');
    if (redactedRegister.length) {
      lines.push(`Register redactions, excluded from matching every run:`);
      for (const e of redactedRegister) lines.push(`- ${e.orgId} "${e.firm}"`);
      lines.push('');
    }
    for (const q of queue) lines.push(`- ${q.queue_id} · ${q.register_org_id} — ${q.confidence_note}`);
    return {
      ok: true, refusals: [], exitCode: queue.length ? 1 : 0,
      register, registerCols, queue, warnings, counts,
      log: lines.join('\n') + '\n',
    };
  }

  /* ── a real candidate run ── */
  const mc = mapCandidates(args.candidates.cols, args.candidates.rows);
  if (!mc.hasFirm) {
    return refuse([`candidate file is missing the required firm header (accepts "firm" or "account_name") — not a skip, a refusal`]);
  }
  if (mc.unknownHeaders.length) {
    warnings.push(`unknown candidate header(s), read but not merged: ${mc.unknownHeaders.join(', ')}`);
  }
  if (!mc.hasVerification) {
    warnings.push('candidate file carries no verification column — rows are admitted with blank verification (the funnel always carries the scale; a hand-curated list may not)');
  }

  counts.candidatesIn = mc.rows.length;
  const label = args.candidates.label;

  interface Listed { firm: string; rec: string; detail: string }
  const listAmb: Listed[] = [], listUnm: Listed[] = [], listConf: Listed[] = [];
  const heldNames: string[] = [];
  const bucketDefaulted: string[] = [];
  let tierKeptCount = 0;

  for (const cand of mc.rows) {
    const firmRaw = (cand.firm || '').trim();
    const rec = (cand.source_key || cand.org_id || '').trim();
    const tag = rec ? `[${args.runDate} ${label} / ${rec}]` : `[${args.runDate} ${label}]`;
    const extra = (cand.aliases || '').split('|').map(s => s.trim()).filter(Boolean);
    const nk = nameKey(firmRaw, extra);
    const domain = cand.website ? normDomain(cand.website) : '';
    // The funnel writes register_match as "ORG-073 | OMERS Private Equity" —
    // id plus display name. The id is the reference; anything else rides along.
    const orgRefRaw = ((cand.org_id || '').trim() || (cand.register_match || '').trim());
    const orgRef = orgRefRaw ? ((/^(ORG-\d+)\b/.exec(orgRefRaw) || [])[1] || orgRefRaw) : '';
    const outcome = matchOne({ nk, domain, orgRef }, entries, aliasPairs);

    const ver = (cand.verification || '').trim();
    const verified = !mc.hasVerification || ver.toUpperCase() === 'VERIFIED';
    const holdKey = ver || '(blank)';
    const candJson = JSON.stringify(cand);

    if (outcome.verdict === 'UNMATCHABLE') {
      counts.unmatchable += 1;
      listUnm.push({ firm: firmRaw || '(no name)', rec, detail: outcome.note });
      queue.push(qrow('UNMATCHABLE', outcome.reason, {
        candidate_firm: firmRaw, candidate_domain: domain, candidate_row_json: candJson,
      }, null, outcome.tier, outcome.note));
      continue;
    }

    if (outcome.verdict === 'AMBIGUOUS') {
      counts.ambiguous += 1;
      const tgt = outcome.targets.length ? entries[outcome.targets[0]] : null;
      const others = outcome.targets.slice(1).map(t => `${entries[t].orgId} "${entries[t].firm}"`).join(' · ');
      const note = outcome.note + (others ? ` — also hits ${others}` : '');
      listAmb.push({ firm: firmRaw, rec, detail: `${outcome.tier || outcome.reason}: ${tgt ? `${tgt.orgId} "${tgt.firm}" — ` : ''}${note}` });
      queue.push(qrow('AMBIGUOUS', outcome.reason || outcome.tier, {
        candidate_firm: firmRaw, candidate_domain: domain, candidate_row_json: candJson,
      }, tgt, outcome.tier, note));
      continue;
    }

    // A register write is a promotion, and promotion is the verification act:
    // computed and counted either way, but a not-VERIFIED row never writes.
    if (outcome.verdict === 'MATCHED') {
      counts.matched += 1;
      counts.matchedBy[outcome.tier] = (counts.matchedBy[outcome.tier] || 0) + 1;
      const e = entries[outcome.targets[0]];
      if (!verified) {
        counts.held += 1; counts.heldBy[holdKey] = (counts.heldBy[holdKey] || 0) + 1;
        heldNames.push(`${firmRaw}${rec ? ` (${rec})` : ''} — matched ${e.orgId} "${e.firm}" via ${outcome.tier}; held: ${holdKey}`);
        continue;
      }
      const target = register[e.i];
      const m = mergeRow(target, cand, tag, args.runDate);
      if (m.changed.length) counts.merged += 1;
      if (m.tierKept) tierKeptCount += 1;
      for (const c of m.conflicts) {
        counts.conflicts += 1;
        listConf.push({ firm: firmRaw, rec, detail: `${e.orgId} "${e.firm}" · ${c.field}: register "${c.existing}" vs candidate "${c.incoming}"` });
        const how = c.field === 'firm'
          ? `merge:${e.orgId} keeps the register string (an app row is keyed to it — COLUMNS.md); record alias:${c.incoming} to make the match durable, or change the register string by hand, deliberately.`
          : `merge:${e.orgId} adopts the candidate value; skip keeps the register's.`;
        queue.push(qrow('CONFLICT', c.field, {
          candidate_firm: firmRaw, candidate_domain: domain, candidate_row_json: candJson,
        }, e, outcome.tier, `field "${c.field}" — register keeps "${c.existing}"; candidate says "${c.incoming}". ${how}`));
      }
      proposeDecorations(nk, e, register[e.i], queue, qrow);
      continue;
    }

    // NEW
    counts.newTotal += 1;
    if (!verified) {
      counts.held += 1; counts.heldBy[holdKey] = (counts.heldBy[holdKey] || 0) + 1;
      heldNames.push(`${firmRaw}${rec ? ` (${rec})` : ''} — NEW; held: ${holdKey} (stays in the funnel until verified)`);
      continue;
    }
    const orgId = nextOrgId(register);
    const built = buildNewRow(cand, registerCols, orgId, tag);
    if (built.tierNote) warnings.push(`${firmRaw}: ${built.tierNote}`);
    if (built.bucketDefaulted) bucketDefaulted.push(`${orgId} "${firmRaw}"`);
    register.push(built.row);
    counts.appended += 1;
    // The appended row joins the live index so a later row in the SAME file
    // (a duplicate, or an alias-map sibling like Reedy/PremiStar) matches it
    // instead of minting a second entity.
    entries.push(regEntry(built.row, register.length - 1, aliasPairs));
    proposeDecorations(nk, entries[entries.length - 1], built.row, queue, qrow);
  }

  counts.registerOut = register.length;

  // THE ONE GUARD THAT MATTERS MOST: the arithmetic must close, or the run
  // refuses and writes nothing. A reconcile that drops an ambiguous row quietly
  // rebuilds the silent-continue bug one layer upstream.
  if (!arithmeticCloses(counts)) {
    return refuse([
      `the arithmetic does not close: matched ${counts.matched} + new ${counts.newTotal} + ambiguous ${counts.ambiguous} + unmatchable ${counts.unmatchable} != candidates in ${counts.candidatesIn} — a row was dropped silently; nothing was written`,
    ]);
  }

  /* ── the log (spec §8) ── */
  const mb = counts.matchedBy;
  const candCoverage = mc.rows.filter(r => (r.website || '').trim()).length;
  lines.push(`## ${args.runDate} · ${label} → ${args.registerLabel}`, '');
  lines.push('```');
  lines.push(`candidates in ${pad(counts.candidatesIn)}`);
  lines.push(`register in   ${pad(counts.registerIn)}`);
  lines.push(`register out  ${pad(counts.registerOut)}   (+${counts.appended} appended · ${counts.merged} merged in place)`);
  lines.push('');
  lines.push(`MATCHED       ${pad(counts.matched)}   (source_key ${mb['source_key'] || 0} · domain+name ${mb['domain+name'] || 0} · name-only ${mb['name-only'] || 0} · alias ${mb['alias'] || 0})`);
  lines.push(`NEW           ${pad(counts.newTotal)}   (appended ${counts.appended} · held ${counts.newTotal - counts.appended})`);
  lines.push(`AMBIGUOUS     ${pad(counts.ambiguous)}   ← listed below, never auto-merged`);
  lines.push(`CONFLICT      ${pad(counts.conflicts)}   (fields held on merged rows, listed below)`);
  lines.push(`UNMATCHABLE   ${pad(counts.unmatchable)}   ← listed below`);
  lines.push(`DROPPED           0`);
  lines.push(`             ------`);
  lines.push(`              ${pad(counts.candidatesIn)}   arithmetic closes: ${counts.matched} + ${counts.newTotal} + ${counts.ambiguous} + ${counts.unmatchable} == ${counts.candidatesIn}  ✓`);
  lines.push('');
  lines.push(`register coverage    ${regCoverage}/${counts.registerIn} carry a domain — ${100 - pct(regCoverage, counts.registerIn)}% can only be matched on the name string`);
  lines.push(`candidate coverage   ${candCoverage}/${counts.candidatesIn} carry a domain`);
  lines.push(`contacts: not reconciled (v1 scope)`);
  lines.push('```', '');
  const listBlock = (title: string, items: Listed[]) => {
    if (!items.length) return;
    lines.push(`### ${title}`, '');
    for (const it of items) lines.push(`- ${it.firm}${it.rec ? ` (${it.rec})` : ''} — ${it.detail}`);
    lines.push('');
  };
  listBlock(`AMBIGUOUS — ${counts.ambiguous}, none auto-merged`, listAmb);
  listBlock(`CONFLICT — ${counts.conflicts}, register value kept until adjudicated`, listConf);
  listBlock(`UNMATCHABLE — ${counts.unmatchable}`, listUnm);
  if (counts.held) {
    lines.push(`### Held — not VERIFIED (${counts.held}; promotion is the verification act)`, '');
    lines.push(`By value: ${Object.entries(counts.heldBy).map(([k, v]) => `${k} ${v}`).join(' · ')}`, '');
    for (const h of heldNames) lines.push(`- ${h}`);
    lines.push('');
  }
  if (bucketDefaulted.length) {
    lines.push(`### bucket defaulted to CLIENT on ${bucketDefaulted.length} appended row(s)`, '');
    lines.push(`The funnel carries no bucket column and a BLANK bucket imports app-side as`);
    lines.push(`\`acquirer\` (COLUMNS.md), so blank is not the safe gap here. Reclassify any`);
    lines.push(`of these that are ecosystem/do-not-pitch BEFORE a push:`, '');
    for (const b of bucketDefaulted) lines.push(`- ${b}`);
    lines.push('');
  }
  if (tierKeptCount) lines.push(`tier: existing register value kept on ${tierKeptCount} merged row(s) — the candidate scale maps only on NEW rows`, '');
  if (redactedRegister.length) {
    lines.push(`Register redactions, excluded from matching every run: ${redactedRegister.map(e => `${e.orgId} "${e.firm}"`).join(' · ')}`, '');
  }
  if (mc.bookkeepingHeaders.length) {
    lines.push(`Funnel bookkeeping columns read but never merged: ${mc.bookkeepingHeaders.join(', ')}` +
      (mc.bookkeepingHeaders.some(h => h.startsWith('contact_')) ? ' (contacts are v1 scope)' : ''), '');
  }
  for (const w of warnings) lines.push(`⚠ ${w}`);
  if (warnings.length) lines.push('');

  return {
    ok: true, refusals: [], exitCode: queue.length ? 1 : 0,
    register, registerCols, queue, warnings, counts,
    log: lines.join('\n') + '\n',
  };
}

/** Candidate-side name decorations become queue proposals against the row they
 *  landed on: sponsor/parent parentheticals as proposed DATA, rebrand/expansion/
 *  slash forms as proposed durable aliases. Suppressed once the register row
 *  already carries the alias. */
function proposeDecorations(
  nk: NameKey, e: RegEntry, regRow: Row, queue: QueueRow[],
  qrow: (kind: QueueKind, reason: string, cand: Partial<QueueRow>, reg: RegEntry | null, tier: string, note: string) => QueueRow,
): void {
  const already = (regRow.aliases || '').split('|').map(s => nameKeyOf(s)).filter(Boolean);
  for (const p of nk.parens) {
    if (p.meaning === 'ticker' || p.meaning === 'redaction') continue;
    if (p.meaning === 'sponsor-or-parent') {
      if (nameKeyOf(p.text) && (regRow.sponsor_parent || '').trim() && nameKeyOf(regRow.sponsor_parent!) === nameKeyOf(p.text)) continue;
      queue.push(qrow('ALIAS_PROPOSAL', 'sponsor-or-parent', {
        candidate_firm: nk.raw, candidate_row_json: JSON.stringify({ alias: p.text, meaning: p.meaning, from: 'candidate' }),
      }, e, '', `candidate name carries "(${p.text})" — proposed sponsor_parent=${p.text} on ${e.orgId}; decide alias:${p.text} ONLY if it is a parent/former name, never for a sponsor`));
      continue;
    }
    const text = p.meaning === 'rebrand' ? ((REBRAND_RE.exec(p.text) || [])[1] || p.text) : p.text;
    if (already.includes(nameKeyOf(text))) continue;
    queue.push(qrow('ALIAS_PROPOSAL', p.meaning, {
      candidate_firm: nk.raw, candidate_row_json: JSON.stringify({ alias: text, meaning: p.meaning, from: 'candidate' }),
    }, e, '', `candidate name carries ${p.meaning} "(${p.text})" — decide alias:${text} to make it durable on ${e.orgId}`));
  }
  for (const k of nk.aliasKeys) {
    const src = nk.aliasSrc[k];
    if (!src || already.includes(k)) continue;
    if (nk.aliasOrigin[k] !== 'slash') continue;        // paren forms handled above; inline/extra are matching fuel, not proposals
    queue.push(qrow('ALIAS_PROPOSAL', 'slash-form', {
      candidate_firm: nk.raw, candidate_row_json: JSON.stringify({ alias: src, meaning: 'slash-form', from: 'candidate' }),
    }, e, '', `candidate name carries slash form "${src}" — decide alias:${src} to make it durable on ${e.orgId}`));
  }
}

/* ── apply (spec §4/§7) ──────────────────────────────────────────────── */

export interface ApplyArgs {
  register: Row[];
  registerCols: string[];
  queue: QueueRow[];
  aliasPairs?: AliasPair[];
  runDate: string;
}

export interface ApplyResult {
  ok: boolean;
  refusals: string[];
  exitCode: 0 | 1 | 2;
  register: Row[];
  registerCols: string[];
  applied: string[];
  held: string[];
  skipped: string[];
  undecided: number;
  logAppend: string;
}

export function applyDecisions(args: ApplyArgs): ApplyResult {
  const aliasPairs = args.aliasPairs ?? [];
  const registerCols = [...args.registerCols];
  const register = args.register.map(r => ({ ...r }));
  const refusals: string[] = [];

  const guard = registerGuards(register, registerCols, aliasPairs);
  refusals.push(...guard.refusals);

  // Validate EVERY decision before acting on any — a refusal writes nothing.
  const byId = new Map<string, number>();
  register.forEach((r, i) => byId.set((r.org_id || '').trim(), i));
  interface Act { q: QueueRow; verb: 'merge' | 'new' | 'skip' | 'disqualify' | 'alias'; target?: number; aliasText?: string; cand?: Row }
  const acts: Act[] = [];
  let undecided = 0;
  for (const q of args.queue) {
    const d = (q.decision || '').trim();
    if (!d) { undecided += 1; continue; }        // undecided is not an error — apply leaves it
    if (!DECISION_RE.test(d)) {
      refusals.push(`${q.queue_id}: decision "${d}" is not in the vocabulary (merge:ORG-NNN · new · skip · disqualify · alias:<text>)`);
      continue;
    }
    if (d.startsWith('merge:')) {
      const id = d.slice('merge:'.length).trim();
      const t = byId.get(id);
      if (t === undefined) { refusals.push(`${q.queue_id}: merge target ${id} names no register row`); continue; }
      const cand = parseRowJson(q, refusals); if (cand === null) continue;
      acts.push({ q, verb: 'merge', target: t, cand });
    } else if (d === 'new') {
      const cand = parseRowJson(q, refusals); if (cand === null) continue;
      acts.push({ q, verb: 'new', cand });
    } else if (d === 'skip') {
      acts.push({ q, verb: 'skip' });
    } else if (d === 'disqualify') {
      const id = (q.register_org_id || '').trim();
      if (id) {
        const t = byId.get(id);
        if (t === undefined) { refusals.push(`${q.queue_id}: disqualify names register row ${id}, which does not exist`); continue; }
        acts.push({ q, verb: 'disqualify', target: t });
      } else {
        const cand = parseRowJson(q, refusals); if (cand === null) continue;
        acts.push({ q, verb: 'disqualify', cand });
      }
    } else {
      const text = d.slice('alias:'.length).trim();
      const id = (q.register_org_id || '').trim();
      const t = id ? byId.get(id) : undefined;
      if (t === undefined) { refusals.push(`${q.queue_id}: alias:${text} needs a register_org_id that exists (got "${id || '(none)'}")`); continue; }
      if (!text) { refusals.push(`${q.queue_id}: alias: carries no text`); continue; }
      acts.push({ q, verb: 'alias', target: t, aliasText: text });
    }
  }
  if (refusals.length) {
    return {
      ok: false, refusals, exitCode: 2,
      register: args.register, registerCols: args.registerCols,
      applied: [], held: [], skipped: [], undecided,
      logAppend: `\n## Applied — ${args.runDate} · REFUSED\n\n` + refusals.map(r => `- ${r}`).join('\n') + '\n\nNothing was written.\n',
    };
  }

  const applied: string[] = [], held: string[] = [], skipped: string[] = [];
  const entriesLive = () => register.map((r, i) => regEntry(r, i, aliasPairs));

  for (const a of acts) {
    const q = a.q;
    const rec = candRec(a.cand);
    const tag = rec ? `[${args.runDate} reconcile ${q.queue_id} / ${rec}]` : `[${args.runDate} reconcile ${q.queue_id}]`;
    if (a.verb === 'skip') { skipped.push(`${q.queue_id} skip — left alone; re-raised next run`); continue; }

    if (a.verb === 'alias') {
      const row = register[a.target!];
      if (!registerCols.includes('aliases')) registerCols.push('aliases');  // spec §10: a fact column; the loader ignores unknown columns and names them
      const cur = (row.aliases || '').split('|').map(s => s.trim()).filter(Boolean);
      if (cur.some(x => nameKeyOf(x) === nameKeyOf(a.aliasText!))) {
        applied.push(`${q.queue_id} alias:${a.aliasText} — already on ${row.org_id} (no-op)`);
      } else {
        row.aliases = [...cur, a.aliasText!].join('|');
        applied.push(`${q.queue_id} alias:${a.aliasText} recorded on ${row.org_id}`);
      }
      continue;
    }

    if (a.verb === 'disqualify' && a.target !== undefined) {
      const row = register[a.target];
      if ((row.bucket || '').trim() === 'ECOSYSTEM_DO_NOT_PITCH') {
        applied.push(`${q.queue_id} disqualify — ${row.org_id} already ECOSYSTEM_DO_NOT_PITCH (no-op)`);
      } else {
        appendNote(row, `${tag} bucket ${row.bucket || '(blank)'} → ECOSYSTEM_DO_NOT_PITCH (disqualified via review queue)`);
        row.bucket = 'ECOSYSTEM_DO_NOT_PITCH';
        applied.push(`${q.queue_id} disqualify — ${row.org_id} bucket → ECOSYSTEM_DO_NOT_PITCH`);
      }
      continue;
    }

    // merge / new / disqualify-append all admit candidate data, so all three
    // sit behind the verification gate: DISCOVERY never touches the register,
    // even carrying a human decision — verify first, then re-run (the
    // 2026-08-18 run resolved its sponsors exactly this way: "new", but the
    // DISCOVERY ones stayed in the funnel).
    const cand = a.cand!;
    const ver = ('verification' in cand) ? (cand.verification || '').trim() : '';
    const verified = !('verification' in cand) || ver.toUpperCase() === 'VERIFIED';
    if (!verified) {
      held.push(`${q.queue_id} ${q.decision} — HELD: candidate is ${ver || '(blank)'}; the register is VERIFIED-only. Verify in the funnel, then re-run propose.`);
      continue;
    }

    if (a.verb === 'merge') {
      const row = register[a.target!];
      // The human decision IS the adjudication: held fields adopt the
      // candidate's values — except `firm`, which never moves via merge.
      const m = mergeRow(row, cand, tag, args.runDate, true);
      applied.push(`${q.queue_id} merge:${row.org_id} — ${m.changed.length ? `updated ${[...new Set(m.changed)].join(', ')}` : 'no cell changed (already current)'}${m.conflicts.length ? ` · firm string kept (change it by hand, deliberately): ${m.conflicts.map(c => `"${c.incoming}"`).join(', ')}` : ''}`);
      continue;
    }

    // new (or disqualify-append)
    const nk = nameKey((cand.firm || '').trim());
    const dup = entriesLive().find(e => !e.redacted && ((nk.key && e.key === nk.key) || (nk.key && e.aliasKeys.has(nk.key))));
    if (dup) {
      applied.push(`${q.queue_id} ${a.verb} — "${cand.firm}" already present as ${dup.orgId} (idempotent no-op; re-run propose to merge new facts)`);
      continue;
    }
    const orgId = nextOrgId(register);
    const built = buildNewRow(cand, registerCols, orgId, tag);
    if (a.verb === 'disqualify') built.row.bucket = 'ECOSYSTEM_DO_NOT_PITCH';
    register.push(built.row);
    applied.push(`${q.queue_id} ${a.verb} — appended ${orgId} "${cand.firm}"${a.verb === 'disqualify' ? ' as ECOSYSTEM_DO_NOT_PITCH' : ''}${built.bucketDefaulted && a.verb !== 'disqualify' ? ' (bucket defaulted to CLIENT — reclassify before a push if ecosystem)' : ''}`);
  }

  const lines: string[] = ['', `## Applied — ${args.runDate}`, ''];
  lines.push('```');
  lines.push(`decisions applied ${pad(applied.length)}`);
  lines.push(`held              ${pad(held.length)}`);
  lines.push(`skip              ${pad(skipped.length)}`);
  lines.push(`undecided         ${pad(undecided)}   (left in the queue — an empty decision is not an error)`);
  lines.push(`register          ${pad(args.register.length)} → ${register.length}`);
  lines.push('```', '');
  for (const l of [...applied, ...skipped]) lines.push(`- ${l}`);
  for (const l of held) lines.push(`- ⚠ ${l}`);
  lines.push('');

  return {
    ok: true, refusals: [], exitCode: (held.length || undecided) ? 1 : 0,
    register, registerCols, applied, held, skipped, undecided,
    logAppend: lines.join('\n'),
  };
}

function parseRowJson(q: QueueRow, refusals: string[]): Row | null {
  const raw = (q.candidate_row_json || '').trim();
  if (!raw) { refusals.push(`${q.queue_id}: decision "${q.decision}" needs candidate_row_json, which is empty`); return null; }
  try {
    const o = JSON.parse(raw);
    if (o && typeof o === 'object' && !Array.isArray(o)) {
      if (!(o as Row).firm || !String((o as Row).firm).trim()) { refusals.push(`${q.queue_id}: candidate_row_json carries no firm`); return null; }
      return o as Row;
    }
  } catch { /* fall through */ }
  refusals.push(`${q.queue_id}: candidate_row_json is not parseable JSON`);
  return null;
}

const candRec = (cand?: Row): string => cand ? ((cand.source_key || cand.org_id || '') as string).trim() : '';
