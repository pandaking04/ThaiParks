# CLAUDE.md

ไฟล์นี้ให้คำแนะนำแก่ Claude Code (claude.ai/code) เมื่อทำงานกับโค้ดในรีโพนี้

## โปรเจกต์

แอปค้นหาอุทยานแห่งชาติของไทย (UI เป็นภาษาไทย) สร้างด้วย React 19 + TypeScript + Vite, Tailwind CSS v4, ใช้ Supabase (Postgres) เป็นแบ็กเอนด์ และ React Router สำหรับการนำทาง 2 หน้า

## คำสั่ง

```
npm run dev       # เริ่ม Vite dev server (localhost:5173)
npm run build     # tsc -b (project references, ตรวจ type อย่างเดียว) ตามด้วย vite build
npm run preview   # พรีวิวโปรดักชันบิลด์
npm run lint      # oxlint (ดู .oxlintrc.json) — รีโพนี้ใช้ oxlint ไม่ใช่ eslint
```

รีโพนี้ยังไม่มี test suite/framework ติดตั้งไว้

ต้องมีไฟล์ `.env` ที่มี `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY` (ดู `.env.example`) — [src/lib/supabase.ts](src/lib/supabase.ts) จะ throw ตอน import ถ้าขาดตัวใดตัวหนึ่ง

## สถาปัตยกรรม

**Data model / backend**: [sql/001_schema.sql](sql/001_schema.sql) คือ baseline schema (สะท้อนทุกคอลัมน์ล่าสุด ใช้ตั้งฐานข้อมูลใหม่ตั้งแต่ต้นได้) ส่วนไฟล์ `sql/002_*.sql`, `003_*.sql`, `004_*.sql` เป็น migration ที่ทยอยเพิ่มทีหลัง (seed data, `park_images`, `trails.image_url` ตามลำดับ) ทุกไฟล์ต้องรันเองผ่าน Supabase SQL editor ทีละไฟล์ตามเลขลำดับ (ไม่มีเครื่องมือ migration อัตโนมัติ) — เมื่อแก้ schema เพิ่ม ให้แก้ `001_schema.sql` ด้วยเสมอ (เพื่อให้เป็น baseline ที่ถูกต้องสำหรับโปรเจกต์ใหม่) แล้วค่อยเพิ่มไฟล์ migration ใหม่ (เลขถัดไป) สำหรับฐานข้อมูลที่มีอยู่แล้ว มีทั้งหมด 4 ตาราง ทุกตารางอ่านได้สาธารณะผ่าน RLS แต่ไม่มี write policy (การเขียนต้องทำผ่าน SQL editor / service role):
- `national_parks` — เอนทิตีหลัก
- `attractions` (FK `park_id`, มี `lat`/`lng`) — จุดท่องเที่ยวภายในอุทยาน
- `trails` (FK `park_id`) — เส้นทางเดินป่าภายในอุทยาน มี `image_url` เป็นรูปแผนที่เส้นทาง (แผนผัง/โปสเตอร์เส้นทาง ไม่ใช่ภาพบรรยากาศ) ไม่ใช่พิกัด lat/lng ของเส้นทาง (trail ไม่มีพิกัดของตัวเอง)
- `park_images` (FK `park_id`, `image_url`) — รูปภาพแกลเลอรีของอุทยาน เรียงตาม `created_at`

[src/types/park.ts](src/types/park.ts) สะท้อน schema นี้ตรงตัว (`NationalPark`, `Attraction`, `Trail`, `ParkImage`) เมื่อแก้ schema ต้องอัปเดตทั้งสองไฟล์นี้พร้อมกัน

โฟลเดอร์ [data/](data/) มี CSV template (`01_parks_content_template`, `02_attractions_template`, `03_trails_template`) ที่ใช้กรอกข้อมูลเนื้อหาก่อนแปลงเป็น `sql/002_seed_data.sql` — ค่า activities/facilities/type/difficulty ในนั้นถูก insert แบบ verbatim ไม่ได้ normalize กับ controlled vocabulary ใดๆ (ดูหัวข้อ Display lookups)

