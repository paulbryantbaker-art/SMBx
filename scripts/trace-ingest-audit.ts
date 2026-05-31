import 'dotenv/config';
import { mintLocalAgentToken, McpClient, readEnv } from '../testing/agent-pov/runner-helpers.js';
(async () => {
  const env = readEnv();
  const bearer = await mintLocalAgentToken({ agentIdentity: 'trace-test' });
  const client = new McpClient(env);
  const res = await client.mcpCall('tools/call', {
    name: 'ingest_deal_payload',
    arguments: { journey: 'buy', target_industry: 'test', target_jurisdiction: 'US-TX', target_sde: 500000, target_revenue: 1800000 }
  }, { bearer });
  console.log('STATUS:', res.status);
  const body: any = res.body;
  const sc = body?.result?.structuredContent;
  console.log('top sc keys:', sc ? Object.keys(sc).slice(0, 20) : 'no sc');
  console.log('sc.auditTrailId:', sc?.auditTrailId);
  console.log('sc.auditId:', sc?.auditId);
  console.log('sc.result.auditTrailId:', sc?.result?.auditTrailId);
  console.log('sc.result.auditId:', sc?.result?.auditId);
  console.log('sc.result.result keys:', sc?.result?.result ? Object.keys(sc.result.result).slice(0, 20) : 'no nested result');
  console.log('sc.result.result.auditTrailId:', sc?.result?.result?.auditTrailId);
  console.log('persistence at sc:', sc?.persistence ? JSON.stringify(sc.persistence).slice(0, 200) : 'none');
})();
