import 'dotenv/config';
import { mintLocalAgentToken, McpClient, readEnv } from '../testing/agent-pov/runner-helpers.js';

(async () => {
  const env = readEnv();
  const bearer = await mintLocalAgentToken({ agentIdentity: 'league-probe' });
  if (!bearer) { console.log('no bearer'); process.exit(1); }
  const client = new McpClient({ ...env, origin: 'http://localhost:5173' });

  const cases = [
    { name: 'L1 (SDE $200k)',     payload: { journey: 'buy', target_industry: 'restaurant', target_sde_cents: 20_000_000 } },
    { name: 'L2 (SDE $1M)',       payload: { journey: 'buy', target_industry: 'restaurant', target_sde_cents: 100_000_000 } },
    { name: 'L3 (EBITDA $2M)',    payload: { journey: 'buy', target_industry: 'services',   target_ebitda_cents: 200_000_000 } },
    { name: 'L4 (EBITDA $5M)',    payload: { journey: 'buy', target_industry: 'B2B services', target_ebitda_cents: 500_000_000 } },
    { name: 'L5 (EBITDA $15M)',   payload: { journey: 'buy', target_industry: 'industrials', target_ebitda_cents: 1500_000_000 } },
    { name: 'L6 (EBITDA $40M)',   payload: { journey: 'buy', target_industry: 'SaaS', target_ebitda_cents: 4000_000_000 } },
    { name: 'L7 (EBITDA $300M)',  payload: { journey: 'buy', target_industry: 'industrials', target_ebitda_cents: 30000_000_000 } },
    { name: 'EV $50M only (L4)',  payload: { journey: 'buy', target_industry: 'services', purchase_price_cents: 5000_000_000 } },
    { name: 'No financials (unknown)', payload: { journey: 'buy', target_industry: 'B2B services' } },
  ];

  for (const c of cases) {
    const res = await client.mcpCall('tools/call', { name: 'ingest_deal_payload', arguments: c.payload }, { bearer });
    const ck = (res.body as any)?.result?.structuredContent?.result?.result?.dealState?.classificationKey;
    console.log(`${c.name.padEnd(25)} → league=${ck?.league}, distressPosture=${ck?.distressPosture}, confidence.league=${ck?.confidence?.league}`);
  }
})();
