-- Add description column if it doesn't exist
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS description text;

-- Add views column if it doesn't exist (for view counting)
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS views bigint DEFAULT 0;
