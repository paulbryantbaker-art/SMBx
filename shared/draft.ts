/**
 * THE DRAFT'S STATE — one definition of "is this edit still live", read by
 * the server (listQueueDrafts), the client (readiness, PostCopy, DraftBlock)
 * and the studio's pull script, because three copies of this rule is how a
 * consumed edit comes back from the dead.
 *
 * The finding that forced it (review, 2026-08-19): an edit was stored with
 * no anchor to the plan text it edited, and "satisfied" was defined as
 * `edit === body` at read time. So: Paul edits P-1 to X → Cowork renders →
 * the plan is updated to X → import → edit == body, satisfied. A week later
 * the plan revises P-1 to Y → import → edit (X) != body (Y) → the slot flips
 * back to "edited · waiting on a render", the Copy button leads with the OLD
 * X, and pull-queue hands Cowork a superseded caption as a decision. A
 * consumed decision silently outranked newer content of record.
 *
 * The fix is the anchor: `copy_base` / `pages_base` record the plan text the
 * edit was made AGAINST (written only by updateQueueDraft). Then:
 *
 *   live        edit present, edit ≠ plan, plan == base   → Cowork renders from it
 *   satisfied   edit present, edit == plan                → the plan caught up
 *   superseded  edit present, edit ≠ plan, plan ≠ base    → the plan moved on
 *                                                            since the edit; the
 *                                                            edit is history, NOT
 *                                                            a decision
 *   (null)      no edit
 *
 * Only LIVE counts as "waiting on a render". A template pick is a standing
 * preference, not a waiting state — nothing in the app can know when Cowork
 * rendered it, so it never flips readiness; it is shown as a chip and handed
 * to the pull script.
 *
 * Comparisons are by CONTENT, not serialization: jsonb re-orders object keys
 * (n, note, text, label — by length then bytes) while a legacy row that was
 * double-encoded keeps the exporter's order (n, label, text, note), so
 * JSON.stringify(a) !== JSON.stringify(b) on identical pages. `pagesEqual`
 * compares the four fields; whitespace at the ends of a caption is not an
 * edit either.
 */

export interface DraftPage { n: number; label: string | null; text: string; note: string | null }

export type DraftState = 'live' | 'satisfied' | 'superseded' | null;

const norm = (s: string | null | undefined) => (s ?? '').trim();

export function copyDraftState(row: {
  copy_edit?: string | null; body?: string | null; copy_base?: string | null;
}): DraftState {
  if (row.copy_edit == null) return null;
  const edit = norm(row.copy_edit), plan = norm(row.body), base = norm(row.copy_base);
  if (edit === plan) return 'satisfied';
  // A row edited before copy_base existed has base == '' — treat as live only
  // if the plan is ALSO empty (nothing to have moved away from); otherwise we
  // cannot tell, and "superseded" is the safe reading (it never outranks plan).
  if (row.copy_base == null) return plan === '' ? 'live' : 'superseded';
  return plan === base ? 'live' : 'superseded';
}

export function pagesEqual(a: DraftPage[] | null | undefined, b: DraftPage[] | null | undefined): boolean {
  const x = a ?? [], y = b ?? [];
  if (x.length !== y.length) return false;
  for (let i = 0; i < x.length; i++) {
    const p = x[i], q = y[i];
    if (p.n !== q.n) return false;
    if (norm(p.label) !== norm(q.label)) return false;
    if (norm(p.text) !== norm(q.text)) return false;
    if (norm(p.note) !== norm(q.note)) return false;
  }
  return true;
}

export function pagesDraftState(row: {
  pages_edit?: DraftPage[] | null; pages?: DraftPage[] | null; pages_base?: DraftPage[] | null;
}): DraftState {
  if (row.pages_edit == null) return null;
  if (pagesEqual(row.pages_edit, row.pages)) return 'satisfied';
  if (row.pages_base == null) return (row.pages ?? []).length === 0 ? 'live' : 'superseded';
  return pagesEqual(row.pages, row.pages_base) ? 'live' : 'superseded';
}

/** True when something on the row is a decision Cowork has not rendered from. */
export function hasLiveDraft(row: Parameters<typeof copyDraftState>[0] & Parameters<typeof pagesDraftState>[0]): boolean {
  return copyDraftState(row) === 'live' || pagesDraftState(row) === 'live';
}
