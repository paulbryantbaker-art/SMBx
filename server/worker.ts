/**
 * Worker Service — pg-boss job queue processor for deliverable generation.
 *
 * Runs as a separate process alongside the web server.
 * On Railway: deploy as a Worker service (same repo, different start command).
 *
 * All generation logic lives in deliverableProcessor.ts — this file
 * only handles pg-boss lifecycle and job routing.
 */
import 'dotenv/config';
import { PgBoss } from 'pg-boss';
import { processDeliverable, type DeliverableJobData } from './services/deliverableProcessor.js';
import { runAllActiveTheses, detectNewListingMatches } from './services/thesisMatchingService.js';
import { refreshAllValuations } from './services/valuationRefreshService.js';
import { checkDealFreshness } from './services/dealFreshnessService.js';
import { runDailyAggregatorScan } from './services/aggregatorMonitorService.js';
import { batchEnrichTargets } from './services/websiteEnrichmentService.js';
import { runStage2, runStage3, runStage4, runWeeklyPortfolioRefresh, runMonthlyPortfolioExpansion } from './services/sourcingPipelineService.js';
import { sql } from './db.js';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

// ─── pg-boss setup ──────────────────────────────────────────

const boss = new (PgBoss as any)({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  retryLimit: 2,
  retryDelay: 5,
  expireInHours: 1,
  archiveCompletedAfterSeconds: 86400,
  deleteAfterDays: 7,
});

boss.on('error', (err: Error) => {
  console.error('pg-boss error:', err);
});

// ─── Job Handlers ───────────────────────────────────────────

async function handleGenerateDeliverable(job: { data: DeliverableJobData }) {
  await processDeliverable(job.data);
}

async function handleThesisDailyScan() {
  console.log('Running daily thesis scan...');
  const result = await runAllActiveTheses();
  console.log(`Thesis scan complete: ${result.thesesScanned} theses, ${result.totalNewMatches} new matches`);
}

async function handleListingMatchCheck(job: { data: { listingId: number } }) {
  const matchCount = await detectNewListingMatches(job.data.listingId);
  if (matchCount > 0) {
    console.log(`Listing ${job.data.listingId} matched ${matchCount} active theses`);
  }
}

// ─── Start worker ───────────────────────────────────────────

