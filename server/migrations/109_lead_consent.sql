-- Marketing consent on captured leads (2026-07-29).
--
-- Paul: "save their email for a later campaign." The addresses were already
-- stored — what was missing is the RIGHT to use them that way. The download
-- card previously promised "no list, no sequence", so campaigning to those
-- addresses would have broken the promise they were given at capture.
--
-- These columns record what each person was actually told and when, so a
-- future campaign can be sent only to people who were told it was coming, and
-- an opt-out can be honoured permanently.
--
-- `consent_text` stores the exact notice shown, verbatim. If the wording ever
-- changes, old rows still say what THEY agreed to — which is the only version
-- that matters if anyone asks.

ALTER TABLE practice_leads
  ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS consent_text      TEXT,
  ADD COLUMN IF NOT EXISTS consent_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS unsubscribed_at   TIMESTAMPTZ;

-- The campaign list: consented, never opted out, one row per address.
CREATE INDEX IF NOT EXISTS idx_practice_leads_mailable
  ON practice_leads (LOWER(email))
  WHERE marketing_consent = TRUE AND unsubscribed_at IS NULL;
