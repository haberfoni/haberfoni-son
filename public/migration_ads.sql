-- Add is_manset_2 and manset_2_slot columns to ads table if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ads' AND column_name='is_manset_2') THEN 
        ALTER TABLE ads ADD COLUMN is_manset_2 BOOLEAN DEFAULT false; 
    END IF; 

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ads' AND column_name='manset_2_slot') THEN 
        ALTER TABLE ads ADD COLUMN manset_2_slot INTEGER; 
    END IF; 

    -- Also ensure is_headline exists just in case
     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ads' AND column_name='is_headline') THEN 
        ALTER TABLE ads ADD COLUMN is_headline BOOLEAN DEFAULT false; 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ads' AND column_name='headline_slot') THEN 
        ALTER TABLE ads ADD COLUMN headline_slot INTEGER; 
    END IF;
END $$;
