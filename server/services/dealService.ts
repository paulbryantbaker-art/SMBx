/**
 * Deal Service — CRUD operations for deals and gate progress.
 * Uses raw postgres-js (no ORM).
 */
import { sql } from '../db.js';
import { getFirstGate, GATE_MAP, getNextGate, getJourneyGates } from '../../shared/gateRegistry.js';

export interface Deal {
  id: number;
  user_id: number;
  journey_type: string;
  current_gate: string;
  league: string | null;
  industry: string | null;
  location: string | null;
  business_name: string | null;
  revenue: number | null;
  sde: number | null;
  ebitda: number | null;
  asking_price: number | null;
  employee_count: number | null;
  naics_code: string | null;
  financials: Record<string, any> | null;
  status: string;
  created_at: string;
  updated_at: string;
}

/** Create a new deal for a user */
export async function createDeal(
  userId: number,
  journeyType: string,
  initialData?: Partial<Pick<Deal, 'industry' | 'location' | 'business_name' | 'revenue'>>
): Promise<Deal> {
  const firstGate = getFirstGate(journeyType);
  const [deal] = await sql`
    INSERT INTO deals (user_id, journey_type, current_gate, industry, location, business_name, revenue)
    VALUES (
      ${userId},
      ${journeyType},
      ${firstGate},
      ${initialData?.industry || null},
      ${initialData?.location || null},
      ${initialData?.business_name || null},
      ${initialData?.revenue || null}
    )
    RETURNING *
  `;

  // Initialize gate progress — first gate is active, rest locked
  const journeyGates = getJourneyGates(journeyType);
  for (const gate of journeyGates) {
    await sql`
      INSERT INTO gate_progress (deal_id, gate, status)
      VALUES (${deal.id}, ${gate.id}, ${gate.index === 0 ? 'active' : 'locked'})
      ON CONFLICT (deal_id, gate) DO NOTHING
    `;
  }

  return deal as Deal;
}

/** Get a deal by ID */
export async function getDeal(dealId: number): Promise<Deal | null> {
  const [deal] = await sql`SELECT * FROM deals WHERE id = ${dealId}`;
  return (deal as Deal) || null;
}

/** Get all active deals for a user */
export async function getUserDeals(userId: number): Promise<Deal[]> {
  const deals = await sql`
    SELECT * FROM deals
    WHERE user_id = ${userId} AND status = 'active'
    ORDER BY updated_at DESC
  `;
  return deals as unknown as Deal[];
}

/** Update deal fields (e.g. from Yulia extracting data from conversation) */
export async function updateDealFields(
  dealId: number,
  fields: Partial<Pick<Deal, 'industry' | 'location' | 'business_name' | 'revenue' | 'sde' | 'ebitda' | 'asking_price' | 'employee_count' | 'naics_code' | 'league' | 'current_gate'>>
): Promise<Deal | null> {
  // Build dynamic SET clause
  const sets: string[] = [];
  const values: any[] = [];

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      sets.push(`${key} = $${values.length + 2}`);
      values.push(value);
    }
  }

  if (sets.length === 0) return getDeal(dealId);

  const [deal] = await sql.unsafe(
    `UPDATE deals SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [dealId, ...values]
  );
  return (deal as unknown as Deal) || null;
}

/** Update financials JSONB (merges with existing) */
export async function updateDealFinancials(
  dealId: number,
  newFields: Record<string, any>
): Promise<Deal | null> {
  const [deal] = await sql`
    UPDATE deals
    SET financials = COALESCE(financials, '{}'::jsonb) || ${JSON.stringify(newFields)}::jsonb,
        updated_at = NOW()
    WHERE id = ${dealId}
    RETURNING *
  `;
  return (deal as Deal) || null;
}

/** Get gate progress for a deal */
export async function getGateProgress(dealId: number) {
  return sql`
    SELECT * FROM gate_progress
    WHERE deal_id = ${dealId}
    ORDER BY gate
  `;
}

/** Update gate data (extracted fields) */
export async function updateGateData(
  dealId: number,
  gateId: string,
  data: Record<string, any>
): Promise<void> {
  await sql`
    UPDATE gate_progress
    SET data = COALESCE(data, '{}'::jsonb) || ${JSON.stringify(data)}::jsonb
    WHERE deal_id = ${dealId} AND gate = ${gateId}
  `;
}

/** Advance to the next gate */
export async function advanceGate(dealId: number, currentGate: string): Promise<string | null> {
  const nextGateId = getNextGate(currentGate);
  if (!nextGateId) return null;

  // Complete current gate
  await sql`
    UPDATE gate_progress
    SET status = 'completed', completed_at = NOW()
    WHERE deal_id = ${dealId} AND gate = ${currentGate}
  `;

  // Activate next gate
  await sql`
    UPDATE gate_progress
    SET status = 'active'
    WHERE deal_id = ${dealId} AND gate = ${nextGateId}
  `;

  // Update deal's current_gate
  await sql`
    UPDATE deals
    SET current_gate = ${nextGateId}, updated_at = NOW()
    WHERE id = ${dealId}
  `;

  return nextGateId;
}

/** Link an anonymous session to a deal */
export async function linkAnonymousDeal(sessionId: string, dealId: number): Promise<void> {
  await sql`
    UPDATE anonymous_sessions
    SET deal_id = ${dealId}
    WHERE session_id = ${sessionId}
  `;
}
