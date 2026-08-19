-- THE COPY RIDES WITH THE ROW (2026-08-18).
--
-- (Paul, 2026-08-18: "instead of giving me terminal commands, just read the
-- clone and the files and build the UI to manage the campaign and you have
-- the data.")
--
-- The Posting tab held STATE — dates, drafted/posted, the retired-check
-- verdict, the post URL — and the plan's COPY lived only in
-- content/studio/CAMPAIGN_<date>.md, so managing the campaign still meant
-- reading the markdown beside the app and retyping a caption into LinkedIn.
-- These columns carry the copy in: the paste-ready body, the understudy for a
-- receipt-gated slot, the deck's own caption where it differs from the plan's,
-- the plan's per-page carousel copy, the law-check line, and — for a document
-- slot — where the rendered deck lives and the URL the app serves it at.
--
-- EVERY ONE OF THESE IS CONTENT. They are written by the import from the
-- campaign file (campaign-export.mjs lifts them out of the markdown, parsed
-- rather than retyped) and OVERWRITTEN on every re-import, exactly like
-- `angle` and `carries`. None of them is state; the state columns of
-- migration 123 are untouched, and the import still cannot un-post a row.
--
-- `document` is JSONB rather than five columns because it is one shape that
-- travels together (slug · spec · filed_at · pdf · cover · thumbs · pages ·
-- bytes · deck_caption_matches) and it is read, never queried by field.
-- `pdf` is NULL until the exporter has seen the file on disk under
-- client/public/collateral/ — an asserted-but-missing download is the exact
-- failure that check exists to prevent.
ALTER TABLE post_queue ADD COLUMN IF NOT EXISTS title      TEXT;    -- "Dead Deal Economics"
ALTER TABLE post_queue ADD COLUMN IF NOT EXISTS kind       TEXT;    -- text · document (null = mandate/blackout/standing)
ALTER TABLE post_queue ADD COLUMN IF NOT EXISTS body       TEXT;    -- the paste-ready post (a document slot's caption)
ALTER TABLE post_queue ADD COLUMN IF NOT EXISTS body_alt   TEXT;    -- the understudy, where a slot has one
ALTER TABLE post_queue ADD COLUMN IF NOT EXISTS body_deck  TEXT;    -- the deck's caption, ONLY where it differs from the plan's
ALTER TABLE post_queue ADD COLUMN IF NOT EXISTS gate       TEXT;    -- why the body cannot ship as-is (receipt-gated)
ALTER TABLE post_queue ADD COLUMN IF NOT EXISTS copy_note  TEXT;    -- how body_deck differs, mechanically described
ALTER TABLE post_queue ADD COLUMN IF NOT EXISTS law_check  TEXT;    -- the plan's law-check line for the slot
ALTER TABLE post_queue ADD COLUMN IF NOT EXISTS pages      JSONB;   -- [{n,label,text,note}] the plan's carousel page copy
ALTER TABLE post_queue ADD COLUMN IF NOT EXISTS document   JSONB;   -- {slug,spec,filed_at,pdf,cover,thumbs,pages,bytes,deck_caption_matches}
