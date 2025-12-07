-- Add description column to photo_galleries table
ALTER TABLE public.photo_galleries 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Refresh the schema cache if necessary (optional comment)
-- NOTIFY pgrst, 'reload schema';
