/**
 * Deep Data Routes — EDGAR benchmarks, news events, IHI, KPI templates
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const deepDataRouter = Router();
deepDataRouter.use(requireAuth);

// ─── Industry Health Index ───────────────────────────────────

deepDataRouter.get('/intelligence/ihi/:naicsCode', async (req, res) => {
  try {
    const { naicsCode } = req.params;
    const geography = req.query.geography as string || null;

    let ihi;
    if (geography) {
      [ihi] = await sql`
        SELECT * FROM industry_health_index
        WHERE naics_code = ${naicsCode} AND geography = ${geography} AND expires_at > NOW()
        ORDER BY calculated_at DESC LIMIT 1
      `;
    } else {
      [ihi] = await sql`
        SELECT * FROM industry_health_index
        WHERE naics_code = ${naicsCode} AND geography IS NULL AND expires_at > NOW()
        ORDER BY calculated_at DESC LIMIT 1
      `;
    }

    if (!ihi) return res.status(404).json({ error: 'No IHI data available for this industry' });

    return res.json(ihi);
  } catch (err: any) {
    console.error('IHI error:', err.message);
    return res.status(500).json({ error: 'Failed to get Industry Health Index' });
  }
});

// ─── EDGAR Benchmarks ────────────────────────────────────────

deepDataRouter.get('/intelligence/benchmarks/:naicsCode', async (req, res) => {
  try {
    const { naicsCode } = req.params;

    const benchmarks = await sql`
      SELECT metric, percentile_25, percentile_50, percentile_75, sample_size, data_year
      FROM edgar_benchmarks
      WHERE naics_code = ${naicsCode}
      ORDER BY data_year DESC, metric
    `;

    return res.json(benchmarks);
  } catch (err: any) {
    console.error('Benchmarks error:', err.message);
    return res.status(500).json({ error: 'Failed to get benchmarks' });
  }
});

// ─── Market Events ───────────────────────────────────────────

deepDataRouter.get('/intelligence/events', async (req, res) => {
  try {
    const naicsCode = req.query.naicsCode as string || null;
    const minImpact = parseFloat(req.query.minImpact as string || '0');
    const limit = Math.min(parseInt(req.query.limit as string || '20', 10), 50);

    let events;
    if (naicsCode) {
      events = await sql`
        SELECT id, source, title, summary, url, event_date, naics_codes, geography,
               impact_score, sentiment, category, created_at
        FROM market_events
        WHERE ${naicsCode} = ANY(naics_codes) AND impact_score >= ${minImpact}
        ORDER BY event_date DESC
        LIMIT ${limit}
      `;
    } else {
      events = await sql`
        SELECT id, source, title, summary, url, event_date, naics_codes, geography,
               impact_score, sentiment, category, created_at
        FROM market_events
        WHERE impact_score >= ${minImpact}
        ORDER BY event_date DESC
        LIMIT ${limit}
      `;
    }

    return res.json(events);
  } catch (err: any) {
    console.error('Events error:', err.message);
    return res.status(500).json({ error: 'Failed to get market events' });
  }
});

// ─── Deal-relevant events ────────────────────────────────────

deepDataRouter.get('/deals/:dealId/events', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = parseInt(req.params.dealId, 10);

    const [deal] = await sql`SELECT id, naics_code FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const events = await sql`
      SELECT me.id, me.title, me.summary, me.url, me.event_date, me.impact_score,
             me.sentiment, me.category, del.relevance_score, del.surfaced_at, del.dismissed_at
      FROM deal_event_links del
      JOIN market_events me ON me.id = del.event_id
      WHERE del.deal_id = ${dealId} AND del.dismissed_at IS NULL
      ORDER BY del.relevance_score DESC, me.event_date DESC
      LIMIT 20
    `;

    return res.json(events);
  } catch (err: any) {
    console.error('Deal events error:', err.message);
    return res.status(500).json({ error: 'Failed to get deal events' });
  }
});

// Dismiss an event
deepDataRouter.post('/deals/:dealId/events/:eventId/dismiss', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = parseInt(req.params.dealId, 10);
    const eventId = parseInt(req.params.eventId, 10);

    const [deal] = await sql`SELECT id FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    await sql`
      UPDATE deal_event_links SET dismissed_at = NOW()
      WHERE deal_id = ${dealId} AND event_id = ${eventId}
    `;

    return res.json({ dismissed: true });
  } catch (err: any) {
    console.error('Dismiss event error:', err.message);
    return res.status(500).json({ error: 'Failed to dismiss event' });
  }
});

// ─── KPI Templates ───────────────────────────────────────────

deepDataRouter.get('/intelligence/kpis/:naicsCode', async (req, res) => {
  try {
    const { naicsCode } = req.params;

    // Try exact match first, then broader match
    let [template] = await sql`
      SELECT * FROM industry_kpi_templates WHERE naics_code = ${naicsCode}
    `;

    if (!template) {
      // Try 4-digit NAICS
      const broad = naicsCode.substring(0, 4);
      [template] = await sql`
        SELECT * FROM industry_kpi_templates WHERE naics_code LIKE ${broad + '%'} LIMIT 1
      `;
    }

    if (!template) return res.status(404).json({ error: 'No KPI template for this industry' });

    return res.json(template);
  } catch (err: any) {
    console.error('KPI template error:', err.message);
    return res.status(500).json({ error: 'Failed to get KPI template' });
  }
});
