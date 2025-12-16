
INSERT INTO public.site_settings (key, value)
VALUES (
    'robots_txt',
    'User-agent: *
Disallow: /admin/
Disallow: /admin/login

Sitemap: https://haberfoni.com/sitemap.xml'
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value;
