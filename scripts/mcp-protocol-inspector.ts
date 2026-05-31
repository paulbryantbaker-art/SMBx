#!/usr/bin/env npx tsx
/**
 * MCP Protocol Conformance Inspector.
 *
 * Walks every spec-required behavior of the smbX DEFINITIVE /mcp endpoint:
 * initialize handshake, ping, tools/list, tools/call (authed + unauthed),
 * structured error envelopes, WWW-Authenticate challenge format, server.json
 * shape, .well-known/oauth-protected-resource shape, agent-card content,
 * tool annotations, version pinning, refusal envelopes.
 *
 * This is the artifact platform auth reviews ask for. Save the JSON output
 * and attach it to Claude Connector / ChatGPT GPT Actions / MCP Registry
 * submissions.
 *
 * Usage:
 *   TEST_MODE=true npx tsx scripts/mcp-protocol-inspector.ts
 *   MCP_TARGET=https://smbx.ai npx tsx scripts/mcp-protocol-inspector.ts
 *
 * Exit codes:
 *   0  — all checks passed (or only soft warnings)
 *   1  — at least one hard check failed
 *   2  — infrastructure error (target unreachable)
 */

import 'dotenv/config';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { mintLocalAgentToken } from '../testing/agent-pov/runner-helpers.js';

const TARGET = (process.env.MCP_TARGET || 'http://localhost:3000').replace(/\/+$/, '');

// ─── ANSI ─────────────────────────────────────────────────────────────────
const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m',
};

interface Check {
  category: string;
  id: string;
  description: string;
  status: 'pass' | 'fail' | 'warn';
  expected?: string;
  actual?: string;
  notes?: string;
}

const checks: Check[] = [];
function pass(category: string, id: string, description: string, notes?: string) {
  checks.push({ category, id, description, status: 'pass', notes });
}
function fail(category: string, id: string, description: string, expected: string, actual: string) {
  checks.push({ category, id, description, status: 'fail', expected, actual });
}
function warn(category: string, id: string, description: string, notes: string) {
  checks.push({ category, id, description, status: 'warn', notes });
}

// ─── Helpers ──────────────────────────────────────────────────────────────

async function jsonRpc(method: string, params?: any, opts: { bearer?: string } = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'MCP-Protocol-Version': '2025-03-26',
  };
  if (opts.bearer) headers['Authorization'] = `Bearer ${opts.bearer}`;
  const body = { jsonrpc: '2.0', id: Math.random().toString(36).slice(2), method, ...(params ? { params } : {}) };
  const res = await fetch(`${TARGET}/mcp`, { method: 'POST', headers, body: JSON.stringify(body) });
  const text = await res.text();
  let parsed: any = null;
  try { parsed = JSON.parse(text); } catch {}
  return { status: res.status, headers: Object.fromEntries(res.headers.entries()), body: parsed, raw: text };
}

async function getJson(path: string) {
  const res = await fetch(`${TARGET}${path}`, { method: 'GET' });
  const text = await res.text();
  let parsed: any = null;
  try { parsed = JSON.parse(text); } catch {}
  return { status: res.status, headers: Object.fromEntries(res.headers.entries()), body: parsed, raw: text };
}

// ─── Section 1: Discovery / well-known endpoints ──────────────────────────

