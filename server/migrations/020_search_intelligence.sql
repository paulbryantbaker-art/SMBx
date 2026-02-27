-- Active deal inventory (listings from external marketplaces + broker/user submissions)
CREATE TABLE IF NOT EXISTS listings (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  source_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  naics_code TEXT,
  location_state TEXT,
  location_city TEXT,
  location_zip TEXT,
  asking_price_cents BIGINT,
  revenue_cents BIGINT,
  sde_cents BIGINT,
  ebitda_cents BIGINT,
  employees INTEGER,
  implied_multiple NUMERIC(6,2),
  deal_quality_score INTEGER,
  sba_eligible BOOLEAN,
  ownership_type TEXT,
  risk_flags JSONB DEFAULT '[]',
  enrichment_data JSONB DEFAULT '{}',
  listing_url TEXT,
  status TEXT DEFAULT 'active',
  fingerprint TEXT UNIQUE,
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  search_vector tsvector,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listings_naics ON listings(naics_code);
CREATE INDEX IF NOT EXISTS idx_listings_state ON listings(location_state);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(asking_price_cents);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_fingerprint ON listings(fingerprint);
CREATE INDEX IF NOT EXISTS idx_listings_search ON listings USING GIN(search_vector);

-- Auto-update search vector on insert/update
CREATE OR REPLACE FUNCTION listings_search_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    coalesce(NEW.title,'') || ' ' ||
    coalesce(NEW.description,'') || ' ' ||
    coalesce(NEW.industry,'') || ' ' ||
    coalesce(NEW.location_city,'') || ' ' ||
    coalesce(NEW.location_state,'')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS listings_search_trigger ON listings;
CREATE TRIGGER listings_search_trigger
  BEFORE INSERT OR UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION listings_search_update();

-- Company intelligence profiles
CREATE TABLE IF NOT EXISTS company_profiles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location_state TEXT,
  location_city TEXT,
  industry TEXT,
  naics_code TEXT,
  website TEXT,
  founding_year INTEGER,
  ownership_type TEXT,
  ownership_details JSONB DEFAULT '{}',
  revenue_range TEXT,
  employee_range TEXT,
  deal_status TEXT DEFAULT 'unknown',
  linked_listing_ids INTEGER[] DEFAULT '{}',
  enrichment_data JSONB DEFAULT '{}',
  data_sources TEXT[] DEFAULT '{}',
  confidence_score INTEGER DEFAULT 50,
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_naics ON company_profiles(naics_code);
CREATE INDEX IF NOT EXISTS idx_company_state ON company_profiles(location_state);
CREATE INDEX IF NOT EXISTS idx_company_ownership ON company_profiles(ownership_type);
