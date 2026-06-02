-- SP: "represent clients" onboarding mode. A service provider who manages deals
-- FOR CLIENTS (vs just participating as a guest) flags themselves here, which
-- routes them toward the paid Pro/Team tiers. This is an account flag + upsell
-- hint only — NOT a hard gate. Actual billing stays with the deliverable paywall.
ALTER TABLE users ADD COLUMN IF NOT EXISTS represents_clients BOOLEAN DEFAULT false;
