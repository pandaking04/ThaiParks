import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'thaiparks:saved'

function readSaved(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function useSavedParks() {
  const [saved, setSaved] = useState<string[]>(() => readSaved())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
  }, [saved])

  const isSaved = useCallback((id: string) => saved.includes(id), [saved])

  const toggleSaved = useCallback((id: string) => {
    setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])

  return { saved, savedCount: saved.length, isSaved, toggleSaved }
}
