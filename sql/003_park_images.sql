-- Adds the park_images table (photo gallery, 0..n images per park).
-- Run once in Supabase: Project -> SQL Editor -> New query -> paste -> Run.
-- Mirrors the national_parks/attractions/trails setup in sql/001_schema.sql.

create table if not exists park_images (
  id            uuid primary key default gen_random_uuid(),
  park_id       uuid not null references national_parks(id) on delete cascade,
  image_url     text not null,
  created_at    timestamptz not null default now()
);

create index if not exists park_images_park_id_idx on park_images (park_id);

alter table park_images enable row level security;

create policy "park_images are publicly readable" on park_images for select using (true);
