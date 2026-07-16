import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { NationalPark } from '../types/park'

interface ParkCoords {
  lat: number
  lng: number
}

export function useParks() {
  const [parks, setParks] = useState<NationalPark[]>([])
  const [parkCoords, setParkCoords] = useState<Record<string, ParkCoords>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      const [parksRes, attractionsRes] = await Promise.all([
        supabase.from('national_parks').select('*'),
        supabase
          .from('attractions')
          .select('park_id, lat, lng')
          .not('lat', 'is', null)
          .not('lng', 'is', null),
      ])
      if (cancelled) return
      if (parksRes.error) {
        setError(parksRes.error.message)
        setLoading(false)
        return
      }
      const parksData = parksRes.data ?? []
      setParks(parksData)

      const coordMap: Record<string, ParkCoords> = {}
      for (const park of parksData) {
        if (park.lat != null && park.lng != null) {
          coordMap[park.id] = { lat: park.lat, lng: park.lng }
        }
      }
      // fall back to the first attraction with coordinates for parks missing their own lat/lng
      if (!attractionsRes.error && attractionsRes.data) {
        for (const row of attractionsRes.data as { park_id: string; lat: number; lng: number }[]) {
          if (row.park_id && !coordMap[row.park_id]) {
            coordMap[row.park_id] = { lat: row.lat, lng: row.lng }
          }
        }
      }
      setParkCoords(coordMap)
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { parks, parkCoords, loading, error }
}
