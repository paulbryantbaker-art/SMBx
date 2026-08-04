import './loadEnv.js'; // must be first: loads .env + backfills empty ambient vars
import express from 'express';
import path from 'path';
import postgres from 'postgres';
import { fileURLToPath } from 'url';
import { optionalAuth, requireAuth } from './middleware/auth.js';
import { practiceModeEnabled, practicePerimeter, retiredSurface, mothballedAgentSurface } from './services/practiceMode.js';
import { authRouter } from './routes/auth.js';
import { canvasTabsRouter } from './routes/canvasTabs.js';
import { docViewsRouter } from './routes/docViews.js';
import { chatRouter } from './routes/chat.js';
import { anonymousRouter } from './routes/anonymous.js';
import { stripeRouter, handleStripeWebhook } from './routes/stripe.js';
import { deliverablesRouter } from './routes/deliverables.js';
import { pmiPlanRouter } from './routes/pmiPlan.js';
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
import { nextActionsRouter } from './routes/nextActions.js';
import { buyerPipelineRouter } from './routes/buyerPipeline.js';
import { dealBuyersRouter } from './routes/dealBuyers.js';
import { dealOffersRouter } from './routes/dealOffers.js';
import { advisorMandatesRouter } from './routes/advisorMandates.js';
import { discoveryRouter } from './routes/discovery.js';
import { adminRouter } from './routes/admin.js';
import { passkeyRouter } from './routes/passkeys.js';
import { agencyActionsRouter } from './routes/agencyActions.js';
import { analysisRunsRouter } from './routes/analysisRuns.js';
import { modelExecutionsRouter } from './routes/modelExecutions.js';
import { portfolioBriefRouter } from './routes/portfolioBrief.js';
import { studioRouter } from './routes/studio.js';
import { researchRouter } from './routes/research.js';
import { crmRouter } from './routes/crm.js';
import { dealTasksRouter } from './routes/dealTasks.js';
import { startResearchScheduler } from './services/researchAgent.js';
import { startOwnerDigestScheduler } from './services/ownerDigest.js';
import { v19ResourcesRouter } from './routes/v19Resources.js';
import { createSql, getDatabaseUrl, getPostgresOptions } from './dbConfig.js';

import { exportRouter } from './routes/export.js';
import { startWorker } from './workers/discoveryWorker.js';
import { buildAgentCard } from './services/agentCard.js';
import { buildDefinitiveSpecManifest } from './services/definitiveSpecManifest.js';
import {
  buildDefinitiveMcpServerCard,
  buildDefinitiveMcpWellKnownManifest,
} from './services/definitiveMcpDiscovery.js';
import { getDefinitivePassThroughSurface } from './services/definitiveDealMechanicsCatalog.js';
import { getDefinitiveAuthoritySeedPlan } from './services/definitiveAuthoritySeedPlan.js';
import { getDefinitiveSubstrateArchitecturePlan } from './services/definitiveSubstrateArchitecturePlan.js';
import {
  buildDefinitiveEnterpriseAllowListTemplates,
  buildDefinitiveRegistryPackage,
} from './services/definitiveRegistryPackage.js';
import { buildDefinitiveConnectorDistributionPackage } from './services/definitiveConnectorDistribution.js';
import { buildDefinitiveAssistantDistributionReadiness } from './services/definitiveAssistantDistributionReadiness.js';
import {
  buildDefinitiveGptActionsOpenApiSpec,
  buildDefinitiveOpenApiSpec,
} from './services/definitiveOpenApiSpec.js';
import {
  buildDefinitiveMcpServerJson,
  DEFINITIVE_REMOTE_MCP_PROTOCOL_VERSION,
  handleDefinitiveRemoteMcpPost,
} from './services/definitiveRemoteMcpTransport.js';
import {
  buildDefinitiveMcpProtectedResourceMetadata,
  buildDefinitiveOAuthAuthorizationServerMetadata,
} from './services/definitiveMcpAuthMetadata.js';
import {
  confirmDefinitiveOAuthAuthorization,
  exchangeDefinitiveOAuthCode,
  registerDefinitiveOAuthClient,
  renderDefinitiveOAuthAuthorizePage,
} from './services/definitiveMcpOAuth.js';
import {
  buildDefinitiveModelCatalogSurface,
  getDefinitiveModelSlotSurface,
} from './services/definitiveModelCatalogSurface.js';
import {
  buildDefinitiveDealRunbooksSurface,
  getDefinitiveDealRunbook,
} from './services/definitiveDealRunbooks.js';
import { buildDefinitiveSchemaRegistry, getDefinitiveSchema } from './services/definitiveSchemas.js';
import { ensureModelRegistrySeeded } from './services/modelRegistry.js';
import rateLimit from 'express-rate-limit';
import * as ownerFunnel from './services/ownerFunnel.js';
import * as ownerFullEval from './services/ownerFullEval.js';
import type { Request, Response, NextFunction } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Rate limiters ──────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // credential attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later' },
  // Limit CREDENTIAL endpoints only (login/register/google/password flows —
  // the brute-force surface). /me is the session check fired on EVERY app
  // load: counting it locked real users out of Google sign-in after a few
  // page loads ("too many attempts" with zero failed logins). /logout
  // likewise must never be refusable. (req.path here is relative to the
  // /api/auth mount.)
  skip: (req) => req.path === '/me' || req.path === '/logout',
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

const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 12, // lead submissions per window per IP — humans, not scripts
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions, please try again later' },
});

const intakeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 40, // intake turns per window per IP (~6 full conversations)
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages, please try again in a little while' },
});

const mapPdfLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 6, // each render spins a Chromium page — humans re-download rarely
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many downloads, please try again in a little while' },
});

const ownerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // lane reads + auth + one evaluation per visit fits well inside
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again in a little while' },
});

const ownerEvaluateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 4, // each evaluation renders a Chromium PDF and sends an email
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many evaluations, please try again in a little while' },
});

// ─── Startup checks ─────────────────────────────────────────
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('WARNING: ANTHROPIC_API_KEY not set — AI chat will fail');
}

