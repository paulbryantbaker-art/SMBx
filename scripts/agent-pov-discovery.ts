#!/usr/bin/env npx tsx
/**
 * Agent-POV discovery + auth harness (DC-001 through DC-015).
 *
 * Covers TEST_PLAN_SUBSTRATE_AGENT_POV.md §4.1 — every discovery + OAuth
 * surface an external agent needs to traverse to land on /mcp with a working
 * bearer token. Validates:
 *   - All `.well-known/*` endpoints expose the documented shape
 *   - OpenAPI specs validate with operationIds + pricing declaration
 *   - Unauthenticated MCP `initialize` + `tools/list` work
 *   - Unauthenticated MCP `tools/call` returns 401 with the
 *     WWW-Authenticate resource-metadata challenge pointing at
 *     /.well-known/oauth-protected-resource/mcp
 *   - Public PKCE OAuth flow round-trips and the resulting token can call /mcp
 *   - Confidential GPT Actions OAuth flow round-trips (if env credentials set)
 *   - /mcp rejects tokens with wrong `aud` and expired tokens
 *
 * Usage:
 *   npx tsx scripts/agent-pov-discovery.ts
 *   npx tsx scripts/agent-pov-discovery.ts --url=http://127.0.0.1:3000
 *
 * Exit codes:
 *   0 — every scenario passed
 *   1 — at least one scenario failed
 *   2 — infrastructure error (substrate unreachable, fatal load failure)
 *
 * OAuth scenarios that need DB + JWT_SECRET (DC-011/012/013) gracefully skip
 * if the local env doesn't have those prerequisites — they log the reason and
 * the scenario is reported as `skip`, not `fail`. This lets the harness run
 * against any environment (local dev, CI without DB, production synthetic).
 *
 * Pricing values verified in agent-card.json:
 *   Free / $99 Solo / $249 Pro / $749 Team / $3,000+ Enterprise
 *   (canonical: SMBX_PRICING_LOCKED.md)
 */

import 'dotenv/config';
import { createHash, randomBytes } from 'node:crypto';
import {
  McpClient,
  assert,
  assertHasField,
  assertNoFiveHundred,
  assertStructuredResponse,
  c,
  getPath,
  header,
  note,
  ok,
  printSummary,
  readEnv,
  runScenario,
  writeRunSummary,
} from '../testing/agent-pov/runner-helpers.js';
import type { McpResponse } from '../testing/agent-pov/runner-helpers.js';
import type {
  AssertionResult,
  ScenarioResult,
} from '../testing/agent-pov/types.js';

const SCRIPT_NAME = 'agent-pov-discovery';

// Canonical values from SMBX_PRICING_LOCKED.md (CLAUDE.md Critical Rule #1).
const EXPECTED_PRICING = {
  free: '$0',
  solo: '$99/mo',
  pro: '$249/mo',
  team: '$749/mo',
  enterprise: '$3,000+/mo',
};

// ─── CLI argument parsing ──────────────────────────────────
interface CliArgs {
  url?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};
  for (const raw of argv.slice(2)) {
    if (raw.startsWith('--url=')) args.url = raw.slice(6);
  }
  return args;
}

// ─── Shared helpers ────────────────────────────────────────

async function rawPostForm(url: string, body: Record<string, any>): Promise<McpResponse> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(Object.entries(body).map(([k, v]) => [k, String(v)])),
  });
  const text = await res.text();
  let parsed: any = text;
  try { parsed = JSON.parse(text); } catch { /* keep raw */ }
  return {
    status: res.status,
    body: parsed,
    headers: Object.fromEntries(res.headers.entries()),
  };
}

async function rawPostJson(url: string, body: any, bearer?: string): Promise<McpResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (bearer) headers['Authorization'] = `Bearer ${bearer}`;
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const text = await res.text();
  let parsed: any = text;
  try { parsed = JSON.parse(text); } catch { /* keep raw */ }
  return {
    status: res.status,
    body: parsed,
    headers: Object.fromEntries(res.headers.entries()),
  };
}

/** Lower-cased header lookup (fetch normalizes; be defensive anyway). */
function getHeader(headers: Record<string, string>, name: string): string | undefined {
  const target = name.toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === target) return v;
  }
  return undefined;
}

