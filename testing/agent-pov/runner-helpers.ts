/**
 * Shared runner utilities for the agent-POV substrate test suite.
 *
 * All harnesses import from this file. Keeps MCP client wrapping, OAuth
 * scaffolding, JWT minting, and assertion helpers consistent across the
 * 15 harnesses + simulation runner.
 *
 * Patterned after scripts/definitive-mcp-e2e-fixtures.ts so test infrastructure
 * is shared, not duplicated. Differences: this helper is harness-agnostic and
 * does not assume a specific scenario, persona, or journey.
 */

import 'dotenv/config';
import { randomBytes, createHash } from 'node:crypto';
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import type {
  AssertionResult,
  PayloadFixture,
  RunSummary,
  ScenarioResult,
} from './types.js';

// ─── Color helpers ─────────────────────────────────────────
export const c = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

export function ok(label: string) { console.log(`  ${c.green}✓${c.reset} ${label}`); }
export function bad(label: string) { console.log(`  ${c.red}✗${c.reset} ${label}`); }
export function skip(label: string, reason: string) { console.log(`  ${c.yellow}◐${c.reset} ${label} ${c.gray}(${reason})${c.reset}`); }
export function note(text: string) { console.log(`    ${c.gray}${text}${c.reset}`); }
export function header(text: string) { console.log(`\n${c.bold}${c.blue}━━ ${text} ━━${c.reset}`); }

// ─── Environment ───────────────────────────────────────────

export interface RunnerEnv {
  origin: string;
  hasDb: boolean;
  jwtSecret: string | null;
  testMode: boolean;
}

export function readEnv(): RunnerEnv {
  return {
    origin: (process.env.AGENT_POV_TARGET || process.env.APP_URL || 'http://127.0.0.1:3000').replace(/\/+$/, ''),
    hasDb: Boolean(process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL),
    jwtSecret: process.env.JWT_SECRET || null,
    testMode: process.env.TEST_MODE !== 'false',
  };
}

// ─── MCP client wrapper ────────────────────────────────────

export interface McpCallOptions {
  /** Bearer token for authenticated calls. If absent, call goes anonymous. */
  bearer?: string;
  /** Override URL for this call only */
  url?: string;
  /** Additional headers */
  headers?: Record<string, string>;
  /** Timeout in ms */
  timeoutMs?: number;
}

export interface McpResponse {
  status: number;
  body: any;
  headers: Record<string, string>;
}

export class McpClient {
  constructor(public readonly env: RunnerEnv) {}

  /** Call POST /mcp (Streamable HTTP transport) with JSON-RPC payload */
  async mcpCall(method: string, params: any, opts: McpCallOptions = {}): Promise<McpResponse> {
    const url = opts.url || `${this.env.origin}/mcp`;
    const body = {
      jsonrpc: '2.0',
      id: randomBytes(8).toString('hex'),
      method,
      params,
    };
    return this.rawPost(url, body, opts);
  }

  /** Call the legacy authenticated tool surface at /api/definitive/tools/call */
  async toolCall(toolName: string, input: any, envelope: any = {}, opts: McpCallOptions = {}): Promise<McpResponse> {
    const url = opts.url || `${this.env.origin}/api/definitive/tools/${toolName}/call`;
    return this.rawPost(url, { input, envelope }, opts);
  }

  /** GET an endpoint and return the parsed body */
  async get(path: string, opts: McpCallOptions = {}): Promise<McpResponse> {
    const url = opts.url || `${this.env.origin}${path}`;
    const headers: Record<string, string> = { ...(opts.headers || {}) };
    if (opts.bearer) headers['Authorization'] = `Bearer ${opts.bearer}`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs || 30_000);
    try {
      const res = await fetch(url, { method: 'GET', headers, signal: ctrl.signal });
      const text = await res.text();
      let parsed: any = text;
      try { parsed = JSON.parse(text); } catch { /* keep raw */ }
      return {
        status: res.status,
        body: parsed,
        headers: Object.fromEntries(res.headers.entries()),
      };
    } finally {
      clearTimeout(timer);
    }
  }

  private async rawPost(url: string, body: any, opts: McpCallOptions): Promise<McpResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(opts.headers || {}),
    };
    if (opts.bearer) headers['Authorization'] = `Bearer ${opts.bearer}`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs || 30_000);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      const text = await res.text();
      let parsed: any = text;
      try { parsed = JSON.parse(text); } catch { /* keep raw */ }
      return {
        status: res.status,
        body: parsed,
        headers: Object.fromEntries(res.headers.entries()),
      };
    } finally {
      clearTimeout(timer);
    }
  }
}

