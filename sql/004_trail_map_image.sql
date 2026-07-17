-- Adds image_url to trails (route map graphic, e.g. the trailhead map poster).
-- Run once in Supabase: Project -> SQL Editor -> New query -> paste -> Run.
-- Mirrors the national_parks/attractions image_url columns in sql/001_schema.sql.

alter table trails add column if not exists image_url text;
