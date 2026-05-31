import 'dotenv/config';
import { mintLocalAgentToken, McpClient, readEnv } from '../testing/agent-pov/runner-helpers.js';

(async () => {
  const env = readEnv();
  const bearer = await mintLocalAgentToken({ agentIdentity: 'inspect' });
  if (!bearer) { console.log('no bearer'); process.exit(1); }
  const client = new McpClient({ ...env, origin: 'http://localhost:5173' });
  const res = await client.mcpCall('tools/call', {
    name: 'ingest_deal_payload',
    arguments: { journey: 'buy', target_industry: 'B2B services', target_jurisdiction: 'US-TX' },
  }, { bearer });
  const sc = (res.body as any)?.result?.structuredContent;
  console.log('STATUS:', res.status);
  console.log('structuredContent TOP KEYS:', Object.keys(sc || {}));
  const r = sc?.result;
  console.log('structuredContent.result TOP KEYS:', Object.keys(r || {}));
  console.log('result.classification:', JSON.stringify((r as any)?.classification ?? 'NONE', null, 2));
  console.log('result.missingInputs:', JSON.stringify((r as any)?.missingInputs ?? (r as any)?.missing_inputs ?? 'NONE', null, 2).slice(0, 800));
  console.log('result.nextSuggestedCalls:', JSON.stringify((r as any)?.nextSuggestedCalls ?? (r as any)?.next_suggested_calls ?? 'NONE', null, 2).slice(0, 600));
  const rr = (r as any)?.result;
  console.log('result.result TOP KEYS:', Object.keys(rr || {}));
  console.log('result.result.next_suggested_calls:', JSON.stringify(rr?.next_suggested_calls ?? 'NONE', null, 2).slice(0, 600));
  console.log('result.result.nextSuggestedCalls:', JSON.stringify(rr?.nextSuggestedCalls ?? 'NONE', null, 2).slice(0, 600));
})();
