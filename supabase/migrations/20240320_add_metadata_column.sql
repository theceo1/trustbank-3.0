-- Add metadata column to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Backfill existing rows with empty metadata
UPDATE user_profiles 
SET metadata = '{}'::jsonb 
WHERE metadata IS NULL; 