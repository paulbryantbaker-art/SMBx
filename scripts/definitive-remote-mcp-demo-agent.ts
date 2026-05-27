#!/usr/bin/env npx tsx
/**
 * Remote MCP demo-agent smoke.
 *
 * Point this at local, staging, or production to debug what a connector/agent
 * will see over HTTP.
 *
 * Required for authenticated tool calls:
 *   DEFINITIVE_MCP_ACCESS_TOKEN=<audience-bound MCP token>
 *   or DEFINITIVE_APP_JWT=<signed-in smbX human JWT used to mint an agent token>
 *
 * Optional:
 *   DEFINITIVE_TEST_BASE_URL=https://app.smbx.ai
 *   DEFINITIVE_DEMO_WRITE=1     # also runs a small DealPayload ingest
 */

const BASE_URL = (process.env.DEFINITIVE_TEST_BASE_URL || process.env.SMBX_CONNECTOR_BASE_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '');

let passed = 0;
let failed = 0;

console.log('\nsmbX remote MCP demo-agent smoke');
console.log(`Target: ${BASE_URL}`);

await test('public discovery endpoints are reachable', async () => {
  const mcpManifest = await publicJson('/.well-known/mcp');
  assertEqual(mcpManifest.mcp_version, '2025-11-25', 'MCP manifest protocol version');
  assert(mcpManifest.endpoints?.some((endpoint: any) => endpoint.type === 'mcp-streamable-http'), 'MCP manifest advertises Streamable HTTP endpoint');

  const serverCard = await publicJson('/.well-known/mcp/server-card.json');
  assertEqual(serverCard.name, 'smbx-ai/diligence', 'server-card name');
  assert(String(serverCard.serverUrl || '').endsWith('/mcp'), 'server-card points to /mcp');

  const oauth = await publicJson('/.well-known/oauth-protected-resource/mcp');
  assert(String(oauth.resource || '').endsWith('/mcp'), 'protected-resource metadata uses an /mcp resource');
});

await test('MCP initialize and tools/list work without bearer execution auth', async () => {
  const initialized = await postMcp({
    jsonrpc: '2.0',
    id: 'demo-init',
    method: 'initialize',
    params: {
      protocolVersion: '2025-11-25',
      capabilities: {},
      clientInfo: { name: 'smbx-demo-agent-smoke', version: '0.1.0' },
    },
  });
  assertEqual(initialized.status, 200, 'initialize status');
  assertEqual(initialized.body.result?.protocolVersion, '2025-11-25', 'initialize protocol');

  const tools = await postMcp({ jsonrpc: '2.0', id: 'demo-tools', method: 'tools/list', params: {} });
  assertEqual(tools.status, 200, 'tools/list status');
  assert(tools.body.result?.tools?.some((tool: any) => tool.name === 'compose_model_stack'), 'tools/list exposes compose_model_stack');
});

