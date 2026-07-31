-- THE CLIENT PIPELINE (2026-07-31). Paul: "i just know that I need a way to
-- manage CRM sales pipeline in addition to the deal pipeline that we already
-- built in the app."
--
-- The app had a DEAL pipeline and no CLIENT pipeline. Those are different
-- objects: a deal is a target being underwritten, a client is an acquirer
-- paying a retainer. Nothing in the schema held the second one — `practice_leads`
-- is six columns of inbound capture, and `company_profiles` carries a `deal_id`,
-- so it describes a target inside a deal rather than a standing relationship.
--
-- Shape comes from the buy-side register Paul already maintains in Google
-- Sheets (77 firms across independent sponsors, family offices, permanent
-- capital, holdcos, PE funds, platforms and strategics). All 16 of its columns
-- are kept: five rank, two route, three prove, the rest identify. `evidence` and
-- `source_url` are stored VERBATIM because the same citation discipline the
-- research masters run on applies to a claim about a buyer; `notes` is kept
-- because it carries the sharpest human judgement in the file and discarding a
-- person's own analysis on import is unforgivable and silent.
--
-- Scoring is NOT defined here. `house/leads.ts` is the single source of truth,
-- pure and dependency-free, so the app and a local Cowork session rank
-- identically. The score columns below are a materialised cache so the board can
-- sort and page in SQL; `scored_at` says when, and a re-score rewrites them.

CREATE TABLE IF NOT EXISTS crm_accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- identity
  firm TEXT NOT NULL,
  website TEXT,
  -- normalised host (no scheme, no www, no path) — the dedupe key alongside the
  -- firm name, because a Sheet will spell the same firm two ways before it
  -- spells the same domain two ways.
  domain TEXT,
  hq_city TEXT,
  hq_state TEXT,

  -- ranks
  segment TEXT,
  buyer_moment TEXT,
  dfw TEXT,
  trades TEXT,

  -- routes
  product_fit TEXT,
  sponsor TEXT,

  -- proves
  grade TEXT,
  evidence TEXT,
  source_url TEXT,

  notes TEXT,

  -- Closes the one hole the register cannot see: no column recorded whether a
  -- firm has ever closed a deal, so a well-written site with zero acquisitions
  -- scored like an active buyer. NULL is honest and scores neutral-low.
  last_deal_on DATE,
  -- Set by a human, never inferred from prose. The register marks APi Group
  -- "Not a client; competitive context" in a notes field; reading intent out of
  -- notes is how a placeholder ends up ranked first.
  disqualified TEXT,

  -- the pipeline itself
  stage TEXT NOT NULL DEFAULT 'prospect',
  owner_email TEXT,
  next_action TEXT,
  next_action_on DATE,

  -- materialised from house/leads.ts
  score INTEGER,
  tier TEXT,
  pitch TEXT,
  score_detail TEXT,
  scored_at TIMESTAMPTZ,

  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One row per firm per user. Case-insensitive, because a re-import from the
-- Sheet must UPDATE "Amalgam Capital" rather than add "amalgam capital".
CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_accounts_user_firm
  ON crm_accounts(user_id, lower(firm));
CREATE INDEX IF NOT EXISTS idx_crm_accounts_board
  ON crm_accounts(user_id, archived, score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_crm_accounts_due
  ON crm_accounts(user_id, next_action_on) WHERE next_action_on IS NOT NULL;

-- People. The register carries ONE key_person per firm; a relationship has
-- several over time, and the person is who you actually talk to.
CREATE TABLE IF NOT EXISTS crm_contacts (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES crm_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  -- The register's key_person lands as the primary contact on import.
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  source_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_account ON crm_contacts(account_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_contacts_account_name
  ON crm_contacts(account_id, lower(name));

-- The touch log. Every history table in the schema hangs off `deal_id`, and
-- before an engagement exists there is no deal — which is exactly the period a
-- client pipeline covers. ON DELETE CASCADE throughout, unlike the deals graph:
-- see WHERE_THE_WORK_HAPPENS.md §6 for why that matters.
CREATE TABLE IF NOT EXISTS crm_activity (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES crm_accounts(id) ON DELETE CASCADE,
  contact_id INTEGER REFERENCES crm_contacts(id) ON DELETE SET NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  -- note | email | call | meeting | intro | stage_change
  kind TEXT NOT NULL DEFAULT 'note',
  direction TEXT,   -- out | in | null (a note has no direction)
  subject TEXT,
  body TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_activity_account
  ON crm_activity(account_id, occurred_at DESC);
