/**
 * Worker Service — pg-boss job queue processor for deliverable generation.
 *
 * Runs as a separate process alongside the web server.
 * On Railway: deploy as a Worker service (same repo, different start command).
 *
 * Jobs:
 * - generate-deliverable: AI-powered document generation
 * - extract-document: Financial document extraction
 * - score-seven-factors: Seven-factor business scoring
 */
import 'dotenv/config';
import PgBoss from 'pg-boss';
import { sql } from './db.js';
import { callClaude } from './services/aiService.js';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

// ─── pg-boss setup ──────────────────────────────────────────

const boss = new PgBoss({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  retryLimit: 2,
  retryDelay: 5,       // seconds
  expireInHours: 1,
  archiveCompletedAfterSeconds: 86400, // 24 hours
  deleteAfterDays: 7,
});

boss.on('error', (err) => {
  console.error('pg-boss error:', err);
});

// ─── Job Handlers ───────────────────────────────────────────

interface GenerateDeliverableJob {
  deliverableId: number;
  dealId: number;
  userId: number;
  menuItemSlug: string;
  deliverableType: string;
}

async function handleGenerateDeliverable(job: PgBoss.Job<GenerateDeliverableJob>) {
  const { deliverableId, dealId, userId, menuItemSlug, deliverableType } = job.data;
  console.log(`Generating deliverable ${deliverableId}: ${menuItemSlug}`);

  const startTime = Date.now();

  try {
    // Mark as generating
    await sql`UPDATE deliverables SET status = 'generating' WHERE id = ${deliverableId}`;

    // Get deal context
    const [deal] = await sql`SELECT * FROM deals WHERE id = ${dealId}`;
    if (!deal) throw new Error(`Deal ${dealId} not found`);

    // Get menu item for generation instructions
    const [menuItem] = await sql`SELECT * FROM menu_items WHERE slug = ${menuItemSlug}`;

    // Build generation prompt
    const systemPrompt = buildGenerationPrompt(deal, menuItem, deliverableType);
    const userPrompt = `Generate the ${deliverableType} deliverable for this deal. Use all available deal data. Output as structured JSON.`;

    // Generate with Claude
    const content = await callClaude(systemPrompt, [{ role: 'user', content: userPrompt }]);

    // Parse and store
    let parsedContent: Record<string, any>;
    try {
      const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
      parsedContent = JSON.parse(cleaned);
    } catch {
      parsedContent = { raw_text: content, format: 'text' };
    }

    const generationTime = Date.now() - startTime;

    await sql`
      UPDATE deliverables
      SET status = 'complete',
          content = ${JSON.stringify(parsedContent)}::jsonb,
          generation_model = 'claude-sonnet-4-5-20250929',
          generation_time_ms = ${generationTime},
          completed_at = NOW()
      WHERE id = ${deliverableId}
    `;

    console.log(`Deliverable ${deliverableId} complete (${generationTime}ms)`);
  } catch (err: any) {
    console.error(`Deliverable ${deliverableId} failed:`, err.message);
    await sql`
      UPDATE deliverables
      SET status = 'failed',
          content = ${JSON.stringify({ error: err.message })}::jsonb
      WHERE id = ${deliverableId}
    `;
    throw err; // pg-boss will retry
  }
}

function buildGenerationPrompt(deal: any, menuItem: any, deliverableType: string): string {
  const dealContext = [
    deal.business_name && `Business: ${deal.business_name}`,
    deal.industry && `Industry: ${deal.industry}`,
    deal.location && `Location: ${deal.location}`,
    deal.revenue && `Revenue: $${(deal.revenue / 100).toLocaleString()}`,
    deal.sde && `SDE: $${(deal.sde / 100).toLocaleString()}`,
    deal.ebitda && `EBITDA: $${(deal.ebitda / 100).toLocaleString()}`,
    deal.league && `League: ${deal.league}`,
    deal.journey_type && `Journey: ${deal.journey_type}`,
    deal.current_gate && `Gate: ${deal.current_gate}`,
  ].filter(Boolean).join('\n');

  const financials = deal.financials ? JSON.stringify(deal.financials, null, 2) : 'None provided';

  return `You are a deliverable generation engine for smbx.ai. Generate professional M&A work product.

## DELIVERABLE TYPE: ${deliverableType}
${menuItem?.description || ''}

## DEAL CONTEXT
${dealContext}

## EXTENDED FINANCIALS
${financials}

## RULES
- Use ONLY the data provided — never invent numbers
- Format output as structured JSON suitable for rendering
- Be thorough and professional — this is a paid deliverable
- Include all relevant sections based on the deliverable type
- Financial amounts should be in dollars (display format)
- Include caveats where data is insufficient

Output format: JSON with sections as keys, each section containing 'title' and 'content' fields.`;
}

// ─── Start worker ───────────────────────────────────────────

async function start() {
  console.log('Starting pg-boss worker...');
  await boss.start();
  console.log('pg-boss started');

  // Register handlers
  await boss.work('generate-deliverable', { teamSize: 3, teamConcurrency: 1 }, handleGenerateDeliverable);
  console.log('Registered job handlers: generate-deliverable');

  console.log('Worker ready — listening for jobs');
}

start().catch((err) => {
  console.error('Worker startup error:', err);
  process.exit(1);
});

// ─── Queue helper (used by web server to enqueue jobs) ──────

export async function enqueueDeliverable(data: GenerateDeliverableJob): Promise<string | null> {
  const jobId = await boss.send('generate-deliverable', data);
  return jobId;
}

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
