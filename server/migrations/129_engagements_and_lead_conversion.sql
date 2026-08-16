-- 129 — THE ENGAGEMENT OBJECT, AND LEADS FINALLY REACH THE CRM
--
-- FRONT_END_REBUILD.md §3 named the CRM's two structural gaps, both measured:
--
-- 1 · THERE WAS NO ENGAGEMENT OBJECT. The app could record a firm
--     (crm_accounts) and a target (deals) but not the CONTRACT between them —
--     which client engaged us, when the letter was signed, what retainer has
--     been paid, whether the mandate continues through integration (Premium).
--     That is Salesforce's Opportunity, and the published fee schedule's
--     arithmetic (quarterly $15K, banded success fee, retainer credited at
--     close) lived nowhere. The arithmetic now lives in house/engagement.ts —
--     PURE, tested against the schedule's own worked anchors — and this table
--     stores only FACTS: dates, cents paid, status. Fees are computed from
--     the facts on read, never stored, so a fee can never go stale against
--     the schedule that defines it.
--
-- 2 · practice_leads NEVER REACHED THE CRM. The public funnel captured a lead
--     and it died in its own table — zero references in routes/crm.ts, no
--     Lead → Account conversion, the one flow every CRM has. The columns
--     below give a lead somewhere to go and make the conversion a recorded
--     fact rather than a copy-paste.
--
-- NEVER MULTI-TENANT: user_id scoping like every other table — multi-USER
-- (the partner path) stays possible, per-customer isolation stays forbidden.
--
-- THE LINE: this table records the practice's own engagements, papered by the
-- engagement letter. Nothing here is customer-facing; Yulia and the intake
-- still never quote fees; the §15(b)(13) counsel confirmation the schedule
-- awaits is a fact about the letter, not about this table.

CREATE TABLE IF NOT EXISTS engagements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  crm_account_id INTEGER NOT NULL REFERENCES crm_accounts(id) ON DELETE CASCADE,
  -- draft → active → paused/ended · closed = a transaction closed under it.
  status TEXT NOT NULL DEFAULT 'draft',
  letter_signed_on DATE,
  started_on DATE,
  -- The schedule's quarterly rate AT SIGNING, in cents. Defaulted to the
  -- published $15,000 and stored per-row anyway: if the published schedule
  -- ever moves, existing letters keep the rate they were papered at instead
  -- of silently repricing.
  quarter_rate_cents BIGINT NOT NULL DEFAULT 1500000,
  -- Running total actually RECEIVED, in cents — a fact the practitioner
  -- records, not a derived number. house/engagement.ts turns it into the
  -- credit at close.
  retainer_paid_cents BIGINT NOT NULL DEFAULT 0,
  -- smbXCorpDev Premium: the retainer continues through integration. No
  -- second formula (the schedule's own rule), so a boolean is the whole model.
  premium BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_engagements_account
  ON engagements(crm_account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_engagements_user
  ON engagements(user_id, status);

-- Lead → Account conversion, recorded on the lead itself so the funnel can
-- answer "what happened to this" without a join guess. A dismissed lead keeps
-- its row (the funnel's history is data), it just stops appearing in the
-- worklist.
ALTER TABLE practice_leads ADD COLUMN IF NOT EXISTS converted_account_id INTEGER REFERENCES crm_accounts(id);
ALTER TABLE practice_leads ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;
ALTER TABLE practice_leads ADD COLUMN IF NOT EXISTS dismissed_at TIMESTAMPTZ;