/**
 * Mint a "smbX user JWT" via the same shape `definitive-auth-route-smoke.ts`
 * uses. The /oauth/authorize/confirm endpoint accepts this — it's the signed-in
 * user proving they consent to the OAuth client.
 *
 * Returns null when DB or JWT_SECRET unavailable (e.g. production-target run).
 */
async function provisionFixtureUserAndJwt(): Promise<{ userId: number; jwt: string } | null> {
  const env = readEnv();
  if (!env.hasDb || !env.jwtSecret) return null;
  try {
    const [{ sql }, jwtModule] = await Promise.all([
      import('../server/db.js' as any),
      import('jsonwebtoken') as any,
    ]);
    const jwt = jwtModule.default || jwtModule;
    const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const FIXTURE_EMAIL = 'agent-pov-discovery@smbx.test';
    const [user] = await sql`
      INSERT INTO users (email, display_name, role, is_advisor, league, plan, trial_ends_at, created_at, updated_at)
      VALUES (${FIXTURE_EMAIL}, 'Agent POV Discovery Fixture', 'user', true, 'L4', 'enterprise', ${trialEnd}, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        is_advisor = true,
        league = 'L4',
        plan = 'enterprise',
        trial_ends_at = EXCLUDED.trial_ends_at,
        updated_at = NOW()
      RETURNING id
    `;
    const userId = Number(user.id);
    // Ensure subscription row (some routes check plan from subscriptions).
    await sql`
      INSERT INTO subscriptions (user_id, plan, status, trial_end, trial_ends_at, created_at, updated_at)
      VALUES (${userId}, 'enterprise', 'trialing', ${trialEnd}, ${trialEnd}, NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        plan = 'enterprise',
        status = 'trialing',
        trial_end = EXCLUDED.trial_end,
        trial_ends_at = EXCLUDED.trial_ends_at,
        updated_at = NOW()
    `.catch(() => undefined);
    const signed = jwt.sign({ userId }, env.jwtSecret, { expiresIn: '30m' });
    return { userId, jwt: signed };
  } catch (err) {
    note(`provisionFixtureUserAndJwt failed: ${(err as Error).message}`);
    return null;
  }
}

/** Mint a JWT with arbitrary claims (used for wrong-aud / expired-token tests). */
async function signRawJwt(claims: Record<string, any>): Promise<string | null> {
  const env = readEnv();
  if (!env.jwtSecret) return null;
  try {
    const jwtModule: any = await import('jsonwebtoken');
    const jwt = jwtModule.default || jwtModule;
    return jwt.sign(claims, env.jwtSecret);
  } catch {
    return null;
  }
}

/** Run a full public-PKCE OAuth flow and return the resulting access_token. */
async function runPkceFlow(origin: string, userJwt: string, opts: {
  scope?: string;
  state?: string;
} = {}): Promise<{ accessToken: string; tokenResponse: McpResponse; clientId: string } | { error: string }> {
  const redirectUri = 'http://127.0.0.1:45557/callback';
  const registered = await rawPostJson(`${origin}/oauth/register`, {
    client_name: 'agent-pov-discovery',
    redirect_uris: [redirectUri],
    token_endpoint_auth_method: 'none',
  });
  if (registered.status !== 201 || !registered.body?.client_id) {
    return { error: `/oauth/register failed: status=${registered.status} body=${JSON.stringify(registered.body).slice(0, 200)}` };
  }
  const clientId = String(registered.body.client_id);
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  const confirmed = await rawPostJson(`${origin}/oauth/authorize/confirm`, {
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: opts.scope || 'capability:read methodology:read deal-state:read',
    state: opts.state || 'agent-pov-discovery-state',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    resource: `${origin}/mcp`,
  }, userJwt);
  if (confirmed.status !== 200 || !confirmed.body?.redirectTo) {
    return { error: `/oauth/authorize/confirm failed: status=${confirmed.status} body=${JSON.stringify(confirmed.body).slice(0, 200)}` };
  }
  let redirect: URL;
  try { redirect = new URL(confirmed.body.redirectTo); }
  catch (err) { return { error: `redirectTo not a URL: ${(err as Error).message}` }; }
  const code = redirect.searchParams.get('code');
  if (!code) return { error: 'authorize/confirm redirect missing ?code=' };
  const tokenResponse = await rawPostForm(`${origin}/oauth/token`, {
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    redirect_uri: redirectUri,
    code_verifier: verifier,
    resource: `${origin}/mcp`,
  });
  if (tokenResponse.status !== 200 || !tokenResponse.body?.access_token) {
    return { error: `/oauth/token failed: status=${tokenResponse.status} body=${JSON.stringify(tokenResponse.body).slice(0, 200)}` };
  }
  return {
    accessToken: String(tokenResponse.body.access_token),
    tokenResponse,
    clientId,
  };
}