// ─── Token minting (for local DB-backed tests) ────────────

/**
 * Mint a scoped agent token directly via the local DB. Mirrors the pattern in
 * scripts/definitive-mcp-e2e-fixtures.ts. Only usable when DATABASE_URL +
 * JWT_SECRET are set (local dev or Railway one-off run).
 *
 * Returns null if requirements not met — callers should fall back to using
 * a pre-existing DEFINITIVE_MCP_ACCESS_TOKEN env var.
 */
/** Default scopes covering every tool's TOOL_SCOPE requirement in definitiveMcp.ts.
 *  Kept in sync manually because importing the substrate's map pulls in DB at module load.
 *  When new tools are added with new scopes, append here. */
const DEFAULT_AGENT_SCOPES = [
  // Core
  'capability:read', 'methodology:read', 'tools:call',
  // Deal state + classify
  'deal-state:read', 'deal-state:write', 'deal-state:diff',
  'deal:classify', 'deal:read', 'deal:write',
  // Completeness + plan
  'completeness:read', 'deal-plan:read',
  // Models
  'model:execute', 'model:read', 'model-catalog:read', 'model-stack:compose',
  // Studio + data room
  'studio:draft', 'studio:read', 'data-room:read',
  // Package + permutations
  'deal-package:read', 'deal-package:verify', 'deal-package:compose', 'permutation:read',
  // Audit + immutable + conformance
  'audit:read', 'audit:write', 'immutable:write', 'conformance:read',
  // Authority + citation + market data
  'authority:read', 'citation:read', 'market-data:read',
  // Pricing + corpus
  'pricing:read', 'pass-through:read', 'corpus:read', 'corpus:write', 'data-rights:read',
  // Counsel + admin/enterprise
  'counsel:deferral:create', 'counsel:review', 'admin:read', 'enterprise:scope',
];

export async function mintLocalAgentToken(opts: {
  /** Origin the token will be bound to. MUST match the substrate's APP_URL or the
   *  audience validator will reject. Default: process.env.APP_URL. */
  origin?: string;
  /** Real DB userId. If absent, the helper will SELECT a fixture user from the DB. */
  userId?: number;
  beneficialCustomerId?: string | number;
  agentIdentity?: string;
  agentPlatformId?: string;
  mandateId?: string;
  scopes?: string[];
  tier?: 'free' | 'solo' | 'pro' | 'team' | 'enterprise';
  /** Token lifetime in seconds from now. Default 3600. Negative values produce expired tokens
   *  (useful for FM-006-style expired-token tests). */
  expiresInSeconds?: number;
}): Promise<string | null> {
  const env = readEnv();
  if (!env.jwtSecret) return null;
  try {
    const origin = (opts.origin || process.env.APP_URL || env.origin).replace(/\/+$/, '');
    const audience = `${origin}/mcp`;
    // Resolve a real userId. The substrate's MCP transport rejects tokens with
    // missing/invalid userId per definitiveRemoteMcpTransport.ts. Most realistic:
    // pull a user from the DB. Fallback: use opts.userId if caller provided.
    let userId = opts.userId;
    if (!userId && env.hasDb) {
      try {
        const pg = await import('postgres');
        const sql = (pg as any).default(process.env.DATABASE_URL!, { ssl: 'require', max: 1 });
        const rows = await sql`SELECT id FROM users ORDER BY id ASC LIMIT 1`;
        if (rows.length) userId = Number(rows[0].id);
        await sql.end({ timeout: 5 });
      } catch (err) {
        note(`mintLocalAgentToken: DB lookup for userId failed: ${(err as Error).message}`);
      }
    }
    if (!userId) {
      note('mintLocalAgentToken: no userId available (provide opts.userId or seed a users row)');
      return null;
    }
    const { default: jwt } = await import('jsonwebtoken') as any;
    const now = Math.floor(Date.now() / 1000);
    const lifetime = opts.expiresInSeconds ?? 3600;
    const payload: Record<string, unknown> = {
      userId,
      tokenUse: 'definitive_agent',
      scopes: opts.scopes || DEFAULT_AGENT_SCOPES,
      agentId: opts.agentIdentity || `agent_${randomBytes(4).toString('hex')}`,
      beneficialCustomerId: opts.beneficialCustomerId !== undefined ? opts.beneficialCustomerId : userId,
      mandateId: opts.mandateId,
      agentPlatformId: opts.agentPlatformId,
      iat: now,
      exp: now + lifetime,
      aud: audience,
      iss: origin,
    };
    return jwt.sign(payload, env.jwtSecret);
  } catch (err) {
    note(`mintLocalAgentToken failed: ${(err as Error).message}`);
    return null;
  }
}

