/**
 * Discovery Worker — pg-boss background jobs
 * Sessions 13-15: Discovery scanning, sale-readiness scoring, valuation refresh
 */
import PgBoss from 'pg-boss';
import { runDiscoveryScan } from '../services/discoveryService.js';
import { rescoreAllTargets } from '../services/saleReadinessService.js';
import { refreshAllValuations } from '../services/valuationRefreshService.js';

let boss: PgBoss | null = null;

/**
 * Initialize pg-boss and register job handlers.
 * Call this on server startup.
 */
export async function startWorker(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.warn('[worker] DATABASE_URL not set — skipping worker init');
    return;
  }

  try {
    boss = new PgBoss({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    boss.on('error', (err) => console.error('[worker] pg-boss error:', err));

    await boss.start();
    console.log('[worker] pg-boss started');

    // ─── Register job handlers ─────────────────────

    // Discovery scan — triggered by API
    await boss.work('discovery-scan', async (job: any) => {
      const { thesisId } = job.data;
      console.log(`[worker] Running discovery scan for thesis ${thesisId}`);
      await runDiscoveryScan(thesisId);
    });

    // Sale-readiness re-scoring — weekly
    await boss.work('rescore-sale-readiness', async () => {
      console.log('[worker] Running weekly sale-readiness re-scoring');
      const result = await rescoreAllTargets();
      console.log(`[worker] Re-scored ${result.scored} profiles`);
    });

    // Quarterly valuation refresh
    await boss.work('quarterly-valuation-refresh', async () => {
      console.log('[worker] Running quarterly valuation refresh');
      const result = await refreshAllValuations();
      console.log(`[worker] Updated ${result.updated} valuations, ${result.notifications} notifications`);
    });

    // ─── Schedule recurring jobs ───────────────────

    // Weekly sale-readiness re-scoring (Sundays at 3am)
    await boss.schedule('rescore-sale-readiness', '0 3 * * 0', {});

    // Quarterly valuation refresh (1st of Jan/Apr/Jul/Oct at 9am)
    await boss.schedule('quarterly-valuation-refresh', '0 9 1 */3 *', {});

    console.log('[worker] Job handlers registered, schedules set');
  } catch (err: any) {
    console.error('[worker] Failed to start pg-boss:', err.message);
    // Non-fatal — server continues without background jobs
  }
}

/**
 * Enqueue a discovery scan job.
 */
export async function enqueueDiscoveryScan(thesisId: number): Promise<string | null> {
  if (!boss) return null;
  return boss.send('discovery-scan', { thesisId });
}

/**
 * Stop the worker gracefully.
 */
export async function stopWorker(): Promise<void> {
  if (boss) {
    await boss.stop();
    boss = null;
  }
}
