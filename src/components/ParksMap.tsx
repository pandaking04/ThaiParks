import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Link } from 'react-router-dom'
import type { NationalPark } from '../types/park'
import { createEmojiPin, createUserLocationPin } from '../lib/mapIcons'

interface Props {
  parks: NationalPark[]
  parkCoords: Record<string, { lat: number; lng: number }>
  userCoords?: { lat: number; lng: number } | null
}

const THAILAND_CENTER: [number, number] = [13.7563, 100.5018]
const parkPin = createEmojiPin('🌲')
const userPin = createUserLocationPin()

function FitBounds({
  points,
  userCoords,
}: {
  points: [number, number][]
  userCoords?: { lat: number; lng: number } | null
}) {
  const map = useMap()
  useEffect(() => {
    if (userCoords) {
      map.setView([userCoords.lat, userCoords.lng], 10)
      return
    }
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 10)
      return
    }
    map.fitBounds(points, { padding: [32, 32] })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, JSON.stringify(points), userCoords?.lat, userCoords?.lng])
  return null
}

export function ParksMap({ parks, parkCoords, userCoords }: Props) {
  const withCoords = useMemo(() => parks.filter((p) => parkCoords[p.id]), [parks, parkCoords])
  const points = useMemo<[number, number][]>(
    () => withCoords.map((p): [number, number] => [parkCoords[p.id].lat, parkCoords[p.id].lng]),
    [withCoords, parkCoords],
  )

  return (
    <div className="isolate rounded-2xl overflow-hidden border border-black/10 h-[560px]">
      <MapContainer center={THAILAND_CENTER} zoom={6} scrollWheelZoom className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} userCoords={userCoords} />
        {userCoords && (
          <Marker position={[userCoords.lat, userCoords.lng]} icon={userPin}>
            <Popup>ตำแหน่งของคุณ</Popup>
          </Marker>
        )}
        {withCoords.map((p) => {
          const c = parkCoords[p.id]
          return (
            <Marker key={p.id} position={[c.lat, c.lng]} icon={parkPin}>
              <Popup>
                <div className="font-heading font-semibold text-sm text-forest mb-0.5">{p.name_th}</div>
                <div className="text-xs text-ink-faint mb-1.5">{p.province}</div>
                <Link to={`/parks/${p.id}`} className="text-xs font-semibold text-clay">
                  ดูรายละเอียด →
                </Link>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
