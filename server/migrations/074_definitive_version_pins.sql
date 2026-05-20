-- 074: DEFINITIVE version pins
-- Adds explicit spec/methodology pinning to durable runtime records so model
-- executions, Studio versions/exports, model stacks, and audit rows can be
-- reproduced by version + input hash.

ALTER TABLE audit_trail
  ADD COLUMN IF NOT EXISTS spec_version TEXT NOT NULL DEFAULT 'DEFINITIVE.v1.0',
  ADD COLUMN IF NOT EXISTS spec_uri TEXT NOT NULL DEFAULT 'definitive://v1',
  ADD COLUMN IF NOT EXISTS methodology_version TEXT NOT NULL DEFAULT 'V19',
  ADD COLUMN IF NOT EXISTS methodology_uri TEXT NOT NULL DEFAULT 'methodology://v19';

ALTER TABLE model_executions
  ADD COLUMN IF NOT EXISTS spec_version TEXT NOT NULL DEFAULT 'DEFINITIVE.v1.0',
  ADD COLUMN IF NOT EXISTS spec_uri TEXT NOT NULL DEFAULT 'definitive://v1',
  ADD COLUMN IF NOT EXISTS methodology_version TEXT NOT NULL DEFAULT 'V19',
  ADD COLUMN IF NOT EXISTS methodology_uri TEXT NOT NULL DEFAULT 'methodology://v19';

ALTER TABLE studio_book_versions
  ADD COLUMN IF NOT EXISTS spec_version TEXT NOT NULL DEFAULT 'DEFINITIVE.v1.0',
  ADD COLUMN IF NOT EXISTS spec_uri TEXT NOT NULL DEFAULT 'definitive://v1',
  ADD COLUMN IF NOT EXISTS methodology_version TEXT NOT NULL DEFAULT 'V19',
  ADD COLUMN IF NOT EXISTS methodology_uri TEXT NOT NULL DEFAULT 'methodology://v19';

ALTER TABLE studio_exports
  ADD COLUMN IF NOT EXISTS spec_version TEXT NOT NULL DEFAULT 'DEFINITIVE.v1.0',
  ADD COLUMN IF NOT EXISTS spec_uri TEXT NOT NULL DEFAULT 'definitive://v1',
  ADD COLUMN IF NOT EXISTS methodology_version TEXT NOT NULL DEFAULT 'V19',
  ADD COLUMN IF NOT EXISTS methodology_uri TEXT NOT NULL DEFAULT 'methodology://v19';

ALTER TABLE deal_model_stack
  ADD COLUMN IF NOT EXISTS spec_version TEXT NOT NULL DEFAULT 'DEFINITIVE.v1.0',
  ADD COLUMN IF NOT EXISTS spec_uri TEXT NOT NULL DEFAULT 'definitive://v1',
  ADD COLUMN IF NOT EXISTS methodology_version TEXT NOT NULL DEFAULT 'V19',
  ADD COLUMN IF NOT EXISTS methodology_uri TEXT NOT NULL DEFAULT 'methodology://v19';

CREATE INDEX IF NOT EXISTS idx_audit_trail_spec_version
  ON audit_trail(spec_version, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_model_executions_spec_version
  ON model_executions(spec_version, model_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_studio_exports_spec_version
  ON studio_exports(spec_version, created_at DESC);