/**
 * Plain JSON POST against an arbitrary endpoint. Used by harnesses that need to
 * hit non-MCP HTTP surfaces (OAuth /oauth/token, /oauth/register, audit-packet
 * REST endpoints, etc.). Returns the same {status, body, headers} shape as McpClient.
 */
export async function rawPostJson(
  url: string,
  body: any,
  opts: { bearer?: string; headers?: Record<string, string>; timeoutMs?: number } = {},
): Promise<McpResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(opts.headers || {}),
  };
  if (opts.bearer) headers['Authorization'] = `Bearer ${opts.bearer}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs || 30_000);
  try {
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal: ctrl.signal });
    const text = await res.text();
    let parsed: any = text;
    try { parsed = JSON.parse(text); } catch { /* keep raw */ }
    return { status: res.status, body: parsed, headers: Object.fromEntries(res.headers.entries()) };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Form-encoded POST (for OAuth token endpoints that expect application/x-www-form-urlencoded).
 */
export async function rawPostForm(
  url: string,
  fields: Record<string, string>,
  opts: { bearer?: string; headers?: Record<string, string>; timeoutMs?: number } = {},
): Promise<McpResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json',
    ...(opts.headers || {}),
  };
  if (opts.bearer) headers['Authorization'] = `Bearer ${opts.bearer}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs || 30_000);
  try {
    const body = new URLSearchParams(fields).toString();
    const res = await fetch(url, { method: 'POST', headers, body, signal: ctrl.signal });
    const text = await res.text();
    let parsed: any = text;
    try { parsed = JSON.parse(text); } catch { /* keep raw */ }
    return { status: res.status, body: parsed, headers: Object.fromEntries(res.headers.entries()) };
  } finally {
    clearTimeout(timer);
  }
}

/** Case-insensitive header lookup. */
export function getHeader(headers: Record<string, string>, name: string): string | undefined {
  const target = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === target) return value;
  }
  return undefined;
}

/**
 * Unwrap the substrate's tool-call response envelope.
 *
 * The MCP transport wraps tool responses in `result.structuredContent.result` or
 * `result.structuredContent`. The legacy /api/definitive/tools/<name>/call route
 * returns a more direct shape. This helper normalizes both into a single value.
 *
 * Returns the inner result or undefined if the response is an error.
 */
export function unwrap(res: McpResponse): any {
  if (!res || typeof res.body !== 'object' || res.body === null) return undefined;
  const body = res.body;
  // MCP JSON-RPC: { jsonrpc, id, result: { structuredContent: { result: <actual> } } }
  if (body.result?.structuredContent?.result !== undefined) return body.result.structuredContent.result;
  if (body.result?.structuredContent !== undefined) return body.result.structuredContent;
  if (body.result !== undefined) return body.result;
  // Legacy /api/definitive/tools/*/call envelope: returns the result fields directly under body
  return body;
}

