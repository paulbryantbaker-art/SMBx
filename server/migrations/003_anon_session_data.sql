ALTER TABLE anonymous_sessions ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;
