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

// ─── Job Handler ────────────────────────────────────────────

async function handleGenerateDeliverable(job: { data: DeliverableJobData }) {
  await processDeliverable(job.data);
}

// ─── Start worker ───────────────────────────────────────────

async function start() {
  console.log('Starting pg-boss worker...');
  await boss.start();
  console.log('pg-boss started');

  await (boss as any).work('generate-deliverable', { teamSize: 3, teamConcurrency: 1 }, handleGenerateDeliverable);
  console.log('Registered job handlers: generate-deliverable');

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
