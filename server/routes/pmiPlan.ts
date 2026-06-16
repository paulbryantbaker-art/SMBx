/**
 * PMI Value-Capture Plan routes — the real 100-day integration tracker.
 *   GET    /api/deals/:dealId/integration-plan          read (200 honest-empty when none)
 *   POST   /api/deals/:dealId/integration-plan/generate  generate + persist (also via Yulia tool)
 *   PATCH  /api/deals/:dealId/workstreams/:wsId           self-report execution progress
 * Auth: blanket requireAuth upstream sets (req as any).userId; every route is RBAC-gated
 * via hasDealAccess (404 on no access; writes require full access).
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { hasDealAccess } from '../services/dealAccessService.js';
import { generateIntegrationPlan, saveIntegrationPlan, getIntegrationPlan, updateWorkstream } from '../services/pmiValueCaptureService.js';

export const pmiPlanRouter = Router();

async function loadPmiDeal(dealId: number, userId: number) {
  const [deal] = await sql`
    SELECT id, user_id, business_name, industry, league, revenue, ebitda, journey_type
    FROM deals WHERE id = ${dealId} LIMIT 1
  `;
  if (!deal) return null;
  return {
    dealId: deal.id as number,
    userId,
    business_name: deal.business_name as string | undefined,
    industry: deal.industry as string | undefined,
    league: deal.league as string | undefined,
    revenueCents: deal.revenue == null ? null : Number(deal.revenue),
    ebitdaCents: deal.ebitda == null ? null : Number(deal.ebitda),
  };
}

// ─── Read the plan (honest-empty 200 when none) ───────────────
pmiPlanRouter.get('/deals/:dealId/integration-plan', async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const dealId = parseInt(req.params.dealId);
  if (!dealId) return res.status(400).json({ error: 'Invalid deal ID' });
  try {
    const access = await hasDealAccess(dealId, userId);
    if (!access) return res.status(404).json({ error: 'Deal not found' });
    const result = await getIntegrationPlan(dealId);
    // never 404 into a fake — empty plan is an honest 200
    return res.json(result || { plan: null, workstreams: [], milestones: [] });
  } catch (err: any) {
    console.error('Get integration plan error:', err.message);
    return res.status(500).json({ error: 'Failed to load integration plan' });
  }
});

// ─── Generate + persist a 100-day plan ────────────────────────
pmiPlanRouter.post('/deals/:dealId/integration-plan/generate', async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const dealId = parseInt(req.params.dealId);
  if (!dealId) return res.status(400).json({ error: 'Invalid deal ID' });
  try {
    const access = await hasDealAccess(dealId, userId);
    if (!access) return res.status(404).json({ error: 'Deal not found' });
    if (access.access_level !== 'full') return res.status(403).json({ error: 'Full access required to build the plan' });

    const deal = await loadPmiDeal(dealId, userId);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const generated = await generateIntegrationPlan(deal);
    await saveIntegrationPlan(deal, generated);
    const result = await getIntegrationPlan(dealId);
    return res.json(result || { plan: null, workstreams: [], milestones: [] });
  } catch (err: any) {
    console.error('Generate integration plan error:', err.message);
    return res.status(500).json({ error: 'Failed to generate integration plan' });
  }
});

// ─── Update a workstream (self-reported execution progress) ───
pmiPlanRouter.patch('/deals/:dealId/workstreams/:wsId', async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const dealId = parseInt(req.params.dealId);
  const wsId = parseInt(req.params.wsId);
  if (!dealId || !wsId) return res.status(400).json({ error: 'Invalid id' });
  try {
    const access = await hasDealAccess(dealId, userId);
    if (!access) return res.status(404).json({ error: 'Deal not found' });
    if (access.access_level !== 'full') return res.status(403).json({ error: 'Full access required to update workstreams' });

    const { status, pct } = req.body || {};
    const updated = await updateWorkstream(wsId, dealId, { status, pct });
    if (!updated) return res.status(404).json({ error: 'Workstream not found' });
    return res.json(updated);
  } catch (err: any) {
    console.error('Update workstream error:', err.message);
    return res.status(500).json({ error: 'Failed to update workstream' });
  }
});
