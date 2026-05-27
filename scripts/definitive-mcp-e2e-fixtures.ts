#!/usr/bin/env npx tsx
/**
 * Authenticated remote MCP E2E fixture runner.
 *
 * This is the "trust the connector" gate:
 *   agent -> /mcp -> DealState/model/doc packets -> persistence/audit ->
 *   protected app APIs -> optional desktop/mobile browser retrieval.
 *
 * Local happy path:
 *   npm run dev
 *   PORT=3000 APP_URL=http://127.0.0.1:3000 npx tsx server/index.ts
 *   DEFINITIVE_TEST_BASE_URL=http://127.0.0.1:3000 \
 *   DEFINITIVE_APP_BASE_URL=http://localhost:5173 \
 *   npm run test:definitive-mcp-e2e
 */

import 'dotenv/config';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';

type Journey = 'buy' | 'sell' | 'raise' | 'pmi';

interface FixtureDeal {
  journey: Journey;
  dealId: number;
  title: string;
  expectedPacketTypes: string[];
  latestStateCid?: string;
  latestStateHash?: string;
  packetRowIds: number[];
  modelExecutionIds: number[];
}

interface FixtureContext {
  runId: string;
  baseUrl: string;
  appBaseUrl: string | null;
  userId: number | null;
  appJwt: string | null;
  mcpToken: string;
  agentId: string;
  agentPlatformId: string;
  mandateId: string;
  deals: Record<Journey, FixtureDeal>;
  runStartedAt: string;
}

interface TestRecord {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  message?: string;
}

const BASE_URL = normalizeBaseUrl(process.env.DEFINITIVE_TEST_BASE_URL || process.env.SMBX_CONNECTOR_BASE_URL || 'http://127.0.0.1:3000');
const APP_BASE_URL = normalizeOptionalBaseUrl(process.env.DEFINITIVE_APP_BASE_URL || process.env.SMBX_APP_BASE_URL || inferLocalAppUrl(BASE_URL));
const RUN_ID = process.env.DEFINITIVE_MCP_E2E_RUN_ID || `mcp-e2e-${compactTimestamp()}-${randomUUID().slice(0, 8)}`;
const FIXTURE_EMAIL = process.env.DEFINITIVE_MCP_E2E_FIXTURE_EMAIL || 'definitive-mcp-e2e@smbx.test';
const FIXTURE_KEY = 'definitive-mcp-e2e';
const HAS_DB = Boolean(process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL);
const SHOULD_SEED_DB = HAS_DB && process.env.DEFINITIVE_MCP_E2E_SEED_DB !== '0';
const SHOULD_VERIFY_DB = HAS_DB && process.env.DEFINITIVE_MCP_E2E_SKIP_DB_VERIFY !== '1';
const SHOULD_VERIFY_BROWSER = process.env.DEFINITIVE_MCP_E2E_SKIP_BROWSER !== '1' && Boolean(APP_BASE_URL);
const RESULTS_DIR = process.env.DEFINITIVE_MCP_E2E_RESULTS_DIR || path.resolve(process.cwd(), 'testing/definitive/results');
const E2E_SCOPES = [
  'capability:read',
  'methodology:read',
  'authority:read',
  'deal-state:read',
  'deal-state:write',
  'deal:classify',
  'deal:read',
  'deal-plan:read',
  'model-catalog:read',
  'model-stack:compose',
  'model:read',
  'model:execute',
  'studio:draft',
  'data-room:read',
  'completeness:read',
  'deal-package:read',
  'deal-package:compose',
  'deal-package:verify',
  'permutation:read',
  'audit:write',
  'market-data:read',
  'citation:read',
  'conformance:read',
] as const;

const REQUIRED_TOOLS = [
  'ingest_deal_payload',
  'update_deal_payload',
  'get_deal_state',
  'fetch_market_data',
  'execute_model',
  'list_model_executions',
  'compose_model_stack',
  'prepare_loi_packet',
  'compose_deal_package',
  'compose_data_room_index',
  'prepare_diligence_request',
  'compose_document_draft',
  'prepare_negotiation_brief',
  'compose_close_readiness',
  'generate_funds_flow',
  'compose_pmi_plan',
  'close_deal',
] as const;

let passed = 0;
let failed = 0;
let skipped = 0;
let callSequence = 0;
const records: TestRecord[] = [];
const resultSummary: Record<string, any> = {
  runId: RUN_ID,
  target: BASE_URL,
  appBaseUrl: APP_BASE_URL,
  startedAt: new Date().toISOString(),
  fixtures: {},
};

console.log('\nsmbX authenticated MCP full-stack E2E fixtures');
console.log(`Run: ${RUN_ID}`);
console.log(`MCP/API target: ${BASE_URL}`);
console.log(`App target: ${APP_BASE_URL || '(browser retrieval disabled; set DEFINITIVE_APP_BASE_URL to enable)'}`);

try {
  const localFixture = SHOULD_SEED_DB ? await ensureLocalFixture() : await fixtureFromEnv();
  const appJwt = await resolveAppJwt(localFixture.userId);
  const mcpToken = await resolveAccessToken(appJwt);
  if (!mcpToken) {
    throw new Error('A scoped MCP token is required. Set DEFINITIVE_MCP_ACCESS_TOKEN, set DEFINITIVE_APP_JWT, or run with DATABASE_URL/JWT_SECRET so the script can seed and mint a local token.');
  }

  const ctx: FixtureContext = {
    runId: RUN_ID,
    baseUrl: BASE_URL,
    appBaseUrl: APP_BASE_URL,
    userId: localFixture.userId,
    appJwt,
    mcpToken,
    agentId: `agent:smbx-mcp-e2e:${RUN_ID}`,
    agentPlatformId: 'codex_mcp_e2e_fixture',
    mandateId: `mandate:smbx-mcp-e2e:${RUN_ID}`,
    deals: localFixture.deals,
    runStartedAt: new Date().toISOString(),
  };

  await test('public discovery, initialize, tools/list, and unauthenticated challenge', () => verifyDiscoveryAndChallenge(ctx));
  await test('FIX-BUY-LBO-001 executes through /mcp and persists LBO/LOI/package artifacts', () => runBuyFixture(ctx));
  await test('FIX-SELLREP-001 executes sell-side LOI/DD/close readiness through /mcp', () => runSellRepFixture(ctx));
  await test('FIX-RAISE-001 executes raise-side investor material path through /mcp', () => runRaiseFixture(ctx));
  await test('FIX-PMI-001 executes post-close PMI path through /mcp', () => runPmiFixture(ctx));
  await test('FIX-LINE-001 refuses an unauthorized close action over /mcp', () => runLineFixture(ctx));
  await test('protected app APIs retrieve connector-created DealState, packets, and model rows', () => verifyProtectedAppApis(ctx));

  if (SHOULD_VERIFY_DB) {
    await test('DB persistence/audit rows exist for DealState packets and model executions', () => verifyDbPersistence(ctx));
  } else {
    markSkip('DB persistence/audit rows exist for DealState packets and model executions', 'Set DATABASE_URL or unset DEFINITIVE_MCP_E2E_SKIP_DB_VERIFY to enable direct DB verification.');
  }

  if (SHOULD_VERIFY_BROWSER) {
    await test('desktop and mobile app surfaces open connector-created work', () => verifyBrowserSurfaces(ctx));
  } else {
    markSkip('desktop and mobile app surfaces open connector-created work', 'Set DEFINITIVE_APP_BASE_URL or unset DEFINITIVE_MCP_E2E_SKIP_BROWSER to enable Playwright retrieval.');
  }

  resultSummary.finishedAt = new Date().toISOString();
  resultSummary.totals = { passed, failed, skipped };
  resultSummary.records = records;
  await writeResultSummary();
} catch (err: any) {
  failed++;
  records.push({ name: 'runner setup', status: 'fail', message: err.message });
  resultSummary.finishedAt = new Date().toISOString();
  resultSummary.totals = { passed, failed, skipped };
  resultSummary.records = records;
  await writeResultSummary().catch(() => undefined);
  console.log(`  ✗ runner setup - ${err.message}`);
}

