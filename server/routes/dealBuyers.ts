/**
 * Deal Buyers — the sell-side buyer funnel (advisor cockpit).
 *
 * CRUD over `deal_buyers`: the acquirer universe an advisor markets a SELL
 * mandate to, with a per-buyer funnel (identified → contacted → nda → cim → ioi
 * → loi → passed). RBAC via hasDealAccess. THE LINE: this only TRACKS status and
 * (elsewhere) lets the user draft outreach — it never contacts a buyer.
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { hasDealAccess } from '../services/dealAccessService.js';

export const dealBuyersRouter = Router();
dealBuyersRouter.use(requireAuth);

const STAGES = ['identified', 'contacted', 'nda', 'cim', 'ioi', 'loi', 'passed'];
const TYPES = ['strategic', 'financial', 'individual'];

function dealIdOf(req: any): number | null {
  const id = Number(req.params.dealId);
  return Number.isFinite(id) && id > 0 ? id : null;
}

// List the buyers for a deal.
dealBuyersRouter.get('/deals/:dealId/buyers', async (req, res) => {
  const userId = (req as any).userId;
  const dealId = dealIdOf(req);
  if (!dealId) return res.status(400).json({ error: 'Invalid deal id' });
  try {
    const access = await hasDealAccess(dealId, userId);
    if (!access) return res.status(404).json({ error: 'Deal not found' });
    const buyers = await sql`SELECT * FROM deal_buyers WHERE deal_id = ${dealId} ORDER BY created_at`;
    return res.json({ buyers });
  } catch (err: any) {
    console.error('[deal-buyers] list failed:', err.message);
    return res.status(500).json({ error: 'Failed to load buyers' });
  }
});

// Add a buyer to the list.
dealBuyersRouter.post('/deals/:dealId/buyers', async (req, res) => {
  const userId = (req as any).userId;
  const dealId = dealIdOf(req);
  if (!dealId) return res.status(400).json({ error: 'Invalid deal id' });
  try {
    const access = await hasDealAccess(dealId, userId);
    if (!access) return res.status(404).json({ error: 'Deal not found' });
    if (access.access_level === 'read') return res.status(403).json({ error: 'Read-only access cannot modify buyers' });
    const name = String(req.body?.name || '').trim();
    if (!name) return res.status(400).json({ error: 'Buyer name is required' });
    const buyerType = TYPES.includes(req.body?.buyer_type) ? req.body.buyer_type : 'strategic';
    const notes = typeof req.body?.notes === 'string' ? req.body.notes : null;
    const [buyer] = await sql`
      INSERT INTO deal_buyers (deal_id, user_id, name, buyer_type, notes)
      VALUES (${dealId}, ${userId}, ${name}, ${buyerType}, ${notes})
      RETURNING *`;
    return res.status(201).json({ buyer });
  } catch (err: any) {
    console.error('[deal-buyers] create failed:', err.message);
    return res.status(400).json({ error: err.message || 'Failed to add buyer' });
  }
});

// Update a buyer (stage / type / name / notes / NDA / do-not-contact). Stage
// transitions auto-stamp contacted_at and nda_signed_at the first time they're
// reached, so the funnel timestamps stay honest without extra clicks.
dealBuyersRouter.patch('/deals/:dealId/buyers/:buyerId', async (req, res) => {
  const userId = (req as any).userId;
  const dealId = dealIdOf(req);
  const buyerId = Number(req.params.buyerId);
  if (!dealId || !Number.isFinite(buyerId)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const access = await hasDealAccess(dealId, userId);
    if (!access) return res.status(404).json({ error: 'Deal not found' });
    if (access.access_level === 'read') return res.status(403).json({ error: 'Read-only access cannot modify buyers' });
    const [cur] = await sql`SELECT * FROM deal_buyers WHERE id = ${buyerId} AND deal_id = ${dealId}`;
    if (!cur) return res.status(404).json({ error: 'Buyer not found' });

    const b = req.body || {};
    const stage = STAGES.includes(b.stage) ? b.stage : cur.stage;
    const buyerType = TYPES.includes(b.buyer_type) ? b.buyer_type : cur.buyer_type;
    const name = typeof b.name === 'string' && b.name.trim() ? b.name.trim() : cur.name;
    const notes = b.notes !== undefined ? (b.notes === null ? null : String(b.notes)) : cur.notes;
    const doNotContact = typeof b.do_not_contact === 'boolean' ? b.do_not_contact : cur.do_not_contact;

    const sIdx = STAGES.indexOf(stage);
    const past = (s: string) => sIdx >= STAGES.indexOf(s) && stage !== 'passed';
    let contactedAt: Date | string | null = cur.contacted_at;
    if (!contactedAt && past('contacted')) contactedAt = new Date();
    let ndaSignedAt: Date | string | null = cur.nda_signed_at;
    if (b.nda_signed_at !== undefined) ndaSignedAt = b.nda_signed_at; // explicit toggle wins
    else if (!ndaSignedAt && past('nda')) ndaSignedAt = new Date();

    const [buyer] = await sql`
      UPDATE deal_buyers SET
        stage = ${stage},
        buyer_type = ${buyerType},
        name = ${name},
        notes = ${notes},
        do_not_contact = ${doNotContact},
        contacted_at = ${contactedAt},
        nda_signed_at = ${ndaSignedAt},
        updated_at = NOW()
      WHERE id = ${buyerId} AND deal_id = ${dealId}
      RETURNING *`;
    return res.json({ buyer });
  } catch (err: any) {
    console.error('[deal-buyers] update failed:', err.message);
    return res.status(400).json({ error: err.message || 'Failed to update buyer' });
  }
});

// Remove a buyer from the list.
dealBuyersRouter.delete('/deals/:dealId/buyers/:buyerId', async (req, res) => {
  const userId = (req as any).userId;
  const dealId = dealIdOf(req);
  const buyerId = Number(req.params.buyerId);
  if (!dealId || !Number.isFinite(buyerId)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const access = await hasDealAccess(dealId, userId);
    if (!access) return res.status(404).json({ error: 'Deal not found' });
    if (access.access_level === 'read') return res.status(403).json({ error: 'Read-only access cannot modify buyers' });
    await sql`DELETE FROM deal_buyers WHERE id = ${buyerId} AND deal_id = ${dealId}`;
    return res.json({ ok: true });
  } catch (err: any) {
    console.error('[deal-buyers] delete failed:', err.message);
    return res.status(400).json({ error: err.message || 'Failed to remove buyer' });
  }
});
