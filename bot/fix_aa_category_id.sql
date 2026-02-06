-- Fix existing AA news to add category_id
-- This will make them appear in the gündem category page

-- Update all AA news with gundem category to have the correct category_id
UPDATE news
SET category_id = (
    SELECT id FROM categories WHERE slug = 'gundem'
)
WHERE source = 'AA' 
  AND category = 'gundem'
  AND category_id IS NULL;

-- Verify the update
SELECT id, title, category, category_id, source
FROM news
WHERE source = 'AA'
ORDER BY created_at DESC
LIMIT 10;
