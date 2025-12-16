-- Add SEO columns to 'news' table
ALTER TABLE news ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE news ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE news ADD COLUMN IF NOT EXISTS seo_keywords TEXT;

-- Add SEO columns to 'videos' table (Video Galleries)
ALTER TABLE videos ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS seo_keywords TEXT;

-- Add SEO columns to 'photo_galleries' table
ALTER TABLE photo_galleries ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE photo_galleries ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE photo_galleries ADD COLUMN IF NOT EXISTS seo_keywords TEXT;
