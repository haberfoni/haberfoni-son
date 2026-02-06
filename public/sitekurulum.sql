-- ==========================================
-- HABERFONI MASTER SETUP SCRIPT
-- ==========================================
-- This script sets up the complete database schema for Haberfoni.
-- It includes Tables, RLS Policies, Triggers, and Default Data.

-- 1. Create Tables (Schema)
-- =========================

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'editor', 'author', 'user')) DEFAULT 'user',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- News
CREATE TABLE IF NOT EXISTS news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT,
    content TEXT,
    image_url TEXT,
    category TEXT, -- Legacy string column
    category_id UUID REFERENCES categories(id), -- Future proofing
    author_id UUID REFERENCES auth.users(id),
    updater_id UUID REFERENCES auth.users(id), -- Added missing column
    is_slider BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    views INTEGER DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Photo Galleries
CREATE TABLE IF NOT EXISTS photo_galleries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT,
    image_url TEXT,
    views INTEGER DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT,
    is_active BOOLEAN DEFAULT true,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Gallery Images
CREATE TABLE IF NOT EXISTS gallery_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gallery_id UUID REFERENCES photo_galleries(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Video Galleries
CREATE TABLE IF NOT EXISTS videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    video_url TEXT NOT NULL, -- Youtube embed or MP4 path
    image_url TEXT, 
    thumbnail_url TEXT, 
    description TEXT,
    duration TEXT,
    views INTEGER DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT,
    is_active BOOLEAN DEFAULT true,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Headlines (Manşet Order)
CREATE TABLE IF NOT EXISTS headlines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    news_id UUID REFERENCES news(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    type TEXT DEFAULT 'news', -- news or ad
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ads
CREATE TABLE IF NOT EXISTS ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'image', -- image, code, adsense
    placement_code TEXT, -- home_sidebar, home_horizontal, etc.
    image_url TEXT,
    link_url TEXT,
    code TEXT,
    device_type TEXT DEFAULT 'all', -- all, mobile, desktop
    target_page TEXT DEFAULT 'all', -- all, home, category, detail
    target_news_id UUID REFERENCES news(id),
    is_headline BOOLEAN DEFAULT false,
    headline_slot INTEGER,
    width INTEGER,
    height INTEGER,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action_type TEXT, -- CREATE, UPDATE, DELETE, LOGIN
    entity_type TEXT, -- NEWS, USER, ADS...
    entity_id TEXT,
    description TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Subscribers
CREATE TABLE IF NOT EXISTS subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    subject TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    news_id UUID REFERENCES news(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    comment TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pages (Static/Dynamic content)
CREATE TABLE IF NOT EXISTS pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    meta_title TEXT,
    meta_description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Footer Sections
CREATE TABLE IF NOT EXISTS footer_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT DEFAULT 'custom_links', -- custom_links, dynamic_categories
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Footer Links
CREATE TABLE IF NOT EXISTS footer_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id UUID REFERENCES footer_sections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    open_in_new_tab BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Redirects
CREATE TABLE IF NOT EXISTS redirects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_url TEXT NOT NULL,
    target_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 2. Enable Row Level Security (RLS)
-- ===================================
DO $$ 
DECLARE 
    tables TEXT[] := ARRAY['news', 'categories', 'photo_galleries', 'gallery_images', 'videos', 'headlines', 'activity_logs', 'profiles', 'ads', 'pages', 'subscribers', 'contact_messages', 'comments', 'footer_sections', 'footer_links', 'site_settings', 'tags', 'redirects'];
    t TEXT;
BEGIN 
    FOREACH t IN ARRAY tables LOOP 
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t); 
    END LOOP; 
END $$;


-- 3. RLS Policies (Permissions)
-- =============================

-- Generic Public Read Policy (Applied to most public content)
DO $$ 
DECLARE 
    tables TEXT[] := ARRAY['news', 'categories', 'photo_galleries', 'gallery_images', 'videos', 'headlines', 'ads', 'pages', 'footer_sections', 'footer_links', 'site_settings', 'tags', 'redirects', 'comments'];
    t TEXT;
BEGIN 
    FOREACH t IN ARRAY tables LOOP 
        EXECUTE format('DROP POLICY IF EXISTS "Public Read %s" ON %I', t, t); 
        EXECUTE format('CREATE POLICY "Public Read %s" ON %I FOR SELECT USING (true)', t, t); 
    END LOOP; 
END $$;

-- Admin/Editor Full Access Policy
DO $$ 
DECLARE 
    tables TEXT[] := ARRAY['news', 'categories', 'photo_galleries', 'gallery_images', 'videos', 'headlines', 'ads', 'pages', 'footer_sections', 'footer_links', 'site_settings', 'tags', 'redirects', 'subscribers', 'contact_messages', 'comments'];
    t TEXT;
BEGIN 
    FOREACH t IN ARRAY tables LOOP 
        EXECUTE format('DROP POLICY IF EXISTS "Admin Write %s" ON %I', t, t); 
        EXECUTE format('CREATE POLICY "Admin Write %s" ON %I FOR ALL TO authenticated USING ( EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN (''admin'', ''editor'')) )', t, t); 
    END LOOP; 
END $$;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles view" ON profiles;
CREATE POLICY "Public profiles view" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage profiles" ON profiles;
CREATE POLICY "Admins can manage profiles" ON profiles FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Subscriber Insert
DROP POLICY IF EXISTS "Public Subscribe" ON subscribers;
CREATE POLICY "Public Subscribe" ON subscribers FOR INSERT WITH CHECK (true);

-- Contact Message Insert
DROP POLICY IF EXISTS "Public Contact Message" ON contact_messages;
CREATE POLICY "Public Contact Message" ON contact_messages FOR INSERT WITH CHECK (true);

-- Comment Insert
DROP POLICY IF EXISTS "Public Comment" ON comments;
CREATE POLICY "Public Comment" ON comments FOR INSERT WITH CHECK (true);

-- News specific: Authors can manage own news
DROP POLICY IF EXISTS "Authors can manage own news" ON news;
CREATE POLICY "Authors can manage own news" ON news FOR ALL USING (auth.uid() = author_id);


-- 4. Triggers (Auto Cleanup)
-- ==========================
CREATE OR REPLACE FUNCTION delete_old_activity_logs()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM activity_logs
  WHERE id NOT IN (
    SELECT id
    FROM activity_logs
    ORDER BY created_at DESC
    LIMIT 2000
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_delete_old_activity_logs ON activity_logs;
CREATE TRIGGER trigger_delete_old_activity_logs
AFTER INSERT ON activity_logs
EXECUTE FUNCTION delete_old_activity_logs();


-- 5. Default Data
-- ==========================
INSERT INTO site_settings (key, value) VALUES 
('site_title', 'Haberfoni'), 
('site_description', 'En güncel haberler'),
('theme_color', 'red')
ON CONFLICT (key) DO NOTHING;

INSERT INTO categories (name, slug, order_index) VALUES
('Gündem', 'gundem', 1),
('Ekonomi', 'ekonomi', 2),
('Spor', 'spor', 3),
('Dünya', 'dunya', 4),
('Teknoloji', 'teknoloji', 5),
('Sağlık', 'saglik', 6),
('Magazin', 'magazin', 7)
ON CONFLICT (slug) DO NOTHING;
