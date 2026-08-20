-- A POST CAN BE BORN IN THE APP (2026-08-20, Paul: *"so in app, i will curate
-- the idea, etc. then send to Cowork when done"* — and, on the shift from a
-- dated calendar to a monthly hook library: *"I will just come up with the copy
-- and paste that into the app and then hit send to Cowork."*).
--
-- Until now every row came from a file. `campaign-<date>.json` owned its rows'
-- CONTENT and rewrote it on every import; the app owned only state. A library
-- breaks that in one specific way: a hook is a reference, not a post, so a post
-- made from one has no file behind it and must own its own content.
--
-- THAT IS ALREADY SAFE, and this column does not make it safe — it records
-- which kind of row this is. The safety is structural: every importer iterates
-- the ids in a FILE, so an id no file contains can never be overwritten by one.
-- An app-born row is out of the importer's reach by construction rather than by
-- a flag someone has to remember to check.
--
-- What the column IS for is telling the two apart when it matters: a campaign
-- row with no copy is waiting on a draft that is coming, and an app row with no
-- copy is one Paul has not written yet. Same emptiness, different question.
ALTER TABLE post_queue ADD COLUMN IF NOT EXISTS origin TEXT;   -- 'app' = created here; NULL = came from a file

COMMENT ON COLUMN post_queue.origin IS
  'app = born in the app from a library hook or blank; NULL = imported from a campaign file, which owns its content.';
