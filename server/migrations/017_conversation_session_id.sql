-- Add session_id to conversations for anonymous session tracking
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS session_id VARCHAR(36);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
