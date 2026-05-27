/**
 * GTM Routes — velocity analytics, ghost profiles, and legacy-safe stubs.
 *
 * Pricing must stay on the software side of THE LINE: subscriptions,
 * included credits, fixed deliverables, and outcome-independent data/API
 * pass-through only. No route in this module may create a fee tied to deal
 * value, close, success, referral, or counterparty routing.
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const gtmRouter = Router();
gtmRouter.use(requireAuth);

// ─── Retired Transaction Tokens ──────────────────────────────

gtmRouter.post('/deals/:dealId/transaction-token', async (req, res) => {
  try {
    const dealId = parseInt(req.params.dealId, 10);
    const userId = (req as any).userId;

    if (!Number.isFinite(dealId)) {
      return res.status(400).json({ error: 'Invalid deal id' });
    }

    const [deal] = await sql`SELECT id FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    return res.status(410).json({
      error: 'Transaction-token fees are retired',
      code: 'DEAL_VALUE_FEE_RETIRED',
      message:
        'smbX bills only monthly subscriptions, included credits, fixed software deliverables, and outcome-independent software/data pass-through. No deal-value, success, closing-contingent, or referral fee will be created.',
    });
  } catch (err: any) {
    console.error('Retired transaction-token route error:', err.message);
    return res.status(500).json({ error: 'Failed to verify retired transaction-token route' });
  }
});

// ─── Escrow / Holdback Tracking (No Custody) ─────────────────

gtmRouter.get('/deals/:dealId/escrow', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = parseInt(req.params.dealId, 10);

    const [deal] = await sql`SELECT id FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const escrow = await sql`
      SELECT * FROM escrow_transactions WHERE deal_id = ${dealId} ORDER BY created_at DESC
    `;

    const earnouts = await sql`
      SELECT * FROM earnout_schedules WHERE deal_id = ${dealId} ORDER BY measurement_start ASC
    `;

    return res.json({ escrow, earnouts });
  } catch (err: any) {
    console.error('Escrow error:', err.message);
    return res.status(500).json({ error: 'Failed to get escrow data' });
  }
});

gtmRouter.post('/deals/:dealId/escrow', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = parseInt(req.params.dealId, 10);
    const { type, amountCents, description, dueDate } = req.body;

    const [deal] = await sql`SELECT id FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const validTypes = ['earnest_money', 'deposit', 'earnout_milestone', 'holdback'];
    if (!validTypes.includes(type)) return res.status(400).json({ error: 'Invalid escrow type' });

    const [item] = await sql`
      INSERT INTO escrow_transactions (deal_id, type, amount_cents, description, due_date)
      VALUES (${dealId}, ${type}, ${amountCents}, ${description || null}, ${dueDate || null})
      RETURNING *
    `;

    return res.status(201).json(item);
  } catch (err: any) {
    console.error('Create escrow error:', err.message);
    return res.status(500).json({ error: 'Failed to create escrow item' });
  }
});

// ─── Deal Velocity Analytics ─────────────────────────────────

gtmRouter.get('/analytics/velocity', async (req, res) => {
  try {
    const journeyType = req.query.journeyType as string || null;

    let stats;
    if (journeyType) {
      stats = await sql`
        SELECT * FROM deal_velocity_stats WHERE journey_type = ${journeyType} ORDER BY gate
      `;
    } else {
      stats = await sql`
        SELECT * FROM deal_velocity_stats ORDER BY journey_type, gate
      `;
    }

    return res.json(stats);
  } catch (err: any) {
    console.error('Velocity analytics error:', err.message);
    return res.status(500).json({ error: 'Failed to get velocity analytics' });
  }
});

// ─── Ghost Profiles ──────────────────────────────────────────

gtmRouter.get('/ghost-profiles', async (req, res) => {
  try {
    const userId = (req as any).userId;

    const profiles = await sql`
      SELECT * FROM ghost_profiles WHERE created_by = ${userId} ORDER BY created_at DESC
    `;

    return res.json(profiles);
  } catch (err: any) {
    console.error('Ghost profiles error:', err.message);
    return res.status(500).json({ error: 'Failed to get ghost profiles' });
  }
});

gtmRouter.post('/ghost-profiles', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { businessName, industry, naicsCode, location, estimatedRevenue, estimatedEmployees, sourceUrl, notes } = req.body;

    const [profile] = await sql`
      INSERT INTO ghost_profiles (created_by, business_name, industry, naics_code, location, estimated_revenue, estimated_employees, source_url, notes)
      VALUES (${userId}, ${businessName || null}, ${industry || null}, ${naicsCode || null}, ${location || null}, ${estimatedRevenue || null}, ${estimatedEmployees || null}, ${sourceUrl || null}, ${notes || null})
      RETURNING *
    `;

    return res.status(201).json(profile);
  } catch (err: any) {
    console.error('Create ghost profile error:', err.message);
    return res.status(500).json({ error: 'Failed to create ghost profile' });
  }
});

gtmRouter.patch('/ghost-profiles/:profileId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const profileId = parseInt(req.params.profileId, 10);
    const { status, notes, ownerContacted } = req.body;

    const [updated] = await sql`
      UPDATE ghost_profiles SET
        status = COALESCE(${status || null}, status),
        notes = COALESCE(${notes || null}, notes),
        owner_contacted = COALESCE(${ownerContacted ?? null}, owner_contacted),
        owner_contact_date = ${ownerContacted ? 'NOW()' : null}
      WHERE id = ${profileId} AND created_by = ${userId}
      RETURNING *
    `;

    if (!updated) return res.status(404).json({ error: 'Ghost profile not found' });
    return res.json(updated);
  } catch (err: any) {
    console.error('Update ghost profile error:', err.message);
    return res.status(500).json({ error: 'Failed to update ghost profile' });
  }
});

// ─── Journey Bridge Credits ──────────────────────────────────

gtmRouter.get('/journey-bridge-credits', async (req, res) => {
  try {
    const userId = (req as any).userId;

    const credits = await sql`
      SELECT * FROM journey_bridge_credits
      WHERE user_id = ${userId} AND applied_at IS NULL AND expires_at > NOW()
      ORDER BY created_at DESC
    `;

    return res.json(credits);
  } catch (err: any) {
    console.error('Journey bridge credits error:', err.message);
    return res.status(500).json({ error: 'Failed to get journey bridge credits' });
  }
});
