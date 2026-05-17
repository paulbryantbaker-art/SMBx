/**
 * Discovery Worker — pg-boss background jobs
 * Wraps each handler in try/catch so missing queues don't crash the server.
 */
import { PgBoss } from 'pg-boss';
import { createSql, getDatabaseUrl, shouldUseDatabaseSsl } from '../dbConfig.js';

let boss: InstanceType<typeof PgBoss> | null = null;

export async function startWorker(): Promise<void> {
  let dbUrl = '';
  try {
    dbUrl = getDatabaseUrl();
  } catch {
    console.warn('[worker] DATABASE_URL not set — skipping worker init');
    return;
  }

  try {
    boss = new (PgBoss as any)({
      connectionString: dbUrl,
      ssl: shouldUseDatabaseSsl(dbUrl) ? { rejectUnauthorized: false } : false,
    });

    boss!.on('error', () => {}); // Silence queue-not-found spam

    await boss!.start();
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

    await register('daily-metrics-aggregation', async () => {
      try {
        const metricsSql = createSql();

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateStr = yesterday.toISOString().split('T')[0];

        const [users] = await metricsSql`SELECT COUNT(*)::int as c FROM users WHERE created_at::date = ${dateStr}`;
        const [active] = await metricsSql`
          SELECT COUNT(DISTINCT user_id)::int as c FROM conversations
          WHERE updated_at::date = ${dateStr} AND user_id IS NOT NULL
        `;
        const [msgs] = await metricsSql`SELECT COUNT(*)::int as c FROM messages WHERE created_at::date = ${dateStr}`;
        const [delivs] = await metricsSql`SELECT COUNT(*)::int as c FROM deliverables WHERE created_at::date = ${dateStr}`;
        const [mrrExists] = await metricsSql`SELECT to_regclass('public.subscriptions') IS NOT NULL as exists`;
        const [mrr] = mrrExists.exists
          ? await metricsSql`
              SELECT COALESCE(SUM(CASE
                WHEN plan IN ('solo', 'starter') THEN 7900
                WHEN plan IN ('pro', 'professional') THEN 19900
                WHEN plan = 'team' THEN 49900
                WHEN plan = 'enterprise' THEN 250000
                ELSE 0
              END), 0)::bigint as mrr_cents FROM subscriptions WHERE status IN ('active', 'trialing')
            `
          : [{ mrr_cents: 0 }];
        const [errors] = await metricsSql`
          SELECT COUNT(*)::int as c FROM support_issues WHERE type = 'system_error' AND created_at::date = ${dateStr}
        `;

        await metricsSql`
          INSERT INTO daily_metrics (date, new_users, active_users, messages_sent, deliverables_generated, mrr_cents, errors)
          VALUES (${dateStr}, ${users.c}, ${active.c}, ${msgs.c}, ${delivs.c}, ${Number(mrr.mrr_cents)}, ${errors.c})
          ON CONFLICT (date) DO UPDATE SET
            new_users = EXCLUDED.new_users, active_users = EXCLUDED.active_users,
            messages_sent = EXCLUDED.messages_sent, deliverables_generated = EXCLUDED.deliverables_generated,
            mrr_cents = EXCLUDED.mrr_cents, errors = EXCLUDED.errors
        `;
        await metricsSql.end();
        console.log(`[worker] Daily metrics aggregated for ${dateStr}`);
      } catch (err: any) {
        console.error('[worker] Metrics aggregation failed:', err.message);
      }
    });

    // Schedule daily metrics at midnight UTC
    try {
      await boss!.schedule('daily-metrics-aggregation', '0 0 * * *', {}, { tz: 'UTC' });
      console.log('[worker] Scheduled: daily-metrics-aggregation (midnight UTC)');
    } catch { /* schedule may already exist */ }

    console.log('[worker] Init complete');
  } catch (err: any) {
    console.warn('[worker] Init failed (non-fatal):', err.message);
  }
}
