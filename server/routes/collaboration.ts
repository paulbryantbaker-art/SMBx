/**
 * Collaboration Routes — Deal participants, invitations, day passes, messaging
 */
import { Router } from 'express';
import crypto from 'crypto';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const collaborationRouter = Router();
collaborationRouter.use(requireAuth);

const VALID_ROLES = ['owner', 'attorney', 'cpa', 'broker', 'lender', 'consultant', 'counterparty'];
const VALID_ACCESS_LEVELS = ['full', 'comment', 'read'];

// Role-based folder visibility: which folder names each role can see
const ROLE_FOLDER_ACCESS: Record<string, string[] | null> = {
  owner: null, // all folders
  attorney: ['Closing', 'Due Diligence', 'Deal Structure'],
  cpa: ['Financials', 'Valuation', 'Due Diligence'],
  broker: ['Marketing', 'Buyer Management', 'Investor Materials', 'Outreach'],
  lender: ['Financials', 'Valuation'],
  consultant: null, // scoped by folder_scope
  counterparty: null, // scoped by folder_scope
};

/** Check if user is deal owner */
async function isDealOwner(dealId: number, userId: number): Promise<boolean> {
  const [deal] = await sql`SELECT id FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
  return !!deal;
}

/** Check if user has any access to deal */
async function hasDealAccess(dealId: number, userId: number): Promise<any> {
  // Check if owner
  const [deal] = await sql`SELECT id FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
  if (deal) return { role: 'owner', access_level: 'full', folder_scope: null };

  // Check if participant
  const [participant] = await sql`
    SELECT role, access_level, folder_scope FROM deal_participants
    WHERE deal_id = ${dealId} AND user_id = ${userId} AND accepted_at IS NOT NULL
  `;
  return participant || null;
}

/** Log activity */
async function logActivity(dealId: number, userId: number | null, action: string, targetType?: string, targetId?: number, metadata?: Record<string, any>) {
  await sql`
    INSERT INTO deal_activity_log (deal_id, user_id, action, target_type, target_id, metadata)
    VALUES (${dealId}, ${userId}, ${action}, ${targetType || null}, ${targetId || null}, ${JSON.stringify(metadata || {})})
  `.catch(() => {});
}

// ─── Get deal participants ───────────────────────────────────

collaborationRouter.get('/deals/:dealId/participants', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = parseInt(req.params.dealId, 10);

    const access = await hasDealAccess(dealId, userId);
    if (!access) return res.status(404).json({ error: 'Deal not found' });

    // Get participants
    const participants = await sql`
      SELECT dp.id, dp.user_id, dp.role, dp.access_level, dp.folder_scope, dp.accepted_at, dp.created_at,
             u.email, u.display_name
      FROM deal_participants dp
      JOIN users u ON u.id = dp.user_id
      WHERE dp.deal_id = ${dealId}
      ORDER BY dp.created_at ASC
    `;

    // Get pending invitations (only for owner)
    let pendingInvitations: any[] = [];
    if (access.role === 'owner') {
      pendingInvitations = await sql`
        SELECT id, email, role, access_level, expires_at, created_at
        FROM deal_invitations
        WHERE deal_id = ${dealId} AND accepted_at IS NULL AND expires_at > NOW()
        ORDER BY created_at DESC
      `;
    }

    // Get owner info
    const [deal] = await sql`SELECT user_id FROM deals WHERE id = ${dealId}`;
    const [owner] = await sql`SELECT id, email, display_name FROM users WHERE id = ${deal.user_id}`;

    return res.json({
      owner: { ...owner, role: 'owner' },
      participants,
      pendingInvitations,
    });
  } catch (err: any) {
    console.error('Get participants error:', err.message);
    return res.status(500).json({ error: 'Failed to get participants' });
  }
});

// ─── Invite participant ──────────────────────────────────────

