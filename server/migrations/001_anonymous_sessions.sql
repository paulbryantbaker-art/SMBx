-- Anonymous sessions: persistent PostgreSQL storage for pre-auth chat
CREATE TABLE IF NOT EXISTS anonymous_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(36) NOT NULL UNIQUE,
  ip VARCHAR(45) NOT NULL,
  source_page VARCHAR(50),
  messages JSONB DEFAULT '[]'::jsonb,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  last_active_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  converted_to_user_id INTEGER REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_anon_sessions_session_id ON anonymous_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_anon_sessions_ip_created ON anonymous_sessions(ip, created_at);
CREATE INDEX IF NOT EXISTS idx_anon_sessions_expires ON anonymous_sessions(expires_at);

-- Allow anonymous conversations (nullable user_id)
ALTER TABLE conversations ALTER COLUMN user_id DROP NOT NULL;
