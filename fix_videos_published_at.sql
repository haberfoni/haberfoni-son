-- Allow published_at to be NULL for Draft status
ALTER TABLE videos ALTER COLUMN published_at DROP NOT NULL;

-- Optional: Ensure it has no default value that forces a date
ALTER TABLE videos ALTER COLUMN published_at DROP DEFAULT;