**Data fetching**: ไม่มี query library — ใช้ hook ธรรมดาที่เรียก `useEffect` + Supabase client โดยมี flag `cancelled` ป้องกันการ setState หลัง unmount:
- [useParks](src/hooks/useParks.ts) — หน้ารายการ: ดึงอุทยานทั้งหมด พร้อม map `park_id -> {lat,lng}` ที่คำนวณจาก `attractions` (พิกัดแรกที่ไม่เป็น null ต่ออุทยาน) ใช้สำหรับเรียงตามระยะทาง
- [useParkDetail](src/hooks/useParkDetail.ts) — หน้ารายละเอียด: ดึงอุทยาน 1 แห่งพร้อม attractions, trails และรูปแกลเลอรีพร้อมกัน (parallel) โดยอิงจาก route param

**Saved parks** เก็บในเครื่องเท่านั้น ไม่ผ่าน Supabase: [useSavedParks](src/hooks/useSavedParks.ts) บันทึก array ของ park ID ลง `localStorage` (`thaiparks:saved`) และเผยแพร่ทั้งแอปผ่าน [SavedParksContext](src/context/SavedParksContext.tsx) (`useSavedParksContext`) ใช้งานโดย [Navbar](src/components/Navbar.tsx) (badge นับจำนวน) และ [ParkCard](src/components/ParkCard.tsx) (ปุ่มหัวใจ toggle)

**Cookie consent & analytics**: GA4 (`gtag.js`) ถูกโหลดแบบ static script ตรงใน [index.html](index.html) เสมอ ไม่ได้ผูกกับ consent — [CookieConsentBanner](src/components/CookieConsentBanner.tsx) + [useCookieConsent](src/hooks/useCookieConsent.ts) (เก็บสถานะ `accepted`/`declined` ใน `localStorage` key `thaiparks:consent`) เป็นแค่ notice ให้ผู้ใช้เลือก **ไม่ได้ block การยิง GA จริง** — ถ้าจะทำ consent gating จริงต้องย้าย gtag script ให้ conditional ตาม `status` ก่อน [CookieConsentContext](src/context/CookieConsentContext.tsx) ยังคอย track SPA page view เพิ่มเติมทุกครั้งที่เปลี่ยน route ผ่าน `trackPageView()` ใน [lib/analytics.ts](src/lib/analytics.ts) (ยกเว้น mount ครั้งแรกที่ gtag static script จัดการไปแล้ว)

**Routing** ([App.tsx](src/App.tsx)): `CookieConsentProvider` ครอบ `SavedParksProvider` ครอบทั้งแอป โดย `Navbar`, [FeedbackButton](src/components/FeedbackButton.tsx) (ปุ่มลอยมุมขวาล่าง) และ `CookieConsentBanner` render อยู่นอก `<Routes>` (แสดงทุกหน้า) — route มีแค่ `/` → [SearchPage](src/pages/SearchPage.tsx) กับ `/parks/:id` → [ParkDetailPage](src/pages/ParkDetailPage.tsx) ลิงก์ฟอร์ม feedback ทั้งใน Navbar และ FeedbackButton มาจากค่าเดียวกันคือ `FEEDBACK_FORM_URL` ใน [src/constants/links.ts](src/constants/links.ts)

**การกรอง/เรียงลำดับใน SearchPage**: ภูมิภาค (`region`) เป็น chip แถวบนสุด เลือกได้ทีละอัน เสมอเห็น ไม่นับใน badge ตัวกรอง ส่วน popover "ตัวกรอง" (`filtersOpen`) มี 2 ส่วนเรียงจากบนลงล่าง — จังหวัด (`province`, native `<select>` เลือกได้ทีละจังหวัด ค่า sentinel `'all'` = ทุกจังหวัด) แล้วตามด้วยกิจกรรม (`selectedActivities`, chip เลือกได้หลายอัน) `activeCount` (เลขบน badge ปุ่ม "ตัวกรอง") = `selectedActivities.length + (province !== 'all' ? 1 : 0)` ปุ่ม "ล้างตัวกรอง" โผล่เฉพาะตอน `activeCount > 0` รีเซ็ตทั้งสองอย่างพร้อมกัน เรียงตามระยะทางใช้ helper haversine ของ [useGeolocation](src/hooks/useGeolocation.ts)

**Hero background slider** (SearchPage): ดึงรูป cover (`image_url`) จากอุทยานที่โหลดมาแล้วสูงสุด 6 รูป (ไม่ fetch เพิ่ม) วนแบบ crossfade ทุก 5 วิ (`heroIndex` + `setInterval`) เรนเดอร์ทุกรูปพร้อมกันเป็น layer ซ้อนกันแล้วสลับแค่ `opacity` (กันภาพกระพริบ/โหลดซ้ำ) มี scrim ไล่สีดำทับเพื่อให้ตัวหนังสือขาวอ่านออก และมี fade band ล่างสุด (`from-transparent to-cream`) ให้กลืนเข้ากับพื้นหลังหน้าแทนที่จะตัดขอบแข็งๆ ถ้าไม่มีอุทยานไหนมี `image_url` เลย จะ fallback เป็น gradient เรียบ + สีตัวหนังสือเดิม (เขียวเข้ม) แทนสีขาว

