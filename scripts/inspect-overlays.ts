import 'dotenv/config';
import { mintLocalAgentToken, McpClient, readEnv } from '../testing/agent-pov/runner-helpers.js';

(async () => {
  const env = readEnv();
  const bearer = await mintLocalAgentToken({ agentIdentity: 'overlay-probe' });
  if (!bearer) { console.log('no bearer'); process.exit(1); }
  const client = new McpClient({ ...env, origin: 'http://localhost:5173' });

  const cases = [
    { name: 'snake_case cash_runway_days', p: { journey: 'buy', target_industry: 'B2B', cash_runway_days: 60 } },
    { name: 'snake_case secured_debt_price', p: { journey: 'buy', target_industry: 'B2B', secured_debt_trading_price_cents: 55 } },
    { name: 'nested signals snake_case', p: { journey: 'buy', target_industry: 'B2B', signals: { cash_runway_days: 60, fccr: 0.85 } } },
    { name: 'lme_signal exchange_offer', p: { journey: 'buy', target_industry: 'B2B', lme_signal: 'exchange_offer_announced' } },
    { name: 'covenant_breach_quarters', p: { journey: 'buy', target_industry: 'B2B', covenant_breach_projected_within_quarters: 2 } },
    { name: 'real_estate_pct_of_ev', p: { journey: 'buy', target_industry: 'B2B', real_estate_percent_of_ev: 30 } },
    { name: 'distress_signal forbearance', p: { journey: 'buy', target_industry: 'B2B', distress_signal: 'forbearance_executed' } },
  ];

  console.log(`${'CASE'.padEnd(42)} ${'OVERLAYS'.padEnd(15)} DISTRESS`);
  console.log('─'.repeat(85));
  for (const c of cases) {
    const res = await client.mcpCall('tools/call', { name: 'ingest_deal_payload', arguments: c.p }, { bearer });
    const ck = (res.body as any)?.result?.structuredContent?.result?.result?.dealState?.classificationKey;
    const overlays = (res.body as any)?.result?.structuredContent?.result?.result?.dealState?.overlays || [];
    const triggered = overlays.filter((o: any) => o.triggered).map((o: any) => o.gateId).join(',') || '-';
    console.log(`${c.name.padEnd(42)} ${triggered.padEnd(15)} ${ck?.distressPosture}`);
  }
})();