// ─── Skip helper for prerequisites-not-met ────────────────

function skipScenario(id: string, reason: string): ScenarioResult {
  console.log(`\n${c.bold}[${id}]${c.reset}`);
  console.log(`  ${c.yellow}◐${c.reset} skipped ${c.gray}(${reason})${c.reset}`);
  return {
    id,
    category: 'DC',
    status: 'skip',
    durationMs: 0,
    assertions: [],
    notes: reason,
  };
}

// ─── Main ──────────────────────────────────────────────────

async function main(): Promise<number> {
  const cli = parseArgs(process.argv);
  const env = readEnv();
  if (cli.url) env.origin = cli.url.replace(/\/+$/, '');

  header(`smbX agent-POV discovery + auth (target=${env.origin})`);

  const client = new McpClient(env);
  const scenarios: ScenarioResult[] = [];

  // Reachability probe — fail fast (exit 2) if substrate isn't up.
  try {
    const probe = await client.get('/.well-known/agent-card.json', { timeoutMs: 5_000 });
    if (probe.status >= 500) throw new Error(`reachability probe got 5xx: ${probe.status}`);
  } catch (err) {
    console.log(`${c.red}substrate unreachable at ${env.origin}: ${(err as Error).message}${c.reset}`);
    return 2;
  }

  // ─── DC-001: /.well-known/agent-card.json ───────────────
  scenarios.push(await runScenario('DC-001', 'DC', async () => {
    const res = await client.get('/.well-known/agent-card.json');
    const out: AssertionResult[] = [];
    out.push(assert('GET /.well-known/agent-card.json → 200', res.status === 200, 200, res.status));
    out.push(assertNoFiveHundred(res));
    out.push(assert('body is JSON object', typeof res.body === 'object' && res.body !== null));
    if (typeof res.body !== 'object' || res.body === null) return out;
    out.push(assertHasField(res, 'pricing'));
    out.push(assertHasField(res, 'definitive.methodologyVersion'));
    out.push(assertHasField(res, 'definitive.specVersion'));
    const pricing = res.body.pricing || {};
    for (const [tier, expected] of Object.entries(EXPECTED_PRICING)) {
      out.push(assert(
        `pricing.${tier} = "${expected}" (SMBX_PRICING_LOCKED.md)`,
        pricing[tier] === expected,
        expected,
        pricing[tier],
      ));
    }
    const methodology = getPath(res.body, 'definitive.methodologyVersion');
    out.push(assert(
      'methodologyVersion is non-empty string',
      typeof methodology === 'string' && methodology.length > 0,
      'non-empty string',
      methodology,
    ));
    return out;
  }));

  // ─── DC-002: /.well-known/mcp/server-card.json ─────────
  scenarios.push(await runScenario('DC-002', 'DC', async () => {
    const res = await client.get('/.well-known/mcp/server-card.json');
    const out: AssertionResult[] = [];
    out.push(assert('GET /.well-known/mcp/server-card.json → 200', res.status === 200, 200, res.status));
    out.push(assertNoFiveHundred(res));
    if (typeof res.body !== 'object' || res.body === null) {
      out.push(assert('body is JSON object', false));
      return out;
    }
    const tools = Array.isArray(res.body.tools) ? res.body.tools : [];
    out.push(assert('tools[] present and non-empty', tools.length > 0, '> 0', tools.length));
    const everyHasInput = tools.every((t: any) => t?.inputSchema && typeof t.inputSchema === 'object');
    const everyHasOutput = tools.every((t: any) => t?.outputSchema && typeof t.outputSchema === 'object');
    const everyHasAnnotations = tools.every((t: any) => t?.annotations && typeof t.annotations === 'object');
    out.push(assert('every tool has inputSchema', everyHasInput));
    out.push(assert('every tool has outputSchema', everyHasOutput));
    out.push(assert('every tool has annotations', everyHasAnnotations));

    // Cross-check tool count vs MCP tools/list (DC-009 echoes this).
    const listed = await client.mcpCall('tools/list', {});
    const listedTools = listed.body?.result?.tools;
    if (Array.isArray(listedTools)) {
      out.push(assert(
        `server-card tools[] count matches tools/list (${tools.length} vs ${listedTools.length})`,
        tools.length === listedTools.length,
        listedTools.length,
        tools.length,
      ));
    } else {
      out.push(assert('tools/list returned tools[] for cross-check', false, 'array', typeof listedTools));
    }
    return out;
  }));

  // ─── DC-003: /.well-known/oauth-protected-resource/mcp ──
  scenarios.push(await runScenario('DC-003', 'DC', async () => {
    const res = await client.get('/.well-known/oauth-protected-resource/mcp');
    const out: AssertionResult[] = [];
    out.push(assert('GET protected-resource/mcp → 200', res.status === 200, 200, res.status));
    out.push(assertNoFiveHundred(res));
    if (typeof res.body !== 'object' || res.body === null) {
      out.push(assert('body is JSON object', false));
      return out;
    }
    const resource = String(res.body.resource || '');
    out.push(assert(
      `resource ends with /mcp (got "${resource}")`,
      resource.endsWith('/mcp'),
      `${env.origin}/mcp`,
      resource,
    ));
    const authServers = res.body.authorization_servers;
    out.push(assert(
      'authorization_servers is non-empty array',
      Array.isArray(authServers) && authServers.length > 0,
      'array length >= 1',
      Array.isArray(authServers) ? authServers.length : typeof authServers,
    ));
    out.push(assertHasField(res, 'bearer_methods_supported'));
    out.push(assertHasField(res, 'scopes_supported'));
    return out;
  }));

  // ─── DC-004: /.well-known/oauth-authorization-server ────
  scenarios.push(await runScenario('DC-004', 'DC', async () => {
    const res = await client.get('/.well-known/oauth-authorization-server');
    const out: AssertionResult[] = [];
    out.push(assert('GET oauth-authorization-server → 200', res.status === 200, 200, res.status));
    out.push(assertNoFiveHundred(res));
    if (typeof res.body !== 'object' || res.body === null) {
      out.push(assert('body is JSON object', false));
      return out;
    }
    const pkce = res.body.code_challenge_methods_supported;
    out.push(assert(
      'PKCE S256 supported',
      Array.isArray(pkce) && pkce.includes('S256'),
      "['S256', ...]",
      pkce,
    ));
    for (const ep of ['authorization_endpoint', 'token_endpoint', 'registration_endpoint']) {
      out.push(assert(`${ep} present`, typeof res.body[ep] === 'string' && res.body[ep].length > 0));
    }
    out.push(assert(
      'resource_indicators_supported = true',
      res.body.resource_indicators_supported === true,
      true,
      res.body.resource_indicators_supported,
    ));
    return out;
  }));

  // ─── DC-005: /server.json (MCP Registry shape) ──────────
  scenarios.push(await runScenario('DC-005', 'DC', async () => {
    const res = await client.get('/server.json');
    const out: AssertionResult[] = [];
    out.push(assert('GET /server.json → 200', res.status === 200, 200, res.status));
    out.push(assertNoFiveHundred(res));
    if (typeof res.body !== 'object' || res.body === null) {
      out.push(assert('body is JSON object', false));
      return out;
    }
    const remotes = res.body.remotes;
    out.push(assert(
      'remotes[] non-empty array',
      Array.isArray(remotes) && remotes.length > 0,
      'array length >= 1',
      Array.isArray(remotes) ? remotes.length : typeof remotes,
    ));
    if (Array.isArray(remotes) && remotes.length > 0) {
      const types = remotes.map((r: any) => r?.type);
      out.push(assert(
        "remotes[].type includes 'streamable-http'",
        types.includes('streamable-http'),
        'streamable-http',
        types.join(','),
      ));
      const remote = remotes.find((r: any) => r?.type === 'streamable-http');
      if (remote) {
        out.push(assert(
          'streamable-http remote.url ends with /mcp',
          typeof remote.url === 'string' && remote.url.endsWith('/mcp'),
          '<origin>/mcp',
          remote?.url,
        ));
      }
    }
    out.push(assertHasField(res, 'name'));
    out.push(assertHasField(res, 'version'));
    return out;
  }));

  // ─── DC-006: /api/definitive/openapi.json ───────────────
  scenarios.push(await runScenario('DC-006', 'DC', async () => {
    const res = await client.get('/api/definitive/openapi.json');
    const out: AssertionResult[] = [];
    out.push(assert('GET /api/definitive/openapi.json → 200', res.status === 200, 200, res.status));
    out.push(assertNoFiveHundred(res));
    if (typeof res.body !== 'object' || res.body === null) {
      out.push(assert('body is JSON object', false));
      return out;
    }
    const openapi = String(res.body.openapi || '');
    out.push(assert(
      `openapi version is 3.x (got "${openapi}")`,
      openapi.startsWith('3.'),
      '3.x',
      openapi,
    ));
    out.push(assertHasField(res, 'info'));
    out.push(assertHasField(res, 'paths'));

    // Every path's operation must declare operationId (DC-006 acceptance).
    const paths = res.body.paths || {};
    const missingOpIds: string[] = [];
    for (const [pathKey, pathItem] of Object.entries(paths as Record<string, any>)) {
      if (!pathItem || typeof pathItem !== 'object') continue;
      for (const [method, op] of Object.entries(pathItem)) {
        if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) continue;
        if (!op || typeof op !== 'object') continue;
        if (!(op as any).operationId) missingOpIds.push(`${method.toUpperCase()} ${pathKey}`);
      }
    }
    out.push(assert(
      `every operation has operationId (missing: ${missingOpIds.length})`,
      missingOpIds.length === 0,
      [],
      missingOpIds.slice(0, 5),
    ));

    // x-smbx.pricingDeclaration present.
    const pricingDecl = getPath(res.body, 'x-smbx.pricingDeclaration');
    out.push(assert(
      'x-smbx.pricingDeclaration present',
      typeof pricingDecl === 'string' && pricingDecl.length > 0,
      'non-empty string',
      pricingDecl,
    ));
    return out;
  }));

  // ─── DC-007: /api/definitive/gpt-actions/openapi.json ───
  scenarios.push(await runScenario('DC-007', 'DC', async () => {
    const res = await client.get('/api/definitive/gpt-actions/openapi.json');
    const out: AssertionResult[] = [];
    out.push(assert('GET gpt-actions/openapi.json → 200', res.status === 200, 200, res.status));
    out.push(assertNoFiveHundred(res));
    if (typeof res.body !== 'object' || res.body === null) {
      out.push(assert('body is JSON object', false));
      return out;
    }
    const openapi = String(res.body.openapi || '');
    out.push(assert(`openapi version is 3.x (got "${openapi}")`, openapi.startsWith('3.'), '3.x', openapi));

    // OAuth security scheme present.
    const oauthFlow = getPath(res.body, 'components.securitySchemes.smbxOAuth.flows.authorizationCode');
    out.push(assert(
      'components.securitySchemes.smbxOAuth.flows.authorizationCode present',
      Boolean(oauthFlow && oauthFlow.tokenUrl && oauthFlow.authorizationUrl),
      'tokenUrl + authorizationUrl present',
      oauthFlow ? Object.keys(oauthFlow).join(',') : 'absent',
    ));

    // ≤30 tools (GPT Actions limit). Count POST paths.
    const paths = res.body.paths || {};
    const postCount = Object.values(paths as Record<string, any>)
      .filter(p => p && typeof p === 'object' && (p as any).post)
      .length;
    out.push(assert(
      `POST path count ≤ 30 (got ${postCount}) — GPT Actions tool limit`,
      postCount <= 30,
      '≤ 30',
      postCount,
    ));
    return out;
  }));

  // ─── DC-008: unauthenticated /mcp `initialize` ──────────
  scenarios.push(await runScenario('DC-008', 'DC', async () => {
    const res = await client.mcpCall('initialize', {
      protocolVersion: '2025-11-25',
      capabilities: {},
      clientInfo: { name: 'agent-pov-discovery', version: '0.1' },
    });
    const out: AssertionResult[] = [];
    out.push(assert('POST /mcp initialize → 200', res.status === 200, 200, res.status));
    out.push(assertNoFiveHundred(res));
    const proto = getPath(res.body, 'result.protocolVersion');
    out.push(assert(
      'result.protocolVersion negotiated',
      typeof proto === 'string' && proto.length > 0,
      'non-empty string',
      proto,
    ));
    out.push(assertHasField(res, 'result.capabilities'));
    return out;
  }));

  // ─── DC-009: unauthenticated /mcp `tools/list` ──────────
  scenarios.push(await runScenario('DC-009', 'DC', async () => {
    const res = await client.mcpCall('tools/list', {});
    const out: AssertionResult[] = [];
    out.push(assert('POST /mcp tools/list → 200', res.status === 200, 200, res.status));
    out.push(assertNoFiveHundred(res));
    const tools = getPath(res.body, 'result.tools');
    out.push(assert(
      'result.tools[] non-empty array',
      Array.isArray(tools) && tools.length > 0,
      '>= 1',
      Array.isArray(tools) ? tools.length : typeof tools,
    ));
    if (Array.isArray(tools)) {
      const everyHasSchema = tools.every((t: any) => t?.inputSchema && typeof t.inputSchema === 'object');
      out.push(assert('every tool has inputSchema', everyHasSchema));
      // Specific anchors expected per server-card snapshot.
      const names = tools.map((t: any) => t?.name).filter(Boolean);
      out.push(assert(
        'tools/list exposes ingest_deal_payload',
        names.includes('ingest_deal_payload'),
        'present',
        'absent',
      ));
    }
    return out;
  }));

  // ─── DC-010: unauthenticated /mcp tools/call → 401 + WWW-Authenticate
  scenarios.push(await runScenario('DC-010', 'DC', async () => {
    const res = await client.mcpCall('tools/call', {
      name: 'introspect_capabilities',
      arguments: { journey: 'buy' },
    });
    const out: AssertionResult[] = [];
    out.push(assert('POST /mcp tools/call (unauth) → 401', res.status === 401, 401, res.status));
    const wwwAuth = getHeader(res.headers, 'www-authenticate') || '';
    out.push(assert(
      'WWW-Authenticate header present',
      wwwAuth.length > 0,
      'non-empty Bearer challenge',
      wwwAuth || '<missing>',
    ));
    out.push(assert(
      'WWW-Authenticate starts with "Bearer"',
      /^bearer\b/i.test(wwwAuth),
      'Bearer ...',
      wwwAuth,
    ));
    out.push(assert(
      'WWW-Authenticate carries resource_metadata=',
      wwwAuth.toLowerCase().includes('resource_metadata='),
      'resource_metadata="<origin>/.well-known/oauth-protected-resource/mcp"',
      wwwAuth,
    ));
    out.push(assert(
      'resource_metadata URL points at /.well-known/oauth-protected-resource/mcp',
      wwwAuth.includes('/.well-known/oauth-protected-resource/mcp'),
      'contains path /.well-known/oauth-protected-resource/mcp',
      wwwAuth,
    ));
    return out;
  }));

  // ─── DC-011: public PKCE OAuth flow round-trip ──────────
  let publicAccessToken: string | null = null;
  const userFixture = await provisionFixtureUserAndJwt();
  if (!userFixture) {
    scenarios.push(skipScenario('DC-011', 'DB + JWT_SECRET required for /oauth/authorize/confirm'));
  } else {
    scenarios.push(await runScenario('DC-011', 'DC', async () => {
      const out: AssertionResult[] = [];
      const flow = await runPkceFlow(env.origin, userFixture.jwt, {
        scope: 'capability:read methodology:read deal-state:read',
        state: 'dc-011-state',
      });
      if ('error' in flow) {
        out.push(assert(`PKCE flow round-trip: ${flow.error}`, false));
        return out;
      }
      publicAccessToken = flow.accessToken;
      ok('PKCE flow completed (/oauth/register → /oauth/authorize/confirm → /oauth/token)');
      const body = flow.tokenResponse.body;
      out.push(assert('access_token returned', typeof body.access_token === 'string' && body.access_token.length > 0));
      out.push(assert(
        `token_type = "Bearer" (got "${body.token_type}")`,
        body.token_type === 'Bearer',
        'Bearer',
        body.token_type,
      ));
      out.push(assert(
        `resource = "${env.origin}/mcp"`,
        body.resource === `${env.origin}/mcp`,
        `${env.origin}/mcp`,
        body.resource,
      ));
      out.push(assert(
        'scope echoes requested scopes (contains capability:read)',
        typeof body.scope === 'string' && body.scope.includes('capability:read'),
        'contains capability:read',
        body.scope,
      ));

      // Decode payload (un-verified — just inspect aud) for the DC-011 acceptance.
      try {
        const payloadB64 = body.access_token.split('.')[1];
        const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
        const aud = decoded.aud;
        const audOk = aud === 'mcp' || aud === `${env.origin}/mcp` || (Array.isArray(aud) && (aud.includes('mcp') || aud.includes(`${env.origin}/mcp`)));
        out.push(assert(
          `access_token.aud bound to MCP (got ${JSON.stringify(aud)})`,
          audOk,
          "'mcp' or '<origin>/mcp'",
          aud,
        ));
      } catch (err) {
        out.push(assert('access_token JWT decodable', false, 'decodable JWT', (err as Error).message));
      }
      return out;
    }));
  }

  // ─── DC-012: confidential GPT Actions OAuth flow ────────
  const gptClientId = process.env.SMBX_GPT_ACTIONS_CLIENT_ID;
  const gptClientSecret = process.env.SMBX_GPT_ACTIONS_CLIENT_SECRET;
  if (!gptClientId || !gptClientSecret) {
    scenarios.push(skipScenario('DC-012', 'SMBX_GPT_ACTIONS_CLIENT_ID/SECRET not set'));
  } else if (!userFixture) {
    scenarios.push(skipScenario('DC-012', 'DB + JWT_SECRET required for /oauth/authorize/confirm'));
  } else {
    scenarios.push(await runScenario('DC-012', 'DC', async () => {
      const out: AssertionResult[] = [];
      const redirectUri = 'http://127.0.0.1:45557/callback';
      const confirmed = await rawPostJson(`${env.origin}/oauth/authorize/confirm`, {
        response_type: 'code',
        client_id: gptClientId,
        redirect_uri: redirectUri,
        scope: 'capability:read methodology:read model-stack:compose deal-state:read deal:read',
        state: 'dc-012-state',
        resource: `${env.origin}/mcp`,
      }, userFixture.jwt);
      out.push(assert(
        `/oauth/authorize/confirm → 200 (got ${confirmed.status})`,
        confirmed.status === 200,
        200,
        confirmed.status,
      ));
      if (confirmed.status !== 200 || !confirmed.body?.redirectTo) return out;
      const redirect = new URL(confirmed.body.redirectTo);
      const code = redirect.searchParams.get('code');
      out.push(assert('authorize/confirm returned ?code=', Boolean(code)));
      if (!code) return out;
      const tokenResponse = await rawPostForm(`${env.origin}/oauth/token`, {
        grant_type: 'authorization_code',
        code,
        client_id: gptClientId,
        client_secret: gptClientSecret,
        redirect_uri: redirectUri,
        resource: `${env.origin}/mcp`,
      });
      out.push(assert(
        `/oauth/token → 200 (got ${tokenResponse.status})`,
        tokenResponse.status === 200,
        200,
        tokenResponse.status,
      ));
      if (tokenResponse.status !== 200) return out;
      out.push(assert(
        'access_token returned',
        typeof tokenResponse.body.access_token === 'string' && tokenResponse.body.access_token.length > 0,
      ));
      out.push(assert(
        `resource bound to ${env.origin}/mcp`,
        tokenResponse.body.resource === `${env.origin}/mcp`,
        `${env.origin}/mcp`,
        tokenResponse.body.resource,
      ));
      return out;
    }));
  }

  // ─── DC-013: authenticated /mcp tools/call ──────────────
  if (!publicAccessToken) {
    scenarios.push(skipScenario('DC-013', 'DC-011 did not produce an access token'));
  } else {
    scenarios.push(await runScenario('DC-013', 'DC', async () => {
      const out: AssertionResult[] = [];
      const res = await client.mcpCall('tools/call', {
        name: 'introspect_capabilities',
        arguments: { journey: 'buy' },
        _meta: { requestId: 'dc-013-auth' },
      }, { bearer: publicAccessToken! });
      out.push(assert('POST /mcp tools/call (auth) → 200', res.status === 200, 200, res.status));
      out.push(assertNoFiveHundred(res));
      const structuredContent = getPath(res.body, 'result.structuredContent');
      out.push(assert(
        'result.structuredContent present',
        structuredContent && typeof structuredContent === 'object',
        'object',
        typeof structuredContent,
      ));
      const isError = getPath(res.body, 'result.isError');
      out.push(assert(`result.isError === false (got ${isError})`, isError === false, false, isError));

      // next_suggested_calls present (substrate contract — never dead-end).
      const candidates =
        getPath(res.body, 'result.structuredContent.next_suggested_calls') ??
        getPath(res.body, 'result.structuredContent.nextSuggestedCalls') ??
        getPath(res.body, 'result.structuredContent.result.next_suggested_calls') ??
        getPath(res.body, 'result.structuredContent.result.nextSuggestedCalls');
      out.push(assert(
        'next_suggested_calls present in structuredContent (or nested .result)',
        Array.isArray(candidates),
        'array',
        typeof candidates,
      ));
      return out;
    }));
  }

  // ─── DC-014: /mcp rejects token with wrong `aud` ────────
  if (!env.jwtSecret) {
    scenarios.push(skipScenario('DC-014', 'JWT_SECRET not set — cannot mint wrong-aud test token'));
  } else {
    scenarios.push(await runScenario('DC-014', 'DC', async () => {
      const out: AssertionResult[] = [];
      const wrongAudToken = await signRawJwt({
        sub: 'agent-pov-discovery-wrong-aud',
        aud: 'wrong-audience',
        iss: 'smbx',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 600,
        agent_id: 'agent_pov_wrong_aud',
        scope: 'capability:read',
      });
      if (!wrongAudToken) {
        out.push(assert('mint wrong-aud token', false, 'token', 'null'));
        return out;
      }
      const res = await client.mcpCall('tools/call', {
        name: 'introspect_capabilities',
        arguments: { journey: 'buy' },
      }, { bearer: wrongAudToken });
      out.push(assert(
        `wrong-aud token rejected with 401 (got ${res.status})`,
        res.status === 401,
        401,
        res.status,
      ));
      const wwwAuth = getHeader(res.headers, 'www-authenticate') || '';
      out.push(assert(
        'WWW-Authenticate challenge present on wrong-aud rejection',
        /^bearer\b/i.test(wwwAuth) && wwwAuth.includes('resource_metadata='),
        'Bearer realm + resource_metadata=',
        wwwAuth || '<missing>',
      ));
      // Structured body (not naked text) — substrate must never crash to a generic 500.
      out.push(assertStructuredResponse(res, [401]));
      return out;
    }));
  }

  // ─── DC-015: /mcp rejects expired token ─────────────────
  if (!env.jwtSecret) {
    scenarios.push(skipScenario('DC-015', 'JWT_SECRET not set — cannot mint expired test token'));
  } else {
    scenarios.push(await runScenario('DC-015', 'DC', async () => {
      const out: AssertionResult[] = [];
      const expiredToken = await signRawJwt({
        sub: 'agent-pov-discovery-expired',
        aud: 'mcp',
        iss: 'smbx',
        iat: Math.floor(Date.now() / 1000) - 7200,
        exp: Math.floor(Date.now() / 1000) - 3600, // expired 1h ago
        agent_id: 'agent_pov_expired',
        scope: 'capability:read',
      });
      if (!expiredToken) {
        out.push(assert('mint expired token', false, 'token', 'null'));
        return out;
      }
      const res = await client.mcpCall('tools/call', {
        name: 'introspect_capabilities',
        arguments: { journey: 'buy' },
      }, { bearer: expiredToken });
      out.push(assert(
        `expired token rejected with 401 (got ${res.status})`,
        res.status === 401,
        401,
        res.status,
      ));
      const wwwAuth = getHeader(res.headers, 'www-authenticate') || '';
      out.push(assert(
        'WWW-Authenticate challenge present on expired-token rejection',
        /^bearer\b/i.test(wwwAuth),
        'Bearer ...',
        wwwAuth || '<missing>',
      ));
      // Refresh guidance: either error=invalid_token in challenge, or structured body suggesting refresh.
      const lowered = wwwAuth.toLowerCase();
      const bodyText = typeof res.body === 'string' ? res.body : JSON.stringify(res.body || {});
      const refreshHint =
        lowered.includes('invalid_token') ||
        lowered.includes('error=') ||
        /refresh|expired|re-?authent/i.test(bodyText);
      out.push(assert(
        'refresh guidance surfaced (error= in challenge or refresh hint in body)',
        refreshHint,
        'invalid_token / expired / refresh hint',
        wwwAuth + ' || body: ' + bodyText.slice(0, 120),
      ));
      out.push(assertStructuredResponse(res, [401]));
      return out;
    }));
  }

  // ─── Summary ──────────────────────────────────────────
  const written = await writeRunSummary(SCRIPT_NAME, scenarios, env.origin);
  note(`results written to ${written.path}`);
  return printSummary(written.summary);
}

main()
  .then(code => process.exit(code))
  .catch(err => {
    console.error(`${c.red}infra error:${c.reset} ${err.stack || err.message || err}`);
    process.exit(2);
  });
