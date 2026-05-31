import 'dotenv/config';
import { mintLocalAgentToken, McpClient, readEnv } from '../testing/agent-pov/runner-helpers.js';
(async () => {
  const env = readEnv();
  const bearer = await mintLocalAgentToken({ agentIdentity: 'parity-probe' });
  const client = new McpClient(env);

  const args = {
    modelId: 'MODEL.LBO.LMM.v1',
    input: {
      purchase_price_cents: 2500_000_000,
      debt_cents: 900_000_000,
      sponsor_equity_cents: 1600_000_000,
      entry_ebitda_cents: 500_000_000,
      exit_multiple: 7.5,
    },
  };

  // Raw MCP
  const mcpRes = await client.mcpCall('tools/call', { name: 'execute_model', arguments: args }, { bearer });
  // CC simulator: same /mcp endpoint, different headers
  const ccRes = await client.mcpCall('tools/call', { name: 'execute_model', arguments: args }, {
    bearer,
    headers: {
      'User-Agent': 'claude-connector/1.0',
      'X-MCP-Client': 'claude-custom-connector',
      'X-Agent-Platform-Id': 'claude_custom_connector',
    },
  });

  function unwrap(body: any) {
    return body?.result?.structuredContent?.result?.result ?? body?.result?.structuredContent?.result ?? body?.result?.structuredContent;
  }
  function canonicalize(value: any): any {
    if (value === null || value === undefined) return value;
    if (Array.isArray(value)) return value.map(canonicalize);
    if (typeof value !== 'object') return value;
    const STRIP = new Set(['timestamp','createdAt','created_at','finishedAt','startedAt','executedAt','executed_at','modelExecutionId','model_execution_id','auditId','audit_id','auditTrailId','audit_trail_id','requestId','idempotencyKey','idempotency_key','agentId','agent_id','agentPlatformId','agent_platform_id','sessionId','session_id','mandateId','mandate_id','beneficialCustomerId','beneficial_customer_id','persistence','generatedAt','signedAt','cid','dealStateCid','packageCid','parentCid','parent_cid']);
    const out: Record<string, any> = {};
    for (const k of Object.keys(value).sort()) {
      if (STRIP.has(k)) continue;
      out[k] = canonicalize(value[k]);
    }
    return out;
  }
  const mcpDeep = canonicalize(unwrap(mcpRes.body));
  const ccDeep = canonicalize(unwrap(ccRes.body));
  const mcpStr = JSON.stringify(mcpDeep);
  const ccStr = JSON.stringify(ccDeep);
  let i = 0;
  while (i < Math.min(mcpStr.length, ccStr.length) && mcpStr[i] === ccStr[i]) i++;
  console.log('First diff at char:', i, '/ mcp len', mcpStr.length, '/ cc len', ccStr.length);
  console.log('MCP:', mcpStr.slice(Math.max(0, i - 30), i + 200));
  console.log('CC :', ccStr.slice(Math.max(0, i - 30), i + 200));

  console.log('MCP keys:', mcpDeep ? Object.keys(mcpDeep) : 'none');
  console.log('CC keys: ', ccDeep ? Object.keys(ccDeep) : 'none');
  console.log('');
  // Find the diff
  const mcpKeys = mcpDeep ? Object.keys(mcpDeep).sort() : [];
  const ccKeys = ccDeep ? Object.keys(ccDeep).sort() : [];
  console.log('keys only in MCP:', mcpKeys.filter(k => !ccKeys.includes(k)));
  console.log('keys only in CC:', ccKeys.filter(k => !mcpKeys.includes(k)));
})();
