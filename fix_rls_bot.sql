-- Ensure Categories is readable
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Categories" ON categories;
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);

-- Ensure News Tags is readable
ALTER TABLE news_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read News Tags" ON news_tags;
CREATE POLICY "Public Read News Tags" ON news_tags FOR SELECT USING (true);

-- Ensure Tags is readable
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Tags" ON tags;
CREATE POLICY "Public Read Tags" ON tags FOR SELECT USING (true);

-- Ensure News is readable (just in case)
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read News" ON news;
CREATE POLICY "Public Read News" ON news FOR SELECT USING (true);
