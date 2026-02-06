-- Enable auto-publish for AA bot
-- This will make new AA news automatically published instead of drafts

UPDATE bot_settings
SET auto_publish = true
WHERE source_name = 'AA';

-- Verify the update
SELECT source_name, auto_publish, is_active
FROM bot_settings
ORDER BY source_name;