**Modal รายละเอียด (attraction/trail)**: [AttractionModal](src/components/AttractionModal.tsx) และ [TrailModal](src/components/TrailModal.tsx) ใช้ pattern เดียวกัน — overlay `fixed inset-0` ปิดได้ด้วยคลิก backdrop / ปุ่ม ✕ / กด Escape, รูปหลักในโมดัลกดแล้วเปิด overlay ซูมเต็มจอซ้อนอีกชั้น (`z-[70]` ทับโมดัล `z-[60]`) โดย Escape จะปิด zoom ก่อนแล้วค่อยปิดโมดัลในกดครั้งถัดไป เปิดโมดัลจาก [ParkDetailPage](src/pages/ParkDetailPage.tsx) ผ่าน state `selectedAttraction`/`selectedTrail`

**แผนที่ (Leaflet ผ่าน react-leaflet)**: มี 3 จุดที่ใช้ map แยกกัน — [ParksMap](src/components/ParksMap.tsx) (หน้าค้นหา, มุมมองแผนที่รวมทุกอุทยาน + ตำแหน่งผู้ใช้), [ParkLocationMap](src/components/ParkLocationMap.tsx) (หน้ารายละเอียด, อุทยาน + attractions ทั้งหมด), และแผนที่จิ๋วใน `AttractionModal`/`TrailModal` (แสดงจุดเดียว) ทุก wrapper div ของ `MapContainer` ต้องมีคลาส **`isolate`** เสมอ — Leaflet ใช้ z-index ภายใน (pane ต่างๆ สูงสุดถึง ~700) ถ้าไม่มี `isolate` ครอบ stacking context ไว้ ตัว pane จะ "หลุด" ไปทับ element อื่นนอก map (เช่น modal/overlay ที่มี z-index ต่ำกว่า) — เป็นบั๊กที่เจอมาแล้วกับ `AttractionModal`

**Navbar กับ z-index ของ popover ในหน้า**: `Navbar` เป็น `sticky top-0 z-40` (ดูจริงบนทุกหน้า) popover/dropdown ที่ลอยอยู่ *ภายใน* เนื้อหาหน้า (เช่น panel "ตัวกรอง" และ dropdown เรียงลำดับใน `SearchPage`) ต้องตั้ง z-index ให้ **ต่ำกว่า 40 เสมอ** (ปัจจุบันใช้ z-30 ให้ backdrop, z-35 ให้ตัว panel) ไม่งั้นพอ scroll หน้าไป popover ที่เลื่อนตามปกติ (ไม่ได้ fixed กับ viewport) จะเลื่อนไปทับ navbar แทนที่จะลอดใต้มันแบบ content ปกติ — เป็นบั๊กที่เจอและแก้แล้วทั้ง filter panel และ sort dropdown ห้ามใช้ z-index สูงกว่า 40 กับ element ที่ยังอยู่ในโฟลว์ของหน้า/เลื่อนตามการ scroll ปกติ ต่างจาก full-screen modal (`AttractionModal`/`TrailModal`/lightbox) ที่ใช้ `z-[60]`/`z-[70]` ได้เพราะเป็น `fixed inset-0` ที่ตั้งใจให้ทับทุกอย่างรวม navbar ด้วย

**Display lookups**: [src/constants/parks.ts](src/constants/parks.ts) เป็นแหล่งเดียวของ controlled vocabulary ทั้งหมด (ไม่มีไฟล์ guide แยกต่างหากในโปรเจกต์นี้) รวม mapping ไอคอน/label (emoji กิจกรรม, emoji ประเภทสถานที่ท่องเที่ยว, label+class ความยากของเส้นทาง, emoji สิ่งอำนวยความสะดวก, ตัวเลือกการเรียงลำดับ) map เหล่านี้มีทั้ง key ภาษาไทยและอังกฤษ (ข้อมูลอาจมาเป็นภาษาใดก็ได้) และทุก lookup จะ fallback เป็นค่า default ทั่วไป (เช่น `🌿`, `📍`) — เมื่อเพิ่มค่ากิจกรรม/ประเภท/สิ่งอำนวยความสะดวกใหม่ ให้เพิ่ม key ทั้งสองภาษาไว้ที่นี่ แทนที่จะเขียนเป็นกรณีพิเศษที่จุดเรียกใช้งาน **ระวัง**: key ที่มีอักขระนอกเหนือตัวอักษร/ตัวเลข/underscore (เช่น `/`, ช่องว่าง, `-`) ต้องใส่ quote ครอบ (เช่น `'ชมประวัติศาสตร์/วัฒนธรรม': '🏛️'`) ไม่งั้นจะ syntax error ทั้งไฟล์ (bareword object key รับ `/` ไม่ได้)