console.log(`\n${passed} passed, ${failed} failed, ${skipped} skipped`);
await cleanupResources();
process.exit(failed > 0 ? 1 : 0);

async function verifyDiscoveryAndChallenge(ctx: FixtureContext) {
  const manifest = await publicJson('/.well-known/mcp');
  assertEqual(manifest.mcp_version, '2025-11-25', 'MCP manifest protocol version');
  assert(manifest.endpoints?.some((endpoint: any) => endpoint.type === 'mcp-streamable-http'), 'MCP manifest advertises Streamable HTTP');

  const initialized = await postMcp(ctx, {
    jsonrpc: '2.0',
    id: `${RUN_ID}:initialize`,
    method: 'initialize',
    params: {
      protocolVersion: '2025-11-25',
      capabilities: {},
      clientInfo: { name: 'smbx-mcp-e2e-fixtures', version: '0.1.0' },
    },
  });
  assertEqual(initialized.status, 200, 'initialize status');
  assertEqual(initialized.body.result?.protocolVersion, '2025-11-25', 'initialize protocol');

  const listed = await postMcp(ctx, { jsonrpc: '2.0', id: `${RUN_ID}:tools`, method: 'tools/list', params: {} });
  assertEqual(listed.status, 200, 'tools/list status');
  const toolNames = listed.body.result?.tools?.map((tool: any) => tool.name) || [];
  for (const name of REQUIRED_TOOLS) assert(toolNames.includes(name), `tools/list includes ${name}`);

  const denied = await postMcp(ctx, {
    jsonrpc: '2.0',
    id: `${RUN_ID}:denied`,
    method: 'tools/call',
    params: { name: 'introspect_capabilities', arguments: {} },
  });
  assertEqual(denied.status, 401, 'unauthenticated tools/call status');
  assert(String(denied.headers.get('www-authenticate') || '').includes('resource_metadata='), 'unauthenticated challenge includes resource metadata');
}

async function runBuyFixture(ctx: FixtureContext) {
  const fixture = ctx.deals.buy;
  const payload = {
    dealId: fixture.dealId,
    journey: 'buy',
    targetName: fixture.title,
    industry: 'HVAC services',
    naicsCode: '238220',
    jurisdiction: 'US-TX',
    league: 'L4',
    dealType: 'lower-middle-market acquisition LBO',
    structure: 'asset purchase with working capital true-up',
    revenueCents: 24_000_000_00,
    ebitdaCents: 5_000_000_00,
    purchasePriceCents: 40_000_000_00,
    workingCapitalPegCents: 3_200_000_00,
    documents: [
      sourceDoc('buy-ttm', 'TTM financial statements', 'financials'),
      sourceDoc('buy-qoe', 'QoE summary', 'financials'),
      sourceDoc('buy-customers', 'Customer concentration export', 'commercial'),
      sourceDoc('buy-loi', 'Draft LOI issue list', 'legal'),
      sourceDoc('buy-tax', 'Tax structure notes', 'tax'),
      sourceDoc('buy-financing', 'Debt term sheet', 'financing'),
    ],
  };

  const ingest = await callTool(ctx, 'ingest_deal_payload', {
    idempotencyKey: `${RUN_ID}:BUY:ingest`,
    payload,
  }, 'BUY-ingest');
  let state = extractDealState(ingest);
  assertEqual(state.classificationKey?.journey, 'buy', 'buy fixture classifies as buy');
  assertEqual(Number(state.payload?.dealId), fixture.dealId, 'buy DealState carries dealId');
  recordState(ctx, 'buy', ingest, state);

  const market = await callTool(ctx, 'fetch_market_data', {
    dataType: 'market_multiples',
    calculation: 'lbo',
    industry: 'HVAC services',
    naicsCode: '238220',
    geography: 'US-TX',
    league: 'L4',
    metric: 'ebitda',
  }, 'BUY-market');
  const marketResult = unwrapToolResult(market);
  const marketPacket = marketResult?.marketMultiplePacket;
  assertEqual(marketPacket?.schema, 'MarketMultiplePacket.v0.1', 'buy market packet schema');
  assertEqual(marketPacket?.status, 'resolved', `buy market packet resolved; source gaps ${JSON.stringify(marketPacket?.sourceGaps || [])}`);
  assert(Array.isArray(marketPacket?.citations) && marketPacket.citations.length > 0, 'buy market packet carries citations');

  const model = await callTool(ctx, 'execute_model', {
    dealId: fixture.dealId,
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
    marketMultiplePacket: marketPacket,
    industry: 'HVAC services',
    geography: 'US-TX',
    league: 'L4',
    metric: 'ebitda',
  }, 'BUY-lbo');
  const modelResult = unwrapToolResult(model);
  assertEqual(modelResult?.execution?.status, 'complete', 'buy LBO execution complete');
  assert(modelResult?.execution?.outputHash, 'buy LBO has output hash');
  assert(modelResult?.modelExecutionId, 'buy LBO persisted model execution id');
  fixture.modelExecutionIds.push(Number(modelResult.modelExecutionId));

  const update = await callTool(ctx, 'update_deal_payload', {
    idempotencyKey: `${RUN_ID}:BUY:model-attach`,
    dealState: state,
    patch: {
      modelOutputs: [
        {
          id: `model-output:${modelResult.modelExecutionId}`,
          modelId: modelResult.execution.modelId,
          modelExecutionId: modelResult.modelExecutionId,
          outputHash: modelResult.execution.outputHash,
          source: 'mcp_e2e',
        },
      ],
      marketIntelligence: [
        {
          packetId: marketPacket.packetId,
          schema: marketPacket.schema,
          status: marketPacket.status,
          citations: marketPacket.citations,
          source: 'fetch_market_data',
        },
      ],
    },
  }, 'BUY-update-model');
  state = extractDealState(update);
  recordState(ctx, 'buy', update, state);

  const loi = await callTool(ctx, 'prepare_loi_packet', { dealState: state }, 'BUY-loi');
  const loiPacket = unwrapToolResult(loi)?.loiPacket;
  assertEqual(loiPacket?.schema, 'LOIPacket.v0.1', 'buy LOI packet schema');
  assertEqual(loiPacket?.loiBoundary?.noBindingOffer, true, 'buy LOI does not bind offer');
  recordState(ctx, 'buy', loi, extractDealState(loi));

  const dealPackage = await callTool(ctx, 'compose_deal_package', { dealState: state }, 'BUY-package');
  assertEqual(unwrapToolResult(dealPackage)?.dealPackage?.schema, 'DealPackage.v0.1', 'buy deal package schema');
  recordState(ctx, 'buy', dealPackage, extractDealState(dealPackage));

  await verifyMcpReadBack(ctx, fixture, 'buy');
}

