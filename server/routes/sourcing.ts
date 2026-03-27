/**
 * Sourcing Routes — Buyer theses, deal matching, opportunity management
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { runThesisMatch } from '../services/thesisMatchingService.js';
import { findUnderservedMarkets } from '../services/marketOpportunityService.js';
import { matchBuyersForSeller, estimateDemand } from '../services/buyerSourcingService.js';
import { initializePipeline, getPortfolioProgress, enrichCandidateOnDemand } from '../services/sourcingPipelineService.js';

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

// ─── Thesis Scan ────────────────────────────────────────────

sourcingRouter.post('/sourcing/theses/:thesisId/scan', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const thesisId = parseInt(req.params.thesisId, 10);

    const [thesis] = await sql`SELECT id FROM buyer_theses WHERE id = ${thesisId} AND user_id = ${userId}`;
    if (!thesis) return res.status(404).json({ error: 'Thesis not found' });

    const result = await runThesisMatch(thesisId);
    return res.json(result);
  } catch (err: any) {
    console.error('Thesis scan error:', err.message);
    return res.status(500).json({ error: 'Failed to scan thesis' });
  }
});

// ─── Market Opportunities ───────────────────────────────────

sourcingRouter.get('/sourcing/market-opportunities/:naicsCode', async (req, res) => {
  try {
    const naicsCode = req.params.naicsCode;
    if (!naicsCode || naicsCode.length < 2) return res.status(400).json({ error: 'Valid NAICS code required' });

    const opportunities = await findUnderservedMarkets(naicsCode);
    return res.json({ naicsCode, opportunities });
  } catch (err: any) {
    console.error('Market opportunities error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch market opportunities' });
  }
});

// ─── Buyer Demand (for sellers) ─────────────────────────────

sourcingRouter.get('/sourcing/buyer-demand/:dealId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = parseInt(req.params.dealId, 10);

    const [deal] = await sql`SELECT id FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const result = await matchBuyersForSeller(dealId);
    return res.json(result);
  } catch (err: any) {
    console.error('Buyer demand error:', err.message);
    return res.status(500).json({ error: 'Failed to analyze buyer demand' });
  }
});

sourcingRouter.get('/sourcing/buyer-types/:naicsCode', async (req, res) => {
  try {
    const naicsCode = req.params.naicsCode;
    const state = req.query.state as string || '';

    const demand = await estimateDemand(naicsCode, state);
    return res.json({ naicsCode, state: state || 'all', ...demand });
  } catch (err: any) {
    console.error('Buyer types error:', err.message);
    return res.status(500).json({ error: 'Failed to get buyer type data' });
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

// ─── Sourcing Pipeline (5-Stage Engine) ─────────────────────────────

/** Initialize the sourcing pipeline for a thesis. Stage 1 runs synchronously. */
sourcingRouter.post('/sourcing/theses/:thesisId/pipeline', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const thesisId = parseInt(req.params.thesisId, 10);

    // Verify ownership
    const [thesis] = await sql`
      SELECT id FROM buyer_theses WHERE id = ${thesisId} AND user_id = ${userId}
    `;
    if (!thesis) return res.status(404).json({ error: 'Thesis not found' });

    // TODO: subscription check — Professional tier required
    // const sub = await getSubscription(userId);
    // if (!sub || sub.plan === 'free' || sub.plan === 'starter') {
    //   return res.status(403).json({ error: 'Professional subscription required', paywall: true });
    // }

    const result = await initializePipeline(thesisId, userId);
    return res.json(result);
  } catch (err: any) {
    console.error('Pipeline init error:', err);
    return res.status(500).json({ error: err.message || 'Pipeline initialization failed' });
  }
});

/** Get a portfolio with stats */
sourcingRouter.get('/sourcing/portfolios/:portfolioId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const portfolioId = parseInt(req.params.portfolioId, 10);

    const [portfolio] = await sql`
      SELECT p.*,
        b.market_density, b.deal_economics, b.acquisition_signals,
        b.competitive_landscape, b.key_risks, b.recommended_params,
        b.narrative_markdown, b.status as brief_status,
        b.generation_time_ms as brief_generation_time_ms
      FROM sourcing_portfolios p
      LEFT JOIN sourcing_briefs b ON b.id = p.brief_id
      WHERE p.id = ${portfolioId} AND p.user_id = ${userId}
    `;
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

    return res.json(portfolio);
  } catch (err: any) {
    console.error('Portfolio fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

/** Get intelligence brief content */
sourcingRouter.get('/sourcing/briefs/:briefId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const briefId = parseInt(req.params.briefId, 10);

    const [brief] = await sql`
      SELECT * FROM sourcing_briefs
      WHERE id = ${briefId} AND user_id = ${userId}
    `;
    if (!brief) return res.status(404).json({ error: 'Brief not found' });

    return res.json(brief);
  } catch (err: any) {
    console.error('Brief fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch brief' });
  }
});

