-- Add new columns to transactions table for withdrawals
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS destination_address TEXT,
ADD COLUMN IF NOT EXISTS external_id TEXT,
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS network TEXT;

-- Add index for external_id to help with lookups
CREATE INDEX IF NOT EXISTS idx_transactions_external_id ON transactions(external_id); 