**Styling**: config ของ Tailwind v4 อยู่ใน CSS ( [src/index.css](src/index.css) บล็อก `@theme` ) ไม่ใช่ `tailwind.config.js` — สีกำหนดเอง (`forest`, `clay`, `sage`, `cream` ฯลฯ) และฟอนต์ (Anuphan/Noto Sans Thai/Space Grotesk) ถูกกำหนดไว้ที่นั่นเป็น CSS variable และใช้เป็น Tailwind class (เช่น `text-forest`, `bg-clay`) `.ph`/`.ph-l` คือสไตล์รูปภาพ placeholder ที่ใช้เมื่ออุทยาน/สถานที่ท่องเที่ยวไม่มี `image_url` ส่วน `.no-scrollbar` (ใน `@layer components`) ซ่อน scrollbar ของ container ที่ยัง scroll ได้ปกติ ใช้กับแถวที่เลื่อนด้วย wheel/drag แทน scrollbar (เช่นแถวกิจกรรมในหน้ารายละเอียด)

**Responsive**: ไม่มี custom breakpoint (ใช้ default ของ Tailwind — `sm` 640px, `md` 768px) รูปแบบที่ใช้ซ้ำทั้ง `SearchPage`/`ParkDetailPage`: padding ข้างหน้าเป็น `px-4 sm:px-[30px]` (ไม่ใช่ fixed px), flex child ที่เคย fix `min-w-[Npx]` ต้องเป็น `min-w-0 sm:min-w-[Npx]` ไม่งั้น layout จะ overflow แนวนอนบนจอแคบมากๆ (~320px) — เจอบั๊กนี้จริงกับคอลัมน์เนื้อหาหลักของ `ParkDetailPage` sidebar ที่ปกติกว้างคงที่ (เช่น `w-[238px]`) ต้องเป็น `w-full sm:w-[238px]` และ `sticky` ต้องผูกกับ breakpoint เดียวกัน (`sm:sticky sm:top-[...]`) เพราะพอ layout ยุบเป็นคอลัมน์เดียวบนมือถือ sidebar จะเลื่อนไปอยู่ใต้เนื้อหาหลัก ไม่ใช่ข้างๆ แล้ว จึงไม่ควร sticky/กว้างคงที่แบบตอนอยู่เป็น 2 คอลัมน์ ก่อน merge การเปลี่ยน layout ควรทดสอบจริงที่ 320px/375px ด้วย headless browser (ไม่ใช่เดาจากโค้ด) เพราะ overflow แนวนอนแบบนี้เห็นยากจากอ่านโค้ดอย่างเดียว การ์ดสิ่งอำนวยความสะดวกใน `ParkDetailPage` sidebar ก็ responsive แบบ CSS-only เหมือนกัน — ไอคอนอย่างเดียวพร้อม tooltip (`group`/`group-hover`) ตอน `md:` ขึ้นไป, ไอคอน+ชื่อเต็มตอนมือถือ

- data model: national_parks, attractions, trails (attractions/trails แยกกันตามเกณฑ์
  มีระยะทาง/ความยากจริงจังไหม)
- entrance_fee เป็นราคาผู้ใหญ่ราคาเดียว ไม่แยกคนไทย/ต่างชาติ
- controlled vocabulary ของ activities/facilities/attraction type/trail difficulty อยู่ใน [src/constants/parks.ts](src/constants/parks.ts) เท่านั้น (ไม่มี `00_content_guide.md` ในโปรเจกต์นี้) เพิ่มคำใหม่ให้แก้ที่ไฟล์นี้โดยตรง
- ปุ่มหลักในหน้ารายละเอียดคือ "เข้าชม" ลิงก์ website_url ปุ่มเดียว ไม่มีจองที่พัก/เพิ่มลงทริปใน Phase 1
