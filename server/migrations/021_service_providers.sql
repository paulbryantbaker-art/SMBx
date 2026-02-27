-- Session E: Service Provider Marketplace
-- Service providers (attorneys, CPAs, appraisers, etc.) and referral tracking

CREATE TABLE IF NOT EXISTS service_providers (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,              -- attorney, cpa, appraiser, re_agent, insurance, consultant
  name TEXT NOT NULL,
  firm_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  location_state TEXT,
  location_city TEXT,
  location_zip TEXT,
  service_radius_miles INTEGER,
  licenses JSONB DEFAULT '[]',
  credentials TEXT[] DEFAULT '{}', -- ASA, ABV, CFF, CCIM, CVA
  practice_areas TEXT[] DEFAULT '{}',
  deal_size_min BIGINT,
  deal_size_max BIGINT,
  industries TEXT[] DEFAULT '{}',
  financing_experience TEXT[] DEFAULT '{}', -- SBA_7a, SBA_504, conventional, seller
  smbx_referrals_sent INTEGER DEFAULT 0,
  smbx_deals_closed INTEGER DEFAULT 0,
  client_rating NUMERIC(3,2),
  typical_fee_min INTEGER,         -- cents
  typical_fee_max INTEGER,
  fee_structure TEXT,              -- hourly, flat, contingent, hybrid
  claimed BOOLEAN DEFAULT false,
  enrichment_data JSONB DEFAULT '{}',
  data_sources TEXT[] DEFAULT '{}',
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_providers_type ON service_providers(type);
CREATE INDEX IF NOT EXISTS idx_providers_state ON service_providers(location_state);
CREATE INDEX IF NOT EXISTS idx_providers_credentials ON service_providers USING GIN(credentials);

-- Referral tracking
CREATE TABLE IF NOT EXISTS service_referrals (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER REFERENCES deals(id),
  provider_id INTEGER REFERENCES service_providers(id),
  user_id INTEGER REFERENCES users(id),
  referral_context TEXT,           -- What triggered the referral
  status TEXT DEFAULT 'sent',      -- sent, viewed, engaged, completed
  fee_cents INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
