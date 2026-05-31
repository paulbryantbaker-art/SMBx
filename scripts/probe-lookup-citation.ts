import 'dotenv/config';
import { mintLocalAgentToken, McpClient, readEnv } from '../testing/agent-pov/runner-helpers.js';
(async () => {
  const env = readEnv();
  const bearer = await mintLocalAgentToken({ agentIdentity: 'lookup-probe' });
  const client = new McpClient(env);
  const res = await client.mcpCall('tools/call', {
    name: 'lookup_citation',
    arguments: { query: 'IRC 1060', category: 'irc_sections' }
  }, { bearer });
  console.log('STATUS:', res.status);
  const body: any = res.body;
  console.log('result.isError:', body?.result?.isError);
  console.log('content[0]:', body?.result?.content?.[0]);
  console.log('structuredContent keys:', body?.result?.structuredContent ? Object.keys(body.result.structuredContent) : 'none');
  console.log('structuredContent.error:', body?.result?.structuredContent?.error);
  console.log('structuredContent.result keys:', body?.result?.structuredContent?.result ? Object.keys(body.result.structuredContent.result) : 'none');
  console.log('structuredContent.result.error:', body?.result?.structuredContent?.result?.error);
})();