/** True if the response represents any kind of tool error / refusal envelope. */
export function isToolError(res: McpResponse): boolean {
  if (res.status >= 400) return true;
  const body = res.body;
  if (!body || typeof body !== 'object') return true;
  if (body.error !== undefined) return true;
  if (body.result?.isError === true) return true;
  // Refusal envelopes show up under unwrap().status or unwrap().line_status
  const inner = unwrap(res);
  if (inner?.error) return true;
  if (inner?.status && ['LINE_VIOLATION', 'human_approval_required', 'counsel_review_required', 'enterprise_scope_required', 'credit_budget_required', 'unsupported_version'].includes(inner.status)) return true;
  return false;
}

/** Extract an audit_id / audit_trail_id / auditTrailId from a substrate response (any shape). */
export function extractAuditId(res: McpResponse): string | undefined {
  const inner = unwrap(res);
  return (
    inner?.audit_id ||
    inner?.auditId ||
    inner?.audit_trail_id ||
    inner?.auditTrailId ||
    inner?.persistence?.audit_trail_id ||
    inner?.persistence?.auditTrailId ||
    inner?.persistence?.packet_id ||
    inner?.persistence?.packetId
  );
}

// ─── Assertion helpers ─────────────────────────────────────

export function assert(description: string, passed: boolean, expected?: unknown, actual?: unknown): AssertionResult {
  const result: AssertionResult = { description, passed };
  if (expected !== undefined) result.expected = expected;
  if (actual !== undefined) result.actual = actual;
  if (passed) ok(description); else { bad(description); if (expected !== undefined) note(`expected: ${JSON.stringify(expected)}`); if (actual !== undefined) note(`actual:   ${JSON.stringify(actual)}`); }
  return result;
}

export function assertStructuredResponse(res: McpResponse, allowedStatusCodes: number[] = [200, 400, 401, 403, 422]): AssertionResult {
  const isStructured = allowedStatusCodes.includes(res.status) && res.body !== null && typeof res.body === 'object';
  return assert(
    `structured response (status ∈ [${allowedStatusCodes.join(',')}], body is object)`,
    isStructured,
    `status in ${allowedStatusCodes.join('|')}, body is object`,
    `status=${res.status}, body type=${typeof res.body}`,
  );
}

export function assertNoFiveHundred(res: McpResponse): AssertionResult {
  return assert(
    'no 5xx response (substrate must never crash)',
    res.status < 500,
    '< 500',
    res.status,
  );
}

export function assertHasField(res: McpResponse, fieldPath: string): AssertionResult {
  const value = getPath(res.body, fieldPath);
  return assert(
    `response has field "${fieldPath}"`,
    value !== undefined,
    'defined',
    value === undefined ? 'undefined' : 'defined',
  );
}

export function assertHasNextCalls(res: McpResponse, atLeastTools: string[] = []): AssertionResult {
  // Substrate wraps tool output in multiple envelope layers. Walk every reasonable path.
  // Order from shallow to deep — first non-undefined wins. Includes the
  // result.result.* paths that show up after the simulation runner pre-unwraps
  // structuredContent.
  const nextCalls =
    getPath(res.body, 'next_suggested_calls') ??
    getPath(res.body, 'nextSuggestedCalls') ??
    getPath(res.body, 'result.next_suggested_calls') ??
    getPath(res.body, 'result.nextSuggestedCalls') ??
    getPath(res.body, 'result.result.next_suggested_calls') ??
    getPath(res.body, 'result.result.nextSuggestedCalls') ??
    getPath(res.body, 'result.structuredContent.next_suggested_calls') ??
    getPath(res.body, 'result.structuredContent.nextSuggestedCalls') ??
    getPath(res.body, 'result.structuredContent.result.next_suggested_calls') ??
    getPath(res.body, 'result.structuredContent.result.nextSuggestedCalls') ??
    getPath(res.body, 'result.structuredContent.result.result.next_suggested_calls') ??
    getPath(res.body, 'result.structuredContent.result.result.nextSuggestedCalls');
  if (!Array.isArray(nextCalls)) {
    return assert('next_suggested_calls is array', false, 'array', typeof nextCalls);
  }
  if (atLeastTools.length === 0) return assert('next_suggested_calls present', true);
  // Substrate uses `toolName` field; some shapes use `tool` or `name`. Check all.
  const names = nextCalls.map((c: any) => (typeof c === 'string' ? c : (c?.toolName || c?.tool || c?.name))).filter(Boolean);
  const missing = atLeastTools.filter(t => !names.includes(t));
  return assert(
    `next_suggested_calls includes [${atLeastTools.join(', ')}]`,
    missing.length === 0,
    atLeastTools,
    `missing: ${missing.join(', ')}; available: ${names.join(', ')}`,
  );
}