function assertProductionBillingSafety(): void {
  if (process.env.NODE_ENV !== 'production') return;

  const unsafeBypasses = ['TEST_MODE', 'DEV_NO_PAYWALL'].filter(name => process.env[name] === 'true');
  if (unsafeBypasses.length > 0) {
    throw new Error(`Unsafe production billing bypass enabled: ${unsafeBypasses.join(', ')}. Set these to false before deploy.`);
  }

  const testStripeKeys = [
    ['STRIPE_SECRET_KEY', 'sk_test_'],
    ['STRIPE_PUBLISHABLE_KEY', 'pk_test_'],
  ].filter(([name, prefix]) => (process.env[name] || '').startsWith(prefix));

  if (testStripeKeys.length > 0) {
    throw new Error(`Stripe test key configured in production: ${testStripeKeys.map(([name]) => name).join(', ')}. Use live keys before taking paid traffic.`);
  }
}

assertProductionBillingSafety();

(async () => {
  try {
    const sql = createSql();
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
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false }));

// ─── 2a. Practice perimeter (THE LINE v2) ──────────────────
// Any request bearing a JWT for a non-team identity is rejected — covers /api
// and /mcp alike, including pre-pivot accounts and external agent keys.
// Tokenless requests fall through to each route's own auth.
app.use(practicePerimeter);

// ─── 2b. Mothballed external agent surface (2026-07-11) ────
// /mcp transport, agent/MCP discovery, MCP OAuth, and public spec/OpenAPI
// endpoints return 410 in practice mode — disabled, not deleted.
app.use(mothballedAgentSurface);

// ─── 2. API routes (public) ────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/config', (_req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || null,
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
    practiceMode: practiceModeEnabled(),
  });
});

// ─── Practice-site lead capture (public, rate-limited) ─────
// The corpdevservices landing persists every intake (Yulia chat or form) as
// a lead even if the visitor never books, and pings the practitioner.
async function savePracticeLead(input: {
  persona?: unknown; thesis?: unknown; size?: unknown; email?: unknown; source?: unknown;
}): Promise<boolean> {
  const clean = (v: unknown, max: number) =>
    typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null;
  const lead = {
    persona: clean(input.persona, 200),
    thesis: clean(input.thesis, 2000),
    size: clean(input.size, 500),
    email: clean(input.email, 320),
    source: clean(input.source, 100) || 'landing',
  };
  if (!lead.thesis && !lead.email) return false;
  const { sql } = await import('./db.js');
  await sql`
    INSERT INTO practice_leads (persona, thesis, size_geo, email, source)
    VALUES (${lead.persona}, ${lead.thesis}, ${lead.size}, ${lead.email}, ${lead.source})
  `;
  // Fire-and-forget: tell the practitioner a lead landed.
  import('./services/emailService.js')
    .then(async ({ sendEmail }) => {
      const { teamAllowlist } = await import('./services/practiceMode.js');
      const to = teamAllowlist()[0];
      if (!to) return;
      const esc = (v: string | null) =>
        (v || '—').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      await sendEmail({
        to,
        subject: `New practice lead${lead.email ? `: ${lead.email}` : ''} (${lead.source})`,
        html: `<div style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.6">
          <p><b>New lead from the practice site.</b></p>
          <p>Persona: ${esc(lead.persona)}<br/>
          Thesis: ${esc(lead.thesis)}<br/>
          Size/geo: ${esc(lead.size)}<br/>
          Email: ${esc(lead.email)}<br/>
          Source: ${esc(lead.source)}</p>
        </div>`,
      });
    })
    .catch(() => { /* notification is best-effort; the lead row is saved */ });
  return true;
}

app.post('/api/practice/leads', leadLimiter, async (req, res) => {
  try {
    const ok = await savePracticeLead(req.body || {});
    if (!ok) return res.status(400).json({ error: 'Nothing to save' });
    return res.status(201).json({ ok: true });
  } catch (err: any) {
    console.error('[practice-leads] save failed:', err.message);
    return res.status(500).json({ error: 'Failed to save' });
  }
});

// ─── The free owner evaluation (/owners funnel) ──────────────────────────
// Public seller-facing surface (SELLER_EVALUATION_PLAN.md). Sits above the
// blanket requireAuth like the other funnel routes. Identity is the walled
// `smbx_owner` funnel pass — never a users row, so the practice perimeter
// needs no carve-out. Financial figures pass through ownerEvaluate() to the
// pure engine and are NEVER persisted or logged; migration 117's schema has
// no columns that could hold them.
app.post('/api/owners/google', ownerLimiter, ownerFunnel.ownerGoogle);
app.post('/api/owners/magic', ownerLimiter, ownerFunnel.ownerMagicRequest);
app.get('/api/owners/verify', ownerLimiter, ownerFunnel.ownerMagicVerify);
app.get('/api/owners/me', ownerLimiter, ownerFunnel.ownerMe);
app.get('/api/owners/lane-read', ownerLimiter, ownerFunnel.ownerLaneRead);
app.post('/api/owners/lead', ownerLimiter, ownerFunnel.ownerLead);
app.post('/api/owners/evaluate', ownerEvaluateLimiter, ownerFunnel.ownerEvaluate);
app.post('/api/owners/retention', ownerLimiter, ownerFunnel.ownerRetention);

// P2 — the FULL evaluation workspace (owner_evaluations, migration 119).
// Same `smbx_owner` funnel pass; storage here is the EXPLICITLY CONSENTED
// second tier: /consent records the versioned terms acceptance before any
// row exists, /answers bodies are never logged, /delete is the delete-
// anytime right. The report leg runs V19 models in memory only (no
// persistV19ModelExecution) — the row keeps answers + the finished PDF.
app.get('/api/owners/full/state', ownerLimiter, ownerFullEval.fullEvalState);
app.post('/api/owners/full/consent', ownerLimiter, ownerFullEval.fullEvalConsent);
app.post('/api/owners/full/answers', ownerLimiter, ownerFullEval.fullEvalAnswers);
app.post('/api/owners/full/checklist', ownerLimiter, ownerFullEval.fullEvalChecklist);
// Report renders a Chromium PDF + sends an email — same budget as /evaluate.
app.post('/api/owners/full/report', ownerEvaluateLimiter, ownerFullEval.fullEvalReport);
app.post('/api/owners/full/delete', ownerLimiter, ownerFullEval.fullEvalDelete);

// ─── Research report downloads — verified email required ────
// The reports READ free at /reports/:slug; the PDF requires a confirmed email
// (Paul, 2026-07-29: "anybody can read the blog, but you must be signed in to
// download it"). Practice mode restricts real accounts to the team allowlist,
// so a literal login would let nobody but the team download — this is the
// equivalent that works for an outside acquirer. See services/reportAccess.ts.
// All three routes sit above the blanket `app.use('/api', requireAuth)`.

