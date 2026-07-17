-- Studio media library: photos and brand imagery the composers pull into
-- LinkedIn artifacts (announcement cards, future covers). Bytes live in
-- Postgres (Railway disk is ephemeral); the library is practice-scale.
-- focal_x/focal_y = the object-position framing point (fractions 0-1) so a
-- photo is cropped correctly in any slot it lands in.
CREATE TABLE IF NOT EXISTS studio_assets (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  mime TEXT NOT NULL,
  data BYTEA NOT NULL,
  width INT,
  height INT,
  focal_x REAL NOT NULL DEFAULT 0.5,
  focal_y REAL NOT NULL DEFAULT 0.25,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
