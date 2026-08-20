-- THE PLAN ARRIVES BEFORE THE DRAFT (2026-08-20).
--
-- The 30-day "How I" hook sequence resets the calendar from Aug 21, and it is
-- shaped differently from the campaign that preceded it: it gives each of the
-- thirty days its HOOK and REHOOK verbatim and its BEATS as the drafting
-- brief, and the finished post is written later by the Sunday staging run.
-- Migration 136 gave a row somewhere to carry finished copy and nowhere to
-- carry a plan, so thirty slots would have imported reading "no copy" — which
-- is true and useless, and would have made the reset look like a regression
-- from the calendar it replaces.
--
-- `brief` is that place: {hook, rehook, beats[], source, extraction, note}.
-- The screen shows it when there is no body and keeps it beside the body when
-- there is, so a drafted post can always be read against the plan it came from.
--
-- CONTENT, like every column migration 136 added — and therefore the opposite
-- of migration 138's DRAFT columns, which are Paul's own decisions and are
-- never touched by the importer. Written by the import from the campaign file
-- (campaign-export.mjs parses it out of the markdown, never retyped) and
-- OVERWRITTEN on every re-import. The state columns of migration 123 are
-- untouched and the import still cannot un-post a row.
--
-- JSONB rather than five columns for the same reason `document` is: it is one
-- shape that travels together and is read whole, never queried by field. It is
-- written with `sql.json()` and read through `normalizeQueueRow` for the reason
-- migration 138's review found the hard way (PR #446): passing a stringified
-- object to a `::jsonb` param makes postgres-js serialize it a SECOND time, and
-- the column ends up holding a JSON string whose content is JSON. `beats` is
-- the field the screen iterates, so it is the one that would throw.
ALTER TABLE post_queue ADD COLUMN IF NOT EXISTS brief JSONB;

-- `kind` gains two mediums. It was text|document because the Aug 18 calendar
-- had only those two; the new sequence runs eight VIDEO days and eleven single
-- IMAGE days, and the medium is the most important production fact on the
-- screen — a video day needs a camera booked, and a row that reads "Text"
-- hides that. Free text, no constraint to alter; recorded here so the
-- vocabulary has one written home: text · image · video · document, NULL for a
-- Mandate edition or a blackout, which carry no copy of their own.
COMMENT ON COLUMN post_queue.kind IS
  'The medium: text | image | video | document. NULL for a Mandate edition or a blackout — the Sunday run builds those from the sweep.';
COMMENT ON COLUMN post_queue.brief IS
  'The plan for a slot before its draft exists: {hook, rehook, beats[], source, extraction, note}. Content — overwritten by every campaign import.';