// 1. "Get the PDF" → the report is MAILED to the address given, attached, with
//    a link in the body (Paul, 2026-07-29: "enter the email and have a button
//    get the PDF, and the PDF is delivered to that email — that solves both
//    problems"). Nothing is released to the browser here: delivery to an inbox
//    is itself the verification, since a fake address never receives it.
app.post('/api/practice/reports/access', leadLimiter, async (req, res) => {
  try {
    const { email, slug } = req.body || {};
    const { issueAccess } = await import('./services/reportAccess.js');
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const ip = req.ip || (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || null;
    const out = await issueAccess({ email, slug, appUrl, ip });
    if (!out.ok) {
      return res.status(400).json({
        error: out.reason === 'invalid_email' ? 'That email looks incomplete.' : 'Unknown report.',
      });
    }
    // `emailed: false` means the mail transport is unconfigured and the link
    // was only logged. Surfaced so the UI never points at an inbox nothing was
    // sent to — with confirmation required, a silent mail failure is a dead end.
    return res.json({ ok: true, emailed: out.emailed !== false });
  } catch (err: any) {
    console.error('[report-access] issue failed:', err.message);
    return res.status(500).json({ error: 'Could not send the link just now.' });
  }
});

// 2. The link in the email. Confirms the address, then hands the browser a
//    signed reader cookie good for every report, not just this one.
//
//    Registered under BOTH /research and /reports. The reports path is not
//    legacy decoration here: every link already sitting in somebody's inbox
//    points at it, and unlike a page URL it cannot be answered with a redirect
//    without the token surviving the hop. Keeping the handler on both paths is
//    simpler than trusting that, and it must be registered BEFORE the
//    /reports/:slug redirect below, which would otherwise never match anyway
//    (Express matches the two-segment path exactly) but ordering makes it
//    impossible to break by accident later.
const unlockReport: import('express').RequestHandler = async (req, res) => {
  const slug = String(req.params.slug || '');
  try {
    const { verifyToken, mintReaderToken, readerCookieOptions, READER_COOKIE, READER_HINT_COOKIE } =
      await import('./services/reportAccess.js');
    const out = await verifyToken(String(req.query.t || ''));
    if (!out.ok || !out.email) {
      return res.redirect(302, `/research/${encodeURIComponent(slug)}?unlock=${out.reason || 'bad_token'}`);
    }
    const opts = readerCookieOptions();
    res.cookie(READER_COOKIE, mintReaderToken(out.email), opts);
    // Readable companion so the page shows the unlocked state with no round
    // trip. It grants nothing; the HttpOnly cookie above is the credential.
    res.cookie(READER_HINT_COOKIE, '1', { ...opts, httpOnly: false });
    return res.redirect(302, `/research/${encodeURIComponent(out.slug || slug)}?dl=1`);
  } catch (err: any) {
    console.error('[report-access] verify failed:', err.message);
    return res.redirect(302, `/research/${encodeURIComponent(slug)}?unlock=error`);
  }
};
app.get('/research/:slug/unlock', unlockReport);
app.get('/reports/:slug/unlock', unlockReport);

// 2b. "Ask about this report" — grounded question answering, public and
//     ungated for the same reason the report body is: the read is the proof.
//     Rate-limited on the intake limiter's shape because it is the same kind
//     of surface (a stranger, a model call, money per turn). Mounted here,
//     above the blanket `/api` auth, alongside the other two.
app.post('/api/practice/reports/:slug/ask', intakeLimiter, async (req, res) => {
  try {
    const { askReport } = await import('./services/reportQA.js');
    const out = await askReport({
      slug: String(req.params.slug || ''),
      question: req.body?.question,
      history: Array.isArray(req.body?.history) ? req.body.history : [],
    });
    if (out.ok) return res.json({ ok: true, answer: out.answer });
    if (out.reason === 'unknown_report') return res.status(404).json({ error: 'Unknown report' });
    if (out.reason === 'empty') return res.status(400).json({ error: 'Ask a question first.' });
    // no_source / unavailable are OUR failure, and the honest answer is to say
    // so rather than let the panel imply the report has nothing on it.
    return res.status(503).json({ error: "The agent can't reach the report just now." });
  } catch (err: any) {
    console.error('[report-qa] route failed:', err.message);
    return res.status(503).json({ error: "The agent can't reach the report just now." });
  }
});

// 3. The file itself. Released to a verified reader, or to a team member
//    holding an app JWT (practicePerimeter above has already 403'd any
//    non-team token, so a valid one here is the team).
app.get('/api/practice/reports/:slug/file', async (req, res) => {
  try {
    const { readerFromCookie, reportPdfPath, recordDownload } =
      await import('./services/reportAccess.js');
    const { findReport } = await import('../shared/reports.js');

    const report = findReport(String(req.params.slug || ''));
    if (!report) return res.status(404).json({ error: 'Unknown report' });

    let who = readerFromCookie(req.headers.cookie);
    if (!who) {
      const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
      if (bearer) {
        try {
          const jwtLib = await import('jsonwebtoken');
          jwtLib.default.verify(bearer, process.env.JWT_SECRET || process.env.SESSION_SECRET || 'dev');
          who = 'team';
        } catch { /* fall through to the 401 */ }
      }
    }
    if (!who) return res.status(401).json({ error: 'Confirm your email to download this report.' });

    const file = reportPdfPath(report.slug);
    if (!file) {
      console.error(`[report-access] PDF missing on disk for ${report.slug}`);
      return res.status(404).json({ error: 'That file is not available right now.' });
    }

    if (who !== 'team') void recordDownload(who, report.slug);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${report.slug}.pdf"`);
    res.setHeader('Cache-Control', 'private, no-store');
    return res.sendFile(file);
  } catch (err: any) {
    console.error('[report-access] download failed:', err.message);
    return res.status(500).json({ error: 'Could not fetch the file.' });
  }
});

// ─── Unsubscribe (public) ───────────────────────────────────
// A campaign list is only usable if opting out actually works. The token is
// derived from the address, so every link ever sent stays valid and one click
// clears every row for that person.
app.get('/unsubscribe', async (req, res) => {
  try {
    const { unsubscribeEmail } = await import('./services/reportAccess.js');
    const ok = await unsubscribeEmail(String(req.query.e || ''), String(req.query.t || ''));
    const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const msg = ok
      ? { h: "You're unsubscribed.", p: `We won't send research to ${esc(String(req.query.e || ''))} again. Anything you already asked for still reaches you.` }
      : { h: 'That link didn\'t work.', p: 'It may be malformed. Reply to any email from us and we\'ll remove you by hand.' };
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(`<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribe — smbX.ai</title></head>
<body style="margin:0;background:#FCFAF6;color:#16181A;font-family:-apple-system,'Segoe UI',sans-serif">
<div style="max-width:520px;margin:0 auto;padding:88px 24px">
  <div style="font-family:Georgia,serif;font-size:28px;line-height:1.2;font-weight:600">${msg.h}</div>
  <p style="margin:16px 0 28px;font-size:16px;line-height:1.65;color:#3F464C">${msg.p}</p>
  <a href="/" style="display:inline-block;background:#0A7A58;color:#fff;text-decoration:none;padding:13px 26px;border-radius:999px;font-size:15px;font-weight:600">Back to smbX.ai</a>
</div></body></html>`);
  } catch (err: any) {
    console.error('[unsubscribe] failed:', err.message);
    return res.status(500).send('Something went wrong. Reply to any email from us and we will remove you by hand.');
  }
});

// ─── Analytics event capture (public — sendBeacon, no auth) ─
// Moved above the blanket `app.use('/api', requireAuth)` mount: it previously
// sat below it, so ANONYMOUS visitors' events 401'd and were silently dropped
// (sendBeacon never surfaces errors) — exactly the funnel traffic that
// matters. Found by the conversion-plan Phase 1 smoke.
app.post('/api/analytics/event', async (req, res) => {
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

    const eventSql = createSql();
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

// ─── Practice-site Yulia intake (public, Claude-backed) ────
// Each call carries the whole short conversation; the service closes
// deterministically (and we persist the lead) the moment an email appears.
app.post('/api/practice/intake', intakeLimiter, async (req, res) => {
  try {
    const { runPracticeIntake } = await import('./services/practiceIntake.js');
    const result = await runPracticeIntake(req.body?.messages);
    if (!result) return res.status(400).json({ error: 'Invalid conversation' });
    if (result.lead) {
      // Lead persistence must never block the visitor-facing close message.
      savePracticeLead({ ...result.lead, source: 'landing-yulia' })
        .catch(err => console.error('[practice-intake] lead save failed:', err.message));
    }
    return res.json({ reply: result.reply, done: result.done, map: result.map });
  } catch (err: any) {
    console.error('[practice-intake] failed:', err.message);
    return res.status(500).json({ error: 'Intake unavailable' });
  }
});

// ─── Streaming intake (SSE over POST) ───────────────────────
// The Market Map assembles in front of the visitor as the model actually
// writes it — the reveal is real work made legible, never a staged spinner.
// Events: `delta` {t} raw text chunks, then `final` {reply, done, map}.
// The client falls back to the JSON endpoint above if this transport fails.
app.post('/api/practice/intake/stream', intakeLimiter, async (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders?.();
  const send = (event: string, data: unknown) => {
    if (!res.writableEnded) res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };
  // Heartbeat comments keep the connection visibly alive through proxies while
  // the model thinks between tokens — without them, an idle SSE connection can
  // be reaped mid-turn and the visitor's turn dies silently (Paul, 2026-07-16:
  // "the turn gets stuck"). The client's frame parser skips comment frames.
  const heartbeat = setInterval(() => {
    if (!res.writableEnded) res.write(': hb\n\n');
  }, 10_000);
  try {
    const { runPracticeIntakeStream } = await import('./services/practiceIntake.js');
    const result = await runPracticeIntakeStream(req.body?.messages, chunk => send('delta', { t: chunk }));
    if (!result) {
      send('error', { error: 'Invalid conversation' });
    } else {
      if (result.lead) {
        savePracticeLead({ ...result.lead, source: 'landing-yulia' })
          .catch(err => console.error('[practice-intake] lead save failed:', err.message));
      }
      send('final', { reply: result.reply, done: result.done, map: result.map });
    }
  } catch (err: any) {
    console.error('[practice-intake] stream failed:', err.message);
    send('error', { error: 'Intake unavailable' });
  } finally {
    clearInterval(heartbeat);
  }
  res.end();
});

// ─── Market Map PDF (public, tightly rate-limited) ──────────
// Built for the forward: the visitor downloads the preliminary read as a
// self-contained, dated, smbX-marked document. The client sends back the map
// it received; we re-validate every field and RECOMPOSE the trust strings
// (produces/sources/disclosure) server-side so they can never be tampered.
app.post('/api/practice/map-pdf', mapPdfLimiter, async (req, res) => {
  try {
    const raw = req.body?.map;
    const str = (v: unknown, max: number): string =>
      typeof v === 'string' ? v.trim().slice(0, max) : '';
    const rawFunnel = Array.isArray(raw?.funnel) ? raw.funnel.slice(0, 4) : [];
    const funnel = rawFunnel
      .map((s: unknown) => ({ n: str((s as any)?.n, 24) || '—', label: str((s as any)?.label, 220) }))
      .filter((s: { n: string; label: string }) => s.label);
    const { composeProduces, MAP_SOURCES } = await import('./services/practiceIntake.js');
    const map = {
      title: str(raw?.title, 120),
      thesis: str(raw?.thesis, 300),
      verdict: (raw?.verdict === 'PUSHBACK' ? 'PUSHBACK' : 'PROCEED') as 'PROCEED' | 'PUSHBACK',
      answer: str(raw?.answer, 500),
      funnel,
      econ: str(raw?.econ, 1000),
      comp: str(raw?.comp, 1000),
      insight: str(raw?.insight, 1200),
      kill: str(raw?.kill, 600),
      produces: '',
      sources: MAP_SOURCES,
    };
    map.produces = composeProduces(map);
    if (!map.title || !map.thesis || map.funnel.length < 3 || !map.insight) {
      return res.status(400).json({ error: 'Invalid map' });
    }
    const generatedAt = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const { renderPracticeMapPdf } = await import('./services/practiceMapPdf.js');
    const pdf = await renderPracticeMapPdf(map, generatedAt);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="smbX-market-map.pdf"',
      'Cache-Control': 'no-store',
    });
    return res.send(pdf);
  } catch (err: any) {
    console.error('[practice-map-pdf] failed:', err.message);
    return res.status(500).json({ error: 'PDF unavailable' });
  }
});

function discoveryOrigin(req: Request) {
  const configured = process.env.APP_URL?.replace(/\/+$/, '');
  if (configured) return configured;
  return `${req.protocol}://${req.get('host')}`;
}

function setWellKnownHeaders(res: Response) {
  res.set({
    'Cache-Control': 'public, max-age=300',
    'X-Content-Type-Options': 'nosniff',
  });
}

function setMcpHeaders(req: Request, res: Response) {
  res.set({
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'MCP-Protocol-Version': DEFINITIVE_REMOTE_MCP_PROTOCOL_VERSION,
  });
  const origin = req.get('origin');
  if (origin && isAllowedMcpOrigin(req, origin)) {
    res.set({
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept, MCP-Protocol-Version, Mcp-Session-Id, Last-Event-ID',
      'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
      'Access-Control-Expose-Headers': 'WWW-Authenticate, MCP-Protocol-Version',
      'Vary': 'Origin',
    });
  }
}

function isAllowedMcpOrigin(req: Request, origin: string) {
  try {
    const allowed = new Set<string>();
    const appUrl = process.env.APP_URL?.trim();
    if (appUrl) allowed.add(new URL(appUrl).origin);
    const requestOrigin = `${req.protocol}://${req.get('host')}`;
    allowed.add(new URL(requestOrigin).origin);
    for (const configured of String(process.env.MCP_ALLOWED_ORIGINS || '').split(',')) {
      const trimmed = configured.trim();
      if (trimmed) allowed.add(new URL(trimmed).origin);
    }
    if (/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(origin)) return true;
    return allowed.has(new URL(origin).origin);
  } catch {
    return false;
  }
}

function rejectBadMcpOrigin(req: Request, res: Response) {
  const origin = req.get('origin');
  if (!origin || isAllowedMcpOrigin(req, origin)) return false;
  setMcpHeaders(req, res);
  res.status(403).json({
    jsonrpc: '2.0',
    id: null,
    error: {
      code: -32004,
      message: 'Origin not allowed',
      data: { origin },
    },
  });
  return true;
}

app.get('/.well-known/agent-card.json', (_req, res) => {
  res.json(buildAgentCard());
});

app.get('/.well-known/definitive.json', (_req, res) => {
  res.json(buildDefinitiveSpecManifest());
});

app.get('/.well-known/definitive-schemas.json', (_req, res) => {
  setWellKnownHeaders(res);
  res.json(buildDefinitiveSchemaRegistry());
});

app.get('/.well-known/mcp/server-card.json', (req, res) => {
  setWellKnownHeaders(res);
  res.json(buildDefinitiveMcpServerCard(discoveryOrigin(req)));
});

app.get('/.well-known/mcp', (req, res) => {
  setWellKnownHeaders(res);
  res.json(buildDefinitiveMcpWellKnownManifest(discoveryOrigin(req)));
});

app.get('/server.json', (req, res) => {
  setWellKnownHeaders(res);
  res.json(buildDefinitiveMcpServerJson(discoveryOrigin(req)));
});

app.get('/.well-known/mcp/server.json', (req, res) => {
  setWellKnownHeaders(res);
  res.json(buildDefinitiveMcpServerJson(discoveryOrigin(req)));
});

app.get('/.well-known/oauth-protected-resource', (req, res) => {
  setWellKnownHeaders(res);
  res.json(buildDefinitiveMcpProtectedResourceMetadata(discoveryOrigin(req)));
});

app.get('/.well-known/oauth-protected-resource/mcp', (req, res) => {
  setWellKnownHeaders(res);
  res.json(buildDefinitiveMcpProtectedResourceMetadata(discoveryOrigin(req)));
});

app.get('/.well-known/oauth-authorization-server', (req, res) => {
  setWellKnownHeaders(res);
  res.json(buildDefinitiveOAuthAuthorizationServerMetadata(discoveryOrigin(req)));
});

app.get('/.well-known/openid-configuration', (req, res) => {
  setWellKnownHeaders(res);
  res.json(buildDefinitiveOAuthAuthorizationServerMetadata(discoveryOrigin(req)));
});

app.post('/oauth/register', async (req, res) => {
  const response = await registerDefinitiveOAuthClient(req.body || {}, discoveryOrigin(req));
  return res.status(response.status).json(response.body);
});

app.get('/oauth/authorize', (req, res) => {
  setWellKnownHeaders(res);
  res.type('html').send(renderDefinitiveOAuthAuthorizePage(req.query, discoveryOrigin(req)));
});

app.post('/oauth/authorize/confirm', requireAuth, async (req, res) => {
  const response = await confirmDefinitiveOAuthAuthorization(Number((req as any).userId), req.body || {}, discoveryOrigin(req));
  return res.status(response.status).json(response.body);
});

app.post('/oauth/token', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.set('Pragma', 'no-cache');
  const response = await exchangeDefinitiveOAuthCode(buildOAuthTokenRequestInput(req), discoveryOrigin(req));
  return res.status(response.status).json(response.body);
});

