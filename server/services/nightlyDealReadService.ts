import { sql } from '../db.js';
import { getDealBriefForUser } from './yuliaBriefingService.js';

export interface NightlyReadResult {
  deals: number;
  refreshed: number;
  failures: number;
  skippedDeferred: number;
}

/**
 * Nightly: regenerate the deal brief + market-intelligence read for every ACTIVE,
 * NON-DEFERRED deal across all users and persist it (yulia_deal_briefs), so the
 * read is already current on next login (and within the next session — the client
 * pulls the fresh server brief on a fresh page load).
 *
 * A DEFERRED deal (disposition='deferred') is skipped entirely — Yulia does no
 * background reading on a deal the user has paused. A small concurrency cap keeps
 * the model API from being hammered.
 */
export async function refreshNightlyDealReads(): Promise<NightlyReadResult> {
  const res: NightlyReadResult = { deals: 0, refreshed: 0, failures: 0, skippedDeferred: 0 };

  const deferredRows = (await sql`
    SELECT COUNT(*)::int AS n FROM deals
    WHERE status = 'active' AND COALESCE(disposition, 'active') = 'deferred'
  `) as Array<{ n: number }>;
  res.skippedDeferred = Number(deferredRows[0]?.n ?? 0);

  const rows = (await sql`
    SELECT user_id, id AS deal_id FROM deals
    WHERE status = 'active' AND COALESCE(disposition, 'active') <> 'deferred'
    ORDER BY user_id, id
  `) as Array<{ user_id: number; deal_id: number }>;
  res.deals = rows.length;

  const CONCURRENCY = 2; // gentle on the model API; the job has all night
  for (let i = 0; i < rows.length; i += CONCURRENCY) {
    const batch = rows.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (r) => {
        try {
          // forceRefresh: regenerate the read + market-intel even if the cached
          // brief looks fresh — that's the point of the nightly update.
          await getDealBriefForUser(r.user_id, r.deal_id, true);
          res.refreshed++;
        } catch (err: any) {
          res.failures++;
          console.error(`[nightly-read] user ${r.user_id} deal ${r.deal_id}: ${err?.message || err}`);
        }
      }),
    );
  }

  return res;
}
