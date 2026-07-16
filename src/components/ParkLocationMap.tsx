import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import type { Attraction, NationalPark } from '../types/park'
import { attractionTypeIcon } from '../constants/parks'
import { createEmojiPin } from '../lib/mapIcons'

interface Props {
  park: NationalPark
  attractions: Attraction[]
}

const parkPin = createEmojiPin('🌲')
const attractionPin = createEmojiPin('📍', { size: 26, bg: '#c56a2a' })

export function ParkLocationMap({ park, attractions }: Props) {
  if (park.lat == null || park.lng == null) return null

  const center: [number, number] = [park.lat, park.lng]
  const attractionPoints = attractions.filter(
    (a): a is Attraction & { lat: number; lng: number } => a.lat != null && a.lng != null,
  )

  return (
    <div className="isolate rounded-2xl overflow-hidden border border-black/8 h-[320px] mb-6.5">
      <MapContainer key={park.id} center={center} zoom={12} scrollWheelZoom={false} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} icon={parkPin}>
          <Popup>{park.name_th}</Popup>
        </Marker>
        {attractionPoints.map((a) => (
          <Marker key={a.id} position={[a.lat, a.lng]} icon={attractionPin}>
            <Popup>
              <div className="font-heading font-semibold text-sm text-forest mb-0.5">
                {attractionTypeIcon(a.type)} {a.attraction_name}
              </div>
              {a.type && <div className="text-xs text-ink-faint">{a.type}</div>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
