-- Collaboration & RBAC: deal participants, invitations, day passes, deal messages

-- Deal participants (who has access to a deal and what role)
CREATE TABLE IF NOT EXISTS deal_participants (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'owner', -- owner, attorney, cpa, broker, lender, consultant, counterparty
  access_level VARCHAR(20) NOT NULL DEFAULT 'full', -- full, comment, read
  folder_scope INTEGER[] DEFAULT NULL, -- NULL = all folders, array = specific folder IDs
  invited_by INTEGER REFERENCES users(id),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(deal_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_participants_deal ON deal_participants(deal_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON deal_participants(user_id);

-- Deal invitations (pending invites)
CREATE TABLE IF NOT EXISTS deal_invitations (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'consultant',
  access_level VARCHAR(20) NOT NULL DEFAULT 'read',
  folder_scope INTEGER[] DEFAULT NULL,
  token VARCHAR(64) NOT NULL UNIQUE,
  invited_by INTEGER NOT NULL REFERENCES users(id),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invitations_token ON deal_invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON deal_invitations(email);

-- Day passes (time-limited access for external advisors)
CREATE TABLE IF NOT EXISTS day_passes (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  token VARCHAR(64) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'consultant',
  access_level VARCHAR(20) NOT NULL DEFAULT 'read',
  folder_scope INTEGER[] DEFAULT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id),
  first_accessed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ, -- set on first access: first_accessed_at + 48 hours
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_day_passes_token ON day_passes(token);

-- Deal messages (scoped communication between participants)
CREATE TABLE IF NOT EXISTS deal_messages (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  parent_id INTEGER REFERENCES deal_messages(id), -- for threading
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deal_messages_deal ON deal_messages(deal_id);

-- Activity log for audit trail
CREATE TABLE IF NOT EXISTS deal_activity_log (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(50) NOT NULL, -- 'invited', 'joined', 'viewed_doc', 'uploaded', 'commented', 'role_changed', 'removed'
  target_type VARCHAR(30), -- 'document', 'folder', 'participant', 'message'
  target_id INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_deal ON deal_activity_log(deal_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON deal_activity_log(created_at DESC);
