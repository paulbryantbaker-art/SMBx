-- Friends (connections) + direct messages (async, notification-based — not realtime).
-- One canonical row per pair (user_a < user_b); requested_by captures direction.

CREATE TABLE IF NOT EXISTS connections (
  id SERIAL PRIMARY KEY,
  user_a INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,   -- LEAST(a,b)
  user_b INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,   -- GREATEST(a,b)
  status VARCHAR(20) NOT NULL DEFAULT 'pending',                    -- pending, accepted
  requested_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(user_a, user_b),
  CHECK (user_a < user_b)
);
CREATE INDEX IF NOT EXISTS idx_connections_a ON connections(user_a);
CREATE INDEX IF NOT EXISTS idx_connections_b ON connections(user_b);

-- 1:1 DM threads between two users (canonical pair).
CREATE TABLE IF NOT EXISTS direct_threads (
  id SERIAL PRIMARY KEY,
  user_a INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,   -- LEAST(a,b)
  user_b INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,   -- GREATEST(a,b)
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_a, user_b),
  CHECK (user_a < user_b)
);
CREATE INDEX IF NOT EXISTS idx_dthreads_a ON direct_threads(user_a);
CREATE INDEX IF NOT EXISTS idx_dthreads_b ON direct_threads(user_b);

CREATE TABLE IF NOT EXISTS direct_messages (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER NOT NULL REFERENCES direct_threads(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_dmessages_thread ON direct_messages(thread_id, created_at);
