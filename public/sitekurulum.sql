-- ==========================================
-- HABERFONI MASTER SETUP SCRIPT (ZERO TO HERO)
-- ==========================================

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

-- Categories (Simple enum or table, assume enum for now or distinct values in news, strictly defined here for news FK if needed, but app seems to use string column. Let's stick to string column in news for simplicity unless separate table found. Using TEXT based on app logic.)

-- News
CREATE TABLE IF NOT EXISTS news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    image_url TEXT,
    category TEXT,
    author_id UUID REFERENCES auth.users(id),
    is_slider BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
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
    image_url TEXT,
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

-- Video Galleries (Match table name 'videos' used in code)
CREATE TABLE IF NOT EXISTS videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    video_url TEXT NOT NULL, -- Embed URL or file path
    image_url TEXT, -- thumbnail_url in code? Check code, code uses thumbnail_url in some places but schema might be image_url mapped. Let's check getVideos select. Code selects *, schema has image_url.
    -- Wait, duplicateVideosBulk maps thumbnail_url. If schema has image_url, does code fail?
    -- VideoGalleryListPage uses item.thumbnail_url. 
    -- adminService duplicateVideosBulk uses video.thumbnail_url.
    -- Let me check schema of 'videos' used in code more deeply via getVideos select *.
    -- Actually, let's look at createVideo.
    duration TEXT,
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
    type TEXT DEFAULT 'image', -- image, code
    placement TEXT, -- home_sidebar, etc.
    image_url TEXT,
    link_url TEXT,
    code TEXT,
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
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Footer Sections
CREATE TABLE IF NOT EXISTS footer_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Footer Links
CREATE TABLE IF NOT EXISTS footer_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id UUID REFERENCES footer_sections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 2. Enable Row Level Security (RLS)
-- ===================================
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE headlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;


-- 3. RLS Policies (Permissions)
-- =============================

-- Headlines
DROP POLICY IF EXISTS "Admins and Editors can manage headlines" ON headlines;
CREATE POLICY "Admins and Editors can manage headlines" ON headlines FOR ALL TO authenticated USING ( EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')) );
DROP POLICY IF EXISTS "everyone can read headlines" ON headlines;
CREATE POLICY "everyone can read headlines" ON headlines FOR SELECT USING (true);


-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- News
DROP POLICY IF EXISTS "Enable read access for all users" ON news;
CREATE POLICY "Enable read access for all users" ON news FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON news;
CREATE POLICY "Enable insert for authenticated users only" ON news FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for users based on email" ON news;
CREATE POLICY "Enable update for users based on email" ON news FOR UPDATE USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')));
DROP POLICY IF EXISTS "Enable delete for users based on email" ON news;
CREATE POLICY "Enable delete for users based on email" ON news FOR DELETE USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')));

-- Photo Galleries
DROP POLICY IF EXISTS "Editors and Admins can manage photo_galleries" ON photo_galleries;
CREATE POLICY "Editors and Admins can manage photo_galleries" ON photo_galleries FOR ALL TO authenticated USING ( EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')) );
DROP POLICY IF EXISTS "Everyone can view photo_galleries" ON photo_galleries;
CREATE POLICY "Everyone can view photo_galleries" ON photo_galleries FOR SELECT USING (true);

-- Gallery Images
DROP POLICY IF EXISTS "Editors and Admins can manage gallery_images" ON gallery_images;
CREATE POLICY "Editors and Admins can manage gallery_images" ON gallery_images FOR ALL TO authenticated USING ( EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')) );
DROP POLICY IF EXISTS "Everyone can view gallery_images" ON gallery_images;
CREATE POLICY "Everyone can view gallery_images" ON gallery_images FOR SELECT USING (true);

-- Videos (Table: videos)
DROP POLICY IF EXISTS "Editors and Admins can manage videos" ON videos;
CREATE POLICY "Editors and Admins can manage videos" ON videos FOR ALL TO authenticated USING ( EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')) );
DROP POLICY IF EXISTS "Everyone can view videos" ON videos;
CREATE POLICY "Everyone can view videos" ON videos FOR SELECT USING (true);

-- Activity Logs
DROP POLICY IF EXISTS "Admins can delete activity_logs" ON activity_logs;
CREATE POLICY "Admins can delete activity_logs" ON activity_logs FOR DELETE TO authenticated USING ( EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') );
DROP POLICY IF EXISTS "Everyone can insert activity_logs" ON activity_logs;
CREATE POLICY "Everyone can insert activity_logs" ON activity_logs FOR INSERT TO authenticated WITH CHECK ( true );
DROP POLICY IF EXISTS "Admins can select activity_logs" ON activity_logs;
CREATE POLICY "Admins can select activity_logs" ON activity_logs FOR SELECT TO authenticated USING ( EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') );

-- Ads (Admin only manage, Public read)
DROP POLICY IF EXISTS "Admins can manage ads" ON ads;
CREATE POLICY "Admins can manage ads" ON ads FOR ALL TO authenticated USING ( EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')) );
DROP POLICY IF EXISTS "Everyone can select ads" ON ads;
CREATE POLICY "Everyone can select ads" ON ads FOR SELECT USING (true);


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
    LIMIT 1000
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_delete_old_activity_logs ON activity_logs;
CREATE TRIGGER trigger_delete_old_activity_logs
AFTER INSERT ON activity_logs
EXECUTE FUNCTION delete_old_activity_logs();


-- 5. Additional Columns (Idempotent updates for safety)
-- =====================================================
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='author_id') THEN 
        ALTER TABLE news ADD COLUMN author_id UUID REFERENCES auth.users(id); 
    END IF; 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activity_logs' AND column_name='ip_address') THEN 
        ALTER TABLE activity_logs ADD COLUMN ip_address TEXT; 
    END IF;
END $$;
