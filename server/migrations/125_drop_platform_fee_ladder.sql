-- Migration 125: drop the deal-size fee ladder for real (2026-08-14)
--
-- WHAT WAS WRONG. Migration 033 created `platform_fee_schedule` and seeded it
-- with a fee ladder keyed to deal size — L1 $999 at SDE under $500K, rising to
-- L6 $50,000 at EBITDA $50M+ — plus five fee-tracking columns on `deals`.
-- Migration 036 announced in a COMMENT that it drops that table:
--
--     -- Drop the platform_fee_schedule table. Current pricing is monthly
--     -- subscriptions only.
--
-- and contained no DROP statement. No migration in the repo has one, so the
-- table and its six seeded rows have simply been sitting in the production
-- schema ever since 033 was first applied.
--
-- (To be precise about the mechanism: server/index.ts:1474 tracks applied
-- migrations in `_migrations` and skips them, so 033 does NOT re-run each boot.
-- The ladder is not being continuously rewritten — it is persistent. That is the
-- accurate version; an earlier note in this work said "re-seeded on every boot",
-- which is wrong and would have sent anyone verifying it looking at the wrong
-- thing. The exposure is the durable rows, not a repeating write.)
--
-- WHY IT MATTERS. These are fixed amounts per band rather than percentages, and
-- nothing about them is contingent on a deal closing, so they most likely do not
-- trip the transaction-based-compensation trigger THE LINE is drawn around. That
-- is not the reason to remove them. smbX's regulatory position rests on not
-- charging by deal size, and a live table in the schema that prices by deal size
-- is a thing that would have to be explained. Comments do not drop tables.
--
-- SAFETY. Re-verified before writing this, not inherited from the audit: the
-- five columns and the table name have ZERO references across server/, client/,
-- house/, shared/, scripts/, e2e/ and testing/ in .ts/.tsx/.mts/.mjs/.js/.json —
-- by snake_case name and by every camelCase spelling. The Stripe webhook, which
-- stays mounted in practice mode, touches neither `deals` nor `payment_intent`.
-- Several services do `SELECT * FROM deals`; since no code reads these property
-- names, their absence is unobservable.
--
-- THE PER-DELIVERABLE PRICES GO TOO (2026-08-15, Paul: "this was when I was
-- selling the app. not relevant any more").
--
-- An earlier draft of this migration kept them, on the stated grounds that
-- "per-deliverable pricing is a live part of the model". That was wrong twice
-- over. THE LINE v2 rule 1 is that NOTHING IN THE APP CHARGES MONEY — the app
-- is Paul's private instrument and will never be sold — so there is no model
-- for a price to be a live part of. And it is not live in the mechanical sense
-- either: `base_price_cents` is read by `menuCatalogService.ts` and nowhere
-- else, every one of that service's four price-bearing exports has ZERO call
-- sites, its only importer (`chat.ts`) imports `getGateMenuItems` and never
-- calls it, and no client code mentions a price at all. $125–$700 sitting in a
-- column nothing reads.
--
-- THE TABLE STAYS, and that distinction is the whole care here: `menu_items` is
-- the deliverable CATALOG — slug, name, journey, gate — and it is joined in 38
-- places across documentShareService, dealFreshnessService, deliverableProcessor
-- and reviewService. Dropping the table would take out document sharing and
-- deliverable generation. Only the price column is dead.
--
-- `tier` (analyst/associate/vp) goes with it: it exists to say which
-- subscription tier could buy the item, which is the same retired question.

DROP TABLE IF EXISTS platform_fee_schedule;

ALTER TABLE deals DROP COLUMN IF EXISTS platform_fee_cents;
ALTER TABLE deals DROP COLUMN IF EXISTS platform_fee_paid;
ALTER TABLE deals DROP COLUMN IF EXISTS platform_fee_paid_at;
ALTER TABLE deals DROP COLUMN IF EXISTS stripe_payment_intent_id;
ALTER TABLE deals DROP COLUMN IF EXISTS execution_stripe_id;

-- 033's other two tables go as well (2026-08-15, Paul: "this is old from when
-- I was going to sell the app - not relevant any more"). An earlier draft
-- deferred them on the grounds that neither prices by deal size and so neither
-- was "in scope" — true of the narrow fee-ladder framing, and beside the point
-- once the framing is the product era itself.
--
-- `advisor_subscriptions` has ZERO references in the tree. `referrals` has
-- eight, and every one of them is PROSE: definitiveMcp and the agency registry
-- describing what the practice does NOT do ("no referrals, never paid
-- matching"). The one that looks like a read, providers.ts, is
-- `service_referrals` — a different table, migration 021, the live typed
-- register of attorneys and CPAs. Grepping `referrals` finds both; only one is
-- dead, and deleting the wrong one would take out the specialist register THE
-- LINE depends on.

-- The wallet-era pricing columns. `menu_items` itself is load-bearing; these
-- two columns are not. Dropped AFTER the deals columns above so a failure here
-- cannot leave the fee ladder half-removed.
ALTER TABLE menu_items DROP COLUMN IF EXISTS base_price_cents;
ALTER TABLE menu_items DROP COLUMN IF EXISTS tier;

-- `wallets` and `wallet_transactions`, from the same 006 migration that created
-- menu_items. THE LINE v2 rule 2: "WALLET IS DEAD. walletService,
-- paywallService, dealExecutionFee, platformFeeService deleted. Never
-- recreate." The services went; the tables did not, and no migration has ever
-- dropped them. `wallet_transactions` has zero references in the tree and
-- `wallets` has exactly one — a string inside an agency-action DESCRIPTION
-- promising the practice operates "without wallets", which is prose about the
-- absence of the thing, not a read of it.
--
-- Dropped in dependency order: the child table first, because
-- wallet_transactions carries a foreign key to wallets and the reverse order
-- fails.
DROP TABLE IF EXISTS wallet_transactions;
DROP TABLE IF EXISTS wallets;

DROP TABLE IF EXISTS advisor_subscriptions;
DROP TABLE IF EXISTS referrals;
