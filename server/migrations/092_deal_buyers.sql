-- Sell-side buyer funnel (advisor cockpit).
-- The acquirer universe an advisor markets a SELL mandate to, with a per-buyer
-- funnel: identified → contacted → nda → cim → ioi → loi → passed. This is
-- distinct from buy-side discovery_targets (a buyer evaluating targets) and from
-- deal_participants (the active deal team / signed counterparties). It is the
-- marketing list the advisor works every day.
CREATE TABLE IF NOT EXISTS deal_buyers (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  buyer_type TEXT NOT NULL DEFAULT 'strategic',   -- strategic | financial | individual
  stage TEXT NOT NULL DEFAULT 'identified',        -- identified | contacted | nda | cim | ioi | loi | passed
  contacted_at TIMESTAMPTZ,
  nda_signed_at TIMESTAMPTZ,                        -- mirrors deal_participants.nda_signed_at semantics
  do_not_contact BOOLEAN NOT NULL DEFAULT false,   -- THE LINE: never auto-contact; this excludes a buyer
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_deal_buyers_deal ON deal_buyers(deal_id);