async function runSellRepFixture(ctx: FixtureContext) {
  const fixture = ctx.deals.sell;
  const payload = {
    dealId: fixture.dealId,
    journey: 'sell',
    targetName: fixture.title,
    companyName: fixture.title,
    industry: 'specialty manufacturing',
    jurisdiction: 'US-OH',
    league: 'L3',
    actorRole: 'owner_representative',
    representationRole: 'sell-side advisor',
    representationSide: 'sell_side',
    objective: 'prepare the owner for buyer LOI review and diligence',
    dealType: 'sell-side owner representation',
    revenueCents: 12_500_000_00,
    ebitdaCents: 2_400_000_00,
    sdeCents: 2_750_000_00,
    askingPriceCents: 15_000_000_00,
    workingCapitalPegCents: 1_150_000_00,
    documents: [
      sourceDoc('sell-ttm', 'Owner TTM P&L', 'financials'),
      sourceDoc('sell-tax', 'Seller tax return summary', 'tax'),
      sourceDoc('sell-legal', 'Material contracts index', 'legal'),
      sourceDoc('sell-customers', 'Top customer concentration file', 'commercial'),
      sourceDoc('sell-ops', 'Operations and employee overview', 'operations'),
    ],
    modelOutputs: [
      {
        id: 'sellrep-qoe-lite',
        modelId: 'MODEL.QOE.LITE.v1',
        outputHash: `sha256:${RUN_ID}:sellrep-qoe-lite`,
        source: 'synthetic_fixture',
      },
    ],
  };

  const ingest = await callTool(ctx, 'ingest_deal_payload', {
    idempotencyKey: `${RUN_ID}:SELLREP:ingest`,
    payload,
  }, 'SELLREP-ingest');
  let state = extractDealState(ingest);
  const ingestResult = unwrapToolResult(ingest);
  assertEqual(state.classificationKey?.journey, 'sell', 'sellrep fixture classifies as sell');
  assertEqual(representationSide(ingestResult, state), 'sell_side', 'sellrep representation side is sell-side');
  recordState(ctx, 'sell', ingest, state);

  const dataRoom = await callTool(ctx, 'compose_data_room_index', { dealState: state }, 'SELLREP-data-room');
  assertEqual(unwrapToolResult(dataRoom)?.dataRoomIndex?.schema, 'DataRoomIndex.v0.1', 'sellrep data room schema');
  recordState(ctx, 'sell', dataRoom, extractDealState(dataRoom));

  const diligence = await callTool(ctx, 'prepare_diligence_request', { dealState: state }, 'SELLREP-dd-request');
  assertEqual(unwrapToolResult(diligence)?.diligenceRequest?.schema, 'DiligenceRequest.v0.1', 'sellrep diligence schema');
  recordState(ctx, 'sell', diligence, extractDealState(diligence));

  const loiReadiness = await callTool(ctx, 'compose_document_draft', {
    dealState: state,
    documentType: 'seller_loi_readiness',
  }, 'SELLREP-loi-readiness');
  assertEqual(unwrapToolResult(loiReadiness)?.documentDraft?.documentType, 'seller_loi_readiness', 'sellrep LOI readiness draft type');
  recordState(ctx, 'sell', loiReadiness, extractDealState(loiReadiness));

  const ddReadiness = await callTool(ctx, 'compose_document_draft', {
    dealState: state,
    documentType: 'seller_diligence_readiness',
  }, 'SELLREP-dd-readiness');
  assertEqual(unwrapToolResult(ddReadiness)?.documentDraft?.documentType, 'seller_diligence_readiness', 'sellrep diligence readiness draft type');
  recordState(ctx, 'sell', ddReadiness, extractDealState(ddReadiness));

  const incomingLoi = await callTool(ctx, 'update_deal_payload', {
    idempotencyKey: `${RUN_ID}:SELLREP:incoming-loi`,
    dealState: state,
    patch: {
      incomingLoi: {
        buyerName: 'Synthetic Strategic Buyer',
        enterpriseValueCents: 15_500_000_00,
        structure: 'asset purchase with rollover option',
        exclusivityDays: 45,
        escrowPercent: 0.1,
        sourceRef: 'sell-incoming-loi',
      },
      documents: [
        ...payload.documents,
        sourceDoc('sell-incoming-loi', 'Incoming buyer LOI', 'legal'),
        sourceDoc('sell-financing', 'Buyer financing evidence summary', 'financing'),
      ],
    },
  }, 'SELLREP-update-loi');
  state = extractDealState(incomingLoi);
  recordState(ctx, 'sell', incomingLoi, state);

  const loi = await callTool(ctx, 'prepare_loi_packet', { dealState: state }, 'SELLREP-loi-packet');
  const loiPacket = unwrapToolResult(loi)?.loiPacket;
  assertEqual(loiPacket?.schema, 'LOIPacket.v0.1', 'sellrep LOI packet schema');
  assertEqual(representationSide({ representationContext: loiPacket?.representationContext }, state), 'sell_side', 'sellrep LOI keeps sell-side posture');
  recordState(ctx, 'sell', loi, extractDealState(loi));

  const negotiation = await callTool(ctx, 'prepare_negotiation_brief', { dealState: state }, 'SELLREP-negotiation');
  assertEqual(unwrapToolResult(negotiation)?.negotiationBrief?.schema, 'NegotiationBrief.v0.1', 'sellrep negotiation brief schema');
  recordState(ctx, 'sell', negotiation, extractDealState(negotiation));

  const closeReadiness = await callTool(ctx, 'compose_close_readiness', { dealState: state }, 'SELLREP-close-readiness');
  assertEqual(unwrapToolResult(closeReadiness)?.closeReadiness?.schema, 'CloseReadiness.v0.1', 'sellrep close readiness schema');
  recordState(ctx, 'sell', closeReadiness, extractDealState(closeReadiness));

  const fundsFlow = await callTool(ctx, 'generate_funds_flow', { dealState: state }, 'SELLREP-funds-flow');
  const flow = unwrapToolResult(fundsFlow)?.fundsFlow;
  assertEqual(flow?.schema, 'FundsFlow.v0.1', 'sellrep funds-flow schema');
  assertEqual(flow?.fundsFlowBoundary?.noWireInstructions, true, 'sellrep funds-flow does not issue wire instructions');
  assertEqual(flow?.fundsFlowBoundary?.noMoneyMovement, true, 'sellrep funds-flow does not move money');
  recordState(ctx, 'sell', fundsFlow, extractDealState(fundsFlow));

  await verifyMcpReadBack(ctx, fixture, 'sell');
}

