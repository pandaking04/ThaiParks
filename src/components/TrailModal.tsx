import { useEffect, useState } from 'react'
import type { Trail } from '../types/park'
import { difficultyInfo } from '../constants/parks'

interface Props {
  trail: Trail
  onClose: () => void
}

export function TrailModal({ trail, onClose }: Props) {
  const [zoomed, setZoomed] = useState(false)
  const diff = difficultyInfo(trail.difficulty)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (zoomed) setZoomed(false)
        else onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, zoomed])

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center px-4" onClick={onClose}>
      <div
        className="relative bg-white rounded-2xl w-full max-w-[480px] max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/85 flex items-center justify-center text-forest text-lg leading-none z-10"
          aria-label="ปิด"
        >
          ✕
        </button>

        <div className="p-5">
          <h2 className="font-heading font-bold text-xl text-forest mb-2 pr-8">{trail.trail_name}</h2>
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${diff.className}`}>
              {diff.label}
            </span>
            {trail.distance_km != null && (
              <span className="text-[11px] font-mono text-ink-muted">📏 {trail.distance_km} กม.</span>
            )}
            {trail.duration && <span className="text-[11px] font-mono text-ink-muted">⏱ {trail.duration}</span>}
          </div>
          {trail.description && (
            <p className="text-[13.5px] leading-[1.7] text-ink-soft mb-4">{trail.description}</p>
          )}

          {trail.image_url && (
            <button
              type="button"
              onClick={() => setZoomed(true)}
              aria-label="ดูแผนที่เส้นทางขนาดใหญ่"
              className="block w-full rounded-xl overflow-hidden border border-black/8"
            >
              <img src={trail.image_url} alt={trail.trail_name} className="w-full h-auto" />
            </button>
          )}
        </div>
      </div>

      {zoomed && trail.image_url && (
        <div
          className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center px-6"
          onClick={(e) => {
            e.stopPropagation()
            setZoomed(false)
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setZoomed(false)
            }}
            className="absolute top-5 right-6 text-white/80 text-2xl leading-none"
            aria-label="ปิด"
          >
            ✕
          </button>
          <img
            src={trail.image_url}
            alt={trail.trail_name}
            className="max-w-full max-h-[85vh] rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
