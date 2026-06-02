-- SP Phase 1: link a service-provider directory listing to the user who owns it,
-- so a provider can sign up (free, like any user) and claim/manage their own
-- listing. One listing per user. Being a provider is just an owned directory row
-- — no plan gate here; free to participate on any number of deals.
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS claimed_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_providers_claimed_by ON service_providers(claimed_by_user_id) WHERE claimed_by_user_id IS NOT NULL;
