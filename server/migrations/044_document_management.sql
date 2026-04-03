-- 044: Document Management — classification, TipTap content, legal execution, persistent storage
-- Adds doc_class to deliverables + data_room_documents
-- Extends data_room_documents with legal execution fields
-- Backfills existing deliverables based on menu_items slugs

-- ─── Deliverables: TipTap content + classification ───────────────────
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS tiptap_content JSONB;
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS doc_class VARCHAR(20);

-- ─── Data Room Documents: classification + legal execution ───────────
ALTER TABLE data_room_documents ADD COLUMN IF NOT EXISTS doc_class VARCHAR(20);
ALTER TABLE data_room_documents ADD COLUMN IF NOT EXISTS content_hash VARCHAR(64);
ALTER TABLE data_room_documents ADD COLUMN IF NOT EXISTS executed_at TIMESTAMPTZ;
ALTER TABLE data_room_documents ADD COLUMN IF NOT EXISTS execution_metadata JSONB;

-- ─── Backfill doc_class on deliverables ──────────────────────────────
UPDATE deliverables d SET doc_class = 'legal'
FROM menu_items m WHERE d.menu_item_id = m.id
AND m.slug IN ('loi-draft', 'loi-comparison', 'term-sheet-analysis', 'term-sheet-comparison', 'counter-proposal')
AND d.doc_class IS NULL;

UPDATE deliverables d SET doc_class = 'marketing'
FROM menu_items m WHERE d.menu_item_id = m.id
AND m.slug IN ('cim', 'blind-teaser', 'executive-summary', 'pitch-deck', 'outreach-messaging', 'outreach-strategy')
AND d.doc_class IS NULL;

UPDATE deliverables SET doc_class = 'working' WHERE doc_class IS NULL;

-- ─── Indexes ─────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_deliverables_doc_class ON deliverables(doc_class);
CREATE INDEX IF NOT EXISTS idx_deliverables_tiptap ON deliverables(id) WHERE tiptap_content IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_data_room_docs_doc_class ON data_room_documents(doc_class);
CREATE INDEX IF NOT EXISTS idx_data_room_docs_executed ON data_room_documents(executed_at) WHERE executed_at IS NOT NULL;
