import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { sessionMiddleware, passport, requireAuth } from './middleware/auth.js';
import { authRouter } from './routes/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ─── 1. Body parsing ───────────────────────────────────────
app.use(express.json());

// ─── 2. Session + Passport ─────────────────────────────────
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// ─── 3. API routes (public) ────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);

// ─── 3b. API routes (protected — everything else under /api)
app.use('/api', requireAuth);

// ─── 4. Static file serving ────────────────────────────────
const clientPath = path.resolve(__dirname, '../client');
app.use(express.static(clientPath));

// ─── 5. SPA catch-all (must be LAST) ──────────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
