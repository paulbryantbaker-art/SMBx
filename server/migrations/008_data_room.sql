-- Data Room: folders and documents per deal
CREATE TABLE IF NOT EXISTS data_room_folders (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  gate VARCHAR(10),        -- which gate unlocks this folder (NULL = always visible)
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_folders_deal_name ON data_room_folders(deal_id, name);
CREATE INDEX IF NOT EXISTS idx_folders_deal ON data_room_folders(deal_id);

CREATE TABLE IF NOT EXISTS data_room_documents (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  folder_id INTEGER REFERENCES data_room_folders(id) ON DELETE SET NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  deliverable_id INTEGER REFERENCES deliverables(id) ON DELETE SET NULL, -- NULL for uploaded docs
  name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),       -- pdf, docx, xlsx, image, etc.
  file_url TEXT,                -- storage URL for uploaded files
  file_size INTEGER,            -- bytes
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, review, approved, locked
  version INTEGER NOT NULL DEFAULT 1,
  parent_doc_id INTEGER REFERENCES data_room_documents(id), -- for version chains
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_docs_deal ON data_room_documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_docs_folder ON data_room_documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_docs_deliverable ON data_room_documents(deliverable_id);
