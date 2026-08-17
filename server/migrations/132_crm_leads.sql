-- 132: THE LEAD (SMBX_CRM_V2_SPEC.md §2.1 — Paul's V2 spec, 2026-08-16).
--
-- A person in the LinkedIn stage: known, engaged, not yet graduated.
-- Deliberately THIN so quick-add stays under 15 seconds — no email, no phone;
-- those arrive at conversion, and an early email is usually the graduation
-- signal itself.
--
-- THE ONE LAW: every open lead has a next-follow-up date. LinkedIn's inbox
-- cannot run a follow-up queue; this date is what Today reads. Enforced in
-- the route (a create or status move without a date gets the ladder's
-- default), not by constraint — the DEFAULTS ARE PROMPTS and Paul overrides
-- them in one tap.

CREATE TABLE IF NOT EXISTS crm_leads (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  -- Resolved org when the firm exists in the pushed universe; free text
  -- otherwise, resolvable later. Both may be present (text kept as typed).
  account_id INTEGER REFERENCES crm_accounts(id) ON DELETE SET NULL,
  org_text TEXT,
  linkedin_url TEXT,

  -- identified · invited · connected · in_thread · ready · dropped · converted
  status TEXT NOT NULL DEFAULT 'identified',
  next_follow_up_on DATE,
  source TEXT,          -- how found: sales nav search, group, event, referral
  notes TEXT,           -- paste-in of thread highlights, optional

  dropped_reason TEXT,  -- required by the route when status -> dropped
  converted_contact_id INTEGER REFERENCES crm_contacts(id) ON DELETE SET NULL,

  last_touch_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_leads_user_due
  ON crm_leads (user_id, next_follow_up_on)
  WHERE status NOT IN ('dropped', 'converted');

-- The timeline stays ONE table. A lead's touches are crm_activity rows
-- carrying lead_id; account_id loosens to nullable with a both-absent guard,
-- so nothing else about the activity model changes.
ALTER TABLE crm_activity ADD COLUMN IF NOT EXISTS lead_id INTEGER REFERENCES crm_leads(id) ON DELETE CASCADE;
ALTER TABLE crm_activity ALTER COLUMN account_id DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'crm_activity_has_subject') THEN
    ALTER TABLE crm_activity ADD CONSTRAINT crm_activity_has_subject
      CHECK (account_id IS NOT NULL OR lead_id IS NOT NULL);
  END IF;
END $$;