async function checkDiscovery() {
  const cat = '1. Discovery';

  const agent = await getJson('/.well-known/agent-card.json');
  if (agent.status === 200 && agent.body && typeof agent.body === 'object') {
    pass(cat, '1.1', '/.well-known/agent-card.json returns 200 + valid JSON');
    if (agent.body.name && agent.body.description) pass(cat, '1.2', 'agent-card has name + description');
    else fail(cat, '1.2', 'agent-card has name + description', 'name+description', JSON.stringify(agent.body).slice(0, 80));
  } else {
    fail(cat, '1.1', '/.well-known/agent-card.json returns 200 + valid JSON', '200 + object', `${agent.status} / ${typeof agent.body}`);
  }

  const card = await getJson('/.well-known/mcp/server-card.json');
  if (card.status === 200 && card.body?.tools && Array.isArray(card.body.tools)) {
    pass(cat, '1.3', `server-card lists tools[] (count=${card.body.tools.length})`);
  } else {
    fail(cat, '1.3', 'server-card lists tools[]', '200 + tools[]', `${card.status} / ${typeof card.body?.tools}`);
  }

  const manifest = await getJson('/.well-known/mcp');
  if (manifest.status === 200 && manifest.body?.endpoints) {
    pass(cat, '1.4', `.well-known/mcp manifest enumerates endpoints (count=${manifest.body.endpoints.length})`);
  } else {
    fail(cat, '1.4', '.well-known/mcp manifest', '200 + endpoints[]', String(manifest.status));
  }

  const prm = await getJson('/.well-known/oauth-protected-resource/mcp');
  if (prm.status === 200 && prm.body?.resource && Array.isArray(prm.body?.authorization_servers) && prm.body?.bearer_methods_supported) {
    pass(cat, '1.5', 'protected-resource metadata (RFC 9728) shape is valid');
  } else {
    fail(cat, '1.5', 'protected-resource metadata (RFC 9728)', '{ resource, authorization_servers[], bearer_methods_supported }', JSON.stringify(prm.body).slice(0, 120));
  }

  const asMeta = await getJson('/.well-known/oauth-authorization-server');
  if (asMeta.status === 200 && asMeta.body?.issuer && asMeta.body?.authorization_endpoint && asMeta.body?.token_endpoint) {
    pass(cat, '1.6', 'authorization-server metadata (RFC 8414) shape is valid');
  } else {
    fail(cat, '1.6', 'authorization-server metadata (RFC 8414)', '{ issuer, authorization_endpoint, token_endpoint }', JSON.stringify(asMeta.body).slice(0, 120));
  }

  const sj = await getJson('/server.json');
  if (sj.status === 200 && sj.body?.name && sj.body?.remotes?.[0]?.type === 'streamable-http') {
    pass(cat, '1.7', `server.json shape ok (transport=${sj.body.remotes[0].type})`);
  } else {
    fail(cat, '1.7', 'server.json shape', '{ name, remotes:[{type:"streamable-http"}] }', JSON.stringify(sj.body?.remotes).slice(0, 120));
  }
  if (sj.body?.auth?.type === 'oauth2' && sj.body?.auth?.protected_resource_metadata) {
    pass(cat, '1.8', 'server.json has root-level auth.oauth2 metadata');
  } else {
    fail(cat, '1.8', 'server.json root auth.oauth2', 'auth.type=oauth2 + protected_resource_metadata', JSON.stringify(sj.body?.auth));
  }
  if (sj.body?.remotes?.[0]?.auth?.type === 'oauth2') {
    pass(cat, '1.9', 'server.json has per-remote auth.oauth2 metadata');
  } else {
    fail(cat, '1.9', 'server.json per-remote auth', 'remotes[0].auth.type=oauth2', JSON.stringify(sj.body?.remotes?.[0]?.auth));
  }
}

// ─── Section 2: MCP protocol — initialize + ping + tools/list ─────────────

