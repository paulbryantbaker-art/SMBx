-- Advanced Deliverables: Living CIM, share links, version tracking

-- Living CIM instances (auto-updating CIMs tied to deals)
CREATE TABLE IF NOT EXISTS living_cims (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  deliverable_id INTEGER NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
  current_version INTEGER NOT NULL DEFAULT 1,
  auto_refresh BOOLEAN NOT NULL DEFAULT true,
  last_refresh_at TIMESTAMPTZ,
  last_trigger VARCHAR(50), -- 'financial_update', 'manual', 'market_refresh'
  refresh_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(deal_id, deliverable_id)
);

CREATE INDEX IF NOT EXISTS idx_living_cims_deal ON living_cims(deal_id);

-- CIM share links (blind teaser, full CIM, NDA-gated)
CREATE TABLE IF NOT EXISTS cim_share_links (
  id SERIAL PRIMARY KEY,
  living_cim_id INTEGER NOT NULL REFERENCES living_cims(id) ON DELETE CASCADE,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  created_by INTEGER NOT NULL REFERENCES users(id),
  token VARCHAR(64) NOT NULL UNIQUE,
  access_level VARCHAR(20) NOT NULL DEFAULT 'blind', -- 'blind', 'teaser', 'full'
  requires_nda BOOLEAN NOT NULL DEFAULT false,
  password_hash VARCHAR(255), -- optional password protection
  view_count INTEGER NOT NULL DEFAULT 0,
  max_views INTEGER, -- NULL = unlimited
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_share_links_token ON cim_share_links(token);
CREATE INDEX IF NOT EXISTS idx_share_links_cim ON cim_share_links(living_cim_id);

-- CIM access logs (who viewed what, when)
CREATE TABLE IF NOT EXISTS cim_access_logs (
  id SERIAL PRIMARY KEY,
  share_link_id INTEGER NOT NULL REFERENCES cim_share_links(id) ON DELETE CASCADE,
  viewer_email VARCHAR(255),
  viewer_ip VARCHAR(45),
  nda_signed_at TIMESTAMPTZ,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cim_access_link ON cim_access_logs(share_link_id);

-- Deliverable version history
CREATE TABLE IF NOT EXISTS deliverable_versions (
  id SERIAL PRIMARY KEY,
  deliverable_id INTEGER NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content JSONB NOT NULL,
  change_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(deliverable_id, version)
);

CREATE INDEX IF NOT EXISTS idx_del_versions_deliverable ON deliverable_versions(deliverable_id);
