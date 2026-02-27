-- Notifications & Engagement system

-- In-app notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'gate_advance', 'deliverable_ready', 'invitation', 'comment', 'nudge', 'system'
  title VARCHAR(255) NOT NULL,
  body TEXT,
  action_url VARCHAR(500), -- deep link (e.g., /chat?deal=123)
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;

-- Follow-up rules (configurable nudges)
CREATE TABLE IF NOT EXISTS follow_up_rules (
  id SERIAL PRIMARY KEY,
  trigger_type VARCHAR(50) NOT NULL, -- 'gate_stall', 'paywall_abandon', 'deliverable_complete', 'inactivity'
  journey_type VARCHAR(10), -- NULL = all journeys
  gate VARCHAR(10), -- NULL = all gates
  delay_hours INTEGER NOT NULL DEFAULT 24, -- hours after trigger before sending
  title_template VARCHAR(255) NOT NULL,
  body_template TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Follow-up queue (pending sends)
CREATE TABLE IF NOT EXISTS follow_up_queue (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
  rule_id INTEGER REFERENCES follow_up_rules(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_follow_up_pending ON follow_up_queue(scheduled_at) WHERE sent_at IS NULL AND cancelled_at IS NULL;

-- Seed default follow-up rules
INSERT INTO follow_up_rules (trigger_type, journey_type, gate, delay_hours, title_template, body_template) VALUES
  ('gate_stall', NULL, NULL, 48, 'Ready to continue?', 'You were making great progress on your deal. Let''s pick up where we left off.'),
  ('paywall_abandon', NULL, 'S2', 24, 'Your valuation is waiting', 'You''re one step away from seeing your full business valuation. The report takes less than a minute to generate.'),
  ('paywall_abandon', NULL, 'B2', 24, 'Ready to value your target?', 'You''ve completed your sourcing research. Let''s build your acquisition valuation model.'),
  ('paywall_abandon', NULL, 'R2', 24, 'Investors are waiting', 'Your investor materials package is ready to be generated. This is what gets you in front of capital.'),
  ('deliverable_complete', NULL, NULL, 2, 'Your deliverable is ready', 'Your {{deliverable_name}} has been generated and is ready to review in your data room.'),
  ('inactivity', NULL, NULL, 168, 'We miss you', 'It''s been a while since you last worked on your deal. Your data and progress are exactly where you left them.')
ON CONFLICT DO NOTHING;
