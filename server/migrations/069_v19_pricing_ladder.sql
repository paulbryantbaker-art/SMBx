-- 069: V19 pricing ladder
-- Move runtime plan names from Starter/Professional to Solo/Pro, add Team, and
-- keep historical rows normalized before tightening the subscription constraint.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_plan_check'
  ) THEN
    ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_plan_check;
  END IF;
END $$;

UPDATE users SET plan = 'solo' WHERE plan = 'starter';
UPDATE users SET plan = 'pro' WHERE plan = 'professional';

UPDATE subscriptions SET plan = 'solo' WHERE plan = 'starter';
UPDATE subscriptions SET plan = 'pro' WHERE plan = 'professional';

ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('free', 'solo', 'pro', 'team', 'enterprise'));