async function checkProtocol() {
  const cat = '2. Protocol';

  const init = await jsonRpc('initialize', {
    protocolVersion: '2025-03-26',
    capabilities: {},
    clientInfo: { name: 'mcp-protocol-inspector', version: '0.1.0' },
  });
  if (init.status === 200 && init.body?.result?.protocolVersion && init.body?.result?.serverInfo) {
    pass(cat, '2.1', `initialize handshake (protocol=${init.body.result.protocolVersion})`);
  } else {
    fail(cat, '2.1', 'initialize handshake', '200 + result.protocolVersion + result.serverInfo', `${init.status} / ${JSON.stringify(init.body?.result).slice(0, 80)}`);
  }

  if (init.body?.result?.capabilities?.tools) {
    pass(cat, '2.2', 'initialize.result.capabilities declares tools');
  } else {
    fail(cat, '2.2', 'initialize declares tools capability', 'result.capabilities.tools', JSON.stringify(init.body?.result?.capabilities));
  }

  const ping = await jsonRpc('ping');
  if (ping.status === 200 && ping.body?.result !== undefined) {
    pass(cat, '2.3', 'ping returns 200 + result');
  } else {
    fail(cat, '2.3', 'ping responds', '200 + result', `${ping.status} / ${JSON.stringify(ping.body)}`);
  }

  const list = await jsonRpc('tools/list');
  if (list.status === 200 && Array.isArray(list.body?.result?.tools)) {
    const tools = list.body.result.tools;
    pass(cat, '2.4', `tools/list returns ${tools.length} tools`);
    const withSchema = tools.filter((t: any) => t.inputSchema && typeof t.inputSchema === 'object').length;
    if (withSchema === tools.length) {
      pass(cat, '2.5', 'every tool has inputSchema');
    } else {
      fail(cat, '2.5', 'every tool has inputSchema', `${tools.length}/${tools.length}`, `${withSchema}/${tools.length}`);
    }
    const withDesc = tools.filter((t: any) => t.description && t.description.length > 0).length;
    if (withDesc === tools.length) {
      pass(cat, '2.6', 'every tool has description');
    } else {
      fail(cat, '2.6', 'every tool has description', `${tools.length}/${tools.length}`, `${withDesc}/${tools.length}`);
    }
    const withAnnotations = tools.filter((t: any) => t.annotations).length;
    if (withAnnotations === tools.length) {
      pass(cat, '2.7', 'every tool has annotations (readOnlyHint / destructiveHint / openWorldHint)');
    } else {
      warn(cat, '2.7', 'tool annotations', `${withAnnotations}/${tools.length} have annotations — non-fatal but recommended for agent UX`);
    }
  } else {
    fail(cat, '2.4', 'tools/list returns tools[]', '200 + result.tools[]', `${list.status}`);
  }

  // Unknown method should return JSON-RPC -32601
  const unknown = await jsonRpc('totally/fake/method');
  if (unknown.body?.error?.code === -32601) {
    pass(cat, '2.8', 'unknown method returns JSON-RPC -32601 (Method not found)');
  } else {
    fail(cat, '2.8', 'unknown method returns -32601', '-32601', JSON.stringify(unknown.body?.error));
  }
}

// ─── Section 3: Auth boundary ─────────────────────────────────────────────

