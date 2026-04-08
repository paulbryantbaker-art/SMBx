import 'dotenv/config';
import express from 'express';
import path from 'path';
import postgres from 'postgres';
import { fileURLToPath } from 'url';
import { requireAuth } from './middleware/auth.js';
import { authRouter } from './routes/auth.js';
import { chatRouter } from './routes/chat.js';
import { anonymousRouter } from './routes/anonymous.js';
import { stripeRouter, handleStripeWebhook } from './routes/stripe.js';
import { deliverablesRouter } from './routes/deliverables.js';
import { dataRoomRouter } from './routes/dataRoom.js';
import { collaborationRouter } from './routes/collaboration.js';
import { pipelineRouter } from './routes/pipeline.js';
import { notificationRouter } from './routes/notifications.js';
import { intelligenceRouter } from './routes/intelligence.js';
import { sourcingRouter } from './routes/sourcing.js';
import { shareLinksRouter } from './routes/shareLinks.js';
import { deepDataRouter } from './routes/deepData.js';
import { gtmRouter } from './routes/gtm.js';
import { flywheelRouter } from './routes/flywheel.js';
import { searchRouter } from './routes/search.js';
import { providerRouter } from './routes/providers.js';
import { franchiseRouter } from './routes/franchise.js';
import { sellerDashboardRouter } from './routes/sellerDashboard.js';
import { buyerPipelineRouter } from './routes/buyerPipeline.js';
import { discoveryRouter } from './routes/discovery.js';
import { adminRouter } from './routes/admin.js';
import { passkeyRouter } from './routes/passkeys.js';

import { exportRouter } from './routes/export.js';
import { startWorker } from './workers/discoveryWorker.js';
import rateLimit from 'express-rate-limit';
import type { Request, Response, NextFunction } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Rate limiters ──────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later' },
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 messages per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages, please slow down' },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

// ─── Startup checks ─────────────────────────────────────────
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('WARNING: ANTHROPIC_API_KEY not set — AI chat will fail');
}

(async () => {
  try {
    const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', prepare: false });
    const result = await sql`SELECT 1 as ok`;
    console.log('DB connected:', result[0]?.ok === 1 ? 'OK' : 'unexpected');
    await sql.end();
  } catch (err: any) {
    console.error('DB connection failed:', err.message);
  }
})();

// ─── 0. Trust proxy (Railway) ───────────────────────────────
app.set('trust proxy', 1);

// ─── 1. Stripe webhook (raw body — MUST be before json parser) ──
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// ─── 2. Body parsing ───────────────────────────────────────
app.use(express.json());

// ─── 2. API routes (public) ────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/config', (_req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || null,
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
  });
});

