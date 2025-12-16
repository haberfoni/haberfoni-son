-- Ads tablosuna target_news_id sütunu ekler
ALTER TABLE public.ads 
ADD COLUMN IF NOT EXISTS target_news_id TEXT;

-- Schema cache'i yenilemek için (Supabase Dashboard'da otomatik olur ama SQL'den manuel tetikleme gerekebilir)
NOTIFY pgrst, 'reload schema';
