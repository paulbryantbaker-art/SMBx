-- 118: retention decision moves to AFTER delivery (Paul, 2026-08-04 evening:
-- "they accept a minimal amount of data collection to do the evaluation with…
-- at the end I'll show them: this is the information we have on your company —
-- general business information and the evaluation report, that's it. They can
-- accept it and we keep it; if they don't want us keeping any of it, they have
-- the right and we will not keep it.")
--
-- So a row is born 'pending': processed to build and deliver the report, not
-- yet accepted for retention. The end-of-chat card shows the owner exactly
-- these fields; Keep → 'kept', Delete → the row is DELETED (not flagged —
-- erasure means erasure). A 'pending' row whose owner never answered expires:
-- ownerEvaluate purges pending rows older than 30 days, because an unanswered
-- question is not consent.

ALTER TABLE seller_registry
  ADD COLUMN IF NOT EXISTS retention TEXT NOT NULL DEFAULT 'pending';

-- Rows that predate this migration were written under the old up-front
-- consent checkbox, so their storage acknowledgment was explicit — carry
-- them over as kept rather than silently expiring them.
UPDATE seller_registry SET retention = 'kept' WHERE consent_storage IS TRUE;

-- The first-call query should only ever surface accepted rows.
DROP INDEX IF EXISTS idx_seller_registry_lane_consent;
CREATE INDEX IF NOT EXISTS idx_seller_registry_lane_consent
  ON seller_registry (lane, consent_first_call, created_at DESC)
  WHERE retention = 'kept';
