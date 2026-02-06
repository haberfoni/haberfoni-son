-- Delete AA news created today to allow re-scraping
DELETE FROM news 
WHERE source = 'AA' 
AND created_at > current_date;
