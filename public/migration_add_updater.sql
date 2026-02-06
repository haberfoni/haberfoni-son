-- Add updater_id column to news table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='updater_id') THEN 
        ALTER TABLE news ADD COLUMN updater_id UUID REFERENCES auth.users(id); 
    END IF; 
END $$;
