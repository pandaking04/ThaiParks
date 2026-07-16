import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'thaiparks:consent'

export type ConsentStatus = 'accepted' | 'declined' | null

function readConsent(): ConsentStatus {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw === 'accepted' || raw === 'declined' ? raw : null
  } catch {
    return null
  }
}

export function useCookieConsent() {
  const [status, setStatus] = useState<ConsentStatus>(() => readConsent())

  useEffect(() => {
    if (status) localStorage.setItem(STORAGE_KEY, status)
  }, [status])

  const accept = useCallback(() => setStatus('accepted'), [])
  const decline = useCallback(() => setStatus('declined'), [])

  return { status, accept, decline }
}
