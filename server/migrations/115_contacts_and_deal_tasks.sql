-- ONE ADDRESS BOOK, AND DEAL TASKS THAT REACH OUTSIDE (2026-07-31).
--
-- Paul: "I want to do an outbound email campaign to prospects. That could be
-- CPAs. It could be whatever as long as I have their email… if the deal needs an
-- action from a CPA it needs to send the CPA an email to say hey you have an
-- action… and I need for the CRM for me to understand who's who at the company,
-- do we have a lead, and then transfer that into a deal."
--
-- ── WHY THIS IS NOT BUILT ON service_providers (021) ─────────────────────
-- WHERE_THE_WORK_HAPPENS.md §8 said to extend `service_providers` +
-- `service_referrals` for the professionals. That was wrong, for two reasons
-- found on inspection:
--
--   1. `service_referrals.fee_cents` exists, and `service_providers` carries
--      typical_fee_min/max/fee_structure. THE LINE rule 1 forbids REFERRAL FEES
--      absolutely. Building the professional address book on a table whose
--      schema encodes a forbidden practice invites the exact drift the policy
--      exists to prevent — a column is a suggestion, and this one must never be
--      filled in.
--   2. Paul's own framing is ONE address book: "whatever, as long as I have
--      their email." A CPA needs to be emailable from a campaign AND assignable
--      from a deal. Two parallel registers would mean two answers to "who do we
--      know", which is the same defect as the master document living in two
--      places.
--
-- So `crm_accounts` becomes the register for every ORGANISATION we deal with,
-- discriminated by `kind`, and `crm_contacts` is every PERSON. A solo CPA is an
-- account with one contact. `service_providers` stays on disk, untouched and
-- unreferenced (Paul: "let's don't delete anything yet").

-- What kind of organisation this is. Scoring in house/leads.ts only ever ranks
-- acquirers; a CPA firm is in the book to be reachable, not to be ranked, and
-- the Clients board filters to kind='acquirer' so it does not fill with
-- law firms.
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'acquirer';

-- WHO'S WHO. The register carried one `key_person` per firm; a real relationship
-- has several people with different jobs, and the job is what decides who gets
-- which email.
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS role TEXT;

-- CAMPAIGN HYGIENE, ahead of the campaign build. NULL means mailable. Set once
-- and never cleared by an import: an unsubscribe is permanent, and a re-import
-- from the Sheet must not resurrect someone who opted out. Also the reason
-- imports never touch this column.
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS unsubscribe_token TEXT;

CREATE INDEX IF NOT EXISTS idx_crm_accounts_kind ON crm_accounts(user_id, kind, archived);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON crm_contacts(lower(email)) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_contacts_unsub_token
  ON crm_contacts(unsubscribe_token) WHERE unsubscribe_token IS NOT NULL;

-- ── DEAL TASKS ──────────────────────────────────────────────────────────
-- "If the deal needs an action from a CPA it needs to send the CPA an email to
-- say hey you have an action."
--
-- The assignee may be OUTSIDE the practice, which is the whole point. They never
-- get an account (CLAUDE.md: third parties are corresponded with, never
-- onboarded) — they get an email and, where a document is involved, a token
-- share link.
--
-- assignee_email and assignee_name are DENORMALISED on purpose. The task is a
-- record that we asked a named person for something on a date; if the contact
-- row is later edited or deleted, "who did we ask" must still answer. The FK is
-- the live link, the text columns are the audit trail.
CREATE TABLE IF NOT EXISTS deal_tasks (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

  title TEXT NOT NULL,
  detail TEXT,

  -- The live link, when the assignee is in the address book.
  assignee_contact_id INTEGER REFERENCES crm_contacts(id) ON DELETE SET NULL,
  -- The audit trail — who we actually asked, frozen at ask time.
  assignee_email TEXT,
  assignee_name TEXT,
  assignee_role TEXT,

  due_on DATE,
  -- open | waiting (asked, not yet delivered) | done | cancelled
  status TEXT NOT NULL DEFAULT 'open',

  -- Mail is load-bearing: `notified_at` is set only when sendEmail actually
  -- returned true, so the UI can never claim an inbox that will stay empty.
  notified_at TIMESTAMPTZ,
  notify_count INTEGER NOT NULL DEFAULT 0,
  last_notify_error TEXT,

  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deal_tasks_deal ON deal_tasks(deal_id, status);
-- "What is outstanding with third parties, across every deal" — the question
-- that makes this a management tool rather than a note field.
CREATE INDEX IF NOT EXISTS idx_deal_tasks_open
  ON deal_tasks(user_id, due_on) WHERE status IN ('open', 'waiting');
CREATE INDEX IF NOT EXISTS idx_deal_tasks_contact
  ON deal_tasks(assignee_contact_id) WHERE assignee_contact_id IS NOT NULL;
