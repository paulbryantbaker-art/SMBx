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

app.use('/api/auth', authLimiter, authRouter);
app.use('/api/chat/anonymous', chatLimiter, anonymousRouter);
app.use('/api/chat', chatLimiter, chatRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api', shareLinksRouter); // has both public (/shared/:token) and protected routes

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

// ─── 4. JSON error handler for API routes ──────────────────
app.use('/api', (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('API error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ─── 5. Static file serving ────────────────────────────────
const clientPath = path.resolve(__dirname, '../client');
app.use('/assets', express.static(path.join(clientPath, 'assets'), { maxAge: '1y', immutable: true }));
app.use(express.static(clientPath, { maxAge: 0 }));

// ─── 6. SPA catch-all (must be LAST) ──────────────────────
app.get('*', (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(clientPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
