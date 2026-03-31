/**
 * Discovery Worker — pg-boss background jobs
 * Wraps each handler in try/catch so missing queues don't crash the server.
 */
import { PgBoss } from 'pg-boss';

let boss: InstanceType<typeof PgBoss> | null = null;

export async function startWorker(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.warn('[worker] DATABASE_URL not set — skipping worker init');
    return;
  }

  try {
    boss = new (PgBoss as any)({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    boss.on('error', () => {}); // Silence queue-not-found spam

    await boss.start();
    console.log('[worker] pg-boss started');

    // Register handlers — each wrapped so missing queues don't crash
    const register = async (name: string, handler: (job: any) => Promise<void>) => {
      try {
        await (boss as any).createQueue(name).catch(() => {});
        await boss!.work(name, handler);
        console.log(`[worker] Registered: ${name}`);
      } catch {
        // Queue doesn't exist or can't be created — skip silently
      }
    };

    await register('discovery-scan', async (job) => {
      const { runDiscoveryScan } = await import('../services/discoveryService.js');
      await runDiscoveryScan(job.data.thesisId);
    });

    await register('rescore-sale-readiness', async () => {
      const { rescoreAllTargets } = await import('../services/saleReadinessService.js');
      await rescoreAllTargets();
    });

    await register('quarterly-valuation-refresh', async () => {
      const { refreshAllValuations } = await import('../services/valuationRefreshService.js');
      await refreshAllValuations();
    });

    console.log('[worker] Init complete');
  } catch (err: any) {
    console.warn('[worker] Init failed (non-fatal):', err.message);
  }
}
