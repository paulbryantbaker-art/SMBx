-- 130: CRM stage discipline (CRM_WORKFLOW_SPEC.md, 2026-08-16).
--
-- Two columns, both in service of the spec's behavioral laws:
--
-- stage_entered_at — aging is the primary honesty mechanism of a pipeline
--   (law 6). Days-in-stage cannot be computed without knowing when the stage
--   began, and updated_at moves on every edit, so it cannot serve. Backfilled
--   from updated_at as the least-wrong available date: it OVERSTATES freshness
--   for rows edited after their last stage move, which errs toward quiet
--   rather than toward false urgency.
--
-- loss_reason — a lost pursuit must say why (the spec's loss codes feed the
--   P4-hypothesis test: is "internal BD owns origination" actually the pattern
--   that beats us?). Enforced in the route, not by CHECK constraint, so the
--   vocabulary can grow without a migration; the route refuses stage='passed'
--   without one.

ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS stage_entered_at TIMESTAMPTZ;
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS loss_reason TEXT;

UPDATE crm_accounts SET stage_entered_at = updated_at WHERE stage_entered_at IS NULL;

ALTER TABLE crm_accounts ALTER COLUMN stage_entered_at SET DEFAULT NOW();
