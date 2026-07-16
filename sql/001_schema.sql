-- Thai National Parks App — schema for Supabase (Postgres + RLS).
-- Run once in Supabase: Project → SQL Editor → New query → paste → Run.
-- Matches the data model used by the React app in src/types/park.ts.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- national_parks
-- ---------------------------------------------------------------------------
create table national_parks (
  id                    uuid primary key default gen_random_uuid(),
  name_th               text not null,
  name_en               text,
  region                text not null,
  province              text not null,
  entrance_fee_adult    numeric,
  open_hours            text,
  website_url           text,
  activities            text[],
  best_season           text,
  facilities            text[],
  established_year      integer,
  highlights            text,
  description           text,
  image_url             text,
  lat                   double precision,
  lng                   double precision,
  tel_number            text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index national_parks_region_idx on national_parks (region);

-- ---------------------------------------------------------------------------
-- attractions — points of interest belonging to a park (0..n per park)
-- ---------------------------------------------------------------------------
create table attractions (
  id                uuid primary key default gen_random_uuid(),
  park_id           uuid not null references national_parks(id) on delete cascade,
  attraction_name   text not null,
  type              text,
  description       text,
  lat               double precision,
  lng               double precision,
  image_url         text,
  created_at        timestamptz not null default now()
);

create index attractions_park_id_idx on attractions (park_id);

-- ---------------------------------------------------------------------------
-- trails — hiking routes belonging to a park (0..n per park)
-- ---------------------------------------------------------------------------
create table trails (
  id            uuid primary key default gen_random_uuid(),
  park_id       uuid not null references national_parks(id) on delete cascade,
  trail_name    text not null,
  description   text,
  difficulty    text,
  distance_km   numeric,
  duration      text,
  created_at    timestamptz not null default now()
);

create index trails_park_id_idx on trails (park_id);

-- ---------------------------------------------------------------------------
-- park_images — photo gallery images belonging to a park (0..n per park)
-- ---------------------------------------------------------------------------
create table park_images (
  id            uuid primary key default gen_random_uuid(),
  park_id       uuid not null references national_parks(id) on delete cascade,
  image_url     text not null,
  created_at    timestamptz not null default now()
);

create index park_images_park_id_idx on park_images (park_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — public read-only (writes via SQL editor / service role)
-- ---------------------------------------------------------------------------
alter table national_parks enable row level security;
alter table attractions enable row level security;
alter table trails enable row level security;
alter table park_images enable row level security;

create policy "national_parks are publicly readable" on national_parks for select using (true);
create policy "attractions are publicly readable" on attractions for select using (true);
create policy "trails are publicly readable" on trails for select using (true);
create policy "park_images are publicly readable" on park_images for select using (true);
