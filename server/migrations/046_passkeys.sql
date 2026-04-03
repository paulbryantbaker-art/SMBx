-- 046: Passkeys — WebAuthn/FIDO2 passwordless authentication
-- Used for login, NDA signing, document execution, review approval

CREATE TABLE IF NOT EXISTS passkeys (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  device_type VARCHAR(20),
  -- 'singleDevice' | 'multiDevice'
  backed_up BOOLEAN NOT NULL DEFAULT false,
  transports TEXT[],
  -- ['internal', 'usb', 'ble', 'nfc']
  name VARCHAR(100),
  -- User-friendly name: "Paul's MacBook", "iPhone 15"
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_passkeys_user ON passkeys(user_id);
CREATE INDEX IF NOT EXISTS idx_passkeys_credential ON passkeys(credential_id);

-- Challenges table for WebAuthn registration/authentication
CREATE TABLE IF NOT EXISTS webauthn_challenges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  challenge TEXT NOT NULL,
  type VARCHAR(20) NOT NULL,
  -- 'registration' | 'authentication' | 'nda_sign' | 'doc_execute' | 'review_approve'
  context JSONB,
  -- { dealId, documentId, action, ... }
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenges_user ON webauthn_challenges(user_id, type) WHERE NOT used;

-- Track passkey-verified actions for audit trail
CREATE TABLE IF NOT EXISTS passkey_verifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  passkey_id INTEGER NOT NULL REFERENCES passkeys(id),
  action VARCHAR(50) NOT NULL,
  -- 'login' | 'nda_sign' | 'doc_execute' | 'review_approve' | 'share_auth'
  context JSONB,
  -- { dealId, documentId, ip, userAgent, ... }
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verifications_user ON passkey_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_action ON passkey_verifications(action, verified_at DESC);
