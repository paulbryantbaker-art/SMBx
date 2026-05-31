import 'dotenv/config';
import { mintLocalAgentToken } from '../testing/agent-pov/runner-helpers.js';
import jwt from 'jsonwebtoken';
(async () => {
  const bearer = await mintLocalAgentToken({ agentIdentity: 'audit-probe' });
  if (!bearer) { console.log('no bearer'); return; }
  const decoded: any = jwt.decode(bearer);
  console.log('token userId:', decoded.userId);
  console.log('token agentId:', decoded.agentId);
  console.log('token sub:', decoded.sub);

  const postgres = (await import('postgres')).default;
  const sql = postgres(process.env.DATABASE_URL!);
  const events = await sql`SELECT id, user_id, tool_name, action_id, agent_id, created_at FROM agency_usage_events WHERE user_id = ${decoded.userId} ORDER BY created_at DESC LIMIT 5`;
  console.log('events for userId:', events.length, 'rows');
  events.forEach((e: any) => console.log('  ', e.id, e.tool_name, e.agent_id, e.created_at));
  await sql.end();
})();
