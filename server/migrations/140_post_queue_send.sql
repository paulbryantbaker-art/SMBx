-- SEND TO STUDIO — the request, the video pick, and the studio's answer
-- (2026-08-20, Paul: "when i have the copy the way i want it and have saved the
-- decision — we need a Send to Studio button that tells cowork to build it and
-- put it in the Finder and ready for posting. I need to be able to tell cowork
-- which template style to use or if this is using one of the videos.").
--
-- Migration 138 gave a slot a place to hold DECISIONS — the template pick, the
-- edited caption. What it had no way to say is "I am done deciding; build it".
-- `pull-queue.mjs` therefore pulled every row carrying an edit, which means a
-- caption Paul was still working on and a caption he had finished looked
-- identical to the studio. These four columns are that difference.
--
-- STATE, all of it. The importer never writes them, exactly as with 138's draft
-- columns: `sent_at` is a human pressing a button, `built_at` and `built_path`
-- are the studio reporting a fact, and `video_file` is Paul's pick. A re-import
-- of the plan must never send anything to be built, and cannot.
--
-- WHY `video_file` IS A PATH AND NOT AN ID. The app runs on Railway and the
-- videos live on Paul's Mac — it cannot enumerate them, so there is no id to
-- offer. The row carries what he typed (a bare filename, or a path); the pull
-- script resolves a bare name against the video folder it is configured with
-- and REFUSES loudly when it cannot find it, rather than filing a work order
-- that names a video nobody can produce.
--
-- WHY A VIDEO PICK IS NOT A TEMPLATE. `template` names a renderer; nothing
-- renders a piece to camera. Eight of the thirty days in the Aug 21 sequence
-- are Paul on camera and the plan's rule is "real camera, not an AI avatar",
-- so the pick has to be a FILE. Both columns exist and `shared/studioSend.ts`
-- decides which one a slot owes.
ALTER TABLE post_queue ADD COLUMN IF NOT EXISTS video_file TEXT;         -- the take to post, as Paul named it
ALTER TABLE post_queue ADD COLUMN IF NOT EXISTS sent_at    TIMESTAMPTZ;  -- Send to Studio was pressed
ALTER TABLE post_queue ADD COLUMN IF NOT EXISTS built_at   TIMESTAMPTZ;  -- the studio reported it filed
ALTER TABLE post_queue ADD COLUMN IF NOT EXISTS built_path TEXT;         -- where it landed, relative to the clone

COMMENT ON COLUMN post_queue.video_file IS
  'The video take to post, as Paul named it. Resolved on the Mac by pull-queue.mjs against SMBX_VIDEO_DIR; the app cannot see the file.';
COMMENT ON COLUMN post_queue.sent_at IS
  'When Send to Studio was pressed. STATE — the importer never writes it. Compared against draft_at to tell a live request from one the decision has moved past.';
COMMENT ON COLUMN post_queue.built_at IS
  'When the studio reported the render filed (POST /api/post-queue/:id/built, from pull-queue.mjs --built).';

-- A build that claims a time must say where it landed, and one that names a
-- path must say when. The same shape as post_queue_posted_has_time: the pair is
-- the record, and half of it is not a record of anything.
DO $$ BEGIN
  ALTER TABLE post_queue ADD CONSTRAINT post_queue_built_has_path
    CHECK ((built_at IS NULL) = (built_path IS NULL));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
