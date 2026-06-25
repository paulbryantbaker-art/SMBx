/**
 * In-session deal-brief cache (module-level, per dealId).
 *
 * Why: opening a deal re-mounts the cockpit, which re-fetched the brief every
 * time — so Yulia appeared to "re-read" the deal on every open within a session.
 * This read-through cache serves the already-fetched brief instantly on re-open,
 * killing both the redundant round-trip AND the "Reading the deal…" flash.
 *
 * The SERVER still owns real freshness (yulia_deal_briefs, 72h TTL + a stable
 * source fingerprint + stale-while-revalidate). This cache only spans the current
 * session (cleared on full page reload), so a fresh login always pulls the latest
 * (e.g. the nightly refresh). `clearDealBrief(dealId)` invalidates one deal after
 * an in-session change (Yulia ran analysis, a rename/defer, etc.) so the next open
 * re-fetches once — not on every open.
 */
const cache = new Map<number, unknown>();

export function getCachedDealBrief<T = unknown>(dealId: number): T | null {
  return (cache.get(dealId) as T | undefined) ?? null;
}

export function setCachedDealBrief(dealId: number, brief: unknown): void {
  cache.set(dealId, brief);
}

/** Drop a deal's cached brief (or all) so the next open re-fetches it. */
export function clearDealBrief(dealId?: number): void {
  if (dealId == null) cache.clear();
  else cache.delete(dealId);
}
