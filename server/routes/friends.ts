/**
 * Friends Routes — connections (request/accept) + direct messages.
 *
 * Async + notification-based (no realtime/websockets), consistent with the
 * deal-team @mention→notification pattern. One canonical connection row per
 * pair (user_a < user_b); `requested_by` captures who initiated. DM threads are
 * 1:1 and require an ACCEPTED connection to open. Every query is scoped to the
 * authenticated user, so you only ever see your own connections/threads/messages.
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { createNotification } from './notifications.js';

export const friendsRouter = Router();
friendsRouter.use(requireAuth);

const pair = (a: number, b: number): [number, number] => (a < b ? [a, b] : [b, a]);

async function senderName(userId: number): Promise<string> {
  const [u] = await sql`SELECT display_name, email FROM users WHERE id = ${userId}`;
  return u?.display_name || u?.email || 'A connection';
}

// ─── Connections ─────────────────────────────────────────────

// Send (or auto-accept the reciprocal of) a connection request. Body: { email } | { userId }
friendsRouter.post('/friends/request', async (req, res) => {
  try {
    const me = (req as any).userId;
    const { email, userId } = req.body ?? {};
    let target: any;
    if (userId) [target] = await sql`SELECT id FROM users WHERE id = ${Number(userId)}`;
    else if (email) [target] = await sql`SELECT id FROM users WHERE lower(email) = ${String(email).toLowerCase().trim()}`;
    else return res.status(400).json({ error: 'email or userId required' });
    if (!target) return res.status(404).json({ error: 'No user with that email' });
    if (target.id === me) return res.status(400).json({ error: "You can't connect with yourself" });

    const [a, b] = pair(me, target.id);
    const [existing] = await sql`SELECT id, status, requested_by FROM connections WHERE user_a = ${a} AND user_b = ${b}`;
    if (existing) {
      if (existing.status === 'accepted') return res.json({ ok: true, status: 'accepted' });
      if (existing.requested_by !== me) {
        // The other person already requested → accept it now.
        await sql`UPDATE connections SET status = 'accepted', accepted_at = NOW() WHERE id = ${existing.id}`;
        await createNotification({ userId: target.id, type: 'friend_accept', title: `${await senderName(me)} accepted your connection`, actionUrl: '/#mode=friends' });
        return res.json({ ok: true, status: 'accepted' });
      }
      return res.json({ ok: true, status: 'pending' });
    }
    await sql`INSERT INTO connections (user_a, user_b, status, requested_by) VALUES (${a}, ${b}, 'pending', ${me})`;
    await createNotification({ userId: target.id, type: 'friend_request', title: `${await senderName(me)} sent you a connection request`, actionUrl: '/#mode=friends' });
    return res.json({ ok: true, status: 'pending' });
  } catch (err: any) {
    console.error('friend request error:', err.message);
    return res.status(500).json({ error: 'Failed to send request' });
  }
});

// List my connections: accepted friends + incoming/outgoing pending.
friendsRouter.get('/friends', async (req, res) => {
  try {
    const me = (req as any).userId;
    const rows = await sql`
      SELECT c.id, c.status, c.requested_by, c.created_at, c.accepted_at,
             u.id AS friend_id, u.display_name, u.email
      FROM connections c
      JOIN users u ON u.id = CASE WHEN c.user_a = ${me} THEN c.user_b ELSE c.user_a END
      WHERE c.user_a = ${me} OR c.user_b = ${me}
      ORDER BY COALESCE(c.accepted_at, c.created_at) DESC
    `;
    return res.json({
      friends: rows.filter(r => r.status === 'accepted'),
      incoming: rows.filter(r => r.status === 'pending' && r.requested_by !== me),
      outgoing: rows.filter(r => r.status === 'pending' && r.requested_by === me),
    });
  } catch (err: any) {
    console.error('list friends error:', err.message);
    return res.status(500).json({ error: 'Failed to load connections' });
  }
});

// Accept an incoming request.
friendsRouter.post('/friends/:id/accept', async (req, res) => {
  try {
    const me = (req as any).userId;
    const id = Number(req.params.id);
    const [c] = await sql`SELECT id, requested_by FROM connections WHERE id = ${id} AND (user_a = ${me} OR user_b = ${me}) AND status = 'pending'`;
    if (!c) return res.status(404).json({ error: 'Request not found' });
    if (c.requested_by === me) return res.status(400).json({ error: "Can't accept your own request" });
    await sql`UPDATE connections SET status = 'accepted', accepted_at = NOW() WHERE id = ${id}`;
    await createNotification({ userId: c.requested_by, type: 'friend_accept', title: `${await senderName(me)} accepted your connection`, actionUrl: '/#mode=friends' });
    return res.json({ ok: true });
  } catch (err: any) {
    console.error('accept friend error:', err.message);
    return res.status(500).json({ error: 'Failed to accept' });
  }
});

// Decline an incoming request / remove an existing connection.
friendsRouter.delete('/friends/:id', async (req, res) => {
  try {
    const me = (req as any).userId;
    const id = Number(req.params.id);
    await sql`DELETE FROM connections WHERE id = ${id} AND (user_a = ${me} OR user_b = ${me})`;
    return res.json({ ok: true });
  } catch (err: any) {
    console.error('remove friend error:', err.message);
    return res.status(500).json({ error: 'Failed to remove' });
  }
});

// ─── Direct messages (async) ─────────────────────────────────

// Get or create a 1:1 thread with a connected user.
friendsRouter.post('/dm/with/:userId', async (req, res) => {
  try {
    const me = (req as any).userId;
    const other = Number(req.params.userId);
    if (!other || other === me) return res.status(400).json({ error: 'Invalid user' });
    const [a, b] = pair(me, other);
    const [conn] = await sql`SELECT id FROM connections WHERE user_a = ${a} AND user_b = ${b} AND status = 'accepted'`;
    if (!conn) return res.status(403).json({ error: 'Not connected' });
    let [thread] = await sql`SELECT id FROM direct_threads WHERE user_a = ${a} AND user_b = ${b}`;
    if (!thread) [thread] = await sql`INSERT INTO direct_threads (user_a, user_b) VALUES (${a}, ${b}) RETURNING id`;
    return res.json({ threadId: thread.id });
  } catch (err: any) {
    console.error('open dm error:', err.message);
    return res.status(500).json({ error: 'Failed to open thread' });
  }
});

// List my DM threads with last message + unread count.
friendsRouter.get('/dm/threads', async (req, res) => {
  try {
    const me = (req as any).userId;
    const rows = await sql`
      SELECT t.id, t.last_message_at,
             u.id AS friend_id, u.display_name, u.email,
             (SELECT content FROM direct_messages m WHERE m.thread_id = t.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
             (SELECT COUNT(*) FROM direct_messages m WHERE m.thread_id = t.id AND m.sender_id <> ${me} AND m.read_at IS NULL)::int AS unread
      FROM direct_threads t
      JOIN users u ON u.id = CASE WHEN t.user_a = ${me} THEN t.user_b ELSE t.user_a END
      WHERE t.user_a = ${me} OR t.user_b = ${me}
      ORDER BY t.last_message_at DESC NULLS LAST
    `;
    return res.json(rows);
  } catch (err: any) {
    console.error('list threads error:', err.message);
    return res.status(500).json({ error: 'Failed to load threads' });
  }
});

// Messages in a thread (participant-gated).
friendsRouter.get('/dm/:threadId/messages', async (req, res) => {
  try {
    const me = (req as any).userId;
    const tid = Number(req.params.threadId);
    const [t] = await sql`SELECT user_a, user_b FROM direct_threads WHERE id = ${tid} AND (user_a = ${me} OR user_b = ${me})`;
    if (!t) return res.status(404).json({ error: 'Thread not found' });
    const msgs = await sql`SELECT id, sender_id, content, created_at, read_at FROM direct_messages WHERE thread_id = ${tid} ORDER BY created_at ASC LIMIT 300`;
    return res.json(msgs);
  } catch (err: any) {
    console.error('thread messages error:', err.message);
    return res.status(500).json({ error: 'Failed to load messages' });
  }
});

// Send a message (participant-gated) + notify the recipient.
friendsRouter.post('/dm/:threadId/messages', async (req, res) => {
  try {
    const me = (req as any).userId;
    const tid = Number(req.params.threadId);
    const content = String(req.body?.content ?? '').trim();
    if (!content) return res.status(400).json({ error: 'Empty message' });
    if (content.length > 4000) return res.status(400).json({ error: 'Message too long' });
    const [t] = await sql`SELECT user_a, user_b FROM direct_threads WHERE id = ${tid} AND (user_a = ${me} OR user_b = ${me})`;
    if (!t) return res.status(404).json({ error: 'Thread not found' });
    const [msg] = await sql`INSERT INTO direct_messages (thread_id, sender_id, content) VALUES (${tid}, ${me}, ${content}) RETURNING id, sender_id, content, created_at, read_at`;
    await sql`UPDATE direct_threads SET last_message_at = NOW() WHERE id = ${tid}`;
    const recipient = t.user_a === me ? t.user_b : t.user_a;
    await createNotification({ userId: recipient, type: 'direct_message', title: `${await senderName(me)} messaged you`, body: content.slice(0, 140), actionUrl: '/#mode=friends' });
    return res.json(msg);
  } catch (err: any) {
    console.error('send dm error:', err.message);
    return res.status(500).json({ error: 'Failed to send' });
  }
});

// Mark a thread's incoming messages read.
friendsRouter.post('/dm/:threadId/read', async (req, res) => {
  try {
    const me = (req as any).userId;
    const tid = Number(req.params.threadId);
    await sql`UPDATE direct_messages SET read_at = NOW() WHERE thread_id = ${tid} AND sender_id <> ${me} AND read_at IS NULL`;
    return res.json({ ok: true });
  } catch (err: any) {
    console.error('mark read error:', err.message);
    return res.status(500).json({ error: 'Failed' });
  }
});