function buildOAuthTokenRequestInput(req: Request) {
  const input: Record<string, any> = { ...(req.body || {}) };
  const header = req.get('authorization') || '';
  if (header.toLowerCase().startsWith('basic ')) {
    try {
      const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
      const separator = decoded.indexOf(':');
      if (separator >= 0) {
        input.client_id ||= decodeURIComponent(decoded.slice(0, separator));
        input.client_secret ||= decodeURIComponent(decoded.slice(separator + 1));
      }
    } catch {
      // Malformed client authentication is handled by the OAuth service.
    }
  }
  return input;
}

app.options('/mcp', (req, res) => {
  setMcpHeaders(req, res);
  if (rejectBadMcpOrigin(req, res)) return;
  res.status(204).end();
});

app.get('/mcp', (req, res) => {
  setMcpHeaders(req, res);
  if (rejectBadMcpOrigin(req, res)) return;
  res.set('Allow', 'POST, OPTIONS');
  return res.status(405).json({
    jsonrpc: '2.0',
    id: null,
    error: {
      code: -32005,
      message: 'Server-initiated SSE stream is not enabled. Use POST /mcp for Streamable HTTP JSON-RPC.',
    },
  });
});

app.delete('/mcp', (req, res) => {
  setMcpHeaders(req, res);
  if (rejectBadMcpOrigin(req, res)) return;
  res.set('Allow', 'POST, OPTIONS');
  return res.status(405).json({
    jsonrpc: '2.0',
    id: null,
    error: {
      code: -32006,
      message: 'Stateless MCP sessions do not require DELETE termination.',
    },
  });
});

