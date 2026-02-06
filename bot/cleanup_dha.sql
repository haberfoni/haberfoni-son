-- Delete recent DHA news to allow re-scraping with new summary logic
DELETE FROM news 
WHERE source = 'DHA' 
AND created_at > NOW() - INTERVAL '3 days';
