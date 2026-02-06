-- Fix AA Gündem mapping to use correct RSS feed URL
UPDATE bot_category_mappings
SET source_url = 'https://www.aa.com.tr/tr/rss/default?cat=guncel'
WHERE source_name = 'AA' 
  AND target_category_slug = 'gundem'
  AND source_url = 'https://www.aa.com.tr/tr/gundem';

-- Verify the update
SELECT * FROM bot_category_mappings WHERE source_name = 'AA';
