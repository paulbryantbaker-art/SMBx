/**
 * Deal Offers — structured inbound IOI/LOI offers (advisor sell-side cockpit).
 *
 * CRUD over `deal_offers` (migration 093): the structured TERMS a buyer submits
 * for a sell-side deal — a child of deal_buyers (one buyer, many offers over
 * time). RBAC via hasDealAccess, mirroring routes/dealBuyers.ts.
 *
 * Money discipline: every *_cents / integer field is coerced to a NON-NEGATIVE
 * INTEGER (never a float) or rejected with 400. buyer_id, when given, must
 * belong to the same deal. THE LINE: this only CAPTURES and COMPARES terms — it
 * never recommends an offer, transmits acceptance, or contacts the buyer.
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { hasDealAccess } from '../services/dealAccessService.js';

export const dealOffersRouter = Router();
dealOffersRouter.use(requireAuth);

const OFFER_TYPES = ['ioi', 'loi'];
const STATUSES = ['received', 'under_review', 'countered', 'accepted', 'declined', 'expired', 'withdrawn'];

// Non-negative integer columns (money is integer cents; rates/terms/days are
// plain ints). Floats are rounded, negatives and non-numbers are rejected.
const INT_FIELDS = [
  'total_price_cents', 'cash_at_close_cents', 'seller_note_cents', 'earnout_cents',
  'rollover_cents', 'escrow_holdback_cents',
  'seller_note_rate_bps', 'seller_note_term_months', 'earnout_term_months', 'exclusivity_days',
];
const TEXT_FIELDS = ['buyer_name', 'earnout_basis', 'contingencies', 'notes'];
const TS_FIELDS = ['expires_at', 'submitted_at'];

class BadField extends Error {}

function dealIdOf(req: any): number | null {
  const id = Number(req.params.dealId);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function nonNegInt(v: any, field: string): number | null {
  if (v === undefined || v === null) return null;
  // Reject non-primitives and whitespace-only strings rather than letting
  // Number() coerce them (Number([]) === 0, Number('  ') === 0, Number(true) === 1)
  // — a malformed body must not silently write a fabricated 0 where null was meant.
  if (typeof v !== 'number' && typeof v !== 'string') throw new BadField(`${field} must be a number`);
  if (typeof v === 'string' && v.trim() === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n)) throw new BadField(`${field} must be a number`);
  const r = Math.round(n);
  if (r < 0) throw new BadField(`${field} must be ≥ 0`);
  return r;
}

function text(v: any): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

/** Build a column→value patch from the request body, INCLUDING ONLY keys the
 *  caller actually sent. Throws BadField (→ 400) on an invalid value. Does NOT
 *  touch deal_id / user_id / buyer_id (handled by the caller). */
function normalizeOffer(body: any): Record<string, any> {
  const patch: Record<string, any> = {};
  if (body == null || typeof body !== 'object') return patch;

  if ('offer_type' in body) {
    const t = String(body.offer_type || '');
    if (!OFFER_TYPES.includes(t)) throw new BadField('offer_type must be ioi or loi');
    patch.offer_type = t;
  }
  if ('status' in body) {
    const s = String(body.status || '');
    if (!STATUSES.includes(s)) throw new BadField('invalid status');
    patch.status = s;
  }
  for (const f of INT_FIELDS) if (f in body) patch[f] = nonNegInt(body[f], f);
  for (const f of TEXT_FIELDS) if (f in body) patch[f] = text(body[f]);
  for (const f of TS_FIELDS) {
    if (f in body) {
      const v = body[f];
      if (v === null || v === '') { patch[f] = null; continue; }
      const d = new Date(v);
      if (isNaN(d.getTime())) throw new BadField(`${f} must be a valid date`);
      patch[f] = d;
    }
  }
  return patch;
}

/** Validate buyer_id (when provided non-null) belongs to this deal. Returns the
 *  normalized value (number | null) or throws BadField. */
async function resolveBuyerId(body: any, dealId: number): Promise<number | null | undefined> {
  if (!body || !('buyer_id' in body)) return undefined; // not provided → leave unchanged
  const raw = body.buyer_id;
  if (raw === null || raw === '') return null;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new BadField('invalid buyer_id');
  const [row] = await sql`SELECT 1 FROM deal_buyers WHERE id = ${id} AND deal_id = ${dealId}`;
  if (!row) throw new BadField('buyer_id does not belong to this deal');
  return id;
}

