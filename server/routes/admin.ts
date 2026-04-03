/**
 * Admin Routes — metrics, issues, Claude query, health.
 * All require admin role (user.role = 'admin' or user.email in allowlist).
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const adminRouter = Router();

// Admin check — only Paul (or future admins)
const ADMIN_EMAILS = ['paulbryantbaker@gmail.com']; // Add more as needed
function requireAdmin(req: any, res: any, next: any) {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Auth required' });

  sql`SELECT email, role FROM users WHERE id = ${userId}`.then(([user]: any) => {
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (user.role === 'admin' || ADMIN_EMAILS.includes(user.email)) {
      next();
    } else {
      res.status(403).json({ error: 'Admin access required' });
    }
  }).catch(() => res.status(500).json({ error: 'Auth check failed' }));
}

adminRouter.use(requireAuth);
adminRouter.use(requireAdmin);

// ─── Metrics Overview ───────────────────────────────────────

adminRouter.get('/admin/metrics/overview', async (_req, res) => {
  try {
    const [users] = await sql`SELECT COUNT(*)::int as total FROM users`;
    const [active7d] = await sql`
      SELECT COUNT(DISTINCT user_id)::int as count FROM conversations
      WHERE updated_at > NOW() - INTERVAL '7 days' AND user_id IS NOT NULL
    `;
    const [deals] = await sql`SELECT COUNT(*)::int as total FROM deals WHERE status = 'active'`;
    const [mrr] = await sql`
      SELECT COALESCE(SUM(CASE
        WHEN plan = 'starter' THEN 4900
        WHEN plan = 'professional' THEN 14900
        WHEN plan = 'enterprise' THEN 99900
        ELSE 0
      END), 0)::bigint as mrr_cents
      FROM subscriptions WHERE status IN ('active', 'trialing')
    `;
    const [deliverables] = await sql`
      SELECT COUNT(*)::int as total FROM deliverables WHERE created_at > NOW() - INTERVAL '30 days'
    `;
    const [errors24h] = await sql`
      SELECT COUNT(*)::int as total FROM support_issues
      WHERE type = 'system_error' AND created_at > NOW() - INTERVAL '24 hours'
    `;

    res.json({
      totalUsers: users.total,
      activeUsers7d: active7d.count,
      totalDeals: deals.total,
      mrrCents: Number(mrr.mrr_cents),
      deliverables30d: deliverables.total,
      errors24h: errors24h.total,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Conversion Funnel ──────────────────────────────────────

adminRouter.get('/admin/metrics/funnel', async (_req, res) => {
  try {
    const [totalUsers] = await sql`SELECT COUNT(*)::int as c FROM users`;
    const [withConversation] = await sql`
      SELECT COUNT(DISTINCT user_id)::int as c FROM conversations WHERE user_id IS NOT NULL
    `;
    const [with3Messages] = await sql`
      SELECT COUNT(DISTINCT c.user_id)::int as c FROM conversations c
      JOIN (SELECT conversation_id, COUNT(*)::int as cnt FROM messages GROUP BY conversation_id HAVING COUNT(*) >= 3) m
      ON m.conversation_id = c.id WHERE c.user_id IS NOT NULL
    `;
    const [withDeal] = await sql`SELECT COUNT(DISTINCT user_id)::int as c FROM deals`;
    const [withDeliverable] = await sql`SELECT COUNT(DISTINCT user_id)::int as c FROM deliverables`;
    const [withSubscription] = await sql`
      SELECT COUNT(DISTINCT user_id)::int as c FROM subscriptions WHERE status IN ('active', 'trialing')
    `;

    res.json({
      funnel: [
        { stage: 'Registered', count: totalUsers.c },
        { stage: 'First Conversation', count: withConversation.c },
        { stage: '3+ Messages', count: with3Messages.c },
        { stage: 'Deal Created', count: withDeal.c },
        { stage: 'Deliverable Generated', count: withDeliverable.c },
        { stage: 'Subscribed', count: withSubscription.c },
      ],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Journey Distribution ───────────────────────────────────

adminRouter.get('/admin/metrics/journeys', async (_req, res) => {
  try {
    const journeys = await sql`
      SELECT journey_type, COUNT(*)::int as count,
             AVG(CASE WHEN current_gate ~ '[0-9]' THEN CAST(SUBSTRING(current_gate FROM '[0-9]+') AS INTEGER) ELSE 0 END) as avg_gate
      FROM deals WHERE status = 'active'
      GROUP BY journey_type ORDER BY count DESC
    `;
    res.json({ journeys });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Gate Heatmap ───────────────────────────────────────────

adminRouter.get('/admin/metrics/gate-heatmap', async (_req, res) => {
  try {
    const gates = await sql`
      SELECT current_gate, COUNT(*)::int as count
      FROM deals WHERE status = 'active' AND current_gate IS NOT NULL
      GROUP BY current_gate ORDER BY current_gate
    `;
    res.json({ gates });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Revenue ────────────────────────────────────────────────

adminRouter.get('/admin/metrics/revenue', async (_req, res) => {
  try {
    const breakdown = await sql`
      SELECT plan, COUNT(*)::int as count, status
      FROM subscriptions
      GROUP BY plan, status ORDER BY plan
    `;
    const [mrr] = await sql`
      SELECT COALESCE(SUM(CASE
        WHEN plan = 'starter' THEN 4900
        WHEN plan = 'professional' THEN 14900
        WHEN plan = 'enterprise' THEN 99900
        ELSE 0
      END), 0)::bigint as mrr_cents
      FROM subscriptions WHERE status IN ('active', 'trialing')
    `;
    res.json({ breakdown, mrrCents: Number(mrr.mrr_cents) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Engagement ─────────────────────────────────────────────

adminRouter.get('/admin/metrics/engagement', async (_req, res) => {
  try {
    const [messages7d] = await sql`
      SELECT COUNT(*)::int as c FROM messages WHERE created_at > NOW() - INTERVAL '7 days'
    `;
    const [deliverables7d] = await sql`
      SELECT COUNT(*)::int as c FROM deliverables WHERE created_at > NOW() - INTERVAL '7 days'
    `;
    const [events7d] = await sql`
      SELECT event_type, COUNT(*)::int as c FROM analytics_events
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY event_type ORDER BY c DESC
    `;
    res.json({ messages7d: messages7d.c, deliverables7d: deliverables7d.c, events: events7d });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Issues CRUD ────────────────────────────────────────────

adminRouter.get('/admin/issues', async (req, res) => {
  try {
    const status = req.query.status as string | undefined;
    const type = req.query.type as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string || '50'), 200);

    const issues = await sql`
      SELECT si.*, u.email as user_email, u.display_name as user_name,
             d.business_name, d.journey_type, d.current_gate
      FROM support_issues si
      LEFT JOIN users u ON u.id = si.user_id
      LEFT JOIN deals d ON d.id = si.deal_id
      WHERE 1=1
        ${status ? sql`AND si.status = ${status}` : sql``}
        ${type ? sql`AND si.type = ${type}` : sql``}
      ORDER BY
        CASE si.severity WHEN 'critical' THEN 0 WHEN 'major' THEN 1 WHEN 'minor' THEN 2 ELSE 3 END,
        si.created_at DESC
      LIMIT ${limit}
    `;
    res.json({ issues });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/admin/issues/stats', async (_req, res) => {
  try {
    const stats = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'open')::int as open_total,
        COUNT(*) FILTER (WHERE status = 'open' AND severity = 'critical')::int as open_critical,
        COUNT(*) FILTER (WHERE status = 'resolved')::int as resolved,
        COUNT(*) FILTER (WHERE type = 'feature_request' AND status = 'open')::int as open_features,
        COUNT(*) FILTER (WHERE type = 'system_error' AND created_at > NOW() - INTERVAL '24 hours')::int as errors_24h
      FROM support_issues
    `;
    res.json(stats[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/admin/issues/:id', async (req, res) => {
  try {
    const [issue] = await sql`
      SELECT si.*, u.email as user_email, u.display_name as user_name,
             d.business_name, d.journey_type, d.current_gate, d.league
      FROM support_issues si
      LEFT JOIN users u ON u.id = si.user_id
      LEFT JOIN deals d ON d.id = si.deal_id
      WHERE si.id = ${parseInt(req.params.id)}
    `;
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(issue);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.patch('/admin/issues/:id', async (req, res) => {
  try {
    const { status, resolution, internal_notes } = req.body;
    const [updated] = await sql`
      UPDATE support_issues SET
        ${status ? sql`status = ${status},` : sql``}
        ${resolution ? sql`resolution = ${resolution},` : sql``}
        ${internal_notes !== undefined ? sql`internal_notes = ${internal_notes},` : sql``}
        ${status === 'resolved' ? sql`resolved_at = NOW(),` : sql``}
        updated_at = NOW()
      WHERE id = ${parseInt(req.params.id)}
      RETURNING *
    `;
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Feature Requests (grouped) ─────────────────────────────

adminRouter.get('/admin/issues/features', async (_req, res) => {
  try {
    const features = await sql`
      SELECT si.id, si.title, si.description, si.user_message, si.severity, si.status,
             si.context, si.created_at, u.email as user_email
      FROM support_issues si
      LEFT JOIN users u ON u.id = si.user_id
      WHERE si.type = 'feature_request'
      ORDER BY si.created_at DESC
    `;
    res.json({ features });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Service Health ─────────────────────────────────────────

adminRouter.get('/admin/health', async (_req, res) => {
  try {
    // Check each service by looking at recent errors
    const services = await sql`
      SELECT related_service, COUNT(*)::int as error_count,
             MAX(created_at) as last_error
      FROM support_issues
      WHERE type = 'system_error' AND created_at > NOW() - INTERVAL '24 hours'
      GROUP BY related_service
    `;

    // DB health
    const [dbCheck] = await sql`SELECT 1 as ok`;

    res.json({
      database: dbCheck ? 'healthy' : 'error',
      services: services || [],
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message, database: 'error' });
  }
});