/** SSE endpoint for pipeline progress */
sourcingRouter.get('/sourcing/portfolios/:portfolioId/progress', async (req, res) => {
  const userId = (req as any).userId;
  const portfolioId = parseInt(req.params.portfolioId, 10);

  // Verify ownership
  const [portfolio] = await sql`
    SELECT id FROM sourcing_portfolios WHERE id = ${portfolioId} AND user_id = ${userId}
  `;
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

  // SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const sendEvent = (event: string, data: unknown) => {
    if (res.destroyed || res.writableEnded) return;
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  // Poll progress every 2 seconds
  const interval = setInterval(async () => {
    try {
      const progress = await getPortfolioProgress(portfolioId);
      if (!progress) {
        sendEvent('error', { message: 'Portfolio not found' });
        clearInterval(interval);
        res.end();
        return;
      }

      sendEvent('progress', progress);

      // Close when pipeline is ready or failed
      if (progress.pipelineStatus === 'ready' || progress.pipelineStatus === 'failed') {
        sendEvent('pipeline-complete', progress);
        clearInterval(interval);
        res.end();
      }
    } catch {
      // Ignore poll errors
    }
  }, 2000);

  // Heartbeat every 15 seconds
  const heartbeat = setInterval(() => {
    if (res.destroyed || res.writableEnded) return;
    res.write(': heartbeat\n\n');
  }, 15000);

  // Cleanup on client disconnect
  req.on('close', () => {
    clearInterval(interval);
    clearInterval(heartbeat);
  });
});

/** Get portfolio candidates with filtering */
sourcingRouter.get('/sourcing/portfolios/:portfolioId/candidates', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const portfolioId = parseInt(req.params.portfolioId, 10);
    const tier = req.query.tier as string | undefined;
    const status = req.query.status as string | undefined;
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = Math.min(parseInt(req.query.limit as string || '50', 10), 100);
    const offset = (page - 1) * limit;

    // Verify ownership
    const [portfolio] = await sql`
      SELECT id FROM sourcing_portfolios WHERE id = ${portfolioId} AND user_id = ${userId}
    `;
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

    // Build query with optional filters
    const candidates = await sql`
      SELECT * FROM sourcing_candidates
      WHERE portfolio_id = ${portfolioId}
        ${tier ? sql`AND tier = ${tier}` : sql``}
        ${status ? sql`AND pipeline_status = ${status}` : sql``}
      ORDER BY total_score DESC, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [{ count }] = await sql`
      SELECT COUNT(*)::int as count FROM sourcing_candidates
      WHERE portfolio_id = ${portfolioId}
        ${tier ? sql`AND tier = ${tier}` : sql``}
        ${status ? sql`AND pipeline_status = ${status}` : sql``}
    `;

    return res.json({ candidates, total: count, page, limit });
  } catch (err: any) {
    console.error('Candidates fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

/** Get single candidate detail */
sourcingRouter.get('/sourcing/candidates/:candidateId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const candidateId = parseInt(req.params.candidateId, 10);

    const [candidate] = await sql`
      SELECT * FROM sourcing_candidates
      WHERE id = ${candidateId} AND user_id = ${userId}
    `;
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    return res.json(candidate);
  } catch (err: any) {
    console.error('Candidate fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch candidate' });
  }
});

/** Update candidate status/notes */
sourcingRouter.patch('/sourcing/candidates/:candidateId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const candidateId = parseInt(req.params.candidateId, 10);
    const { status, notes } = req.body;

    const validStatuses = ['new', 'reviewing', 'contacted', 'responded', 'meeting', 'pursuing', 'passed', 'archived'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const [candidate] = await sql`
      SELECT id FROM sourcing_candidates WHERE id = ${candidateId} AND user_id = ${userId}
    `;
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    const [updated] = await sql`
      UPDATE sourcing_candidates SET
        ${status ? sql`pipeline_status = ${status}, pipeline_status_changed_at = NOW(),` : sql``}
        ${notes !== undefined ? sql`user_notes = ${notes},` : sql``}
        updated_at = NOW()
      WHERE id = ${candidateId}
      RETURNING *
    `;

    return res.json(updated);
  } catch (err: any) {
    console.error('Candidate update error:', err);
    return res.status(500).json({ error: 'Failed to update candidate' });
  }
});

/** Get user's portfolios for a thesis (or all) */
sourcingRouter.get('/sourcing/portfolios', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const thesisId = req.query.thesisId ? parseInt(req.query.thesisId as string, 10) : null;

    const portfolios = await sql`
      SELECT p.*, b.status as brief_status
      FROM sourcing_portfolios p
      LEFT JOIN sourcing_briefs b ON b.id = p.brief_id
      WHERE p.user_id = ${userId}
        ${thesisId ? sql`AND p.thesis_id = ${thesisId}` : sql``}
      ORDER BY p.updated_at DESC
    `;

    return res.json(portfolios);
  } catch (err: any) {
    console.error('Portfolios fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch portfolios' });
  }
});

/** On-demand enrichment for a single candidate (Tier 3 or 4) */
sourcingRouter.post('/sourcing/candidates/:candidateId/enrich', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const candidateId = parseInt(req.params.candidateId, 10);

    const [candidate] = await sql`
      SELECT * FROM sourcing_candidates WHERE id = ${candidateId} AND user_id = ${userId}
    `;
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    const updated = await enrichCandidateOnDemand(candidateId);
    return res.json(updated);
  } catch (err: any) {
    console.error('Enrichment error:', err);
    return res.status(500).json({ error: err.message || 'Enrichment failed' });
  }
});