async function runRaiseFixture(ctx: FixtureContext) {
  const fixture = ctx.deals.raise;
  const payload = {
    dealId: fixture.dealId,
    journey: 'raise',
    targetName: fixture.title,
    companyName: fixture.title,
    industry: 'vertical SaaS',
    jurisdiction: 'US-DE',
    league: 'L3',
    dealType: 'growth equity raise',
    revenueCents: 6_800_000_00,
    ebitdaCents: 900_000_00,
    raiseAmountCents: 8_000_000_00,
    useOfFunds: ['sales team expansion', 'implementation automation', 'customer success hiring'],
    currentTerms: { security: 'preferred equity', targetOwnershipPct: 0.18 },
    documents: [
      sourceDoc('raise-financials', 'ARR and GAAP financial package', 'financials'),
      sourceDoc('raise-commercial', 'Pipeline and customer metrics', 'commercial'),
      sourceDoc('raise-legal', 'Cap table and charter summary', 'legal'),
      sourceDoc('raise-tax', 'Tax attributes summary', 'tax'),
    ],
    modelOutputs: [
      {
        id: 'raise-unit-economics',
        modelId: 'MODEL.RAISE.UNIT.ECONOMICS.v1',
        outputHash: `sha256:${RUN_ID}:raise-unit-economics`,
        source: 'synthetic_fixture',
      },
    ],
  };

  const ingest = await callTool(ctx, 'ingest_deal_payload', {
    idempotencyKey: `${RUN_ID}:RAISE:ingest`,
    payload,
  }, 'RAISE-ingest');
  const state = extractDealState(ingest);
  assertEqual(state.classificationKey?.journey, 'raise', 'raise fixture classifies as raise');
  recordState(ctx, 'raise', ingest, state);

  const modelStack = await callTool(ctx, 'compose_model_stack', {
    dealId: fixture.dealId,
    journey: 'raise',
    league: 'L3',
    dealType: 'growth equity raise',
  }, 'RAISE-model-stack');
  const stack = unwrapToolResult(modelStack)?.stack || unwrapToolResult(modelStack);
  assert(stack, 'raise model stack returned');

  const draft = await callTool(ctx, 'compose_document_draft', {
    dealState: state,
    documentType: 'ic_memo',
  }, 'RAISE-ic-memo');
  assertEqual(unwrapToolResult(draft)?.documentDraft?.documentType, 'ic_memo', 'raise IC memo draft type');
  recordState(ctx, 'raise', draft, extractDealState(draft));

  const dealPackage = await callTool(ctx, 'compose_deal_package', { dealState: state }, 'RAISE-package');
  assertEqual(unwrapToolResult(dealPackage)?.dealPackage?.schema, 'DealPackage.v0.1', 'raise package schema');
  recordState(ctx, 'raise', dealPackage, extractDealState(dealPackage));

  await verifyMcpReadBack(ctx, fixture, 'raise');
}

async function runPmiFixture(ctx: FixtureContext) {
  const fixture = ctx.deals.pmi;
  const payload = {
    dealId: fixture.dealId,
    journey: 'pmi',
    targetName: fixture.title,
    companyName: fixture.title,
    industry: 'B2B field services',
    jurisdiction: 'US-IL',
    league: 'L4',
    dealType: 'post-close integration',
    closeDate: '2026-05-15',
    revenueCents: 18_000_000_00,
    ebitdaCents: 3_100_000_00,
    purchasePriceCents: 24_500_000_00,
    integrationPriorities: ['day 0 controls', 'customer communication', 'finance close process', 'ERP migration'],
    operatingRisks: ['customer concentration', 'manager retention', 'billing handoff'],
    documents: [
      sourceDoc('pmi-close', 'Closing checklist', 'legal'),
      sourceDoc('pmi-financials', 'Post-close opening balance sheet', 'financials'),
      sourceDoc('pmi-ops', 'Operations handoff plan', 'operations'),
      sourceDoc('pmi-hr', 'Employee census and org chart', 'hr'),
      sourceDoc('pmi-commercial', 'Customer communication plan', 'commercial'),
    ],
    modelOutputs: [
      {
        id: 'pmi-synergy',
        modelId: 'MODEL.PMI.VALUE.CREATION.v1',
        outputHash: `sha256:${RUN_ID}:pmi-synergy`,
        source: 'synthetic_fixture',
      },
    ],
  };

  const ingest = await callTool(ctx, 'ingest_deal_payload', {
    idempotencyKey: `${RUN_ID}:PMI:ingest`,
    payload,
  }, 'PMI-ingest');
  const state = extractDealState(ingest);
  assertEqual(state.classificationKey?.journey, 'pmi', 'PMI fixture classifies as pmi');
  recordState(ctx, 'pmi', ingest, state);

  const pmiPlan = await callTool(ctx, 'compose_pmi_plan', { dealState: state }, 'PMI-plan');
  const plan = unwrapToolResult(pmiPlan)?.pmiPlan;
  assertEqual(plan?.schema, 'PMIPlan.v0.1', 'PMI plan schema');
  assertEqual(plan?.pmiBoundary?.noOperatingAuthority, true, 'PMI plan has no operating authority');
  recordState(ctx, 'pmi', pmiPlan, extractDealState(pmiPlan));

  const dealPackage = await callTool(ctx, 'compose_deal_package', { dealState: state }, 'PMI-package');
  assertEqual(unwrapToolResult(dealPackage)?.dealPackage?.schema, 'DealPackage.v0.1', 'PMI package schema');
  recordState(ctx, 'pmi', dealPackage, extractDealState(dealPackage));

  await verifyMcpReadBack(ctx, fixture, 'pmi');
}

