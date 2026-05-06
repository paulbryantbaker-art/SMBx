/**
 * Search Routes — Listing search, company profiles, natural language queries.
 */
import { Router } from 'express';
import { searchListings, searchCompanyProfiles, getSearchStats } from '../services/searchService.js';
import { ingestListing, ingestBatch, type RawListing } from '../services/listingIngestionService.js';
import { sql } from '../db.js';

export const searchRouter = Router();

// ─── Workspace search (UX-56) ────────────────────────────────
//
// In-app ⌘K search: surfaces the authed user's own deals, deliverables, and
// conversations. Distinct from the sourcing-side `/api/search/listings` which
// queries the public listing index. See `feedback_two_searches.md` in memory.

interface WorkspaceHit {
  id: string;
  group: 'deals' | 'docs' | 'analyses';
  label: string;
  sub: string;
}

searchRouter.get('/search/workspace', async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const q = (req.query.q as string || '').trim();
    if (!q) return res.json({ deals: [], docs: [], analyses: [] });

    const like = `%${q.toLowerCase()}%`;

    const [deals, deliverables, convos] = await Promise.all([
      // Deals — search business_name, industry, location
      sql`
        SELECT id, business_name, industry, location, current_gate, league, status
        FROM deals
        WHERE user_id = ${userId}
          AND (
            LOWER(COALESCE(business_name, '')) LIKE ${like}
            OR LOWER(COALESCE(industry, '')) LIKE ${like}
            OR LOWER(COALESCE(location, '')) LIKE ${like}
          )
        ORDER BY updated_at DESC
        LIMIT 8
      `,
      // Deliverables — search type only (content is JSONB, slow to LIKE without an index)
      sql`
        SELECT d.id, d.type, d.status, d.created_at,
               dl.business_name AS deal_name
        FROM deliverables d
        LEFT JOIN deals dl ON dl.id = d.deal_id
        WHERE d.user_id = ${userId}
          AND LOWER(COALESCE(d.type, '')) LIKE ${like}
        ORDER BY d.created_at DESC
        LIMIT 8
      `,
      // Conversations — search title (analyses are stored as conversations of a kind)
      sql`
        SELECT id, title, deal_id, current_gate, updated_at
        FROM conversations
        WHERE user_id = ${userId}
          AND LOWER(COALESCE(title, '')) LIKE ${like}
        ORDER BY updated_at DESC
        LIMIT 8
      `,
    ]);

    const dealsHits: WorkspaceHit[] = deals.map((d: any) => ({
      id: `deal-${d.id}`,
      group: 'deals',
      label: d.business_name || `Deal #${d.id}`,
      sub: [d.industry, d.location, d.current_gate].filter(Boolean).join(' · ') || d.status,
    }));

    const docsHits: WorkspaceHit[] = deliverables.map((dv: any) => ({
      id: `deliverable-${dv.id}`,
      group: 'docs',
      label: humanizeType(dv.type) + (dv.deal_name ? ` · ${dv.deal_name}` : ''),
      sub: dv.status === 'complete' ? 'Ready' : dv.status === 'generating' ? 'Generating…' : dv.status,
    }));

    const analysesHits: WorkspaceHit[] = convos.map((c: any) => ({
      id: `conversation-${c.id}`,
      group: 'analyses',
      label: c.title || `Conversation #${c.id}`,
      sub: c.current_gate ? `Gate ${c.current_gate}` : 'Conversation',
    }));

    return res.json({
      deals: dealsHits,
      docs: docsHits,
      analyses: analysesHits,
    });
  } catch (err: any) {
    console.error('Workspace search error:', err.message);
    return res.status(500).json({ error: 'Workspace search failed' });
  }
});

function humanizeType(t: string | null): string {
  if (!t) return 'Untitled';
  return t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

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
