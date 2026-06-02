-- THE LINE remediation (SP Phase 0): remove the provider referral-fee rail and
-- the pay-to-rank / endorsement counters. smbX takes and pays no provider fee
-- and expresses no preference among providers, so these columns must not exist.
-- All code references were removed in the same change (providerMatchingService.ts
-- no longer ranks by these or increments a referral counter).
ALTER TABLE service_referrals DROP COLUMN IF EXISTS fee_cents;
ALTER TABLE service_providers DROP COLUMN IF EXISTS smbx_referrals_sent;
ALTER TABLE service_providers DROP COLUMN IF EXISTS smbx_deals_closed;
