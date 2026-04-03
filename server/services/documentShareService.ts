/**
 * Document Share Service — generalized sharing for any document.
 *
 * Creates share links with configurable access levels, auth requirements,
 * expiration, watermarks, and download permissions. Sends email notifications.
 * Tracks views. Works for deliverables and uploaded data room docs.
 */
import crypto from 'crypto';
import { sql } from '../db.js';
import { sendEmail } from './emailService.js';

const BASE_URL = process.env.APP_URL || process.env.BASE_URL || 'https://app.smbx.ai';

// ─── Create Share ───────────────────────────────────────────────────

interface ShareOptions {
  dealId: number;
  deliverableId?: number;
  documentId?: number;
  sharedBy: number;
  shareType: 'internal' | 'cross_fence' | 'external';
  accessLevel?: 'view' | 'comment' | 'edit';
  authRequired?: 'none' | 'email' | 'account' | 'nda';
  downloadEnabled?: boolean;
  watermark?: string;
  expiresInDays?: number;
  maxViews?: number;
  recipientEmail?: string;
  recipientName?: string;
  recipientSide?: 'my_team' | 'other_side';
  /** Optional message from Yulia or the sender */
  message?: string;
}

export async function createDocumentShare(opts: ShareOptions): Promise<{
  shareId: number;
  token: string;
  shareUrl: string;
}> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = opts.expiresInDays
    ? new Date(Date.now() + opts.expiresInDays * 86400000).toISOString()
    : null;

  const [share] = await sql`
    INSERT INTO document_shares (
      deal_id, deliverable_id, document_id, shared_by,
      share_type, token, access_level, auth_required,
      download_enabled, watermark, expires_at, max_views,
      recipient_email, recipient_name, recipient_side
    ) VALUES (
      ${opts.dealId},
      ${opts.deliverableId || null},
      ${opts.documentId || null},
      ${opts.sharedBy},
      ${opts.shareType},
      ${token},
      ${opts.accessLevel || 'view'},
      ${opts.authRequired || 'none'},
      ${opts.downloadEnabled ?? false},
      ${opts.watermark || null},
      ${expiresAt},
      ${opts.maxViews || null},
      ${opts.recipientEmail || null},
      ${opts.recipientName || null},
      ${opts.recipientSide || null}
    ) RETURNING id
  `;

  const shareUrl = `${BASE_URL}/shared/doc/${token}`;

  // Send email if recipient specified
  if (opts.recipientEmail) {
    const [sender] = await sql`SELECT display_name, email FROM users WHERE id = ${opts.sharedBy}`;
    const senderName = sender?.display_name || sender?.email?.split('@')[0] || 'Someone';

    // Get document title
    let docTitle = 'a document';
    if (opts.deliverableId) {
      const [d] = await sql`
        SELECT m.name FROM deliverables del
        LEFT JOIN menu_items m ON m.id = del.menu_item_id
        WHERE del.id = ${opts.deliverableId}
      `;
      docTitle = d?.name || 'a document';
    } else if (opts.documentId) {
      const [d] = await sql`SELECT name FROM data_room_documents WHERE id = ${opts.documentId}`;
      docTitle = d?.name || 'a document';
    }

    // Get deal name
    const [deal] = await sql`SELECT business_name FROM deals WHERE id = ${opts.dealId}`;
    const dealName = deal?.business_name || 'a deal';

    const needsNda = opts.authRequired === 'nda';
    const customMessage = opts.message ? `<p style="margin:16px 0;padding:12px 16px;background:#FFF8F5;border-left:3px solid #D44A78;border-radius:0 6px 6px 0;font-size:14px;color:#3D3B37;">${opts.message}</p>` : '';

    await sendEmail({
      to: opts.recipientEmail,
      subject: `${senderName} shared ${docTitle} with you on smbx.ai`,
      html: `
        <div style="font-family:'Inter',system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
          <div style="margin-bottom:24px;">
            <span style="font-family:'Sora',system-ui,sans-serif;font-weight:700;font-size:20px;color:#0D0D0D;">smbx.ai</span>
          </div>
          <h2 style="font-family:'Sora',system-ui,sans-serif;font-size:18px;color:#0D0D0D;margin:0 0 8px;">
            ${senderName} shared a document with you
          </h2>
          <p style="font-size:14px;color:#3D3B37;line-height:1.6;margin:0 0 16px;">
            <strong>${docTitle}</strong> for ${dealName} is ready for your review.
          </p>
          ${customMessage}
          ${needsNda ? '<p style="font-size:13px;color:#6E6A63;margin:0 0 16px;">You\'ll need to sign a non-disclosure agreement before viewing the full document.</p>' : ''}
          <a href="${shareUrl}" style="display:inline-block;padding:12px 28px;background:#D44A78;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
            View Document
          </a>
          <p style="font-size:12px;color:#A9A49C;margin:24px 0 0;">
            ${opts.expiresInDays ? `This link expires in ${opts.expiresInDays} days.` : ''}
            ${opts.downloadEnabled ? '' : 'Download is disabled for this document.'}
          </p>
          <hr style="border:none;border-top:1px solid #EBE7DF;margin:24px 0;" />
          <p style="font-size:11px;color:#A9A49C;">
            Sent via smbx.ai — AI-powered deal intelligence
          </p>
        </div>
      `,
    });
  }

  return { shareId: share.id, token, shareUrl };
}