const token = await resolveAccessToken();
if (!token) {
  console.log('\nNo DEFINITIVE_MCP_ACCESS_TOKEN or DEFINITIVE_APP_JWT supplied, so authenticated demo-agent calls were skipped.');
  console.log('Set DEFINITIVE_APP_JWT to mint a scoped agent token, or set DEFINITIVE_MCP_ACCESS_TOKEN directly.');
} else {
  await test('unauthenticated execution challenges with protected-resource metadata', async () => {
    const denied = await postMcp({
      jsonrpc: '2.0',
      id: 'demo-denied',
      method: 'tools/call',
      params: { name: 'introspect_capabilities', arguments: {} },
    });
    assertEqual(denied.status, 401, 'unauthenticated tools/call status');
    assert(String(denied.headers.get('www-authenticate') || '').includes('resource_metadata='), 'WWW-Authenticate includes resource_metadata');
  });

  await test('demo agent can call introspect_capabilities over /mcp', async () => {
    const call = await postMcp({
      jsonrpc: '2.0',
      id: 'demo-introspect',
      method: 'tools/call',
      params: {
        name: 'introspect_capabilities',
        arguments: {
          journey: 'buy',
          objective: 'demo agent connector smoke',
          includeTools: true,
        },
        _meta: { requestId: 'demo-agent-introspect' },
      },
    }, token);
    assertEqual(call.status, 200, 'authenticated MCP tools/call status');
    assertEqual(call.body.result?.isError, false, 'introspect call succeeds');
    assertEqual(call.body.result?.structuredContent?.toolName, 'introspect_capabilities', 'structured tool name');
  });

  await test('demo agent can look up a model slot over /mcp', async () => {
    const call = await postMcp({
      jsonrpc: '2.0',
      id: 'demo-model-slot',
      method: 'tools/call',
      params: {
        name: 'lookup_model_slot',
        arguments: {
          slotId: 'M109',
        },
        _meta: { requestId: 'demo-agent-model-slot' },
      },
    }, token);
    assertEqual(call.status, 200, 'lookup_model_slot status');
    assertEqual(call.body.result?.isError, false, 'lookup_model_slot succeeds');
    assert(call.body.result?.structuredContent?.result, 'lookup_model_slot returns structured result');
  });

  await test('demo agent can run market-supported LBO over /mcp', async () => {
    const ingest = await callTool(token, 'ingest_deal_payload', {
      idempotencyKey: `demo-agent-lbo-${Date.now()}`,
      payload: {
        journey: 'buy',
        targetName: 'Demo HVAC Services Co.',
        industry: 'HVAC services',
        jurisdiction: 'US-TX',
        revenueCents: 24_000_000_00,
        ebitdaCents: 5_000_000_00,
        purchasePriceCents: 40_000_000_00,
        documents: [{ id: 'demo-ttm', name: 'Demo TTM financials', type: 'financials', hash: 'sha256:demo-ttm' }],
      },
    }, 'demo-agent-lbo-ingest');
    assertToolSuccess(ingest, 'ingest_deal_payload');
    const dealStateResult = unwrapToolResult(ingest.body.result?.structuredContent);
    assert(dealStateResult?.dealState?.cid, 'LBO ingest returns DealState CID');

    const market = await callTool(token, 'fetch_market_data', {
      dataType: 'market_multiples',
      calculation: 'lbo',
      industry: 'HVAC services',
      naicsCode: '238220',
      geography: 'US-TX',
      league: 'L4',
      metric: 'ebitda',
    }, 'demo-agent-lbo-market');
    assertToolSuccess(market, 'fetch_market_data');
    const marketResult = unwrapToolResult(market.body.result?.structuredContent);
    const packet = marketResult?.marketMultiplePacket;
    assertEqual(packet?.schema, 'MarketMultiplePacket.v0.1', 'market multiple packet schema');
    assertEqual(packet?.status, 'resolved', `market multiple packet resolved; source gaps: ${JSON.stringify(packet?.sourceGaps || [])}`);
    assert(packet.citations?.length > 0, 'market multiple packet carries citations');

    const lbo = await callTool(token, 'execute_model', {
      modelId: 'MODEL.LBO.LMM.v1',
      input: {
        purchase_price_cents: 40_000_000_00,
        debt_cents: 24_000_000_00,
        sponsor_equity_cents: 16_000_000_00,
        entry_ebitda_cents: 5_000_000_00,
        hold_years: 5,
        ebitda_growth_pct: 0.05,
        debt_paydown_cents: 10_000_000_00,
      },
      marketMultiplePacket: packet,
      industry: 'HVAC services',
      geography: 'US-TX',
      league: 'L4',
      metric: 'ebitda',
    }, 'demo-agent-lbo-execute');
    assertToolSuccess(lbo, 'execute_model');
    const lboResult = unwrapToolResult(lbo.body.result?.structuredContent);
    assertEqual(lboResult?.execution?.status, 'complete', 'LBO execution status');
    assertEqual(lboResult?.execution?.inputs?.exit_multiple, packet.exitMultipleBase, 'LBO input uses market packet exit multiple');
    assertEqual(lboResult?.marketMultipleResolution?.assumptions?.[0]?.sourceType, 'market_packet', 'LBO assumption provenance');
    assert(lboResult?.execution?.outputHash, 'LBO execution includes output hash');
    assert(lboResult?.modelExecutionId, 'LBO execution is persisted/auditable');
    assert(Number(lboResult?.execution?.outputs?.moic) > 0, 'LBO execution returns MOIC output');
  });

  const demoDealId = Number(process.env.DEFINITIVE_DEMO_DEAL_ID);
  if (Number.isFinite(demoDealId) && demoDealId > 0) {
    await test('demo agent can compose a model stack over /mcp for a known deal', async () => {
      const call = await postMcp({
        jsonrpc: '2.0',
        id: 'demo-stack',
        method: 'tools/call',
        params: {
          name: 'compose_model_stack',
          arguments: {
            dealId: demoDealId,
            journey: 'buy',
            league: 'L3',
            dealType: 'lower middle market acquisition',
          },
          _meta: { requestId: 'demo-agent-model-stack' },
        },
      }, token);
      assertEqual(call.status, 200, 'compose_model_stack status');
      assertEqual(call.body.result?.isError, false, 'compose_model_stack succeeds');
      assert(call.body.result?.structuredContent?.result, 'compose_model_stack returns structured result');
    });
  }

  if (process.env.DEFINITIVE_DEMO_WRITE === '1') {
    await test('demo agent can ingest a small sample DealPayload over /mcp', async () => {
      const call = await postMcp({
        jsonrpc: '2.0',
        id: 'demo-ingest',
        method: 'tools/call',
        params: {
          name: 'ingest_deal_payload',
          arguments: {
            idempotencyKey: `demo-agent-${Date.now()}`,
            payload: {
              journey: 'buy',
              targetName: 'Demo Services Co.',
              industry: 'B2B services',
              jurisdiction: 'US',
              revenueCents: 3_500_000_00,
              ebitdaCents: 700_000_00,
              purchasePriceCents: 4_500_000_00,
            },
          },
          _meta: { requestId: 'demo-agent-ingest' },
        },
      }, token);
      assertEqual(call.status, 200, 'ingest_deal_payload status');
      assertEqual(call.body.result?.isError, false, 'ingest_deal_payload succeeds');
      const toolResult = unwrapToolResult(call.body.result?.structuredContent);
      assert(toolResult?.dealState, 'ingest returns DealState');
      assert(call.body.result?.structuredContent?.persistence?.ok === true, 'ingest persists DealState call packet');
    });
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

async function resolveAccessToken() {
  const direct = process.env.DEFINITIVE_MCP_ACCESS_TOKEN || process.env.SMBX_MCP_ACCESS_TOKEN;
  if (direct) return direct;

  const appJwt = process.env.DEFINITIVE_APP_JWT || process.env.SMBX_APP_JWT;
  if (!appJwt) return null;

  const response = await fetch(`${BASE_URL}/api/definitive/agent-tokens`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${appJwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      profile: 'deal_operator',
      agentId: 'agent:smbx-demo-agent-smoke',
      agentPlatformId: 'demo_agent',
      clientId: 'smbx-demo-agent-smoke',
      expiresInMinutes: 60,
    }),
  });
  const body = await response.json().catch(() => ({}));
  assert(response.ok, `agent token mint expected ok, got ${response.status}: ${JSON.stringify(body)}`);
  return body.token;
}

