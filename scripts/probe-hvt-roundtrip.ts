import 'dotenv/config';
import { mintLocalAgentToken, McpClient, readEnv } from '../testing/agent-pov/runner-helpers.js';
(async () => {
  const env = readEnv();
  const bearer = await mintLocalAgentToken({ agentIdentity: 'hvt-roundtrip' });
  const client = new McpClient(env);

  // 1. Ingest
  const ingest = await client.mcpCall('tools/call', {
    name: 'ingest_deal_payload',
    arguments: { journey: 'buy', target_industry: 'B2B services', target_jurisdiction: 'US-TX', target_sde: 2_500_000_00, target_revenue: 8_000_000_00 }
  }, { bearer });
  const sc: any = (ingest.body as any)?.result?.structuredContent;
  const stateCid = sc?.result?.result?.dealState?.cid ?? sc?.result?.dealState?.cid;
  console.log('INGEST stateCid:', stateCid);
  console.log('INGEST status:', ingest.status);

  // 2. Read back by stateCid
  const read = await client.mcpCall('tools/call', {
    name: 'get_deal_state',
    arguments: { stateCid }
  }, { bearer });
  const rsc: any = (read.body as any)?.result?.structuredContent;
  console.log('READ status:', read.status);
  console.log('READ sc.ok:', rsc?.ok);
  console.log('READ result.error:', rsc?.result?.error);
  console.log('READ result.result.dealState.cid:', rsc?.result?.result?.dealState?.cid);
})();
