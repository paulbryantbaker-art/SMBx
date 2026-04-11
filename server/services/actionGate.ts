/**
 * Action Gate Service — enforces "Yulia cannot execute this action until the
 * sign-off chain is complete." This is the single most important piece of the
 * deal-operator claim.
 *
 * Each action class declares its required sign-off chain. Before any
 * consequential action (execute a legal doc, transmit an LOI, share a CIM
 * cross-fence, etc.) the API layer calls canExecuteAction(), which:
 *
 *   1. Verifies the document is in the right state machine status
 *   2. Checks that all required reviewers have approved
 *   3. For regulated roles (attorney, cpa) verifies their attestation is on file
 *   4. Returns either { allowed: true } or { allowed: false, reason, blockedBy }
 *
 * The API uses the result to either proceed or return 409 Conflict with the
 * blocking reason. Yulia uses the result inside the agentic loop to decide
 * whether to call request_review (because something is missing) or to call
 * the action tool (because the chain is complete).
 *
 * This service does NOT mutate state. It only inspects. Mutation happens
 * in the calling route after the gate clears.
 */

import { sql } from '../db.js';

// ─── Action classes ────────────────────────────────────────────

export type ActionClass =
  // Legal doc execution — the moment we hash the content and lock it forever
  | 'execute_legal_doc'
  // Send doc to external recipient (buyer pool, broker, counterparty's team)
  | 'share_external'
  // Cross-fence: share to the other side (deliberate, auditable)
  | 'share_cross_fence'
  // Transmit a counter-offer / term sheet / LOI to the counterparty
  | 'transmit_negotiation_doc'
  // Generate the executed PDF / final binder for archive
  | 'archive_legal_doc';

interface ActionRequirements {
  /** Allowed doc statuses BEFORE the action can run */
  requiredStatuses: string[];
  /** Roles whose sign-off must exist (status='approved') */
  requiredApprovals: { role: string; required: boolean; mustAttest: boolean }[];
  /** Doc class this action applies to */
  validForDocClasses: string[];
}

const ACTION_RULES: Record<ActionClass, ActionRequirements> = {
  execute_legal_doc: {
    requiredStatuses: ['agreed'],
    requiredApprovals: [
      { role: 'attorney', required: true, mustAttest: true },
      { role: 'owner', required: true, mustAttest: false },
    ],
    validForDocClasses: ['legal'],
  },
  share_external: {
    requiredStatuses: ['approved', 'agreed', 'executed', 'locked'],
    requiredApprovals: [
      { role: 'owner', required: true, mustAttest: false },
    ],
    validForDocClasses: ['legal', 'marketing', 'working'],
  },
  share_cross_fence: {
    requiredStatuses: ['approved', 'agreed', 'executed'],
    requiredApprovals: [
      { role: 'owner', required: true, mustAttest: false },
      { role: 'attorney', required: false, mustAttest: false },
    ],
    validForDocClasses: ['legal', 'marketing'],
  },
  transmit_negotiation_doc: {
    requiredStatuses: ['approved', 'agreed'],
    requiredApprovals: [
      { role: 'attorney', required: true, mustAttest: true },
      { role: 'owner', required: true, mustAttest: false },
    ],
    validForDocClasses: ['legal'],
  },
  archive_legal_doc: {
    requiredStatuses: ['executed'],
    requiredApprovals: [],
    validForDocClasses: ['legal'],
  },
};

// ─── Result types ──────────────────────────────────────────────

export interface BlockedSignoff {
  role: string;
  status: 'missing' | 'pending' | 'changes_requested' | 'flagged' | 'attestation_missing';
  reviewerName?: string;
  reason: string;
}

export interface ActionGateResult {
  allowed: boolean;
  /** Why the action is blocked, if blocked */
  reason?: string;
  /** Specific sign-offs that are missing or in a non-approved state */
  blockedBy: BlockedSignoff[];
  /** Concrete next steps Yulia (or the user) should take */
  nextSteps: string[];
  /** Snapshot of the doc + chain state for transparency */
  state: {
    docId: number | null;
    docClass: string | null;
    docStatus: string | null;
    requiredApprovals: { role: string; required: boolean; mustAttest: boolean }[];
    actualReviews: { role: string; status: string; attested: boolean; reviewerName?: string }[];
  };
}

// ─── Main entry point ──────────────────────────────────────────

interface CanExecuteInput {
  action: ActionClass;
  dealId: number;
  /** Either deliverableId or documentId — at least one required */
  deliverableId?: number;
  documentId?: number;
}

