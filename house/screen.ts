/**
 * Target screening — the mechanical half of building a draft board.
 *
 * Paul, 2026-07-28: "this whole search and rank function needs to be built
 * locally so that Cowork can do it."
 *
 * Pure: no database, no API, no model. Everything here is arithmetic and
 * string matching over files you can read. The one part that touches a network
 * (the Google Places pull) lives in scripts/studio/screen.mts, because a pure
 * module is what makes the rest testable and auditable.
 *
 * THE DESIGN POINT. The app decided "is this business independent?" nowhere at
 * all, and estimated revenue by asking a model to guess from Google review
 * counts. Neither survives the citation law this practice now runs on. So:
 *
 *   Affiliation is a REGISTER LOOKUP, not a judgement. A consolidator's brands
 *   are named in a file; a candidate matches or it doesn't, and the match says
 *   which brand it hit and how. Nothing is inferred.
 *
 *   Revenue is a BAND with its arithmetic attached, never a point estimate on a
 *   named company (THE LINE), and every input names the assumption it came from
 *   so `audit.mts` can check the number that lands in a document.
 */

/* ── candidate rows ──────────────────────────────────────────────────── */

/** A row. Extra keys survive a Google Sheets round trip untouched. */
export interface Candidate {
  place_id?: string;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  website?: string;
  rating?: string;
  reviews?: string;
  types?: string;
  [k: string]: string | undefined;
}

export type Affiliation = 'independent' | 'affiliated' | 'unknown';

/* ── the consolidator register ───────────────────────────────────────── */

export interface Consolidator {
  name: string;
  backer?: string;
  brands: string[];
  domains: string[];
}

/**
 * Parse `consolidators.md` — the who's-who, in a form a machine can check.
 *
 *   ## Neighborly
 *   backer: KKR
 *   brands: Aire Serv, Mr. Rooter, Mr. Electric
 *   domains: neighborly.com, aireserv.com
 */
