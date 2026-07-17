import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useCookieConsent } from '../hooks/useCookieConsent'
import { trackPageView } from '../lib/analytics'

type CookieConsentValue = ReturnType<typeof useCookieConsent>

const CookieConsentContext = createContext<CookieConsentValue | null>(null)

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const value = useCookieConsent()
  const location = useLocation()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    trackPageView(location.pathname)
  }, [location.pathname])

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>
}

export function useCookieConsentContext() {
  const ctx = useContext(CookieConsentContext)
  if (!ctx) throw new Error('useCookieConsentContext must be used within CookieConsentProvider')
  return ctx
}
