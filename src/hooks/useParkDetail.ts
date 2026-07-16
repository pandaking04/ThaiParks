import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Attraction, NationalPark, ParkImage, Trail } from '../types/park'

export function useParkDetail(id: string | undefined) {
  const [park, setPark] = useState<NationalPark | null>(null)
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [trails, setTrails] = useState<Trail[]>([])
  const [images, setImages] = useState<ParkImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      const [parkRes, attractionsRes, trailsRes, imagesRes] = await Promise.all([
        supabase.from('national_parks').select('*').eq('id', id).single(),
        supabase.from('attractions').select('*').eq('park_id', id),
        supabase.from('trails').select('*').eq('park_id', id),
        supabase.from('park_images').select('*').eq('park_id', id).order('created_at'),
      ])
      if (cancelled) return
      if (parkRes.error) {
        setError(parkRes.error.message)
        setLoading(false)
        return
      }
      setPark(parkRes.data)
      setAttractions(attractionsRes.data ?? [])
      setTrails(trailsRes.data ?? [])
      setImages(imagesRes.data ?? [])
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  return { park, attractions, trails, images, loading, error }
}
