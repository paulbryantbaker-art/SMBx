-- DEFINITIVE OAuth bridge for remote MCP connector authorization.

CREATE TABLE IF NOT EXISTS definitive_oauth_clients (
  id SERIAL PRIMARY KEY,
  client_id TEXT NOT NULL UNIQUE,
  client_name TEXT,
  client_uri TEXT,
  logo_uri TEXT,
  redirect_uris JSONB NOT NULL DEFAULT '[]'::jsonb,
  grant_types JSONB NOT NULL DEFAULT '["authorization_code"]'::jsonb,
  response_types JSONB NOT NULL DEFAULT '["code"]'::jsonb,
  token_endpoint_auth_method TEXT NOT NULL DEFAULT 'none',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS definitive_oauth_authorization_codes (
  code TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  resource TEXT NOT NULL,
  scopes TEXT[] NOT NULL,
  code_challenge TEXT NOT NULL,
  code_challenge_method TEXT NOT NULL DEFAULT 'S256',
  agent_platform_id TEXT,
  mandate_id TEXT,
  expires_at TIMESTAMP NOT NULL,
  consumed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_definitive_oauth_codes_client
  ON definitive_oauth_authorization_codes(client_id);

CREATE INDEX IF NOT EXISTS idx_definitive_oauth_codes_expires
  ON definitive_oauth_authorization_codes(expires_at)
  WHERE consumed_at IS NULL;
