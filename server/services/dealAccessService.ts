/**
 * Deal Access Service — Shared RBAC helpers for multi-participant deal access.
 * Extracted from collaboration.ts so data room, deliverables, and other routes
 * can enforce the same access rules.
 */
import { sql } from '../db.js';

export const VALID_ROLES = ['owner', 'attorney', 'cpa', 'broker', 'lender', 'consultant', 'counterparty'] as const;
export const VALID_ACCESS_LEVELS = ['full', 'comment', 'read'] as const;

/** Role-based folder visibility: which folder names each role can see.
 *  null = all folders (for owner), or scoped by folder_scope integer array (consultant/counterparty). */
export const ROLE_FOLDER_ACCESS: Record<string, string[] | null> = {
  owner: null,
  attorney: ['Closing', 'Due Diligence', 'Deal Structure'],
  cpa: ['Financials', 'Valuation', 'Due Diligence'],
  broker: ['Marketing', 'Buyer Management', 'Investor Materials', 'Outreach'],
  lender: ['Financials', 'Valuation'],
  consultant: null, // scoped by folder_scope
  counterparty: null, // scoped by folder_scope
};

export interface DealAccess {
  role: string;
  access_level: string;
  folder_scope: number[] | null;
}

/** Check if user is deal owner */
export async function isDealOwner(dealId: number, userId: number): Promise<boolean> {
  const [deal] = await sql`SELECT id FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
  return !!deal;
}

/** Check if user has any access to deal (owner or accepted participant).
 *  Returns access info or null if no access. */
export async function hasDealAccess(dealId: number, userId: number): Promise<DealAccess | null> {
  // Check if owner
  const [deal] = await sql`SELECT id FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
  if (deal) return { role: 'owner', access_level: 'full', folder_scope: null };

  // Check if accepted participant
  const [participant] = await sql`
    SELECT role, access_level, folder_scope FROM deal_participants
    WHERE deal_id = ${dealId} AND user_id = ${userId} AND accepted_at IS NOT NULL
  `;
  return participant || null;
}

/** Get folder IDs visible to a given role/access.
 *  @param access - The user's DealAccess object
 *  @param allFolders - All folders for the deal [{id, name}]
 *  @returns Array of visible folder IDs */
export function getVisibleFolderIds(
  access: DealAccess,
  allFolders: { id: number; name: string }[],
): number[] {
  // Owner sees everything
  if (access.role === 'owner') {
    return allFolders.map(f => f.id);
  }

  // Consultant/counterparty: scoped by explicit folder_scope (array of folder IDs)
  if ((access.role === 'consultant' || access.role === 'counterparty') && access.folder_scope) {
    return allFolders.filter(f => access.folder_scope!.includes(f.id)).map(f => f.id);
  }

  // Named roles: filter by ROLE_FOLDER_ACCESS names
  const allowedNames = ROLE_FOLDER_ACCESS[access.role];
  if (allowedNames) {
    return allFolders
      .filter(f => allowedNames.some(name => f.name.toLowerCase().includes(name.toLowerCase())))
      .map(f => f.id);
  }

  // Fallback: no folders visible
  return [];
}

/** Log activity on a deal */
export async function logActivity(
  dealId: number,
  userId: number | null,
  action: string,
  targetType?: string,
  targetId?: number,
  metadata?: Record<string, any>,
) {
  await sql`
    INSERT INTO deal_activity_log (deal_id, user_id, action, target_type, target_id, metadata)
    VALUES (${dealId}, ${userId}, ${action}, ${targetType || null}, ${targetId || null}, ${JSON.stringify(metadata || {})})
  `.catch(() => {});
}
