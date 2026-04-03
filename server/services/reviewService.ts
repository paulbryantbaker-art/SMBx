/**
 * Review Service — structured document review workflow.
 *
 * Flow: Owner/Yulia requests review → reviewer notified → reviewer responds
 * (approved / changes_requested / flagged) → owner notified with summary.
 *
 * Yulia can add focus_areas to guide the reviewer on what to look at.
 */
import { sql } from '../db.js';
import { createNotification } from '../routes/notifications.js';

interface ReviewRequestInput {
  dealId: number;
  deliverableId?: number;
  documentId?: number;
  requestedBy: number;
  reviewerId: number;
  reviewerRole?: string;
  focusAreas?: string;
}

export async function createReviewRequest(input: ReviewRequestInput): Promise<any> {
  const {
    dealId, deliverableId, documentId,
    requestedBy, reviewerId, reviewerRole, focusAreas,
  } = input;

  // Get names for notifications
  const [requester] = await sql`SELECT display_name, email FROM users WHERE id = ${requestedBy}`;
  const [reviewer] = await sql`SELECT display_name, email FROM users WHERE id = ${reviewerId}`;
  const requesterName = requester?.display_name || requester?.email?.split('@')[0] || 'Someone';

  // Get document title
  let docTitle = 'Document';
  if (deliverableId) {
    const [d] = await sql`
      SELECT d.id, m.name FROM deliverables d
      LEFT JOIN menu_items m ON m.id = d.menu_item_id
      WHERE d.id = ${deliverableId}
    `;
    docTitle = d?.name || 'Deliverable';
  } else if (documentId) {
    const [d] = await sql`SELECT name FROM data_room_documents WHERE id = ${documentId}`;
    docTitle = d?.name || 'Document';
  }

  // Create the review request
  const [review] = await sql`
    INSERT INTO review_requests (deal_id, deliverable_id, document_id, requested_by, reviewer_id, reviewer_role, focus_areas)
    VALUES (${dealId}, ${deliverableId || null}, ${documentId || null}, ${requestedBy}, ${reviewerId}, ${reviewerRole || null}, ${focusAreas || null})
    RETURNING *
  `;

  // Notify the reviewer — urgent tier
  await createNotification({
    userId: reviewerId,
    dealId,
    type: 'review_request',
    title: `Review requested: ${docTitle}`,
    body: focusAreas
      ? `${requesterName} needs your review. Focus areas: ${focusAreas.substring(0, 150)}`
      : `${requesterName} needs your review on ${docTitle}.`,
    actionUrl: `/chat`,
  });

  // Send email notification
  try {
    const { sendReviewRequestEmail } = await import('./emailService.js');
    await sendReviewRequestEmail(
      reviewer.email,
      requesterName,
      docTitle,
      focusAreas || undefined,
    );
  } catch { /* email is best-effort */ }

  return review;
}

export async function respondToReview(
  reviewId: number,
  reviewerId: number,
  status: 'approved' | 'changes_requested' | 'flagged',
  notes?: string,
): Promise<any> {
  // Verify this review belongs to this reviewer
  const [review] = await sql`
    SELECT rr.*, d.id as del_id, m.name as doc_name
    FROM review_requests rr
    LEFT JOIN deliverables d ON d.id = rr.deliverable_id
    LEFT JOIN menu_items m ON m.id = d.menu_item_id
    WHERE rr.id = ${reviewId} AND rr.reviewer_id = ${reviewerId}
  `;
  if (!review) return null;

  // Update the review
  const [updated] = await sql`
    UPDATE review_requests
    SET status = ${status},
        reviewer_notes = ${notes || null},
        resolved_at = NOW(),
        updated_at = NOW()
    WHERE id = ${reviewId}
    RETURNING *
  `;

  // Get reviewer name for notification
  const [reviewer] = await sql`SELECT display_name, email FROM users WHERE id = ${reviewerId}`;
  const reviewerName = reviewer?.display_name || reviewer?.email?.split('@')[0] || 'Reviewer';
  const docTitle = review.doc_name || 'Document';

  // Notify the requester
  const statusLabel = status === 'approved' ? 'approved'
    : status === 'changes_requested' ? 'requested changes on'
    : 'flagged concerns on';

  await createNotification({
    userId: review.requested_by,
    dealId: review.deal_id,
    type: status === 'approved' ? 'review_approved' : 'review_changes',
    title: `${reviewerName} ${statusLabel} ${docTitle}`,
    body: notes ? notes.substring(0, 200) : undefined,
    actionUrl: `/chat`,
  });

  // If approved and this is a legal doc, advance doc status
  if (status === 'approved' && review.deliverable_id) {
    const [del] = await sql`SELECT doc_class FROM deliverables WHERE id = ${review.deliverable_id}`;
    if (del?.doc_class === 'legal') {
      // Move legal doc from 'review' to 'approved' in data_room_documents if filed
      await sql`
        UPDATE data_room_documents
        SET status = 'approved', updated_at = NOW()
        WHERE deliverable_id = ${review.deliverable_id} AND status = 'review'
      `.catch(() => {});
    }
  }

  return updated;
}

export async function getReviewsForDeal(dealId: number): Promise<any[]> {
  return sql`
    SELECT rr.*,
           req.display_name as requester_name, req.email as requester_email,
           rev.display_name as reviewer_name, rev.email as reviewer_email,
           m.name as deliverable_name
    FROM review_requests rr
    JOIN users req ON req.id = rr.requested_by
    JOIN users rev ON rev.id = rr.reviewer_id
    LEFT JOIN deliverables d ON d.id = rr.deliverable_id
    LEFT JOIN menu_items m ON m.id = d.menu_item_id
    ORDER BY rr.created_at DESC
  `;
}

export async function getPendingReviewsForUser(userId: number): Promise<any[]> {
  return sql`
    SELECT rr.*,
           req.display_name as requester_name,
           m.name as deliverable_name,
           d2.name as document_name,
           dl.business_name as deal_name
    FROM review_requests rr
    JOIN users req ON req.id = rr.requested_by
    LEFT JOIN deliverables del ON del.id = rr.deliverable_id
    LEFT JOIN menu_items m ON m.id = del.menu_item_id
    LEFT JOIN data_room_documents d2 ON d2.id = rr.document_id
    LEFT JOIN deals dl ON dl.id = rr.deal_id
    WHERE rr.reviewer_id = ${userId} AND rr.status IN ('pending', 'reviewing')
    ORDER BY rr.created_at ASC
  `;
}