app.post('/mcp', optionalAuth, async (req, res) => {
  setMcpHeaders(req, res);
  if (rejectBadMcpOrigin(req, res)) return;
  const response = await handleDefinitiveRemoteMcpPost(req.body, {
    auth: {
      userId: (req as any).userId,
      claims: (req as any).authClaims,
      error: (req as any).authError, // { code: 'invalid_token', description: '...' } if token presented but invalid
    },
    headers: req.headers as Record<string, string | string[] | undefined>,
    origin: discoveryOrigin(req),
  });
  if (response.headers) res.set(response.headers);
  if (!response.body) return res.status(response.status).end();
  return res.status(response.status).json(response.body);
});

app.get('/api/agent-card', (_req, res) => {
  res.json(buildAgentCard());
});

app.get('/api/definitive/spec', (_req, res) => {
  res.json(buildDefinitiveSpecManifest());
});

app.get('/api/definitive/schemas', (_req, res) => {
  res.json(buildDefinitiveSchemaRegistry());
});

app.get('/api/definitive/schemas/:schemaName', (req, res) => {
  const schema = getDefinitiveSchema(req.params.schemaName);
  if (!schema) {
    return res.status(404).json({ ok: false, error: 'schema_not_found', schemaName: req.params.schemaName });
  }
  return res.json(schema);
});

