/**
 * Notification Routes — In-app notification center
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const notificationRouter = Router();
notificationRouter.use(requireAuth);

// ─── Get notifications ───────────────────────────────────────

notificationRouter.get('/notifications', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 50);
    const unreadOnly = req.query.unread === 'true';

    let notifications;
    if (unreadOnly) {
      notifications = await sql`
        SELECT id, deal_id, type, title, body, action_url, read_at, created_at
        FROM notifications
        WHERE user_id = ${userId} AND read_at IS NULL
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else {
      notifications = await sql`
        SELECT id, deal_id, type, title, body, action_url, read_at, created_at
        FROM notifications
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    }

    // Get unread count
    const [{ count }] = await sql`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ${userId} AND read_at IS NULL
    `;

    return res.json({ notifications, unreadCount: parseInt(count, 10) });
  } catch (err: any) {
    console.error('Get notifications error:', err.message);
    return res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// ─── Mark notification as read ───────────────────────────────

notificationRouter.patch('/notifications/:notifId/read', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const notifId = parseInt(req.params.notifId, 10);

    const [updated] = await sql`
      UPDATE notifications SET read_at = NOW()
      WHERE id = ${notifId} AND user_id = ${userId} AND read_at IS NULL
      RETURNING id, read_at
    `;

    return res.json(updated || { id: notifId, already_read: true });
  } catch (err: any) {
    console.error('Mark notification read error:', err.message);
    return res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// ─── Mark all as read ────────────────────────────────────────

notificationRouter.post('/notifications/read-all', async (req, res) => {
  try {
    const userId = (req as any).userId;

    await sql`
      UPDATE notifications SET read_at = NOW()
      WHERE user_id = ${userId} AND read_at IS NULL
    `;

    return res.json({ success: true });
  } catch (err: any) {
    console.error('Mark all notifications read error:', err.message);
    return res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// ─── Helper: Create a notification (called from other services) ──

export async function createNotification(opts: {
  userId: number;
  dealId?: number;
  type: string;
  title: string;
  body?: string;
  actionUrl?: string;
}) {
  try {
    await sql`
      INSERT INTO notifications (user_id, deal_id, type, title, body, action_url)
      VALUES (${opts.userId}, ${opts.dealId || null}, ${opts.type}, ${opts.title}, ${opts.body || null}, ${opts.actionUrl || null})
    `;
  } catch (err: any) {
    console.error('Create notification error:', err.message);
  }
}
