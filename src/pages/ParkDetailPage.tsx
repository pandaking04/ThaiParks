import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useParkDetail } from '../hooks/useParkDetail'
import { activityIcon, attractionTypeIcon, difficultyInfo, facilityIcon } from '../constants/parks'
import { ParkLocationMap } from '../components/ParkLocationMap'
import { AttractionModal } from '../components/AttractionModal'
import { TrailModal } from '../components/TrailModal'
import type { Attraction, Trail } from '../types/park'

export function ParkDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { park, attractions, trails, images, loading, error } = useParkDetail(id)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null)
  const [selectedTrail, setSelectedTrail] = useState<Trail | null>(null)
  const activitiesRef = useRef<HTMLDivElement>(null)
  const dragState = useRef({ dragging: false, startX: 0, startScrollLeft: 0 })

  function onActivitiesWheel(e: React.WheelEvent<HTMLDivElement>) {
    const el = activitiesRef.current
    if (!el) return
    el.scrollLeft += e.deltaY
  }

  function onActivitiesMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    const el = activitiesRef.current
    if (!el) return
    dragState.current = { dragging: true, startX: e.pageX, startScrollLeft: el.scrollLeft }
  }

  function onActivitiesMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = activitiesRef.current
    if (!el || !dragState.current.dragging) return
    el.scrollLeft = dragState.current.startScrollLeft - (e.pageX - dragState.current.startX)
  }

  function stopActivitiesDrag() {
    dragState.current.dragging = false
  }

  const galleryImages = park?.image_url ? [{ id: 'cover', image_url: park.image_url }, ...images] : images
  const coverOffset = park?.image_url ? 1 : 0

  useEffect(() => {
    if (lightboxIndex === null || galleryImages.length === 0) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') setLightboxIndex((i) => (i === null ? i : (i + 1) % galleryImages.length))
      if (e.key === 'ArrowLeft')
        setLightboxIndex((i) => (i === null ? i : (i - 1 + galleryImages.length) % galleryImages.length))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, galleryImages.length])

  if (loading) {
    return <div className="text-center py-24 text-ink-faint text-[15px]">กำลังโหลดข้อมูลอุทยาน…</div>
  }

  if (error || !park) {
    return (
      <div className="text-center py-24">
        <p className="text-clay text-sm mb-4">{error ?? 'ไม่พบข้อมูลอุทยานนี้'}</p>
        <Link to="/" className="text-forest font-semibold text-sm">
          ← กลับหน้าค้นหา
        </Link>
      </div>
    )
  }

  const fee = park.entrance_fee_adult
  const feeLabel = fee == null ? 'ไม่มีข้อมูล' : fee === 0 ? 'ฟรี' : `${fee.toLocaleString('th-TH')}฿`

  return (
    <>
    <div className="fade max-w-[900px] mx-auto px-4 sm:px-[30px] pt-5 pb-[60px]">
      <Link to="/" className="inline-flex items-center gap-1.5 font-semibold text-[13px] text-ink-muted mb-3.5">
        ← กลับ
      </Link>

      {park.image_url ? (
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="block w-full h-[200px] sm:h-[280px] rounded-2xl mb-5 bg-cover bg-center"
          style={{ backgroundImage: `url(${park.image_url})` }}
          aria-label="ดูรูปอุทยานขนาดใหญ่"
        />
      ) : (
        <div className="ph relative h-[200px] sm:h-[280px] rounded-2xl mb-5 bg-cover bg-center">
          <span className="ph-l">รูปอุทยาน</span>
        </div>
      )}

      {images.length > 0 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1.5 mb-5">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setLightboxIndex(i + coverOffset)}
              className="flex-none w-24 h-16 rounded-lg overflow-hidden border border-black/8"
            >
              <img src={img.image_url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
        <h1 className="font-heading font-bold text-[24px] sm:text-[32px] text-forest m-0">{park.name_th}</h1>
      </div>
      {park.name_en && <div className="font-mono text-sm text-ink-faint mb-1.5">{park.name_en}</div>}
      {park.highlights && (
        <p className="font-medium text-clay text-[13.5px] mb-5">{park.highlights}</p>
      )}
      <div className="flex items-center gap-3 flex-wrap font-mono text-[13px] text-ink-faint mb-6">
        <span>{park.region}</span>
        <span>·</span>
        <span>{park.province}</span>
        {park.established_year && (
          <>
            <span>·</span>
            <span>ก่อตั้งปี {park.established_year}</span>
          </>
        )}
      </div>

      <div className="flex gap-6 items-start flex-wrap">
        <div className="flex-1 min-w-0 sm:min-w-[300px]">
          <div className="grid grid-cols-3 gap-2.5 mb-6">
            <Fact label="ค่าเข้าอุทยาน" value={feeLabel} />
            <Fact label="เวลาเปิด-ปิด" value={park.open_hours ?? 'ไม่มีข้อมูล'} />
            <Fact label="จุดท่องเที่ยว" value={String(attractions.length)} />
          </div>

          {park.description && (
            <p className="text-[14.5px] leading-[1.75] text-ink-soft mb-6">{park.description}</p>
          )}

          {park.activities && park.activities.length > 0 && (
            <>
              <SectionTitle>กิจกรรม</SectionTitle>
              <div
                ref={activitiesRef}
                onWheel={onActivitiesWheel}
                onMouseDown={onActivitiesMouseDown}
                onMouseMove={onActivitiesMouseMove}
                onMouseUp={stopActivitiesDrag}
                onMouseLeave={stopActivitiesDrag}
                className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1.5 mb-6.5 cursor-grab active:cursor-grabbing select-none"
              >
                {park.activities.map((a) => (
                  <div key={a} className="flex-none flex flex-col items-center gap-1.5 w-16">
                    <div className="w-13 h-13 rounded-2xl bg-forest-light flex items-center justify-center text-2xl">
                      {activityIcon(a)}
                    </div>
                    <div className="text-[11px] font-medium text-ink-soft text-center leading-tight">{a}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {attractions.length > 0 && (
            <>
              <SectionTitle>จุดท่องเที่ยว</SectionTitle>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3.5 mb-6.5">
                {attractions.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedAttraction(a)}
                    className="trail-card text-left border border-black/8 rounded-2xl overflow-hidden bg-white flex flex-col transition-shadow hover:shadow-[0_10px_26px_rgba(31,61,43,.14)]"
                  >
                    <div
                      className="ph relative h-[108px] flex-none bg-cover bg-center"
                      style={a.image_url ? { backgroundImage: `url(${a.image_url})` } : undefined}
                    >
                      {!a.image_url && <span className="ph-l">{a.type ?? 'จุดท่องเที่ยว'}</span>}
                      {a.type && (
                        <span className="absolute top-2 left-2 bg-forest/88 text-white text-[10px] font-semibold px-2 py-1 rounded-md">
                          {attractionTypeIcon(a.type)} {a.type}
                        </span>
                      )}
                    </div>
                    <div className="px-3.5 pt-2.5 pb-3.5 flex-1 flex flex-col">
                      <div className="font-heading font-semibold text-sm text-forest mb-1">
                        {a.attraction_name}
                      </div>
                      {a.description && (
                        <div className="clamp2 text-xs leading-[1.5] text-ink-muted">{a.description}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {park.lat != null && park.lng != null && (
            <>
              <SectionTitle>ตำแหน่งที่ตั้ง</SectionTitle>
              <ParkLocationMap park={park} attractions={attractions} />
            </>
          )}

          {trails.length > 0 && (
            <>
              <SectionTitle>เส้นทางเดินป่า</SectionTitle>
              <div className="flex flex-col gap-3 mb-6.5">
                {trails.map((t) => {
                  const diff = difficultyInfo(t.difficulty)
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTrail(t)}
                      className="text-left border border-black/8 rounded-2xl bg-white px-4 py-3.5 flex items-center gap-4 flex-wrap transition-shadow hover:shadow-[0_10px_26px_rgba(31,61,43,.14)]"
                    >
                      <div className="flex-1 min-w-[160px] font-heading font-semibold text-sm text-forest">
                        {t.trail_name}
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${diff.className}`}>
                        {diff.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {park.best_season && (
            <>
              <SectionTitle>ฤดูที่เหมาะไป</SectionTitle>
              <div className="bg-[#f0ede4] border border-black/7 rounded-2xl px-4.5 py-4 mb-6.5 text-[13.5px] text-ink-soft">
                {park.best_season}
              </div>
            </>
          )}
        </div>

        <div className="w-full sm:w-[238px] flex-none sm:sticky sm:top-[78px]">
          <div className="bg-white border border-black/10 rounded-2xl p-4.5 shadow-[0_6px_22px_rgba(31,61,43,.08)]">
            {park.facilities && park.facilities.length > 0 && (
              <>
                <div className="text-[10.5px] font-semibold tracking-[.03em] text-sage uppercase mb-2">
                  สิ่งอำนวยความสะดวก
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {park.facilities.map((f) => (
                    <span
                      key={f}
                      className="group relative flex items-center justify-center gap-1 bg-[#f9f7f2] text-ink-soft rounded-lg px-2.5 py-1.5 md:w-9 md:h-9 md:p-0"
                    >
                      <span className="text-base leading-none">{facilityIcon(f)}</span>
                      <span className="text-[11px] md:hidden">{f}</span>
                      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-10 hidden md:block whitespace-nowrap rounded-md bg-forest text-cream-light text-[10.5px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {f}
                      </span>
                    </span>
                  ))}
                </div>
                <div className="h-px bg-black/8 mb-3.5" />
              </>
            )}
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-xs text-ink-faint">ค่าเข้าอุทยาน</span>
              <span className="font-mono font-bold text-[23px] text-forest">{feeLabel}</span>
            </div>
            {park.website_url ? (
              <a
                href={park.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-3 rounded-[11px] bg-forest text-cream-light font-semibold text-sm"
              >
                เข้าชม
              </a>
            ) : (
              <div className="text-center py-3 rounded-[11px] bg-forest-light text-ink-faint font-semibold text-sm">
                ไม่มีลิงก์เว็บไซต์
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {lightboxIndex !== null && galleryImages.length > 0 && (
      <div
        className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center px-6"
        onClick={() => setLightboxIndex(null)}
      >
        <button
          type="button"
          onClick={() => setLightboxIndex(null)}
          className="absolute top-5 right-6 text-white/80 text-2xl leading-none"
          aria-label="ปิด"
        >
          ✕
        </button>
        {galleryImages.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setLightboxIndex((i) => (i === null ? i : (i - 1 + galleryImages.length) % galleryImages.length))
            }}
            className="absolute left-4 text-white/80 text-3xl px-3 py-2"
            aria-label="รูปก่อนหน้า"
          >
            ‹
          </button>
        )}
        <img
          src={galleryImages[lightboxIndex].image_url}
          alt=""
          className="max-w-full max-h-[85vh] rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
        {galleryImages.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setLightboxIndex((i) => (i === null ? i : (i + 1) % galleryImages.length))
            }}
            className="absolute right-4 text-white/80 text-3xl px-3 py-2"
            aria-label="รูปถัดไป"
          >
            ›
          </button>
        )}
      </div>
    )}

    {selectedAttraction && (
      <AttractionModal attraction={selectedAttraction} onClose={() => setSelectedAttraction(null)} />
    )}

    {selectedTrail && <TrailModal trail={selectedTrail} onClose={() => setSelectedTrail(null)} />}
    </>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-forest-light rounded-xl px-3.5 py-3.5">
      <div className="text-[11px] text-sage mb-1">{label}</div>
      <div className="font-mono font-bold text-lg text-forest">{value}</div>
    </div>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <div className="font-heading font-semibold text-base text-forest mb-3">{children}</div>
}
