import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import type { Attraction } from '../types/park'
import { attractionTypeIcon } from '../constants/parks'
import { createEmojiPin } from '../lib/mapIcons'

interface Props {
  attraction: Attraction
  onClose: () => void
}

const attractionPin = createEmojiPin('📍', { size: 30, bg: '#c56a2a' })

export function AttractionModal({ attraction, onClose }: Props) {
  const [zoomed, setZoomed] = useState(false)

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

  const hasLocation = attraction.lat != null && attraction.lng != null

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[480px] max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="ph relative h-[220px] rounded-t-2xl bg-cover bg-center"
          style={attraction.image_url ? { backgroundImage: `url(${attraction.image_url})` } : undefined}
        >
          {attraction.image_url && (
            <button
              type="button"
              onClick={() => setZoomed(true)}
              aria-label="ดูรูปขนาดใหญ่"
              className="absolute inset-0 w-full h-full"
            />
          )}
          {!attraction.image_url && <span className="ph-l">{attraction.type ?? 'จุดท่องเที่ยว'}</span>}
          {attraction.type && (
            <span className="absolute top-3 left-3 bg-forest/88 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
              {attractionTypeIcon(attraction.type)} {attraction.type}
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/85 flex items-center justify-center text-forest text-lg leading-none"
            aria-label="ปิด"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          <h2 className="font-heading font-bold text-xl text-forest mb-2">{attraction.attraction_name}</h2>
          {attraction.description && (
            <p className="text-[13.5px] leading-[1.7] text-ink-soft mb-4">{attraction.description}</p>
          )}

          {hasLocation && (
            <div className="isolate rounded-xl overflow-hidden border border-black/8 h-[200px]">
              <MapContainer
                key={attraction.id}
                center={[attraction.lat!, attraction.lng!]}
                zoom={14}
                scrollWheelZoom={false}
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[attraction.lat!, attraction.lng!]} icon={attractionPin} />
              </MapContainer>
            </div>
          )}
        </div>
      </div>

      {zoomed && attraction.image_url && (
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
            src={attraction.image_url}
            alt={attraction.attraction_name}
            className="max-w-full max-h-[85vh] rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