async function runLineFixture(ctx: FixtureContext) {
  const close = await postMcp(ctx, {
    jsonrpc: '2.0',
    id: `${RUN_ID}:LINE-close`,
    method: 'tools/call',
    params: {
      name: 'close_deal',
      arguments: {
        dealId: ctx.deals.buy.dealId,
        closingDate: '2026-06-30',
        finalPriceCents: 40_000_000_00,
      },
      _meta: buildMeta(ctx, 'LINE-close'),
    },
  }, ctx.mcpToken);
  assert([200, 403, 428].includes(close.status), `close_deal returns a governed HTTP status, got ${close.status}`);
  assert(close.body.result?.isError === true || close.body.error, 'close_deal is refused/tollgated');
  const body = close.body.result?.structuredContent || close.body.error?.data || close.body.error || {};
  const code = String(body.error || body.tollgate?.code || body.data?.error || '');
  assert(['missing_required_scope', 'human_approval_required', 'enterprise_scope_required'].includes(code), `close_deal has governed boundary code, got ${code || 'none'}`);
}

async function verifyMcpReadBack(ctx: FixtureContext, fixture: FixtureDeal, journey: Journey) {
  assert(fixture.latestStateCid, `${journey} has a state CID to read back`);
  const read = await callTool(ctx, 'get_deal_state', { stateCid: fixture.latestStateCid }, `${journey.toUpperCase()}-readback`);
  const result = unwrapToolResult(read);
  assertEqual(result?.dealState?.cid, fixture.latestStateCid, `${journey} readback CID matches`);
  assertEqual(result?.dealState?.stateHash, fixture.latestStateHash, `${journey} readback state hash matches`);
  assertEqual(result?.classificationKey?.journey, journey, `${journey} readback journey matches`);
}

async function verifyProtectedAppApis(ctx: FixtureContext) {
  const token = ctx.appJwt || ctx.mcpToken;
  for (const fixture of Object.values(ctx.deals)) {
    const packets = await authedJson(`/api/definitive/deal-packets?dealId=${fixture.dealId}&limit=80`, token);
    const packetTypes = new Set((packets.packets || []).map((packet: any) => packet.packetType));
    for (const expected of fixture.expectedPacketTypes) {
      assert(packetTypes.has(expected), `${fixture.journey} app packet API includes ${expected}`);
    }
    assert((packets.packets || []).every((packet: any) => packet.inputHash && packet.outputHash), `${fixture.journey} packet API exposes audit hashes`);
  }

  const brief = await authedJson('/api/agency/today-operating-brief?refresh=true', token);
  const currentRunPulse = (brief.dealPulse || []).filter((deal: any) => String(deal.title || '').includes(ctx.runId));
  assert(currentRunPulse.length > 0, 'Today operating brief includes at least one connector-created fixture deal');
  assert(currentRunPulse.some((deal: any) => deal.definitive?.stateCid), 'Today operating brief fixture item has definitive DealState');
  assert(currentRunPulse.some((deal: any) => (deal.definitive?.packetTypes || []).length > 0), 'Today operating brief fixture item has packet types');
  const fileRows = brief.filesNeedingReview || [];
  assert(fileRows.some((row: any) => row.definitivePacketRowId && String(row.dealTitle || '').includes(ctx.runId)), 'Today files include at least one connector-created packet row for this run');
}

async function verifyDbPersistence(ctx: FixtureContext) {
  const db = await loadSql();
  assert(ctx.userId, 'DB verification requires a fixture user id');
  for (const fixture of Object.values(ctx.deals)) {
    const snapshots = await db`
      SELECT id, tool_name, state_cid, state_hash, classification_key, payload,
             input_hash, output_hash, mandate_chain, created_at
      FROM definitive_deal_state_snapshots
      WHERE user_id = ${ctx.userId}
        AND deal_id = ${fixture.dealId}
        AND created_at >= ${ctx.runStartedAt}
      ORDER BY created_at DESC
    `;
    assert(snapshots.length > 0, `${fixture.journey} has persisted DealState snapshots`);
    assert(snapshots.every((row: any) => row.input_hash && row.output_hash), `${fixture.journey} snapshots have audit hashes`);
    assert(snapshots.some((row: any) => row.state_cid === fixture.latestStateCid), `${fixture.journey} latest state CID is persisted`);
    assertEqual(snapshots[0].classification_key?.journey, fixture.journey, `${fixture.journey} latest snapshot journey`);

    const packets = await db`
      SELECT id, packet_type, packet_id, deal_state_cid, input_hash, output_hash,
             mandate_chain, payload, created_at
      FROM definitive_deal_packets
      WHERE user_id = ${ctx.userId}
        AND deal_id = ${fixture.dealId}
        AND created_at >= ${ctx.runStartedAt}
      ORDER BY created_at DESC
    `;
    const packetTypes = new Set(packets.map((row: any) => row.packet_type));
    for (const expected of fixture.expectedPacketTypes) {
      assert(packetTypes.has(expected), `${fixture.journey} DB packets include ${expected}`);
    }
    assert(packets.every((row: any) => row.input_hash && row.output_hash), `${fixture.journey} packet rows have audit hashes`);
    assert(packets.every((row: any) => row.mandate_chain && Object.keys(row.mandate_chain).length > 0), `${fixture.journey} packet rows carry mandate chain`);
  }

  const buyModels = await db`
    SELECT id, model_id, status, deal_id, input_hash, output_hash, audit_payload, created_at
    FROM model_executions
    WHERE user_id = ${ctx.userId}
      AND deal_id = ${ctx.deals.buy.dealId}
      AND created_at >= ${ctx.runStartedAt}
    ORDER BY created_at DESC
  `;
  assert(buyModels.length > 0, 'buy fixture has persisted model execution rows');
  assert(buyModels.some((row: any) => row.status === 'complete' && row.output_hash), 'buy model execution is complete with output hash');

  const usageRows = await db`
    SELECT id, action_id, tool_name, event_type, source_surface, actor_type, metadata, created_at
    FROM agency_usage_events
    WHERE user_id = ${ctx.userId}
      AND created_at >= ${ctx.runStartedAt}
      AND (action_id = 'execute_model' OR action_id = 'definitive.execute_model')
    ORDER BY created_at DESC
  `;
  assert(usageRows.length > 0, 'model execution produced agency usage/audit rows');
}

