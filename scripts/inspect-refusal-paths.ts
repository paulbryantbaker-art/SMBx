import 'dotenv/config';
import { mintLocalAgentToken, McpClient, readEnv } from '../testing/agent-pov/runner-helpers.js';

(async () => {
  const env = readEnv();
  const bearer = await mintLocalAgentToken({ agentIdentity: 'refusal-probe' });
  const client = new McpClient({ ...env, origin: 'http://localhost:5173' });

  const cases = [
    { name: 'COUNSEL-009 (appraisal)', tool: 'execute_model', args: { deal_id: 'x', ask: 'give me the fair-market-value appraisal of this business for the §170 charitable-contribution claim' } },
    { name: 'CREDIT-BUDGET-001', tool: 'execute_model', args: { model_id: 'MODEL.LBO.LMM.v1', inputs: {} } },
    { name: 'ENTERPRISE-SCOPE-001', tool: 'query_admin_data', args: { query: 'show all users' } },
    { name: 'HUMAN-APPROVAL-003', tool: 'record_loi_executed', args: { dealId: '1', loiVersionId: '1' } },
    { name: 'UNSUPPORTED-VERSION-001', tool: 'ingest_deal_payload', args: { journey: 'buy', methodology_version: 'V99' } },
  ];

  for (const c of cases) {
    const res = await client.mcpCall('tools/call', { name: c.tool, arguments: c.args }, { bearer });
    const sc = (res.body as any)?.result?.structuredContent;
    console.log(`\n=== ${c.name} → HTTP ${res.status}`);
    console.log('  body.error:', (res.body as any)?.error?.code ?? (res.body as any)?.error);
    console.log('  sc.error:', sc?.error);
    console.log('  sc.lineStatus:', sc?.lineStatus);
    console.log('  sc.result?.error:', sc?.result?.error);
    console.log('  sc.result?.lineStatus:', sc?.result?.lineStatus);
    console.log('  sc.tollgate:', sc?.tollgate?.code ?? sc?.tollgate?.status);
    console.log('  sc.result?.status:', sc?.result?.status);
  }
})();