async function start() {
  console.log('Starting pg-boss worker...');
  await boss.start();
  console.log('pg-boss started');

  await (boss as any).work('generate-deliverable', { teamSize: 3, teamConcurrency: 1 }, handleGenerateDeliverable);
  await (boss as any).work('listing-match-check', { teamSize: 2, teamConcurrency: 1 }, handleListingMatchCheck);
  console.log('Registered job handlers: generate-deliverable, listing-match-check');

  // Sourcing pipeline stage handlers
  await (boss as any).work('sourcing-stage-2', { teamSize: 1, teamConcurrency: 1 }, async (job: { data: { portfolioId: number } }) => {
    console.log(`[worker] Running sourcing Stage 2 for portfolio ${job.data.portfolioId}`);
    await runStage2(job.data.portfolioId);
    console.log(`[worker] Sourcing Stage 2 complete for portfolio ${job.data.portfolioId}`);
  });
  await (boss as any).work('sourcing-stage-3', { teamSize: 1, teamConcurrency: 1 }, async (job: { data: { portfolioId: number } }) => {
    console.log(`[worker] Running sourcing Stage 3 for portfolio ${job.data.portfolioId}`);
    await runStage3(job.data.portfolioId);
    console.log(`[worker] Sourcing Stage 3 complete for portfolio ${job.data.portfolioId}`);
  });
  await (boss as any).work('sourcing-stage-4', { teamSize: 1, teamConcurrency: 1 }, async (job: { data: { portfolioId: number } }) => {
    console.log(`[worker] Running sourcing Stage 4 for portfolio ${job.data.portfolioId}`);
    await runStage4(job.data.portfolioId);
    console.log(`[worker] Sourcing Stage 4 complete for portfolio ${job.data.portfolioId}`);
  });
  console.log('Registered job handlers: sourcing-stage-2, sourcing-stage-3, sourcing-stage-4');

  // Schedule daily thesis scan at 6 AM UTC
  await (boss as any).schedule('thesis-daily-scan', '0 6 * * *', {}, {});
  await (boss as any).work('thesis-daily-scan', handleThesisDailyScan);
  console.log('Scheduled: thesis-daily-scan (daily 6 AM UTC)');

  // Quarterly ValueLens refresh — 1st day of every 3rd month at midnight UTC
  await (boss as any).schedule('valuelens_quarterly_refresh', '0 0 1 */3 *', {}, {});
  await (boss as any).work('valuelens_quarterly_refresh', async () => {
    console.log('[worker] Running quarterly ValueLens refresh...');
    const result = await refreshAllValuations();
    console.log(`[worker] ValueLens refresh: ${result.updated} updated, ${result.notifications} notifications`);
  });
  console.log('Scheduled: valuelens_quarterly_refresh (quarterly)');

  // Weekly freshness scan — Monday 7 AM UTC
  await (boss as any).schedule('weekly_freshness_scan', '0 7 * * 1', {}, {});
  await (boss as any).work('weekly_freshness_scan', async () => {
    console.log('[worker] Running weekly freshness scan...');
    const deals = await sql`
      SELECT id FROM deals
      WHERE status IN ('active', 'exploring', 'listed')
        AND financial_snapshot IS NOT NULL
    `;
    let staleTotal = 0;
    for (const deal of deals as any[]) {
      const result = await checkDealFreshness(deal.id).catch(() => ({ staleCount: 0 }));
      staleTotal += result.staleCount;
    }
    console.log(`[worker] Freshness scan: ${deals.length} deals checked, ${staleTotal} deliverables marked stale`);
  });
  console.log('Scheduled: weekly_freshness_scan (Monday 7 AM UTC)');

  // Weekly FRED rate monitoring — Wednesday 3 AM UTC
  await (boss as any).schedule('fred_rate_monitor', '0 3 * * 3', {}, {});
  await (boss as any).work('fred_rate_monitor', async () => {
    console.log('[worker] Running FRED rate monitor...');
    try {
      // Fetch current Prime rate from FRED API
      const fredUrl = 'https://api.stlouisfed.org/fred/series/observations?series_id=DPRIME&sort_order=desc&limit=1&api_key=DEMO_KEY&file_type=json';
      const resp = await fetch(fredUrl);
      if (!resp.ok) { console.log('[worker] FRED API unavailable, skipping'); return; }
      const data = await resp.json();
      const currentRate = parseFloat(data.observations?.[0]?.value || '0');
      if (!currentRate) return;

      // Check last stored rate
      const [lastRate] = await sql`
        SELECT value FROM system_settings WHERE key = 'fred_prime_rate' LIMIT 1
      `.catch(() => [null]);

      const prevRate = lastRate ? parseFloat(lastRate.value) : 0;

      // Update stored rate
      await sql`
        INSERT INTO system_settings (key, value, updated_at)
        VALUES ('fred_prime_rate', ${String(currentRate)}, NOW())
        ON CONFLICT (key) DO UPDATE SET value = ${String(currentRate)}, updated_at = NOW()
      `.catch(() => {});

      // If rate changed, notify buyer deals with SBA financing
      if (prevRate > 0 && Math.abs(currentRate - prevRate) >= 0.25) {
        const direction = currentRate > prevRate ? 'increased' : 'decreased';
        console.log(`[worker] Prime rate ${direction} from ${prevRate}% to ${currentRate}%`);

        const buyerDeals = await sql`
          SELECT d.id, d.user_id, d.business_name, d.ebitda, d.sde
          FROM deals d
          WHERE d.journey_type = 'buy' AND d.status = 'active'
            AND (d.financials->>'financing_type' = 'sba' OR d.current_gate IN ('B2', 'B3', 'B4', 'B5'))
        `.catch(() => []);

        for (const deal of buyerDeals as any[]) {
          const earnings = deal.ebitda || deal.sde || 0;
          if (earnings <= 0) continue;
          // Rough DSCR impact: 0.25% rate change affects annual debt service
          await sql`
            INSERT INTO notifications (user_id, deal_id, type, title, body, action_url, created_at)
            VALUES (${deal.user_id}, ${deal.id}, 'rate_change',
              ${'Prime rate ' + direction},
              ${'The Prime rate ' + direction + ' to ' + currentRate + '%. This may affect your SBA loan terms and buying power for ' + (deal.business_name || 'your deal') + '.'},
              '/chat', NOW())
          `.catch(() => {});
        }
        console.log(`[worker] Notified ${(buyerDeals as any[]).length} buyer deals of rate change`);
      } else {
        console.log(`[worker] Prime rate unchanged at ${currentRate}%`);
      }
    } catch (e: any) {
      console.error('[worker] FRED rate monitor error:', e.message);
    }
  });
  console.log('Scheduled: fred_rate_monitor (Wednesday 3 AM UTC)');

  // Daily aggregator scan — every day at 5 AM UTC
  await (boss as any).schedule('daily_aggregator_scan', '0 5 * * *', {}, {});
  await (boss as any).work('daily_aggregator_scan', async () => {
    console.log('[worker] Running daily aggregator scan...');
    const result = await runDailyAggregatorScan();
    console.log(`[worker] Aggregator scan: ${result.listingsScanned} scanned, ${result.newListings} new, ${result.matchedTheses} matches, ${result.notificationsSent} notifications`);
  });
  console.log('Scheduled: daily_aggregator_scan (daily 5 AM UTC)');

  // Website enrichment batch — every day at 8 AM UTC
  await (boss as any).schedule('daily_enrichment_batch', '0 8 * * *', {}, {});
  await (boss as any).work('daily_enrichment_batch', async () => {
    console.log('[worker] Running daily website enrichment batch...');
    const result = await batchEnrichTargets(20);
    console.log(`[worker] Enrichment batch: ${result.enriched} enriched, ${result.failed} failed`);
  });
  console.log('Scheduled: daily_enrichment_batch (daily 8 AM UTC)');

  // Weekly portfolio refresh — Wednesday 4 AM UTC
  await (boss as any).schedule('portfolio_weekly_refresh', '0 4 * * 3', {}, {});
  await (boss as any).work('portfolio_weekly_refresh', async () => {
    console.log('[worker] Running weekly portfolio refresh...');
    const result = await runWeeklyPortfolioRefresh();
    console.log(`[worker] Portfolio refresh: ${result.portfoliosRefreshed} portfolios, ${result.candidatesUpdated} candidates updated`);
  });
  console.log('Scheduled: portfolio_weekly_refresh (Wednesday 4 AM UTC)');

  // Monthly portfolio expansion — 1st of month 5 AM UTC
  await (boss as any).schedule('portfolio_monthly_expansion', '0 5 1 * *', {}, {});
  await (boss as any).work('portfolio_monthly_expansion', async () => {
    console.log('[worker] Running monthly portfolio expansion...');
    const result = await runMonthlyPortfolioExpansion();
    console.log(`[worker] Portfolio expansion: ${result.portfoliosExpanded} portfolios, ${result.newCandidates} new candidates`);
  });
  console.log('Scheduled: portfolio_monthly_expansion (1st of month 5 AM UTC)');

  console.log('Worker ready — listening for jobs');
}

start().catch((err) => {
  console.error('Worker startup error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received — shutting down worker');
  await boss.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received — shutting down worker');
  await boss.stop();
  process.exit(0);
});