// ─── Track View ─────────────────────────────────────────────────────

export async function trackShareView(token: string, viewerEmail?: string, viewerIp?: string): Promise<{
  share: any;
  content: any;
  allowed: boolean;
  reason?: string;
}> {
  const [share] = await sql`
    SELECT ds.*, d.business_name as deal_name
    FROM document_shares ds
    LEFT JOIN deals d ON d.id = ds.deal_id
    WHERE ds.token = ${token}
  `;

  if (!share) return { share: null, content: null, allowed: false, reason: 'Share not found' };

  // Check expiration
  if (share.expires_at && new Date(share.expires_at) < new Date()) {
    return { share, content: null, allowed: false, reason: 'This link has expired' };
  }

  // Check max views
  if (share.max_views && share.view_count >= share.max_views) {
    return { share, content: null, allowed: false, reason: 'Maximum views reached' };
  }

  // Increment view count
  await sql`UPDATE document_shares SET view_count = view_count + 1 WHERE id = ${share.id}`;

  // Get content
  let content: any = null;
  if (share.deliverable_id) {
    const [del] = await sql`
      SELECT d.content, d.tiptap_content, d.doc_class, m.name, m.slug
      FROM deliverables d
      LEFT JOIN menu_items m ON m.id = d.menu_item_id
      WHERE d.id = ${share.deliverable_id}
    `;
    content = del;
  } else if (share.document_id) {
    const [doc] = await sql`
      SELECT name, file_type, file_url, file_size, doc_class
      FROM data_room_documents WHERE id = ${share.document_id}
    `;
    content = doc;
  }

  // Log the view
  await sql`
    INSERT INTO deal_activity_log (deal_id, action, target_type, target_id, metadata)
    VALUES (${share.deal_id}, 'share_viewed', 'document_share', ${share.id},
      ${JSON.stringify({ viewer_email: viewerEmail, viewer_ip: viewerIp, token: token.substring(0, 8) })}::jsonb)
  `.catch(() => {});

  // Notify the sharer
  if (viewerEmail || share.recipient_email) {
    const viewerName = viewerEmail || share.recipient_email || 'Someone';
    const { createNotification } = await import('../routes/notifications.js');
    await createNotification({
      userId: share.shared_by,
      dealId: share.deal_id,
      type: 'share_viewed',
      title: `${viewerName} viewed your shared document`,
      body: content?.name ? `Viewed: ${content.name}` : undefined,
    }).catch(() => {});
  }

  return { share, content, allowed: true };
}

// ─── Get Share Stats ────────────────────────────────────────────────

export async function getShareStats(dealId: number): Promise<any> {
  const shares = await sql`
    SELECT ds.*,
           COALESCE(m.name, d2.name) as doc_name,
           u.display_name as shared_by_name
    FROM document_shares ds
    LEFT JOIN deliverables del ON del.id = ds.deliverable_id
    LEFT JOIN menu_items m ON m.id = del.menu_item_id
    LEFT JOIN data_room_documents d2 ON d2.id = ds.document_id
    LEFT JOIN users u ON u.id = ds.shared_by
    WHERE ds.deal_id = ${dealId}
    ORDER BY ds.created_at DESC
  `;

  const [stats] = await sql`
    SELECT
      COUNT(*)::int as total_shares,
      SUM(view_count)::int as total_views,
      COUNT(*) FILTER (WHERE view_count > 0)::int as shares_viewed,
      COUNT(*) FILTER (WHERE share_type = 'external')::int as external_shares,
      COUNT(*) FILTER (WHERE share_type = 'cross_fence')::int as cross_fence_shares
    FROM document_shares WHERE deal_id = ${dealId}
  `;

  return { shares, stats };
}
