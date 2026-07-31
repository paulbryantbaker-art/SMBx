-- DEAL MANAGEMENT (2026-07-31). Paul: "I need it to be a CRM tool and then a
-- deal management tool." The CRM shipped in 113; this is the second job.
--
-- Two things the deal pipeline lacked, and the first one is the keystone.
--
-- 1. WHICH CLIENT IS THIS DEAL FOR. The practice runs buy-side deals ON BEHALF
--    of an acquirer client, and nothing recorded which one. `deals` had
--    `user_id` (whose login owns the row) and `represents_clients` (a boolean),
--    but no pointer at the acquirer. Without it the two pipelines are unrelated
--    lists rather than one practice, and — more seriously — THE LINE's "one
--    buyer per target" rule cannot be checked at all, because there is no
--    buyer on the record to compare.
--
--    This is the first time that rule becomes DATA. It currently lives in
--    `process.env.ENGAGED_LANES` — a comma-separated deploy variable that
--    nothing can query, audit or date (see WHERE_THE_WORK_HAPPENS.md §5).
--    With a client on the deal, `targetConflicts()` in server/routes/pipeline.ts
--    can answer "is this target already being worked for somebody else" from
--    the database. It WARNS rather than blocks: the practitioner owns the
--    judgement, and a false block on a name collision would be worse than a
--    flag they can read.
--
--    ON DELETE SET NULL, not CASCADE: removing a client from the CRM must never
--    delete the deal history done for them.
--
-- 2. NEXT ACTION / OWNER. What makes a pipeline a pipeline rather than a list.
--    The CRM got this in 113; the deals board never had it. `current_gate` says
--    where a deal is in the methodology, which is not the same as what happens
--    next or who is doing it.

ALTER TABLE deals ADD COLUMN IF NOT EXISTS crm_account_id INTEGER
  REFERENCES crm_accounts(id) ON DELETE SET NULL;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS next_action TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS next_action_on DATE;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS owner_email TEXT;

-- "What do I owe this week", the one question a board exists to answer. Partial,
-- because the overwhelming majority of rows have no date set.
CREATE INDEX IF NOT EXISTS idx_deals_next_action
  ON deals(user_id, next_action_on) WHERE next_action_on IS NOT NULL;

-- Every deal being run for a given client — the CRM detail pane's "deals for
-- this client" read, and the input to the one-buyer-per-target check.
CREATE INDEX IF NOT EXISTS idx_deals_crm_account
  ON deals(crm_account_id) WHERE crm_account_id IS NOT NULL;
