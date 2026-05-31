import 'dotenv/config';
import { mintLocalAgentToken, McpClient, readEnv } from '../testing/agent-pov/runner-helpers.js';

(async () => {
  const env = readEnv();
  const bearer = await mintLocalAgentToken({ agentIdentity: 'methodology-routing-probe' });
  if (!bearer) { console.log('no bearer'); process.exit(1); }
  const client = new McpClient({ ...env, origin: 'http://localhost:5173' });

  const cases = [
    // Across every journey × varied scale signals
    { name: 'BUY L1 (SDE $200k restaurant)',     p: { journey: 'buy', target_industry: 'restaurant', target_jurisdiction: 'US-TX', target_sde_cents: 20_000_000 } },
    { name: 'BUY L2 (SDE $1M B2B)',             p: { journey: 'buy', target_industry: 'B2B services', target_jurisdiction: 'US-CA', target_sde_cents: 100_000_000 } },
    { name: 'BUY L3 (EBITDA $2M industrials)',   p: { journey: 'buy', target_industry: 'industrials', target_jurisdiction: 'US-OH', target_ebitda_cents: 200_000_000 } },
    { name: 'BUY L4 (EBITDA $5M SaaS)',          p: { journey: 'buy', target_industry: 'SaaS',        target_jurisdiction: 'US-CA', target_ebitda_cents: 500_000_000 } },
    { name: 'BUY L5 (EBITDA $40M industrials)',  p: { journey: 'buy', target_industry: 'industrials', target_jurisdiction: 'US-IL', target_ebitda_cents: 4000_000_000 } },
    { name: 'BUY L6 (EBITDA $150M B2B)',         p: { journey: 'buy', target_industry: 'B2B SaaS',    target_jurisdiction: 'US-DE', target_ebitda_cents: 15_000_000_000 } },
    { name: 'BUY L7 (EBITDA $500M strategic)',   p: { journey: 'buy', target_industry: 'industrials', target_jurisdiction: 'US-DE', target_ebitda_cents: 50_000_000_000 } },
    { name: 'BUY EV-only $50M (L4)',             p: { journey: 'buy', target_industry: 'services',    target_jurisdiction: 'US-DE', purchase_price_cents: 5000_000_000 } },
    { name: 'SELL L4 (SDE $5M B2B)',             p: { journey: 'sell', seller_role: 'principal', industry: 'B2B services', jurisdiction: 'US-TX', sde_cents: 500_000_000 } },
    { name: 'SELL L2 (banker-led restaurant)',   p: { journey: 'sell', seller_representation: 'owner_rep', industry: 'restaurant', jurisdiction: 'US-FL', sde_cents: 80_000_000 } },
    { name: 'RAISE seed (SAFE)',                 p: { journey: 'raise', stage: 'seed', industry: 'SaaS', jurisdiction: 'US-DE', raise_amount_cents: 200_000_000, instrument: 'safe' } },
    { name: 'RAISE Series A (priced)',           p: { journey: 'raise', stage: 'series_a', industry: 'SaaS', jurisdiction: 'US-DE', raise_amount_cents: 1000_000_000 } },
    { name: 'RAISE debt ABL',                    p: { journey: 'raise', stage: 'debt', industry: 'distribution', jurisdiction: 'US-IL', facility_type: 'abl', commitment_cents: 3000_000_000 } },
    { name: 'PMI integration',                   p: { journey: 'pmi', stage: 'day_0', industry: 'B2B services', jurisdiction: 'US-TX', target_ebitda_cents: 500_000_000 } },
    // Distressed routing — should compose G28
    { name: 'BUY L4 distressed (363 sale)',      p: { journey: 'buy', target_industry: 'industrial services', target_jurisdiction: 'US-DE', target_ebitda_cents: 500_000_000, signals: { cash_runway_days: 60, fccr: 0.85, secured_debt_trading_price_cents: 55 } } },
    // RE-heavy — should compose G30
    { name: 'BUY L5 RE-heavy (60% RE)',          p: { journey: 'buy', target_industry: 'manufacturing', target_jurisdiction: 'US-TX', target_ebitda_cents: 1500_000_000, signals: { real_estate_percent_of_ev: 0.60 } } },
    // No financials — should NOT be league=unknown if industry implies scale
    { name: 'SPARSE BUY (industry only)',        p: { journey: 'buy', target_industry: 'B2B services' } },
  ];

  console.log(`${'CASE'.padEnd(40)} ${'LEAGUE'.padEnd(10)} ${'DISTRESS'.padEnd(20)} ${'OVERLAYS'.padEnd(15)} #MODELS`);
  console.log('─'.repeat(110));

  let leagueWins = 0;
  let leagueTotal = 0;

  for (const c of cases) {
    // Ingest first
    const ingest = await client.mcpCall('tools/call', { name: 'ingest_deal_payload', arguments: c.p }, { bearer });
    const inner = (ingest.body as any)?.result?.structuredContent?.result?.result;
    const ck = inner?.dealState?.classificationKey;
    const overlays = inner?.dealState?.overlays || [];
    const triggered = overlays.filter((o: any) => o.triggered).map((o: any) => o.gateId);
    const dealId = inner?.dealState?.stateId;

    // Compose model stack
    const stack = await client.mcpCall('tools/call', { name: 'compose_model_stack', arguments: { deal_id: dealId } }, { bearer });
    if (c.name.includes('L4 (EBITDA $5M SaaS)')) {
      console.log('DEBUG compose_model_stack full body:', JSON.stringify(stack.body, null, 2).slice(0, 3000));
    }
    const stackInner = (stack.body as any)?.result?.structuredContent?.result?.result
      ?? (stack.body as any)?.result?.structuredContent?.result
      ?? (stack.body as any)?.result?.structuredContent;
    // Try every common shape
    const modelCount = (
      stackInner?.applicableModels?.length ??
      stackInner?.applicable_models?.length ??
      stackInner?.modelStack?.length ??
      stackInner?.model_stack?.length ??
      stackInner?.models?.length ??
      stackInner?.stack?.length ??
      stackInner?.composed?.models?.length ??
      stackInner?.composedStack?.models?.length ??
      0
    );
    if (modelCount === 0 && stackInner) {
      // Debug: print top-level keys when we expected models
      const keys = Object.keys(stackInner).slice(0, 8).join(',');
      const debugSuffix = ` keys=[${keys}]`;
      console.log(`${c.name.padEnd(40)} ${(ck?.league || '?').padEnd(10)} ${(ck?.distressPosture || '?').padEnd(20)} ${(triggered.join(',') || '-').padEnd(15)} ${modelCount}${debugSuffix}`);
      continue;
    }

    leagueTotal++;
    if (ck?.league !== 'unknown') leagueWins++;
    const expected = c.name.match(/L(\d+)/)?.[1];
    const matched = expected ? ck?.league === `L${expected}` : true;
    console.log(`${c.name.padEnd(40)} ${(ck?.league || '?').padEnd(10)} ${(ck?.distressPosture || '?').padEnd(20)} ${(triggered.join(',') || '-').padEnd(15)} ${modelCount}${matched ? ' ✓' : ' ✗'}`);
  }

  console.log('─'.repeat(110));
  console.log(`League non-unknown rate (when scale signal present): ${leagueWins}/${leagueTotal} = ${((leagueWins / leagueTotal) * 100).toFixed(0)}%`);
})();
