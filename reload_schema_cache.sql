-- Force PostgREST to reload the schema cache
-- This is useful when you've made changes to the database schema (like adding columns)
-- but the API isn't seeing them yet.

NOTIFY pgrst, 'reload config';
