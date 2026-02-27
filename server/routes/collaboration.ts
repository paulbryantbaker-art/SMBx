/**
 * Collaboration Routes — Deal participants, invitations, day passes, messaging
 */
import { Router } from 'express';
import crypto from 'crypto';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { VALID_ROLES, VALID_ACCESS_LEVELS, isDealOwner, hasDealAccess, logActivity } from '../services/dealAccessService.js';
import { createNotification } from './notifications.js';
import { sendInvitationEmail, sendDayPassEmail } from '../services/emailService.js';

export const collaborationRouter = Router();
collaborationRouter.use(requireAuth);

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

    const inviteUrl = `/invite/${token}`;
    console.log(`[INVITE] Deal ${dealId} → ${email} (${role}): ${inviteUrl}`);

    // Send invitation email (async, non-blocking)
    const [deal] = await sql`SELECT name FROM deals WHERE id = ${dealId}`.catch(() => [null]);
    const [inviter] = await sql`SELECT display_name FROM users WHERE id = ${userId}`.catch(() => [null]);
    sendInvitationEmail({
      email,
      token,
      role: role || 'consultant',
      dealName: deal?.name,
      inviterName: inviter?.display_name,
    }).catch(() => {});

    return res.status(201).json({
      invitation,
      inviteLink: inviteUrl,
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

    const passUrl = `/day-pass/${token}`;
    console.log(`[DAY-PASS] Deal ${dealId} → ${role || 'consultant'}: ${passUrl}`);

    // Send day pass email if an email was provided in request
    const recipientEmail = req.body.email;
    if (recipientEmail) {
      const [deal] = await sql`SELECT name FROM deals WHERE id = ${dealId}`.catch(() => [null]);
      sendDayPassEmail({
        email: recipientEmail,
        token,
        role: role || 'consultant',
        dealName: deal?.name,
      }).catch(() => {});
    }

    return res.status(201).json({
      ...pass,
      link: passUrl,
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

    // Notify all other participants + deal owner
    const [deal] = await sql`SELECT user_id FROM deals WHERE id = ${dealId}`;
    const participants = await sql`
      SELECT user_id FROM deal_participants WHERE deal_id = ${dealId} AND accepted_at IS NOT NULL
    `;
    const [sender] = await sql`SELECT display_name, email FROM users WHERE id = ${userId}`;
    const senderName = sender?.display_name || sender?.email || 'Someone';
    const allUserIds = new Set([deal?.user_id, ...participants.map((p: any) => p.user_id)].filter(Boolean));
    allUserIds.delete(userId); // Don't notify the sender

    for (const recipientId of allUserIds) {
      await createNotification({
        userId: recipientId,
        dealId,
        type: 'deal_comment',
        title: `${senderName} commented on a deal`,
        body: content.trim().substring(0, 120),
        actionUrl: `/chat`,
      });
    }

    return res.status(201).json(message);
  } catch (err: any) {
    console.error('Send deal message error:', err.message);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

// ─── Day pass activation ───────────────────────────────────

collaborationRouter.post('/deals/day-pass/:token/activate', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { token } = req.params;

    const [pass] = await sql`
      SELECT id, deal_id, role, access_level, folder_scope, first_accessed_at, expires_at, revoked_at
      FROM day_passes
      WHERE token = ${token}
    `;

    if (!pass) return res.status(404).json({ error: 'Day pass not found' });
    if (pass.revoked_at) return res.status(400).json({ error: 'Day pass has been revoked' });

    // If already activated, check expiry
    if (pass.first_accessed_at) {
      if (new Date(pass.expires_at) < new Date()) {
        return res.status(400).json({ error: 'Day pass has expired' });
      }
      return res.json({ dealId: pass.deal_id, role: pass.role, expiresAt: pass.expires_at, alreadyActive: true });
    }

    // Activate: set first_accessed_at and expires_at to 48 hours from now
    const [activated] = await sql`
      UPDATE day_passes
      SET first_accessed_at = NOW(), expires_at = NOW() + INTERVAL '48 hours'
      WHERE id = ${pass.id}
      RETURNING expires_at
    `;

    // Create participant record
    await sql`
      INSERT INTO deal_participants (deal_id, user_id, role, access_level, folder_scope, accepted_at)
      VALUES (${pass.deal_id}, ${userId}, ${pass.role}, ${pass.access_level}, ${pass.folder_scope}, NOW())
      ON CONFLICT (deal_id, user_id) DO UPDATE SET
        role = ${pass.role}, access_level = ${pass.access_level}, accepted_at = NOW()
    `;

    await logActivity(pass.deal_id, userId, 'day_pass_activated', 'day_pass', pass.id);

    return res.json({ dealId: pass.deal_id, role: pass.role, expiresAt: activated.expires_at });
  } catch (err: any) {
    console.error('Day pass activation error:', err.message);
    return res.status(500).json({ error: 'Failed to activate day pass' });
  }
});

// ─── Sign NDA ──────────────────────────────────────────────

collaborationRouter.post('/deals/:dealId/sign-nda', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = parseInt(req.params.dealId, 10);

    const [updated] = await sql`
      UPDATE deal_participants SET nda_signed_at = NOW()
      WHERE deal_id = ${dealId} AND user_id = ${userId} AND nda_signed_at IS NULL
      RETURNING id, nda_signed_at
    `;

    if (!updated) return res.status(404).json({ error: 'Participant not found or NDA already signed' });

    await logActivity(dealId, userId, 'nda_signed', 'participant', updated.id);

    return res.json({ signed: true, signedAt: updated.nda_signed_at });
  } catch (err: any) {
    console.error('Sign NDA error:', err.message);
    return res.status(500).json({ error: 'Failed to sign NDA' });
  }
});
