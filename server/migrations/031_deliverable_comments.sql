-- Deliverable comments/annotations
CREATE TABLE IF NOT EXISTS deliverable_comments (
  id SERIAL PRIMARY KEY,
  deliverable_id INTEGER NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  section_ref TEXT,          -- optional: heading or section ID the comment is attached to
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliverable_comments_deliverable ON deliverable_comments(deliverable_id);
CREATE INDEX IF NOT EXISTS idx_deliverable_comments_user ON deliverable_comments(user_id);
