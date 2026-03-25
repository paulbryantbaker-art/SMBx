/**
 * Deal Freshness Service — Tracks financial data changes and marks deliverables stale.
 *
 * Phase 5: Living Documents
 * - Snapshots deal financials before updates
 * - Compares post-update financials to snapshot
 * - Marks deliverables stale when data changes >5%
 * - Archives old versions on regeneration
 */
import { sql } from '../db.js';

const TRACKED_FIELDS = ['revenue', 'sde', 'ebitda', 'asking_price'] as const;
const CHANGE_THRESHOLD = 0.05; // 5%

/**
 * Capture current deal financials as a snapshot (first-write wins for race protection).
 * Only writes if snapshot is null.
 */
export async function snapshotDealFinancials(dealId: number): Promise<void> {
  const [deal] = await sql`
    SELECT revenue, sde, ebitda, asking_price, financial_snapshot
    FROM deals WHERE id = ${dealId}
  `;
  if (!deal || deal.financial_snapshot) return;

  const snapshot: Record<string, number | null> = {};
  for (const field of TRACKED_FIELDS) {
    snapshot[field] = deal[field] != null ? Number(deal[field]) : null;
  }

  await sql`
    UPDATE deals SET financial_snapshot = ${JSON.stringify(snapshot)}::jsonb
    WHERE id = ${dealId} AND financial_snapshot IS NULL
  `;
}

/**
 * Compare current deal financials vs stored snapshot.
 * If any tracked field changed >5%, mark all complete deliverables as stale.
 * Updates the snapshot to current values.
 */
export async function checkDealFreshness(dealId: number): Promise<{ staleCount: number }> {
  const [deal] = await sql`
    SELECT revenue, sde, ebitda, asking_price, financial_snapshot
    FROM deals WHERE id = ${dealId}
  `;
  if (!deal || !deal.financial_snapshot) return { staleCount: 0 };

  const snapshot = typeof deal.financial_snapshot === 'string'
    ? JSON.parse(deal.financial_snapshot)
    : deal.financial_snapshot;

  const changes: string[] = [];
  for (const field of TRACKED_FIELDS) {
    const oldVal = snapshot[field] != null ? Number(snapshot[field]) : null;
    const newVal = deal[field] != null ? Number(deal[field]) : null;

    if (oldVal == null || newVal == null) continue;
    if (oldVal === 0) continue;

    const pctChange = Math.abs((newVal - oldVal) / oldVal);
    if (pctChange >= CHANGE_THRESHOLD) {
      const direction = newVal > oldVal ? 'increased' : 'decreased';
      changes.push(`${field} ${direction} by ${Math.round(pctChange * 100)}%`);
    }
  }

  if (changes.length === 0) return { staleCount: 0 };

  const reason = changes.join('; ');

  // Mark all complete deliverables as stale
  const result = await sql`
    UPDATE deliverables
    SET is_stale = true, stale_reason = ${reason}
    WHERE deal_id = ${dealId} AND status = 'complete' AND is_stale = false
  `;

  // Update snapshot to current values
  const newSnapshot: Record<string, number | null> = {};
  for (const field of TRACKED_FIELDS) {
    newSnapshot[field] = deal[field] != null ? Number(deal[field]) : null;
  }
  await sql`
    UPDATE deals SET financial_snapshot = ${JSON.stringify(newSnapshot)}::jsonb
    WHERE id = ${dealId}
  `;

  const staleCount = (result as any).count ?? 0;
  if (staleCount > 0) {
    console.log(`[freshness] Deal ${dealId}: ${staleCount} deliverables marked stale (${reason})`);
  }

  return { staleCount };
}

/**
 * Archive current version, bump version number, clear stale flags.
 * Call before re-queuing generation.
 */
export async function markDeliverableRefreshed(deliverableId: number): Promise<void> {
  const [del] = await sql`
    SELECT id, deal_id, content, version_number
    FROM deliverables WHERE id = ${deliverableId}
  `;
  if (!del) return;

  // Archive current version
  if (del.content) {
    await sql`
      INSERT INTO deliverable_versions (deliverable_id, version, content, change_summary, created_at)
      VALUES (${deliverableId}, ${del.version_number}, ${JSON.stringify(del.content)}::jsonb, 'Archived before regeneration', NOW())
      ON CONFLICT (deliverable_id, version) DO NOTHING
    `;
  }

  // Bump version, clear stale flags, capture current snapshot
  const [deal] = await sql`SELECT financial_snapshot FROM deals WHERE id = ${del.deal_id}`;
  await sql`
    UPDATE deliverables
    SET version_number = version_number + 1,
        is_stale = false,
        stale_reason = NULL,
        generated_from_snapshot = ${deal?.financial_snapshot ? JSON.stringify(deal.financial_snapshot) : null}::jsonb,
        last_regenerated_at = NOW()
    WHERE id = ${deliverableId}
  `;
}

/**
 * Get all stale deliverables for a deal (for prompt injection).
 */
export async function getStaleDeliverables(dealId: number): Promise<Array<{ id: number; name: string; stale_reason: string }>> {
  const rows = await sql`
    SELECT d.id, mi.name, d.stale_reason
    FROM deliverables d
    LEFT JOIN menu_items mi ON d.menu_item_id = mi.id
    WHERE d.deal_id = ${dealId} AND d.is_stale = true AND d.status = 'complete'
  `;
  return rows.map((r: any) => ({
    id: r.id,
    name: r.name || `Deliverable #${r.id}`,
    stale_reason: r.stale_reason || 'Financial data changed',
  }));
}
