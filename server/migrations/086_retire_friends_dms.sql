-- Retire FR-1 global friends/DMs. Wrong model: chat is deal-centric, handled by
-- deal_participants (request/accept via accepted_at) + deal_messages, not a
-- global friend graph + 1:1 DMs. These tables were never wired to any UI, so
-- the drop is data-safe. Drop in FK order: messages -> threads, then connections.
DROP TABLE IF EXISTS direct_messages;
DROP TABLE IF EXISTS direct_threads;
DROP TABLE IF EXISTS connections;
