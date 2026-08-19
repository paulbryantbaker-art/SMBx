-- THE DRAFT: Paul's decisions about a slot, made in the app BEFORE Cowork
-- renders it (2026-08-19: "i want to be able to choose the template and edit
-- the copy before anything is finally rendered in Cowork").
--
-- These are STATE, not content. Content (title · body · pages · document) comes
-- from the plan's markdown and is overwritten on every import; these four
-- columns are never touched by the importer — they are the human's call on
-- the row, and a re-import must not silently discard a template pick or an
-- edited caption. The studio pulls them (scripts/studio/pull-queue.mjs) and
-- renders from them; once the plan catches up and is re-exported, the app
-- shows plan == edit and the draft is simply satisfied.
ALTER TABLE post_queue ADD COLUMN IF NOT EXISTS template   TEXT;         -- id from shared/templates.ts
ALTER TABLE post_queue ADD COLUMN IF NOT EXISTS copy_edit  TEXT;         -- Paul's edit of body (the post / the caption)
ALTER TABLE post_queue ADD COLUMN IF NOT EXISTS pages_edit JSONB;        -- Paul's edit of pages [{n,label,text,note}]
ALTER TABLE post_queue ADD COLUMN IF NOT EXISTS draft_at   TIMESTAMPTZ;  -- when the draft last changed
-- THE ANCHOR (review, 2026-08-19): the plan text the edit was made AGAINST.
-- Without it "satisfied" was defined as edit == body at read time, and a later
-- plan revision made a consumed edit read as live again — the old caption
-- outranking the new content of record. With it, shared/draft.ts can tell
-- live (plan == base) from superseded (plan moved on). Written only by
-- updateQueueDraft, never by the importer.
ALTER TABLE post_queue ADD COLUMN IF NOT EXISTS copy_base  TEXT;
ALTER TABLE post_queue ADD COLUMN IF NOT EXISTS pages_base JSONB;
