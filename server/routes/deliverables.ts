/**
 * Deliverables Routes — Data room access + deliverable generation triggers.
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { enqueueDeliverableGeneration } from '../services/jobQueue.js';
import { processDeliverable } from '../services/deliverableProcessor.js';
import { getBalance, debitWallet } from '../services/walletService.js';
import { getLeagueMultiplier } from '../services/leagueClassifier.js';
import { hasDealAccess } from '../services/dealAccessService.js';

export const deliverablesRouter = Router();

// ─── List deliverables for a deal ──────────────────────────

deliverablesRouter.get('/deals/:dealId/deliverables', async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const dealId = parseInt(req.params.dealId);
  if (!dealId) return res.status(400).json({ error: 'Invalid deal ID' });

  try {
    // RBAC: check access (owner or participant)
    const access = await hasDealAccess(dealId, userId);
    if (!access) return res.status(404).json({ error: 'Deal not found' });

    const deliverables = await sql`
      SELECT d.id, d.deal_id, d.menu_item_id, d.status, d.created_at, d.completed_at,
             d.generation_time_ms, d.generation_model,
             m.slug, m.name, m.description, m.tier, m.journey, m.gate
      FROM deliverables d
      JOIN menu_items m ON m.id = d.menu_item_id
      WHERE d.deal_id = ${dealId}
      ORDER BY d.created_at DESC
    `;

    return res.json(deliverables);
  } catch (err: any) {
    console.error('List deliverables error:', err.message);
    return res.status(500).json({ error: 'Failed to list deliverables' });
  }
});

// ─── Get single deliverable content ────────────────────────

deliverablesRouter.get('/deliverables/:id', async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const deliverableId = parseInt(req.params.id);
  if (!deliverableId) return res.status(400).json({ error: 'Invalid deliverable ID' });

  try {
    const [deliverable] = await sql`
      SELECT d.*, m.slug, m.name, m.description, m.tier
      FROM deliverables d
      JOIN menu_items m ON m.id = d.menu_item_id
      WHERE d.id = ${deliverableId}
    `;

    if (!deliverable) return res.status(404).json({ error: 'Deliverable not found' });

    // RBAC: check access via deliverable's deal
    const access = await hasDealAccess(deliverable.deal_id, userId);
    if (!access) return res.status(404).json({ error: 'Deliverable not found' });

    return res.json(deliverable);
  } catch (err: any) {
    console.error('Get deliverable error:', err.message);
    return res.status(500).json({ error: 'Failed to get deliverable' });
  }
});

// ─── Request deliverable generation ────────────────────────

deliverablesRouter.post('/deals/:dealId/deliverables', async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const dealId = parseInt(req.params.dealId);
  const { menuItemSlug } = req.body;

  if (!dealId || !menuItemSlug) {
    return res.status(400).json({ error: 'dealId and menuItemSlug required' });
  }

  try {
    // Get deal
    const [deal] = await sql`SELECT * FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    // Get menu item
    const [menuItem] = await sql`SELECT * FROM menu_items WHERE slug = ${menuItemSlug} AND active = true`;
    if (!menuItem) return res.status(404).json({ error: 'Menu item not found' });

    // Calculate price with league multiplier
    const league = deal.league || 'L1';
    const multiplier = getLeagueMultiplier(league);
    const finalPrice = Math.round(menuItem.base_price_cents * multiplier);

    // Check wallet balance (skip for free items)
    if (finalPrice > 0) {
      const balance = await getBalance(userId);
      if (balance < finalPrice) {
        return res.status(402).json({
          error: 'Insufficient wallet balance',
          required: finalPrice,
          balance,
          requiredDisplay: `$${(finalPrice / 100).toFixed(2)}`,
          balanceDisplay: `$${(balance / 100).toFixed(2)}`,
        });
      }

      // Debit wallet
      await debitWallet(userId, finalPrice, `Deliverable: ${menuItem.name}`);
    }

    // Create deliverable record
    const [deliverable] = await sql`
      INSERT INTO deliverables (deal_id, user_id, menu_item_id, status, price_charged_cents)
      VALUES (${dealId}, ${userId}, ${menuItem.id}, 'queued', ${finalPrice})
      RETURNING id
    `;

    // Enqueue generation job
    const jobData = {
      deliverableId: deliverable.id,
      dealId,
      userId,
      menuItemSlug,
      deliverableType: menuItem.slug.replace(/-/g, '_'),
    };
    const jobId = await enqueueDeliverableGeneration(jobData);

    // Inline fallback: process in this process if worker isn't running.
    // The idempotency guard in processDeliverable prevents double-processing.
    setImmediate(() => {
      processDeliverable(jobData).catch(err =>
        console.error('Inline deliverable generation error:', err.message),
      );
    });

    return res.status(201).json({
      deliverableId: deliverable.id,
      jobId,
      status: 'queued',
      priceCharged: finalPrice,
      priceDisplay: `$${(finalPrice / 100).toFixed(2)}`,
    });
  } catch (err: any) {
    console.error('Generate deliverable error:', err.message);
    return res.status(500).json({ error: 'Failed to generate deliverable' });
  }
});

// ─── List available menu items for a deal ──────────────────

deliverablesRouter.get('/deals/:dealId/menu', async (req, res) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const dealId = parseInt(req.params.dealId);

  try {
    const [deal] = await sql`SELECT * FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const league = deal.league || 'L1';
    const multiplier = getLeagueMultiplier(league);
    const journey = deal.journey_type;

    // Get menu items for this journey + universal items
    const items = await sql`
      SELECT * FROM menu_items
      WHERE active = true
        AND (journey = ${journey} OR journey IS NULL)
      ORDER BY gate ASC NULLS LAST, tier ASC, base_price_cents ASC
    `;

    // Add final pricing
    const priced = (items as any[]).map(item => ({
      ...item,
      final_price_cents: Math.round(item.base_price_cents * multiplier),
      final_price_display: `$${(Math.round(item.base_price_cents * multiplier) / 100).toFixed(2)}`,
      league_multiplier: multiplier,
    }));

    return res.json(priced);
  } catch (err: any) {
    console.error('Menu items error:', err.message);
    return res.status(500).json({ error: 'Failed to get menu items' });
  }
});
