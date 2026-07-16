import { Link } from 'react-router-dom'
import type { NationalPark } from '../types/park'
import { activityIcon } from '../constants/parks'
import { useSavedParksContext } from '../context/SavedParksContext'

interface Props {
  park: NationalPark
  distanceKm?: number | null
}

export function ParkCard({ park, distanceKm }: Props) {
  const { isSaved, toggleSaved } = useSavedParksContext()
  const saved = isSaved(park.id)
  const tags = (park.activities ?? []).slice(0, 2)

  return (
    <Link
      to={`/parks/${park.id}`}
      className="block bg-white border border-black/8 rounded-2xl overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(31,61,43,.16)]"
    >
      <div
        className="relative h-[150px] bg-cover bg-center"
        style={park.image_url ? { backgroundImage: `url(${park.image_url})` } : undefined}
      >
        {!park.image_url && (
          <div className="ph absolute inset-0">
            <span className="ph-l">park photo</span>
          </div>
        )}
        <span className="absolute top-2.5 left-2.5 bg-forest/88 text-cream-light text-[10.5px] font-semibold px-2.5 py-1 rounded-md">
          {park.region}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleSaved(park.id)
          }}
          className="absolute top-2 right-2 w-[30px] h-[30px] rounded-full bg-cream-light/90 flex items-center justify-center text-[15px] transition-transform active:scale-125"
          style={{ color: saved ? '#c56a2a' : '#5c665a' }}
          aria-label={saved ? 'เอาออกจากรายการบันทึก' : 'บันทึกอุทยาน'}
        >
          {saved ? '♥' : '♡'}
        </button>
      </div>
      <div className="px-[15px] pt-3.5 pb-4">
        <div className="font-semibold text-base font-heading text-forest">{park.name_th}</div>
        <div className="text-xs font-mono text-ink-faint mt-0.5 mb-2.5">{park.province}</div>
        <div className="flex gap-1.5 flex-wrap items-center">
          {tags.map((t) => (
            <span
              key={t}
              className="text-[10.5px] font-medium text-ink-muted bg-forest-light px-2 py-1 rounded"
            >
              {activityIcon(t)} {t}
            </span>
          ))}
          {distanceKm != null && (
            <span className="text-[10.5px] font-mono text-ink-faint px-1 py-1">
              {distanceKm.toFixed(0)} กม.
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
