/**
 * Sourcing Routes — Buyer theses, deal matching, opportunity management
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const sourcingRouter = Router();
sourcingRouter.use(requireAuth);

// ─── Thesis CRUD ─────────────────────────────────────────────

sourcingRouter.get('/sourcing/theses', async (req, res) => {
  try {
    const userId = (req as any).userId;

    const theses = await sql`
      SELECT t.*,
        (SELECT COUNT(*) FROM thesis_matches tm WHERE tm.thesis_id = t.id AND tm.status = 'new') as new_matches,
        (SELECT COUNT(*) FROM thesis_matches tm WHERE tm.thesis_id = t.id AND tm.status = 'pursuing') as pursuing_count,
        (SELECT COUNT(*) FROM thesis_matches tm WHERE tm.thesis_id = t.id) as total_matches
      FROM buyer_theses t
      WHERE t.user_id = ${userId}
      ORDER BY t.updated_at DESC
    `;

    return res.json(theses);
  } catch (err: any) {
    console.error('List theses error:', err.message);
    return res.status(500).json({ error: 'Failed to list theses' });
  }
});

sourcingRouter.post('/sourcing/theses', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const {
      name, industry, naicsCodes, geography, stateCodes,
      revenueMin, revenueMax, ebitdaMin, ebitdaMax, sdeMin, sdeMax,
      priceMin, priceMax, employeeMin, employeeMax, keywords, notes,
    } = req.body;

    if (!name) return res.status(400).json({ error: 'Thesis name is required' });

    const [thesis] = await sql`
      INSERT INTO buyer_theses (
        user_id, name, industry, naics_codes, geography, state_codes,
        revenue_min, revenue_max, ebitda_min, ebitda_max, sde_min, sde_max,
        price_min, price_max, employee_min, employee_max, keywords, notes
      ) VALUES (
        ${userId}, ${name}, ${industry || null}, ${naicsCodes || null}, ${geography || null}, ${stateCodes || null},
        ${revenueMin || null}, ${revenueMax || null}, ${ebitdaMin || null}, ${ebitdaMax || null}, ${sdeMin || null}, ${sdeMax || null},
        ${priceMin || null}, ${priceMax || null}, ${employeeMin || null}, ${employeeMax || null}, ${keywords || null}, ${notes || null}
      )
      RETURNING *
    `;

    return res.status(201).json(thesis);
  } catch (err: any) {
    console.error('Create thesis error:', err.message);
    return res.status(500).json({ error: 'Failed to create thesis' });
  }
});

sourcingRouter.patch('/sourcing/theses/:thesisId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const thesisId = parseInt(req.params.thesisId, 10);
    const updates = req.body;

    const [thesis] = await sql`SELECT id FROM buyer_theses WHERE id = ${thesisId} AND user_id = ${userId}`;
    if (!thesis) return res.status(404).json({ error: 'Thesis not found' });

    const [updated] = await sql`
      UPDATE buyer_theses SET
        name = COALESCE(${updates.name || null}, name),
        industry = COALESCE(${updates.industry || null}, industry),
        geography = COALESCE(${updates.geography || null}, geography),
        revenue_min = COALESCE(${updates.revenueMin ?? null}, revenue_min),
        revenue_max = COALESCE(${updates.revenueMax ?? null}, revenue_max),
        price_min = COALESCE(${updates.priceMin ?? null}, price_min),
        price_max = COALESCE(${updates.priceMax ?? null}, price_max),
        is_active = COALESCE(${updates.isActive ?? null}, is_active),
        notes = COALESCE(${updates.notes || null}, notes),
        updated_at = NOW()
      WHERE id = ${thesisId}
      RETURNING *
    `;

    return res.json(updated);
  } catch (err: any) {
    console.error('Update thesis error:', err.message);
    return res.status(500).json({ error: 'Failed to update thesis' });
  }
});

sourcingRouter.delete('/sourcing/theses/:thesisId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const thesisId = parseInt(req.params.thesisId, 10);

    const [deleted] = await sql`
      DELETE FROM buyer_theses WHERE id = ${thesisId} AND user_id = ${userId}
      RETURNING id
    `;

    if (!deleted) return res.status(404).json({ error: 'Thesis not found' });
    return res.json({ deleted: true });
  } catch (err: any) {
    console.error('Delete thesis error:', err.message);
    return res.status(500).json({ error: 'Failed to delete thesis' });
  }
});

// ─── Matches ─────────────────────────────────────────────────

sourcingRouter.get('/sourcing/theses/:thesisId/matches', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const thesisId = parseInt(req.params.thesisId, 10);
    const status = req.query.status as string || undefined;

    const [thesis] = await sql`SELECT id FROM buyer_theses WHERE id = ${thesisId} AND user_id = ${userId}`;
    if (!thesis) return res.status(404).json({ error: 'Thesis not found' });

    let matches;
    if (status) {
      matches = await sql`
        SELECT * FROM thesis_matches
        WHERE thesis_id = ${thesisId} AND user_id = ${userId} AND status = ${status}
        ORDER BY score DESC NULLS LAST, created_at DESC
      `;
    } else {
      matches = await sql`
        SELECT * FROM thesis_matches
        WHERE thesis_id = ${thesisId} AND user_id = ${userId}
        ORDER BY score DESC NULLS LAST, created_at DESC
      `;
    }

    return res.json(matches);
  } catch (err: any) {
    console.error('List matches error:', err.message);
    return res.status(500).json({ error: 'Failed to list matches' });
  }
});

// Add a match manually (user-submitted opportunity)
sourcingRouter.post('/sourcing/theses/:thesisId/matches', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const thesisId = parseInt(req.params.thesisId, 10);
    const { title, description, industry, location, askingPrice, revenue, ebitda, sde, listingUrl } = req.body;

    const [thesis] = await sql`SELECT * FROM buyer_theses WHERE id = ${thesisId} AND user_id = ${userId}`;
    if (!thesis) return res.status(404).json({ error: 'Thesis not found' });

    if (!title) return res.status(400).json({ error: 'Title is required' });

    // Score the match against thesis criteria
    const score = scoreMatch(thesis, { revenue, ebitda, sde, askingPrice, industry, location });

    const [match] = await sql`
      INSERT INTO thesis_matches (
        thesis_id, user_id, source, title, description, industry, location,
        asking_price, revenue, ebitda, sde, listing_url, score, score_breakdown
      ) VALUES (
        ${thesisId}, ${userId}, 'manual', ${title}, ${description || null}, ${industry || null}, ${location || null},
        ${askingPrice || null}, ${revenue || null}, ${ebitda || null}, ${sde || null}, ${listingUrl || null},
        ${score.total}, ${JSON.stringify(score.breakdown)}
      )
      RETURNING *
    `;

    return res.status(201).json(match);
  } catch (err: any) {
    console.error('Create match error:', err.message);
    return res.status(500).json({ error: 'Failed to create match' });
  }
});

// Update match status
sourcingRouter.patch('/sourcing/matches/:matchId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const matchId = parseInt(req.params.matchId, 10);
    const { status, notes } = req.body;

    const validStatuses = ['new', 'reviewing', 'pursuing', 'passed', 'archived'];
    if (status && !validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const [updated] = await sql`
      UPDATE thesis_matches SET
        status = COALESCE(${status || null}, status),
        notes = COALESCE(${notes || null}, notes),
        updated_at = NOW()
      WHERE id = ${matchId} AND user_id = ${userId}
      RETURNING *
    `;

    if (!updated) return res.status(404).json({ error: 'Match not found' });
    return res.json(updated);
  } catch (err: any) {
    console.error('Update match error:', err.message);
    return res.status(500).json({ error: 'Failed to update match' });
  }
});

// ─── Scoring Logic ───────────────────────────────────────────

function scoreMatch(
  thesis: any,
  opportunity: { revenue?: number; ebitda?: number; sde?: number; askingPrice?: number; industry?: string; location?: string }
): { total: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {};
  let totalWeight = 0;
  let totalScore = 0;

  // Revenue score (weight: 25)
  if (thesis.revenue_min || thesis.revenue_max) {
    const weight = 25;
    totalWeight += weight;
    if (opportunity.revenue) {
      const inRange = (!thesis.revenue_min || opportunity.revenue >= thesis.revenue_min) &&
                     (!thesis.revenue_max || opportunity.revenue <= thesis.revenue_max);
      if (inRange) {
        breakdown.revenue = 100;
      } else {
        // Partial score based on distance
        const min = thesis.revenue_min || 0;
        const max = thesis.revenue_max || min * 10;
        const mid = (min + max) / 2;
        const dist = Math.abs(opportunity.revenue - mid) / mid;
        breakdown.revenue = Math.max(0, Math.round(100 * (1 - dist)));
      }
    } else {
      breakdown.revenue = 50; // unknown = neutral
    }
    totalScore += breakdown.revenue * weight;
  }

  // Price score (weight: 25)
  if (thesis.price_min || thesis.price_max) {
    const weight = 25;
    totalWeight += weight;
    if (opportunity.askingPrice) {
      const inRange = (!thesis.price_min || opportunity.askingPrice >= thesis.price_min) &&
                     (!thesis.price_max || opportunity.askingPrice <= thesis.price_max);
      if (inRange) {
        breakdown.price = 100;
      } else {
        const min = thesis.price_min || 0;
        const max = thesis.price_max || min * 10;
        const mid = (min + max) / 2;
        const dist = Math.abs(opportunity.askingPrice - mid) / mid;
        breakdown.price = Math.max(0, Math.round(100 * (1 - dist)));
      }
    } else {
      breakdown.price = 50;
    }
    totalScore += breakdown.price * weight;
  }

  // Industry score (weight: 30)
  if (thesis.industry) {
    const weight = 30;
    totalWeight += weight;
    if (opportunity.industry) {
      const match = opportunity.industry.toLowerCase().includes(thesis.industry.toLowerCase()) ||
                   thesis.industry.toLowerCase().includes(opportunity.industry.toLowerCase());
      breakdown.industry = match ? 100 : 20;
    } else {
      breakdown.industry = 50;
    }
    totalScore += breakdown.industry * weight;
  }

  // Location score (weight: 20)
  if (thesis.geography) {
    const weight = 20;
    totalWeight += weight;
    if (opportunity.location) {
      const match = opportunity.location.toLowerCase().includes(thesis.geography.toLowerCase()) ||
                   thesis.geography.toLowerCase().includes(opportunity.location.toLowerCase());
      breakdown.location = match ? 100 : 30;
    } else {
      breakdown.location = 50;
    }
    totalScore += breakdown.location * weight;
  }

  const total = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;
  return { total, breakdown };
}
