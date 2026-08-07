-- THE OUTREACH CAMPAIGN (2026-08-07). Paul: "so let's get everything built out
-- before we seed data … i need to be able to eventually build an automated
-- marketing machine!"
--
-- Migration 115 built the address book and the hygiene columns and said the
-- campaign build would come. This is it: homes for the four plan tables the
-- 2026-08-05 seed deliberately deferred (waves, sequence steps, templates,
-- events) plus the table that makes it a MACHINE rather than a filing cabinet —
-- `crm_touches`, each step's target expression expanded into per-person work
-- items the queue can serve one at a time.
--
-- THE LINE, stated where the schema could tempt otherwise: nothing in these
-- tables sends anything. A touch becomes an email only when the practitioner
-- presses send on a rendered draft; the automation layer (worker.ts, later)
-- may ASSEMBLE and STAGE batches but never release them. Unsubscribes
-- (crm_contacts.unsubscribed_at, 115) and do-not-pitch accounts
-- (crm_accounts.disqualified) are checked at queue time AND at send time.

-- ── provenance keys ──────────────────────────────────────────────────────
-- The plan speaks in record ids (CAP-001, ORG-014, REF-015) and the step
-- targets reference them. The seed maps by firm name, which survives an
-- import but loses the id — so the id gets its own column, stamped on seed,
-- and target resolution reads it back. TEXT, verbatim, never parsed.
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS source_key TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS source_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_accounts_source_key
  ON crm_accounts(user_id, source_key) WHERE source_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_contacts_source_key
  ON crm_contacts(source_key) WHERE source_key IS NOT NULL;

-- ── waves ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_waves (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wave_key TEXT NOT NULL,           -- W0, W1 … the plan's own id
  name TEXT NOT NULL,
  start_on DATE,
  end_on DATE,
  objective TEXT,
  segments TEXT,                    -- the plan's segments_in_play, verbatim
  target_contacts TEXT,
  anchor_event TEXT,
  success_metric TEXT,
  dependency TEXT,
  -- planned | active | done. A wave is MARKED active by a human, never
  -- inferred from the calendar — the calendar proposes, the practitioner owns.
  status TEXT NOT NULL DEFAULT 'planned',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_waves_user_key ON crm_waves(user_id, wave_key);

-- ── message templates ────────────────────────────────────────────────────
-- Bodies are stored with REAL newlines (the CSV's literal \n is unescaped on
-- seed). Merge fields stay as {field} — rendering happens at read time via
-- house/outreach.ts so the stored template remains the single source.
CREATE TABLE IF NOT EXISTS crm_templates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_key TEXT NOT NULL,       -- T1 … the plan's own id
  segment TEXT,
  channel TEXT,
  purpose TEXT,
  subject TEXT,
  body TEXT NOT NULL,
  cta TEXT,
  -- The plan's guardrails column, shown beside every compose box. THE LINE
  -- rides in the data: "no fee talk" is a guardrail string here, and the
  -- send surface displays it — enforcement stays human because judgement is.
  guardrails TEXT,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_templates_user_key ON crm_templates(user_id, template_key);

-- ── events ───────────────────────────────────────────────────────────────
-- date_text is VERBATIM ("2026-10-27 to 2026-10-28", "TBD") because the plan's
-- dates are sometimes ranges and sometimes research tasks; on_date is the
-- parsed single date when the text starts with one, for sorting only.
CREATE TABLE IF NOT EXISTS crm_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_key TEXT NOT NULL,          -- EVT-001 …
  name TEXT NOT NULL,
  date_text TEXT,
  on_date DATE,
  location TEXT,
  registration_status TEXT,
  priority TEXT,
  target_records TEXT,              -- verbatim expression; resolved at seed
  objective TEXT,
  prep_deadline TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_events_user_key ON crm_events(user_id, event_key);

-- ── sequence steps ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_sequence_steps (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL,           -- S-001 …
  wave_id INTEGER REFERENCES crm_waves(id) ON DELETE CASCADE,
  week_of DATE,
  action TEXT NOT NULL,
  channel TEXT,
  template_id INTEGER REFERENCES crm_templates(id) ON DELETE SET NULL,
  target_records TEXT,              -- the expression, verbatim (audit trail)
  objective TEXT,
  owner TEXT,
  success_metric TEXT,
  notes TEXT,
  -- pending | in_progress | done | skipped — human-set
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_steps_user_key ON crm_sequence_steps(user_id, step_key);
CREATE INDEX IF NOT EXISTS idx_crm_steps_wave ON crm_sequence_steps(wave_id, week_of);

-- ── touches: the queue itself ────────────────────────────────────────────
-- One row = one unit of outreach work: this step, at this account, ideally
-- this person. account_id is nullable ONLY for event-preparation touches
-- (register for EVT-001), which have no counterparty.
--
-- subject_sent/body_sent follow the deal_tasks denormalisation law: the FK is
-- the live link, the text is the audit trail — "what did we actually send"
-- must survive template edits. sent_at is set only when sendEmail returned
-- true (the honest-send law, same as deal_tasks.notified_at).
CREATE TABLE IF NOT EXISTS crm_touches (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step_id INTEGER NOT NULL REFERENCES crm_sequence_steps(id) ON DELETE CASCADE,
  account_id INTEGER REFERENCES crm_accounts(id) ON DELETE CASCADE,
  contact_id INTEGER REFERENCES crm_contacts(id) ON DELETE SET NULL,
  event_id INTEGER REFERENCES crm_events(id) ON DELETE CASCADE,
  CHECK (account_id IS NOT NULL OR event_id IS NOT NULL),
  channel TEXT,
  template_id INTEGER REFERENCES crm_templates(id) ON DELETE SET NULL,
  due_on DATE,
  -- pending | sent | done | skipped | replied | bounced
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  subject_sent TEXT,
  body_sent TEXT,
  last_send_error TEXT,
  activity_id INTEGER REFERENCES crm_activity(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Idempotency: re-running the seed re-expands every step; this index makes the
-- second pass a no-op. COALESCE because contact/account/event are each
-- nullable and Postgres treats NULLs as distinct in a plain unique index.
CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_touches_identity
  ON crm_touches(step_id, COALESCE(account_id, 0), COALESCE(contact_id, 0), COALESCE(event_id, 0));
CREATE INDEX IF NOT EXISTS idx_crm_touches_queue
  ON crm_touches(user_id, status, due_on) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_crm_touches_account ON crm_touches(account_id) WHERE account_id IS NOT NULL;
