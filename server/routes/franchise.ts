/**
 * Franchise Routes — Search and match franchise brands for buyers.
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { matchFranchises } from '../services/franchiseMatchingService.js';

export const franchiseRouter = Router();

// Search franchise brands
franchiseRouter.get('/franchise/search', async (req, res) => {
  try {
    const { budget, liquidCapital, modelType, category, state, homeBased, limit } = req.query;
    const results = await matchFranchises({
      budget: budget ? parseInt(budget as string, 10) : undefined,
      liquidCapital: liquidCapital ? parseInt(liquidCapital as string, 10) : undefined,
      modelType: modelType as string || undefined,
      category: category as string || undefined,
      state: state as string || undefined,
      homeBased: homeBased === 'true' ? true : homeBased === 'false' ? false : undefined,
      limit: limit ? parseInt(limit as string, 10) : 10,
    });
    return res.json({ franchises: results });
  } catch (err: any) {
    console.error('Franchise search error:', err.message);
    return res.status(500).json({ error: 'Failed to search franchises' });
  }
});

// Match franchises to a buyer's deal profile
franchiseRouter.get('/franchise/match/:dealId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = parseInt(req.params.dealId, 10);

    const [deal] = await sql`SELECT * FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const financials = (deal.financials as Record<string, any>) || {};
    const results = await matchFranchises({
      budget: deal.asking_price || financials.budget || undefined,
      liquidCapital: financials.liquid_capital || undefined,
      modelType: financials.model_preference || undefined,
      category: deal.industry || undefined,
      state: deal.location?.split(',').pop()?.trim() || undefined,
      limit: 10,
    });

    return res.json({ dealId, franchises: results });
  } catch (err: any) {
    console.error('Franchise match error:', err.message);
    return res.status(500).json({ error: 'Failed to match franchises' });
  }
});

// Franchise brand detail
franchiseRouter.get('/franchise/:id', async (req, res) => {
  try {
    const brandId = parseInt(req.params.id, 10);
    const [brand] = await sql`SELECT * FROM franchise_brands WHERE id = ${brandId}`;
    if (!brand) return res.status(404).json({ error: 'Franchise brand not found' });
    return res.json(brand);
  } catch (err: any) {
    console.error('Franchise detail error:', err.message);
    return res.status(500).json({ error: 'Failed to get franchise details' });
  }
});
