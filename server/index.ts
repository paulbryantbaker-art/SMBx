import 'dotenv/config';
import express from 'express';
import path from 'path';
import postgres from 'postgres';
import { fileURLToPath } from 'url';
import { requireAuth } from './middleware/auth.js';
import { authRouter } from './routes/auth.js';
import { chatRouter } from './routes/chat.js';
import type { Request, Response, NextFunction } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Startup DB test ────────────────────────────────────────
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

// ─── 1. Body parsing ───────────────────────────────────────
app.use(express.json());

// ─── 2. API routes (public) ────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/test-db', async (_req, res) => {
  try {
    const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', prepare: false });
    const users = await sql`SELECT id, email, display_name FROM users`;
    await sql.end();
    res.json({ success: true, users });
  } catch (error: any) {
    res.json({ success: false, error: error.message, stack: error.stack });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);

// ─── 3. API routes (protected — everything else under /api) ─
app.use('/api', requireAuth);

// ─── 4. JSON error handler for API routes ──────────────────
app.use('/api', (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('API error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ─── 5. Static file serving ────────────────────────────────
const clientPath = path.resolve(__dirname, '../client');
app.use(express.static(clientPath));

// ─── 6. SPA catch-all (must be LAST) ──────────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
