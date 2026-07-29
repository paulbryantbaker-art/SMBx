-- Report download access (2026-07-29).
--
-- The research reports read free on the site; the PDF requires a VERIFIED
-- email. A reader asks for the file, we mail a one-click link, and clicking it
-- proves the address is real before the download is released. That turns the
-- old typed-into-a-box email into a confirmed lead, and it is why the PDFs no
-- longer sit at a guessable static URL.
--
-- One row per request. `verified_at` marks the click; `download_count` and
-- `last_download_at` record actual retrievals, so a lead that never opened the
-- report is distinguishable from one that read it twice.

CREATE TABLE IF NOT EXISTS report_access (
  id               SERIAL PRIMARY KEY,
  email            TEXT        NOT NULL,
  slug             TEXT        NOT NULL,
  token            TEXT        NOT NULL UNIQUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at       TIMESTAMPTZ NOT NULL,
  verified_at      TIMESTAMPTZ,
  download_count   INTEGER     NOT NULL DEFAULT 0,
  last_download_at TIMESTAMPTZ,
  ip               TEXT
);

CREATE INDEX IF NOT EXISTS idx_report_access_token ON report_access (token);
CREATE INDEX IF NOT EXISTS idx_report_access_email ON report_access (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_report_access_created ON report_access (created_at DESC);
