-- 131: The workspace spec goes live (CRM_WORKFLOW_SPEC.md; Paul, 2026-08-16:
-- "All of this needs to be running in app properly" — adopting the spec's
-- stage set + Nurture, targets with the IoI promotion ceremony, and deal key
-- dates for Today's countdowns).
--
-- 1) CLIENT-FUNNEL STAGE RENAME. The old six map onto the spec's set; the
--    three new stages (contacted, qualified, nurture) start empty. Mapping
--    judgement worth recording: 'engaged' sat between proposal and
--    mandate_live, which is the spec's Negotiation; 'passed' becomes 'lost'
--    (same verdict, the spec's word). stage_entered_at is NOT reset — the
--    rename does not restart anybody's aging clock.

UPDATE crm_accounts SET stage = CASE stage
  WHEN 'prospect'     THEN 'lead'
  WHEN 'engaged'      THEN 'negotiation'
  WHEN 'mandate_live' THEN 'won'
  WHEN 'passed'       THEN 'lost'
  ELSE stage END
WHERE stage IN ('prospect', 'engaged', 'mandate_live', 'passed');

ALTER TABLE crm_accounts ALTER COLUMN stage SET DEFAULT 'lead';

-- 2) TARGETS. A target is a kind='target' account with its own origination
--    stage, a link to the CLIENT it is hunted for (null = the house mandate —
--    the spec's rule that the model never needs a null client is satisfied by
--    letting null MEAN house), and, once promoted, the deal it became.
--    promoted_deal_id doubles as the freeze flag: non-null = read-only.

ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS target_stage TEXT;
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS client_account_id INTEGER REFERENCES crm_accounts(id) ON DELETE SET NULL;
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS promoted_deal_id INTEGER REFERENCES deals(id) ON DELETE SET NULL;

UPDATE crm_accounts SET target_stage = 'sourced' WHERE kind = 'target' AND target_stage IS NULL;

-- 3) DEAL KEY DATES. The countdowns the spec puts on Today and the deal
--    record. Dates, not timestamps — these are calendar commitments.

ALTER TABLE deals ADD COLUMN IF NOT EXISTS ioi_sent_on DATE;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS loi_signed_on DATE;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS exclusivity_expires_on DATE;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS financing_commitment_on DATE;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS target_close_on DATE;
