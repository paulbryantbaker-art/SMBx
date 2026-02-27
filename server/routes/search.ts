/**
 * Search Routes — Listing search, company profiles, natural language queries.
 */
import { Router } from 'express';
import { searchListings, searchCompanyProfiles, getSearchStats } from '../services/searchService.js';
import { ingestListing, ingestBatch, type RawListing } from '../services/listingIngestionService.js';

export const searchRouter = Router();

// ─── Search listings ─────────────────────────────────────────

searchRouter.get('/search/listings', async (req, res) => {
  try {
    const {
      q, naicsCode, state, city,
      priceMin, priceMax, revenueMin, revenueMax,
      sbaEligible, sortBy, limit, offset,
    } = req.query;

    const result = await searchListings({
      query: q as string,
      naicsCode: naicsCode as string,
      state: state as string,
      city: city as string,
      priceMin: priceMin ? parseInt(priceMin as string, 10) : undefined,
      priceMax: priceMax ? parseInt(priceMax as string, 10) : undefined,
      revenueMin: revenueMin ? parseInt(revenueMin as string, 10) : undefined,
      revenueMax: revenueMax ? parseInt(revenueMax as string, 10) : undefined,
      sbaEligible: sbaEligible === 'true' ? true : sbaEligible === 'false' ? false : undefined,
      sortBy: sortBy as any,
      limit: Math.min(parseInt(limit as string || '20', 10), 50),
      offset: parseInt(offset as string || '0', 10),
    });

    return res.json(result);
  } catch (err: any) {
    console.error('Search listings error:', err.message);
    return res.status(500).json({ error: 'Search failed' });
  }
});

// ─── Search company profiles ─────────────────────────────────

searchRouter.get('/search/companies', async (req, res) => {
  try {
    const { q, naicsCode, state, ownershipType, limit, offset } = req.query;

    const result = await searchCompanyProfiles({
      query: q as string,
      naicsCode: naicsCode as string,
      state: state as string,
      ownershipType: ownershipType as string,
      limit: Math.min(parseInt(limit as string || '20', 10), 50),
      offset: parseInt(offset as string || '0', 10),
    });

    return res.json(result);
  } catch (err: any) {
    console.error('Search companies error:', err.message);
    return res.status(500).json({ error: 'Search failed' });
  }
});

// ─── Search stats ────────────────────────────────────────────

searchRouter.get('/search/stats', async (_req, res) => {
  try {
    const stats = await getSearchStats();
    return res.json(stats);
  } catch (err: any) {
    console.error('Search stats error:', err.message);
    return res.status(500).json({ error: 'Failed to get search stats' });
  }
});

// ─── Ingest listings (admin/import endpoint) ─────────────────

searchRouter.post('/search/ingest', async (req, res) => {
  try {
    const { listing, listings } = req.body;

    if (listings && Array.isArray(listings)) {
      const result = await ingestBatch(listings as RawListing[]);
      return res.json(result);
    }

    if (listing) {
      const result = await ingestListing(listing as RawListing);
      return res.json(result || { error: 'Duplicate listing' });
    }

    return res.status(400).json({ error: 'Provide "listing" or "listings" in body' });
  } catch (err: any) {
    console.error('Ingest error:', err.message);
    return res.status(500).json({ error: 'Ingestion failed' });
  }
});
