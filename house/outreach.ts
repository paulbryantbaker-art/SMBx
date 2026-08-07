/**
 * house/outreach.ts — THE OUTREACH MACHINE'S PURE CORE (2026-08-07).
 *
 * Paul: "i need to be able to eventually build an automated marketing
 * machine!" — and the machine's first law is the same one the register import
 * and the citation audit run on: never a silent mis-read. A target expression
 * that queues the wrong person wastes the first impression on a Tier A
 * contact, which is the expensive error, so the two judgement-free but
 * mistake-prone jobs live here, pure and dependency-free, where they can be
 * tested without a database:
 *
 *   1. TARGET EXPRESSIONS. The plan's `target_records` column is written for
 *      a human reader: "REF-001 through REF-015; OPR-002", "All IND_SPONSOR
 *      and CAPITAL_EQUITY records", "IS-001, IS-004". parseTargets() turns
 *      one into typed selectors — explicit ids, numeric ranges, segment
 *      selectors — and reports what it could NOT read instead of dropping it.
 *
 *   2. TEMPLATE MERGE. Templates carry {merge_fields}. Some resolve from the
 *      register (first_name, firm, city); some are RESEARCH-DEPENDENT
 *      ({recent_fund_or_deal}) and no table can fill them. renderTemplate()
 *      merges what it knows and NAMES what it doesn't — the unresolved list
 *      is the reason the send button stays disabled until a human fills the
 *      gap. Auto-blanking a research field would send "congratulations on ."
 *      to a fund manager, which is worse than no email.
 *
 * THE LINE: nothing here sends anything. This file computes; the practitioner
 * presses send.
 */

/* ── target expressions ──────────────────────────────────────────────── */

export type TargetSelector =
  | { kind: 'id'; id: string }
  | { kind: 'range'; prefix: string; from: number; to: number }
  | { kind: 'segment'; segments: string[] }
  | { kind: 'unknown'; raw: string };

const ID_RE = /^([A-Z]{2,5})-(\d{1,4})$/;
/* "REF-001 through REF-015" / "REF-001 to REF-015" / "REF-001 – REF-015" —
   both endpoints must share a prefix or the range is nonsense and lands as
   unknown rather than as a guess. */
const RANGE_RE = /^([A-Z]{2,5})-(\d{1,4})\s*(?:through|to|thru|–|—|-)\s*([A-Z]{2,5})-(\d{1,4})$/i;
/* "All IND_SPONSOR records" / "All IND_SPONSOR and CAPITAL_EQUITY records" */
const SEGMENT_RE = /^all\s+(.+?)\s+records?$/i;

/** Split a target_records cell into selectors. Separators are ; and , EXCEPT
 *  commas inside a range phrase (there are none in the plan; ranges use
 *  "through"). Empty cell → []. */
export function parseTargets(cell: string | null | undefined): TargetSelector[] {
  if (!cell || !cell.trim()) return [];
  const out: TargetSelector[] = [];
  for (const rawTok of cell.split(/[;,]/)) {
    const tok = rawTok.trim();
    if (!tok) continue;
    const range = tok.match(RANGE_RE);
    if (range) {
      const [, p1, a, p2, b] = range;
      if (p1.toUpperCase() === p2.toUpperCase() && Number(a) <= Number(b)) {
        out.push({ kind: 'range', prefix: p1.toUpperCase(), from: Number(a), to: Number(b) });
      } else {
        out.push({ kind: 'unknown', raw: tok });
      }
      continue;
    }
    const id = tok.toUpperCase().match(ID_RE);
    if (id) { out.push({ kind: 'id', id: tok.toUpperCase() }); continue; }
    const seg = tok.match(SEGMENT_RE);
    if (seg) {
      const segments = seg[1].split(/\s+and\s+/i).map(s => s.trim().toUpperCase().replace(/\s+/g, '_')).filter(Boolean);
      out.push({ kind: 'segment', segments });
      continue;
    }
    out.push({ kind: 'unknown', raw: tok });
  }
  return out;
}

/** Expand a range selector into its ids, zero-padded to the plan's 3-digit
 *  convention ("REF-001"), capped so a typo ("1 through 9999") cannot flood
 *  the queue — beyond the cap the range collapses to unknown upstream. */
export const RANGE_CAP = 200;
export function expandRange(sel: { prefix: string; from: number; to: number }): string[] {
  if (sel.to - sel.from + 1 > RANGE_CAP) return [];
  const ids: string[] = [];
  for (let n = sel.from; n <= sel.to; n++) ids.push(`${sel.prefix}-${String(n).padStart(3, '0')}`);
  return ids;
}

/* ── template merge ──────────────────────────────────────────────────── */

export interface MergeContext {
  /** contact fields */
  first_name?: string | null;
  full_name?: string | null;
  title?: string | null;
  /** account fields */
  firm?: string | null;
  city?: string | null;
  state?: string | null;
  segment?: string | null;
  vertical?: string | null;
}

/** The context a touch can honestly fill from the register. Anything else in
 *  a template ({recent_fund_or_deal}, {specific_deal_reference}) is research
 *  the human supplies at send time. */
export function mergeContext(account: { firm?: string | null; hq_city?: string | null; hq_state?: string | null; segment?: string | null; trades?: string | null }, contact?: { name?: string | null; title?: string | null } | null): MergeContext {
  const name = (contact?.name || '').trim();
  return {
    first_name: name ? name.split(/\s+/)[0] : null,
    full_name: name || null,
    title: contact?.title || null,
    firm: account.firm || null,
    city: account.hq_city || null,
    state: account.hq_state || null,
    segment: account.segment || null,
    vertical: account.trades || null,
  };
}

const FIELD_RE = /\{([a-z0-9_]+)\}/gi;

/** The seed CSVs store newlines as the two characters `\` `n` (spreadsheet
 *  escaping). Real newlines pass through untouched. */
export function unescapeBody(s: string): string {
  return s.replace(/\\n/g, '\n');
}

export interface Rendered {
  subject: string;
  body: string;
  /** Field names the context could not fill — in template order, deduped.
   *  Non-empty means NOT SENDABLE until a human resolves them. */
  unresolved: string[];
}

export function renderTemplate(subject: string, body: string, ctx: MergeContext): Rendered {
  const unresolved: string[] = [];
  const fill = (s: string) => s.replace(FIELD_RE, (whole, field: string) => {
    const key = field.toLowerCase() as keyof MergeContext;
    const v = ctx[key];
    if (v != null && String(v).trim() !== '') return String(v);
    if (!unresolved.includes(field)) unresolved.push(field);
    return whole; // left in place, visibly
  });
  return { subject: fill(subject), body: fill(unescapeBody(body)), unresolved };
}

/** True when a rendered draft still carries any {field} — the send gate. */
export function hasUnresolved(text: string): boolean {
  FIELD_RE.lastIndex = 0;
  return FIELD_RE.test(text);
}