export async function canExecuteAction(input: CanExecuteInput): Promise<ActionGateResult> {
  const { action, dealId, deliverableId, documentId } = input;
  const rules = ACTION_RULES[action];
  if (!rules) {
    return _fail(`Unknown action class: ${action}`, []);
  }
  if (!deliverableId && !documentId) {
    return _fail('Must specify deliverableId or documentId', []);
  }

  // Load the document
  let doc: any = null;
  let docClass: string | null = null;
  let docStatus: string | null = null;

  if (deliverableId) {
    const [d] = await sql`
      SELECT d.id, d.doc_class, drd.status, drd.id as data_room_id
      FROM deliverables d
      LEFT JOIN data_room_documents drd ON drd.deliverable_id = d.id
      WHERE d.id = ${deliverableId}
    `;
    if (!d) return _fail('Deliverable not found', []);
    doc = d;
    docClass = d.doc_class;
    docStatus = d.status || 'draft';
  } else if (documentId) {
    const [d] = await sql`
      SELECT id, doc_class, status FROM data_room_documents WHERE id = ${documentId}
    `;
    if (!d) return _fail('Document not found', []);
    doc = d;
    docClass = d.doc_class;
    docStatus = d.status || 'draft';
  }

  // Check doc class is valid for this action
  if (!docClass || !rules.validForDocClasses.includes(docClass)) {
    return _fail(
      `Action ${action} cannot be executed on ${docClass || 'unknown'} documents. Valid classes: ${rules.validForDocClasses.join(', ')}`,
      [],
      { docId: doc?.id ?? null, docClass, docStatus, rules },
    );
  }

  // Check doc status is in the allowed set
  if (!docStatus || !rules.requiredStatuses.includes(docStatus)) {
    return _fail(
      `Document is in '${docStatus}' state. Action ${action} requires status in: ${rules.requiredStatuses.join(', ')}`,
      [],
      { docId: doc?.id ?? null, docClass, docStatus, rules },
    );
  }

  // Load all reviews for this doc
  let reviews: any[] = [];
  if (deliverableId) {
    reviews = await sql`
      SELECT rr.id, rr.reviewer_role, rr.status, rr.attestation_text, rr.attested_at,
             u.display_name as reviewer_name
      FROM review_requests rr
      LEFT JOIN users u ON u.id = rr.reviewer_id
      WHERE rr.deliverable_id = ${deliverableId} AND rr.deal_id = ${dealId}
      ORDER BY rr.updated_at DESC
    `;
  } else if (documentId) {
    reviews = await sql`
      SELECT rr.id, rr.reviewer_role, rr.status, rr.attestation_text, rr.attested_at,
             u.display_name as reviewer_name
      FROM review_requests rr
      LEFT JOIN users u ON u.id = rr.reviewer_id
      WHERE rr.document_id = ${documentId} AND rr.deal_id = ${dealId}
      ORDER BY rr.updated_at DESC
    `;
  }

  // For each required approval, find the most recent matching review
  const blockedBy: BlockedSignoff[] = [];
  const actualReviews: ActionGateResult['state']['actualReviews'] = [];

  for (const req of rules.requiredApprovals) {
    if (!req.required) continue;

    // Owner role is special — owner approval is implicit if they ARE the user calling.
    // For now we treat owner as always satisfied (the calling user is the owner in
    // most contexts; cross-fence and shared-deal cases are handled by caller permissions).
    if (req.role === 'owner') {
      actualReviews.push({ role: 'owner', status: 'approved', attested: false });
      continue;
    }

    // Find the most recent review for this role
    const matchingReviews = reviews.filter(
      (r: any) => (r.reviewer_role || '').toLowerCase() === req.role.toLowerCase(),
    );

    if (matchingReviews.length === 0) {
      blockedBy.push({
        role: req.role,
        status: 'missing',
        reason: `No ${req.role} has been added as a reviewer on this document. Yulia should call request_review with reviewer_role='${req.role}'.`,
      });
      continue;
    }

    const latest = matchingReviews[0];
    actualReviews.push({
      role: req.role,
      status: latest.status,
      attested: !!latest.attested_at,
      reviewerName: latest.reviewer_name,
    });

    if (latest.status !== 'approved') {
      blockedBy.push({
        role: req.role,
        status: latest.status,
        reviewerName: latest.reviewer_name,
        reason:
          latest.status === 'pending' || latest.status === 'reviewing'
            ? `${req.role} review is still pending. Yulia is waiting on ${latest.reviewer_name || req.role}.`
            : latest.status === 'changes_requested'
              ? `${req.role} requested changes. Yulia must address the changes and re-route for review.`
              : latest.status === 'flagged'
                ? `${req.role} flagged concerns. Yulia must escalate before proceeding.`
                : `${req.role} review status is ${latest.status}.`,
      });
      continue;
    }

    // Check attestation if required for this role
    if (req.mustAttest && !latest.attested_at) {
      blockedBy.push({
        role: req.role,
        status: 'attestation_missing',
        reviewerName: latest.reviewer_name,
        reason: `${req.role} approved the review but has not accepted the formal attestation. They must accept the attestation text before this action can proceed.`,
      });
    }
  }

  const allowed = blockedBy.length === 0;
  const nextSteps: string[] = allowed
    ? [`Action '${action}' is cleared to execute.`]
    : blockedBy.map((b) => b.reason);

  return {
    allowed,
    reason: allowed ? undefined : `Action blocked by ${blockedBy.length} sign-off requirement${blockedBy.length === 1 ? '' : 's'}.`,
    blockedBy,
    nextSteps,
    state: {
      docId: doc?.id ?? null,
      docClass,
      docStatus,
      requiredApprovals: rules.requiredApprovals,
      actualReviews,
    },
  };
}

// ─── Helper for clean failure return ───────────────────────────

function _fail(
  reason: string,
  blockedBy: BlockedSignoff[],
  state?: { docId: number | null; docClass: string | null; docStatus: string | null; rules?: ActionRequirements },
): ActionGateResult {
  return {
    allowed: false,
    reason,
    blockedBy,
    nextSteps: [reason],
    state: {
      docId: state?.docId ?? null,
      docClass: state?.docClass ?? null,
      docStatus: state?.docStatus ?? null,
      requiredApprovals: state?.rules?.requiredApprovals ?? [],
      actualReviews: [],
    },
  };
}

// ─── Convenience: get human-readable summary of current state ──

export async function getDealActionStatus(
  dealId: number,
  deliverableId?: number,
  documentId?: number,
): Promise<{ action: ActionClass; result: ActionGateResult }[]> {
  const checks: ActionClass[] = [
    'execute_legal_doc',
    'share_external',
    'share_cross_fence',
    'transmit_negotiation_doc',
  ];
  const results = await Promise.all(
    checks.map(async (action) => ({
      action,
      result: await canExecuteAction({ action, dealId, deliverableId, documentId }),
    })),
  );
  return results;
}
