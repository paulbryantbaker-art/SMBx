/**
 * Provider Routes — Neutral service-provider directory search and user-selected contact logging.
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { findProviders, getProviderDirectoryForDeal, logProviderContact } from '../services/providerMatchingService.js';

export const providerRouter = Router();

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