collaborationRouter.post('/deals/:dealId/invite', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = parseInt(req.params.dealId, 10);
    const { email, role, accessLevel, folderScope } = req.body;

    if (!email) return res.status(400).json({ error: 'Email is required' });
    if (!VALID_ROLES.includes(role || '')) return res.status(400).json({ error: 'Invalid role' });

    const isOwner = await isDealOwner(dealId, userId);
    if (!isOwner) return res.status(403).json({ error: 'Only deal owner can invite participants' });

    // Check if already a participant
    const [existing] = await sql`
      SELECT id FROM deal_participants dp
      JOIN users u ON u.id = dp.user_id
      WHERE dp.deal_id = ${dealId} AND u.email = ${email}
    `;
    if (existing) return res.status(400).json({ error: 'User is already a participant' });

    // Check for pending invitation
    const [pendingInvite] = await sql`
      SELECT id FROM deal_invitations
      WHERE deal_id = ${dealId} AND email = ${email} AND accepted_at IS NULL AND expires_at > NOW()
    `;
    if (pendingInvite) return res.status(400).json({ error: 'Invitation already pending for this email' });

    const token = crypto.randomBytes(32).toString('hex');

    const [invitation] = await sql`
      INSERT INTO deal_invitations (deal_id, email, role, access_level, folder_scope, token, invited_by)
      VALUES (${dealId}, ${email}, ${role || 'consultant'}, ${accessLevel || 'read'}, ${folderScope || null}, ${token}, ${userId})
      RETURNING id, email, role, access_level, token, expires_at, created_at
    `;

    await logActivity(dealId, userId, 'invited', 'participant', invitation.id, { email, role });

    return res.status(201).json({
      invitation,
      inviteLink: `/invite/${token}`,
    });
  } catch (err: any) {
    console.error('Invite participant error:', err.message);
    return res.status(500).json({ error: 'Failed to send invitation' });
  }
});

// ─── Accept invitation ───────────────────────────────────────

collaborationRouter.post('/invitations/:token/accept', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { token } = req.params;

    const [invitation] = await sql`
      SELECT id, deal_id, email, role, access_level, folder_scope, accepted_at, expires_at
      FROM deal_invitations
      WHERE token = ${token}
    `;

    if (!invitation) return res.status(404).json({ error: 'Invitation not found' });
    if (invitation.accepted_at) return res.status(400).json({ error: 'Invitation already accepted' });
    if (new Date(invitation.expires_at) < new Date()) return res.status(400).json({ error: 'Invitation expired' });

    // Verify email matches (optional: could allow any authenticated user)
    const [user] = await sql`SELECT email FROM users WHERE id = ${userId}`;
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return res.status(403).json({ error: 'This invitation was sent to a different email address' });
    }

    // Create participant record
    const [participant] = await sql`
      INSERT INTO deal_participants (deal_id, user_id, role, access_level, folder_scope, invited_by, accepted_at)
      VALUES (${invitation.deal_id}, ${userId}, ${invitation.role}, ${invitation.access_level}, ${invitation.folder_scope}, ${userId}, NOW())
      ON CONFLICT (deal_id, user_id) DO UPDATE SET
        role = ${invitation.role}, access_level = ${invitation.access_level}, accepted_at = NOW()
      RETURNING id, role, access_level
    `;

    // Mark invitation as accepted
    await sql`UPDATE deal_invitations SET accepted_at = NOW() WHERE id = ${invitation.id}`;

    await logActivity(invitation.deal_id, userId, 'joined', 'participant', participant.id, { role: invitation.role });

    return res.json({ participant, dealId: invitation.deal_id });
  } catch (err: any) {
    console.error('Accept invitation error:', err.message);
    return res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// ─── Remove participant ──────────────────────────────────────

collaborationRouter.delete('/deals/:dealId/participants/:participantId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = parseInt(req.params.dealId, 10);
    const participantId = parseInt(req.params.participantId, 10);

    const isOwner = await isDealOwner(dealId, userId);
    if (!isOwner) return res.status(403).json({ error: 'Only deal owner can remove participants' });

    const [removed] = await sql`
      DELETE FROM deal_participants WHERE id = ${participantId} AND deal_id = ${dealId}
      RETURNING id, user_id, role
    `;

    if (!removed) return res.status(404).json({ error: 'Participant not found' });

    await logActivity(dealId, userId, 'removed', 'participant', participantId, { role: removed.role });

    return res.json({ removed: true });
  } catch (err: any) {
    console.error('Remove participant error:', err.message);
    return res.status(500).json({ error: 'Failed to remove participant' });
  }
});

// ─── Update participant role ─────────────────────────────────

