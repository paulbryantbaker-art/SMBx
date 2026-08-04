-- 119: owner_evaluations — the FULL evaluation's workspace
-- (SELLER_EVALUATION_PLAN.md §P2, Paul 2026-08-04 night: "log back in,
-- finish, go get answers, come back — when they're done they have a full
-- thorough report they can bank on").
--
-- THE PRIVACY MODEL FORKS HERE, DELIBERATELY. seller_registry (117) is the
-- quick tier's register and its schema IS its promise: no financial columns
-- exist, figures stream through the calculator and evaporate. A multi-session
-- evaluation cannot work that way — "log back in and finish" IS storage — so
-- this table holds the owner's answers in `answers` JSONB under a DIFFERENT,
-- EXPLICIT up-front consent: the workspace is created only after the owner
-- accepts the versioned owner-evaluation terms (consent_workspace +
-- terms_version + terms_accepted_at record the acceptance — an unversioned
-- checkbox proves nothing later). Delete-anytime is a real endpoint, and the
-- end-of-report keep-or-delete still governs everything. The quick tier's
-- never-stored promise is untouched by this table's existence.

CREATE TABLE IF NOT EXISTS owner_evaluations (
  id                  SERIAL PRIMARY KEY,
  email               TEXT NOT NULL,
  name                TEXT,
  google_sub          TEXT,                        -- set when identity came via Google
  lane                TEXT NOT NULL,
  -- The full tier's EXPLICITLY CONSENTED workspace: house/fullEvaluation.ts
  -- EvalAnswers — {questionKey: {state, value?, note?}}. The ONLY place a
  -- full-tier figure lands besides the rendered report.
  answers             JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Derived {questionKey: 'answered'|'skipped'|'parked'} — the ledger's quick
  -- read, kept in sync with answers on every save.
  question_states     JSONB NOT NULL DEFAULT '{}'::jsonb,
  sections_done       TEXT[] NOT NULL DEFAULT '{}',
  consent_workspace   BOOLEAN NOT NULL,
  terms_version       TEXT NOT NULL,
  terms_accepted_at   TIMESTAMPTZ NOT NULL,
  report_pdf          BYTEA,
  report_generated_at TIMESTAMPTZ,
  retention           TEXT NOT NULL DEFAULT 'active',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One workspace per owner per lane; re-entry resumes, never forks.
CREATE UNIQUE INDEX IF NOT EXISTS idx_owner_evaluations_email_lane
  ON owner_evaluations (LOWER(email), lane);
