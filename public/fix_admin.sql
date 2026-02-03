-- Kullanıcıya Admin Yetkisi Verme
-- Bu scripti Supabase SQL Editor'de çalıştırın.

INSERT INTO public.profiles (id, email, role, full_name)
VALUES (
  'b28b2834-4117-4850-9757-c04efdbe8b46', -- Bu ID login testinden alındı
  'ahmetcansertce@hotmail.com',
  'admin',
  'Ahmet Can Sertçe'
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin';