export function parseRegister(md: string): Consolidator[] {
  const out: Consolidator[] = [];
  let cur: Consolidator | null = null;
  let fenced = false;
  for (const raw of md.split('\n')) {
    // Fenced blocks are documentation, not data. The seeded template shows the
    // shape inside a fence, and an unfilled register MUST parse as empty —
    // otherwise a placeholder entry makes the file look populated and every
    // candidate gets called "independent" against a register of nothing. That
    // is how a Neighborly franchise ends up at the top of a draft board.
    if (/^\s*(```|~~~)/.test(raw)) { fenced = !fenced; continue; }
    if (fenced) continue;
    const h = /^##\s+(.+?)\s*$/.exec(raw);
    if (h) {
      if (cur) out.push(cur);
      cur = { name: h[1], brands: [], domains: [] };
      continue;
    }
    if (!cur) continue;
    const kv = /^\s*[-*]?\s*(backer|brands|domains)\s*:\s*(.+?)\s*$/i.exec(raw);
    if (!kv) continue;
    const key = kv[1].toLowerCase();
    const vals = kv[2].split(',').map(s => s.trim()).filter(Boolean);
    if (key === 'backer') cur.backer = kv[2].trim();
    else if (key === 'brands') cur.brands.push(...vals);
    else cur.domains.push(...vals.map(normDomain));
  }
  if (cur) out.push(cur);
  // The parent's own name is a brand — operators trade under it directly.
  for (const c of out) if (!c.brands.length || !c.brands.some(b => norm(b) === norm(c.name))) c.brands.unshift(c.name);
  return out;
}

/**
 * Fold a name to comparable form. HTML entities are decoded first because
 * scraped listings carry "PARKER &amp; SONS", and left alone the `amp` becomes
 * a word that stops the brand matching — a false independent, silently.
 */
const norm = (s: string) => s
  .replace(/&amp;/gi, '&').replace(/&#0*38;/g, '&').replace(/&nbsp;/gi, ' ')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();

/** Registrable-ish host: strip scheme, path, port, `www.` */
export function normDomain(s: string): string {
  return s.trim().toLowerCase()
    .replace(/^[a-z]+:\/\//, '')
    .replace(/^www\./, '')
    .replace(/[/?#].*$/, '')
    .replace(/:\d+$/, '');
}

export interface Classification {
  affiliation: Affiliation;
  affiliatedTo: string;
  evidence: string;
}

/**
 * Match a candidate against the register.
 *
 * Two signals only, both checkable by eye afterwards: the business name
 * contains a registered brand, or its website sits on a registered domain.
 * Phone is deliberately not used — franchise locations carry local numbers, so
 * it produces misses that look like independence, which is the expensive error.
 *
 * "independent" here means NOT FOUND IN THE REGISTER. That is a real claim only
 * insofar as the register is complete, which is why classify() reports the
 * register it was checked against and why an empty register returns `unknown`
 * for everything rather than declaring a whole market independent.
 */
export function classify(c: Candidate, register: Consolidator[]): Classification {
  if (!register.length) {
    return { affiliation: 'unknown', affiliatedTo: '', evidence: 'no register to check against' };
  }
  const name = norm(c.name || '');
  const host = c.website ? normDomain(c.website) : '';

  for (const co of register) {
    for (const d of co.domains) {
      if (!d) continue;
      if (host === d || host.endsWith('.' + d)) {
        return { affiliation: 'affiliated', affiliatedTo: co.name, evidence: `domain ${host} → ${d}` };
      }
    }
  }
  for (const co of register) {
    for (const b of co.brands) {
      const nb = norm(b);
      // Short tokens ("ARS", "One") collide with ordinary words constantly.
      // A false "affiliated" only costs one skipped candidate; a false
      // "independent" sends you to diligence on a company that is already owned.
      if (nb.length < 5) continue;
      if (wordMatch(name, nb)) {
        return { affiliation: 'affiliated', affiliatedTo: co.name, evidence: `name contains "${b}"` };
      }
    }
  }
  return { affiliation: 'independent', affiliatedTo: '', evidence: `no match in ${register.length}-entry register` };
}

/** `needle` appears in `haystack` on word boundaries (both already normalized). */
function wordMatch(haystack: string, needle: string): boolean {
  if (!haystack || !needle) return false;
  const i = haystack.indexOf(needle);
  if (i < 0) return false;
  const before = i === 0 || haystack[i - 1] === ' ';
  const endsAt = i + needle.length;
  const after = endsAt === haystack.length || haystack[endsAt] === ' ';
  return before && after;
}

/* ── revenue: a band, with its working ───────────────────────────────── */

export interface Benchmark {
  naics: string;
  label: string;
  revenuePerEmployee: number;
  source: string;
}

/** Parse the GFM table in `benchmarks.md`: NAICS | Label | Revenue/employee | Source */
export function parseBenchmarks(md: string): Benchmark[] {
  const out: Benchmark[] = [];
  for (const line of md.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map(s => s.trim());
    if (cells.length < 4) continue;
    if (/^-+:?$|^:?-+/.test(cells[0])) continue;            // separator row
    if (/^naics$/i.test(cells[0])) continue;                 // header row
    const rpe = money(cells[2]);
    if (rpe == null) continue;
    out.push({ naics: cells[0], label: cells[1], revenuePerEmployee: rpe, source: cells[3] });
  }
  return out;
}

function money(s: string): number | null {
  const n = Number(s.replace(/[$,\s]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** An employee range inferred from a review count, per the screen's own table. */
export interface EmployeeRule { minReviews: number; low: number; high: number }

/**
 * Parse the review→employee proxy from screen.md:
 *   reviews 0-9    | 1-3
 *   reviews 200+   | 25-60
 */
export function parseEmployeeRules(md: string): EmployeeRule[] {
  const out: EmployeeRule[] = [];
  const sec = /##\s*Employee proxy[^\n]*\n([\s\S]*?)(?=\n##\s|$)/i.exec(md);
  if (!sec) return out;
  for (const line of sec[1].split('\n')) {
    const m = /^\s*[-*|]?\s*(?:reviews\s+)?(\d+)\s*(?:-\s*(\d+)|\+)\s*[|:]\s*(\d+)\s*-\s*(\d+)/i.exec(line);
    if (!m) continue;
    out.push({ minReviews: Number(m[1]), low: Number(m[3]), high: Number(m[4]) });
  }
  return out.sort((a, b) => a.minReviews - b.minReviews);
}

export interface RevenueBand {
  low: number | null;
  high: number | null;
  /** The full arithmetic, ready to drop into a `## Derivations` entry. */
  basis: string;
}

/**
 * Revenue band = employee range × revenue-per-employee for the NAICS code.
 *
 * Both inputs are assumptions and both are named in the basis string, because
 * this number is going to end up in a document where `audit.mts` will ask where
 * it came from. A missing benchmark returns no band rather than a guess — the
 * whole failure mode this replaces is a plausible number with nothing behind it.
 */
export function revenueBand(
  c: Candidate,
  naics: string,
  benchmarks: Benchmark[],
  rules: EmployeeRule[],
): RevenueBand {
  const bench = benchmarks.find(b => b.naics === naics)
    || benchmarks.find(b => naics.startsWith(b.naics));
  if (!bench) return { low: null, high: null, basis: `no revenue-per-employee benchmark for NAICS ${naics}` };

  const reviews = Number(c.reviews);
  if (!Number.isFinite(reviews) || !rules.length) {
    return { low: null, high: null, basis: 'no employee signal (review count missing or no proxy table)' };
  }
  let rule: EmployeeRule | null = null;
  for (const r of rules) if (reviews >= r.minReviews) rule = r;
  if (!rule) return { low: null, high: null, basis: `review count ${reviews} below the lowest proxy band` };

  return {
    low: rule.low * bench.revenuePerEmployee,
    high: rule.high * bench.revenuePerEmployee,
    basis: `${reviews} reviews → ${rule.low}–${rule.high} employees (review-count proxy, screen.md — an assumption, not a measurement)`
      + ` × $${bench.revenuePerEmployee.toLocaleString()} revenue/employee for NAICS ${bench.naics} (${bench.source})`,
  };
}

/* ── the screen (buy-box) and scoring ────────────────────────────────── */

export interface Screen {
  naics: string;
  states: string[];
  metros: string[];
  revenueMin: number;
  revenueMax: number;
  queries: string[];
}

export interface Scored {
  score: number;
  tier: 'A' | 'B' | 'C' | 'D';
  detail: string;
}

/**
 * Rank a candidate 0-100.
 *
 * Adapted, not copied, from the app's Stage 4 scorer. The app's version leaned
 * on fields that only existed because Haiku had read the company's website —
 * succession signals, certifications, recurring-revenue language, year founded.
 * None of those exist without an API call per candidate, and scoring a missing
 * signal as zero punishes every row equally, which is noise with extra steps.
 * So those weights are gone.
 *
 *   size 30 · quality 30 · geography 20 · risk 20
 *
 * AFFILIATION IS A GATE, NOT A WEIGHT. Being independent is not an achievement
 * that should float a sub-scale business up the list — it is the precondition
 * for being on the list at all. Scored as a bonus (the first cut of this) a
 * two-review shop with no website still cleared tier C on independence and
 * geography alone, which is exactly the row you do not want near the top.
 * So an already-owned business scores zero, and an unverified one takes a
 * visible discount rather than a free pass.
 */
export function score(c: Candidate, s: Screen, cls: Classification, rev: RevenueBand): Scored {
  if (cls.affiliation === 'affiliated') {
    return { score: 0, tier: 'D', detail: `already owned — ${cls.affiliatedTo} (${cls.evidence})` };
  }
  const parts: string[] = [];

  // Size (0-30) — the band against the buy-box, else reviews as a weak proxy.
  let size = 8;
  if (rev.low != null && rev.high != null) {
    const overlaps = rev.high >= s.revenueMin && rev.low <= s.revenueMax;
    const inside = rev.low >= s.revenueMin && rev.high <= s.revenueMax;
    size = inside ? 30 : overlaps ? 18 : 4;
    parts.push(`size ${size} ($${Math.round(rev.low / 1000)}k–$${Math.round(rev.high / 1000)}k band)`);
  } else {
    const r = Number(c.reviews);
    if (Number.isFinite(r)) size = r >= 200 ? 8 : r >= 20 ? 14 : 7;
    parts.push(`size ${size} (no band — review proxy only)`);
  }

  // Geography (0-20)
  let geo = 3;
  const st = (c.state || '').toUpperCase();
  const city = (c.city || '').toLowerCase();
  if (s.metros.length && s.metros.some(m => city === m.toLowerCase())) geo = 20;
  else if (s.states.length && st && s.states.includes(st)) geo = 16;
  parts.push(`geo ${geo}`);

  // Quality (0-30)
  let qual = 0;
  const rating = parseFloat(c.rating || '');
  const reviews = Number(c.reviews);
  if (Number.isFinite(rating)) qual += rating >= 4.5 ? 12 : rating >= 4.0 ? 8 : rating >= 3.5 ? 3 : 0;
  if (Number.isFinite(reviews)) qual += reviews >= 50 ? 10 : reviews >= 20 ? 7 : reviews >= 5 ? 3 : 0;
  if (c.website) qual += 8;
  qual = Math.min(30, qual);
  parts.push(`quality ${qual}`);

  // Risk (0-20, inverted — starts clean, loses points for what is missing)
  let risk = 20;
  if (Number.isFinite(rating) && rating < 3.5) risk -= 7;
  if (!c.website) risk -= 6;
  if (Number.isFinite(reviews) && reviews < 5) risk -= 5;
  if ((c.types || '').includes('permanently_closed')) risk -= 20;
  risk = Math.max(0, risk);
  parts.push(`risk ${risk}`);

  let total = size + geo + qual + risk;
  if (cls.affiliation === 'unknown') {
    total = Math.round(total * 0.85);
    parts.push('×0.85 unverified (no register to check against)');
  }
  return {
    score: total,
    tier: total >= 75 ? 'A' : total >= 55 ? 'B' : total >= 35 ? 'C' : 'D',
    detail: parts.join(' · '),
  };
}

/* ── CSV, because the list lives in a Google Sheet ───────────────────── */

/**
 * RFC4180-ish parse. Handles quoted fields containing commas, quotes and
 * newlines — which a Sheets export absolutely will contain the moment anyone
 * types a note with a comma in it.
 */
export function parseCsv(text: string): Candidate[] {
  const rows: string[][] = [];
  let row: string[] = [], field = '', quoted = false;
  const src = text.replace(/^﻿/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else field += ch;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  if (!rows.length) return [];

  const header = rows[0].map(h => h.trim());
  return rows.slice(1)
    .filter(r => r.some(v => v.trim() !== ''))
    .map(r => {
      const o: Candidate = {};
      header.forEach((h, i) => { if (h) o[h] = (r[i] ?? '').trim(); });
      return o;
    });
}

const esc = (v: string) => /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;

/**
 * Serialize, preserving every column the rows carry.
 *
 * `lead` comes first in the given order; anything else a row picked up — a
 * Notes column Paul added in the Sheet, a status he set by hand — follows,
 * because losing someone's manual work on a re-score is unforgivable and silent.
 */
export function toCsv(rows: Candidate[], lead: string[]): string {
  const extra: string[] = [];
  for (const r of rows) for (const k of Object.keys(r)) {
    if (!lead.includes(k) && !extra.includes(k)) extra.push(k);
  }
  const cols = [...lead, ...extra];
  const out = [cols.map(esc).join(',')];
  for (const r of rows) out.push(cols.map(c => esc(r[c] ?? '')).join(','));
  return out.join('\n') + '\n';
}

/** The columns this tool owns. Everything else in a row belongs to the user. */
export const COLUMNS = [
  'place_id', 'fetched_at', 'name', 'address', 'city', 'state', 'zip', 'phone', 'website',
  'rating', 'reviews', 'types', 'status',
  'affiliation', 'affiliated_to', 'affiliation_evidence',
  'revenue_low', 'revenue_high', 'revenue_basis',
  'score', 'tier', 'score_detail',
];

/* ── what you may keep, and what you are only borrowing ──────────────── */

/**
 * Google's content — name, contact details, rating, review count.
 *
 * The Maps Platform terms let you keep PLACE IDS indefinitely (an explicit
 * carve-out) but treat everything else as a temporary cache with a limited
 * window. A CSV that sits in a Google Sheet for a year is not a cache. So the
 * board separates the two: `place_id` and your own work persist, this list is
 * refreshable and expirable.
 *
 * Confirm the current window against the terms before you lean on a number —
 * they have changed before, and the app's own client header claims 24 hours
 * while never enforcing anything at all.
 */
export const PLACES_CONTENT = [
  'name', 'address', 'city', 'state', 'zip', 'phone', 'website',
  'rating', 'reviews', 'types', 'status',
];

/** Days since this row's Places content was fetched; null if never stamped. */
export function ageDays(row: Candidate, now: number): number | null {
  const t = Date.parse(row.fetched_at || '');
  if (!Number.isFinite(t)) return null;
  return Math.floor((now - t) / 86_400_000);
}

/**
 * Drop the vendor content, keep everything that is yours: the place ID, your
 * own columns, and the judgements you derived (affiliation, score) — those are
 * your analysis, not Google's data.
 */
export function forgetContent(row: Candidate): Candidate {
  const out: Candidate = { ...row };
  for (const k of PLACES_CONTENT) if (k in out) out[k] = '';
  out.fetched_at = '';
  return out;
}
