import './loadEnv.js'; // must be first: loads .env + backfills empty ambient vars
import express from 'express';
import path from 'path';
import postgres from 'postgres';
import { fileURLToPath } from 'url';
import { optionalAuth, requireAuth } from './middleware/auth.js';
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
app.use('/api/chat/anonymous', chatLimiter, anonymousRouter);
app.use('/api/chat', chatLimiter, chatRouter);
app.use('/api/stripe', requireAuth, stripeRouter); // routes read req.userId; this mount is before the blanket requireAuth, so gate it here (webhook is mounted separately above, stays public)
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

// ─── 6. SPA catch-all (must be LAST) ──────────────────────
app.get('*', (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(clientPath, 'index.html'));
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
  });
});
