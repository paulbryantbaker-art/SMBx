/**
 * Document Lifecycle — state machine for document status transitions.
 *
 * Enforces rules per doc_class:
 *   working:   draft ↔ review ↔ approved → locked
 *   marketing: draft → review → approved → locked
 *   evidence:  draft → locked (immutable on upload)
 *   legal:     draft ↔ review → approved → agreed → executed → archived
 *
 * SHA-256 hashing for evidence uploads and legal document execution.
 */
import { createHash } from 'crypto';
import { sql } from '../db.js';

// ─── Status Transitions ─────────────────────────────────────────────

const TRANSITIONS: Record<string, Record<string, string[]>> = {
  working: {
    draft: ['review', 'approved'],
    review: ['draft', 'approved'],
    approved: ['review', 'locked'],
    locked: [],
  },
  marketing: {
    draft: ['review'],
    review: ['draft', 'approved'],
    approved: ['locked'],
    locked: [],
  },
  evidence: {
    draft: ['locked'],
    locked: [],
  },
  legal: {
    draft: ['review'],
    review: ['draft', 'approved'],
    approved: ['agreed'],
    agreed: ['approved', 'executed'],
    executed: ['archived'],
    archived: [],
  },
};

export function canTransition(docClass: string, fromStatus: string, toStatus: string): boolean {
  const classTransitions = TRANSITIONS[docClass];
  if (!classTransitions) return false;
  const allowed = classTransitions[fromStatus];
  if (!allowed) return false;
  return allowed.includes(toStatus);
}

export function getValidTransitions(docClass: string, currentStatus: string): string[] {
  return TRANSITIONS[docClass]?.[currentStatus] ?? [];
}

export function isImmutable(docClass: string, status: string): boolean {
  if (docClass === 'evidence' && status === 'locked') return true;
  if (docClass === 'legal' && (status === 'executed' || status === 'archived')) return true;
  return false;
}

// ─── SHA-256 Hashing ────────────────────────────────────────────────

export function hashContent(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

/** Hash JSONB content deterministically (sorted keys) */
export function hashJsonContent(content: Record<string, any>): string {
  const canonical = JSON.stringify(content, Object.keys(content).sort());
  return hashContent(canonical);
}

// ─── Document Execution ─────────────────────────────────────────────

interface Signer {
  name: string;
  email: string;
  ip?: string;
  timestamp: string;
}

export async function executeDocument(
  docId: number,
  content: Record<string, any>,
  signers: Signer[],
): Promise<void> {
  const contentHash = hashJsonContent(content);
  const executionMetadata = { signers, hash_algorithm: 'sha256' };

  await sql`
    UPDATE data_room_documents
    SET status = 'executed',
        content_hash = ${contentHash},
        executed_at = NOW(),
        execution_metadata = ${JSON.stringify(executionMetadata)}::jsonb,
        updated_at = NOW()
    WHERE id = ${docId}
      AND status = 'agreed'
      AND doc_class = 'legal'
  `;
}

// ─── Evidence Upload Hashing ────────────────────────────────────────

export async function hashEvidenceUpload(docId: number, fileBuffer: Buffer): Promise<void> {
  const contentHash = hashContent(fileBuffer);

  await sql`
    UPDATE data_room_documents
    SET content_hash = ${contentHash},
        doc_class = 'evidence',
        status = 'locked'
    WHERE id = ${docId}
  `;
}

// ─── Doc Class Classification ───────────────────────────────────────

const LEGAL_PATTERNS = /loi|nda|agreement|term_sheet|counter_proposal|term-sheet|counter-proposal/i;
const MARKETING_PATTERNS = /cim|teaser|pitch_deck|executive_summary|outreach|pitch-deck|executive-summary/i;

export function classifyDeliverableType(deliverableType: string): string {
  if (LEGAL_PATTERNS.test(deliverableType)) return 'legal';
  if (MARKETING_PATTERNS.test(deliverableType)) return 'marketing';
  return 'working';
}
