-- THE POST QUEUE — rows, and only rows.
--
-- The content guide is `content/studio/POST_QUEUE.md`; `post-queue.json` is its
-- generated form and the thing this table imports. The ownership rule that stops
-- the two copies fighting, stated once and enforced by which columns exist here:
--
--   the MARKDOWN owns CONTENT   angle, format, slot, evidence grade
--   this TABLE owns STATE       posted_at, impressions, engagement
--
-- They never write the same field, so there is no round-trip sync to get wrong.
-- A re-import overwrites the content columns and NEVER touches the state ones.
--
-- TWO THINGS THIS TABLE MUST NOT DO, both load-bearing:
--
-- 1. IT MUST NOT FIRE ANYTHING. Migration 122 disarmed the research scheduler
--    after a saved campaign ran unattended on the metered key — 40 searches and
--    25 page fetches with no cap. A posting calendar is DATA: rows carrying a
--    date and a status. It needs no dispatcher and must not re-arm one. Nothing
--    in this migration touches `research_schedules`, and nothing should read
--    this table on a timer.
--
-- 2. IT MUST NOT INFER `posted`. Publication is Paul's decision, and the whole
--    practice runs on that (one touch, one press, one human). `posted_at` is
--    written by a human action in the UI. No job, no import and no analytics
--    ingest may set it — which is why `import` below excludes it explicitly.
--
-- THE HARD ONE: `may_state_figure`. When false, the post makes an argument and
-- states NO figure. That is THIN evidence or a retired value, and it is the
-- practice's hardest rule to keep — the tempting claim (pre-LOI screening
-- reduces break rates) is the commercial pitch, and no causal study exists. It
-- is NOT NULL with no default on purpose: a row that fails to say lands as an
-- error rather than silently defaulting to permission.

CREATE TABLE IF NOT EXISTS post_queue (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- ── content: owned by POST_QUEUE.md, overwritten on every import ──────────
  queue_id          TEXT NOT NULL,              -- Q01…Q24, stable, never reused
  tier              TEXT,
  lead              TEXT,
  angle             TEXT NOT NULL,
  format            TEXT,                       -- Teardown · Market Map · …
  carries           TEXT,                       -- what the post actually states
  evidence_grade    TEXT,                       -- STRONG · MODERATE · THIN · VERIFIED · RETIRED · n/a
  source_disclosure TEXT,                       -- e.g. "single vendor — disclose SPS/Bain ownership"
  may_state_figure  BOOLEAN NOT NULL,           -- see the note above. No default.

  -- ── state: owned by the app, never touched by an import ───────────────────
  slot              TEXT,                       -- mon · tue · wed · thu · fri
  scheduled_for     DATE,
  status            TEXT NOT NULL DEFAULT 'next', -- next · drafted · posted · parked · recurring
  drafted_at        TIMESTAMPTZ,
  posted_at         TIMESTAMPTZ,                -- HUMAN ONLY. Never inferred.
  post_url          TEXT,
  draft_path        TEXT,
  collateral_path   TEXT,
  -- `clean` · `flagged` · `not_run`. NEVER blank: a caption is the most exposed
  -- artifact this practice produces, and "we didn't check" has to be visibly
  -- different from "we checked and it was fine".
  retired_check     TEXT NOT NULL DEFAULT 'not_run',
  notes             TEXT,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One row per angle per user. This is what makes the import an idempotent
-- upsert rather than an accumulation.
CREATE UNIQUE INDEX IF NOT EXISTS post_queue_user_qid ON post_queue (user_id, queue_id);
CREATE INDEX IF NOT EXISTS post_queue_status ON post_queue (user_id, status);
CREATE INDEX IF NOT EXISTS post_queue_sched  ON post_queue (user_id, scheduled_for)
  WHERE scheduled_for IS NOT NULL;

-- Closing the loop: linkedinAnalytics ingests Paul's export mechanically (every
-- number in the app is a number LinkedIn wrote). Joining it to queue_id gives
-- per-angle and per-format performance, which is what the next drafting run
-- reads. Nullable and ON DELETE SET NULL: an import that cannot be matched to
-- an angle is still a real import, and losing it would be worse than an
-- unattributed row.
ALTER TABLE studio_analytics ADD COLUMN IF NOT EXISTS queue_id TEXT;

-- Guard rails as CHECKs rather than as prose in a service, so a bad row cannot
-- arrive through a path nobody remembered to update.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'post_queue_status_valid') THEN
    ALTER TABLE post_queue ADD CONSTRAINT post_queue_status_valid
      CHECK (status IN ('next', 'drafted', 'posted', 'parked', 'recurring'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'post_queue_retired_check_valid') THEN
    ALTER TABLE post_queue ADD CONSTRAINT post_queue_retired_check_valid
      CHECK (retired_check IN ('clean', 'flagged', 'not_run'));
  END IF;
  -- A row cannot be `posted` without the timestamp that records WHO decided and
  -- WHEN. The status and the evidence of the human action move together or not
  -- at all — this is the constraint that makes "never inferred" checkable.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'post_queue_posted_has_time') THEN
    ALTER TABLE post_queue ADD CONSTRAINT post_queue_posted_has_time
      CHECK (status <> 'posted' OR posted_at IS NOT NULL);
  END IF;
END $$;
