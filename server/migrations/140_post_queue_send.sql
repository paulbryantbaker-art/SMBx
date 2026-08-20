-- SEND TO STUDIO — "build this one" (2026-08-20, Paul: "when i have the copy
-- the way i want it and have saved the decision — we need a Send to Studio
-- button that tells cowork to build it").
--
-- Migration 138 gave a slot a place to hold DECISIONS — the template pick, the
-- edited caption. What it had no way to say is "I am done deciding; build it".
-- `pull-queue.mjs` therefore pulled every row carrying an edit, which means a
-- caption Paul was still working on and one he had finished looked identical to
-- the studio. These two columns are that difference, and they are the whole of
-- it: the request, and the studio's answer.
--
-- TWO COLUMNS, NOT FOUR (Paul, same day, on the first cut: "Cowork already
-- knows where to put created collateral just let it do its thing. we just need
-- to pass back what I want it to build and template type."). The first version
-- also carried a `built_path` and a `video_file`. Both are gone:
--
--   built_path   duplicated `collateral_path`, which migration 123 already
--                added for exactly this — where the collateral landed. Two
--                columns for one fact is how they come to disagree.
--   video_file   answered a question nobody has. A video slot has NOTHING for
--                the studio to build: Paul films it and already has the file.
--                `kind = 'video'` says that on its own, and the app does not
--                need to know which take — knowing would not change anything
--                it does.
--
-- STATE, both of them. The importer never writes them, exactly as with 138's
-- draft columns: `sent_at` is a human pressing a button and `built_at` is the
-- studio reporting a fact. A re-import of the plan must never send anything to
-- be built, and cannot.
ALTER TABLE post_queue ADD COLUMN IF NOT EXISTS sent_at  TIMESTAMPTZ;  -- Send to Studio was pressed
ALTER TABLE post_queue ADD COLUMN IF NOT EXISTS built_at TIMESTAMPTZ;  -- the studio reported it filed

COMMENT ON COLUMN post_queue.sent_at IS
  'When Send to Studio was pressed. STATE — the importer never writes it. Compared against draft_at to tell a live request from one the decision has moved past.';
COMMENT ON COLUMN post_queue.built_at IS
  'When the studio reported the collateral filed (POST /api/post-queue/:id/built, from pull-queue.mjs --built). Where it landed is collateral_path, migration 123.';

-- A build that claims a time must say where it landed. The same shape as
-- post_queue_posted_has_time: the pair is the record, and half of it is a
-- claim rather than a record. `collateral_path` may of course be set without a
-- build (it is older than this migration), so the check runs one way only.
DO $$ BEGIN
  ALTER TABLE post_queue ADD CONSTRAINT post_queue_built_has_path
    CHECK (built_at IS NULL OR collateral_path IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