collaborationRouter.patch('/deals/:dealId/participants/:participantId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = parseInt(req.params.dealId, 10);
    const participantId = parseInt(req.params.participantId, 10);
    const { role, accessLevel } = req.body;

    const isOwner = await isDealOwner(dealId, userId);
    if (!isOwner) return res.status(403).json({ error: 'Only deal owner can update participant roles' });

    if (role && !VALID_ROLES.includes(role)) return res.status(400).json({ error: 'Invalid role' });
    if (accessLevel && !VALID_ACCESS_LEVELS.includes(accessLevel)) return res.status(400).json({ error: 'Invalid access level' });

    const updates: Record<string, any> = { updated_at: new Date() };
    if (role) updates.role = role;
    if (accessLevel) updates.access_level = accessLevel;

    const [updated] = await sql`
      UPDATE deal_participants
      SET role = COALESCE(${role || null}, role),
          access_level = COALESCE(${accessLevel || null}, access_level),
          updated_at = NOW()
      WHERE id = ${participantId} AND deal_id = ${dealId}
      RETURNING id, role, access_level
    `;

    if (!updated) return res.status(404).json({ error: 'Participant not found' });

    await logActivity(dealId, userId, 'role_changed', 'participant', participantId, { role, accessLevel });

    return res.json(updated);
  } catch (err: any) {
    console.error('Update participant error:', err.message);
    return res.status(500).json({ error: 'Failed to update participant' });
  }
});

// ─── Create day pass ─────────────────────────────────────────

collaborationRouter.post('/deals/:dealId/day-pass', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = parseInt(req.params.dealId, 10);
    const { role, accessLevel, folderScope } = req.body;

    const isOwner = await isDealOwner(dealId, userId);
    if (!isOwner) return res.status(403).json({ error: 'Only deal owner can create day passes' });

    const token = crypto.randomBytes(32).toString('hex');

    const [pass] = await sql`
      INSERT INTO day_passes (deal_id, token, role, access_level, folder_scope, created_by)
      VALUES (${dealId}, ${token}, ${role || 'consultant'}, ${accessLevel || 'read'}, ${folderScope || null}, ${userId})
      RETURNING id, token, role, access_level, created_at
    `;

    await logActivity(dealId, userId, 'created_day_pass', 'day_pass', pass.id);

    return res.status(201).json({
      ...pass,
      link: `/day-pass/${token}`,
    });
  } catch (err: any) {
    console.error('Create day pass error:', err.message);
    return res.status(500).json({ error: 'Failed to create day pass' });
  }
});

// ─── Get activity log ────────────────────────────────────────

collaborationRouter.get('/deals/:dealId/activity', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = parseInt(req.params.dealId, 10);

    const access = await hasDealAccess(dealId, userId);
    if (!access) return res.status(404).json({ error: 'Deal not found' });

    const activities = await sql`
      SELECT al.id, al.action, al.target_type, al.target_id, al.metadata, al.created_at,
             u.email, u.display_name
      FROM deal_activity_log al
      LEFT JOIN users u ON u.id = al.user_id
      WHERE al.deal_id = ${dealId}
      ORDER BY al.created_at DESC
      LIMIT 50
    `;

    return res.json(activities);
  } catch (err: any) {
    console.error('Get activity log error:', err.message);
    return res.status(500).json({ error: 'Failed to get activity log' });
  }
});

// ─── Deal messages ───────────────────────────────────────────

collaborationRouter.get('/deals/:dealId/messages', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = parseInt(req.params.dealId, 10);

    const access = await hasDealAccess(dealId, userId);
    if (!access) return res.status(404).json({ error: 'Deal not found' });

    const messages = await sql`
      SELECT dm.id, dm.content, dm.parent_id, dm.created_at,
             u.email, u.display_name,
             dp.role as participant_role
      FROM deal_messages dm
      JOIN users u ON u.id = dm.user_id
      LEFT JOIN deal_participants dp ON dp.deal_id = dm.deal_id AND dp.user_id = dm.user_id
      WHERE dm.deal_id = ${dealId}
      ORDER BY dm.created_at ASC
      LIMIT 100
    `;

    return res.json(messages);
  } catch (err: any) {
    console.error('Get deal messages error:', err.message);
    return res.status(500).json({ error: 'Failed to get messages' });
  }
});

collaborationRouter.post('/deals/:dealId/messages', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = parseInt(req.params.dealId, 10);
    const { content, parentId } = req.body;

    if (!content?.trim()) return res.status(400).json({ error: 'Message content is required' });

    const access = await hasDealAccess(dealId, userId);
    if (!access) return res.status(404).json({ error: 'Deal not found' });
    if (access.access_level === 'read') return res.status(403).json({ error: 'Read-only access cannot send messages' });

    const [message] = await sql`
      INSERT INTO deal_messages (deal_id, user_id, content, parent_id)
      VALUES (${dealId}, ${userId}, ${content.trim()}, ${parentId || null})
      RETURNING id, content, parent_id, created_at
    `;

    await logActivity(dealId, userId, 'commented', 'message', message.id);

    return res.status(201).json(message);
  } catch (err: any) {
    console.error('Send deal message error:', err.message);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});
