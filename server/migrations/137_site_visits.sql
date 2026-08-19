-- WHO LOOKED AT THE SITE (2026-08-18).
--
-- (Paul: "i want an email every morning like the others that tells me how
-- many unique MAC addresses viewed the site, so i can tell how many people
-- besides me looked at it.")
--
-- A website never sees a MAC address — that stays on the visitor's own
-- network. What a server can count is what every analytics product calls a
-- "unique visitor": one IP + browser combination on one day. That is what
-- these tables hold, and the morning email says so in its footer rather than
-- pretending to a precision it does not have.
--
-- WHAT IS RECORDED. One row per HTML page view on the public site — a
-- navigation, not an asset, not an API call. The IP is never stored: `visitor`
-- is sha256(day + ip + user agent), which is unique for the day and useless
-- afterwards; `ip_hash` is sha256(ip) so a day's team addresses can be
-- excluded (below). Bots and link-preview fetchers (LinkedIn's, Slack's,
-- crawlers) are recorded with `is_bot` so the email can name them separately
-- instead of counting a LinkedInBot preview as a reader.
--
-- WHO IS "BESIDES ME". Two ways a view is Paul's, either is enough:
--   · the browser carries the `smbx_team=1` cookie the app sets after a
--     team login (`is_team` on the row) — his laptop and phone once signed in;
--   · the IP made an authenticated API call the same day (`site_team_ips`,
--     written from requireAuth) — a browser of his that never opened the app.
-- Both are approximations and the email says "your own browsers and IPs
-- excluded", not "everyone but you".
--
-- `site_visit_digests` records each morning's send so a worker restart cannot
-- send the same day twice, and so "did it go out" is a row rather than a
-- memory.
CREATE TABLE IF NOT EXISTS site_visits (
  id           BIGSERIAL PRIMARY KEY,
  at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  day          DATE NOT NULL,                     -- the CENTRAL calendar day of the view
  path         TEXT NOT NULL,
  visitor      TEXT NOT NULL,                     -- sha256(day · ip · ua) — one per visitor per day
  ip_hash      TEXT NOT NULL,                     -- sha256(ip) — for team exclusion only
  ua_family    TEXT,                              -- "Chrome · Mac", "Safari · iPhone", "LinkedInBot"
  referer_host TEXT,                              -- where they came from, host only
  is_bot       BOOLEAN NOT NULL DEFAULT false,
  is_team      BOOLEAN NOT NULL DEFAULT false     -- carried the smbx_team cookie
);
CREATE INDEX IF NOT EXISTS site_visits_day ON site_visits (day);

CREATE TABLE IF NOT EXISTS site_team_ips (
  day      DATE NOT NULL,
  ip_hash  TEXT NOT NULL,
  PRIMARY KEY (day, ip_hash)
);

CREATE TABLE IF NOT EXISTS site_visit_digests (
  day        DATE PRIMARY KEY,                    -- the day the digest covers
  sent_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  to_email   TEXT,
  visitors   INTEGER,                             -- uniques besides the team
  views      INTEGER,
  sent       BOOLEAN NOT NULL DEFAULT false       -- false = composed but mail did not go (no RESEND key)
);