app.get('/api/definitive/openapi.json', (req, res) => {
  setWellKnownHeaders(res);
  res.json(buildDefinitiveOpenApiSpec(discoveryOrigin(req)));
});

app.get('/api/definitive/gpt-actions/openapi.json', (req, res) => {
  setWellKnownHeaders(res);
  res.json(buildDefinitiveGptActionsOpenApiSpec(discoveryOrigin(req)));
});

app.get('/definitive/spec', (_req, res) => {
  res.json(buildDefinitiveSpecManifest());
});

app.get('/api/definitive/pass-through-catalog', (_req, res) => {
  res.json(getDefinitivePassThroughSurface());
});

app.get('/api/definitive/authority-seed-plan', (_req, res) => {
  res.json(getDefinitiveAuthoritySeedPlan());
});

app.get('/api/definitive/substrate-architecture', (_req, res) => {
  res.json(getDefinitiveSubstrateArchitecturePlan());
});

app.get('/api/definitive/model-catalog', (_req, res) => {
  res.json(buildDefinitiveModelCatalogSurface({ limit: _req.query.limit, cursor: _req.query.cursor }));
});

app.get('/api/definitive/deal-runbooks', (_req, res) => {
  res.json(buildDefinitiveDealRunbooksSurface({ limit: _req.query.limit, cursor: _req.query.cursor }));
});

app.get('/api/definitive/deal-runbooks/:journey', (req, res) => {
  const runbook = getDefinitiveDealRunbook(req.params.journey, { limit: req.query.limit, cursor: req.query.cursor });
  if (!runbook) {
    return res.status(404).json({ ok: false, error: 'definitive_deal_runbook_not_found', journey: req.params.journey });
  }
  return res.json(runbook);
});

app.get('/api/definitive/model-catalog/:slotId', (req, res) => {
  const model = getDefinitiveModelSlotSurface(req.params.slotId);
  if (!model) {
    return res.status(404).json({ ok: false, error: 'definitive_model_slot_not_found', slotId: req.params.slotId });
  }
  return res.json(model);
});

app.get('/api/definitive/deal-mechanics/models/:slotId', (req, res) => {
  const model = getDefinitiveModelSlotSurface(req.params.slotId);
  if (!model) {
    return res.status(404).json({ ok: false, error: 'definitive_model_slot_not_found', slotId: req.params.slotId });
  }
  return res.json(model);
});

app.get('/api/definitive/registry-package', (req, res) => {
  res.json(buildDefinitiveRegistryPackage(discoveryOrigin(req)));
});

app.get('/api/definitive/connector-distribution', (req, res) => {
  res.json(buildDefinitiveConnectorDistributionPackage(discoveryOrigin(req)));
});

app.get('/api/definitive/assistant-distribution-readiness', (req, res) => {
  res.json(buildDefinitiveAssistantDistributionReadiness(discoveryOrigin(req)));
});

app.get('/api/definitive/mcp-launch-readiness', (req, res) => {
  res.json(buildDefinitiveAssistantDistributionReadiness(discoveryOrigin(req)));
});

app.get('/api/definitive/enterprise-allow-lists', (req, res) => {
  res.json(buildDefinitiveEnterpriseAllowListTemplates(discoveryOrigin(req)));
});