// List the offers for a deal (newest first).
dealOffersRouter.get('/deals/:dealId/offers', async (req, res) => {
  const userId = (req as any).userId;
  const dealId = dealIdOf(req);
  if (!dealId) return res.status(400).json({ error: 'Invalid deal id' });
  try {
    const access = await hasDealAccess(dealId, userId);
    if (!access) return res.status(404).json({ error: 'Deal not found' });
    const offers = await sql`SELECT * FROM deal_offers WHERE deal_id = ${dealId} ORDER BY created_at DESC`;
    return res.json({ offers });
  } catch (err: any) {
    console.error('[deal-offers] list failed:', err.message);
    return res.status(500).json({ error: 'Failed to load offers' });
  }
});

// Log a new offer.
dealOffersRouter.post('/deals/:dealId/offers', async (req, res) => {
  const userId = (req as any).userId;
  const dealId = dealIdOf(req);
  if (!dealId) return res.status(400).json({ error: 'Invalid deal id' });
  try {
    const access = await hasDealAccess(dealId, userId);
    if (!access) return res.status(404).json({ error: 'Deal not found' });
    if (access.access_level === 'read') return res.status(403).json({ error: 'Read-only access cannot modify offers' });

    let patch: Record<string, any>;
    let buyerId: number | null | undefined;
    try {
      patch = normalizeOffer(req.body);
      buyerId = await resolveBuyerId(req.body, dealId);
    } catch (e) {
      if (e instanceof BadField) return res.status(400).json({ error: e.message });
      throw e;
    }

    const row: Record<string, any> = {
      deal_id: dealId,
      user_id: userId,
      buyer_id: buyerId ?? null,
      offer_type: patch.offer_type ?? 'ioi',
      status: patch.status ?? 'received',
      ...patch,
    };
    // A linked buyer owns the display name — keep the denormalized fallback from drifting.
    if (row.buyer_id != null) row.buyer_name = null;
    const [offer] = await sql`INSERT INTO deal_offers ${sql(row)} RETURNING *`;
    return res.status(201).json({ offer });
  } catch (err: any) {
    console.error('[deal-offers] create failed:', err.message);
    return res.status(400).json({ error: err.message || 'Failed to add offer' });
  }
});

// Update an offer's terms / type / status.
dealOffersRouter.patch('/deals/:dealId/offers/:offerId', async (req, res) => {
  const userId = (req as any).userId;
  const dealId = dealIdOf(req);
  const offerId = Number(req.params.offerId);
  if (!dealId || !Number.isInteger(offerId) || offerId <= 0) return res.status(400).json({ error: 'Invalid id' });
  try {
    const access = await hasDealAccess(dealId, userId);
    if (!access) return res.status(404).json({ error: 'Deal not found' });
    if (access.access_level === 'read') return res.status(403).json({ error: 'Read-only access cannot modify offers' });
    const [cur] = await sql`SELECT id FROM deal_offers WHERE id = ${offerId} AND deal_id = ${dealId}`;
    if (!cur) return res.status(404).json({ error: 'Offer not found' });

    let patch: Record<string, any>;
    let buyerId: number | null | undefined;
    try {
      patch = normalizeOffer(req.body);
      buyerId = await resolveBuyerId(req.body, dealId);
    } catch (e) {
      if (e instanceof BadField) return res.status(400).json({ error: e.message });
      throw e;
    }
    if (buyerId !== undefined) patch.buyer_id = buyerId;
    // A linked buyer owns the display name — keep the denormalized fallback from drifting.
    if (buyerId != null) patch.buyer_name = null;

    if (Object.keys(patch).length === 0) {
      const [offer] = await sql`SELECT * FROM deal_offers WHERE id = ${offerId} AND deal_id = ${dealId}`;
      return res.json({ offer });
    }
    const [offer] = await sql`
      UPDATE deal_offers SET ${sql(patch)}, updated_at = NOW()
      WHERE id = ${offerId} AND deal_id = ${dealId}
      RETURNING *`;
    return res.json({ offer });
  } catch (err: any) {
    console.error('[deal-offers] update failed:', err.message);
    return res.status(400).json({ error: err.message || 'Failed to update offer' });
  }
});

// Remove an offer.
dealOffersRouter.delete('/deals/:dealId/offers/:offerId', async (req, res) => {
  const userId = (req as any).userId;
  const dealId = dealIdOf(req);
  const offerId = Number(req.params.offerId);
  if (!dealId || !Number.isInteger(offerId) || offerId <= 0) return res.status(400).json({ error: 'Invalid id' });
  try {
    const access = await hasDealAccess(dealId, userId);
    if (!access) return res.status(404).json({ error: 'Deal not found' });
    if (access.access_level === 'read') return res.status(403).json({ error: 'Read-only access cannot modify offers' });
    await sql`DELETE FROM deal_offers WHERE id = ${offerId} AND deal_id = ${dealId}`;
    return res.json({ ok: true });
  } catch (err: any) {
    console.error('[deal-offers] delete failed:', err.message);
    return res.status(400).json({ error: err.message || 'Failed to remove offer' });
  }
});
