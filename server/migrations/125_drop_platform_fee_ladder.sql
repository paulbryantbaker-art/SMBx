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
-- The wallet-era `menu_items` per-deliverable prices seeded by 036:9-15 are
-- DELIBERATELY LEFT ALONE. Per-deliverable pricing is a live part of the model;
-- only the deal-SIZE ladder is the problem here.

DROP TABLE IF EXISTS platform_fee_schedule;

ALTER TABLE deals DROP COLUMN IF EXISTS platform_fee_cents;
ALTER TABLE deals DROP COLUMN IF EXISTS platform_fee_paid;
ALTER TABLE deals DROP COLUMN IF EXISTS platform_fee_paid_at;
ALTER TABLE deals DROP COLUMN IF EXISTS stripe_payment_intent_id;
ALTER TABLE deals DROP COLUMN IF EXISTS execution_stripe_id;

-- 033 also created `advisor_subscriptions` and `referrals`. Both are dead (no
-- write site in any live code path) but neither prices by deal size, so neither
-- is in scope for this migration. Left in place deliberately.
