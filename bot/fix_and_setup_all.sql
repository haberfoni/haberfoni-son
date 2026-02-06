-- ============================================================
-- TAMİR VE KURULUM SCRİPTİ (fix_and_setup_all.sql)
-- Ana sayfa hatalarını giderir + Bot tablolarını kurar.
-- ============================================================

-- 1. EKSİK SÜTUNLARI EKLEME (Site Hatalarını Giderir)
-- Categories tablosu için
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Headlines (Manşet) tablosu için
ALTER TABLE public.headlines ADD COLUMN IF NOT EXISTS type INTEGER DEFAULT 1; -- 1: Manşet, 2: Sürmanşet

-- Ads (Reklam) tablosu için
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS is_headline BOOLEAN DEFAULT false;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS headline_slot INTEGER;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS is_manset_2 BOOLEAN DEFAULT false;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS manset_2_slot INTEGER;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS placement_code TEXT;


-- 2. BOT İÇİN GEREKLİ TABLOLAR
-- News tablosuna kaynak takibi ve manşet ayarları ekle
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS original_url TEXT UNIQUE;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS is_slider BOOLEAN DEFAULT false;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS is_manset_2 BOOLEAN DEFAULT false;

-- Bot Ayarları tablosunu temizle ve yeniden oluştur
DROP TABLE IF EXISTS public.bot_settings CASCADE;
CREATE TABLE public.bot_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_name TEXT UNIQUE NOT NULL,
    auto_publish BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    check_interval_minutes INTEGER DEFAULT 15,
    last_run_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bot Ayarları Güvenlik Politikaları
ALTER TABLE public.bot_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Bot Settings" ON public.bot_settings FOR SELECT USING (true);
CREATE POLICY "Admin Write Bot Settings" ON public.bot_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Varsayılan Botları Ekle
INSERT INTO public.bot_settings (source_name, auto_publish) VALUES 
('IHA', false),
('DHA', false),
('AA', false)
ON CONFLICT (source_name) DO NOTHING;


-- 3. ADMİN GİRİŞİ (Profiles Tablosu)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  role text default 'user',
  created_at timestamptz default now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politikaları güncelle
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Otomatik Admin Trigger'ı
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'admin');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. STORAGE (Buckets)
INSERT INTO storage.buckets (id, name, public) VALUES ('news-images', 'news-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- Storage Politikaları
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'news-images' );
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'news-images' AND auth.role() = 'authenticated' );
