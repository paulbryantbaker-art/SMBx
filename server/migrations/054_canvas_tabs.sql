-- Persistent canvas tabs tied to conversations
-- Tabs survive refresh, navigation, and reconnects

CREATE TABLE IF NOT EXISTS canvas_tabs (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  tab_id TEXT NOT NULL,           -- client-side ID (e.g. 'pipeline', 'deliverable-42', 'md-1234')
  type TEXT NOT NULL,             -- 'pipeline', 'documents', 'model', 'deliverable', etc.
  label TEXT NOT NULL,
  props JSONB DEFAULT '{}'::jsonb,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (conversation_id, tab_id)
);

CREATE INDEX IF NOT EXISTS idx_canvas_tabs_conversation ON canvas_tabs(conversation_id, position);
