-- 045: Review Requests — structured review workflow for document collaboration
-- Tracks: who was asked to review, what they're reviewing, their response, and Yulia's guidance

CREATE TABLE IF NOT EXISTS review_requests (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  deliverable_id INTEGER REFERENCES deliverables(id) ON DELETE CASCADE,
  document_id INTEGER REFERENCES data_room_documents(id) ON DELETE CASCADE,
  requested_by INTEGER NOT NULL REFERENCES users(id),
  reviewer_id INTEGER NOT NULL REFERENCES users(id),
  reviewer_role VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- pending → reviewing → approved | changes_requested | flagged
  focus_areas TEXT,
  -- Yulia's guidance: "Focus on non-compete scope in §4.2 and working capital peg in §3.1"
  reviewer_notes TEXT,
  -- Reviewer's response when approving/requesting changes
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT review_has_target CHECK (deliverable_id IS NOT NULL OR document_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_review_requests_deal ON review_requests(deal_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_reviewer ON review_requests(reviewer_id, status);
CREATE INDEX IF NOT EXISTS idx_review_requests_pending ON review_requests(status) WHERE status IN ('pending', 'reviewing');

-- Generalized document shares (beyond CIM-only share links)
CREATE TABLE IF NOT EXISTS document_shares (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  deliverable_id INTEGER REFERENCES deliverables(id) ON DELETE CASCADE,
  document_id INTEGER REFERENCES data_room_documents(id) ON DELETE CASCADE,
  shared_by INTEGER NOT NULL REFERENCES users(id),
  share_type VARCHAR(20) NOT NULL DEFAULT 'external',
  -- 'internal' (my team), 'cross_fence' (other side), 'external' (link)
  token VARCHAR(64) UNIQUE,
  -- For external shares
  access_level VARCHAR(20) NOT NULL DEFAULT 'view',
  -- view | comment | edit
  auth_required VARCHAR(20) NOT NULL DEFAULT 'none',
  -- none | email | account | nda
  download_enabled BOOLEAN NOT NULL DEFAULT false,
  watermark VARCHAR(100),
  -- null | 'recipient' | 'CONFIDENTIAL' | custom text
  expires_at TIMESTAMPTZ,
  max_views INTEGER,
  view_count INTEGER NOT NULL DEFAULT 0,
  recipient_email VARCHAR(255),
  recipient_name VARCHAR(255),
  recipient_side VARCHAR(20),
  -- 'my_team' | 'other_side' | null (external)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT share_has_target CHECK (deliverable_id IS NOT NULL OR document_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_document_shares_deal ON document_shares(deal_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_token ON document_shares(token) WHERE token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_document_shares_type ON document_shares(share_type);
