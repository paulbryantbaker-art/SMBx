/**
 * Provider Routes — Neutral service-provider directory search and user-selected contact logging.
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { findProviders, getProviderDirectoryForDeal, logProviderContact } from '../services/providerMatchingService.js';

export const providerRouter = Router();

// Provider types a user can self-register as (matches service_providers.type).
const PROVIDER_TYPES = ['attorney', 'cpa', 'appraiser', 're_agent', 'insurance', 'consultant', 'escrow', 'title'];

// Search providers
providerRouter.get('/providers/search', async (req, res) => {
  try {
    const { type, state, dealSize, financingType, limit } = req.query;
    const results = await findProviders({
      type: type as string || undefined,
      state: state as string || undefined,
      dealSize: dealSize ? parseInt(dealSize as string, 10) : undefined,
      financingType: financingType as string || undefined,
      limit: limit ? parseInt(limit as string, 10) : 10,
    });
    return res.json({ providers: results });
  } catch (err: any) {
    console.error('Provider search error:', err.message);
    return res.status(500).json({ error: 'Failed to search providers' });
  }
});

// Contextual directory suggestions for a deal
providerRouter.get('/providers/recommendations/:dealId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = parseInt(req.params.dealId, 10);

    // Verify deal access
    const [deal] = await sql`SELECT id FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const result = await getProviderDirectoryForDeal(dealId);
    return res.json(result);
  } catch (err: any) {
    console.error('Provider directory error:', err.message);
    return res.status(500).json({ error: 'Failed to get provider directory results' });
  }
});

// Legacy route: log a user-selected provider contact event. No compensation or referral fee.
providerRouter.post('/providers/referrals', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { dealId, providerId, context } = req.body;
    if (!dealId || !providerId) return res.status(400).json({ error: 'dealId and providerId required' });

    const contactId = await logProviderContact(dealId, providerId, userId, context || 'User-selected provider contact');
    return res.status(201).json({ contactId });
  } catch (err: any) {
    console.error('Provider contact log error:', err.message);
    return res.status(500).json({ error: 'Failed to log provider contact' });
  }
});

// ─── Self-serve provider profile (free; being a provider has no plan gate) ──

// My provider listing, or null if I haven't created one.
providerRouter.get('/providers/me', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [me] = await sql`SELECT * FROM service_providers WHERE claimed_by_user_id = ${userId}`;
    return res.json({ provider: me || null });
  } catch (err: any) {
    console.error('get my provider error:', err.message);
    return res.status(500).json({ error: 'Failed to load provider profile' });
  }
});

// Create or update my provider listing (upsert by owner). Self-attested.
providerRouter.put('/providers/me', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const b = req.body || {};
    if (!b.type || !PROVIDER_TYPES.includes(b.type)) return res.status(400).json({ error: 'Valid provider type required' });
    if (!b.name || !String(b.name).trim()) return res.status(400).json({ error: 'Name required' });

    const [u] = await sql`SELECT email FROM users WHERE id = ${userId}`;
    const f = {
      type: b.type,
      name: String(b.name).trim(),
      firm_name: b.firmName || null,
      email: b.email || u?.email || null,
      phone: b.phone || null,
      website: b.website || null,
      location_state: b.locationState || null,
      location_city: b.locationCity || null,
      location_zip: b.locationZip || null,
      service_radius_miles: b.serviceRadiusMiles ?? null,
      credentials: Array.isArray(b.credentials) ? b.credentials : [],
      practice_areas: Array.isArray(b.practiceAreas) ? b.practiceAreas : [],
      deal_size_min: b.dealSizeMin ?? null,
      deal_size_max: b.dealSizeMax ?? null,
      industries: Array.isArray(b.industries) ? b.industries : [],
      financing_experience: Array.isArray(b.financingExperience) ? b.financingExperience : [],
      fee_structure: b.feeStructure || null,
      licenses: JSON.stringify(Array.isArray(b.licenses) ? b.licenses : []),
    };

    const [existing] = await sql`SELECT id FROM service_providers WHERE claimed_by_user_id = ${userId}`;
    let row;
    if (existing) {
      [row] = await sql`
        UPDATE service_providers SET
          type = ${f.type}, name = ${f.name}, firm_name = ${f.firm_name}, email = ${f.email},
          phone = ${f.phone}, website = ${f.website}, location_state = ${f.location_state},
          location_city = ${f.location_city}, location_zip = ${f.location_zip},
          service_radius_miles = ${f.service_radius_miles}, credentials = ${f.credentials},
          practice_areas = ${f.practice_areas}, deal_size_min = ${f.deal_size_min},
          deal_size_max = ${f.deal_size_max}, industries = ${f.industries},
          financing_experience = ${f.financing_experience}, fee_structure = ${f.fee_structure},
          licenses = ${f.licenses}
        WHERE id = ${existing.id}
        RETURNING *
      `;
    } else {
      [row] = await sql`
        INSERT INTO service_providers
          (type, name, firm_name, email, phone, website, location_state, location_city, location_zip,
           service_radius_miles, credentials, practice_areas, deal_size_min, deal_size_max, industries,
           financing_experience, fee_structure, licenses, claimed, claimed_by_user_id, data_sources)
        VALUES
          (${f.type}, ${f.name}, ${f.firm_name}, ${f.email}, ${f.phone}, ${f.website}, ${f.location_state},
           ${f.location_city}, ${f.location_zip}, ${f.service_radius_miles}, ${f.credentials}, ${f.practice_areas},
           ${f.deal_size_min}, ${f.deal_size_max}, ${f.industries}, ${f.financing_experience}, ${f.fee_structure},
           ${f.licenses}, true, ${userId}, ${['self_signup']})
        RETURNING *
      `;
    }
    return res.json({ provider: row });
  } catch (err: any) {
    console.error('upsert my provider error:', err.message);
    return res.status(500).json({ error: 'Failed to save provider profile' });
  }
});

// Claim an existing (unclaimed) directory listing as mine. Guarded by email match
// when the listing carries an email, so you can't claim someone else's identity.
providerRouter.post('/providers/me/claim', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const providerId = parseInt(req.body?.providerId, 10);
    if (!providerId) return res.status(400).json({ error: 'providerId required' });

    const [mine] = await sql`SELECT id FROM service_providers WHERE claimed_by_user_id = ${userId}`;
    if (mine) return res.status(400).json({ error: 'You already have a provider listing' });

    const [target] = await sql`SELECT id, email, claimed_by_user_id FROM service_providers WHERE id = ${providerId}`;
    if (!target) return res.status(404).json({ error: 'Listing not found' });
    if (target.claimed_by_user_id) return res.status(409).json({ error: 'Listing already claimed' });

    const [u] = await sql`SELECT email FROM users WHERE id = ${userId}`;
    if (target.email && u?.email && target.email.toLowerCase() !== u.email.toLowerCase()) {
      return res.status(403).json({ error: 'This listing is registered to a different email. Contact support to verify ownership.' });
    }

    const [row] = await sql`
      UPDATE service_providers SET claimed = true, claimed_by_user_id = ${userId}
      WHERE id = ${providerId} AND claimed_by_user_id IS NULL
      RETURNING *
    `;
    if (!row) return res.status(409).json({ error: 'Listing already claimed' });
    return res.json({ provider: row });
  } catch (err: any) {
    console.error('claim provider error:', err.message);
    return res.status(500).json({ error: 'Failed to claim listing' });
  }
});

// Provider detail
providerRouter.get('/providers/:id', async (req, res) => {
  try {
    const providerId = parseInt(req.params.id, 10);
    const [provider] = await sql`SELECT * FROM service_providers WHERE id = ${providerId}`;
    if (!provider) return res.status(404).json({ error: 'Provider not found' });
    return res.json(provider);
  } catch (err: any) {
    console.error('Provider detail error:', err.message);
    return res.status(500).json({ error: 'Failed to get provider' });
  }
});
