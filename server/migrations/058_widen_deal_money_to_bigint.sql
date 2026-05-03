-- 058_widen_deal_money_to_bigint.sql
-- Widen deal money columns from int4 to int8.
-- int4 max ($21,474,836.47 in cents) was a hard ceiling for L4-L6 deals.
-- All values are stored in cents per CLAUDE.md; bigint preserves that
-- contract for mega-cap acquisitions.

ALTER TABLE deals ALTER COLUMN revenue       TYPE bigint USING revenue::bigint;
ALTER TABLE deals ALTER COLUMN sde           TYPE bigint USING sde::bigint;
ALTER TABLE deals ALTER COLUMN ebitda        TYPE bigint USING ebitda::bigint;
ALTER TABLE deals ALTER COLUMN asking_price  TYPE bigint USING asking_price::bigint;
