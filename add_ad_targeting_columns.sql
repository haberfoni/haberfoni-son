-- Add target_page and target_category columns to the ads table if they don't exist
ALTER TABLE ads ADD COLUMN IF NOT EXISTS target_page TEXT DEFAULT 'all';
ALTER TABLE ads ADD COLUMN IF NOT EXISTS target_category TEXT DEFAULT NULL;

-- Optional: Add index for performance if you have many ads
CREATE INDEX IF NOT EXISTS idx_ads_target_page ON ads(target_page);
CREATE INDEX IF NOT EXISTS idx_ads_target_category ON ads(target_category);
