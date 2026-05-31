import 'dotenv/config';
import { mintLocalAgentToken, McpClient, readEnv } from '../testing/agent-pov/runner-helpers.js';
(async () => {
  const env = readEnv();
  const bearer = await mintLocalAgentToken({ agentIdentity: 'bootstrap-probe' });
  const client = new McpClient(env);
  const res = await client.mcpCall('tools/call', {
    name: 'ingest_deal_payload',
    arguments: { journey: 'buy', target_industry: 'B2B services', target_jurisdiction: 'US-TX', target_sde: 250_000_000, target_revenue: 800_000_000, dealId: 1234 }
  }, { bearer });
  const sc: any = (res.body as any)?.result?.structuredContent;
  console.log('status:', res.status);
  console.log('sc.ok:', sc?.ok);
  console.log('sc.result keys:', sc?.result ? Object.keys(sc.result) : 'no result');
  console.log('sc.result.action:', sc?.result?.action);
  console.log('sc.result.error:', sc?.result?.error);
  console.log('sc.result.result keys:', sc?.result?.result ? Object.keys(sc.result.result) : 'no result.result');
  console.log('sc.result.result.dealState?.cid:', sc?.result?.result?.dealState?.cid);
  console.log('sc.result.dealState?.cid:', sc?.result?.dealState?.cid);
  console.log('full sc (first 2000 chars):');
  console.log(JSON.stringify(sc).slice(0, 2000));
})();