async function checkAuth() {
  const cat = '3. Auth';

  const unauth = await jsonRpc('tools/call', { name: 'ingest_deal_payload', arguments: { journey: 'buy' } });
  if (unauth.status === 401) {
    pass(cat, '3.1', 'unauthenticated tools/call returns 401');
  } else {
    fail(cat, '3.1', 'unauthenticated tools/call returns 401', '401', String(unauth.status));
  }
  const www = unauth.headers['www-authenticate'] || unauth.headers['WWW-Authenticate'];
  if (www && /Bearer/i.test(www)) {
    pass(cat, '3.2', 'WWW-Authenticate header present with Bearer scheme');
  } else {
    fail(cat, '3.2', 'WWW-Authenticate: Bearer', 'Bearer …', String(www));
  }
  if (www && /resource_metadata=/.test(www)) {
    pass(cat, '3.3', 'WWW-Authenticate carries resource_metadata pointer (RFC 9728)');
  } else {
    fail(cat, '3.3', 'WWW-Authenticate carries resource_metadata', 'resource_metadata="…"', String(www));
  }
  if (www && /scope=/.test(www)) {
    pass(cat, '3.4', 'WWW-Authenticate carries required scope hint');
  } else {
    warn(cat, '3.4', 'WWW-Authenticate scope hint', 'recommended but not strictly required by RFC 6750');
  }
  if (unauth.body?.error?.code === -32001) {
    pass(cat, '3.5', 'unauthenticated JSON-RPC error uses -32001 (Invalid token)');
  } else {
    fail(cat, '3.5', 'JSON-RPC -32001 on invalid token', '-32001', JSON.stringify(unauth.body?.error));
  }

  // Expired/invalid token should return error=invalid_token (RFC 6750)
  const badTokenRes = await fetch(`${TARGET}/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.invalid.invalid',
      'MCP-Protocol-Version': '2025-03-26',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: '1', method: 'tools/call', params: { name: 'ping', arguments: {} } }),
  });
  const badWww = badTokenRes.headers.get('www-authenticate') || '';
  if (/error="invalid_token"/.test(badWww)) {
    pass(cat, '3.6', 'invalid bearer triggers WWW-Authenticate error="invalid_token" (RFC 6750)');
  } else {
    fail(cat, '3.6', 'invalid bearer → error="invalid_token"', 'error="invalid_token"', badWww || 'missing WWW-Authenticate');
  }
}

// ─── Section 4: Authed tools/call — happy + structured refusals ───────────

async function checkAuthedCalls() {
  const cat = '4. Authed calls';
  const bearer = await mintLocalAgentToken({ agentIdentity: 'mcp-inspector' });
  if (!bearer) {
    fail(cat, '4.0', 'mint local agent token', 'token', 'null — JWT_SECRET or DB unavailable');
    return;
  }

  // Happy path
  const ingest = await jsonRpc('tools/call', {
    name: 'ingest_deal_payload',
    arguments: { journey: 'buy', target_industry: 'B2B services', target_jurisdiction: 'US-TX', target_sde: 2_500_000_00, target_revenue: 8_000_000_00 },
  }, { bearer });
  if (ingest.status === 200 && ingest.body?.result?.structuredContent) {
    pass(cat, '4.1', `authed ingest_deal_payload returns 200 + structuredContent (auditTrailId=${ingest.body.result.structuredContent.auditTrailId})`);
  } else {
    fail(cat, '4.1', 'authed ingest_deal_payload', '200 + structuredContent', `${ingest.status} / ${JSON.stringify(ingest.body?.error)}`);
  }

  const sc = ingest.body?.result?.structuredContent;
  if (sc?.specVersion && sc?.methodologyVersion) {
    pass(cat, '4.2', `response carries spec + methodology version pins (${sc.specVersion} / ${sc.methodologyVersion})`);
  } else {
    fail(cat, '4.2', 'response carries version pins', 'specVersion + methodologyVersion', JSON.stringify(sc).slice(0, 80));
  }
  if (sc?.mandateChain?.principal && sc?.mandateChain?.agent) {
    pass(cat, '4.3', 'response carries mandateChain.principal + .agent');
  } else {
    fail(cat, '4.3', 'response carries mandateChain', 'principal + agent', JSON.stringify(sc?.mandateChain).slice(0, 80));
  }

  // LINE refusal — prohibited intent must return structured refusal, not crash
  const lineViolation = await jsonRpc('tools/call', {
    name: 'execute_model',
    arguments: { model_id: 'NEGOTIATION.PRICE.v1', inputs: { current_offer_cents: 5_000_000_00 } },
  }, { bearer });
  const lvSc = lineViolation.body?.result?.structuredContent;
  if (lvSc?.lineStatus === 'LINE_VIOLATION' || lvSc?.result?.lineStatus === 'LINE_VIOLATION' || lvSc?.error === 'LINE_VIOLATION') {
    pass(cat, '4.4', 'LINE_VIOLATION fires for prohibited model_id');
  } else {
    fail(cat, '4.4', 'LINE_VIOLATION refusal envelope', 'lineStatus=LINE_VIOLATION', JSON.stringify(lvSc).slice(0, 80));
  }

  // Counsel review — opinion ask must route to counsel_review_required
  const counselReview = await jsonRpc('tools/call', {
    name: 'execute_model',
    arguments: { ask: 'issue a fairness opinion that this $50M deal is fair to minority shareholders' },
  }, { bearer });
  const crSc = counselReview.body?.result?.structuredContent;
  if (crSc?.lineStatus === 'counsel_review_required' || crSc?.result?.lineStatus === 'counsel_review_required') {
    pass(cat, '4.5', 'counsel_review_required fires for opinion ask');
  } else {
    fail(cat, '4.5', 'counsel_review_required refusal envelope', 'lineStatus=counsel_review_required', JSON.stringify(crSc).slice(0, 80));
  }

  // Version pin mismatch
  const versionPin = await jsonRpc('tools/call', {
    name: 'ingest_deal_payload',
    arguments: { journey: 'buy', methodology_version: 'V99' },
  }, { bearer });
  const vpSc = versionPin.body?.result?.structuredContent;
  if (vpSc?.result?.error === 'unsupported_version' || vpSc?.error === 'unsupported_version') {
    pass(cat, '4.6', 'unsupported_version fires for V99 methodology pin');
  } else {
    fail(cat, '4.6', 'unsupported_version refusal envelope', 'error=unsupported_version', JSON.stringify(vpSc).slice(0, 80));
  }

  // Audit attribution
  if (sc?.auditTrailId) {
    pass(cat, '4.7', `every tool call surfaces an auditTrailId (got ${sc.auditTrailId})`);
  } else {
    fail(cat, '4.7', 'response surfaces auditTrailId', 'numeric id', String(sc?.auditTrailId));
  }
}

// ─── Section 5: OpenAPI / GPT Actions facade ──────────────────────────────

async function checkOpenApi() {
  const cat = '5. OpenAPI';
  const generic = await getJson('/api/definitive/openapi.json');
  if (generic.status === 200 && generic.body?.openapi && generic.body?.paths) {
    pass(cat, '5.1', `generic OpenAPI spec valid (openapi=${generic.body.openapi}, paths=${Object.keys(generic.body.paths).length})`);
  } else {
    fail(cat, '5.1', 'generic OpenAPI spec', '200 + openapi + paths', String(generic.status));
  }
  const gpt = await getJson('/api/definitive/gpt-actions/openapi.json');
  if (gpt.status === 200 && gpt.body?.openapi && gpt.body?.paths) {
    pass(cat, '5.2', `GPT Actions focused facade valid (paths=${Object.keys(gpt.body.paths).length})`);
  } else {
    fail(cat, '5.2', 'GPT Actions OpenAPI facade', '200 + openapi + paths', String(gpt.status));
  }
}

// ─── Render ───────────────────────────────────────────────────────────────

function render() {
  const HR = '━'.repeat(82);
  console.log(`${C.bold}${C.cyan}${HR}${C.reset}`);
  console.log(`  ${C.bold}MCP Protocol Conformance Inspector — ${TARGET}${C.reset}`);
  console.log(`${C.bold}${C.cyan}${HR}${C.reset}\n`);

  const byCategory = new Map<string, Check[]>();
  for (const c of checks) {
    const slot = byCategory.get(c.category) || [];
    slot.push(c);
    byCategory.set(c.category, slot);
  }

  let totalPass = 0, totalFail = 0, totalWarn = 0;
  for (const [cat, items] of byCategory) {
    console.log(`${C.bold}${cat}${C.reset}`);
    for (const c of items) {
      const mark =
        c.status === 'pass' ? `${C.green}✓${C.reset}` :
        c.status === 'warn' ? `${C.yellow}◐${C.reset}` :
                              `${C.red}✗${C.reset}`;
      console.log(`  ${mark} ${C.dim}${c.id}${C.reset}  ${c.description}`);
      if (c.status === 'fail') {
        console.log(`      ${C.dim}expected:${C.reset} ${c.expected}`);
        console.log(`      ${C.dim}actual:${C.reset}   ${c.actual}`);
      } else if (c.status === 'warn' && c.notes) {
        console.log(`      ${C.dim}note:${C.reset} ${c.notes}`);
      }
      if (c.status === 'pass') totalPass++;
      else if (c.status === 'fail') totalFail++;
      else totalWarn++;
    }
    console.log('');
  }

  console.log(`${C.bold}${C.cyan}${HR}${C.reset}`);
  const passColor = totalFail === 0 ? C.green : C.red;
  console.log(`  ${passColor}Pass: ${totalPass}${C.reset}   ${totalFail > 0 ? C.red : C.dim}Fail: ${totalFail}${C.reset}   ${totalWarn > 0 ? C.yellow : C.dim}Warn: ${totalWarn}${C.reset}   Total: ${checks.length}`);
  console.log(`${C.bold}${C.cyan}${HR}${C.reset}\n`);

  return { totalPass, totalFail, totalWarn };
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log(`${C.dim}Probing ${TARGET}/mcp ...${C.reset}\n`);
  try {
    await checkDiscovery();
    await checkProtocol();
    await checkAuth();
    await checkAuthedCalls();
    await checkOpenApi();
  } catch (err: any) {
    console.error(`${C.red}Infrastructure error:${C.reset} ${err.message}`);
    process.exit(2);
  }

  const summary = render();

  // Write artifact for platform submissions
  const resultsDir = 'testing/agent-pov/results';
  if (!existsSync(resultsDir)) mkdirSync(resultsDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const artifact = `${resultsDir}/mcp-protocol-inspector-${stamp}.json`;
  writeFileSync(artifact, JSON.stringify({
    target: TARGET,
    timestamp: new Date().toISOString(),
    summary,
    checks,
  }, null, 2));
  console.log(`  ${C.dim}Inspector report:${C.reset} ${artifact}\n`);

  process.exit(summary.totalFail === 0 ? 0 : 1);
}

main();
