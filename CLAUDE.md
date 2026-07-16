# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Thai national parks discovery app (Thai-language UI). React 19 + TypeScript + Vite, Tailwind CSS v4, Supabase (Postgres) as the backend, React Router for the two-page navigation.

## Commands

```
npm run dev       # start Vite dev server (localhost:5173)
npm run build     # tsc -b (project references, type-check only) then vite build
npm run preview   # preview the production build
npm run lint      # oxlint (see .oxlintrc.json) — this repo uses oxlint, not eslint
```

There is no test suite/framework configured in this repo currently.

Requires a `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `.env.example`); [src/lib/supabase.ts](src/lib/supabase.ts) throws at import time if either is missing.

## Architecture

**Data model / backend**: [sql/001_schema.sql](sql/001_schema.sql) is the source of truth for the Supabase schema and is applied manually via the Supabase SQL editor (no migration tool). Three tables, all public-read via RLS with no write policies (writes go through the SQL editor / service role):
- `national_parks` — the core entity
- `attractions` (`park_id` FK, has `lat`/`lng`) — points of interest within a park
- `trails` (`park_id` FK) — hiking routes within a park

[src/types/park.ts](src/types/park.ts) mirrors this schema exactly (`NationalPark`, `Attraction`, `Trail`). When the schema changes, update both files together.

**Data fetching**: no query library — plain hooks using `useEffect` + Supabase client, with a `cancelled` flag to guard against setting state after unmount:
- [useParks](src/hooks/useParks.ts) — list page: fetches all parks plus a `park_id -> {lat,lng}` map derived from `attractions` (first non-null coordinate per park), used for distance sorting.
- [useParkDetail](src/hooks/useParkDetail.ts) — detail page: fetches one park plus its attractions and trails in parallel, keyed by route param.

**Saved parks** are local-only, not backed by Supabase: [useSavedParks](src/hooks/useSavedParks.ts) persists an array of park IDs to `localStorage` (`thaiparks:saved`), exposed app-wide through [SavedParksContext](src/context/SavedParksContext.tsx) (`useSavedParksContext`), consumed by [Navbar](src/components/Navbar.tsx) (count badge) and [ParkCard](src/components/ParkCard.tsx) (heart toggle).

**Routing** ([App.tsx](src/App.tsx)): `/` → [SearchPage](src/pages/SearchPage.tsx) (search/filter/sort over `useParks`, chips for region + activities, distance sort via [useGeolocation](src/hooks/useGeolocation.ts)'s haversine helper), `/parks/:id` → [ParkDetailPage](src/pages/ParkDetailPage.tsx).

**Display lookups**: [src/constants/parks.ts](src/constants/parks.ts) centralizes all icon/label mappings (activity emoji, attraction-type emoji, trail difficulty label+class, facility emoji, sort options). These maps have both Thai and English keys (data may come in either language) and every lookup falls back to a generic default (e.g. `🌿`, `📍`) — when adding a new activity/type/facility value, add both language keys here rather than special-casing it at the call site.

**Styling**: Tailwind v4 config lives in CSS ([src/index.css](src/index.css) `@theme` block), not a `tailwind.config.js` — custom colors (`forest`, `clay`, `sage`, `cream`, etc.) and fonts (Anuphan/Noto Sans Thai/Space Grotesk) are defined there as CSS variables and used as Tailwind classes (e.g. `text-forest`, `bg-clay`). `.ph`/`.ph-l` are the placeholder-image styles used when a park/attraction has no `image_url`.

- data model: national_parks, attractions, trails (attractions/trails แยกกันตามเกณฑ์
  มีระยะทาง/ความยากจริงจังไหม)
- entrance_fee เป็นราคาผู้ใหญ่ราคาเดียว ไม่แยกคนไทย/ต่างชาติ
- controlled vocabulary อยู่ใน 00_content_guide.md ห้ามเพิ่มคำใหม่นอกจากอัปเดตไฟล์นั้นก่อน
- ปุ่มหลักในหน้ารายละเอียดคือ "เข้าชม" ลิงก์ website_url ปุ่มเดียว ไม่มีจองที่พัก/เพิ่มลงทริปใน Phase 1