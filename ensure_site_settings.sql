-- Create site_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.site_settings (
    key text PRIMARY KEY,
    value text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to all settings (needed for SEO, robots.txt, etc.)
CREATE POLICY "Allow public read access"
    ON public.site_settings
    FOR SELECT
    USING (true);

-- Policy: Allow authenticated users (admins) to insert/update/delete
CREATE POLICY "Allow admin full access"
    ON public.site_settings
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