async function publicJson(path: string) {
  const response = await fetch(`${BASE_URL}${path}`);
  const body = await response.json().catch(() => ({}));
  assert(response.ok, `${path} expected public ok status, got ${response.status}: ${JSON.stringify(body)}`);
  return body;
}

async function postMcp(body: Record<string, any>, token?: string) {
  const response = await fetch(`${BASE_URL}/mcp`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: 'application/json, text/event-stream',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return {
    status: response.status,
    headers: response.headers,
    body: await response.json().catch(() => ({})),
  };
}

async function callTool(token: string, name: string, args: Record<string, any>, requestId: string) {
  return postMcp({
    jsonrpc: '2.0',
    id: requestId,
    method: 'tools/call',
    params: {
      name,
      arguments: args,
      _meta: { requestId },
    },
  }, token);
}

function assertToolSuccess(call: Awaited<ReturnType<typeof postMcp>>, toolName: string) {
  assertEqual(call.status, 200, `${toolName} status`);
  assertEqual(call.body.result?.isError, false, `${toolName} succeeds`);
  assertEqual(call.body.result?.structuredContent?.toolName, toolName, `${toolName} structured tool name`);
}

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err: any) {
    console.log(`  ✗ ${name} - ${err.message}`);
    failed++;
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function unwrapToolResult(structuredContent: any) {
  const result = structuredContent?.result;
  return result?.result && typeof result.result === 'object' ? result.result : result;
}
