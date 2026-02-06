-- Create bot_category_mappings table
CREATE TABLE IF NOT EXISTS bot_category_mappings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_name TEXT NOT NULL, -- 'AA', 'DHA', 'IHA'
    source_url TEXT NOT NULL,
    target_category_slug TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE bot_category_mappings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public Read Bot Mappings" ON bot_category_mappings FOR SELECT USING (true);
CREATE POLICY "Admin Write Bot Mappings" ON bot_category_mappings FOR ALL TO authenticated USING (true) WITH CHECK (true);