async function verifyBrowserSurfaces(ctx: FixtureContext) {
  assert(ctx.appBaseUrl, 'browser verification requires appBaseUrl');
  const token = ctx.appJwt || ctx.mcpToken;
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch({ headless: true });
  try {
    const viewports = [
      { label: 'desktop', width: 1440, height: 950 },
      { label: 'mobile', width: 390, height: 844 },
    ];

    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      });
      await context.addInitScript((jwtToken: string) => {
        localStorage.setItem('smbx_token', jwtToken);
        localStorage.setItem('smbx_dev_mock_user', '1');
      }, token);
      const page = await context.newPage();
      await page.route('**/api/**', async route => {
        const request = route.request();
        const requestUrl = new URL(request.url());
        if (requestUrl.pathname === '/api/auth/me') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              id: ctx.userId || 1,
              email: FIXTURE_EMAIL,
              display_name: 'DEFINITIVE MCP E2E Fixture',
              google_id: null,
              league: 'L4',
              role: 'user',
              is_advisor: true,
              plan: 'enterprise',
              trial_ends_at: null,
              free_deliverable_used: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }),
          });
          return;
        }
        const targetUrl = `${BASE_URL}${requestUrl.pathname}${requestUrl.search}`;
        const headers = {
          ...request.headers(),
          authorization: `Bearer ${token}`,
        };
        const response = await fetch(targetUrl, {
          method: request.method(),
          headers,
          body: request.method() === 'GET' || request.method() === 'HEAD' ? undefined : request.postDataBuffer(),
        });
        const body = Buffer.from(await response.arrayBuffer());
        await route.fulfill({
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body,
        });
      });

      await openAndAssertText(page, `${ctx.appBaseUrl}/#mode=today&tab=today-root`, ctx.runId, `${viewport.label} Today`);
      await openAndAssertText(page, `${ctx.appBaseUrl}/#mode=pipeline&tab=pipeline-root`, ctx.runId, `${viewport.label} Pipeline`);
      await openAndAssertText(page, `${ctx.appBaseUrl}/#mode=files&tab=files-root`, ctx.runId, `${viewport.label} Files`);
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

async function openAndAssertText(page: any, url: string, expectedText: string, label: string) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20_000 });
  await page.waitForSelector('#root', { timeout: 10_000 });
  try {
    await page.waitForFunction(
      (text: string) => document.body.innerText.includes(text),
      expectedText,
      { timeout: 30_000 },
    );
  } catch (err: any) {
    throw new Error(`${label} did not show ${JSON.stringify(expectedText)} before timeout: ${err.message}`);
  }
  const bodyText = await page.locator('body').innerText({ timeout: 5_000 });
  assert(bodyText.length > 100, `${label} rendered nonblank body`);
  assert(!/failed to load|cannot read properties|uncaught/i.test(bodyText), `${label} did not render a visible fatal error`);
}

async function callTool(ctx: FixtureContext, name: string, args: Record<string, any>, label: string) {
  const requestId = `${ctx.runId}:${label}:${++callSequence}`;
  const call = await postMcp(ctx, {
    jsonrpc: '2.0',
    id: requestId,
    method: 'tools/call',
    params: {
      name,
      arguments: args,
      _meta: buildMeta(ctx, requestId),
    },
  }, ctx.mcpToken);
  assertToolSuccess(call, name);
  assertStructuredEnvelope(call, name);
  return call;
}

function assertToolSuccess(call: Awaited<ReturnType<typeof postMcp>>, toolName: string) {
  assertEqual(call.status, 200, `${toolName} HTTP status`);
  if (call.body.result?.isError !== false) {
    const detail = call.body.result?.structuredContent?.result || call.body.result?.structuredContent || call.body.error || call.body;
    throw new Error(`${toolName} succeeds. Expected false, got ${JSON.stringify(call.body.result?.isError)}. Detail: ${JSON.stringify(detail).slice(0, 1200)}`);
  }
  assertEqual(call.body.result?.structuredContent?.toolName, toolName, `${toolName} structured tool name`);
}

function assertStructuredEnvelope(call: Awaited<ReturnType<typeof postMcp>>, toolName: string) {
  const body = call.body.result?.structuredContent;
  assert(body, `${toolName} returns structured content`);
  assert(body.specVersion, `${toolName} includes spec version`);
  assert(body.methodologyVersion, `${toolName} includes methodology version`);
  assert(typeof body.lineStatus === 'string', `${toolName} includes THE LINE status`);
  if (isPersistedDealStateTool(toolName)) {
    const persistence = body.persistence;
    assertEqual(persistence?.ok, true, `${toolName} persistence ok`);
    assert(persistence?.stateSnapshotId, `${toolName} persistence state snapshot id`);
    assert(persistence?.stateHash, `${toolName} persistence state hash`);
    assert(persistence?.inputHash, `${toolName} persistence input hash`);
    assert(persistence?.outputHash, `${toolName} persistence output hash`);
  }
}

function recordState(ctx: FixtureContext, journey: Journey, call: Awaited<ReturnType<typeof postMcp>>, state: Record<string, any>) {
  const fixture = ctx.deals[journey];
  fixture.latestStateCid = state.cid;
  fixture.latestStateHash = state.stateHash;
  const persistence = call.body.result?.structuredContent?.persistence;
  if (persistence?.packetId && !fixture.packetRowIds.includes(Number(persistence.packetId))) {
    fixture.packetRowIds.push(Number(persistence.packetId));
  }
  resultSummary.fixtures[journey] = {
    dealId: fixture.dealId,
    title: fixture.title,
    latestStateCid: fixture.latestStateCid,
    latestStateHash: fixture.latestStateHash,
    expectedPacketTypes: fixture.expectedPacketTypes,
    packetRowIds: fixture.packetRowIds,
    modelExecutionIds: fixture.modelExecutionIds,
  };
}

function extractDealState(call: Awaited<ReturnType<typeof postMcp>>) {
  const result = unwrapToolResult(call);
  const state = result?.dealState;
  assert(state?.cid, 'tool result includes DealState CID');
  assert(state?.stateHash, 'tool result includes DealState hash');
  return state;
}

function unwrapToolResult(call: Awaited<ReturnType<typeof postMcp>>) {
  const structuredContent = call.body.result?.structuredContent;
  const result = structuredContent?.result;
  return result?.result && typeof result.result === 'object' ? result.result : result;
}

function buildMeta(ctx: FixtureContext, requestId: string) {
  return {
    requestId,
    agentId: ctx.agentId,
    agentPlatformId: ctx.agentPlatformId,
    mandateId: ctx.mandateId,
    requestedScopes: [...E2E_SCOPES],
  };
}