app.get('/api/debug/check-ai', async (_req, res) => {
  const checks: Record<string, any> = {};

  checks.apiKeySet = !!process.env.ANTHROPIC_API_KEY;
  checks.apiKeyPrefix = process.env.ANTHROPIC_API_KEY
    ? process.env.ANTHROPIC_API_KEY.substring(0, 10) + '...'
    : 'NOT SET';

  try {
    const testSql = createSql();
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
if (practiceModeEnabled()) {
  // Retired public product surfaces: the anonymous marketing funnel and Stripe
  // checkout/portal have no role in the private practice (THE LINE v2). The
  // webhook mount above stays live so legacy subscription events still settle.
  app.use('/api/chat/anonymous', retiredSurface);
  app.use('/api/stripe', retiredSurface);
} else {
  app.use('/api/chat/anonymous', chatLimiter, anonymousRouter);
  app.use('/api/stripe', requireAuth, stripeRouter); // routes read req.userId; this mount is before the blanket requireAuth, so gate it here (webhook is mounted separately above, stays public)
}
app.use('/api/chat', chatLimiter, chatRouter);
app.use('/api', shareLinksRouter); // has both public (/shared/:token) and protected routes

// Studio collateral catalog — generic, non-sensitive (the list of buildable
// deliverable types). Mounted public (before the blanket requireAuth) so the
// Studio creation launcher can show "what you can build" without forcing auth;
// the CREATE action (POST /deals/:id/deliverables) stays gated.
app.get('/api/deliverables/catalog', async (_req, res) => {
  try {
    const sql = (await import('./db.js')).sql;
    const items = await sql`
      SELECT slug, name, description, journey, gate, category, tier, deliverable_type
      FROM menu_items
      WHERE active = true
      ORDER BY category, name
    `;
    res.json({ items });
  } catch (err: any) {
    console.error('[catalog] failed:', err.message);
    res.status(500).json({ error: 'Failed to load catalog' });
  }
});

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
app.use('/api', nextActionsRouter);
app.use('/api', buyerPipelineRouter);
app.use('/api', dealBuyersRouter);
app.use('/api', dealOffersRouter);
app.use('/api', advisorMandatesRouter);
app.use('/api', discoveryRouter);
app.use('/api', adminRouter);
app.use('/api', passkeyRouter);
app.use('/api', agencyActionsRouter);
app.use('/api', analysisRunsRouter);
app.use('/api', modelExecutionsRouter);
app.use('/api', portfolioBriefRouter);
app.use('/api', canvasTabsRouter);
app.use('/api', docViewsRouter);
app.use('/api', studioRouter);
app.use('/api', researchRouter);
app.use('/api', crmRouter);
app.use('/api', dealTasksRouter);
app.use('/api', pmiPlanRouter);
app.use('/api', v19ResourcesRouter);

app.use('/api', exportRouter);

// ─── 4. JSON error handler for API routes ──────────────────
app.use('/api', (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('API error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ─── 5. Static file serving ────────────────────────────────
const clientPath = path.resolve(__dirname, '../client');
app.use('/assets', express.static(path.join(clientPath, 'assets'), { maxAge: '1y', immutable: true }));
/**
 * A MISSING hashed asset must 404, not fall through to the SPA shell.
 *
 * Without this, `express.static` calls next() for a file it cannot find, the
 * request reaches the catch-all at the bottom of this file, and the browser is
 * handed `index.html` — with `Content-Type: text/html` — in answer to a
 * `<script type="module">` request. What the user then sees is:
 *
 *   'text/html' is not a valid JavaScript MIME type for module script
 *   'https://smbx.ai/assets/ReportsIndex-Cn8qVfIi.js'
 *
 * which is a true statement about a symptom and says nothing about the cause.
 * The cause is ordinary: someone had the page open across a deploy, every
 * chunk was rebuilt under a new hash, and their still-loaded index.html asked
 * for one of the old names. Eight deploys in an afternoon makes it common.
 *
 * 404 is the honest answer, and it is also the useful one — a dynamic import
 * that 404s rejects cleanly, which is what `vite:preloadError` listens for
 * (see client/src/main.tsx, where the page reloads itself onto the new build).
 * Handed HTML instead, the import fails with a MIME error the client cannot
 * classify.
 */
app.use('/assets', (_req, res) => {
  res.status(404).type('text/plain').send('Not found');
});
app.use(express.static(clientPath, { maxAge: 0 }));

// ─── 5b. Support: client-side error capture (no auth required) ──
app.post('/api/support/client-error', express.json(), async (req, res) => {
  try {
    const supportSql = createSql();
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

// ─── 5c. Report link previews ──────────────────────────────
// Social crawlers (LinkedIn, Slack, X) do not run JS, so the client-side
// <title>/OG tags on /reports/:slug are invisible to them — a posted link
// would preview as the generic site card. Stamp the report's own title,
// abstract and cover into index.html before serving it. Google reads the
// client-side tags; the two come from the same shared/reports.ts entries.
// Static files (/reports/<slug>.pdf, the cover jpg) are already resolved by
// express.static above, so only real page routes reach this.
//
// The canonical path is /research (Paul, 2026-07-29: "can we make the URL be
// Research instead of Reports?"). /reports is answered with a PERMANENT
// redirect rather than a second live route, because links to it are already
// out on LinkedIn: a 301 is what moves a crawler's index and a reader's
// bookmark onto the new URL, where two routes serving the same page would
// leave both in circulation and split the page against itself. The redirect
// keeps the query string — `?dl=1` and `?unlock=…` ride on it.
app.get(['/reports', '/reports/:slug'], (req, res) => {
  const raw = String(req.params.slug || '');
  const slug = raw ? `/${encodeURIComponent(raw)}` : '';
  const qs = req.originalUrl.includes('?') ? `?${req.originalUrl.split('?').slice(1).join('?')}` : '';
  return res.redirect(301, `/research${slug}${qs}`);
});

const REPORT_META_CACHE = new Map<string, string>();

app.get('/research/:slug', async (req, res, next) => {
  try {
    const { findReport } = await import('../shared/reports.js');
    const report = findReport(String(req.params.slug || ''));
    if (!report) return next();

    const cached = REPORT_META_CACHE.get(report.slug);
    if (cached) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.send(cached);
    }

    const { readFile } = await import('node:fs/promises');
    const shell = await readFile(path.join(clientPath, 'index.html'), 'utf8');

    const esc = (v: string) =>
      v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const title = `${report.shortTitle} — ${report.kicker} | smbX.ai`;
    const origin = `${req.protocol}://${req.get('host')}`;
    const url = `${origin}/research/${report.slug}`;

    const tags = [
      `<meta property="og:url" content="${esc(url)}" />`,
      `<link rel="canonical" href="${esc(url)}" />`,
    ].join('\n    ');

    const html = shell
      // index.html now carries a DEFAULT og:image (the site card), so a
      // report's card must REPLACE it rather than be appended alongside it —
      // two og:image tags leave the crawler to pick, and it picks the first.
      .replace(
        /<meta property="og:image" content="[^"]*" \/>/,
        `<meta property="og:image" content="${esc(origin + (report.ogImage || '/site-cover.jpg'))}" />`,
      )
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
      .replace(
        /<meta name="description"[^>]*>/,
        `<meta name="description" content="${esc(report.abstract)}" />`,
      )
      .replace(
        /<meta property="og:title"[^>]*>/,
        `<meta property="og:title" content="${esc(title)}" />`,
      )
      .replace(
        /<meta property="og:description"[^>]*>/,
        `<meta property="og:description" content="${esc(report.abstract)}" />`,
      )
      .replace(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="article" />\n    ${tags}`);

    REPORT_META_CACHE.set(report.slug, html);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.send(html);
  } catch (err: any) {
    console.error('[reports] meta injection failed:', err.message);
    return next(); // the SPA catch-all still serves a working page
  }
});

// ─── 6. SPA catch-all (must be LAST) ──────────────────────
//
// Public practice pages get their OWN title/description/canonical/OG stamped
// in, for the same reason the report route above does: LinkedIn, Slack and X
// do not run JavaScript, so a posted link previews from the HTML as SERVED,
// not from anything React sets afterwards. Google renders JS and would
// eventually read the client-side tags, but "eventually" is not what a
// freshly posted link gets.
//
// Before this, ten public URLs answered with one title and one description —
// the register in shared/pageMeta.ts is the fix, and it is the same register
// the client re-applies on SPA navigation.
//
// Anything without an entry falls through to the untouched shell, which is
// the previous behaviour exactly. A page is never worse off for being absent
// from the register.
const PAGE_META_CACHE = new Map<string, string>();

app.get('*', async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  const shellPath = path.join(clientPath, 'index.html');
  try {
    const { findPageMeta } = await import('../shared/pageMeta.js');
    const meta = findPageMeta(req.path);
    if (!meta) return res.sendFile(shellPath);

    const cached = PAGE_META_CACHE.get(meta.path);
    if (cached) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(cached);
    }

    const { readFile } = await import('node:fs/promises');
    const shell = await readFile(shellPath, 'utf8');
    const esc = (v: string) =>
      v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const origin = `${req.protocol}://${req.get('host')}`;
    const url = origin + (meta.path === '/' ? '/' : meta.path);

    const html = shell
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(meta.title)}</title>`)
      .replace(
        /<meta name="description"[^>]*>/,
        `<meta name="description" content="${esc(meta.description)}" />`,
      )
      .replace(
        /<meta property="og:title"[^>]*>/,
        `<meta property="og:title" content="${esc(meta.title)}" />`,
      )
      .replace(
        /<meta property="og:description"[^>]*>/,
        `<meta property="og:description" content="${esc(meta.description)}" />`,
      )
      .replace(
        /<meta property="og:type"[^>]*>/,
        `<meta property="og:type" content="website" />\n    ` +
          `<meta property="og:url" content="${esc(url)}" />\n    ` +
          `<link rel="canonical" href="${esc(url)}" />`,
      );

    PAGE_META_CACHE.set(meta.path, html);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  } catch (err: any) {
    console.error('[pageMeta] injection failed:', err?.message);
    return res.sendFile(shellPath); // a working page always beats a right title
  }
});

// ─── 7. Global error handler — auto-logs to support_issues ──
app.use((err: any, req: any, res: any, _next: any) => {
  console.error('Unhandled error:', err.message || err);
  try {
    const errorSql = createSql();
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
  const sql = postgres(getDatabaseUrl(), getPostgresOptions());
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
  const bootSql = createSql();
  // Belt-and-suspenders: ensure the deal columns that /api/deals selects actually
  // exist, even on DBs that predate them — a missing column 500s the whole query
  // and blanks the Deals board. Isolated so a failure here can't skip the
  // admin-account ensure below.
  //   - `name` (rename target): added to 000_base_schema.sql LATE (commit 36890ab5),
  //     so any deals table created before that has NO `name` column and there is no
  //     ALTER migration for it. THIS was the production HTTP 500 — /api/deals started
  //     selecting d.name and died with "column does not exist".
  //   - is_favorite / disposition: migration 095, same risk if it didn't apply.
  try {
    await bootSql`ALTER TABLE deals ADD COLUMN IF NOT EXISTS name VARCHAR(255)`;
    await bootSql`ALTER TABLE deals ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT FALSE`;
    await bootSql`ALTER TABLE deals ADD COLUMN IF NOT EXISTS disposition VARCHAR(20) NOT NULL DEFAULT 'active'`;
  } catch (e: any) {
    console.error('[boot] ensure deals name/favorite/disposition columns:', e?.message);
  }
  try {
    await bootSql`ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ`;
    await bootSql`
      INSERT INTO users (email, password, display_name, role, is_advisor, league, plan, trial_ends_at, free_deliverable_used)
      VALUES (
        'pbaker@smbx.ai',
        '$2b$10$mNL0ykJmWlbqzVCzLM4w4.KuHpAkezdSQSzEN6F2x/tKrKL9fqYFW',
        'Paul Baker',
        'superadmin',
        true,
        'L4',
        'enterprise',
        NOW() + INTERVAL '90 days',
        false
      )
      ON CONFLICT (email) DO UPDATE SET
        password = COALESCE(users.password, EXCLUDED.password),
        display_name = EXCLUDED.display_name,
        role = 'superadmin',
        is_advisor = true,
        league = COALESCE(users.league, EXCLUDED.league),
        plan = 'enterprise',
        trial_ends_at = GREATEST(COALESCE(users.trial_ends_at, NOW()), EXCLUDED.trial_ends_at),
        free_deliverable_used = false,
        updated_at = NOW()
    `;
    await bootSql`
      INSERT INTO subscriptions (user_id, plan, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end, trial_ends_at)
      SELECT id, 'enterprise', 'active', 'dev_superadmin_enterprise', 'dev_superadmin', NOW(), NOW() + INTERVAL '30 days', NOW() + INTERVAL '90 days'
      FROM users
      WHERE email = 'pbaker@smbx.ai'
      ON CONFLICT (user_id) DO UPDATE SET
        plan = 'enterprise',
        status = 'active',
        trial_ends_at = EXCLUDED.trial_ends_at,
        updated_at = NOW()
    `;
    console.log('[boot] Superadmin account verified');
    try {
      const seeded = await ensureModelRegistrySeeded();
      console.log(`[boot] V19 model registry catalog verified (${seeded.insertedOrUpdated} models)`);
    } catch (err: any) {
      console.warn('[boot] V19 model registry seed skipped:', err.message);
    }
    // Debug: log which email/API keys are configured
    const keyStatus = ['RESEND_API_KEY', 'ANTHROPIC_API_KEY', 'GOOGLE_CLIENT_ID', 'STRIPE_SECRET_KEY', 'EMAIL_FROM']
      .map(k => `${k}=${process.env[k] ? 'SET' : 'MISSING'}`)
      .join(', ');
    console.log(`[boot] Env check: ${keyStatus}`);
  } catch (err: any) {
    console.error('[boot] Admin account check failed:', err.message);
  } finally {
    await bootSql.end();
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startWorker().catch(err => console.warn('[worker] Init skipped:', err.message));
    try {
      startResearchScheduler();
    } catch (err: any) {
      console.warn('[research] Scheduler init skipped:', err?.message);
    }
    try {
      startOwnerDigestScheduler();
    } catch (err: any) {
      console.warn('[owner-digest] Scheduler init skipped:', err?.message);
    }
  });
});