export function assertHasVersionPins(res: McpResponse): AssertionResult {
  // DEFINITIVE substrate emits the camelCase form (methodologyVersion,
  // specVersion); legacy/snake_case surfaces are still accepted for compat.
  const methodologyVersion =
    getPath(res.body, 'methodologyVersion')
    ?? getPath(res.body, 'methodology_version')
    ?? getPath(res.body, 'result.methodologyVersion')
    ?? getPath(res.body, 'result.methodology_version');
  const specVersion =
    getPath(res.body, 'specVersion')
    ?? getPath(res.body, 'spec_version')
    ?? getPath(res.body, 'result.specVersion')
    ?? getPath(res.body, 'result.spec_version');
  const both = Boolean(methodologyVersion && specVersion);
  return assert(
    'response carries methodology_version + spec_version',
    both,
    'both present',
    `methodology=${methodologyVersion}, spec=${specVersion}`,
  );
}

export function assertRefusalEnvelope(res: McpResponse, expectedType: string, expectedViolationType?: string): AssertionResult {
  // Substrate emits refusal info at multiple paths depending on whether the call
  // hit the legacy tools/* surface or the MCP /mcp Streamable HTTP transport.
  // Check both snake_case and camelCase; check shallow and deep paths.
  const candidates: Array<unknown> = [
    // Shallow paths (legacy /api/definitive/tools/* responses)
    getPath(res.body, 'error'),
    getPath(res.body, 'error.code'),
    getPath(res.body, 'code'),
    getPath(res.body, 'tollgate.status'),
    getPath(res.body, 'tollgate.code'),
    getPath(res.body, 'status'),
    getPath(res.body, 'line_status'),
    getPath(res.body, 'lineStatus'),
    // JSON-RPC error wrapper paths — `/mcp` transport wraps substrate 403/400
    // responses inside { jsonrpc, id, error: { code: -32003, message, data: { error, lineStatus, ... } } }
    // so the actual envelope code lives under error.data.error / error.data.lineStatus.
    getPath(res.body, 'error.data.error'),
    getPath(res.body, 'error.data.lineStatus'),
    getPath(res.body, 'error.data.line_status'),
    getPath(res.body, 'error.message'),
    // MCP envelope paths
    getPath(res.body, 'result.line_status'),
    getPath(res.body, 'result.lineStatus'),
    getPath(res.body, 'result.structuredContent.lineStatus'),
    getPath(res.body, 'result.structuredContent.line_status'),
    getPath(res.body, 'result.structuredContent.error'),
    getPath(res.body, 'result.structuredContent.tollgate.status'),
    getPath(res.body, 'result.structuredContent.tollgate.code'),
    getPath(res.body, 'result.structuredContent.result.lineStatus'),
    getPath(res.body, 'result.structuredContent.result.line_status'),
    getPath(res.body, 'result.structuredContent.result.error'),
    getPath(res.body, 'result.structuredContent.result.tollgate.status'),
  ];
  const matched = candidates.some(c => c === expectedType);
  if (!matched) {
    const summary = candidates.filter(c => c !== undefined && c !== null).slice(0, 4).map(c => JSON.stringify(c)).join('; ');
    return assert(`refusal envelope = "${expectedType}"`, false, expectedType, `seen=${summary || 'none'}`);
  }
  if (expectedViolationType) {
    const vCandidates: Array<unknown> = [
      getPath(res.body, 'violation_type'),
      getPath(res.body, 'violationType'),
      getPath(res.body, 'error.violation_type'),
      getPath(res.body, 'tollgate.violation_type'),
      getPath(res.body, 'tollgate.violationType'),
      getPath(res.body, 'result.structuredContent.violation_type'),
      getPath(res.body, 'result.structuredContent.violationType'),
      getPath(res.body, 'result.structuredContent.tollgate.violation_type'),
      getPath(res.body, 'result.structuredContent.tollgate.violationType'),
    ];
    const vType = vCandidates.find(c => typeof c === 'string');
    return assert(
      `LINE_VIOLATION violation_type = "${expectedViolationType}"`,
      vType === expectedViolationType,
      expectedViolationType,
      String(vType),
    );
  }
  return assert(`refusal envelope = "${expectedType}"`, true);
}