async function resolveAccessToken(appJwt: string | null) {
  const direct = process.env.DEFINITIVE_MCP_ACCESS_TOKEN || process.env.SMBX_MCP_ACCESS_TOKEN;
  if (direct) return direct;
  if (!appJwt) return null;

  const response = await fetch(`${BASE_URL}/api/definitive/agent-tokens`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${appJwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      profile: 'deal_operator',
      scopes: [...E2E_SCOPES],
      agentId: `agent:smbx-mcp-e2e:${RUN_ID}`,
      agentPlatformId: 'codex_mcp_e2e_fixture',
      clientId: 'smbx-mcp-e2e-fixtures',
      mandateId: `mandate:smbx-mcp-e2e:${RUN_ID}`,
      expiresInMinutes: 120,
    }),
  });
  const body = await response.json().catch(() => ({}));
  assert(response.ok, `agent-token mint expected ok, got ${response.status}: ${JSON.stringify(body)}`);
  return body.token;
}

async function resolveAppJwt(userId: number | null) {
  const direct = process.env.DEFINITIVE_APP_JWT || process.env.SMBX_APP_JWT;
  if (direct) return direct;
  const envUserId = positiveNumber(process.env.DEFINITIVE_MCP_E2E_USER_ID);
  const targetUserId = userId || envUserId;
  if (!targetUserId) return null;
  return jwt.sign(
    { userId: targetUserId },
    process.env.JWT_SECRET || process.env.SESSION_SECRET || 'dev-secret-change-me',
    { expiresIn: '2h' },
  );
}

async function ensureLocalFixture() {
  const db = await loadSql();
  const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const [user] = await db`
    INSERT INTO users (email, display_name, role, is_advisor, league, plan, trial_ends_at, created_at, updated_at)
    VALUES (${FIXTURE_EMAIL}, 'DEFINITIVE MCP E2E Fixture', 'user', true, 'L4', 'enterprise', ${trialEnd}, NOW(), NOW())
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
  await db`
    INSERT INTO subscriptions (user_id, plan, status, trial_end, trial_ends_at, created_at, updated_at)
    VALUES (${userId}, 'enterprise', 'trialing', ${trialEnd}, ${trialEnd}, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      plan = 'enterprise',
      status = 'trialing',
      trial_end = EXCLUDED.trial_end,
      trial_ends_at = EXCLUDED.trial_ends_at,
      updated_at = NOW()
  `.catch(() => undefined);
  await ensureMarketFixtureData(db);

  const deals = {
    buy: await insertFixtureDeal(db, userId, 'buy', 'B3', 'L4', 'HVAC services', 'US-TX', 24_000_000_00, 5_000_000_00, 40_000_000_00),
    sell: await insertFixtureDeal(db, userId, 'sell', 'S3', 'L3', 'specialty manufacturing', 'US-OH', 12_500_000_00, 2_400_000_00, 15_000_000_00),
    raise: await insertFixtureDeal(db, userId, 'raise', 'R2', 'L3', 'vertical SaaS', 'US-DE', 6_800_000_00, 900_000_00, 8_000_000_00),
    pmi: await insertFixtureDeal(db, userId, 'pmi', 'PMI1', 'L4', 'B2B field services', 'US-IL', 18_000_000_00, 3_100_000_00, 24_500_000_00),
  };

  return { userId, deals };
}

async function ensureMarketFixtureData(db: any) {
  await db`
    INSERT INTO naics_benchmarks (
      naics_code, naics_label, state,
      median_firm_revenue_cents, revenue_per_employee_cents, labor_cost_pct, avg_annual_pay_cents,
      sde_multiple_low, sde_multiple_mid, sde_multiple_high,
      ebitda_multiple_low, ebitda_multiple_mid, ebitda_multiple_high,
      revenue_multiple_low, revenue_multiple_high,
      typical_sde_margin_low, typical_sde_margin_high,
      consolidation_level, sba_approval_rate, buyer_competition, boomer_ownership_pct,
      data_year, source, data_sources, notes, updated_at
    )
    VALUES (
      '238220', 'HVAC services', 'US',
      ${250_000_000}, ${17_500_000}, 0.37, ${5_800_000},
      2.50, 3.50, 4.50,
      4.00, 5.50, 7.00,
      0.50, 1.20,
      15.00, 25.00,
      'very_active', 'strong', 'dense', 50,
      2024, 'smbX synthetic E2E market fixture',
      ARRAY['smbX MCP E2E fixture'],
      'Synthetic benchmark row used only to prove market-multiple provenance in connector tests.',
      NOW()
    )
    ON CONFLICT (naics_code, state) DO UPDATE SET
      naics_label = EXCLUDED.naics_label,
      sde_multiple_low = EXCLUDED.sde_multiple_low,
      sde_multiple_mid = EXCLUDED.sde_multiple_mid,
      sde_multiple_high = EXCLUDED.sde_multiple_high,
      ebitda_multiple_low = EXCLUDED.ebitda_multiple_low,
      ebitda_multiple_mid = EXCLUDED.ebitda_multiple_mid,
      ebitda_multiple_high = EXCLUDED.ebitda_multiple_high,
      revenue_multiple_low = EXCLUDED.revenue_multiple_low,
      revenue_multiple_high = EXCLUDED.revenue_multiple_high,
      data_year = EXCLUDED.data_year,
      source = EXCLUDED.source,
      data_sources = EXCLUDED.data_sources,
      notes = EXCLUDED.notes,
      updated_at = NOW()
  `;
}

async function insertFixtureDeal(
  db: any,
  userId: number,
  journey: Journey,
  gate: string,
  league: string,
  industry: string,
  jurisdiction: string,
  revenueCents: number,
  ebitdaCents: number,
  askingPriceCents: number,
): Promise<FixtureDeal> {
  const title = `MCP E2E ${journey.toUpperCase()} ${RUN_ID}`;
  const [deal] = await db`
    INSERT INTO deals (
      user_id, journey_type, current_gate, league, industry, jurisdiction,
      location, business_name, name, deal_type, revenue, sde, ebitda,
      asking_price, financials, status, created_at, updated_at
    )
    VALUES (
      ${userId}, ${journey}, ${gate}, ${league}, ${industry}, ${jurisdiction},
      ${jurisdiction}, ${title}, ${title}, ${dealTypeForJourney(journey)},
      ${revenueCents}, ${ebitdaCents}, ${ebitdaCents}, ${askingPriceCents},
      ${db.json({ fixture_key: FIXTURE_KEY, run_id: RUN_ID, journey, source: 'definitive-mcp-e2e-fixtures' })}::jsonb,
      'active', NOW(), NOW()
    )
    RETURNING id
  `;
  return {
    journey,
    dealId: Number(deal.id),
    title,
    expectedPacketTypes: expectedPacketTypesForJourney(journey),
    packetRowIds: [],
    modelExecutionIds: [],
  };
}

async function fixtureFromEnv() {
  const userId = positiveNumber(process.env.DEFINITIVE_MCP_E2E_USER_ID);
  const deals = {
    buy: fixtureDealFromEnv('buy'),
    sell: fixtureDealFromEnv('sell'),
    raise: fixtureDealFromEnv('raise'),
    pmi: fixtureDealFromEnv('pmi'),
  };
  return { userId, deals };
}

function fixtureDealFromEnv(journey: Journey): FixtureDeal {
  const envKey = journey === 'sell' ? 'SELLREP' : journey.toUpperCase();
  const dealId = positiveNumber(process.env[`DEFINITIVE_MCP_E2E_${envKey}_DEAL_ID`]);
  if (!dealId) {
    throw new Error(`No ${journey} fixture deal id. Set DATABASE_URL so the runner can seed deals, or set DEFINITIVE_MCP_E2E_${envKey}_DEAL_ID.`);
  }
  const title = process.env[`DEFINITIVE_MCP_E2E_${envKey}_TITLE`] || `MCP E2E ${journey.toUpperCase()} ${RUN_ID}`;
  return {
    journey,
    dealId,
    title,
    expectedPacketTypes: expectedPacketTypesForJourney(journey),
    packetRowIds: [],
    modelExecutionIds: [],
  };
}

async function loadSql() {
  if (!HAS_DB) throw new Error('DATABASE_URL is required for local fixture seeding or DB verification.');
  return (await import('../server/db.js')).sql;
}

async function cleanupResources() {
  if (!HAS_DB) return;
  try {
    const { sql } = await import('../server/db.js');
    await sql.end({ timeout: 1 });
  } catch {
    // The result has already been printed; cleanup should never mask it.
  }
}

async function publicJson(pathname: string) {
  const response = await fetch(`${BASE_URL}${pathname}`);
  const body = await response.json().catch(() => ({}));
  assert(response.ok, `${pathname} expected public OK, got ${response.status}: ${JSON.stringify(body)}`);
  return body;
}

async function authedJson(pathname: string, token: string) {
  const response = await fetch(`${BASE_URL}${pathname}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await response.json().catch(() => ({}));
  assert(response.ok, `${pathname} expected authenticated OK, got ${response.status}: ${JSON.stringify(body)}`);
  return body;
}

async function postMcp(ctx: FixtureContext, body: Record<string, any>, token?: string) {
  const response = await fetch(`${ctx.baseUrl}/mcp`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: 'application/json, text/event-stream',
      'Content-Type': 'application/json',
      'MCP-Protocol-Version': '2025-11-25',
    },
    body: JSON.stringify(body),
  });
  return {
    status: response.status,
    headers: response.headers,
    body: await response.json().catch(() => ({})),
  };
}

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    records.push({ name, status: 'pass' });
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err: any) {
    records.push({ name, status: 'fail', message: err.message });
    failed++;
    console.log(`  ✗ ${name} - ${err.message}`);
  }
}

