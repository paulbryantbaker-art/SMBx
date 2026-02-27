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

  // Schedule daily thesis scan at 6 AM UTC
  await (boss as any).schedule('thesis-daily-scan', '0 6 * * *', {}, {});
  await (boss as any).work('thesis-daily-scan', handleThesisDailyScan);
  console.log('Scheduled: thesis-daily-scan (daily 6 AM UTC)');

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
