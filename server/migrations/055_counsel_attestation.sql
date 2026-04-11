-- 055: Counsel Attestation — formal sign-off ceremony for review_requests
-- When a reviewer with a regulated role (attorney, cpa) approves a document,
-- they attest in writing to the substance of their review. The attestation
-- text + timestamp + ip is the legal cover that lets Yulia execute downstream
-- actions without crossing UPL/UPA lines.

ALTER TABLE review_requests
  ADD COLUMN IF NOT EXISTS attestation_text TEXT,
  ADD COLUMN IF NOT EXISTS attested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS attested_ip VARCHAR(64);

-- Standard attestation phrasings, tracked so we know which version the
-- reviewer accepted at the moment they approved.
COMMENT ON COLUMN review_requests.attestation_text IS
  'Exact attestation text the reviewer accepted when approving. Captured verbatim. For attorneys: "I have reviewed this document and advised my client; my client has accepted my advice." For CPAs: "I have reviewed the financial schedule and the assumptions are reasonable based on the documents provided." Required when reviewer_role in (attorney, cpa).';

COMMENT ON COLUMN review_requests.attested_at IS
  'Timestamp the reviewer accepted the attestation. Distinct from resolved_at (which is when the review status was set).';

COMMENT ON COLUMN review_requests.attested_ip IS
  'IP address of the reviewer at time of attestation. Part of the chain of custody.';

-- Index for queries that need to find attested reviews
CREATE INDEX IF NOT EXISTS idx_review_requests_attested
  ON review_requests(deal_id, reviewer_role, attested_at)
  WHERE attested_at IS NOT NULL;
