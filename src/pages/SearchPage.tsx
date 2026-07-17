import { useEffect, useMemo, useState } from 'react'
import { useParks } from '../hooks/useParks'
import { useGeolocation, haversineDistanceKm } from '../hooks/useGeolocation'
import { ParkCard } from '../components/ParkCard'
import { ParksMap } from '../components/ParksMap'
import { activityIcon, ALL_REGIONS_KEY, SORT_OPTIONS, type SortKey } from '../constants/parks'

type ViewMode = 'list' | 'map'

const ALL_PROVINCES_KEY = 'all'

const chipBase =
  "font-medium text-[12.5px] rounded-full whitespace-nowrap px-3.5 py-2 border transition-transform active:scale-95"
const chipActive = 'bg-forest text-white border-forest'
const chipInactive = 'bg-white text-ink-soft border-black/12'

export function SearchPage() {
  const { parks, parkCoords, loading, error } = useParks()
  const { coords, status: geoStatus, request: requestLocation } = useGeolocation()

  const [query, setQuery] = useState('')
  const [region, setRegion] = useState<string>(ALL_REGIONS_KEY)
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [province, setProvince] = useState<string>(ALL_PROVINCES_KEY)
  const [sortBy, setSortBy] = useState<SortKey>('popularity')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [view, setView] = useState<ViewMode>('list')

  const heroImages = useMemo(
    () =>
      parks
        .map((p) => p.image_url)
        .filter((url): url is string => !!url)
        .slice(0, 6),
    [parks],
  )
  const [heroIndex, setHeroIndex] = useState(0)

  useEffect(() => {
    if (heroImages.length < 2) return
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [heroImages.length])

  const regions = useMemo(() => {
    const set = new Set<string>()
    parks.forEach((p) => p.region && set.add(p.region))
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'th'))
  }, [parks])

  const activities = useMemo(() => {
    const set = new Set<string>()
    parks.forEach((p) => p.activities?.forEach((a) => set.add(a)))
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'th'))
  }, [parks])

  const provinces = useMemo(() => {
    const set = new Set<string>()
    parks.forEach((p) => p.province && set.add(p.province))
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'th'))
  }, [parks])

  const toggleActivity = (a: string) => {
    setSelectedActivities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))
  }

  const handleSort = (key: SortKey) => {
    setSortBy(key)
    setSortOpen(false)
    if (key === 'distance' && geoStatus === 'idle') requestLocation()
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return parks.filter((p) => {
      if (q) {
        const hit =
          p.name_th.toLowerCase().includes(q) ||
          p.name_en?.toLowerCase().includes(q) ||
          p.province?.toLowerCase().includes(q)
        if (!hit) return false
      }
      if (region !== ALL_REGIONS_KEY && p.region !== region) return false
      if (selectedActivities.length > 0) {
        const has = selectedActivities.some((a) => p.activities?.includes(a))
        if (!has) return false
      }
      if (province !== ALL_PROVINCES_KEY && p.province !== province) return false
      return true
    })
  }, [parks, query, region, selectedActivities, province])

  const distanceFor = (parkId: string): number | null => {
    if (!coords) return null
    const pc = parkCoords[parkId]
    if (!pc) return null
    return haversineDistanceKm(coords, pc)
  }

  const sorted = useMemo(() => {
    const arr = [...filtered]
    if (sortBy === 'alpha') {
      arr.sort((a, b) => a.name_th.localeCompare(b.name_th, 'th'))
    } else if (sortBy === 'distance' && coords) {
      arr.sort((a, b) => {
        const da = distanceFor(a.id) ?? Infinity
        const db = distanceFor(b.id) ?? Infinity
        return da - db
      })
    }
    return arr
    // popularity: keep natural fetch order (schema has no popularity metric)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sortBy, coords])

  const activeCount = selectedActivities.length + (province !== ALL_PROVINCES_KEY ? 1 : 0)
  const sortLabel = SORT_OPTIONS.find((o) => o.key === sortBy)?.label ?? ''

  return (
    <div className="fade">
      <div className="relative isolate overflow-hidden px-4 sm:px-[30px] pt-16 pb-12 sm:pt-[90px] sm:pb-[70px] text-center">
        <div className="absolute inset-0 -z-20 bg-gradient-to-b from-[#eef1e6] to-cream" />
        {heroImages.map((url, i) => (
          <div
            key={url + i}
            className="absolute inset-0 -z-20 bg-cover bg-center transition-opacity duration-1000"
            style={{ backgroundImage: `url(${url})`, opacity: i === heroIndex ? 1 : 0 }}
          />
        ))}
        {heroImages.length > 0 && (
          <>
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/55 via-black/35 to-black/60" />
            <div className="absolute inset-x-0 bottom-0 h-24 sm:h-32 -z-10 bg-gradient-to-b from-transparent to-cream" />
          </>
        )}
        <div
          className={`text-[11.5px] font-semibold tracking-[.2em] uppercase mb-3 ${
            heroImages.length > 0 ? 'text-gold' : 'text-sage'
          }`}
        >
          ค้นพบอุทยานแห่งชาติไทย
        </div>
        <h1
          className={`font-heading font-bold text-[28px] sm:text-[40px] leading-[1.15] sm:leading-[1.1] max-w-[620px] mx-auto mb-3 tracking-tight ${
            heroImages.length > 0 ? 'text-white' : 'text-forest'
          }`}
        >
          ออกไปสัมผัสธรรมชาติของเมืองไทย
        </h1>
        <p
          className={`text-[15.5px] leading-[1.5] max-w-[440px] mx-auto mb-6 ${
            heroImages.length > 0 ? 'text-white/85' : 'text-ink-muted'
          }`}
        >
          ค้นหาอุทยานแห่งชาติ กิจกรรม และจุดท่องเที่ยวที่เหมาะกับทริปของคุณ
        </p>
        <div className="flex items-center gap-2 bg-white border border-forest/14 rounded-full py-1.5 pl-5 pr-1.5 max-w-[540px] mx-auto shadow-[0_10px_26px_rgba(31,61,43,.09)] focus-within:shadow-[0_10px_30px_rgba(31,61,43,.16),0_0_0_3px_rgba(197,106,42,.18)] focus-within:border-clay transition-shadow">
          <span className="text-sage text-lg">⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ชื่ออุทยาน จังหวัด หรือกิจกรรม…"
            className="flex-1 min-w-0 border-none outline-none bg-transparent text-[15px] text-forest"
          />
          <button
            type="button"
            onClick={() => handleSort('distance')}
            className="px-4.5 py-2.5 rounded-full bg-forest-light text-forest font-semibold text-[13px] whitespace-nowrap"
          >
            ◉ ใกล้ฉัน
          </button>
        </div>
        {geoStatus === 'denied' && (
          <p className={`text-xs mt-2 ${heroImages.length > 0 ? 'text-white' : 'text-clay'}`}>
            ไม่ได้รับอนุญาตให้เข้าถึงตำแหน่ง กรุณาเปิดสิทธิ์ตำแหน่งในเบราว์เซอร์
          </p>
        )}
      </div>

      <div className="px-4 sm:px-[30px] pt-2 pb-1 max-w-[1180px] mx-auto relative">
        {regions.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-3.5">
            <button
              type="button"
              onClick={() => setRegion(ALL_REGIONS_KEY)}
              className={`${chipBase} ${region === ALL_REGIONS_KEY ? chipActive : chipInactive}`}
            >
              ทั้งหมด
            </button>
            {regions.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRegion(r)}
                className={`${chipBase} ${region === r ? chipActive : chipInactive}`}
              >
                {r}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 justify-center flex-wrap">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full font-semibold text-[13px] whitespace-nowrap ${
              filtersOpen || activeCount > 0 ? chipActive : chipInactive
            } border`}
          >
            <span>⚙︎ ตัวกรอง</span>
            {activeCount > 0 && (
              <span className="min-w-[17px] h-[17px] px-1 rounded-full bg-clay text-white text-[10.5px] font-mono font-semibold inline-flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
          {selectedActivities.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => toggleActivity(a)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest-light text-ink-soft text-xs font-medium whitespace-nowrap"
            >
              {activityIcon(a)} {a} <span className="text-ink-faint">✕</span>
            </button>
          ))}
          {province !== ALL_PROVINCES_KEY && (
            <button
              type="button"
              onClick={() => setProvince(ALL_PROVINCES_KEY)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest-light text-ink-soft text-xs font-medium whitespace-nowrap"
            >
              📍 {province} <span className="text-ink-faint">✕</span>
            </button>
          )}
        </div>

        {filtersOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setFiltersOpen(false)} />
            <div className="fade relative max-w-[640px] mx-auto mt-2.5 bg-white border border-black/10 rounded-2xl px-5 pt-4.5 pb-5 shadow-[0_16px_40px_rgba(31,61,43,.16)] z-35">
              <div className="text-[11.5px] font-semibold tracking-[.03em] text-sage uppercase mb-2.5">
                จังหวัด
              </div>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                disabled={provinces.length === 0}
                className="w-full mb-4 px-3.5 py-2.5 rounded-[11px] border border-black/12 bg-white text-[13px] text-ink-soft font-medium disabled:opacity-50"
              >
                <option value={ALL_PROVINCES_KEY}>ทุกจังหวัด</option>
                {provinces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <div className="text-[11.5px] font-semibold tracking-[.03em] text-sage uppercase mb-2.5">
                กิจกรรม
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activities.length === 0 && (
                  <span className="text-xs text-ink-faint">ไม่มีข้อมูลกิจกรรม</span>
                )}
                {activities.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleActivity(a)}
                    className={`${chipBase} ${
                      selectedActivities.includes(a) ? chipActive : chipInactive
                    }`}
                  >
                    {activityIcon(a)} {a}
                  </button>
                ))}
              </div>
              <div className="mt-4.5 flex gap-2">
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedActivities([])
                      setProvince(ALL_PROVINCES_KEY)
                    }}
                    className="flex-1 text-center py-2.5 rounded-[11px] bg-white border border-black/12 text-ink-soft font-semibold text-[13px]"
                  >
                    ล้างตัวกรอง
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-[11px] bg-forest text-cream-light font-semibold text-[13px]"
                >
                  เสร็จสิ้น
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2 px-4 sm:px-[30px] pt-3.5 pb-4 max-w-[1180px] mx-auto relative">
        <button
          type="button"
          onClick={() => setSortOpen((v) => !v)}
          className="flex items-baseline gap-1.5 px-0.5 py-1 rounded-lg"
        >
          <span className="font-semibold text-[15px] text-forest">
            {loading ? 'กำลังค้นหา…' : `พบ ${sorted.length} อุทยาน`}
          </span>
          <span className="text-[12.5px] font-mono text-ink-faint">· {sortLabel} ▾</span>
        </button>

        <div className="flex items-center gap-1 bg-forest-light rounded-full p-1">
          <button
            type="button"
            onClick={() => setView('list')}
            className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold whitespace-nowrap ${
              view === 'list' ? 'bg-white text-forest shadow-sm' : 'text-ink-muted'
            }`}
          >
            ☰ รายการ
          </button>
          <button
            type="button"
            onClick={() => {
              setView('map')
              if (geoStatus === 'idle') requestLocation()
            }}
            className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold whitespace-nowrap ${
              view === 'map' ? 'bg-white text-forest shadow-sm' : 'text-ink-muted'
            }`}
          >
            🗺 แผนที่
          </button>
        </div>

        {sortOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} />
            <div className="fade absolute top-[46px] left-4 sm:left-[30px] bg-white border border-black/10 rounded-[13px] p-1.5 shadow-[0_14px_34px_rgba(31,61,43,.16)] z-35 min-w-[190px]">
              {SORT_OPTIONS.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => handleSort(o.key)}
                  className={`block w-full text-left px-3 py-2.5 rounded-lg text-[13px] font-medium whitespace-nowrap ${
                    sortBy === o.key ? 'bg-forest-light text-forest' : 'text-ink-soft'
                  }`}
                >
                  {o.icon} {o.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="max-w-[1180px] mx-auto px-4 sm:px-[30px] pb-[46px]">
        {error && <div className="text-center py-16 text-clay text-sm">โหลดข้อมูลไม่สำเร็จ: {error}</div>}
        {!error && !loading && sorted.length === 0 && (
          <div className="text-center py-16 text-ink-faint text-[15px]">
            ไม่พบอุทยานที่ตรงกับตัวกรอง ลองปรับเงื่อนไขดูนะ
          </div>
        )}
        {!error && sorted.length > 0 && view === 'map' && (
          <ParksMap
            parks={sorted}
            parkCoords={parkCoords}
            userCoords={geoStatus === 'granted' ? coords : null}
          />
        )}
        {!error && sorted.length > 0 && view === 'list' && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(258px,1fr))] gap-5">
            {sorted.map((p) => (
              <ParkCard key={p.id} park={p} distanceKm={sortBy === 'distance' ? distanceFor(p.id) : null} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
