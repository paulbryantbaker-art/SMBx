-- CONTENT PILLARS, AND WHAT EACH POST ACTUALLY DID (2026-08-21).
--
-- (Paul: "here is the updated content pillars i want to track and work against
-- for tracking. I will just come up with the hooks and content etc.. all i want
-- to do is paste in the link to the post and track metrics against each post.")
--
-- `post_url` already exists (migration 123) and the paste box is already wired.
-- What was missing is the pillar a post argues for, and the numbers it earned.
-- The five pillars and their weights live in `shared/pillars.ts`.
--
-- ── 1. `pillar` IS STATE, NOT CONTENT ────────────────────────────────────────
--
-- Migration 123's law: the markdown owns CONTENT and a re-import overwrites it;
-- this table owns STATE and an import never touches it. `pillar` goes in the
-- state half because PAUL SETS IT IN THE APP, and a content column would be
-- erased by the next routine re-import of the campaign file with nothing in a
-- diff looking wrong. It is also the only workable answer for a row born in the
-- app (`origin = 'app'`, migration 141) — that row has no file to declare it.
--
-- THE DIVERGENCE THIS LEAVES OPEN, STATED PLAINLY. The live 30-day calendar
-- declares its OWN pillar for every one of its 30 slots, as prose inside the
-- `format` content column — `"Video · Diligence Tell · pillar Dead Deal
-- Economics"` — using a seven-name vocabulary that predates this register
-- (Dead Deal Economics 11 · The Register 8 · Where the Return Comes From 4 ·
-- The Buyer's Math 2 · The Ask 2 · The Evidence Rules 2 · Quiet Admission 1).
-- Those names are NOT retired here, so a slot can carry a plan pillar and an
-- app pillar that disagree. That is deliberate and it is visible rather than
-- silent: the UI prints the plan's declaration under the picker, the way
-- `body` / `body_deck` / `copy_note` already surface the two-captions problem
-- instead of merging them. The human decides; nothing reconciles behind him.
--
-- NO CHECK CONSTRAINT on the value, and that is the house pattern rather than
-- laziness. `crm_leads.status` — a seven-value vocabulary — deliberately has
-- none (132_crm_leads.sql:10-12), because a CHECK makes a rename a migration,
-- and the one time this repo changed a value-list CHECK it cost a DROP, four
-- UPDATEs and a re-ADD (069_v19_pricing_ladder.sql — the only DROP CONSTRAINT
-- in 141 migrations). Pillars are a vocabulary Paul will reweight and rename;
-- `isPillarId()` in shared/pillars.ts is the owner, checked in the route.
ALTER TABLE post_queue ADD COLUMN IF NOT EXISTS pillar TEXT;

COMMENT ON COLUMN post_queue.pillar IS
  'A pillar id from shared/pillars.ts. STATE — Paul sets it in the app and the importer never writes it. The plan file may declare a different pillar in `format` prose; the UI shows both rather than merging them.';

CREATE INDEX IF NOT EXISTS post_queue_pillar ON post_queue (user_id, pillar)
  WHERE pillar IS NOT NULL;

-- ── 2. METRICS ARE A SERIES, NOT A SCALAR ────────────────────────────────────
--
-- One row per READING — per (post, day Paul typed the numbers in) — and not
-- five columns on post_queue. This is the load-bearing decision in the
-- migration, so the reasoning is recorded rather than assumed:
--
--   AN IMPRESSION COUNT WITH NO AGE IS NOT A NUMBER. LinkedIn revises a post's
--   figures upward for five to ten days. "P-3: 4,100" read whenever he
--   happened to look, against "P-7: 2,900" read the next morning, is not a
--   comparison — and a per-pillar MEDIAN built from mixed-age readings answers
--   "which pillar did I check later" while looking exactly like an answer to
--   "which pillar performs". That is this repo's own named failure class:
--   it renders rather than errors. The rollup exists to settle a real bet
--   (does The Capture outperform?), so it is precisely the number that must
--   not be quietly wrong.
--
--   A SINGLE ROW WOULD DESTROY THE CURVE, WHICH IS OFTEN THE FINDING. Two
--   posts both ending at 4,000 impressions — one there in 24 hours, one over
--   nine days — are different posts. Overwriting day 1 with day 7 loses that
--   with no trace and no migration recovers it.
--
--   EVERY COMPARABLE THING HERE KEEPS THE SERIES. research_master_versions
--   keeps every master with its audit; site_visits is one row per view;
--   crm_activity is a timeline; api_spend_ledger is a ledger. There is no
--   precedent in this schema for overwriting a measurement in place, and the
--   existing analytics wiring already assumed many-readings-per-post
--   (studio_analytics.queue_id, 123:81, carries period_start/period_end and
--   has no unique index).
--
-- WHAT IS DELIBERATELY ABSENT: `profile_views`. LinkedIn attributes profile
-- views to an ACCOUNT over a rolling window, never to a post — the export
-- itself carries impressions, members reached and totalEngagements and no such
-- field. Per post it would be a human's attribution guess wearing the same
-- clothes as a number LinkedIn wrote, and summing it per pillar would
-- fabricate a total out of real inputs. The honest form of that signal is the
-- engagers saved to crm_leads by name.
--
-- EVERY METRIC IS NULLABLE AND NULL MEANS UNKNOWN. Not zero. A post whose
-- numbers have not been typed in must never drag its pillar's median down
-- while looking like a measurement — the same rule the site-visit email keeps
-- when it prints a day before counting began as "–" rather than 0.
CREATE TABLE IF NOT EXISTS post_metrics (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Matches post_queue.queue_id. Intentionally NOT a composite foreign key:
  -- post_queue_user_qid is a unique INDEX rather than a constraint, and a
  -- reading that outlives its slot is still a real reading — the same call
  -- migration 123 made for studio_analytics ("losing it would be worse than an
  -- unattributed row").
  queue_id        TEXT NOT NULL,

  -- The day the numbers were READ off LinkedIn, which is not the day the post
  -- went up. This is the column that makes two posts comparable.
  read_on         DATE NOT NULL,
  -- read_on minus post_queue.posted_at, stamped by the route at insert. NULL
  -- when the post carries no posted_at — unknown, not zero.
  days_after_post INTEGER,

  impressions     INTEGER,
  members_reached INTEGER,
  reactions       INTEGER,
  comments        INTEGER,
  reposts         INTEGER,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One reading per post per day. Re-typing today's numbers CORRECTS today's
-- reading rather than accumulating a second one — a typo must be fixable
-- without leaving a ghost that skews the median.
CREATE UNIQUE INDEX IF NOT EXISTS post_metrics_one_per_day
  ON post_metrics (user_id, queue_id, read_on);
CREATE INDEX IF NOT EXISTS post_metrics_queue ON post_metrics (user_id, queue_id);

-- A count is a count. Negative is always a typo, and catching it here means
-- the rollup never has to defend against one.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'post_metrics_non_negative') THEN
    ALTER TABLE post_metrics ADD CONSTRAINT post_metrics_non_negative CHECK (
      COALESCE(impressions, 0)     >= 0 AND
      COALESCE(members_reached, 0) >= 0 AND
      COALESCE(reactions, 0)       >= 0 AND
      COALESCE(comments, 0)        >= 0 AND
      COALESCE(reposts, 0)         >= 0 AND
      COALESCE(days_after_post, 0) >= 0
    );
  END IF;
  -- A reading that records nothing is not a reading. Without this an empty
  -- form press writes a row that counts as "has metrics" in the rollup while
  -- carrying no number at all — the exact missing-reads-as-present failure the
  -- nullable columns above exist to avoid.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'post_metrics_not_empty') THEN
    ALTER TABLE post_metrics ADD CONSTRAINT post_metrics_not_empty CHECK (
      impressions IS NOT NULL OR members_reached IS NOT NULL OR
      reactions   IS NOT NULL OR comments        IS NOT NULL OR reposts IS NOT NULL
    );
  END IF;
END $$;

COMMENT ON TABLE post_metrics IS
  'One row per (post, day the numbers were read). Never overwritten in place — LinkedIn revises figures upward for days, so a scalar with an unknown recording age is not comparable across posts. NULL means unknown, never zero.';
