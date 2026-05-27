/**
 * Job Queue Client — Enqueues jobs for the pg-boss worker.
 * Used by the web server to dispatch deliverable generation.
 */
import { PgBoss } from 'pg-boss';
import { getDatabaseUrl, shouldUseDatabaseSsl } from '../dbConfig.js';

let boss: any = null;
const ensuredQueues = new Set<string>();

async function getBoss(): Promise<any> {
  if (!boss) {
    const dbUrl = getDatabaseUrl();

    boss = new (PgBoss as any)({
      connectionString: dbUrl,
      ssl: shouldUseDatabaseSsl(dbUrl) ? { rejectUnauthorized: false } : false,
      noScheduling: true,
      noSupervisor: true,
    });

    await boss.start();
  }
  return boss;
}

async function ensureQueue(queue: any, name: string): Promise<void> {
  if (ensuredQueues.has(name)) return;

  try {
    await queue.createQueue(name);
  } catch (err: any) {
    const message = String(err?.message || '');
    if (!/already exists|duplicate key|exists/i.test(message)) {
      throw err;
    }
  }

  ensuredQueues.add(name);
}

export interface DeliverableJobData {
  deliverableId: number;
  dealId: number;
  userId: number;
  menuItemSlug: string;
  deliverableType: string;
  modelPreference?: string;
}

/** Enqueue a deliverable generation job */
export async function enqueueDeliverableGeneration(data: DeliverableJobData): Promise<string | null> {
  const queue = await getBoss();
  await ensureQueue(queue, 'generate-deliverable');
  return queue.send('generate-deliverable', data) as Promise<string | null>;
}

/** Check job status */
export async function getJobStatus(jobId: string): Promise<string | null> {
  const queue = await getBoss();
  await ensureQueue(queue, 'generate-deliverable');
  const job = await queue.getJobById('generate-deliverable', jobId);
  return job?.state ?? null;
}

// ─── Sourcing Pipeline Jobs ─────────────────────────────────────────

export interface PipelineStageData {
  portfolioId: number;
  stage: number; // 2, 3, or 4
}

/** Enqueue a sourcing pipeline stage (2=expansion, 3=enrichment, 4=scoring) */
export async function enqueuePipelineStage(portfolioId: number, stage: number): Promise<string | null> {
  const queue = await getBoss();
  await ensureQueue(queue, `sourcing-stage-${stage}`);
  const data: PipelineStageData = { portfolioId, stage };
  return queue.send(`sourcing-stage-${stage}`, data, {
    retryLimit: 1,
    retryDelay: 60,
    expireInMinutes: 30,
  }) as Promise<string | null>;
}

/** Graceful shutdown */
export async function stopQueue(): Promise<void> {
  if (boss) {
    await boss.stop();
    boss = null;
  }
}