app.get('/api/debug/check-ai', async (_req, res) => {
  const checks: Record<string, any> = {};

  checks.apiKeySet = !!process.env.ANTHROPIC_API_KEY;
  checks.apiKeyPrefix = process.env.ANTHROPIC_API_KEY
    ? process.env.ANTHROPIC_API_KEY.substring(0, 10) + '...'
    : 'NOT SET';

  try {
    const testSql = postgres(process.env.DATABASE_URL!, { ssl: 'require', prepare: false });
    const result = await testSql`SELECT COUNT(*)::int as count FROM conversations`;
    checks.dbConnected = true;
    checks.conversationCount = result[0]?.count;

    const cols = await testSql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'conversations' AND column_name = 'session_id'
    `;
    checks.sessionIdColumnExists = cols.length > 0;
    await testSql.end();
  } catch (e: any) {
    checks.dbError = e.message;
  }

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 50,
        messages: [{ role: 'user', content: 'Say hello in 5 words' }],
      });
      checks.anthropicWorking = true;
      checks.testResponse = response.content[0]?.type === 'text'
        ? (response.content[0] as any).text
        : 'non-text';
    } catch (e: any) {
      checks.anthropicError = e.message;
      checks.anthropicStatus = e.status;
      checks.anthropicBody = JSON.stringify(e.error || e.body || {}).substring(0, 300);
    }
  }

  res.json(checks);
});

app.use('/api/auth', authLimiter, authRouter);
app.use('/api/chat/anonymous', chatLimiter, anonymousRouter);
app.use('/api/chat', chatLimiter, chatRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api', shareLinksRouter); // has both public (/shared/:token) and protected routes

// ─── Public document share viewer (no auth — token-based) ────────
app.get('/api/shared/doc/:token', async (req, res) => {
  try {
    const { trackShareView } = await import('./services/documentShareService.js');
    const { token } = req.params;
    const viewerIp = req.ip || req.headers['x-forwarded-for'] as string;

    const { share, content, allowed, reason } = await trackShareView(token, undefined, viewerIp);

    if (!allowed) {
      return res.status(share ? 403 : 404).json({ error: reason });
    }

    // Return share metadata + content for rendering
    return res.json({
      accessLevel: share.access_level,
      authRequired: share.auth_required,
      downloadEnabled: share.download_enabled,
      watermark: share.watermark,
      dealName: share.deal_name,
      recipientName: share.recipient_name,
      docName: content?.name || 'Document',
      docClass: content?.doc_class,
      // Content for rendering
      content: content?.content || null,
      tiptapContent: content?.tiptap_content || null,
      fileType: content?.file_type || null,
      slug: content?.slug || null,
    });
  } catch (err: any) {
    console.error('Shared doc view error:', err.message);
    return res.status(500).json({ error: 'Failed to load shared document' });
  }
});

// ─── Public info endpoints (no auth) for invitations and day passes ─
app.get('/api/invitations/:token/info', async (req, res) => {
  try {
    const dbSql = (await import('./db.js')).sql;
    const { token } = req.params;
    const [inv] = await dbSql`
      SELECT di.deal_id, di.email, di.role, di.access_level, di.expires_at, di.accepted_at,
             u.display_name as inviter_name,
             d.name as deal_name
      FROM deal_invitations di
      JOIN users u ON u.id = di.invited_by
      JOIN deals d ON d.id = di.deal_id
      WHERE di.token = ${token}
    `;
    if (!inv) return res.status(404).json({ error: 'Invitation not found' });
    return res.json({
      dealName: inv.deal_name || 'Untitled Deal',
      inviterName: inv.inviter_name || 'Someone',
      role: inv.role,
      accessLevel: inv.access_level,
      expiresAt: inv.expires_at,
      accepted: !!inv.accepted_at,
      expired: new Date(inv.expires_at) < new Date(),
    });
  } catch (err: any) {
    console.error('Invitation info error:', err.message);
    return res.status(500).json({ error: 'Failed to get invitation info' });
  }
});

app.get('/api/day-pass/:token/info', async (req, res) => {
  try {
    const dbSql = (await import('./db.js')).sql;
    const { token } = req.params;
    const [pass] = await dbSql`
      SELECT dp.deal_id, dp.role, dp.access_level, dp.first_accessed_at, dp.expires_at, dp.revoked_at,
             d.name as deal_name
      FROM day_passes dp
      JOIN deals d ON d.id = dp.deal_id
      WHERE dp.token = ${token}
    `;
    if (!pass) return res.status(404).json({ error: 'Day pass not found' });
    return res.json({
      dealName: pass.deal_name || 'Untitled Deal',
      role: pass.role,
      accessLevel: pass.access_level,
      activated: !!pass.first_accessed_at,
      expiresAt: pass.expires_at,
      revoked: !!pass.revoked_at,
      expired: pass.first_accessed_at && new Date(pass.expires_at) < new Date(),
    });
  } catch (err: any) {
    console.error('Day pass info error:', err.message);
    return res.status(500).json({ error: 'Failed to get day pass info' });
  }
});

// ─── 3. API routes (protected — everything else under /api) ─
app.use('/api', apiLimiter, requireAuth);
app.use('/api', deliverablesRouter);
app.use('/api', dataRoomRouter);
app.use('/api', collaborationRouter);
app.use('/api', pipelineRouter);
app.use('/api', notificationRouter);
app.use('/api', intelligenceRouter);
app.use('/api', sourcingRouter);
app.use('/api', deepDataRouter);
app.use('/api', gtmRouter);
app.use('/api', flywheelRouter);
app.use('/api', searchRouter);
app.use('/api', providerRouter);
app.use('/api', franchiseRouter);
app.use('/api', sellerDashboardRouter);
app.use('/api', buyerPipelineRouter);
app.use('/api', discoveryRouter);
app.use('/api', adminRouter);
app.use('/api', passkeyRouter);

app.use('/api', exportRouter);

// ─── 4. JSON error handler for API routes ──────────────────
app.use('/api', (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('API error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ─── 5. Static file serving ────────────────────────────────
const clientPath = path.resolve(__dirname, '../client');
app.use('/assets', express.static(path.join(clientPath, 'assets'), { maxAge: '1y', immutable: true }));
app.use(express.static(clientPath, { maxAge: 0 }));

// ─── 5b. Support: client-side error capture (no auth required) ──
// Analytics event capture (no auth required — uses sendBeacon)
app.post('/api/analytics/event', express.json(), async (req, res) => {
  try {
    const { event_type, event_data, session_id, token } = req.body;
    if (!event_type) return res.json({ ok: false });

    // Extract userId from token if present
    let userId: number | null = null;
    if (token) {
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || process.env.SESSION_SECRET || 'dev') as any;
        userId = decoded.userId || null;
      } catch { /* invalid token — log as anonymous */ }
    }

    // Capture IP for geo resolution in admin traffic view
    const ip = req.ip || (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || null;

    const eventSql = postgres(process.env.DATABASE_URL!, { ssl: process.env.NODE_ENV === 'production' ? 'require' : false as any, prepare: false });
    await eventSql`
      INSERT INTO analytics_events (user_id, session_id, event_type, event_data, ip_address)
      VALUES (${userId}, ${session_id || null}, ${event_type}, ${JSON.stringify(event_data || {})}::jsonb, ${ip}::inet)
    `;
    await eventSql.end();
    res.json({ ok: true });
  } catch {
    res.json({ ok: false });
  }
});

app.post('/api/support/client-error', express.json(), async (req, res) => {
  try {
    const supportSql = postgres(process.env.DATABASE_URL!, { ssl: process.env.NODE_ENV === 'production' ? 'require' : false as any, prepare: false });
    await supportSql`
      INSERT INTO support_issues (type, severity, title, description, context)
      VALUES (
        'system_error', 'major',
        ${`Client error: ${(req.body.message || 'Unknown').substring(0, 100)}`},
        ${req.body.stack || req.body.message || 'No details'},
        ${JSON.stringify({
          componentStack: req.body.componentStack,
          url: req.body.url,
          viewport: req.body.viewport,
          userAgent: req.body.userAgent,
          timestamp: new Date().toISOString(),
        })}::jsonb
      )
    `;
    await supportSql.end();
    res.json({ ok: true });
  } catch {
    res.json({ ok: false });
  }
});

// ─── 6. SPA catch-all (must be LAST) ──────────────────────
app.get('*', (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(clientPath, 'index.html'));
});

// ─── 7. Global error handler — auto-logs to support_issues ──
app.use((err: any, req: any, res: any, _next: any) => {
  console.error('Unhandled error:', err.message || err);
  try {
    const errorSql = postgres(process.env.DATABASE_URL!, { ssl: process.env.NODE_ENV === 'production' ? 'require' : false as any, prepare: false });
    errorSql`
      INSERT INTO support_issues (user_id, type, severity, title, description, context)
      VALUES (
        ${req.userId || null},
        'system_error', 'critical',
        ${`Server error: ${(err.message || 'Unknown').substring(0, 100)}`},
        ${err.stack || err.message || 'No stack trace'},
        ${JSON.stringify({ path: req.path, method: req.method, timestamp: new Date().toISOString() })}::jsonb
      )
    `.then(() => errorSql.end()).catch(() => {});
  } catch { /* don't let logging crash the error handler */ }
  if (!res.headersSent) {
    res.status(500).json({ error: 'Something went wrong. Yulia has logged the issue.' });
  }
});

// ─── Auto-run migrations on startup ─────────────────────────
async function runMigrations() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: process.env.NODE_ENV === 'production' ? 'require' : false as any, prepare: false });
  try {
    // Create tracking table if needed
    await sql`CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT NOW())`;

    // Read all migration files
    const fs = await import('fs');
    const migrationDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');
    if (!fs.existsSync(migrationDir)) { console.log('[migrations] No migrations directory found'); return; }

    const files = fs.readdirSync(migrationDir).filter((f: string) => f.endsWith('.sql')).sort();
    const [applied] = [await sql`SELECT name FROM _migrations`];
    const appliedSet = new Set((applied as any[]).map(r => r.name));

    let ran = 0;
    for (const file of files) {
      if (appliedSet.has(file)) continue;
      const content = fs.readFileSync(path.join(migrationDir, file), 'utf-8');
      try {
        await sql.unsafe(content);
        await sql`INSERT INTO _migrations (name) VALUES (${file})`;
        console.log(`[migrations] Applied: ${file}`);
        ran++;
      } catch (err: any) {
        console.error(`[migrations] Failed: ${file} — ${err.message}`);
        // Don't block startup — log and continue
      }
    }
    if (ran === 0) console.log('[migrations] All up to date');
    else console.log(`[migrations] Applied ${ran} new migrations`);
  } catch (err: any) {
    console.error('[migrations] Error:', err.message);
  } finally {
    await sql.end();
  }
}

runMigrations().then(async () => {
  // Post-migration: ensure critical schema and admin account exist
  const bootSql = postgres(process.env.DATABASE_URL!, { ssl: process.env.NODE_ENV === 'production' ? 'require' : false as any, prepare: false });
  try {
    await bootSql`ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ`;
    await bootSql`
      INSERT INTO users (email, password, display_name, role, trial_ends_at)
      VALUES ('pbaker@smbx.ai', '$2b$10$mNL0ykJmWlbqzVCzLM4w4.KuHpAkezdSQSzEN6F2x/tKrKL9fqYFW', 'Paul Baker', 'admin', NOW() + INTERVAL '90 days')
      ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = 'admin'
    `;
    console.log('[boot] Admin account verified');
  } catch (err: any) {
    console.error('[boot] Admin account check failed:', err.message);
  } finally {
    await bootSql.end();
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startWorker().catch(err => console.warn('[worker] Init skipped:', err.message));
  });
});
