-- Varsayılan Kategorileri Ekle
INSERT INTO public.categories (name, slug, order_index)
VALUES
('Gündem', 'gundem', 1),
('Ekonomi', 'ekonomi', 2),
('Spor', 'spor', 3),
('Dünya', 'dunya', 4),
('Teknoloji', 'teknoloji', 5),
('Sağlık', 'saglik', 6),
('Magazin', 'magazin', 7)
ON CONFLICT (slug) DO NOTHING;

-- Site Ayarları (Logo vb. için yer tutucu)
INSERT INTO public.site_settings (key, value)
VALUES
('site_title', 'Haberfoni'),
('site_description', 'En güncel haberler ve son dakika gelişmeleri')
ON CONFLICT (key) DO NOTHING;