function markSkip(name: string, message: string) {
  records.push({ name, status: 'skip', message });
  skipped++;
  console.log(`  - ${name} (skipped: ${message})`);
}

async function writeResultSummary() {
  await mkdir(RESULTS_DIR, { recursive: true });
  const outputPath = path.join(RESULTS_DIR, `${RUN_ID}.json`);
  await writeFile(outputPath, `${JSON.stringify(resultSummary, null, 2)}\n`, 'utf8');
  console.log(`\nResult artifact: ${outputPath}`);
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function sourceDoc(id: string, name: string, category: string) {
  return {
    id,
    name,
    type: category,
    category,
    hash: `sha256:${RUN_ID}:${id}`,
  };
}

function representationSide(result: Record<string, any> | null | undefined, state: Record<string, any> | null | undefined) {
  return result?.representationContext?.side
    || state?.representationContext?.side
    || state?.payload?.representationContext?.side
    || state?.payload?.representationSide
    || state?.payload?.side
    || null;
}

function expectedPacketTypesForJourney(journey: Journey) {
  if (journey === 'buy') return ['DealStateControlPacket.v0.1', 'LOIPacket.v0.1', 'DealPackage.v0.1'];
  if (journey === 'sell') {
    return [
      'DealStateControlPacket.v0.1',
      'DataRoomIndex.v0.1',
      'DiligenceRequest.v0.1',
      'DocumentDraft.v0.1',
      'LOIPacket.v0.1',
      'NegotiationBrief.v0.1',
      'CloseReadiness.v0.1',
      'FundsFlow.v0.1',
    ];
  }
  if (journey === 'raise') return ['DealStateControlPacket.v0.1', 'DocumentDraft.v0.1', 'DealPackage.v0.1'];
  return ['DealStateControlPacket.v0.1', 'PMIPlan.v0.1', 'DealPackage.v0.1'];
}

function dealTypeForJourney(journey: Journey) {
  if (journey === 'buy') return 'lower-middle-market acquisition LBO';
  if (journey === 'sell') return 'sell-side owner representation';
  if (journey === 'raise') return 'growth equity raise';
  return 'post-close integration';
}

function isPersistedDealStateTool(toolName: string) {
  return [
    'ingest_deal_payload',
    'update_deal_payload',
    'check_completeness',
    'compose_deal_plan',
    'diff_deal_state',
    'clone_deal_state',
    'compose_deal_package',
    'verify_package',
    'finalize_deal_package',
    'reopen_deal_package',
    'generate_permutations',
    'score_permutation',
    'set_objective_preference',
    'compute_best_vehicle',
    'expand_permutations',
    'resume_deal',
    'compose_lifecycle_trace',
    'prepare_ioi_packet',
    'prepare_loi_packet',
    'compose_data_room_index',
    'prepare_diligence_request',
    'disclose_subset',
    'compose_document_draft',
    'prepare_negotiation_brief',
    'compose_close_readiness',
    'generate_funds_flow',
    'compose_pmi_plan',
  ].includes(toolName);
}

function positiveNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function compactTimestamp() {
  return new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
}

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, '');
}

function normalizeOptionalBaseUrl(url: string | null | undefined) {
  if (!url) return null;
  return normalizeBaseUrl(url);
}

function inferLocalAppUrl(apiBaseUrl: string) {
  try {
    const parsed = new URL(apiBaseUrl);
    if (['127.0.0.1', 'localhost'].includes(parsed.hostname)) return 'http://localhost:5173';
  } catch {
    return null;
  }
  return null;
}
