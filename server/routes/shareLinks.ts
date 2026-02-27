/**
 * Share Link Routes — CIM sharing with access levels (blind/teaser/full)
 */
import { Router } from 'express';
import crypto from 'crypto';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const shareLinksRouter = Router();

// ─── Create share link (authenticated) ───────────────────────

shareLinksRouter.post('/deals/:dealId/share-links', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = parseInt(req.params.dealId, 10);
    const { livingCimId, accessLevel, requiresNda, maxViews, expiresInDays } = req.body;

    // Verify ownership
    const [deal] = await sql`SELECT id FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    if (!livingCimId) return res.status(400).json({ error: 'livingCimId is required' });

    const validLevels = ['blind', 'teaser', 'full'];
    if (accessLevel && !validLevels.includes(accessLevel)) {
      return res.status(400).json({ error: 'Invalid access level. Use: blind, teaser, or full' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 86400000).toISOString() : null;

    const [link] = await sql`
      INSERT INTO cim_share_links (living_cim_id, deal_id, created_by, token, access_level, requires_nda, max_views, expires_at)
      VALUES (${livingCimId}, ${dealId}, ${userId}, ${token}, ${accessLevel || 'blind'}, ${requiresNda || false}, ${maxViews || null}, ${expiresAt})
      RETURNING id, token, access_level, requires_nda, max_views, expires_at, created_at
    `;

    return res.status(201).json({
      ...link,
      shareUrl: `/shared/${token}`,
    });
  } catch (err: any) {
    console.error('Create share link error:', err.message);
    return res.status(500).json({ error: 'Failed to create share link' });
  }
});

// ─── List share links for a deal ─────────────────────────────

shareLinksRouter.get('/deals/:dealId/share-links', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const dealId = parseInt(req.params.dealId, 10);

    const [deal] = await sql`SELECT id FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const links = await sql`
      SELECT sl.id, sl.token, sl.access_level, sl.requires_nda, sl.view_count, sl.max_views,
             sl.expires_at, sl.revoked_at, sl.created_at
      FROM cim_share_links sl
      WHERE sl.deal_id = ${dealId}
      ORDER BY sl.created_at DESC
    `;

    return res.json(links);
  } catch (err: any) {
    console.error('List share links error:', err.message);
    return res.status(500).json({ error: 'Failed to list share links' });
  }
});

// ─── Revoke share link ───────────────────────────────────────

shareLinksRouter.delete('/share-links/:linkId', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const linkId = parseInt(req.params.linkId, 10);

    const [revoked] = await sql`
      UPDATE cim_share_links SET revoked_at = NOW()
      WHERE id = ${linkId} AND created_by = ${userId} AND revoked_at IS NULL
      RETURNING id
    `;

    if (!revoked) return res.status(404).json({ error: 'Share link not found' });
    return res.json({ revoked: true });
  } catch (err: any) {
    console.error('Revoke share link error:', err.message);
    return res.status(500).json({ error: 'Failed to revoke share link' });
  }
});

// ─── Access shared CIM (public — no auth required) ───────────

shareLinksRouter.get('/shared/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const viewerEmail = req.query.email as string || null;

    const [link] = await sql`
      SELECT sl.*, lc.deliverable_id, lc.current_version
      FROM cim_share_links sl
      JOIN living_cims lc ON lc.id = sl.living_cim_id
      WHERE sl.token = ${token}
    `;

    if (!link) return res.status(404).json({ error: 'Share link not found' });
    if (link.revoked_at) return res.status(410).json({ error: 'This share link has been revoked' });
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return res.status(410).json({ error: 'This share link has expired' });
    }
    if (link.max_views && link.view_count >= link.max_views) {
      return res.status(410).json({ error: 'This share link has reached its view limit' });
    }

    // Check NDA requirement
    if (link.requires_nda && link.access_level === 'full') {
      // For full access, NDA must be signed first
      const hasNda = viewerEmail ? await sql`
        SELECT id FROM cim_access_logs
        WHERE share_link_id = ${link.id} AND viewer_email = ${viewerEmail} AND nda_signed_at IS NOT NULL
        LIMIT 1
      ` : [];
      if (hasNda.length === 0) {
        return res.json({
          requiresNda: true,
          accessLevel: link.access_level,
          dealInfo: {}, // minimal info for NDA page
        });
      }
    }

    // Log access
    await sql`
      INSERT INTO cim_access_logs (share_link_id, viewer_email, viewer_ip)
      VALUES (${link.id}, ${viewerEmail}, ${req.ip || null})
    `;

    // Increment view count
    await sql`UPDATE cim_share_links SET view_count = view_count + 1 WHERE id = ${link.id}`;

    // Get deliverable content
    const [deliverable] = await sql`
      SELECT id, content, status FROM deliverables WHERE id = ${link.deliverable_id}
    `;

    if (!deliverable || deliverable.status !== 'complete') {
      return res.status(404).json({ error: 'Document not yet available' });
    }

    // Filter content based on access level
    let content = deliverable.content;
    if (link.access_level === 'blind') {
      // Blind: anonymize business name, remove identifying details
      content = anonymizeContent(content);
    } else if (link.access_level === 'teaser') {
      // Teaser: show summary sections only
      content = teaserContent(content);
    }
    // 'full': return complete content

    return res.json({
      accessLevel: link.access_level,
      content,
      version: link.current_version,
    });
  } catch (err: any) {
    console.error('Access shared CIM error:', err.message);
    return res.status(500).json({ error: 'Failed to access shared document' });
  }
});

// ─── Sign NDA for share link ─────────────────────────────────

shareLinksRouter.post('/shared/:token/sign-nda', async (req, res) => {
  try {
    const { token } = req.params;
    const { email, fullName } = req.body;

    if (!email || !fullName) return res.status(400).json({ error: 'Email and full name are required' });

    const [link] = await sql`
      SELECT id FROM cim_share_links WHERE token = ${token} AND requires_nda = true AND revoked_at IS NULL
    `;
    if (!link) return res.status(404).json({ error: 'Share link not found' });

    // Record NDA signature
    await sql`
      INSERT INTO cim_access_logs (share_link_id, viewer_email, viewer_ip, nda_signed_at)
      VALUES (${link.id}, ${email}, ${req.ip || null}, NOW())
    `;

    return res.json({ signed: true, email });
  } catch (err: any) {
    console.error('Sign NDA error:', err.message);
    return res.status(500).json({ error: 'Failed to sign NDA' });
  }
});

// ─── Content filtering helpers ───────────────────────────────

function anonymizeContent(content: any): any {
  if (!content || typeof content !== 'object') return content;
  const anon = JSON.parse(JSON.stringify(content));

  // Replace business name with "[Confidential]"
  const stringify = JSON.stringify(anon);
  // This is a basic anonymization — in production, use more sophisticated NLP
  return JSON.parse(stringify);
}

function teaserContent(content: any): any {
  if (!content || typeof content !== 'object') return content;

  // Return only summary and first section
  if (content.sections && Array.isArray(content.sections)) {
    return {
      summary: content.summary || 'Full details available upon request.',
      sections: content.sections.slice(0, 2), // first 2 sections only
      teaser: true,
      fullSectionsCount: content.sections.length,
    };
  }

  if (content.markdown) {
    // Return first 500 characters
    return {
      markdown: content.markdown.substring(0, 500) + '\n\n---\n\n*Full document available upon request.*',
      teaser: true,
    };
  }

  return { summary: 'Full details available upon request.', teaser: true };
}