// ─── Deep field access (dot-path) ──────────────────────────

export function getPath(obj: any, path: string): any {
  if (obj === null || obj === undefined) return undefined;
  return path.split('.').reduce((acc: any, key) => (acc === null || acc === undefined ? undefined : acc[key]), obj);
}

// ─── Hashing (for parity / determinism checks) ────────────

export function sha256(value: any): string {
  const json = typeof value === 'string' ? value : JSON.stringify(value, Object.keys(value || {}).sort());
  return createHash('sha256').update(json).digest('hex');
}

// ─── Result writers ────────────────────────────────────────

export async function writeRunSummary(
  scriptName: string,
  scenarios: ScenarioResult[],
  origin: string,
): Promise<{ path: string; summary: RunSummary }> {
  const runId = `${Date.now()}-${randomBytes(4).toString('hex')}`;
  const summary: RunSummary = {
    runId,
    startedAt: scenarios[0] ? new Date(Date.now() - scenarios.reduce((a, s) => a + s.durationMs, 0)).toISOString() : new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    target: origin,
    scenarios,
    totalPass: scenarios.filter(s => s.status === 'pass').length,
    totalFail: scenarios.filter(s => s.status === 'fail').length,
    totalSkip: scenarios.filter(s => s.status === 'skip').length,
    totalError: scenarios.filter(s => s.status === 'error').length,
  };
  const outputDir = resolve(process.cwd(), 'testing/agent-pov/results');
  const outputPath = resolve(outputDir, `${scriptName}-${runId}.json`);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(summary, null, 2), 'utf8');
  return { path: outputPath, summary };
}

export function printSummary(summary: RunSummary): number {
  header('Summary');
  console.log(`  ${c.green}pass${c.reset}:  ${summary.totalPass}`);
  console.log(`  ${c.red}fail${c.reset}:  ${summary.totalFail}`);
  console.log(`  ${c.yellow}skip${c.reset}:  ${summary.totalSkip}`);
  console.log(`  ${c.red}error${c.reset}: ${summary.totalError}`);
  console.log(`  total: ${summary.scenarios.length}`);
  const exitCode = summary.totalFail + summary.totalError > 0 ? 1 : 0;
  console.log(`\nExit code: ${exitCode === 0 ? c.green + '0' : c.red + '1'}${c.reset}`);
  return exitCode;
}

// ─── Scenario runner ──────────────────────────────────────

export async function runScenario(
  id: string,
  category: ScenarioResult['category'],
  fn: () => Promise<AssertionResult[]>,
): Promise<ScenarioResult> {
  const startedAt = Date.now();
  console.log(`\n${c.bold}[${id}]${c.reset}`);
  let assertions: AssertionResult[] = [];
  let status: ScenarioResult['status'] = 'pass';
  let notes: string | undefined;
  try {
    assertions = await fn();
    status = assertions.every(a => a.passed) ? 'pass' : 'fail';
  } catch (err) {
    status = 'error';
    notes = (err as Error).message;
    bad(`scenario errored: ${notes}`);
  }
  return {
    id,
    category,
    status,
    durationMs: Date.now() - startedAt,
    assertions,
    notes,
  };
}

// ─── Fixture loader ───────────────────────────────────────

export async function loadPayloadFixtures(dir: string): Promise<PayloadFixture[]> {
  const { readdir, readFile } = await import('node:fs/promises');
  const files = (await readdir(dir)).filter(f => f.endsWith('.json'));
  const fixtures: PayloadFixture[] = [];
  for (const file of files) {
    const text = await readFile(resolve(dir, file), 'utf8');
    fixtures.push(JSON.parse(text) as PayloadFixture);
  }
  return fixtures;
}
