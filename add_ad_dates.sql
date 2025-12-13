-- Add start_date and end_date columns to the ads table
ALTER TABLE ads 
ADD COLUMN IF NOT EXISTS start_date timestamptz DEFAULT NULL,
ADD COLUMN IF NOT EXISTS end_date timestamptz DEFAULT NULL;

-- Optional: Comment on columns
COMMENT ON COLUMN ads.start_date IS 'Reklamın yayına gireceği tarih (boşsa hemen)';
COMMENT ON COLUMN ads.end_date IS 'Reklamın yayından kalkacağı tarih (boşsa süresiz)';
