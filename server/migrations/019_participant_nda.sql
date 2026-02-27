-- Add NDA tracking column to deal_participants
ALTER TABLE deal_participants ADD COLUMN IF NOT EXISTS nda_signed_at TIMESTAMPTZ;
