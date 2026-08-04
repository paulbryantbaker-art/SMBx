-- 117: seller_registry — the owner-evaluation funnel's register
-- (SELLER_EVALUATION_PLAN.md, 2026-08-04).
--
-- THE SCHEMA IS THE PRIVACY PROMISE. There are deliberately NO columns for
-- revenue, earnings, owner comp, add-backs, or any other financial figure an
-- owner enters during the evaluation — so no code path, present or future,
-- can persist them here. The only size signal is `revenue_band`, a coarse
-- label ('Under $1M' … '$10M+') from house/evaluate.ts. The finished report
-- PDF is kept (Paul's call, disclosed to the owner verbatim); raw inputs
-- stream through the calculator and evaporate.
--
-- Rows here are TARGETS, never clients — crm_accounts is the client
-- pipeline and sellers must not land there (one client per target).

CREATE TABLE IF NOT EXISTS seller_registry (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL,
  name          TEXT,
  google_sub    TEXT,                       -- set when identity came via Google
  lane          TEXT NOT NULL,
  geography     TEXT,
  situation     TEXT,                       -- owner-stated, e.g. 'exploring' | 'ready-12mo'
  revenue_band  TEXT,                       -- coarse label ONLY, never a figure
  readiness_score    INT,
  readiness_position TEXT,
  consent_first_call BOOLEAN,
  consent_storage    BOOLEAN,
  report_pdf         BYTEA,
  report_generated_at TIMESTAMPTZ,
  source        TEXT NOT NULL DEFAULT 'owner-evaluation',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per owner per lane; a re-run updates in place.
CREATE UNIQUE INDEX IF NOT EXISTS idx_seller_registry_email_lane
  ON seller_registry (LOWER(email), lane);

-- The mandate-match query: who raised their hand in this lane, first-call
-- consented, newest first.
CREATE INDEX IF NOT EXISTS idx_seller_registry_lane_consent
  ON seller_registry (lane, consent_first_call, created_at DESC);
