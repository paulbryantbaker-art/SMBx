import 'dotenv/config';
import { mintLocalAgentToken, McpClient, readEnv } from '../testing/agent-pov/runner-helpers.js';
(async () => {
  const env = readEnv();
  const bearer = await mintLocalAgentToken({ agentIdentity: 'audit-probe' });
  const client = new McpClient(env);
  const res = await client.get('/api/definitive/audit-packets?limit=5', { bearer: bearer ?? undefined });
  console.log('STATUS:', res.status);
  console.log('BODY TYPE:', typeof res.body);
  console.log('BODY:', typeof res.body === 'string' ? res.body.slice(0, 400) : JSON.stringify(res.body).slice(0, 400));
})();
